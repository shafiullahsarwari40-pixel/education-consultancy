import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/PremiumFooter";
import PreparationChecklist from "../../components/PreparationChecklist";
import EnglishContentNotice from "../../components/EnglishContentNotice";

export const metadata = {
  title: "Your study preparation guide",
  description:
    "A practical guide to choosing a university in Türkiye, preparing your documents, planning costs, and asking the right questions.",
  alternates: { canonical: "/guide" },
};

const decisions = [
  [
    "01",
    "The right course",
    "Begin with what you want to learn.",
    "Compare the actual curriculum, teaching language, entry criteria, and how the qualification fits your plans. A university name alone does not tell you whether a course is right for you.",
  ],
  [
    "02",
    "The right place",
    "Your city is part of your education.",
    "Think about transport, accommodation, the size of the city, and the environment in which you learn best. Explore more than one location before you make a shortlist.",
  ],
  [
    "03",
    "The complete picture",
    "Plan beyond the tuition fee.",
    "Prepare a budget for the full year. Ask the university for its current tuition schedule and identify the separate costs of housing, food, travel, insurance, and preparing documents.",
  ],
];

export default function StudyGuide() {
  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="horizon-guide"
        lang="en"
        dir="ltr"
        tabIndex={-1}
      >
        <section className="guide-hero">
          <div className="container guide-hero-grid">
            <div>
              <Link href="/" className="guide-breadcrumb">
                Home <span>/</span> Study guide
              </Link>
              <EnglishContentNotice />
              <span className="section-label">Before the application</span>
              <h1>
                A little clarity.
                <br />
                <em>A big beginning.</em>
              </h1>
              <p>
                You don’t need every answer today. Start with the right
                questions, a practical checklist, and a plan you can build on.
              </p>
              <a
                href="#preparation"
                className="button button-primary button-large"
              >
                Build your preparation list <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="guide-hero-image">
              <Image
                src="/images/classroom-optimized.webp"
                alt="Students discussing their work at a table"
                fill
                unoptimized
                priority
                sizes="(max-width: 900px) 100vw, 45vw"
              />
              <div>
                <span>The next chapter</span>
                <strong>Starts with you.</strong>
              </div>
            </div>
          </div>
        </section>
        <section className="guide-decisions">
          <div className="container">
            <div className="guide-section-heading">
              <span className="section-label">Three decisions that matter</span>
              <h2>Choose with purpose.</h2>
            </div>
            <div className="guide-decision-grid">
              {decisions.map(([number, label, title, detail]) => (
                <article key={number}>
                  <span className="guide-decision-number">{number}</span>
                  <span className="section-label">{label}</span>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="guide-preparation" id="preparation">
          <div className="container guide-preparation-grid">
            <div className="guide-preparation-copy">
              <span className="section-label">One step at a time</span>
              <h2>
                Make the next step
                <br />
                <em>feel manageable.</em>
              </h2>
              <p>
                Use this list to prepare for your first conversation with an
                advisor. It is a planning aid; your university’s official
                checklist determines what you must submit.
              </p>
              <Link href="/universities" className="premium-text-link">
                Start with the university directory{" "}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <PreparationChecklist />
          </div>
        </section>
        <section className="guide-resources">
          <div className="container">
            <div className="guide-section-heading">
              <span className="section-label">Know where to look</span>
              <h2>
                Good decisions start
                <br />
                with reliable information.
              </h2>
              <p>
                Requirements vary by university and program. Always confirm the
                current criteria and dates at the official source.
              </p>
            </div>
            <div className="guide-resource-grid">
              <a
                href="https://stokholm.meb.gov.tr/www/apply-in-5-steps/icerik/55"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>01 / Application overview</span>
                <h3>
                  Understand the process <i aria-hidden="true">↗</i>
                </h3>
                <p>
                  An introduction to applying, choosing a program, and checking
                  the documents your university requires.
                </p>
                <strong>
                  Republic of Türkiye · Ministry of National Education
                </strong>
              </a>
              <a
                href="https://osym.gov.tr/SinavGrubu/Index/13"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>02 / Exam information</span>
                <h3>
                  Check TR-YÖS guidance <i aria-hidden="true">↗</i>
                </h3>
                <p>
                  Current exam announcements, guides, and application
                  information from the official examination authority.
                </p>
                <strong>ÖSYM · Official examination authority</strong>
              </a>
              <Link href="/universities">
                <span>03 / University requirements</span>
                <h3>
                  Go straight to the source <i aria-hidden="true">↗</i>
                </h3>
                <p>
                  Find official university and international admissions links in
                  every profile in our directory.
                </p>
                <strong>Explore the university directory</strong>
              </Link>
            </div>
            <div className="guide-boundary">
              <strong>Our role, clearly.</strong>
              <p>
                Horizon supports your planning and application preparation. The
                university makes admission decisions. Any service fees, scope of
                support, and third-party costs should be clear to you before you
                proceed.
              </p>
              <Link href="/terms">
                Read our terms <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
