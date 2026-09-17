import { NextResponse } from 'next/server';
import { supabaseAdmin, isInvalidSupabaseApiKeyError, supabaseAdminKeyMalformed } from '../../../../../../lib/supabaseAdmin';
import { readJson, textField, RequestError } from '../../../../_lib/request';

export async function PATCH(request, { params }) {
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

    // Check if user is admin
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
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || '')) {
      throw new RequestError('Invalid application id.');
    }
    const body = await readJson(request);
    const status = textField(body.status, 'Status', 30);
    const rejection_message = typeof body.rejection_message === 'undefined' ? undefined : textField(body.rejection_message, 'Rejection message', 5000);
    const admin_note = typeof body.admin_note === 'undefined' ? undefined : textField(body.admin_note, 'Admin note', 5000);
    if (!status && rejection_message === undefined && admin_note === undefined) throw new RequestError('Choose a status or add a note.');

    // Validate status
    const validStatuses = ['submitted', 'evaluating', 'accepted', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update application
    const updateData = {
      ...(status && { application_status: status }),
      ...(rejection_message !== undefined && { rejection_message }),
      ...(admin_note !== undefined && { admin_note }),
      status_updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ application: data });
  } catch (err) {
    if (err instanceof RequestError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
