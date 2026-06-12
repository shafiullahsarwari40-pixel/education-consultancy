'use client';

import Image from 'next/image';
import { useLanguage } from '../lib/LanguageContext';

export default function WhyTurkey() {
  const { t } = useLanguage();
  const reasons = [
    {
      title: t('whyTurkey.reason1'),
      description: t('whyTurkey.reason1Desc')
    },
    {
      title: t('whyTurkey.reason2'),
      description: t('whyTurkey.reason2Desc')
    },
    {
      title: t('whyTurkey.reason3'),
      description: t('whyTurkey.reason3Desc')
    },
    {
      title: t('whyTurkey.reason4'),
      description: t('whyTurkey.reason4Desc')
    },
    {
      title: t('whyTurkey.reason5'),
      description: t('whyTurkey.reason5Desc')
    },
    {
      title: t('whyTurkey.reason6'),
      description: t('whyTurkey.reason6Desc')
    },
    {
      title: t('whyTurkey.reason7'),
      description: t('whyTurkey.reason7Desc')
    },
    {
      title: t('whyTurkey.reason8'),
      description: t('whyTurkey.reason8Desc')
    },
  ];

  return (
    <section className="section" id="why-turkey">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('whyTurkey.label')}</span>
          <h2>{t('whyTurkey.title')}</h2>
          <p>{t('whyTurkey.description')}</p>
        </div>

        <div className="section-image section-image-top">
          <Image
            src="/images/international-students.webp"
            alt="International students in Turkey exploring campus life"
            fill
            sizes="100vw"
          />
        </div>

        <div className="cards-grid why-cards-grid">
          {reasons.map((reason, index) => (
            <div key={index} className="card">
              <div className="card-icon">
                {['🎓', '💰', '🌍', '📚', '🏆', '🤝', '⚕️', '🏛️'][index]}
              </div>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
