'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function verifyExistingSession() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const session = data?.session ?? null;
      if (!session || !active) return;

      try {
        const verifyRes = await fetch('/api/admin/applications', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!active) return;
        if (verifyRes.ok) {
          router.replace('/admin');
          return;
        }

        if (verifyRes.status === 401 || verifyRes.status === 403) {
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Admin login session verification failed', error);
      }
    }

    verifyExistingSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!email || !password) {
      setMessage('Email and password are required.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    if (data?.session) {
      // Verify user is admin by calling an admin endpoint
      const verifyRes = await fetch('/api/admin/applications', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });

      if (verifyRes.status === 403) {
        // Not an admin user
        await supabase.auth.signOut();
        setLoading(false);
        setMessage('Access denied: This account does not have admin permissions.');
        return;
      }

      if (!verifyRes.ok) {
        // Some other error occurred
        await supabase.auth.signOut();
        setLoading(false);
        setMessage('Error verifying admin status. Please try again.');
        return;
      }

      // User is admin, redirect to dashboard
      setLoading(false);
      router.push('/admin');
      return;
    }

    setLoading(false);
    setMessage('Signed in. Redirecting…');
  }

  return (
    <div style={{ maxWidth: 680, margin: '40px auto', padding: 20 }}>
      <h1>Admin Login</h1>
      <p>Sign in with your admin email and password.</p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />
        <label style={{ display: 'block', marginBottom: 8 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />
        <button disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
