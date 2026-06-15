"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

const SocialIcon = ({ name, href, label }) => {
  if (name === 'instagram') {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="social-btn">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
          <path d="M17.5 6.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          <path d="M17 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm1 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10Z" />
        </svg>
      </a>
    );
  }
  if (name === 'facebook') {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="social-btn">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99h-2.54V12h2.54V9.79c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.76-1.61 1.54V12h2.74l-.44 2.89h-2.3v6.99C18.34 21.12 22 16.99 22 12Z" />
        </svg>
      </a>
    );
  }
  if (name === 'whatsapp') {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="social-btn">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.72 13.11c-.24.68-1.4 1.31-1.93 1.39-.51.08-1.14.12-2.78-.59-2.29-.99-3.78-3.19-3.9-3.34-.12-.15-1.01-1.19-1.01-2.26 0-1.07.59-1.6.8-1.82.21-.22.47-.27.63-.27.16 0 .33 0 .48 0 .16.01.37-.06.57.43.2.49.67 1.7.73 1.82.07.12.12.26.01.42-.1.16-.15.27-.29.42-.14.14-.29.31-.42.42-.14.14-.28.29-.12.56.16.27.7 1.14 1.5 1.84 1.04 0 1.8-.73 1.99-.95.19-.22.38-.18.65-.11.27.07 1.7.8 1.99.95.29.15.48.22.55.35.07.13.07.74-.17 1.42Z" />
        </svg>
      </a>
    );
  }
};

export default function Navbar() {
  const { language, changeLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const isRTL = language === 'da' || language === 'ps';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navItems = [
    { href: '#about', label: t('nav.about') },
    { href: '#why-turkey', label: t('nav.whyTurkey') },
    { href: '#services', label: t('nav.services') },
    { href: '#universities', label: t('nav.universities') },
    { href: '#programs', label: t('nav.programs') },
    { href: '#contact', label: t('nav.contact') },
    { href: '/student/result', label: t('nav.seeResult') },
    { href: '/admin/login', label: 'Admin' },
  ];

  const langNames = { en: 'English', tr: 'Türkçe', da: 'دری', ps: 'پښتو' };

  function closeAll() {
    setMobileOpen(false);
    setLangOpen(false);
  }

  function changeLang(l) {
    changeLanguage(l);
    setLangOpen(false);
    setMobileOpen(false);
  }

  return (
    <header dir={isRTL ? 'rtl' : 'ltr'} className="navbar">
      <div className="navbar-inner">
        {/* LEFT: Logo */}
        <Link href="/" className="navbar-logo" onClick={closeAll}>
          <Image
            src="/images/logo.png"
            alt="Horizon logo"
            width={150}
            height={36}
            style={{ objectFit: 'contain', background: 'transparent' }}
            sizes="(max-width: 767px) 120px, 150px"
            priority
          />
        </Link>

        {/* CENTER: Navigation */}
        <nav className="navbar-menu desktop" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeAll}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* RIGHT: Social + Language + Button */}
        <div className="navbar-right">
          <div className="navbar-social">
            <SocialIcon name="instagram" href="https://www.instagram.com/heceducons" label="Instagram" />
            <SocialIcon name="facebook" href="https://www.facebook.com/profile.php?id=61590645456268" label="Facebook" />
            <SocialIcon name="whatsapp" href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R" label="WhatsApp" />
          </div>

          <div className="language-switcher desktop">
            <button className="lang-toggle" onClick={() => setLangOpen((s) => !s)} aria-expanded={langOpen} aria-label="Language">
              {langNames[language]}
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                <button onClick={() => changeLang('en')}>English</button>
                <button onClick={() => changeLang('tr')}>Türkçe</button>
                <button onClick={() => changeLang('da')}>دری</button>
                <button onClick={() => changeLang('ps')}>پښتو</button>
              </div>
            )}
          </div>

          <a href="#application-timeline" className="button button-primary button-small desktop" onClick={closeAll}>
            {t('nav.apply')}
          </a>

          <button
            className={`menu-toggle mobile ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen((s) => !s)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-panel">
            <button className="menu-close" onClick={closeAll} aria-label="Close menu">×</button>
            <nav className="mobile-nav-links">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={closeAll}>{item.label}</a>
              ))}
            </nav>
            <div className="mobile-social">
              <SocialIcon name="instagram" href="https://www.instagram.com/heceducons" label="Instagram" />
              <SocialIcon name="facebook" href="https://www.facebook.com/profile.php?id=61590645456268" label="Facebook" />
              <SocialIcon name="whatsapp" href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R" label="WhatsApp" />
            </div>
            <div className="mobile-language">
              <button onClick={() => changeLang('en')}>English</button>
              <button onClick={() => changeLang('tr')}>Türkçe</button>
              <button onClick={() => changeLang('da')}>دری</button>
              <button onClick={() => changeLang('ps')}>پښتو</button>
            </div>
            <a href="#application-timeline" className="button button-primary button-large mobile-apply" onClick={closeAll}>{t('nav.apply')}</a>
          </div>
        </div>
      )}
    </header>
  );
}
