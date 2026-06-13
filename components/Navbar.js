"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

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
      <div className="container">
        <div className="navbar-inner" style={{ alignItems: 'center' }}>
          <div className="nav-left">
            <Link href="/" className="navbar-logo" onClick={closeAll}>
              <Image
                src="/images/logo.png"
                alt="Horizon logo"
                width={210}
                height={64}
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 767px) 150px, 210px"
                priority
              />
            </Link>
          </div>

          <div className="nav-center">
            <nav className={`navbar-menu desktop ${isRTL ? 'rtl' : ''}`} aria-label="Primary navigation">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={closeAll}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="nav-right">
            <div className="navbar-social desktop">
              <a href="https://www.instagram.com/heceducons" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon-link">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61590645456268" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-icon-link">Facebook</a>
              <a href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="social-icon-link">WhatsApp</a>
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

            <a href="#application" className="button button-primary button-small desktop" onClick={closeAll}>
              {t('nav.apply')}
            </a>

            <button
              className={`menu-toggle mobile ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen((s) => !s)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="hamburger-icon">{mobileOpen ? '×' : '☰'}</span>
            </button>
          </div>
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
              <a href="https://www.instagram.com/heceducons" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61590645456268" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
            <div className="mobile-language">
              <button onClick={() => changeLang('en')}>English</button>
              <button onClick={() => changeLang('tr')}>Türkçe</button>
              <button onClick={() => changeLang('da')}>دری</button>
              <button onClick={() => changeLang('ps')}>پښتو</button>
            </div>
            <a href="#application" className="button button-primary button-large mobile-apply" onClick={closeAll}>{t('nav.apply')}</a>
          </div>
        </div>
      )}
    </header>
  );
}
