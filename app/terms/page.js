import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="section privacy-page">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Terms of Service</span>
          <h1>Terms of Service</h1>
          <p>
            Welcome to Horizon Educational Consultancy. These terms govern your use of our website and services.
          </p>
        </div>

        <div className="privacy-content">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using our website or submitting an application, you agree to these terms and any additional policies referenced here.
          </p>

          <h2>2. Services</h2>
          <p>
            Horizon provides guidance for international students applying to Turkish universities, including application support, document preparation, and admission assistance.
          </p>

          <h2>3. Information Use</h2>
          <p>
            We use the information you provide only to process your application and to communicate with you about our educational services. We do not sell your personal information.
          </p>

          <h2>4. User Responsibilities</h2>
          <p>
            You are responsible for providing accurate information and documents. You agree to use the website lawfully and respectfully.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            Horizon is not responsible for decisions made by universities or for outcomes beyond our control. We do our best to support your application process, but we cannot guarantee admission or visa approval.
          </p>

          <h2>6. Contact</h2>
          <p>
            If you have questions about these terms, please contact us at{' '}
            <a href="mailto:horizon@horizon-edu.net">horizon@horizon-edu.net</a>.
          </p>

          <Link href="/" className="button button-secondary" style={{ marginTop: '2rem' }}>
            Return to Horizon
          </Link>
        </div>
      </div>
    </main>
  );
}
