'use client';

export default function AgentPartnership() {
  const benefits = [
    { title: 'Student Support', description: 'Help students apply to Turkish universities' },
    { title: 'Clear Communication', description: 'Direct access to Horizon team for inquiries' },
    { title: 'Application Tracking', description: 'Real-time updates on application status' },
    { title: 'Marketing Support', description: 'Marketing materials and promotional help' },
    { title: 'WhatsApp Communication', description: 'Fast instant messaging support' },
    { title: 'Long-Term Partnership', description: 'Ongoing cooperation and support' },
  ];

  return (
    <section className="section" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <span className="section-label" style={{ color: 'var(--secondary-light)' }}>Partner Program</span>
          <h2 style={{ color: 'white' }}>Become a Horizon Partner Agent</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Work with Horizon to help students apply to universities in Turkey and grow your business.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {benefits.map((benefit, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-lg)',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>{benefit.title}</h3>
              <p style={{ fontSize: '0.95rem', margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <a
            href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
            target="_blank"
            rel="noopener noreferrer"
            className="button"
            style={{
              background: 'white',
              color: 'var(--primary)',
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Contact Us for Partnership
          </a>
        </div>
      </div>
    </section>
  );
}
