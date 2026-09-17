"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../lib/LanguageContext";
import { isEnglishWorkflowRoute } from "../lib/siteLanguage";

const languages = [
  ["en", "English"],
  ["fa", "فارسی"],
  ["ps", "پښتو"],
  ["ar", "العربية"],
  ["fr", "Français"],
  ["tr", "Türkçe"],
  ["ur", "اردو"],
  ["hi", "हिन्दी"],
];

function LanguageSelect({ language, changeLanguage, label, id }) {
  return (
    <div className="horizon-language-control">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c4 5 4 13 0 18-4-5-4-13 0-18Z" />
      </svg>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={language}
        onChange={(event) => changeLanguage(event.target.value)}
      >
        {languages.map(([code, name]) => (
          <option value={code} key={code} lang={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Navbar() {
  const { language, changeLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const isEnglishWorkflow = isEnglishWorkflowRoute(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      [
        ...(panelRef.current?.querySelectorAll("a[href], button, select") ||
          []),
      ].filter((el) => !el.disabled && el.getClientRects().length);
    focusable()[0]?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 991) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      triggerRef.current?.focus();
    };
  }, [open]);

  const navItems = [
    { href: "/universities", label: t("nav.universities") },
    { href: "/#services", label: t("nav.services") },
    { href: "/guide", label: t("premium.studyGuide") },
    { href: "/student/result", label: t("premium.studentPortal") },
    { href: "/#contact", label: t("nav.contact") },
  ];

  const brand = (
    <>
      <Image
        src="/images/horizon-logo.webp"
        alt=""
        width={56}
        height={56}
        className="navbar-brand-mark"
        unoptimized
        priority
      />
      <span className="navbar-wordmark">
        <strong>
          Horizon<span className="horizon-wordmark-dot">.</span>
        </strong>
        <small>Educational Consultancy</small>
      </span>
    </>
  );

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t("premium.skipContent")}
      </a>
      <header className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo" aria-label="Horizon home">
            {brand}
          </Link>
          <nav className="navbar-menu desktop" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${pathname === item.href || (item.href === "/universities" && pathname?.startsWith("/universities/")) ? " active" : ""}`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="navbar-right">
            {!isEnglishWorkflow && (
              <div className="navbar-language">
                <LanguageSelect
                  id="desktop-language"
                  label={t("premium.language")}
                  language={language}
                  changeLanguage={changeLanguage}
                />
              </div>
            )}
            <Link href="/apply" className="button button-primary navbar-apply">
              {t("nav.apply")} <span aria-hidden="true">↗</span>
            </Link>
            <button
              ref={triggerRef}
              type="button"
              className="menu-toggle"
              aria-label={t("common.openMenu")}
              aria-expanded={open}
              aria-controls="horizon-mobile-menu"
              onClick={() => setOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      {open &&
        createPortal(
          <div
            className="mobile-menu open"
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <div
              className="mobile-panel"
              ref={panelRef}
              id="horizon-mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t("premium.navigation")}
            >
              <div className="mobile-panel-header">
                <Link
                  href="/"
                  className="mobile-panel-logo"
                  aria-label="Horizon home"
                  onClick={() => setOpen(false)}
                >
                  {brand}
                </Link>
                <button
                  type="button"
                  className="menu-close"
                  onClick={() => setOpen(false)}
                  aria-label={t("common.closeMenu")}
                >
                  ×
                </button>
              </div>
              <div className="mobile-panel-body">
                <nav
                  className="mobile-nav-links"
                  aria-label="Mobile navigation"
                >
                  {navItems.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="nav-link"
                      onClick={() => setOpen(false)}
                    >
                      <span className="mobile-nav-number">0{index + 1}</span>
                      {item.label}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  ))}
                </nav>
                {!isEnglishWorkflow && (
                  <LanguageSelect
                    id="mobile-language"
                    label={t("premium.language")}
                    language={language}
                    changeLanguage={changeLanguage}
                  />
                )}
                <Link
                  href="/apply"
                  className="button button-primary mobile-apply"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.apply")} <span aria-hidden="true">↗</span>
                </Link>
                <span className="mobile-menu-caption">
                  Istanbul, Türkiye · Horizon
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
