'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function Testimonials() {
  const { t } = useLanguage();
  const testimonials = [
    {
      name: 'Ahmad N.',
      role: t('testimonials.testimonial1Role'),
      text: t('testimonials.testimonial1Text'),
      stars: 5
    },
    {
      name: 'Fatima A.',
      role: t('testimonials.testimonial2Role'),
      text: t('testimonials.testimonial2Text'),
      stars: 5
    },
    {
      name: 'Mohammad R.',
      role: t('testimonials.testimonial3Role'),
      text: t('testimonials.testimonial3Text'),
      stars: 5
    },
  ];

  return (
    <section id="testimonials" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('testimonials.label')}</span>
          <h2>{t('testimonials.title')}</h2>
          <p>{t('testimonials.description')}</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
              <div className="testimonial-stars">
                {'⭐'.repeat(testimonial.stars)}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
