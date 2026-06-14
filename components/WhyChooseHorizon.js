'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function WhyChooseHorizon() {
  const { t } = useLanguage();
  const cards = [
    {
      title: t('whyChooseHorizon.card1Title'),
      description: t('whyChooseHorizon.card1Desc')
    },
    {
      title: t('whyChooseHorizon.card2Title'),
      description: t('whyChooseHorizon.card2Desc')
    },
    {
      title: t('whyChooseHorizon.card3Title'),
      description: t('whyChooseHorizon.card3Desc')
    },
    {
      title: t('whyChooseHorizon.card4Title'),
      description: t('whyChooseHorizon.card4Desc')
    }
  ];

  return (
    <section className="section why-choose" id="why-choose">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('whyChooseHorizon.label')}</span>
          <h2>{t('whyChooseHorizon.title')}</h2>
          <p>{t('whyChooseHorizon.description')}</p>
        </div>

        <div className="why-choose-grid">
          {cards.map((card, index) => (
            <article key={index} className="why-card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
