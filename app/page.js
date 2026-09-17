import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WhyTurkey from '../components/WhyTurkey';
import HomepageMediaShowcase from '../components/HomepageMediaShowcase';
import Universities from '../components/Universities';
import Contact from '../components/Contact';
import Footer from '../components/PremiumFooter';
import WhatsAppButton from '../components/WhatsAppButton';
import TrustBar from '../components/TrustBar';
import PremiumServices from '../components/PremiumServices';
import ApplicationJourney from '../components/ApplicationJourney';
import FAQSection from '../components/FAQSection';

export const metadata = { alternates: { canonical: '/' } };

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Horizon Educational Consultancy',
  url: 'https://horizoneducon.com',
  logo: 'https://horizoneducon.com/images/horizon-logo.webp',
  email: 'horizon@horizon-edu.net',
  telephone: '+905515227371',
  sameAs: ['https://www.instagram.com/heceducons', 'https://www.facebook.com/profile.php?id=61590645456268', 'https://t.me/horizonedu'],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, '\\u003c') }} />
      <Navbar />
      <main className="premium-home" id="main-content" tabIndex={-1}>
        <Hero />
        <TrustBar />
        <PremiumServices />
        <WhyTurkey />
        <ApplicationJourney />
        <Universities />
        <HomepageMediaShowcase />
        <FAQSection />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
