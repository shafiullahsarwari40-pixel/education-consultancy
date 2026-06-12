'use client';

import Image from 'next/image';
import { useLanguage } from '../lib/LanguageContext';

export default function Programs() {
  const { t } = useLanguage();
  const programs = [
    { name: t('programs.medicine'), icon: '⚕️', key: 'medicineDesc' },
    { name: t('programs.dentistry'), icon: '🦷', key: 'dentistryDesc' },
    { name: t('programs.engineering'), icon: '🔧', key: 'engineeringDesc' },
    { name: t('programs.business'), icon: '💼', key: 'businessDesc' },
    { name: t('programs.law'), icon: '⚖️', key: 'lawDesc' },
    { name: t('programs.psychology'), icon: '🧠', key: 'psychologyDesc' },
    { name: t('programs.nursing'), icon: '👩‍⚕️', key: 'nursingDesc' },
    { name: t('programs.cs'), icon: '💻', key: 'csDesc' },
    { name: t('programs.architecture'), icon: '🏢', key: 'architectureDesc' },
    { name: t('programs.relations'), icon: '🌐', key: 'relationsDesc' },
  ];

  return (
    <section className="section" id="programs">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('programs.label')}</span>
          <h2>{t('programs.title')}</h2>
          <p>{t('programs.description')}</p>
        </div>

        <div className="section-image section-image-top">
          <Image
            src="/images/classroom.webp"
            alt="Modern classroom with international students learning"
            fill
            sizes="100vw"
          />
        </div>

        <div className="cards-grid program-cards-grid">
          {programs.map((program, index) => (
            <div key={index} className="card">
              <div className="card-icon">{program.icon}</div>
              <h3>{program.name}</h3>
              <p>{t(`programs.${program.key}`)}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                {t('programs.tuition')}
              </p>
              <a href={`/apply?program=${encodeURIComponent(program.name)}`} className="card-link">
                {t('programs.apply')}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
