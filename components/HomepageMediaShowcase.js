'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

function buildMediaSrc(item) {
  if (!item) return '';
  if (item.media_type === 'video') {
    return item.media_url || '';
  }
  return item.media_url || item.thumbnail_url || '';
}

function isValidLink(value) {
  if (!value) return false;
  const trimmed = String(value).trim();
  if (!trimmed) return false;
  return /^(https?:\/\/|mailto:|tel:)/i.test(trimmed) || /^\/(?!\/)/.test(trimmed);
}

export default function HomepageMediaShowcase() {
  const { t, language } = useLanguage();
  const isRtlLanguage = ['fa', 'ps', 'ar', 'ur'].includes(language);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [aspectRatios, setAspectRatios] = useState({});
  const [activeIndex, setActiveIndex] = useState(-1);
  const isModalOpen = activeIndex >= 0;
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadItems() {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await fetch('/api/homepage-media', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Unable to load media');
        const data = await response.json();
        if (!Array.isArray(data.items)) throw new Error('Invalid media response');
        if (mounted) {
          setItems(data.items);
        }
      } catch (error) {
        if (mounted && error.name !== 'AbortError') setLoadError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadItems();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!isModalOpen) return;
    const previousFocus = document.activeElement;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      previousFocus?.focus?.();
    };
  }, [isModalOpen]);

  useEffect(() => {
    const videos = document.querySelectorAll('.homepage-media-card video');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!entry.isIntersecting) {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (activeIndex < 0) return;

    const handleKeydown = (event) => {
      if (event.key === 'Tab') {
        const controls = [...(dialogRef.current?.querySelectorAll('button, a[href], video[controls], [tabindex="0"]') || [])].filter(el => !el.disabled && el.getClientRects().length);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setActiveIndex(-1);
      }
      // Native media controls and editable fields own their arrow keys.
      const ownsArrowKeys = event.target instanceof Element && event.target.closest('video, input, textarea, select, [contenteditable="true"], [role="slider"]');
      if (ownsArrowKeys || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const isRtl = dialogRef.current && window.getComputedStyle(dialogRef.current).direction === 'rtl';
        const step = (event.key === 'ArrowRight' ? 1 : -1) * (isRtl ? -1 : 1);
        setActiveIndex((prev) => (prev + step + items.length) % items.length);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [activeIndex, items.length]);

  const displayItems = items.slice(0, 4);
  const retryMedia = () => {
    // This heading survives every loading/result state. Move focus only during
    // the explicit retry action, never after a response when the user may have moved on.
    headingRef.current?.focus({ preventScroll: true });
    setReloadKey((key) => key + 1);
  };
  const rememberAspectRatio = (id, width, height) => {
    if (!width || !height) return;
    const ratio = Math.max(0.65, Math.min(2, width / height));
    setAspectRatios((current) => current[id] === ratio ? current : { ...current, [id]: ratio });
  };

  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

  return (
    <section className="homepage-media-showcase section premium-media" id="homepage-media">
      <div className="container">
        <div className="premium-section-heading premium-section-heading-centered">
          <span className="section-label">{t('homepageMedia.label')}</span>
          <h2 ref={headingRef} tabIndex={-1}>{t('homepageMedia.heading')}</h2>
          <p>{t('homepageMedia.description')}</p>
        </div>

        {loading ? (
          <div className="homepage-media-loading" aria-busy="true">
            <p className="sr-only" role="status">{t('premium.mediaLoading')}</p>
            <div className="homepage-media-track" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <div key={index} className="homepage-media-card homepage-media-skeleton">
                  <div className="homepage-media-preview" />
                  <div className="homepage-media-card-body"><span /><span /><span /></div>
                </div>
              ))}
            </div>
          </div>
        ) : loadError || !items.length ? (
          <div className="homepage-media-status" role="status">
            <p>{t(loadError ? 'premium.mediaUnavailable' : 'premium.mediaEmpty')}</p>
            {loadError ? (
              <button className="button button-outline" type="button" onClick={retryMedia}>{t('premium.mediaRetry')}</button>
            ) : null}
          </div>
        ) : (
        <div className="homepage-media-viewport manual-scroll">
          <div className="homepage-media-track">
            {displayItems.map((item, index) => {
              const isVideo = item.media_type === 'video';
              const mediaSrc = buildMediaSrc(item);
              const originalIndex = index % items.length;
              return (
                <article key={`${item.id}-${index}`} className="homepage-media-card">
                  <button
                    type="button"
                    className="homepage-media-preview"
                    onClick={() => setActiveIndex(originalIndex)}
                    aria-label={item.title || t('premium.mediaOpen')}
                  >
                    {isVideo ? (
                      <video
                        className="homepage-media-media"
                        src={mediaSrc}
                        poster={item.thumbnail_url || ''}
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(event) => rememberAspectRatio(item.id, event.currentTarget.videoWidth, event.currentTarget.videoHeight)}
                      />
                    ) : (
                      <Image
                        className="homepage-media-media"
                        src={mediaSrc}
                        alt={item.title || t('premium.mediaTitle')}
                        fill
                        sizes="(max-width: 700px) calc(100vw - 28px), (max-width: 991px) calc((100vw - 54px) / 2), (max-width: 1328px) calc((100vw - 84px) / 3), 415px"
                        onLoad={(event) => rememberAspectRatio(item.id, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
                      />
                    )}
                    <span className="homepage-media-open" aria-hidden="true">{t('premium.view')} <i>↗</i></span>
                  </button>

                  <div className="homepage-media-card-body">
                    <span className="homepage-media-type">{t('premium.community')}</span>
                    <h3>{item.title || t('premium.mediaTitle')}</h3>
                    {item.description ? <p>{item.description}</p> : null}
                    {item.button_text && item.button_link && isValidLink(item.button_link) ? (
                      <a href={item.button_link} className="button button-secondary homepage-media-button" target="_blank" rel="noreferrer">
                        {item.button_text}
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {activeItem ? (
        <div className="homepage-media-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-label={activeItem.title || t('premium.mediaTitle')}>
          <div className="homepage-media-modal-backdrop" onClick={() => setActiveIndex(-1)} />
          <div className="homepage-media-modal-panel">
            <button type="button" ref={closeRef} className="homepage-media-modal-close" onClick={() => setActiveIndex(-1)} aria-label={t('form.close')}>
              ×
            </button>

            <div className="homepage-media-modal-media" style={{ '--media-aspect-ratio': aspectRatios[activeItem.id] || 1.6 }}>
              {activeItem.media_type === 'video' ? (
                <video
                  controls
                  playsInline
                  muted
                  preload="metadata"
                  poster={activeItem.thumbnail_url || ''}
                  src={activeItem.media_url || ''}
                  onLoadedMetadata={(event) => rememberAspectRatio(activeItem.id, event.currentTarget.videoWidth, event.currentTarget.videoHeight)}
                />
              ) : (
                <Image
                  src={activeItem.media_url || activeItem.thumbnail_url || ''}
                  alt={activeItem.title || t('premium.mediaTitle')}
                  fill
                  sizes="(max-width: 1008px) calc(100vw - 48px), 960px"
                  onLoad={(event) => rememberAspectRatio(activeItem.id, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
                />
              )}
            </div>

            {(activeItem.title || activeItem.description) ? (
              <div className="homepage-media-modal-info" tabIndex={0} role="region" aria-label={activeItem.title || t('premium.mediaTitle')}>
                {activeItem.title ? <h3>{activeItem.title}</h3> : null}
                {activeItem.description ? <p>{activeItem.description}</p> : null}
              </div>
            ) : null}

            <div className="homepage-media-modal-nav">
              <button type="button" onClick={() => setActiveIndex((prev) => (prev - 1 + items.length) % items.length)} aria-label={t('premium.mediaPrevious')}>
                <span aria-hidden="true" dir="ltr">{isRtlLanguage ? '›' : '‹'}</span>
              </button>
              <button type="button" onClick={() => setActiveIndex((prev) => (prev + 1) % items.length)} aria-label={t('premium.mediaNext')}>
                <span aria-hidden="true" dir="ltr">{isRtlLanguage ? '‹' : '›'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
