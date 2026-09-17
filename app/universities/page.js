import Link from 'next/link';
import Navbar from '../../components/Navbar';
import PremiumFooter from '../../components/PremiumFooter';
import UniversityExplorer from '../../components/UniversityExplorer';
import EnglishContentNotice from '../../components/EnglishContentNotice';
import { universities, universityCities } from '../../lib/universities';
import '../universities.css';

export const metadata = {
  title: 'Explore Universities in Türkiye',
  description: 'Find universities across Türkiye, filter by city, save your shortlist and explore official admissions resources with Horizon.',
  alternates: { canonical: '/universities' },
};

export default function UniversitiesPage() {
  return (
    <>
      <Navbar />
      <main className="hu-page" id="main-content" lang="en" dir="ltr">
        <section className="hu-hero">
          <div className="hu-container">
            <nav className="hu-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Universities</span></nav>
            <EnglishContentNotice tone="dark" />
            <div className="hu-hero-layout">
              <div>
                <span className="hu-eyebrow">YOUR OPTIONS. YOUR FUTURE.</span>
                <h1>Find a university.<br /><em>Find your direction.</em></h1>
                <p>Start with a city. Discover your options. Build a shortlist that feels right for your ambitions, then plan your next step with us.</p>
              </div>
              <div className="hu-hero-aside">
                <span className="hu-compass" aria-hidden="true">↗</span>
                <span className="hu-aside-label">A clearer starting point</span>
                <div className="hu-hero-counts"><div><strong>{universities.length}</strong><span>universities to explore</span></div><div><strong>{universityCities.length}</strong><span>cities across Türkiye</span></div></div>
                <span className="hu-aside-foot">Official sources. Considered choices.</span>
              </div>
            </div>
          </div>
        </section>
        <div className="hu-container">
          <UniversityExplorer />
          <section className="hu-advisor-banner">
            <div><span className="hu-eyebrow">LET’S MAKE IT PERSONAL</span><h2>A shortlist is only the beginning.</h2><p>Tell us what you want to study, your academic background and your budget. We’ll help you ask the right questions and plan a realistic next step.</p></div>
            <Link href="/#contact" className="hu-button hu-button-light">Talk to an advisor <span aria-hidden="true">↗</span></Link>
          </section>
        </div>
      </main>
      <PremiumFooter />
    </>
  );
}
