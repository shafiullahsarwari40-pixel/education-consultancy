'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function TrustBar() {
  const { t } = useLanguage();
  return (
    <section className="premium-trust-bar" aria-label="Horizon service highlights">
      <div className="container premium-trust-grid">
        {[1, 2, 3, 4].map(index => (
          <div className="premium-trust-item" key={index}>
            <span className="premium-trust-index">0{index}</span>
            <div><span>{t(`premium.trust${index}`)}</span><strong>{t(`premium.value${index}`)}</strong></div>
          </div>
        ))}
      </div>
    </section>
  );
}
