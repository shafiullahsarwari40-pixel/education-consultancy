'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function WhatsAppButton() {
  const { t } = useLanguage();
  return (
    <aside aria-label={t('contact.chatOnWhatsApp')}>
    <a
      href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-button"
      title={t('contact.chatOnWhatsApp')}
      aria-label={t('contact.chatOnWhatsApp')}
    >
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M26 15.5a10.5 10.5 0 0 1-15.8 9.1L5 26l1.4-5.1A10.5 10.5 0 1 1 26 15.5Z"/><path d="M12 10.5c-.8.1-1.7 1.2-1.5 2.4.5 3.6 3.4 6.5 7 7 .9.1 2-.7 2.4-1.6l-2.7-1.7-1.1 1a8.2 8.2 0 0 1-3.7-3.7l1-1.1-1.4-2.3Z"/></svg>
    </a>
    </aside>
  );
}
