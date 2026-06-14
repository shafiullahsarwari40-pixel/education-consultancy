import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import WhyTurkey from '../components/WhyTurkey';
import Services from '../components/Services';
import Universities from '../components/Universities';
import Programs from '../components/Programs';
import ApplicationForm from '../components/ApplicationForm';
import AgentPartnership from '../components/AgentPartnership';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import FollowHorizon from '../components/FollowHorizon';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import WhyChooseHorizon from '../components/WhyChooseHorizon';
import FAQSection from '../components/FAQSection';
import SocialProof from '../components/SocialProof';
import SuccessStories from '../components/SuccessStories';
import StudentDashboard from '../components/StudentDashboard';
import ApplicationProcessTimeline from '../components/ApplicationProcessTimeline';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <WhyChooseHorizon />
        <SuccessStories />
        <Testimonials />
        <WhyTurkey />
        <Services />
        <SocialProof />
        <Universities />
        <Programs />
        <ApplicationProcessTimeline />
        <StudentDashboard />
        <FAQSection />

        <section className="section" id="application">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Ready to Apply?</span>
              <h2>Start Your Free Application</h2>
              <p>Submit your information and our team will contact you within 48 hours to guide you through the application process.</p>
            </div>
            <ApplicationForm />
            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Your information will only be used for your university application process and to provide you with educational services.
            </div>
          </div>
        </section>

        <AgentPartnership />
        <Contact />
        <FollowHorizon />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
