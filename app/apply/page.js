'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ApplicationForm from '../../components/ApplicationForm';
import SelectedUniversityClient from '../../components/SelectedUniversityClient';
import { supabase } from '../../lib/supabaseClient';

export default function ApplyPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setError('Supabase client not configured');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session;

        if (!currentSession) {
          // Redirect to auth page with callback
          router.push('/student/auth?redirect=/apply');
          return;
        }

        setSession(currentSession);

        // Check if student already has an application
        const res = await fetch('/api/student/check-application', {
          headers: { Authorization: `Bearer ${currentSession.access_token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.hasApplication) {
            setHasExistingApplication(true);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError('Failed to verify session');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <main className="section contact" style={{ minHeight: '80vh' }}>
        <div className="container">
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="section contact" style={{ minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            padding: '2rem',
            background: '#ffebee',
            borderRadius: '0.75rem',
            color: '#c62828',
            marginTop: '2rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
          <button onClick={handleSignOut} className="button button-secondary">
            Sign Out
          </button>
        </div>
      </main>
    );
  }

  if (hasExistingApplication) {
    return (
      <main className="section contact" style={{ minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto' }}>
          <header className="site-header" style={{ position: 'static', background: 'transparent', border: 'none' }}>
            <div className="header-inner" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <Link href="/" className="brand">
                Horizon
              </Link>
              <button className="button button-secondary" type="button" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </header>

          <div style={{
            padding: '2rem',
            background: '#e3f2fd',
            borderRadius: '1rem',
            border: '1px solid #90caf9',
            marginTop: '2rem',
          }}>
            <h2 style={{ marginTop: 0, color: '#0066cc' }}>Application Already Submitted</h2>
            <p style={{ color: '#333', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              You have already submitted an application. You can check your application result from your student portal.
            </p>
            <Link href="/student/result" className="button button-primary button-large">
              See Application Result
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section contact">
      <div className="container">
        <header className="site-header" style={{ position: 'static', background: 'transparent', border: 'none' }}>
          <div className="header-inner" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/" className="brand">
                Horizon
              </Link>
              <nav className="nav-menu">
                <Link href="/">Back</Link>
              </nav>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <small style={{ color: '#666' }}>
                Logged in as <strong>{session?.user?.email}</strong>
              </small>
              <button className="button button-secondary" type="button" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <Suspense fallback={null}>
          <SelectedUniversityClient />
        </Suspense>

        <div className="section-header">
          <span>Application</span>
          <h2>Apply for your chosen university</h2>
          <p>Please provide your contact details and upload the requested documents.</p>
        </div>

        <ApplicationForm />
      </div>
    </main>
  );
}
