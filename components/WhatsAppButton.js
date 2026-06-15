'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function WhatsAppButton() {
  const { t } = useLanguage();
  return (
    <a
      href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-button"
      title={t('contact.chatOnWhatsApp')}
      aria-label={t('contact.chatOnWhatsApp')}
    >
      💬
    </a>
  );
}
