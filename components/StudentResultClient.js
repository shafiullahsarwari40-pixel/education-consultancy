'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';
import { supabase } from '../lib/supabaseClient';

const statusSteps = [
  { value: 'submitted', labelKey: 'studentResult.statusSubmitted', color: '#0755ff' },
  { value: 'evaluating', labelKey: 'studentResult.statusEvaluating', color: '#0755ff' },
  { value: 'accepted', labelKey: 'studentResult.statusAccepted', color: '#0755ff' },
];

const statusMessageKeys = {
  submitted: 'studentResult.statusMessageSubmitted',
  evaluating: 'studentResult.statusMessageEvaluating',
  accepted: 'studentResult.statusMessageAccepted',
  accepted_pending_letter: 'studentResult.statusMessageAcceptedPendingLetter',
};

export default function StudentResultClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setError(t('studentResult.errorSupabaseNotConfigured'));
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session;

        if (!currentSession) {
          router.push('/student/auth?redirect=/student/result');
          return;
        }

        setSession(currentSession);
        await fetchApplication(currentSession.access_token);
      } catch (err) {
        console.error('Session check error:', err);
        setError(t('studentResult.errorFailedVerifySession'));
      } finally {
        setLoading(false);
      }
    })();
  }, [router, t]);

  async function fetchApplication(token) {
    try {
      const res = await fetch('/api/student/application', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('studentResult.errorFetchApplication'));
      }

      const data = await res.json();
      setApplication(data.application || null);
    } catch (err) {
      console.error('Fetch application error:', err);
      setError(err.message || t('studentResult.errorUnknown'));
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <main className="section" style={{ minHeight: '80vh' }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: '2rem' }}>
          <p>{t('studentResult.loadingStatus')}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="section" style={{ minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto', paddingTop: '2rem' }}>
          <div style={{
            padding: '2rem',
            background: '#ffebee',
            borderRadius: '0.75rem',
            color: '#c62828',
            marginBottom: '1.5rem',
          }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="button button-secondary"
            style={{ marginRight: '1rem' }}
          >
            {t('common.signOut')}
          </button>
          <Link href="/" className="button button-secondary">
            {t('common.backToHome')}
          </Link>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="section" style={{ minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto', paddingTop: '2rem' }}>
          <div style={{
            padding: '2rem',
            background: '#f7f9fc',
            borderRadius: '1rem',
            textAlign: 'center',
            marginBottom: '2rem',
          }}>
            <h2 style={{ marginTop: 0 }}>{t('studentResult.noApplicationTitle')}</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {t('studentResult.noApplicationDescription')}
            </p>
            <Link href="/apply" className="button button-primary button-large">
              {t('studentResult.startApplication')}
            </Link>
            <button
              onClick={handleSignOut}
              className="button button-secondary button-large"
              style={{ marginTop: '1rem' }}
            >
              {t('common.signOut')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const displaySteps = statusSteps;
  const currentStepIndex = displaySteps.findIndex((step) => step.value === application.application_status);
  const hasAcceptanceLetter = application.application_status === 'accepted' && application.acceptance_letter_url;
  const customMessage = application.rejection_message || application.admin_note;
  const displayMessage = customMessage || t(statusMessageKeys[application.application_status] || '');

  return (
    <main className="section" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 920, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{t('studentResult.yourApplicationTitle')}</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
              {t('common.loggedInAs')} <strong>{session?.user?.email}</strong>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="button button-secondary"
          >
            {t('common.signOut')}
          </button>
        </div>

        {/* Application Details Card */}
        <div style={{
          padding: '1.5rem',
          background: '#fff',
          border: '1px solid #dde4ee',
          borderRadius: '1rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>{t('studentResult.applicationDetailsTitle')}</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#999', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>
                {t('studentResult.labelFullName')}
              </p>
              <p style={{ margin: 0, fontWeight: 600 }}>{application.full_name}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#999', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>
                {t('studentResult.labelEmail')}
              </p>
              <p style={{ margin: 0 }}>{application.email}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#999', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>
                {t('studentResult.labelUniversity')}
              </p>
              <p style={{ margin: 0 }}>{application.university || '—'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#999', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>
                {t('studentResult.labelProgram')}
              </p>
              <p style={{ margin: 0 }}>{application.program || '—'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#999', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>
                {t('studentResult.submittedDateLabel')}
              </p>
              <p style={{ margin: 0 }}>
                {new Date(application.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Status Steps */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{t('studentResult.applicationStatusTitle')}</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {displaySteps.map((step, index) => {
              const isCurrent = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div
                  key={step.value}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    background: isCompleted || isCurrent ? '#ffffff' : '#f5f5f5',
                    border: isCompleted || isCurrent ? '2px solid #0755ff' : '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: isCurrent ? '#0755ff' : '#e0e0e0',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                      {t(step.labelKey)}
                    </h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                      {isCurrent ? t('studentResult.statusCurrentStep') : isCompleted ? t('studentResult.statusCompleted') : t('studentResult.statusPending')}
                    </p>
                  </div>
                </div>
              );
            })}
            
          </div>
        </div>

        {/* Status Message */}
        <div style={{
          padding: '1.5rem',
          background: application.application_status === 'accepted' ? '#e8f5e9' : '#e3f2fd',
          borderRadius: '0.75rem',
          border: '1px solid',
          borderColor: application.application_status === 'accepted' ? '#4caf50' : '#2196f3',
          marginBottom: '2rem',
        }}>
          <p style={{
            margin: 0,
            color: application.application_status === 'accepted' ? '#2e7d32' : '#0066cc',
            lineHeight: 1.6,
          }}>
            {displayMessage}
          </p>
        </div>

        {/* Acceptance Letter Download */}
        {application.application_status === 'accepted' && (
          <div style={{
            padding: '1.5rem',
            background: '#f7f9fc',
            borderRadius: '0.75rem',
            border: '1px solid #dde4ee',
            marginBottom: '2rem',
          }}>
            <h3 style={{ marginTop: 0 }}>{t('studentResult.acceptanceLetterTitle')}</h3>
            {hasAcceptanceLetter ? (
              <button
                onClick={() => {
                  fetch('/api/student/acceptance-letter', {
                    headers: { Authorization: `Bearer ${session?.access_token}` },
                  })
                    .then(res => {
                      if (!res.ok) throw new Error(t('studentResult.downloadError'));
                      return res.blob();
                    })
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'acceptance-letter.pdf';
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    })
                    .catch(err => alert(`${t('studentResult.downloadErrorPrefix')} ${err.message}`));
                }}
                className="button button-primary"
              >
                {t('studentResult.downloadAcceptanceLetter')}
              </button>
            ) : (
              <p style={{ margin: 0, color: '#666' }}>
                {t('studentResult.acceptanceLetterPending')}
              </p>
            )}
          </div>
        )}

        {/* Help Section */}
        <div style={{
          padding: '1.5rem',
          background: '#f9f9f9',
          borderRadius: '0.75rem',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
            {t('studentResult.questionNeedHelp')}
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            <Link href="/" style={{ color: '#0755ff', textDecoration: 'none' }}>
              {t('studentResult.contactUsWebsite')}
            </Link>
            {' '}{t('studentResult.or')} {' '}
            <Link href="/privacy" style={{ color: '#0755ff', textDecoration: 'none' }}>
              {t('studentResult.faqs')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
