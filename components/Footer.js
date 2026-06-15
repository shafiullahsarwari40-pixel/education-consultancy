'use client';

import Image from 'next/image';
import { useLanguage } from '../lib/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <Image
                src="/images/logo.png"
                alt={t('footer.companyName')}
                width={110}
                height={33}
                sizes="(max-width: 768px) 100px, 110px"
                style={{ objectFit: 'contain', background: 'transparent' }}
              />
            </div>
            <h4>{t('footer.companyName')}</h4>
            <p className="footer-desc">{t('footer.companyDesc')}</p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>{t('footer.quickLinks')}</h4>
            <ul>
              <li><a href="#about">{t('footer.about')}</a></li>
              <li><a href="#services">{t('footer.services')}</a></li>
              <li><a href="#universities">{t('footer.universities')}</a></li>
              <li><a href="#programs">{t('footer.programs')}</a></li>
              <li><a href="/apply">{t('footer.applyNow')}</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4>{t('footer.servicesTitle')}</h4>
            <ul>
              <li><a href="#services">{t('footer.universityAdmission')}</a></li>
              <li><a href="#services">{t('footer.visaSupport')}</a></li>
              <li><a href="#services">{t('footer.residencePermit')}</a></li>
              <li><a href="#services">{t('footer.accommodation')}</a></li>
              <li><a href="#services">{t('footer.documentPrep')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4>{t('footer.contactTitle')}</h4>
            <ul>
              <li>
                <a href="mailto:horizon@horizon-edu.net?subject=Education%20Consultation%20Request">📧 {t('footer.email')}</a>
              </li>
              <li>
                <a
                  href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
                  target="_blank"
                  rel="noopener noreferrer"
                >💬 {t('footer.whatsapp')}</a>
              </li>
              <li>
                <a
                  href="https://t.me/horizonedu"
                  target="_blank"
                  rel="noopener noreferrer"
                >✈️ {t('footer.telegram')}</a>
              </li>
              <li><a href="tel:+905515227371">📞 {t('footer.phone')}</a></li>
              <li>📍 {t('footer.address')}</li>
            </ul>
            <div className="footer-social">
              <a
                href="https://www.instagram.com/heceducons"
                target="_blank"
                rel="noopener noreferrer"
                className="social-button"
              >
                <span className="social-icon instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                    <path d="M17.5 6.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                    <path d="M17 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm1 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10Z" />
                  </svg>
                </span> {t('footer.followOnInstagram')}
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61590645456268"
                target="_blank"
                rel="noopener noreferrer"
                className="social-button"
              >
                <span className="social-icon facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99h-2.54V12h2.54V9.79c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.76-1.61 1.54V12h2.74l-.44 2.89h-2.3v6.99C18.34 21.12 22 16.99 22 12Z" />
                  </svg>
                </span> {t('footer.followOnFacebook')}
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R"
                target="_blank"
                rel="noopener noreferrer"
                className="social-button whatsapp-button"
              >
                <span className="social-icon whatsapp">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.72 13.11c-.24.68-1.4 1.31-1.93 1.39-.51.08-1.14.12-2.78-.59-2.29-.99-3.78-3.19-3.9-3.34-.12-.15-1.01-1.19-1.01-2.26 0-1.07.59-1.6.8-1.82.21-.22.47-.27.63-.27.16 0 .33 0 .48 0 .16.01.37-.06.57.43.2.49.67 1.7.73 1.82.07.12.12.26.01.42-.1.16-.15.27-.29.42-.14.14-.29.31-.42.42-.14.14-.28.29-.12.56.16.27.7 1.14 1.5 1.84 1.04 0 1.8-.73 1.99-.95.19-.22.38-.18.65-.11.27.07 1.7.8 1.99.95.29.15.48.22.55.35.07.13.07.74-.17 1.42Z" />
                  </svg>
                </span> {t('footer.joinWhatsAppChannel')}
              </a>
              <a
                href="https://t.me/horizonedu"
                target="_blank"
                rel="noopener noreferrer"
                className="social-button telegram-button"
              >
                <span className="social-icon telegram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M21.5 3.5L2.5 10.5l4.5 1.5L9 19l2.5-3 4 3 5-15z" />
                  </svg>
                </span> {t('footer.joinOnTelegram')}
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            {t('footer.copyrightFull')
              ? t('footer.copyrightFull').replace('{year}', currentYear)
              : `© ${currentYear} Horizon Educational Consultancy. ${t('footer.copyright')}`}
          </p>
          <div className="footer-links">
            <a href="/privacy">{t('footer.privacy')}</a>
            <a href="/terms">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
