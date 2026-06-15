'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function FAQSection() {
  const { t } = useLanguage();
  const faqs = [
    {
      question: t('faq.question1'),
      answer: t('faq.answer1')
    },
    {
      question: t('faq.question2'),
      answer: t('faq.answer2')
    },
    {
      question: t('faq.question3'),
      answer: t('faq.answer3')
    },
    {
      question: t('faq.question4'),
      answer: t('faq.answer4')
    },
    {
      question: t('faq.question5'),
      answer: t('faq.answer5')
    }
  ];

  return (
    <section className="section faq-section" id="faq">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('faq.label')}</span>
          <h2>{t('faq.title')}</h2>
          <p>{t('faq.description')}</p>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <article key={index} className="faq-card">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
