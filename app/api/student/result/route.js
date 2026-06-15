import { NextResponse } from 'next/server';
import { supabaseAdmin, isInvalidSupabaseApiKeyError, supabaseAdminKeyMalformed } from '../../../../lib/supabaseAdmin';

export async function GET(request) {
  if (!supabaseAdmin || supabaseAdminKeyMalformed) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

  if (!token) {
    return NextResponse.json(
      { error: 'Missing authentication token' },
      { status: 401 }
    );
  }

  try {
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData?.user) {
      if (isInvalidSupabaseApiKeyError(userError)) {
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // Fetch student's most recent application
    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      );
    }

    // If application has acceptance letter, include signed URL
    let applicationWithUrl = application;
    if (application?.acceptance_letter_path) {
      try {
        const { data: signed, error: signedError } = await supabaseAdmin.storage
          .from('acceptance-letters')
          .createSignedUrl(application.acceptance_letter_path, 3600); // 1 hour expiry

        if (!signedError && signed?.signedUrl) {
          applicationWithUrl = {
            ...application,
            acceptance_letter_url: signed.signedUrl,
          };
        }
      } catch (err) {
        console.error('Error generating signed URL:', err);
      }
    }

    return NextResponse.json({ application: applicationWithUrl });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
