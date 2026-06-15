'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function ApplicationProcess() {
  const { t } = useLanguage();

  const steps = [
    {
      number: '1',
      title: t('timeline.submitApplication'),
      description: t('timeline.description')
    },
    {
      number: '2',
      title: t('timeline.documentsChecked'),
      description: t('timeline.documentsChecked')
    },
    {
      number: '3',
      title: t('timeline.universitySelection'),
      description: t('timeline.universitySelection')
    },
    {
      number: '4',
      title: t('timeline.acceptanceLetter'),
      description: t('timeline.visaGuidance')
    }
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('timeline.label')}</span>
          <h2>{t('timeline.title')}</h2>
          <p>{t('timeline.description')}</p>
        </div>

        <div className="timeline">
          <div className="timeline-items">
            {steps.map((step, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
