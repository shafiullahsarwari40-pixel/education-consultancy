JSON.stringify({
  title: document.title,
  viewport: window.innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  language: document.documentElement.lang,
  direction: document.documentElement.dir,
  focus: document.activeElement?.getAttribute('aria-label') || document.activeElement?.className,
  dialogs: document.querySelectorAll('[role="dialog"]').length,
  images: Array.from(document.images).map((img, index) => ({
    index,
    alt: img.alt,
    complete: img.complete,
    naturalWidth: img.naturalWidth,
    loading: img.loading,
    inViewport: img.getBoundingClientRect().bottom > 0 && img.getBoundingClientRect().top < innerHeight,
  })),
  errorOverlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay')),
});
