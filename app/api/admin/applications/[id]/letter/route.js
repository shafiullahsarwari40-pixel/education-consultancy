import { NextResponse } from 'next/server';
import { supabaseAdmin, isInvalidSupabaseApiKeyError, supabaseAdminKeyMalformed } from '../../../../../../lib/supabaseAdmin';
import { randomUUID } from 'node:crypto';
import { readBoundedBody, textField, RequestError } from '../../../../_lib/request';

export async function POST(request, { params }) {
  if (!supabaseAdmin || supabaseAdminKeyMalformed) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

  if (!token) {
    return NextResponse.json(
      { error: 'Missing authentication token' },
      { status: 401 }
    );
  }

  try {
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData?.user) {
      if (isInvalidSupabaseApiKeyError(userError)) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check if user is admin using profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Admin profile lookup error:', profileError);
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid application id' },
        { status: 400 }
      );
    }

    // Get the application first to verify it exists
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Parse the multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('multipart/form-data')) throw new RequestError('Please upload a PDF form.', 415);
    const boundedBody = await readBoundedBody(request, 4 * 1024 * 1024 + 128 * 1024);
    let formData;
    try {
      formData = await new Response(boundedBody, { headers: { 'Content-Type': contentType } }).formData();
    } catch {
      throw new RequestError('The upload could not be read.');
    }
    const file = formData.get('file');
    const status = textField(formData.get('status'), 'Status', 30);
    const admin_note = textField(formData.get('admin_note'), 'Admin note', 5000);
    const rejection_message = textField(formData.get('rejection_message'), 'Rejection message', 5000);
    if (status && !['submitted', 'evaluating', 'accepted', 'rejected'].includes(status)) throw new RequestError('Choose a valid application status.');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Leave room for multipart overhead under Vercel's 4.5 MB body limit.
    if (!file.size || file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be 4 MB or less' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (Buffer.from(arrayBuffer).subarray(0, 5).toString() !== '%PDF-') throw new RequestError('The file is not a valid PDF.');
    const filePath = `${application.user_id}/${id}/acceptance-letter-${randomUUID()}.pdf`;

    // Upload to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('acceptance-letters')
      .upload(filePath, new Uint8Array(arrayBuffer), {
        upsert: false,
        contentType: 'application/pdf',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Build update payload
    const updatePayload = {
      acceptance_letter_path: filePath,
      acceptance_letter_url: null,
      status_updated_at: new Date().toISOString(),
    };

    // Add optional fields
    if (status) {
      updatePayload.application_status = status;
    }
    if (admin_note) {
      updatePayload.admin_note = admin_note;
    }
    if (rejection_message) {
      updatePayload.rejection_message = rejection_message;
    }

    // Update application
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      await supabaseAdmin.storage.from('acceptance-letters').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to save file reference' },
        { status: 500 }
      );
    }

    const { data: signed } = await supabaseAdmin.storage.from('acceptance-letters').createSignedUrl(filePath, 60);
    return NextResponse.json({ success: true, application: { ...updated, acceptance_letter_url: signed?.signedUrl || null } });
  } catch (err) {
    if (err instanceof RequestError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
