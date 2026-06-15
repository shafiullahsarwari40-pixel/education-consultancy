import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function requireAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return { ok: false, status: 401, body: { error: 'Missing auth token' } };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) return { ok: false, status: 401, body: { error: 'Invalid auth token' } };

  const user = userData.user;
  const { data: profiles, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr) {
    return { ok: false, status: 500, body: { error: 'Admin lookup failed' } };
  }

  if (profiles?.role !== 'admin') {
    return { ok: false, status: 403, body: { error: `Forbidden: admin only (no admin role for ${user.email})` } };
  }

  return { ok: true, user };
}

export async function GET(request) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const sort = url.searchParams.get('sort') || 'desc';

  // Fetch applications with optional search and sorting
  let query = supabaseAdmin.from('applications').select('*').order('created_at', { ascending: sort === 'asc' });
  if (search) {
    const searchTerm = `%${search}%`;
    query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`);
  }

  const { data: applications, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Stats
  const statsQueries = await Promise.all([
    supabaseAdmin.from('applications').select('id', { count: 'exact' }),
    supabaseAdmin.from('applications').select('id', { count: 'exact' }).eq('application_status', 'submitted'),
    supabaseAdmin.from('applications').select('id', { count: 'exact' }).eq('application_status', 'accepted'),
    supabaseAdmin.from('applications').select('id', { count: 'exact' }).eq('application_status', 'rejected'),
    supabaseAdmin
      .from('applications')
      .select('id', { count: 'exact' })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const [totalQ, newQ, acceptedQ, rejectedQ, monthQ] = statsQueries;

  return NextResponse.json({
    applications,
    stats: {
      total: totalQ.count || 0,
      new: newQ.count || 0,
      accepted: acceptedQ.count || 0,
      rejected: rejectedQ.count || 0,
      this_month: monthQ.count || 0,
    },
  });
}
