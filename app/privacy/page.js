import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/PremiumFooter';
import EnglishContentNotice from '../../components/EnglishContentNotice';

export const metadata = { title: 'Privacy & data protection', description: 'How Horizon handles information provided for consultations and university application support.', alternates: { canonical: '/privacy' } };

export default function PrivacyPage() {
  return (
    <><Navbar/><main className="horizon-legal" id="main-content" lang="en" dir="ltr" tabIndex={-1}>
      <div className="container" style={{ maxWidth: 900 }}>
        <EnglishContentNotice />
        <div className="section-header">
          <span className="section-label">Privacy Policy</span>
          <h1>Privacy & data protection</h1>
          <p>
            Horizon Educational Consultancy respects your privacy and handles student information carefully.
          </p>
        </div>

        <div className="privacy-content">
          <h2>1. Information we collect</h2>
          <p>
            We may collect the information needed to support your study plans, including your name, contact details,
            country of residence, academic background, university preferences, and relevant application documents such as
            passports, transcripts, diplomas, and other supporting records.
          </p>

          <h2>2. How we use your information</h2>
          <p>
            The information we collect is used to assess your study options, help prepare applications, coordinate with
            universities or institutions where appropriate, communicate updates, and provide the service you requested.
            We do not sell or rent personal information for unrelated marketing purposes.
          </p>

          <h2>3. Document handling and security</h2>
          <p>
            Student documents are treated as sensitive information. We use access controls and secure handling practices to
            limit visibility to authorized staff and to protect your records during the application process. Documents are not
            published publicly and are only used for the purpose of your application assistance and related communication.
          </p>

          <h2>4. Retention and access</h2>
          <p>
            We retain records only as long as necessary for the service, compliance, or operational needs of the application
            process. You may request information about your records or ask for updates to incorrect or outdated data where
            applicable.
          </p>

          <h2>5. Third parties and cross-border processing</h2>
          <p>
            We may share information with universities, document processors, or service providers when necessary to support
            your application process. Any such sharing is limited to what is needed for a specific purpose and handled under
            appropriate confidentiality and security practices.
          </p>

          <h2>6. Your rights</h2>
          <p>
            You may contact us to request access, correction, or further information about the personal data we hold about you,
            subject to applicable law and internal verification procedures.
          </p>

          <h2>7. Contact</h2>
          <p>
            If you have questions about this policy, please contact us at{' '}
            <a dir="ltr" href="mailto:horizon@horizon-edu.net">horizon@horizon-edu.net</a>.
          </p>

          <Link href="/" className="button button-secondary" style={{ marginTop: '2rem' }}>
            Return to Horizon
          </Link>
        </div>
      </div>
    </main><Footer/></>
  );
}
