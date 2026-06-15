import { NextResponse } from 'next/server';
import { supabaseAdmin, isInvalidSupabaseApiKeyError, supabaseAdminKeyMalformed } from '../../../../../../lib/supabaseAdmin';

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
      .single();

    if (profileError || profile?.role !== 'admin') {
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
    const formData = await request.formData();
    const file = formData.get('file');
    const status = formData.get('status')?.toString();
    const admin_note = formData.get('admin_note')?.toString();
    const rejection_message = formData.get('rejection_message')?.toString();

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const filePath = `${application.user_id}/${id}/acceptance-letter.pdf`;

    // Upload to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('acceptance-letters')
      .upload(filePath, new Uint8Array(arrayBuffer), {
        upsert: true,
        contentType: 'application/pdf',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Generate public URL
    const { data: urlData } = await supabaseAdmin.storage
      .from('acceptance-letters')
      .getPublicUrl(filePath);

    // Build update payload
    const updatePayload = {
      acceptance_letter_path: filePath,
      acceptance_letter_url: urlData?.publicUrl || '',
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
      return NextResponse.json(
        { error: 'Failed to save file reference' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
