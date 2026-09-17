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
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

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
      setMessageType('success');
      setFormState({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact submit error', error);
      setMessage(error?.message || t('contact.error'));
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section premium-contact" id="contact">
      <div className="container">
        <div className="premium-section-heading premium-section-heading-centered">
          <span className="section-label">{t('contact.label')}</span>
          <h2>{t('premium.contactTitle')}</h2>
          <p>{t('contact.description')}</p>
        </div>

        <div className="premium-contact-grid">
          <aside className="premium-contact-panel">
            <span className="premium-contact-kicker">{t('contact.info')}</span>
            <h3>{t('premium.contactChannel')}</h3>
            <p>{t('premium.contactDesc')}</p>

            <div className="premium-contact-details">
              <a href="tel:+905515227371">
                <span>{t('premium.contactPhone')}</span>
                <strong dir="ltr">{t('contact.phone')}</strong>
              </a>
              <a href="mailto:horizon@horizon-edu.net?subject=Education%20Consultation%20Request">
                <span>{t('premium.contactEmail')}</span>
                <strong dir="ltr">horizon@horizon-edu.net</strong>
              </a>
              <a href="https://www.google.com/maps/place/Istanbul,+Turkey" target="_blank" rel="noopener noreferrer">
                <span>{t('premium.based')}</span>
                <strong>{t('contact.address')}</strong>
              </a>
            </div>

            <div className="premium-contact-channels">
              <a href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team" target="_blank" rel="noopener noreferrer">
                WhatsApp <span aria-hidden="true">↗</span>
              </a>
              <a href="https://t.me/horizonedu" target="_blank" rel="noopener noreferrer">
                Telegram <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="premium-contact-socials">
              <span>Horizon</span>
              <a href="https://www.instagram.com/heceducons" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61590645456268" target="_blank" rel="noopener noreferrer">Facebook</a>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="premium-contact-form">
            <div className="premium-form-intro">
              <span>{t('premium.formKicker')}</span>
              <h3>{t('premium.consultation')}</h3>
            </div>

            <div className="premium-form-row">
              <div>
                <label className="form-label" htmlFor="contact-name">{t('contact.fullName')}</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={t('contact.fullNamePlaceholder')}
                  autoComplete="name"
                  maxLength={120}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="contact-email">{t('contact.emailAddress')}</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={t('contact.emailPlaceholder')}
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="contact-subject">{t('contact.subject')}</label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                value={formState.subject}
                onChange={handleChange}
                className="form-input"
                placeholder={t('premium.subjectExample')}
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="contact-message">{t('contact.message')}</label>
              <textarea
                id="contact-message"
                name="message"
                value={formState.message}
                onChange={handleChange}
                className="form-textarea"
                placeholder={t('premium.messageExample')}
                maxLength={5000}
                required
              />
            </div>

            <p className="horizon-privacy-note">{t('premium.privacyNote')} <a href="/privacy">{t('premium.privacyLink')}</a>.</p>
            <button type="submit" disabled={loading} className="button button-primary button-large" aria-busy={loading}>
              {loading ? t('contact.sending') : t('contact.sendMessage')}
              <span aria-hidden="true">↗</span>
            </button>

            {message && (
              <p className={`premium-form-message ${messageType}`} role="status">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
