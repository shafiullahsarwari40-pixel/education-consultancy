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

    // Check if student has any application
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to check application' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasApplication: data && data.length > 0,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
