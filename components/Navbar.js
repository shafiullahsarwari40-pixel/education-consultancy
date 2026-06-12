'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';

export default function Navbar() {
  const { language, changeLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setLangMenuOpen(false);
  };

  const langNames = { en: 'English', tr: 'Türkçe', da: 'دری', ps: 'پښتو' };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            Horizon
          </Link>

          <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="#about" onClick={handleNavClick}>{t('nav.about')}</a>
            <a href="#why-turkey" onClick={handleNavClick}>{t('nav.whyTurkey')}</a>
            <a href="#services" onClick={handleNavClick}>{t('nav.services')}</a>
            <a href="#universities" onClick={handleNavClick}>{t('nav.universities')}</a>
            <a href="#programs" onClick={handleNavClick}>{t('nav.programs')}</a>
            <a href="#contact" onClick={handleNavClick}>{t('nav.contact')}</a>
            <a href="/admin/login" onClick={handleNavClick}>Admin</a>
            <div className="navbar-mobile-social">
              <a
                href="https://www.instagram.com/heceducons"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >Instagram</a>
              <a
                href="https://www.facebook.com/profile.php?id=61590645456268"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >Facebook</a>
              <a
                href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Channel"
              >WhatsApp</a>
            </div>
          </div>

          <div className="navbar-cta">
            <div className="navbar-social">
              <a
                href="https://www.instagram.com/heceducons"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-icon-link"
              >
                <span className="social-icon instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                    <path d="M17.5 6.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                    <path d="M17 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm1 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10Z" />
                  </svg>
                </span>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61590645456268"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-icon-link"
              >
                <span className="social-icon facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99h-2.54V12h2.54V9.79c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.76-1.61 1.54V12h2.74l-.44 2.89h-2.3v6.99C18.34 21.12 22 16.99 22 12Z" />
                  </svg>
                </span>
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Channel"
                className="social-icon-link"
              >
                <span className="social-icon whatsapp">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.72 13.11c-.24.68-1.4 1.31-1.93 1.39-.51.08-1.14.12-2.78-.59-2.29-.99-3.78-3.19-3.9-3.34-.12-.15-1.01-1.19-1.01-2.26 0-1.07.59-1.6.8-1.82.21-.22.47-.27.63-.27.16 0 .33 0 .48 0 .16.01.37-.06.57.43.2.49.67 1.7.73 1.82.07.12.12.26.01.42-.1.16-.15.27-.29.42-.14.14-.29.31-.42.42-.14.14-.28.29-.12.56.16.27.7 1.14 1.5 1.84 1.04 0 1.8-.73 1.99-.95.19-.22.38-.18.65-.11.27.07 1.7.8 1.99.95.29.15.48.22.55.35.07.13.07.74-.17 1.42Z" />
                  </svg>
                </span>
              </a>
            </div>
            <div className="language-switcher">
              <button 
                className="lang-toggle"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Change language"
              >
                {langNames[language]}
              </button>
              {langMenuOpen && (
                <div className="lang-dropdown">
                  <button 
                    onClick={() => handleLanguageChange('en')}
                    className={language === 'en' ? 'active' : ''}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => handleLanguageChange('tr')}
                    className={language === 'tr' ? 'active' : ''}
                  >
                    Türkçe
                  </button>
                  <button 
                    onClick={() => handleLanguageChange('da')}
                    className={language === 'da' ? 'active' : ''}
                  >
                    دری
                  </button>
                  <button 
                    onClick={() => handleLanguageChange('ps')}
                    className={language === 'ps' ? 'active' : ''}
                  >
                    پښتو
                  </button>
                </div>
              )}
            </div>
            <Link href="#application" className="button button-primary button-small" onClick={handleNavClick}>
              {t('nav.apply')}
            </Link>
            <button
              className="hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
