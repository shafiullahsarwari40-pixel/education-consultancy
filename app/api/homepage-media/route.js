import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const { data, error } = await supabaseAdmin
    .from('homepage_media')
    .select('id, title, description, media_type, media_url, thumbnail_url, button_text, button_link, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(24);

  if (error) {
    console.error('Homepage media could not be loaded:', error.code);
    return NextResponse.json({ error: 'Student stories are temporarily unavailable.' }, { status: 503 });
  }

  return NextResponse.json({ items: data || [] });
}
