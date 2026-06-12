'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('Processing sign-in…');

  useEffect(() => {
    (async () => {
      try {
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

        router.replace('/admin');
      } catch (err) {
        console.error('Auth callback exception', err);
        setMessage('Sign-in failed. Please try again.');
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <p>{message}</p>
    </div>
  );
}
