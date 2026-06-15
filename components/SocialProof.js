'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function SocialProof() {
  const { t } = useLanguage();
  const points = [
    t('socialProof.point1'),
    t('socialProof.point2'),
    t('socialProof.point3'),
    t('socialProof.point4')
  ];

  return (
    <section className="section social-proof">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('socialProof.label')}</span>
          <h2>{t('socialProof.title')}</h2>
          <p>{t('socialProof.description')}</p>
        </div>

        <div className="proof-grid">
          {points.map((point, index) => (
            <div key={index} className="proof-card">
              <div className="proof-icon">✓</div>
              <p>{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
