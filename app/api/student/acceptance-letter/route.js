import { NextResponse } from 'next/server';
import { supabaseAdmin, isInvalidSupabaseApiKeyError, isSupabaseSessionMissingError, supabaseAdminKeyMalformed } from '../../../../lib/supabaseAdmin';

async function requireUser(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return { ok: false, status: 401, body: { error: 'Missing auth token' } };

  if (supabaseAdminKeyMalformed) {
    return {
      ok: false,
      status: 500,
      body: { error: 'Server auth configuration invalid. Check SUPABASE_SERVICE_ROLE_KEY.' },
    };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    if (isInvalidSupabaseApiKeyError(error)) {
      return {
        ok: false,
        status: 500,
        body: { error: 'Server auth configuration invalid. Check SUPABASE_SERVICE_ROLE_KEY.' },
      };
    }
    if (isSupabaseSessionMissingError(error)) {
      return {
        ok: false,
        status: 401,
        body: { error: 'Auth session invalid or expired. Please sign in again.' },
      };
    }
    return { ok: false, status: 401, body: { error: 'Invalid auth token' } };
  }

  return { ok: true, user: data.user };
}

export async function GET(request) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const authResult = await requireUser(request);
  if (!authResult.ok) return NextResponse.json(authResult.body, { status: authResult.status });

  const { user } = authResult;
  const { data: application, error } = await supabaseAdmin
    .from('applications')
    .select('acceptance_letter_path')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const path = application?.acceptance_letter_path;
  if (!path) {
    return NextResponse.json({ error: 'Acceptance letter not available' }, { status: 404 });
  }

  // Download the file from storage
  const { data: fileBuffer, error: downloadError } = await supabaseAdmin.storage
    .from('acceptance-letters')
    .download(path);

  if (downloadError || !fileBuffer) {
    return NextResponse.json({ error: downloadError?.message || 'Failed to download file' }, { status: 500 });
  }

  // Return the file with download headers
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="acceptance-letter.pdf"',
      'Content-Length': fileBuffer.size || fileBuffer.length,
    },
  });
}
