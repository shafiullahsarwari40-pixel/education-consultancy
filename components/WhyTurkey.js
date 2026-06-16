'use client';

import Image from 'next/image';
import { useLanguage } from '../lib/LanguageContext';
import { useEffect, useRef, useState } from 'react';

function useCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let start = null;
    const from = 0;
    const to = target;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const current = Math.floor(from + (to - from) * progress);
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}

export default function WhyTurkey() {
  const { t } = useLanguage();

  const cards = [
    { icon: '/icons/globe.svg', title: t('whyTurkey.reason1'), desc: t('whyTurkey.reason1Desc') },
    { icon: '/icons/award.svg', title: t('whyTurkey.reason2'), desc: t('whyTurkey.reason2Desc') },
    { icon: '/icons/target.svg', title: t('whyTurkey.reason3'), desc: t('whyTurkey.reason3Desc') },
    { icon: '/icons/scholarship.svg', title: t('whyTurkey.reason4'), desc: t('whyTurkey.reason4Desc') },
    { icon: '/icons/support.svg', title: t('whyTurkey.reason5'), desc: t('whyTurkey.reason5Desc') },
    { icon: '/icons/admission.svg', title: t('whyTurkey.reason6'), desc: t('whyTurkey.reason6Desc') },
  ];

  // numeric targets for counters (translations can override if needed)
  const targetUniversities = 100;
  const targetStudents = 10000;
  const targetSuccess = 95;

  const uni = useCounter(targetUniversities, 1300);
  const students = useCounter(targetStudents, 1500);
  const success = useCounter(targetSuccess, 1000);

  return (
    <section className="section why-section" id="why-turkey">
      <div className="container">
        <div className="why-inner">
          <div className="why-content">
            <span className="section-label">{t('whyTurkey.label')}</span>
            <h2 className="why-title">{t('whyTurkey.title')}</h2>
            <p className="why-intro">{t('whyTurkey.description')}</p>

            <div className="why-stats">
              <div className="stat">
                <div className="stat-num" aria-hidden>
                  {uni >= 1000 ? `${Math.floor(uni / 1000)}k+` : `${uni}+`}
                </div>
                <div className="stat-label">{t('whyTurkey.statUniversities') || 'Partner Universities'}</div>
              </div>
              <div className="stat">
                <div className="stat-num" aria-hidden>
                  {students >= 1000 ? `${Math.floor(students / 1000)}k+` : `${students}+`}
                </div>
                <div className="stat-label">{t('whyTurkey.statStudents') || 'Students Assisted'}</div>
              </div>
              <div className="stat">
                <div className="stat-num" aria-hidden>
                  {success}%
                </div>
                <div className="stat-label">{t('whyTurkey.statSuccess') || 'Admission Success'}</div>
              </div>
            </div>

            <div className="why-cards-grid">
              {cards.map((c, i) => (
                <article className="why-card" key={i} role="article">
                  <div className="why-card-icon">
                    <img src={c.icon} alt="" aria-hidden="true" />
                  </div>
                  <h3 className="why-card-title">{c.title}</h3>
                  <p className="why-card-desc">{c.desc}</p>
                </article>
              ))}
            </div>

            <div className="why-cta">
              <h3 className="cta-heading">{t('whyTurkey.ctaHeading') || 'Ready to Start Your Education Journey in Türkiye?'}</h3>
              <div className="cta-actions">
                <a href="/apply" className="button button-primary">{t('common.applyNow') || 'Apply Now'}</a>
                <a href="/contact" className="button button-outline">{t('whyTurkey.freeConsult') || 'Free Consultation'}</a>
              </div>
            </div>
          </div>

          <div className="why-media">
            <div className="media-wrap">
              <div className="media-inner" aria-hidden>
                <Image
                  src="/images/international-students.webp"
                  alt={t('whyTurkey.imageAlt') || 'International students in Turkey'}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </div>

              <div className="trust-badge" aria-hidden>
                <img src="/images/trust-badge.png" alt="" />
                <div className="badge-text">Trusted University Partners</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
