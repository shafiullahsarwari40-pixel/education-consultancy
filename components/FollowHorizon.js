'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function FollowHorizon() {
  const { t } = useLanguage();
  return (
    <section className="section follow-horizon">
      <div className="container follow-horizon-inner">
        <div className="follow-horizon-copy">
          <span className="section-label">{t('followHorizon.label')}</span>
          <h2>{t('followHorizon.title')}</h2>
          <p>{t('followHorizon.description')}</p>
        </div>

        <div className="follow-horizon-actions">
          <a
            className="button social-button social-instagram"
            href="https://www.instagram.com/heceducons"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('followHorizon.instagram')}
          </a>
          <a
            className="button social-button social-facebook"
            href="https://www.facebook.com/profile.php?id=61590645456268"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('followHorizon.facebook')}
          </a>
          <a
            className="button social-button social-whatsapp"
            href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('followHorizon.whatsappChannel')}
          </a>
          <a
            className="button social-button social-telegram"
            href="https://t.me/horizonedu"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('followHorizon.telegram')}
          </a>
        </div>
      </div>
    </section>
  );
}
