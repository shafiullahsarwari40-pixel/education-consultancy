"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import {
  getSafeAuthCallbackRedirect,
  getStudentSignInDestination,
} from "../../../lib/studentRedirects.mjs";
import "../../student-experience.css";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeAuthCallbackRedirect(searchParams.get("returnTo"));
  const code = searchParams.get("code");
  const callbackError =
    searchParams.get("error_description") || searchParams.get("error");
  const [error, setError] = useState("");
  const completion = useRef(null);

  useEffect(() => {
    let active = true;
    if (!completion.current) {
      completion.current = (async () => {
        if (!supabase)
          throw new Error(
            "Sign-in is temporarily unavailable. Please contact admissions.",
          );
        const hash = new URLSearchParams(window.location.hash.slice(1));
        if (callbackError || hash.get("error"))
          throw new Error(
            "This sign-in link has expired or could not be verified. Please try signing in again.",
          );
        // The browser client consumes implicit-flow tokens from the URL. Awaiting
        // getSession waits for that initialization before checking the session.
        let { data, error: sessionError } = await supabase.auth.getSession();
        if (!data?.session && code) {
          const exchange = await supabase.auth.exchangeCodeForSession(code);
          data = exchange.data;
          sessionError = exchange.error;
        }
        if (sessionError || !data?.session)
          throw new Error(
            "We could not complete sign-in. The link may have expired. Please sign in again or contact admissions.",
          );
      })();
    }
    completion.current
      .then(() => {
        if (active) {
          router.replace(returnTo);
        }
      })
      .catch((err) => {
        if (active)
          setError(
            err.message || "We could not complete sign-in. Please try again.",
          );
      });
    return () => {
      active = false;
    };
  }, [router, returnTo, code, callbackError]);

  return (
    <main className="student-experience">
      <header className="student-topbar">
        <Link href="/" className="student-brand">
          Horizon<span>EDUCATIONAL CONSULTANCY</span>
        </Link>
      </header>
      <div className="student-content">
        <section className="student-state-card">
          {error ? (
            <>
              <span className="student-eyebrow">STUDENT SIGN-IN</span>
              <h1>Let’s try that again.</h1>
              <p role="alert">{error}</p>
              <Link
                href={`/student/auth?redirect=${encodeURIComponent(getStudentSignInDestination(returnTo))}`}
                className="student-primary"
              >
                Return to sign in ↗
              </Link>
            </>
          ) : (
            <div className="student-loading" role="status">
              <span className="student-spinner" />
              Completing your sign-in…
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <main className="student-experience student-loading" role="status">
          Completing your sign-in…
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
