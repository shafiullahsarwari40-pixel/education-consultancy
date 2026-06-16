"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

export default function Navbar() {
  const { language, changeLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);

  const isRTL = language === 'da' || language === 'ps';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    if (mobileOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observed = Array.from(document.querySelectorAll('section[id], section.section'));
    if (!observed.length) return;

    const obs = new IntersectionObserver((entries) => {
      // choose the entry with largest intersectionRatio
      let best = null;
      entries.forEach(e => {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        // toggle in-view class for subtle animations
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
        } else {
          e.target.classList.remove('in-view');
        }
      });
      if (best && best.isIntersecting) {
        const id = best.target.id || best.target.className.split(' ')[0] || 'hero';
        setActiveSection(id || 'hero');
      }
    }, { threshold: [0.25, 0.5, 0.75] });

    observed.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    { href: '#services', label: t('nav.services') },
    { href: '#universities', label: t('nav.universities') },
    { href: '/student/result', label: t('nav.seeResult') },
    { href: '#contact', label: t('nav.contact') },
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
    <header dir={isRTL ? 'rtl' : 'ltr'} className={`navbar${scrolled ? ' scrolled' : ''}`}>
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
          {navItems.map((item) => {
            const isHash = item.href.startsWith('#');
            const match = isHash ? item.href.slice(1) : (item.href === '/' ? 'hero' : '');
            const active = match ? activeSection === match : false;
            return (
              <a key={item.href} href={item.href} className={`nav-link${active ? ' active' : ''}`} onClick={closeAll}>
                {item.label}
              </a>
            );
          })}
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
            {t('nav.apply')}
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

      {mobileOpen && typeof window !== 'undefined' && window.innerWidth < 992 && (
        <div className="mobile-menu" role="dialog" aria-modal="true" onClick={closeAll}>
          <div className="mobile-panel" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-panel-header">
              <Link href="/" className="mobile-panel-logo" onClick={closeAll}>
                <Image
                  src="/images/logo.png"
                  alt="Horizon logo"
                  width={180}
                  height={40}
                  style={{ objectFit: 'contain', background: 'transparent' }}
                  priority
                />
              </Link>
              <button className="menu-close" onClick={closeAll} aria-label={t('common.closeMenu')}>
                ×
              </button>
            </div>
            <div className="mobile-panel-body">
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
