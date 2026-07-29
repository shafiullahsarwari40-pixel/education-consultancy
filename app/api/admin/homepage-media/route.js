import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

function formatSupabaseError(error, defaultMessage = 'An internal error occurred.') {
  const message = error?.message || '';
  if (/Could not find the table/i.test(message)) {
    return 'Database schema is missing or out of sync. Run DATABASE_SCHEMA.sql in Supabase to create the homepage_media table.';
  }
  return message || defaultMessage;
}

async function requireAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return { ok: false, status: 401, body: { error: 'Missing auth token' } };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) return { ok: false, status: 401, body: { error: 'Invalid auth token' } };

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileErr) return { ok: false, status: 500, body: { error: 'Admin lookup failed' } };
  if (!profile || profile.role !== 'admin') return { ok: false, status: 403, body: { error: 'Forbidden: admin only' } };

  return { ok: true, user: userData.user };
}

function sanitizeLink(link) {
  if (!link) return null;
  const value = String(link).trim();
  if (!value) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/|\.\/|\.\.\/)/i.test(value)) return value;
  try {
    new URL(value);
    return value;
  } catch {
    return null;
  }
}

function sanitizePayload(body) {
  return {
    media_type: body.media_type === 'video' ? 'video' : 'image',
    title: body.title ? String(body.title).trim() : null,
    description: body.description ? String(body.description).trim() : null,
    button_text: body.button_text ? String(body.button_text).trim() : null,
    button_link: sanitizeLink(body.button_link),
    is_published: Boolean(body.is_published),
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
  };
}

