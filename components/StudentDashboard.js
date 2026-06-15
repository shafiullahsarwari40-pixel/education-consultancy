'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function StudentDashboard() {
  const { t } = useLanguage();
  const steps = [
    { label: t('dashboard.submitted'), active: true },
    { label: t('dashboard.documentsVerified'), active: true },
    { label: t('dashboard.applied'), active: false },
    { label: t('dashboard.accepted'), active: false },
    { label: t('dashboard.visaProcess'), active: false }
  ];

  return (
    <section className="section student-dashboard" id="student-dashboard">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('dashboard.label')}</span>
          <h2>{t('dashboard.title')}</h2>
          <p>{t('dashboard.description')}</p>
        </div>

        <div className="dashboard-track">
          {steps.map((step, index) => (
            <div key={index} className={`dashboard-step ${step.active ? 'active' : ''}`}>
              <div className="dashboard-step-number">{index + 1}</div>
              <p>{step.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
