import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

function formatSupabaseError(error, defaultMessage = 'An internal error occurred.') {
  const message = error?.message || '';
  if (/Could not find the table/i.test(message)) {
    return 'Database schema is missing or out of sync. Run DATABASE_SCHEMA.sql in Supabase to create the homepage_media table.';
  }
  return message || defaultMessage;
}

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const { data, error } = await supabaseAdmin
    .from('homepage_media')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: formatSupabaseError(error, 'Unable to fetch homepage media') }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}
