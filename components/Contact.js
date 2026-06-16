'use client';

import { useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to send your message');
      }

      setMessage(t('contact.success'));
      setFormState({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact submit error', error);
      setMessage(error?.message || t('contact.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('contact.label')}</span>
          <h2>{t('contact.title')}</h2>
          <p>{t('contact.description')}</p>
        </div>

        <div className="contact-grid">
          {/* Contact Information */}
          <div>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>{t('contact.info')}</h3>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>📍 {t('contact.address')}</h4>
              <p style={{ margin: 0 }}>Istanbul, Turkey</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>📞 {t('contact.phone')}</h4>
              <p style={{ margin: 0 }}>+90 (551) 522-7371</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>📧 {t('contact.email')}</h4>
              <p style={{ margin: 0 }}>
                <a href="mailto:horizon@horizon-edu.net?subject=Education%20Consultation%20Request">
                  horizon@horizon-edu.net
                </a>
              </p>
            </div>

            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>💬 {t('contact.whatsappLabel')}</h4>
              <a
                href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary"
              >
                {t('contact.chatOnWhatsApp')}
              </a>
              <div style={{ marginTop: '0.5rem' }}>
                <a
                  href="https://t.me/horizonedu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-secondary"
                  style={{ marginTop: '0.5rem' }}
                >
                  {t('contact.messageOnTelegram')}
                </a>
              </div>
            </div>
            <div className="map-placeholder">
              <h4>{t('contact.mapTitle')}</h4>
              <p>{t('contact.mapDescription')}</p>
              <a
                href="https://www.google.com/maps/place/Istanbul,+Turkey"
                target="_blank"
                rel="noopener noreferrer"
              >{t('contact.viewOnMap')}</a>
            </div>
            <div className="contact-social-buttons">
              <a
                href="https://www.instagram.com/heceducons"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-secondary social-button"
              >
                <span className="social-icon instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                    <path d="M17.5 6.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                    <path d="M17 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm1 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10Z" />
                  </svg>
                </span> {t('contact.followOnInstagram')}
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61590645456268"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-secondary social-button"
              >
                <span className="social-icon facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99h-2.54V12h2.54V9.79c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.76-1.61 1.54V12h2.74l-.44 2.89h-2.3v6.99C18.34 21.12 22 16.99 22 12Z" />
                  </svg>
                </span> {t('contact.followOnFacebook')}
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary social-button"
              >
                <span className="social-icon whatsapp">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.72 13.11c-.24.68-1.4 1.31-1.93 1.39-.51.08-1.14.12-2.78-.59-2.29-.99-3.78-3.19-3.9-3.34-.12-.15-1.01-1.19-1.01-2.26 0-1.07.59-1.6.8-1.82.21-.22.47-.27.63-.27.16 0 .33 0 .48 0 .16.01.37-.06.57.43.2.49.67 1.7.73 1.82.07.12.12.26.01.42-.1.16-.15.27-.29.42-.14.14-.29.31-.42.42-.14.14-.28.29-.12.56.16.27.7 1.14 1.5 1.84 1.04 0 1.8-.73 1.99-.95.19-.22.38-.18.65-.11.27.07 1.7.8 1.99.95.29.15.48.22.55.35.07.13.07.74-.17 1.42Z" />
                  </svg>
                </span> {t('contact.joinWhatsAppChannel')}
              </a>
              <a
                href="https://t.me/horizonedu"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-secondary social-button"
              >
                <span className="social-icon telegram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M21.5 3.5L2.5 10.5l4.5 1.5L9 19l2.5-3 4 3 5-15z" />
                  </svg>
                </span> {t('contact.joinOnTelegram')}
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">{t('contact.fullName')}</label>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                className="form-input"
                placeholder={t('contact.fullNamePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="form-label">{t('contact.emailAddress')}</label>
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                className="form-input"
                placeholder={t('contact.emailPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="form-label">{t('contact.subject')}</label>
              <input
                type="text"
                name="subject"
                value={formState.subject}
                onChange={handleChange}
                className="form-input"
                placeholder={t('contact.subjectPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="form-label">{t('contact.message')}</label>
              <textarea
                name="message"
                value={formState.message}
                onChange={handleChange}
                className="form-textarea"
                placeholder={t('contact.messagePlaceholder')}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button button-primary button-large"
            >
              {loading ? t('contact.sending') : t('contact.sendMessage')}
            </button>

            {message && (
              <p style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: message.includes('error') ? '#fee' : '#efe',
                color: message.includes('error') ? '#c33' : '#3c3',
                marginTop: '1rem'
              }}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
