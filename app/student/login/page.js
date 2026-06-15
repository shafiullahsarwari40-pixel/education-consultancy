'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../../lib/LanguageContext';
import { supabase } from '../../../lib/supabaseClient';

export default function StudentLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace('/student/dashboard');
      }
    })();
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    if (!supabase) {
      const debugInfo = typeof window !== 'undefined' ? window.__SUPABASE_CLIENT_DEBUG : null;
      setMessage(`Supabase is not configured. Debug: ${JSON.stringify(debugInfo ?? 'N/A')}`);
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setMessage(t('auth.password_required'));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (data?.session) {
        router.push('/student/dashboard');
        return;
      }

      setMessage(t('auth.success_login'));
      router.push('/student/dashboard');
    } catch (err) {
      console.error('[handleSubmit] Exception:', err);
      setMessage(err?.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="section" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">{t('auth.login')}</span>
          <h2>{t('auth.login')}</h2>
          <p>Sign in with your student email and password to see your application progress.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <label>
            {t('auth.email')}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="form-input"
              placeholder="you@example.com"
            />
          </label>

          <label>
            {t('auth.password')}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="form-input"
              placeholder="Enter your password"
            />
          </label>

          <button type="submit" className="button button-primary button-large" disabled={loading}>
            {loading ? t('auth.signing_in') : t('auth.submitLogin')}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ color: '#d32f2f', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message}</p>
            {typeof window !== 'undefined' && window.__SUPABASE_CLIENT_DEBUG && (
              <details style={{ marginTop: '1rem', padding: '0.5rem', background: '#f5f5f5', fontSize: '0.75rem', color: '#666' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug Info</summary>
                <pre style={{ margin: '0.5rem 0 0 0', overflow: 'auto' }}>
                  {JSON.stringify(window.__SUPABASE_CLIENT_DEBUG, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <p style={{ marginTop: '1.5rem' }}>
          {t('auth.noAccount')} <Link href="/student/signup">{t('auth.signup')}</Link>.
        </p>
      </div>
    </main>
  );
}
