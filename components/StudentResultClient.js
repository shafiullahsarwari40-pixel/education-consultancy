"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import "../app/student-experience.css";

const STEPS = [
  {
    value: "submitted",
    label: "Application received",
    description: "Your details are with our admissions team.",
  },
  {
    value: "evaluating",
    label: "Under review",
    description: "Your application is being assessed.",
  },
  {
    value: "accepted",
    label: "University decision",
    description: "Your decision and next steps appear here.",
  },
];
const STATUS_LABELS = {
  submitted: "Application received",
  evaluating: "Under review",
  accepted: "Accepted",
  accepted_pending_letter: "Accepted · letter pending",
  rejected: "Decision available",
};
const STATUS_MESSAGES = {
  submitted:
    "We have received your application. Our team will review your details and advise if further information is needed.",
  evaluating:
    "Your application is under review. Contact admissions if your contact details or circumstances have changed.",
  accepted:
    "Your application has been accepted. Review your acceptance letter and speak to our team about the next steps.",
  accepted_pending_letter:
    "Your application has been accepted. Your acceptance letter is being prepared and will appear here when available.",
  rejected:
    "This application has not been accepted. Our team can help you understand the decision and discuss other options.",
};
const DOCUMENT_LABELS = {
  passport: "Passport",
  transcript: "Academic transcript",
  diploma: "Diploma",
  exam_sheet: "Exam results",
  id_card: "National ID / Tazkira",
  photo: "Personal photograph",
};
function dateLabel(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export default function StudentResultClient() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState("");
  const [documentError, setDocumentError] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (!supabase)
          throw new Error(
            "Your student portal is temporarily unavailable. Please contact admissions for an update.",
          );
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!active) return;
        setSession(data?.session || null);
        if (!data?.session) return;
        const response = await fetch("/api/student/application", {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
          signal: controller.signal,
          cache: "no-store",
        });
        if (response.status === 401) {
          setSession(null);
          return;
        }
        if (!response.ok)
          throw new Error(
            "We could not load your application. Please try again, or contact admissions for an update.",
          );
        const result = await response.json();
        if (active) {
          setApplication(result.application || null);
          setDocuments(
            Array.isArray(result.documents)
              ? result.documents.filter((type) =>
                  Object.hasOwn(DOCUMENT_LABELS, type),
                )
              : [],
          );
        }
      } catch (err) {
        if (active && err.name !== "AbortError")
          setError(err.message || "We could not connect. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
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

  async function downloadLetter() {
    if (downloading) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data?.session)
        throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch("/api/student/acceptance-letter", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      if (!response.ok)
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : "We could not download your letter. Please try again or contact admissions.",
        );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "horizon-acceptance-letter.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setDownloadError(err.message || "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function downloadDocument(type) {
    if (activeDocument) return;
    setActiveDocument(type);
    setDocumentError("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data?.session)
        throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(
        `/api/student/document?type=${encodeURIComponent(type)}`,
        { headers: { Authorization: `Bearer ${data.session.access_token}` } },
      );
      if (!response.ok)
        throw new Error(
          "We could not download this document. Please try again or contact admissions.",
        );
      const blob = await response.blob();
      const extension =
        {
          "application/pdf": "pdf",
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "image/gif": "gif",
        }[blob.type] || "bin";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `horizon-${type}.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setDocumentError(err.message || "Download failed. Please try again.");
    } finally {
      setActiveDocument("");
    }
  }

  const status = application?.application_status || "submitted";
  const isAccepted =
    status === "accepted" || status === "accepted_pending_letter";
  const currentStep =
    isAccepted || status === "rejected"
      ? 2
      : STEPS.findIndex((item) => item.value === status);
  const statusLabel = STATUS_LABELS[status] || "Update available";
  const hasLetter =
    application?.acceptance_letter_path || application?.acceptance_letter_url;

  return (
    <main id="main-content" className="student-experience">
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
            Preparing your application timeline…
          </div>
        ) : error ? (
          <section className="student-state-card">
            <span className="student-eyebrow">YOUR APPLICATION</span>
            <h1>Let’s reconnect.</h1>
            <p role="alert">{error}</p>
            <div className="student-action-row">
              <button
                type="button"
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
          <div className="student-entry-layout">
            <section className="student-page-heading">
              <span className="student-eyebrow">YOUR STUDENT PORTAL</span>
              <h1>
                Every step forward.
                <br />
                <em>All in one place.</em>
              </h1>
              <p>
                Sign in to view your university application, read the latest
                updates, and download your acceptance letter when it is
                available.
              </p>
              <div className="student-action-row">
                <Link
                  href="/student/auth?redirect=/student/result"
                  className="student-primary"
                >
                  Sign in to view my status <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/apply" className="student-secondary">
                  Start an application
                </Link>
              </div>
            </section>
            <aside className="student-entry-card">
              <span className="student-eyebrow">CLARITY AT EVERY STAGE</span>
              <h2>Your journey, connected.</h2>
              <ol className="student-checklist">
                {STEPS.map((item, index) => (
                  <li key={item.value}>
                    <span>0{index + 1}</span>
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="student-entry-footnote">
                Your timeline reflects updates recorded by the Horizon
                admissions team.
              </p>
            </aside>
          </div>
        ) : !application ? (
          <section className="student-state-card">
            <span className="student-state-symbol" aria-hidden="true">
              ↗
            </span>
            <span className="student-eyebrow">A NEW CHAPTER AWAITS</span>
            <h1>
              Your journey starts
              <br />
              <em>with an application.</em>
            </h1>
            <p>
              There is no application linked to this account yet. Begin with
              your details and study preferences, then review everything before
              sending.
            </p>
            <div className="student-action-row">
              <Link href="/apply" className="student-primary">
                Start my application <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <p className="student-entry-footnote">
              Already applied using a different email? Contact admissions so we
              can help you find it.
            </p>
          </section>
        ) : (
          <>
            <section className="student-result-banner">
              <div>
                <span className="student-eyebrow">YOUR UNIVERSITY JOURNEY</span>
                <h1>
                  Welcome, {application.full_name?.split(" ")[0] || "student"}.
                </h1>
                <p>
                  Submitted {dateLabel(application.created_at)} · Your next
                  chapter is taking shape.
                </p>
              </div>
              <span className="student-status-badge">{statusLabel}</span>
            </section>
            <div className="student-result-refresh">
              <span>
                Latest recorded update:{" "}
                {dateLabel(
                  application.status_updated_at || application.created_at,
                )}
              </span>
              <button type="button" onClick={() => setAttempt(attempt + 1)}>
                Refresh status ↻
              </button>
            </div>
            <div className="student-result-grid">
              <div>
                <section className="student-panel">
                  <h2>Your application timeline</h2>
                  <ol className="student-timeline">
                    {STEPS.map((item, index) => (
                      <li
                        key={item.value}
                        className={
                          index === currentStep
                            ? "current"
                            : index < currentStep
                              ? "complete"
                              : ""
                        }
                        aria-current={
                          index === currentStep ? "step" : undefined
                        }
                      >
                        <span aria-hidden="true">
                          {index < currentStep ? "✓" : index + 1}
                        </span>
                        <div>
                          <strong>
                            {index === 2 && status === "rejected"
                              ? "Decision available"
                              : item.label}
                          </strong>
                          <p>
                            {index === currentStep
                              ? "Current stage"
                              : index < currentStep
                                ? "Completed"
                                : "Upcoming"}{" "}
                            · {item.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
                <section className="student-panel">
                  <span className="student-eyebrow">WHAT HAPPENS NEXT</span>
                  <h2>{statusLabel}</h2>
                  <p className="student-panel-note">
                    {(status === "rejected" && application.rejection_message) ||
                      application.admin_note ||
                      STATUS_MESSAGES[status] ||
                      "Our team has updated your application. Contact admissions to discuss the details."}
                  </p>
                  <Link href="/#contact" className="student-secondary">
                    Speak with my advisor ↗
                  </Link>
                </section>
              </div>
              <div>
                <section className="student-panel">
                  <h2>Your application at a glance</h2>
                  <dl className="student-definition single">
                    {[
                      ["Full name", application.full_name],
                      ["Email", application.email],
                      [
                        "University",
                        application.university ||
                          "To discuss with your advisor",
                      ],
                      [
                        "Degree",
                        application.program || "To discuss with your advisor",
                      ],
                      ["Phone", application.phone],
                      ["Country", application.country || "Not provided"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
                {isAccepted && (
                  <section className="student-panel">
                    <span className="student-eyebrow">YOUR NEXT CHAPTER</span>
                    <h2>Acceptance letter</h2>
                    {hasLetter ? (
                      <>
                        <p className="student-panel-note">
                          Keep a copy of your letter and review its conditions
                          with your advisor.
                        </p>
                        <button
                          type="button"
                          className="student-primary"
                          onClick={downloadLetter}
                          disabled={downloading}
                        >
                          {downloading
                            ? "Preparing download…"
                            : "Download my letter ↓"}
                        </button>
                      </>
                    ) : (
                      <p className="student-panel-note">
                        Your letter is not available yet. Please check back or
                        contact admissions for an update.
                      </p>
                    )}
                    {downloadError && (
                      <p className="student-notice error" role="alert">
                        {downloadError}
                      </p>
                    )}
                  </section>
                )}
              </div>
            </div>
            {documents.length > 0 && (
              <section className="student-panel">
                <span className="student-eyebrow">
                  YOUR SUPPORTING DOCUMENTS
                </span>
                <h2>Everything you have shared.</h2>
                <div className="student-saved-documents">
                  {documents.map((type) => (
                    <button
                      type="button"
                      className="student-secondary"
                      key={type}
                      disabled={Boolean(activeDocument)}
                      onClick={() => downloadDocument(type)}
                    >
                      {activeDocument === type
                        ? "Preparing download…"
                        : DOCUMENT_LABELS[type]}{" "}
                      <span aria-hidden="true">↓</span>
                    </button>
                  ))}
                </div>
                {documentError && (
                  <p className="student-notice error" role="alert">
                    {documentError}
                  </p>
                )}
              </section>
            )}
            <aside className="student-support-strip">
              <div>
                <strong>A question about your application?</strong>
                <p>Your admissions team is here to help.</p>
              </div>
              <Link href="/#contact">Get in touch ↗</Link>
            </aside>
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
