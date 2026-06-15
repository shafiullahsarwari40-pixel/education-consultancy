'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function ApplicationProcessTimeline() {
  const { t } = useLanguage();
  const steps = [
    { title: t('timeline.submitApplication') },
    { title: t('timeline.documentsChecked') },
    { title: t('timeline.universitySelection') },
    { title: t('timeline.applicationSent') },
    { title: t('timeline.acceptanceLetter') },
    { title: t('timeline.visaGuidance') }
  ];

  return (
    <section className="section application-timeline" id="application-timeline">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('timeline.label')}</span>
          <h2>{t('timeline.title')}</h2>
          <p>{t('timeline.description')}</p>
        </div>
        <div className="timeline enhanced-timeline">
          <div className="timeline-items enhanced-timeline-items">
            {steps.map((step, index) => (
              <div key={index} className="timeline-item enhanced-timeline-item">
                <div className="timeline-number">{index + 1}</div>
                <h3>{step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
