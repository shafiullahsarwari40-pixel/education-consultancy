import { NextResponse } from 'next/server';
import { supabaseAdmin, isInvalidSupabaseApiKeyError, supabaseAdminKeyMalformed } from '../../../../../../lib/supabaseAdmin';

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
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, rejection_message, admin_note } = body;

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
      ...(rejection_message && { rejection_message }),
      ...(admin_note && { admin_note }),
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
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
