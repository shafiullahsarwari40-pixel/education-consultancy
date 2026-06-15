"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../lib/LanguageContext';
import { supabase } from '../lib/supabaseClient';

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
  if (name === 'telegram') {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="social-btn">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M21.5 3.5L2.5 10.5l4.5 1.5L9 19l2.5-3 4 3 5-15z" />
        </svg>
      </a>
    );
  }
};

export default function Navbar() {
  const router = useRouter();
  const { language, changeLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const isRTL = language === 'fa' || language === 'ps';

  useEffect(() => {
    if (!supabase) {
      setLoadingSession(false);
      return;
    }

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data?.session || null);
      } catch (err) {
        console.error('Session fetch error:', err);
      } finally {
        setLoadingSession(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  function handleResultClick(e) {
    e.preventDefault();
    if (session) {
      router.push('/student/result');
    } else {
      router.push('/student/auth?redirect=/student/result');
    }
    closeAll();
  }

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '#about', label: t('nav.about') },
    { href: '#why-turkey', label: t('nav.whyTurkey') },
    { href: '#services', label: t('nav.services') },
    { href: '#universities', label: t('nav.universities') },
    { href: '#programs', label: t('nav.programs') },
    { href: '#contact', label: t('nav.contact') },
  ];

  const langNames = { en: 'English', fa: 'فارسی', ps: 'پښتو', ar: 'العربية', fr: 'Français', tr: 'Türkçe', ur: 'اردو', hi: 'हिन्दी' };
  const currentLangLabel = langNames[language] || language.toUpperCase();

  function closeAll() {
    setMobileOpen(false);
    setDesktopMoreOpen(false);
    setLangOpen(false);
  }

  function changeLang(l) {
    changeLanguage(l);
    setLangOpen(false);
    setMobileOpen(false);
    setDesktopMoreOpen(false);
  }

  return (
    <header dir={isRTL ? 'rtl' : 'ltr'} className="navbar">
      <div className="navbar-inner header">
          <div className="navbarLogo logoWrap">
          <Link href="/" className="navbar-logo" onClick={closeAll}>
            <Image
              src="/images/logo.png"
              alt={`${t('brand.name')} logo`}
              width={150}
              height={36}
              style={{ objectFit: 'contain', background: 'transparent' }}
              sizes="(max-width: 767px) 120px, 150px"
              priority
            />
          </Link>
        </div>

        <div className="navbar-social-left desktop" aria-label="Social links left">
          <SocialIcon name="instagram" href="https://www.instagram.com/heceducons" label="Instagram" />
          <SocialIcon name="facebook" href="https://www.facebook.com/profile.php?id=61590645456268" label="Facebook" />
        </div>

        <nav className="navbarLinks navLinks navbar-menu desktop" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeAll}
              className={`nav-link ${(item.href === '#programs' || item.href === '#universities') ? 'hide-below-1100' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="rightControls navbarActions navbar-right">
          {!loadingSession && (
            <a href="/student/result" className="button button-outline button-small desktop result-btn" onClick={handleResultClick}>
              {t('nav.seeResult')}
            </a>
          )}

          <a href="/apply" className="button button-primary button-small desktop apply-btn" onClick={closeAll}>
            {t('nav.apply')}
          </a>

          <div className="moreMenuWrapper desktop">
            <button
              className={`more-btn desktop ${desktopMoreOpen ? 'open' : ''}`}
              onClick={() => setDesktopMoreOpen((s) => !s)}
              aria-expanded={desktopMoreOpen}
              aria-haspopup="menu"
              aria-label={desktopMoreOpen ? 'Close more menu' : 'Open more menu'}
            >
              ⋯
            </button>
            {desktopMoreOpen && (
              <div className="more-menu" role="menu">
                <a href="/admin/login" onClick={closeAll} role="menuitem">
                  {t('nav.admin')}
                </a>
                <div className="more-social" role="group" aria-label="Social links">
                  <SocialIcon name="whatsapp" href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R" label="WhatsApp" />
                  <SocialIcon name="telegram" href="https://t.me/horizonedu" label="Telegram" />
                </div>
              </div>
            )}
          </div>

          {/* mobile hamburger remains for small screens */}
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
              <a href="/admin/login" onClick={closeAll}>{t('nav.admin')}</a>
              {!loadingSession && (
                <a href="/student/result" onClick={handleResultClick}>{t('nav.seeResult')}</a>
              )}
            </nav>
            <div className="mobile-social">
              <SocialIcon name="instagram" href="https://www.instagram.com/heceducons" label="Instagram" />
              <SocialIcon name="facebook" href="https://www.facebook.com/profile.php?id=61590645456268" label="Facebook" />
              <SocialIcon name="whatsapp" href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R" label="WhatsApp" />
              <SocialIcon name="telegram" href="https://t.me/horizonedu" label="Telegram" />
            </div>
            {/* Language changer moved to floating control; mobile menu no longer contains language buttons */}
            <a href="/apply" className="button button-primary button-large mobile-apply" onClick={closeAll}>{t('nav.apply')}</a>
          </div>
        </div>
      )}
    </header>
  );
}
