'use client';

export default function FAQSection() {
  const faqs = [
    {
      question: 'Do I need YÖS?',
      answer: 'Most programs do not require YÖS for international students. We help you identify the right universities and entry paths.'
    },
    {
      question: 'Can I apply with only a diploma?',
      answer: 'Yes, you can apply with a high school diploma and transcript. We also support document evaluation and authentication.'
    },
    {
      question: 'How long does admission take?',
      answer: 'Admission timing depends on the program and university, but most applications are reviewed within 4–8 weeks.'
    },
    {
      question: 'Can I study in English?',
      answer: 'Many Turkish universities offer English-taught programs. We help you find the best fit and prepare your application.'
    },
    {
      question: 'Do you help with visas?',
      answer: 'Yes, we provide visa guidance, document preparation, and support throughout the residence permit process.'
    }
  ];

  return (
    <section className="section faq-section" id="faq">
      <div className="container">
        <div className="section-header">
          <span className="section-label">FAQs</span>
          <h2>Frequently Asked Questions</h2>
          <p>Answers to the most common student questions about studying in Turkey.</p>
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
