'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function StudentAuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/student/result';
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setMessage('Supabase client not configured. Please check your environment variables.');
      setCheckingSession(false);
      return;
    }

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setSession(data.session);
          router.push(redirect);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setCheckingSession(false);
      }
    })();
  }, [router, redirect]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!email || !password) {
      setMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isSignUp) {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?returnTo=/student/dashboard` : 'https://horizoneducon.com/auth/callback?returnTo=/student/dashboard';
        result = await supabase.auth.signUp(
          { email, password },
          { emailRedirectTo: redirectUrl }
        );
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      const { data, error } = result;

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        if (data?.user) {
          setMessage('Account created successfully! Please check your email to confirm your account before signing in.');
          setEmail('');
          setPassword('');
          setLoading(false);
          setTimeout(() => setIsSignUp(false), 3000);
        }
      } else {
        if (data?.session) {
          setSession(data.session);
          router.push(redirect);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setMessage(err?.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="section" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Student Portal</h2>
          <p style={{ margin: '0', color: '#666', fontSize: '0.95rem' }}>
            Create an account or sign in to continue your application
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: '#333' }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="form-input"
              required
              disabled={loading}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: '#333' }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="form-input"
              required
              disabled={loading}
            />
          </label>

          <button
            type="submit"
            className="button button-primary button-large"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Processing…' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '0.75rem',
            background: message.includes('successfully') || message.includes('created') ? '#e8f5e9' : '#ffebee',
            color: message.includes('successfully') || message.includes('created') ? '#2e7d32' : '#c62828',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}>
            {message}
          </div>
        )}

        <div style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
              setEmail('');
              setPassword('');
            }}
            className="button button-secondary"
          >
            {isSignUp ? 'Sign In Instead' : 'Create Account Instead'}
          </button>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
          <p>
            <Link href="/" style={{ color: '#0755ff', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
