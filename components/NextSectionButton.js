'use client';

import { useEffect, useState } from 'react';

export default function NextSectionButton() {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section[id], section.section'));
    if (!sections.length) return;

    function update() {
      const mid = window.innerHeight / 2;
      let best = null;
      sections.forEach(s => {
        const rect = s.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= 0) best = s;
      });
      if (best) {
        setCurrent(best);
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!current) return null;

  const sections = Array.from(document.querySelectorAll('section[id], section.section'));
  const idx = sections.indexOf(current);
  const next = sections[idx + 1];
  if (!next) return null;

  function goNext() {
    next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <button className="next-section-btn" onClick={goNext} aria-label="Next section">
      Next Section ↓
    </button>
  );
}
