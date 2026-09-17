import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/PremiumFooter';
import EnglishContentNotice from '../../components/EnglishContentNotice';

export const metadata = { title: 'Terms of service', description: 'The scope and terms of Horizon’s university guidance and application support services.', alternates: { canonical: '/terms' } };

export default function TermsPage() {
  return (
    <><Navbar/><main className="horizon-legal" id="main-content" lang="en" dir="ltr" tabIndex={-1}>
      <div className="container" style={{ maxWidth: 900 }}>
        <EnglishContentNotice />
        <div className="section-header">
          <span className="section-label">Terms of service</span>
          <h1>Terms of service</h1>
          <p>
            These terms explain how Horizon Educational Consultancy supports students and how our website and application services are used.
          </p>
        </div>

        <div className="privacy-content">
          <h2>1. Scope of services</h2>
          <p>
            Horizon provides educational guidance, application support, document preparation assistance, and communication support
            for students seeking study opportunities in Türkiye. We do not control university admissions decisions, visa decisions,
            government procedures, or external timelines.
          </p>

          <h2>2. Student responsibilities</h2>
          <p>
            Students are responsible for providing accurate information, submitting complete documents, meeting deadlines, and
            following the instructions of universities or other institutions. We act as a support partner, but final decisions are made by the relevant university, authority, or institution.
          </p>

          <h2>3. No guaranteed outcomes</h2>
          <p>
            Horizon does not guarantee admission, acceptance, scholarship outcome, visa approval, or accommodation placement. Any
            assessment or guidance we provide is based on the information available at the time of consultation and should be treated as a support service rather than a guaranteed result.
          </p>

          <h2>4. Fees and third-party costs</h2>
          <p>
            Fees for consultancy or service support, if applicable, are separate from university tuition, application fees, document
            certification costs, translation costs, and any other official third-party charges. Students remain responsible for those external costs unless otherwise agreed in writing.
          </p>

          <h2>5. Communication and content</h2>
          <p>
            We may communicate with students by email, phone, WhatsApp, or other approved channels. We expect students to provide
            clear, truthful information and to keep communications respectful and professional.
          </p>

          <h2>6. Document and privacy standards</h2>
          <p>
            Students must ensure that submitted documents are authentic, accurate, and legally permitted for the application process.
            We process sensitive personal information in line with our privacy policy and internal security procedures.
          </p>

          <h2>7. Limitation of liability</h2>
          <p>
            Horizon is not liable for decisions, delays, or outcomes outside our direct control, including university admissions,
            governmental procedures, and external service providers. Our responsibility is to support your process with reasonable care and clear communication.
          </p>

          <h2>8. Contact</h2>
          <p>
            If you have questions about these terms, contact us at{' '}
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
