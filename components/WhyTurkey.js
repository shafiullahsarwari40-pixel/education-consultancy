'use client';

import Image from 'next/image';
import { useLanguage } from '../lib/LanguageContext';

export default function WhyTurkey() {
  const { t } = useLanguage();

  const pillars = [
    {
      number: '01',
      title: t('whyChooseHorizon.card1Title'),
      desc: t('whyChooseHorizon.card1Desc'),
    },
    {
      number: '02',
      title: t('whyChooseHorizon.card2Title'),
      desc: t('whyChooseHorizon.card2Desc'),
    },
    {
      number: '03',
      title: t('whyChooseHorizon.card3Title'),
      desc: t('whyChooseHorizon.card3Desc'),
    },
    {
      number: '04',
      title: t('whyChooseHorizon.card4Title'),
      desc: t('whyChooseHorizon.card4Desc'),
    },
  ];

  return (
    <section className="section premium-story" id="why-turkey">
      <div className="container premium-story-grid">
        <div className="premium-story-media">
          <div className="premium-story-photo premium-story-photo-main">
            <Image
              src="/images/graduates-optimized.webp"
              alt="Graduates wearing academic caps and gowns"
              fill
              unoptimized
              sizes="(max-width: 900px) 100vw, 44vw"
            />
          </div>
          <div className="premium-story-note">
            <span>{t('premium.based')}</span>
            <strong>{t('premium.localGuidance')}</strong>
          </div>
        </div>

        <div className="premium-story-content">
          <span className="section-label">{t('whyChooseHorizon.label')}</span>
          <h2>{t('whyChooseHorizon.title')}</h2>
          <p className="premium-story-intro">{t('whyChooseHorizon.description')}</p>

          <div className="premium-story-list">
            {pillars.map((item) => (
              <article className="premium-story-item" key={item.number}>
                <span>{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="premium-story-actions">
            <a href="/apply" className="button button-primary">{t('premium.start')} <span aria-hidden="true">↗</span></a>
            <a href="#contact" className="premium-text-link">{t('premium.ask')} <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
