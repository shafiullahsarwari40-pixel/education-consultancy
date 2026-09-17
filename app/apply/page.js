"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ApplicationForm from "../../components/ApplicationForm";
import { supabase } from "../../lib/supabaseClient";
import "../student-experience.css";

export default function ApplyPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [error, setError] = useState("");
  const [returnTo, setReturnTo] = useState("/apply");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setReturnTo(`/apply${window.location.search}`);
    async function checkAccess() {
      setLoading(true);
      setError("");
      try {
        if (!supabase)
          throw new Error(
            "Student applications are temporarily unavailable. Please contact our admissions team.",
          );
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const currentSession = data?.session || null;
        if (!active) return;
        setSession(currentSession);
        if (!currentSession) return;
        const response = await fetch("/api/student/check-application", {
          headers: { Authorization: `Bearer ${currentSession.access_token}` },
          signal: controller.signal,
        });
        if (response.status === 401) {
          setSession(null);
          return;
        }
        if (!response.ok)
          throw new Error(
            "We could not check your application status. Please try again before starting a new application.",
          );
        const result = await response.json();
        if (active) setHasExistingApplication(Boolean(result.hasApplication));
      } catch (err) {
        if (active && err.name !== "AbortError")
          setError(err.message || "We could not connect. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }
    checkAccess();
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  async function handleSignOut() {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      router.push("/");
    } catch {
      setError("We could not sign you out. Please try again.");
    }
  }

  return (
    <main id="main-content" className="student-experience" lang="en" dir="ltr">
      <header className="student-topbar">
        <Link href="/" className="student-brand" aria-label="Horizon home">
          Horizon<span>EDUCATIONAL CONSULTANCY</span>
        </Link>
        {session ? (
          <div className="student-account">
            {session.user.email}
            <button type="button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <Link href="/#contact" className="student-help-link">
            Need a hand? <span>Talk to us ↗</span>
          </Link>
        )}
      </header>
      <div className="student-content">
        {loading ? (
          <div className="student-loading" role="status">
            <span className="student-spinner" />
            Preparing your application space…
          </div>
        ) : error ? (
          <section className="student-state-card">
            <span className="student-eyebrow">LET’S GET YOU BACK ON TRACK</span>
            <h1>We could not connect.</h1>
            <p role="alert">{error}</p>
            <div className="student-action-row">
              <button
                className="student-primary"
                onClick={() => setAttempt(attempt + 1)}
              >
                Try again ↗
              </button>
              <Link href="/#contact" className="student-secondary">
                Contact admissions
              </Link>
            </div>
          </section>
        ) : !session ? (
          <>
            <div className="student-entry-layout">
              <section className="student-page-heading">
                <span className="student-eyebrow">
                  YOUR UNIVERSITY APPLICATION
                </span>
                <h1>
                  A new beginning.
                  <br />
                  <em>A clear first step.</em>
                </h1>
                <p>
                  Create your student account to tell us about your goals, share
                  your documents, and begin your university application with
                  Horizon.
                </p>
                <div className="student-action-row">
                  <Link
                    href={`/student/signup?redirect=${encodeURIComponent(returnTo)}`}
                    className="student-primary"
                  >
                    Create my account <span aria-hidden="true">↗</span>
                  </Link>
                  <Link
                    href={`/student/auth?redirect=${encodeURIComponent(returnTo)}`}
                    className="student-secondary"
                  >
                    I already have an account
                  </Link>
                </div>
                <p className="student-entry-footnote">
                  Have a university in mind? Your selection will carry through
                  after sign-in.
                </p>
              </section>
              <aside className="student-entry-card" aria-label="Application preparation">
                <span className="student-eyebrow">
                  A LITTLE PREPARATION GOES A LONG WAY
                </span>
                <h2>Here is what to have ready.</h2>
                <ol className="student-checklist">
                  <li>
                    <span>01</span>
                    <div>
                      <strong>Your personal details</strong>
                      <p>
                        Your name as it appears on your documents, email, and
                        phone number.
                      </p>
                    </div>
                  </li>
                  <li>
                    <span>02</span>
                    <div>
                      <strong>Your study preferences</strong>
                      <p>
                        Your preferred degree and university. Still deciding? We
                        can help you explore.
                      </p>
                    </div>
                  </li>
                  <li>
                    <span>03</span>
                    <div>
                      <strong>Your available documents</strong>
                      <p>
                        Clear copies of your passport, academic records, and any
                        relevant certificates.
                      </p>
                    </div>
                  </li>
                </ol>
                <p className="student-entry-footnote">
                  Document requirements vary by university and program. Our team
                  will advise on what is needed.
                </p>
              </aside>
            </div>
            <aside className="student-support-strip" aria-label="Admissions support">
              <div>
                <strong>Still exploring your options?</strong>
                <p>Start with a conversation about your goals.</p>
              </div>
              <Link href="/#contact">Speak with an advisor ↗</Link>
            </aside>
          </>
        ) : hasExistingApplication ? (
          <section className="student-state-card">
            <span className="student-state-symbol" aria-hidden="true">
              ✓
            </span>
            <span className="student-eyebrow">YOUR JOURNEY IS UNDER WAY</span>
            <h1>Your application is already with us.</h1>
            <p>
              View your latest status, read updates from our team, and access
              your acceptance letter when it becomes available.
            </p>
            <div className="student-action-row">
              <Link href="/student/result" className="student-primary">
                View my application <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/#contact" className="student-secondary">
                Contact my advisor
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="student-page-heading">
              <span className="student-eyebrow">MAKE YOUR NEXT MOVE</span>
              <h1>
                Tell us where
                <br />
                <em>you want to go.</em>
              </h1>
              <p>
                Complete the steps below. You can review everything before
                sending your application to our admissions team.
              </p>
            </section>
            <div className="student-application-layout">
              <ApplicationForm session={session} />
              <aside className="student-application-aside">
                <span className="student-eyebrow">WITH YOU AT EVERY STEP</span>
                <h2>A thoughtful application starts with you.</h2>
                <p>
                  Use the details shown on your official documents. Your
                  preferences help us understand the right direction for your
                  application.
                </p>
                <ul>
                  <li>Review your information before sending.</li>
                  <li>Upload clear, readable copies.</li>
                  <li>Keep this page open until submission completes.</li>
                </ul>
                <p>
                  Your progress is kept while you move between these steps.
                  Refreshing or leaving this page will clear it.
                </p>
                <Link href="/#contact" target="_blank">
                  Need help? Contact admissions ↗
                </Link>
              </aside>
            </div>
          </>
        )}
      </div>
      <footer className="student-page-footer">
        <span>Horizon Educational Consultancy</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/">Back to website ↗</Link>
        </div>
      </footer>
    </main>
  );
}
