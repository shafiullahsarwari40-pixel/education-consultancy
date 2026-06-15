'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Processing sign-in…');

  useEffect(() => {
    (async () => {
      try {
        const returnTo = searchParams.get('returnTo') || '/student/dashboard';
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (error) {
          console.error('Auth callback error', error);
          setMessage('Sign-in failed. Please try again.');
          return;
        }

        if (!data?.session) {
          const { data: currentSession, error: currentError } = await supabase.auth.getSession();
          if (currentError || !currentSession?.session) {
            console.error('No session after callback', currentError);
            setMessage('Sign-in failed. Please try again.');
            return;
          }
        }

        router.replace(returnTo);
      } catch (err) {
        console.error('Auth callback exception', err);
        setMessage('Sign-in failed. Please try again.');
      }
    })();
  }, [router, searchParams]);

  return (
    <div style={{ padding: 24 }}>
      <p>{message}</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}><p>Processing sign-in…</p></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
