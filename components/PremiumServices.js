'use client';

import { useLanguage } from '../lib/LanguageContext';

const serviceKeys = [
  ['01', 'services.service1', 'services.service1Desc'],
  ['02', 'services.service2', 'services.service2Desc'],
  ['03', 'services.service4', 'services.service4Desc'],
  ['04', 'services.service5', 'services.service5Desc'],
  ['05', 'services.service8', 'services.service8Desc'],
  ['06', 'services.service10', 'services.service10Desc'],
];

const serviceIcons = [
  <><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M6 11v6c4 3 8 3 12 0v-6M21 9v7"/></>,
  <><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h4M9 12h6M9 16h4"/></>,
  <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c4 5 4 13 0 18-4-5-4-13 0-18Z"/></>,
  <><path d="M4 4h16v12H9l-5 4V4Z"/><path d="M8 8h8M8 12h5"/></>,
  <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
];

export default function PremiumServices() {
  const { t } = useLanguage();

  return (
    <section className="section premium-services" id="services">
      <div className="container">
        <div className="premium-section-heading premium-section-heading-split">
          <div>
            <span className="section-label">{t('services.label')}</span>
            <h2>{t('services.title')}</h2>
          </div>
          <p>{t('services.description')}</p>
        </div>

        <div className="premium-services-grid" role="region" tabIndex={0} aria-label={t('services.title')}>
          {serviceKeys.map(([number, titleKey, descriptionKey], index) => (
            <article className="premium-service-card" key={number}>
              <div className="premium-service-topline">
                <span>{number}</span>
                <svg className="premium-service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{serviceIcons[index]}</svg>
              </div>
              <h3>{t(titleKey)}</h3>
              <p>{t(descriptionKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
