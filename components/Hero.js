'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

const heroSlides = [
  {
    src: '/images/hero-bg.jpg',
    alt: 'Students on a Turkish university campus at sunset',
  },
  {
    src: '/images/student-life.webp',
    alt: 'International students enjoying campus life in Turkey',
  },
  {
    src: '/images/international-students.webp',
    alt: 'Diverse students learning together at a university',
  },
  {
    src: '/images/graduation-students.jpg',
    alt: 'Graduating international students celebrating success',
  },
  {
    src: '/images/classroom.webp',
    alt: 'Classroom scene with students and modern learning environment',
  },
  {
    src: '/images/university-campus-1.webp',
    alt: 'University campus buildings with students walking outside',
  },
];

export default function Hero() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % heroSlides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <div className="hero-slider" aria-live="polite">
        {heroSlides.map((slide, index) => (
          <div key={slide.src} className={`hero-slide ${index === activeIndex ? 'active' : ''}`}>
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority={index === activeIndex}
            />
          </div>
        ))}
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="hero-badge">{t('hero.badge')}</span>
          <h1>{t('hero.title')}</h1>
          <p>
            {t('hero.description')}
          </p>
          <div className="hero-actions">
            <a href="#application" className="button button-primary button-large">
              {t('hero.applyBtn')}
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-secondary button-large"
            >
              {t('hero.whatsappBtn')}
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">70+</span>
              <span className="stat-label">University Options</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Students Guided</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">48h</span>
              <span className="stat-label">Fast Application Review</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-card">
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '1rem' }}>TRUSTED PARTNER</p>
            <h2>Your Path to Turkish Universities</h2>
            <p>From selecting the right university to securing your acceptance and preparing for arrival, we guide you every step of the way.</p>
            
            <div className="hero-card-items">
              <div className="hero-card-item">
                <h3>Expert Guidance</h3>
                <p>Personal support to help you choose the right program and university.</p>
              </div>
              <div className="hero-card-item">
                <h3>Document Support</h3>
                <p>We help prepare and organize all required application documents.</p>
              </div>
              <div className="hero-card-item">
                <h3>Complete Assistance</h3>
                <p>From application through visa and arrival, we&apos;re with you every step.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator"></div>
    </section>
  );
}
