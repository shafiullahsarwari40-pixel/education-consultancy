'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function AgentPartnership() {
  const { t } = useLanguage();
  const benefits = [
    { title: t('agent.benefit1Title'), description: t('agent.benefit1Desc') },
    { title: t('agent.benefit2Title'), description: t('agent.benefit2Desc') },
    { title: t('agent.benefit3Title'), description: t('agent.benefit3Desc') },
    { title: t('agent.benefit4Title'), description: t('agent.benefit4Desc') },
    { title: t('agent.benefit5Title'), description: t('agent.benefit5Desc') },
    { title: t('agent.benefit6Title'), description: t('agent.benefit6Desc') },
  ];

  return (
    <section className="section" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <span className="section-label" style={{ color: 'var(--secondary-light)' }}>{t('agent.program')}</span>
          <h2 style={{ color: 'white' }}>{t('agent.becomeAgent')}</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {t('agent.contactCTA')}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {benefits.map((benefit, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-lg)',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>{benefit.title}</h3>
              <p style={{ fontSize: '0.95rem', margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <a
            href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
            target="_blank"
            rel="noopener noreferrer"
            className="button"
            style={{
              background: 'white',
              color: 'var(--primary)',
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            {t('agent.contactPartnership')}
          </a>
          <div style={{ marginTop: '0.75rem' }}>
            <a
              href="mailto:horizon@horizon-edu.net?subject=Partnership%20Inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="button"
              style={{
                background: 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.9rem 2rem',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}
            >
              {t('agent.emailUs')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
