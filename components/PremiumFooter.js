'use client';

import Image from 'next/image';
import { useLanguage } from '../lib/LanguageContext';

export default function PremiumFooter() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="premium-footer">
      <div className="container">
        <div className="premium-footer-cta">
          <div>
            <span>{t('premium.footerKicker')}</span>
            <h2>{t('premium.footerTitle')}</h2>
          </div>
          <a href="/apply" className="button button-light button-large">
            {t('premium.start')} <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="premium-footer-grid">
          <div className="premium-footer-brand">
            <a href="/" className="premium-footer-logo" aria-label="Horizon Educational Consultancy home">
              <Image
                src="/images/horizon-logo.webp"
                alt="Horizon Educational Consultancy"
                width={64}
                height={64}
                sizes="64px"
                unoptimized
              />
              <span>
                <strong>Horizon</strong>
                <small>Educational Consultancy</small>
              </span>
            </a>
            <p>{t('footer.companyDesc')}</p>
            <div className="premium-footer-socials">
              <a href="https://www.instagram.com/heceducons" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61590645456268" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://t.me/horizonedu" target="_blank" rel="noopener noreferrer">Telegram</a>
            </div>
          </div>

          <div className="premium-footer-column">
            <h3>{t('footer.quickLinks')}</h3>
            <a href="/#why-turkey">{t('footer.about')}</a>
            <a href="/universities">{t('footer.universities')}</a>
            <a href="/guide">{t('premium.studyGuide')}</a>
            <a href="/apply">{t('footer.applyNow')}</a>
            <a href="/student/result">{t('premium.studentPortal')}</a>
            <a href="/#faq">{t('faq.label')}</a>
          </div>

          <div className="premium-footer-column">
            <h3>{t('footer.servicesTitle')}</h3>
            <a href="/#services">{t('footer.universityAdmission')}</a>
            <a href="/#services">{t('footer.visaSupport')}</a>
            <a href="/#services">{t('footer.residencePermit')}</a>
            <a href="/#services">{t('footer.accommodation')}</a>
            <a href="/#services">{t('footer.documentPrep')}</a>
          </div>

          <div className="premium-footer-column premium-footer-contact">
            <h3>{t('footer.contactTitle')}</h3>
            <a dir="ltr" href="mailto:horizon@horizon-edu.net?subject=Education%20Consultation%20Request">horizon@horizon-edu.net</a>
            <a dir="ltr" href="tel:+905515227371">+90 (551) 522-7371</a>
            <span>Istanbul, Türkiye</span>
            <a className="premium-footer-chat" href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team" target="_blank" rel="noopener noreferrer">
              {t('contact.chatOnWhatsApp')} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="premium-footer-bottom">
          <p>
            {t('footer.copyrightFull')
              ? t('footer.copyrightFull').replace('{year}', currentYear)
              : `© ${currentYear} Horizon Educational Consultancy. ${t('footer.copyright')}`}
          </p>
          <div>
            <a href="/privacy">{t('footer.privacy')}</a>
            <a href="/terms">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
