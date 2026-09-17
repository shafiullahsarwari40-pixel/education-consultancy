'use client';

import { useLanguage } from '../lib/LanguageContext';
import { admissionsFaq } from '../lib/admissionsFaq';

export default function FAQSection() {
  const { t, language } = useLanguage();
  const faqs = (admissionsFaq[language] || admissionsFaq.en).map(([question, answer]) => ({ question, answer }));

  return (
    <section className="section faq-section premium-faq" id="faq">
      <div className="container">
        <div className="premium-section-heading premium-section-heading-split">
          <div>
            <span className="section-label">{t('faq.label')}</span>
            <h2>{t('faq.title')}</h2>
          </div>
          <p>{t('faq.description')}</p>
        </div>

        <div className="premium-faq-list">
          {faqs.map((faq, index) => (
            <details key={index} className="premium-faq-item">
              <summary>
                <span>0{index + 1}</span>
                <strong>{faq.question}</strong>
                <i aria-hidden="true">+</i>
              </summary>
              <div className="premium-faq-answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="premium-faq-footer">
          <span>{t('premium.stillDeciding')}</span>
          <a href="#contact">{t('premium.ask')} <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  );
}
