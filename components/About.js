'use client';

import Image from 'next/image';
import { useLanguage } from '../lib/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  return (
    <section className="section" id="about">
      <div className="container about-grid">
        <div>
          <div className="section-header text-left">
            <span className="section-label">{t('about.label')}</span>
            <h2>{t('about.title')}</h2>
            <p>{t('about.description')}</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <h3>{t('about.mission')}</h3>
              <p>
                {t('about.missionDesc')}
              </p>
            </div>

            <div className="feature-card">
              <h3>{t('about.whyChoose')}</h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li>{t('about.reason1')}</li>
                <li>{t('about.reason2')}</li>
                <li>{t('about.reason3')}</li>
                <li>{t('about.reason4')}</li>
                <li>{t('about.reason5')}</li>
              </ul>
            </div>

            <div className="feature-card">
              <h3>{t('about.expert')}</h3>
              <p>
                {t('about.expertDesc')}
              </p>
              <h3 style={{ marginTop: '1.5rem' }}>{t('about.network')}</h3>
              <p>
                {t('about.networkDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="section-image">
          <Image
            src="/images/graduation-students.jpg"
            alt="International students celebrating graduation"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-image"
          />
        </div>
      </div>
    </section>
  );
}
