import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import PremiumFooter from '../../../components/PremiumFooter';
import EnglishContentNotice from '../../../components/EnglishContentNotice';
import { universities, getUniversity, universityApplicationUrl } from '../../../lib/universities';
import '../../universities.css';

export function generateStaticParams() {
  return universities.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const university = getUniversity(slug);
  if (!university) return { title: 'University not found' };
  return {
    title: `${university.name} | Study in ${university.city}`,
    description: university.introduction,
    alternates: { canonical: `/universities/${university.slug}` },
  };
}

export default async function UniversityPage({ params }) {
  const { slug } = await params;
  const university = getUniversity(slug);
  if (!university) notFound();

  return (
    <>
      <Navbar />
      <main className="hu-page hu-detail-page" id="main-content" lang="en" dir="ltr">
        <section className="hu-hero hu-detail-hero">
          <div className="hu-container">
            <nav className="hu-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/universities">Universities</Link><span aria-hidden="true">/</span><span>{university.shortName}</span></nav>
            <EnglishContentNotice tone="dark" />
            <div className="hu-detail-heading">
              <div><span className="hu-eyebrow">EXPLORE {university.city.toLocaleUpperCase('tr')}</span><h1>{university.name}</h1><p>{university.introduction}</p></div>
              <div className="hu-detail-emblem">{university.logo ? <Image src={university.logo} alt={`${university.name} logo`} width={240} height={160} unoptimized /> : <span className="hu-monogram">{university.shortName}</span>}<span>{university.city} · Türkiye</span></div>
            </div>
          </div>
        </section>
        <div className="hu-container hu-detail-layout">
          <div className="hu-detail-content">
            <section className="hu-content-section">
              <span className="hu-eyebrow">MAKE AN INFORMED CHOICE</span>
              <h2>Start with the right information.</h2>
              <p>{university.admissionsNote}</p>
              <div className="hu-official-resource"><span className="hu-resource-symbol" aria-hidden="true">↗</span><div><h3>Go directly to the source</h3><p>Review official requirements, announcements and application instructions.</p><a href={university.admissionsUrl} target="_blank" rel="noopener noreferrer">{university.sourceLabel} <span aria-hidden="true">↗</span><span className="hu-sr-only"> (opens in a new tab)</span></a></div></div>
            </section>
            <section className="hu-content-section">
              <span className="hu-eyebrow">BEFORE YOU APPLY</span>
              <h2>Four things worth checking.</h2>
              <div className="hu-checklist">
                <div><span>01</span><div><h3>Your academic fit</h3><p>Confirm that your qualification and exam results meet the requirements of the exact program you want to study.</p></div></div>
                <div><span>02</span><div><h3>The language of your degree</h3><p>Check teaching language, accepted proficiency certificates and whether a preparation year is required.</p></div></div>
                <div><span>03</span><div><h3>The complete cost</h3><p>Review current tuition directly with the university and plan separately for accommodation, transport and everyday expenses.</p></div></div>
                <div><span>04</span><div><h3>Your application timeline</h3><p>Check the current intake, program quota, application deadline and final registration requirements.</p></div></div>
              </div>
            </section>
            <section className="hu-content-section hu-process-note">
              <h2>Your next step, with clarity.</h2>
              <p>Horizon can help you organize your choices and prepare your application. Creating a Horizon application starts your guidance request; it is separate from admission to the university. The university assesses eligibility and makes the final decision.</p>
              <p>University names and logos identify the institutions in this directory. A listing does not imply a partnership or endorsement.</p>
            </section>
          </div>
          <aside className="hu-application-aside" aria-label="Plan your application">
            <div className="hu-application-card">
              <span className="hu-eyebrow">YOUR NEXT CHAPTER</span>
              <h2>Let’s explore<br />your possibilities.</h2>
              <p>Start with your academic background and the degree you have in mind.</p>
              <Link className="hu-button hu-button-dark" href={universityApplicationUrl(university)}>Start my application <span aria-hidden="true">↗</span></Link>
              <Link className="hu-button hu-button-outline" href="/#contact">Speak with an advisor</Link>
              <div className="hu-aside-detail"><span>Location</span><strong>{university.city}, Türkiye</strong></div>
              <div className="hu-aside-detail"><span>Entry requirements & fees</span><strong>Confirmed by program and intake</strong></div>
              <a className="hu-official-link" href={university.officialUrl} target="_blank" rel="noopener noreferrer">Official university website <span aria-hidden="true">↗</span><span className="hu-sr-only"> (opens in a new tab)</span></a>
            </div>
            <Link href="/universities" className="hu-back-link"><span aria-hidden="true">←</span> Keep exploring universities</Link>
          </aside>
        </div>
      </main>
      <PremiumFooter />
    </>
  );
}
