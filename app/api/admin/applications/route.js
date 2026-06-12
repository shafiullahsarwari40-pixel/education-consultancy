import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function requireAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return { ok: false, status: 401, body: { error: 'Missing auth token' } };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) return { ok: false, status: 401, body: { error: 'Invalid auth token' } };

  const user = userData.user;
  // Check admins table for this user's email
  const { data: admins, error: adminErr } = await supabaseAdmin
    .from('admins')
    .select('email')
    .ilike('email', user.email)
    .limit(1);

  if (adminErr) {
    return { ok: false, status: 500, body: { error: 'Admin lookup failed' } };
  }

  if (!admins || admins.length === 0) {
    return { ok: false, status: 403, body: { error: `Forbidden: admin only (no admin record for ${user.email})` } };
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
    // simple OR search on name and email
    query = query.ilike('full_name', `%${search}%`).or(`email.ilike.%${search}%`);
  }

  const { data: applications, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Stats
  const statsQueries = await Promise.all([
    supabaseAdmin.from('applications').select('id', { count: 'exact' }),
    supabaseAdmin.from('applications').select('id', { count: 'exact' }).eq('status', 'New'),
    supabaseAdmin.from('applications').select('id', { count: 'exact' }).eq('status', 'Accepted'),
    supabaseAdmin.from('applications').select('id', { count: 'exact' }).eq('status', 'Rejected'),
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
