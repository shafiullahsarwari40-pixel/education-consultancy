'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';
import { universities as universityDirectory } from '../lib/universities';

const universities = universityDirectory.slice(0, 4);

export default function Universities() {
  const { t } = useLanguage();

  return (
    <section className="section premium-universities" id="universities">
      <div className="container">
        <div className="premium-section-heading premium-section-heading-split">
          <div>
            <span className="section-label">{t('universities.label')}</span>
            <h2>{t('premium.universitiesTitle')}</h2>
          </div>
          <p>{t('premium.universitiesDesc')}</p>
        </div>

        <div className="universities-grid">
          {universities.map((uni, idx) => (
            <article key={uni.name || idx} className="university-card">
              <span className="university-card-index">0{idx + 1}</span>
              <div className="university-logo">
                <Image
                  src={uni.logo}
                  alt={`${t('universities.logoAltPrefix')} ${uni.name}`}
                  width={240}
                  height={110}
                  unoptimized
                  sizes="(max-width: 700px) 190px, 220px"
                  priority={false}
                />
              </div>

              <div className="university-content">
                <h3><Link href={`/universities/${uni.slug}`}>{uni.name}</Link></h3>
                <p className="university-meta">{uni.city} · Türkiye</p>
                <div className="university-details">
                  <span>{t('premium.universityProfile')}</span>
                  <span>{t('premium.officialResources')}</span>
                </div>
                <Link href={`/universities/${uni.slug}`} className="university-apply-link">
                  {t('premium.exploreUniversity')} <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="premium-universities-footer">
          <p>{t('premium.universityClosing')}</p>
          <Link href="/universities" className="premium-text-link">{t('premium.exploreAllUniversities')} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
