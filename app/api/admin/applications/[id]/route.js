import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';

async function requireAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return { ok: false, status: 401, body: { error: 'Missing auth token' } };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) return { ok: false, status: 401, body: { error: 'Invalid auth token' } };

  const user = userData.user;
  const { data: admins, error: adminErr } = await supabaseAdmin.from('admins').select('email').ilike('email', user.email).limit(1);
  if (adminErr) return { ok: false, status: 500, body: { error: 'Admin lookup failed' } };
  if (!admins || admins.length === 0) return { ok: false, status: 403, body: { error: `Forbidden: admin only (no admin record for ${user.email})` } };

  return { ok: true, user };
}

function parseStoragePath(publicUrl) {
  try {
    const url = new URL(publicUrl);
    const marker = '/storage/v1/object/public/';
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const pathInBucket = url.pathname.slice(idx + marker.length);
    const [bucket, ...rest] = pathInBucket.split('/');
    return { bucket, objectPath: rest.join('/') };
  } catch {
    return null;
  }
}

async function maybeSignedUrl(publicUrl) {
  const storageInfo = parseStoragePath(publicUrl);
  if (!storageInfo) return publicUrl;
  const { bucket, objectPath } = storageInfo;
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(objectPath, 60);
  if (error || !data?.signedUrl) return publicUrl;
  return data.signedUrl;
}

export async function GET(request, { params }) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const id = params.id;
  const { data: appData, error } = await supabaseAdmin.from('applications').select('*').eq('id', id).limit(1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: docs } = await supabaseAdmin.from('application_documents').select('*').eq('application_id', id).limit(1);
  const documentRecord = docs?.[0] || null;

  if (documentRecord) {
    return NextResponse.json({ application: appData, documents: documentRecord });
  }

  return NextResponse.json({ application: appData, documents: null });
}

export async function PATCH(request, { params }) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const id = params.id;
  const body = await request.json();
  const { status } = body;
  if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 });

  const { data, error } = await supabaseAdmin.from('applications').update({ status }).eq('id', id).select().limit(1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, application: data });
}
