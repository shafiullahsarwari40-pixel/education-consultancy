'use client';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Ahmad N.',
      role: 'Engineering Student',
      text: 'Horizon made my application process so smooth and easy. The team was always available to help me with documents and questions.',
      stars: 5
    },
    {
      name: 'Fatima A.',
      role: 'Medicine Student',
      text: 'I was worried about the visa process, but Horizon guided me step by step. Everything was clear and well organized.',
      stars: 5
    },
    {
      name: 'Mohammad R.',
      role: 'Business Student',
      text: 'Great support from start to finish. The scholarship guidance helped me get funding. Highly recommend Horizon!',
      stars: 5
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Success Stories</span>
          <h2>What Students Say</h2>
          <p>Join hundreds of students who successfully started their education journey with Horizon.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
              <div className="testimonial-stars">
                {'⭐'.repeat(testimonial.stars)}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