export async function GET(request) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const { data, error } = await supabaseAdmin
    .from('homepage_media')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: formatSupabaseError(error, 'Unable to fetch homepage media.') }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(request) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const formData = await request.formData();
  const file = formData.get('file');
  const mediaType = formData.get('media_type') === 'video' ? 'video' : 'image';
  const payload = sanitizePayload({
    media_type: mediaType,
    title: formData.get('title'),
    description: formData.get('description'),
    button_text: formData.get('button_text'),
    button_link: formData.get('button_link'),
    is_published: formData.get('is_published') === 'true' || formData.get('is_published') === 'on',
    sort_order: formData.get('sort_order') || 0,
  });

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Please select a file.' }, { status: 400 });
  }

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm'];
  const fileType = file.type || '';
  const maxSize = mediaType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;

  if (mediaType === 'video' && !allowedVideoTypes.includes(fileType)) {
    return NextResponse.json({ error: 'Unsupported video type. Use MP4 or WebM.' }, { status: 400 });
  }
  if (mediaType === 'image' && !allowedImageTypes.includes(fileType)) {
    return NextResponse.json({ error: 'Unsupported image type. Use JPG, PNG, or WebP.' }, { status: 400 });
  }
  if (file.size > maxSize) {
    return NextResponse.json({ error: `File is too large. Max ${mediaType === 'video' ? '100 MB' : '10 MB'}.` }, { status: 400 });
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const filePath = `homepage-media/${safeName}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage.from('application-uploads').upload(filePath, new Uint8Array(arrayBuffer), {
    cacheControl: '3600',
    upsert: false,
    contentType: fileType || undefined,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message || 'Upload failed.' }, { status: 500 });
  }

  const { data: publicUrlData } = await supabaseAdmin.storage.from('application-uploads').getPublicUrl(filePath);
  const mediaUrl = publicUrlData?.publicUrl || null;

const { data, error } = await supabaseAdmin.from('homepage_media').insert([{ ...payload, media_url: mediaUrl, media_path: filePath, thumbnail_url: mediaType === 'video' ? mediaUrl : null }]).select().single();

  if (error) return NextResponse.json({ error: formatSupabaseError(error, 'Unable to create homepage media item.') }, { status: 500 });
  return NextResponse.json({ item: data });
}

async function parseBody(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    return request.formData();
  }

  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function PATCH(request) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const body = await parseBody(request);
  const id = body.id || (body.get && body.get('id'));
  if (!id) return NextResponse.json({ error: 'Missing item id' }, { status: 400 });

  const existingResult = await supabaseAdmin.from('homepage_media').select('media_url, media_path, media_type').eq('id', id).maybeSingle();
  if (existingResult.error) {
    return NextResponse.json({ error: formatSupabaseError(existingResult.error, 'Unable to fetch existing media item.') }, { status: 500 });
  }

  const existing = existingResult.data || {};
  const file = body.get ? body.get('file') : null;
  const mediaType = body.media_type || body.get?.('media_type') || existing.media_type || 'image';
  const payload = sanitizePayload({
    media_type: mediaType,
    title: body.title || (body.get ? body.get('title') : ''),
    description: body.description || (body.get ? body.get('description') : ''),
    button_text: body.button_text || (body.get ? body.get('button_text') : ''),
    button_link: body.button_link || (body.get ? body.get('button_link') : ''),
    is_published: body.is_published === 'true' || body.is_published === true || (body.get && (body.get('is_published') === 'true' || body.get('is_published') === 'on')),
    sort_order: body.sort_order || (body.get ? body.get('sort_order') : 0),
  });

  let updates = { ...payload };

  if (file && typeof file !== 'string') {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    const fileType = file.type || '';

    if (mediaType === 'video' && !allowedVideoTypes.includes(fileType)) {
      return NextResponse.json({ error: 'Unsupported video type. Use MP4 or WebM.' }, { status: 400 });
    }
    if (mediaType === 'image' && !allowedImageTypes.includes(fileType)) {
      return NextResponse.json({ error: 'Unsupported image type. Use JPG, PNG, or WebP.' }, { status: 400 });
    }
    const maxSize = mediaType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File is too large. Max ${mediaType === 'video' ? '100 MB' : '10 MB'}.` }, { status: 400 });
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const filePath = `homepage-media/${safeName}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage.from('application-uploads').upload(filePath, new Uint8Array(arrayBuffer), {
      cacheControl: '3600',
      upsert: false,
      contentType: fileType || undefined,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message || 'Upload failed.' }, { status: 500 });
    }

    const { data: publicUrlData } = await supabaseAdmin.storage.from('application-uploads').getPublicUrl(filePath);
    if (!publicUrlData?.publicUrl) {
      return NextResponse.json({ error: 'Unable to create public URL for uploaded media.' }, { status: 500 });
    }

    updates = {
      ...updates,
      media_url: publicUrlData.publicUrl,
      media_path: filePath,
      thumbnail_url: mediaType === 'video' ? publicUrlData.publicUrl : null,
    };

    if (existing.media_path) {
      await supabaseAdmin.storage.from('application-uploads').remove([existing.media_path]);
    }
  }

  const { data, error } = await supabaseAdmin.from('homepage_media').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: formatSupabaseError(error, 'Unable to update homepage media item.') }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(request) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return NextResponse.json(authCheck.body, { status: authCheck.status });

  const body = await request.json();
  const id = body.id;
  if (!id) return NextResponse.json({ error: 'Missing item id' }, { status: 400 });

  const { data: existing, error: fetchError } = await supabaseAdmin.from('homepage_media').select('media_url, media_path').eq('id', id).maybeSingle();
  if (fetchError) return NextResponse.json({ error: formatSupabaseError(fetchError, 'Unable to fetch existing media item.') }, { status: 500 });

  const { error } = await supabaseAdmin.from('homepage_media').delete().eq('id', id);
  if (error) return NextResponse.json({ error: formatSupabaseError(error, 'Unable to delete homepage media item.') }, { status: 500 });

  if (existing?.media_url) {
    const filePath = existing.media_url.split('/').slice(-1)[0];
    const normalized = filePath.includes('?') ? filePath.split('?')[0] : filePath;
    if (normalized) {
      if (existing.media_path) {
      await supabaseAdmin.storage.from('application-uploads').remove([existing.media_path]);
    }
    }
  }

  return NextResponse.json({ success: true });
}
