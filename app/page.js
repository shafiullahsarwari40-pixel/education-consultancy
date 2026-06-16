import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import WhyTurkey from '../components/WhyTurkey';
import Services from '../components/Services';
import Universities from '../components/Universities';
import Programs from '../components/Programs';
import AgentPartnership from '../components/AgentPartnership';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import FollowHorizon from '../components/FollowHorizon';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import NextSectionButton from '../components/NextSectionButton';
import WhyChooseHorizon from '../components/WhyChooseHorizon';
import FAQSection from '../components/FAQSection';
import SocialProof from '../components/SocialProof';
import StudentDashboard from '../components/StudentDashboard';
import ApplicationProcessTimeline from '../components/ApplicationProcessTimeline';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <WhyTurkey />
        <Universities />
        <Programs />
        <ApplicationProcessTimeline />
        <Testimonials />
        <FAQSection />
        <Contact />
        <NextSectionButton />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
