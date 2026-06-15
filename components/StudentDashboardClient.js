'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../lib/LanguageContext';
import { supabase } from '../lib/supabaseClient';

export default function StudentDashboardClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');

  const statusSteps = [
    { value: 'submitted', label: t('studentDashboard.submitted') },
    { value: 'evaluating', label: t('studentDashboard.underReview') },
    { value: 'accepted', label: t('studentDashboard.accepted') },
  ];

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/student/login');
  }

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setError('Supabase client not configured');
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session ?? null;
      if (!currentSession) {
        await supabase.auth.signOut();
        router.replace('/student/login');
        return;
      }

      setSession(currentSession);
      await fetchApplication(currentSession.access_token);
    })();
  }, [router]);

  async function fetchApplication(token) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/student/application', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to fetch your application');
      }

      const data = await res.json();
      if (!data.application) {
        setApplication(null);
      } else {
        setApplication(data.application);
      }
    } catch (err) {
      setError(err.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>{t('studentDashboard.title')}…</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'crimson', padding: '1rem', background: '#fff0f0', borderRadius: 12 }}>
        <p>{error}</p>
        <button className="button button-secondary" style={{ marginTop: '1rem' }} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ padding: '2rem', background: '#f7f9fc', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2>{t('studentDashboard.noApplications')}</h2>
            <p>{t('studentDashboard.startApplication')}</p>
          </div>
          <button className="button button-secondary" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
        <button className="button button-primary button-large" onClick={() => router.push('/apply')}>
          {t('studentDashboard.startApplication')}
        </button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((step) => step.value === application.application_status);

  return (
    <div style={{ padding: '2rem', background: '#f7f9fc', borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, color: '#555' }}>Welcome back,</p>
          <h1 style={{ margin: '0.5rem 0 0 0' }}>{application.full_name}</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#777' }}>
            Application for <strong>{application.program || '—'}</strong> at <strong>{application.university || '—'}</strong>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#777' }}>Submitted</p>
          <strong>{new Date(application.created_at).toLocaleDateString()}</strong>
          <button
            className="button button-secondary"
            style={{ marginTop: '1rem', display: 'inline-flex' }}
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        {statusSteps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          return (
            <div
              key={step.value}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 14,
                background: isActive ? '#ffffff' : '#e6ecf7',
                border: isActive ? '1px solid #7c9fff' : '1px solid transparent',
                boxShadow: isActive ? '0 10px 30px rgba(0, 74, 255, 0.08)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: isActive ? '#0755ff' : '#9bb2dc',
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{stepLabel}</h3>
                  <p style={{ margin: '0.35rem 0 0 0', color: '#555' }}>
                    {isActive ? (index === currentStepIndex ? 'Current step' : 'Completed') : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        <div style={{ padding: '1rem', borderRadius: 14, background: '#fff', border: '1px solid #dde4ee' }}>
          <h2 style={{ marginTop: 0 }}>Application Details</h2>
          <dl style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ fontWeight: 600 }}>Email</dt>
              <dd>{application.email}</dd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ fontWeight: 600 }}>Phone</dt>
              <dd>{application.phone}</dd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ fontWeight: 600 }}>Country</dt>
              <dd>{application.country || '—'}</dd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ fontWeight: 600 }}>Status</dt>
              <dd style={{ textTransform: 'capitalize' }}>{application.application_status || 'submitted'}</dd>
            </div>
          </dl>
        </div>

        <div style={{ padding: '1rem', borderRadius: 14, background: '#fff', border: '1px solid #dde4ee' }}>
          <h2 style={{ marginTop: 0 }}>Acceptance Letter</h2>
          {application.acceptance_letter_path ? (
            <a
              href="/api/student/acceptance-letter"
              target="_blank"
              rel="noreferrer"
              className="button button-primary button-large"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
            >
              Download Acceptance Letter
            </a>
          ) : (
            <p style={{ margin: 0, color: '#555' }}>Acceptance letter not available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
