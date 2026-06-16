import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';

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

  if (profileErr) return { ok: false, status: 500, body: { error: 'Admin lookup failed' } };
  if (profile?.role !== 'admin') return { ok: false, status: 403, body: { error: `Forbidden: admin only (no admin role for ${user.email})` } };

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

  const { id } = await params;
  // validate id looks like a UUID to avoid passing 'undefined' or bad input to the DB
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    console.error('Invalid application id received:', id, 'from', request.url);
    return NextResponse.json({ error: `Invalid application id: ${String(id)}`, received: request.url }, { status: 400 });
  }
  const { data: appData, error } = await supabaseAdmin.from('applications').select('*').eq('id', id).limit(1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let applicationWithUrl = appData;
  if (appData?.acceptance_letter_path) {
    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from('acceptance-letters')
      .createSignedUrl(appData.acceptance_letter_path, 3600);

    if (!signedError && signed?.signedUrl) {
      applicationWithUrl = { ...appData, acceptance_letter_url: signed.signedUrl };
    }
  }

  const { data: docs } = await supabaseAdmin.from('application_documents').select('*').eq('application_id', id).limit(1);
  const documentRecord = docs?.[0] || null;

  // Convert storage paths to admin download endpoints if documents are stored in Supabase storage.
  const convertedDocuments = documentRecord
    ? Object.fromEntries(
        Object.entries(documentRecord).map(([key, value]) => {
          if (typeof value === 'string' && value.startsWith('http')) {
            try {
              const storageInfo = parseStoragePath(value);
              if (storageInfo) {
                const downloadUrl = `/api/admin/document?publicUrl=${encodeURIComponent(value)}`;
                return [key, downloadUrl];
              }
            } catch {
              // fallback to original URL
            }
          }
          return [key, value];
        })
      )
    : null;

  return NextResponse.json({ application: applicationWithUrl, documents: convertedDocuments });
}

export async function PATCH(request, { params }) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const { id } = await params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    console.error('Invalid application id received for PATCH:', id, 'from', request.url);
    return NextResponse.json({ error: `Invalid application id: ${String(id)}`, received: request.url }, { status: 400 });
  }
  const body = await request.json();
  const { status, admin_note } = body;
  if (!status && typeof admin_note === 'undefined') {
    return NextResponse.json({ error: 'Missing status or admin note' }, { status: 400 });
  }

  const updatePayload = {};
  if (status) {
    updatePayload.application_status = status;
    updatePayload.status_updated_at = new Date().toISOString();
  }
  if (typeof admin_note !== 'undefined') {
    updatePayload.admin_note = admin_note;
  }

  const { data, error } = await supabaseAdmin.from('applications').update(updatePayload).eq('id', id).select().limit(1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, application: data });
}
