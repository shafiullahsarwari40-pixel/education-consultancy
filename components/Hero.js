'use client';

import Image from 'next/image';
import { useLanguage } from '../lib/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section id="hero" className="premium-hero">
      <div className="premium-hero-orbit premium-hero-orbit-one" aria-hidden="true" />
      <div className="premium-hero-orbit premium-hero-orbit-two" aria-hidden="true" />

      <div className="container premium-hero-grid">
        <div className="premium-hero-copy">
          <span className="premium-eyebrow">
            <span aria-hidden="true" />
            {t('premium.based')} · {t('premium.admissions')}
          </span>
          <h1>{t('hero.title')}</h1>
          <p className="premium-hero-lead">{t('hero.description')}</p>

          <div className="premium-hero-actions">
            <a href="/apply" className="button button-primary button-large">
              {t('hero.applyBtn')}
              <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-ghost-light button-large"
            >
              {t('hero.whatsappBtn')}
            </a>
          </div>

        </div>

        <div className="premium-hero-visual" role="group" aria-label="Study in Türkiye with Horizon">
          <div className="premium-hero-photo">
            <Image
              src="/images/hero-istanbul.webp"
              alt="Istanbul University campus with Turkish flags"
              fill
              priority
              unoptimized
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <div className="premium-photo-caption">
              <span>Türkiye</span>
              <strong>{t('premium.admissions')}</strong>
            </div>
          </div>

          <div className="premium-hero-plan-card">
            <span className="premium-plan-kicker">{t('premium.plan')}</span>
            <div className="premium-plan-progress" aria-hidden="true"><span /></div>
            <div className="premium-plan-row is-active"><span>01</span><strong>{t('premium.profile')}</strong><em>{t('premium.ready')}</em></div>
            <div className="premium-plan-row"><span>02</span><strong>{t('premium.match')}</strong><em>{t('premium.next')}</em></div>
            <div className="premium-plan-row"><span>03</span><strong>{t('premium.application')}</strong><em>{t('premium.planned')}</em></div>
          </div>
        </div>
      </div>

      <a className="premium-scroll-cue" href="#services" aria-label="Explore Horizon services">
        <span>{t('premium.explore')}</span>
        <i aria-hidden="true">↓</i>
      </a>
    </section>
  );
}
