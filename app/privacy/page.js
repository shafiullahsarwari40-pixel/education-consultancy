import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="section privacy-page">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Privacy Policy</span>
          <h1>Privacy & Data Protection</h1>
          <p>
            At Horizon Educational Consultancy, we respect your privacy and protect the personal information you share with us.
          </p>
        </div>

        <div className="privacy-content">
          <p>
            We collect only the information necessary to process your university application and provide guidance. This includes:
          </p>
          <ul>
            <li>Names</li>
            <li>Emails</li>
            <li>Phone numbers</li>
            <li>Diplomas</li>
            <li>Transcripts</li>
            <li>Passports</li>
          </ul>

          <p>
            Your information is used exclusively to support your educational application, coordinate admissions, and communicate important updates. We do not sell your data to third parties.
          </p>

          <p>
            For any questions about privacy, please contact us at{' '}
            <a href="mailto:horizon@horizon-edu.net">horizon@horizon-edu.net</a>.
          </p>

          <div className="privacy-note">
            <strong>Note:</strong> When you submit documents, we keep them safe and use them only for your university application process and related student services.
          </div>

          <Link href="/" className="button button-secondary" style={{ marginTop: '2rem' }}>
            Return to Horizon
          </Link>
        </div>
      </div>
    </main>
  );
}
