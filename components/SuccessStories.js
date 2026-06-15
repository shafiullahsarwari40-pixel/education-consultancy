'use client';

import Image from 'next/image';
import { useLanguage } from '../lib/LanguageContext';

export default function SuccessStories() {
  const { t } = useLanguage();
  const stories = [
    {
      name: 'Amina A.',
      country: 'Afghanistan',
      university: 'İzmir Katip Çelebi University',
      program: 'Business Administration',
      letter: '/images/hero-bg.jpg'
    },
    {
      name: 'Muhammad K.',
      country: 'Pakistan',
      university: 'Anadolu University',
      program: 'Computer Science',
      letter: '/images/university-campus-1.webp'
    },
    {
      name: 'Sara H.',
      country: 'Iran',
      university: 'Mersin University',
      program: 'Engineering',
      letter: '/images/university-campus-2.webp'
    }
  ];

  return (
    <section className="section success-stories" id="success-stories">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('successStories.label')}</span>
          <h2>{t('successStories.title')}</h2>
          <p>{t('successStories.description')}</p>
        </div>

        <div className="success-stories-grid">
          {stories.map((story, index) => (
            <article key={index} className="success-story-card">
              <div className="success-story-meta">
                <div>
                  <p className="story-name">{story.name}</p>
                  <p className="story-detail">{story.country}</p>
                </div>
                <span className="status-pill">{t('successStories.statusAccepted')}</span>
              </div>

              <div className="success-story-info">
                <p><strong>{t('successStories.university')}</strong> {story.university}</p>
                <p><strong>{t('successStories.program')}</strong> {story.program}</p>
              </div>

              <div className="letter-card">
                <div className="letter-preview">
                  <Image
                    src={story.letter}
                    alt="Acceptance letter preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="letter-overlay">
                  <span>{t('successStories.letterPreview')}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
