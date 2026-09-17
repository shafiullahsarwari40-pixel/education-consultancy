import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { parseDocumentReference } from '../../../../lib/documentStorage';

const DOCUMENT_TYPES = new Set(['passport', 'transcript', 'diploma', 'exam_sheet', 'id_card', 'photo']);

export async function GET(request) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token) return NextResponse.json({ error: 'Please sign in to view your documents.' }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: 'Documents are temporarily unavailable.' }, { status: 503 });
  const type = new URL(request.url).searchParams.get('type');
  if (!DOCUMENT_TYPES.has(type)) return NextResponse.json({ error: 'Choose a valid document type.' }, { status: 400 });

  try {
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData?.user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    const { data: application, error: applicationError } = await supabaseAdmin.from('applications')
      .select('id').eq('user_id', userData.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (applicationError) throw new Error('Application lookup failed');
    if (!application) return NextResponse.json({ error: 'No application found.' }, { status: 404 });
    const column = `${type}_url`;
    const { data: documents, error: documentError } = await supabaseAdmin.from('application_documents')
      .select(column).eq('application_id', application.id).limit(1).maybeSingle();
    if (documentError) throw new Error('Document lookup failed');
    const reference = parseDocumentReference(documents?.[column]);
    if (!reference) return NextResponse.json({ error: 'This document is not available.' }, { status: 404 });
    const { data: file, error } = await supabaseAdmin.storage.from(reference.bucket).download(reference.objectPath);
    if (error || !file) throw new Error('Document download failed');
    const extension = reference.objectPath.split('.').pop().replace(/[^a-z0-9]/gi, '').slice(0, 8) || 'bin';
    return new NextResponse(file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${type}.${extension}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Your document could not be loaded. Please try again.' }, { status: 500 });
  }
}
