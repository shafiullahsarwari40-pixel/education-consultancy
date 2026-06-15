'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function EnhancedWhyChoose() {
  const { t } = useLanguage();
  const features = [
    { title: t('enhancedWhy.fastAcceptance'), description: t('enhancedWhy.fastAcceptanceDesc') },
    { title: t('enhancedWhy.universityGuidance'), description: t('enhancedWhy.universityGuidanceDesc') },
    { title: t('enhancedWhy.documentChecking'), description: t('enhancedWhy.documentCheckingDesc') },
    { title: t('enhancedWhy.whatsAppSupport'), description: t('enhancedWhy.whatsAppSupportDesc') },
    { title: t('enhancedWhy.languageSupport'), description: t('enhancedWhy.languageSupportDesc') }
  ];

  return (
    <section className="section enhanced-why-choose" id="enhanced-why-choose">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('enhancedWhy.label')}</span>
          <h2>{t('enhancedWhy.title')}</h2>
          <p>{t('enhancedWhy.description')}</p>
        </div>

        <div className="enhanced-why-grid">
          {features.map((feature, index) => (
            <article key={index} className="enhanced-why-card">
              <span className="feature-icon">✓</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
