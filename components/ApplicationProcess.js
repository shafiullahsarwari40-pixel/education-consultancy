'use client';

export default function ApplicationProcess() {
  const steps = [
    {
      number: '1',
      title: 'Free Consultation',
      description: 'Student contacts Horizon and shares goals.'
    },
    {
      number: '2',
      title: 'Document Preparation',
      description: 'Student prepares passport, diploma, transcript, photo, and files.'
    },
    {
      number: '3',
      title: 'University Application',
      description: 'Horizon helps submit applications and follow up.'
    },
    {
      number: '4',
      title: 'Admission & Visa',
      description: 'Student receives acceptance, prepares visa, and plans arrival.'
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">How It Works</span>
          <h2>Simple Application Process</h2>
          <p>Start your journey to studying in Turkey in a few clear steps.</p>
        </div>

        <div className="timeline">
          <div className="timeline-items">
            {steps.map((step, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
