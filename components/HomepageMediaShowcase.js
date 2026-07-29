'use client';

import { useEffect, useMemo, useState } from 'react';
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
  if (/^(https?:\/\/|mailto:|tel:|\/|\.\/|\.\.\/)/i.test(trimmed)) return true;
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

export default function HomepageMediaShowcase() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      try {
        const response = await fetch('/api/homepage-media', { cache: 'no-store' });
        if (!response.ok) throw new Error('Unable to load media');
        const data = await response.json();
        if (mounted) {
          setItems(data.items || []);
        }
      } catch (error) {
        console.error('Homepage media load error', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadItems();

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);
    const updateViewport = () => setIsMobileView(window.innerWidth < 768);

    updateReducedMotion();
    updateViewport();

    mediaQuery.addEventListener('change', updateReducedMotion);
    window.addEventListener('resize', updateViewport);

    return () => {
      mounted = false;
      mediaQuery.removeEventListener('change', updateReducedMotion);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  useEffect(() => {
    if (activeIndex < 0) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [activeIndex]);

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
      if (event.key === 'Escape') {
        setActiveIndex(-1);
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % items.length);
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [activeIndex, items.length]);

  const displayItems = useMemo(() => {
    if (items.length <= 1) return items;
    return [...items, ...items];
  }, [items]);

  const shouldAnimate = !reducedMotion && !isMobileView && items.length > 1 && !hoverPaused;

  if (loading) {
    return null;
  }

  if (!items.length) {
    return null;
  }

  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

  return (
    <section className="homepage-media-showcase section" id="homepage-media">
      <div className="container">
        <div className="section-header section-header-centered">
          <span className="section-label">{t('homepageMedia.label')}</span>
          <h2>{t('homepageMedia.heading')}</h2>
          <p>{t('homepageMedia.description')}</p>
        </div>

        <div
          className={`homepage-media-viewport ${shouldAnimate ? 'auto-scroll' : 'manual-scroll'}`}
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
        >
          <div className={`homepage-media-track ${shouldAnimate ? 'is-animating' : ''}`}>
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
                    aria-label={item.title || `Open ${item.media_type}`}
                  >
                    {isVideo ? (
                      <video
                        className="homepage-media-media"
                        src={mediaSrc}
                        poster={item.thumbnail_url || ''}
                        muted
                        playsInline
                        preload="metadata"
                        controls
                      />
                    ) : (
                      <img
                        className="homepage-media-media"
                        src={mediaSrc}
                        alt={item.title || 'Homepage media'}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </button>

                  <div className="homepage-media-card-body">
                    {item.title ? <h3>{item.title}</h3> : null}
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
      </div>

      {activeItem ? (
        <div className="homepage-media-modal" role="dialog" aria-modal="true" aria-label="Media preview">
          <div className="homepage-media-modal-backdrop" onClick={() => setActiveIndex(-1)} />
          <div className="homepage-media-modal-panel">
            <button type="button" className="homepage-media-modal-close" onClick={() => setActiveIndex(-1)} aria-label="Close media preview">
              ×
            </button>

            <div className="homepage-media-modal-media">
              {activeItem.media_type === 'video' ? (
                <video
                  controls
                  playsInline
                  muted
                  preload="metadata"
                  poster={activeItem.thumbnail_url || ''}
                  src={activeItem.media_url || ''}
                />
              ) : (
                <img src={activeItem.media_url || activeItem.thumbnail_url || ''} alt={activeItem.title || 'Media preview'} />
              )}
            </div>

            {(activeItem.title || activeItem.description) ? (
              <div className="homepage-media-modal-info">
                {activeItem.title ? <h3>{activeItem.title}</h3> : null}
                {activeItem.description ? <p>{activeItem.description}</p> : null}
              </div>
            ) : null}

            <div className="homepage-media-modal-nav">
              <button type="button" onClick={() => setActiveIndex((prev) => (prev - 1 + items.length) % items.length)} aria-label="Previous media">
                ‹
              </button>
              <button type="button" onClick={() => setActiveIndex((prev) => (prev + 1) % items.length)} aria-label="Next media">
                ›
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
