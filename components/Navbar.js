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

  useEffect(() => {
    if (!mobileOpen) {
      setLangOpen(false);
    }
  }, [mobileOpen]);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fa', name: 'فارسی' },
    { code: 'ps', name: 'پښتو' },
    { code: 'ar', name: 'العربية' },
    { code: 'fr', name: 'Français' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ur', name: 'اردو' },
    { code: 'hi', name: 'हिन्दी' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language) || { code: language, name: language.toUpperCase() };

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '#about', label: t('nav.about') },
    { href: '#why-turkey', label: t('nav.whyTurkey') },
    { href: '#services', label: t('nav.services') },
    { href: '#universities', label: t('nav.universities') },
    { href: '#programs', label: t('nav.programs') },
    { href: '#contact', label: t('nav.contact') },
    { href: '/student/result', label: t('nav.seeResult') },
  ];

  function closeAll() {
    setMobileOpen(false);
    setLangOpen(false);
  }

  function handleLanguageSelect(code) {
    changeLanguage(code);
    setLangOpen(false);
  }

  return (
    <header dir={isRTL ? 'rtl' : 'ltr'} className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo" onClick={closeAll}>
          <Image
            src="/images/logo.png"
            alt="Horizon logo"
            width={250}
            height={60}
            style={{ objectFit: 'contain', background: 'transparent' }}
            sizes="(max-width: 767px) 180px, 250px"
            priority
          />
        </Link>

        <nav className="navbar-menu desktop" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="nav-link" onClick={closeAll}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="navbar-right">
          <div className={`navbar-language${langOpen ? ' open' : ''}`}>
            <button
              type="button"
              className="lang-toggle"
              onClick={() => setLangOpen((open) => !open)}
              aria-expanded={langOpen}
              aria-haspopup="menu"
            >
              <span>{currentLanguage.name}</span>
              <span className="lang-arrow">▾</span>
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    className={language === lang.code ? 'active' : ''}
                    onClick={() => handleLanguageSelect(lang.code)}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/apply" className="button button-primary navbar-apply" onClick={closeAll}>
            {t('hero.applyBtn')}
          </Link>

          <button
            className={`menu-toggle${mobileOpen ? ' open' : ''}`}
            onClick={() => setMobileOpen((s) => !s)}
            aria-label={mobileOpen ? t('common.closeMenu') : t('common.openMenu')}
          >
            {mobileOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true">
          <div className="mobile-panel">
            <button className="menu-close" onClick={closeAll} aria-label={t('common.closeMenu')}>
              ×
            </button>
            <nav className="mobile-nav-links" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="nav-link" onClick={closeAll}>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mobile-language">
              <button
                type="button"
                className="mobile-lang-toggle"
                onClick={() => setLangOpen((open) => !open)}
                aria-expanded={langOpen}
                aria-haspopup="menu"
              >
                <span>{currentLanguage.name}</span>
                <span>{langOpen ? '▴' : '▾'}</span>
              </button>
              {langOpen && (
                <div className="mobile-lang-dropdown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={language === lang.code ? 'active' : ''}
                      onClick={() => handleLanguageSelect(lang.code)}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link href="/apply" className="button button-primary button-large mobile-apply" onClick={closeAll}>
              {t('hero.applyBtn')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
