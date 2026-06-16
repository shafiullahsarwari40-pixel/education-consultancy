import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function requireAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return { ok: false, status: 401, body: { error: 'Missing auth token' } };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) return { ok: false, status: 401, body: { error: 'Invalid auth token' } };

  const user = userData.user;
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr) {
    return { ok: false, status: 500, body: { error: 'Admin lookup failed' } };
  }

  if (profile?.role !== 'admin') {
    return { ok: false, status: 403, body: { error: `Forbidden: admin only (no admin role for ${user.email})` } };
  }

  return { ok: true, user };
}

export async function GET(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const { data, error } = await supabaseAdmin
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }

  return NextResponse.json({ notifications: data || [] });
}

export async function PATCH(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const body = await request.json().catch(() => ({}));
  const { id, mark_read } = body;
  if (!id || typeof mark_read !== 'boolean') {
    return NextResponse.json({ error: 'Notification id and mark_read boolean are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('admin_notifications')
    .update({ read: mark_read })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to update notification' }, { status: 500 });
  }

  return NextResponse.json({ notification: data });
}
