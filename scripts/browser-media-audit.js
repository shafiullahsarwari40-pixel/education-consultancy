// Read-only agent-browser eval helper. Reports no student names or media URLs.
(() => {
  const section = document.querySelector('.homepage-media-showcase');
  const modal = document.querySelector('.homepage-media-modal');
  const mediaKey = (element) => {
    if (!element) return null;
    const source = element.currentSrc || element.src;
    if (!source) return null;
    const url = new URL(source, location.origin);
    return url.searchParams.get('url') || `${url.origin}${url.pathname}`;
  };
  const previewKeys = [...document.querySelectorAll('.homepage-media-preview img, .homepage-media-preview video')].map(mediaKey);
  const currentKey = mediaKey(modal?.querySelector('img, video'));
  const focused = document.activeElement;
  return {
    direction: document.documentElement.dir,
    state: section?.querySelector('.homepage-media-loading') ? 'loading'
      : section?.querySelector('.homepage-media-status button') ? 'error'
      : previewKeys.length ? 'ready' : 'empty',
    items: previewKeys.length,
    modalOpen: Boolean(modal),
    activePreviewIndex: currentKey ? previewKeys.indexOf(currentKey) : -1,
    headingFocused: focused === section?.querySelector('h2'),
    focusTag: focused?.tagName,
    controls: [...(modal?.querySelectorAll('.homepage-media-modal-nav button') || [])].map((button) => ({
      label: button.getAttribute('aria-label'),
      glyph: button.textContent.trim(),
      x: Math.round(button.getBoundingClientRect().x),
    })),
  };
})();
