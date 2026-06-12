'use client';

export default function SocialProof() {
  const points = [
    'Trusted Guidance',
    'Clear Communication',
    'Application Support',
    'Student Success Focus'
  ];

  return (
    <section className="section social-proof">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Trust Builders</span>
          <h2>What Students Count On</h2>
          <p>Horizon is committed to reliable support, clear communication and successful admissions.</p>
        </div>

        <div className="proof-grid">
          {points.map((point, index) => (
            <div key={index} className="proof-card">
              <div className="proof-icon">✓</div>
              <p>{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
