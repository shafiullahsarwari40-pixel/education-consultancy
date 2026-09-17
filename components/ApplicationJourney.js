'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function ApplicationJourney() {
  const { t } = useLanguage();

  const steps = [
    {
      number: '01',
      title: t('timeline.submitApplication'),
      description: t('premium.step1'),
    },
    {
      number: '02',
      title: t('timeline.documentsChecked'),
      description: t('premium.step2'),
    },
    {
      number: '03',
      title: t('timeline.universitySelection'),
      description: t('premium.step3'),
    },
    {
      number: '04',
      title: t('timeline.acceptanceLetter'),
      description: t('premium.step4'),
    },
  ];

  return (
    <section className="section premium-journey" id="process">
      <div className="premium-journey-glow" aria-hidden="true" />
      <div className="container">
        <div className="premium-section-heading premium-section-heading-light premium-section-heading-split">
          <div>
            <span className="section-label">{t('timeline.label')}</span>
            <h2>{t('premium.journeyTitle')}</h2>
          </div>
          <p>{t('timeline.description')}</p>
        </div>

        <div className="premium-journey-grid" role="region" tabIndex={0} aria-label={t('premium.journeyTitle')}>
          {steps.map((step) => (
            <article className="premium-journey-step" key={step.number}>
              <span className="premium-journey-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <div className="premium-journey-cta">
          <div>
            <span>{t('premium.applied')}</span>
            <strong>{t('premium.track')}</strong>
          </div>
          <a href="/student/result" className="button button-light">{t('premium.checkStatus')}</a>
        </div>
      </div>
    </section>
  );
}
