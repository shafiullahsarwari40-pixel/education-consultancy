'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // If password present, try password sign-in (fallback when emails are rate-limited)
    if (password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        setMessage(error.message);
        return;
      }
      setLoading(false);
      setMessage('Signed in. Redirecting…');
      router.push('/admin');
      return;
    }

    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
    const { data, error } = await supabase.auth.signInWithOtp({ email }, { emailRedirectTo: redirectTo });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage('Check your email for the sign-in link.');
  }

  return (
    <div style={{ maxWidth: 680, margin: '40px auto', padding: 20 }}>
      <h1>Admin Login</h1>
      <p>Sign in with your admin email (magic link)</p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />
        <label style={{ display: 'block', marginBottom: 8 }}>Password (optional)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Use this to sign in directly"
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />
        <button disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Sending…' : 'Send Magic Link'}
        </button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
