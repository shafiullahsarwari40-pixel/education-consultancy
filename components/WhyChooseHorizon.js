'use client';

export default function WhyChooseHorizon() {
  const cards = [
    {
      title: 'Fast Communication',
      description: 'Quick responses through WhatsApp and direct support for every application step.'
    },
    {
      title: 'Student-Focused Support',
      description: 'Personalized guidance that prioritizes your goals and academic profile.'
    },
    {
      title: 'Turkish University Expertise',
      description: 'Deep knowledge of Turkey’s admission process and university requirements.'
    },
    {
      title: 'End-to-End Guidance',
      description: 'From document preparation to arrival in Turkey, we support you completely.'
    }
  ];

  return (
    <section className="section why-choose" id="why-choose">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Why Choose Horizon?</span>
          <h2>Study Abroad Support Designed for You</h2>
          <p>We help students secure admission, manage documents, and move to Turkey with confidence.</p>
        </div>

        <div className="why-choose-grid">
          {cards.map((card, index) => (
            <article key={index} className="why-card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
