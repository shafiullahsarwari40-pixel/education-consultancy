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

  if (profileErr) return { ok: false, status: 500, body: { error: 'Admin lookup failed' } };
  if (!profile || profile.role !== 'admin') return { ok: false, status: 403, body: { error: `Forbidden: admin only (no admin role for ${user.email})` } };

  return { ok: true, user };
}

function parseStoragePath(publicUrl) {
  try {
    const url = new URL(publicUrl);
    const marker = '/storage/v1/object/';
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;

    let pathInBucket = url.pathname.slice(idx + marker.length);
    if (pathInBucket.startsWith('public/')) {
      pathInBucket = pathInBucket.slice('public/'.length);
    }

    const [bucket, ...rest] = pathInBucket.split('/');
    return { bucket, objectPath: rest.join('/') };
  } catch {
    return null;
  }
}

function extensionToMime(ext) {
  const mapping = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
  };
  return mapping[ext.toLowerCase()] || 'application/octet-stream';
}

export async function GET(request) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const url = new URL(request.url);
  const bucket = url.searchParams.get('bucket');
  const objectPath = url.searchParams.get('path');
  const publicUrl = url.searchParams.get('publicUrl');

  let resolvedBucket = bucket;
  let resolvedPath = objectPath;

  if (!resolvedBucket || !resolvedPath) {
    if (!publicUrl) {
      return NextResponse.json({ error: 'Missing bucket or path or publicUrl' }, { status: 400 });
    }
    const parsed = parseStoragePath(publicUrl);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid public URL format' }, { status: 400 });
    }
    resolvedBucket = parsed.bucket;
    resolvedPath = parsed.objectPath;
  }

  const { data, error } = await supabaseAdmin.storage.from(resolvedBucket).download(resolvedPath);
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Failed to download object' }, { status: 500 });
  }

  const ext = resolvedPath.split('.').pop() || 'bin';
  const mimeType = extensionToMime(ext);
  return new Response(data, {
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${resolvedPath.split('/').pop()}"`,
    },
  });
}
