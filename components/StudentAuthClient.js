"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";
import { supabase } from "../lib/supabaseClient";
import {
  buildStudentRecoveryPath,
  getSafeStudentRedirect,
} from "../lib/studentRedirects.mjs";
import "../app/student-experience.css";

export default function StudentAuthClient({ initialMode = "login" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = getSafeStudentRedirect(searchParams.get("redirect"));
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [isResetRequest, setIsResetRequest] = useState(false);
  const isRecovery = searchParams.get("mode") === "recovery";
  const [canRecover, setCanRecover] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      if (!supabase) {
        if (active) {
          setMessage({
            type: "error",
            text: "Student sign-in is temporarily unavailable. Please contact our admissions team for help.",
          });
          setCheckingSession(false);
        }
        return;
      }
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (active && isRecovery) {
          setCanRecover(Boolean(data?.session));
          if (!data?.session)
            setMessage({
              type: "error",
              text: "This password-reset link has expired or could not be verified. Request a new link to continue.",
            });
        } else if (active && data?.session) router.replace(redirect);
      } catch {
        if (active)
          setMessage({
            type: "error",
            text: "We could not check your session. You can try signing in below.",
          });
      } finally {
        if (active) setCheckingSession(false);
      }
    }
    checkSession();
    return () => {
      active = false;
    };
  }, [router, redirect, isRecovery]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading || !supabase) return;
    setLoading(true);
    setMessage(null);
    try {
      if (isRecovery) {
        if (!canRecover)
          throw new Error("Please request a new password-reset link.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPasswordUpdated(true);
        setPassword("");
        setMessage({
          type: "success",
          text: "Your password has been updated. You can continue where you left off.",
        });
        return;
      }
      if (isResetRequest) {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(buildStudentRecoveryPath(redirect))}`,
          },
        );
        if (error) throw error;
        setMessage({
          type: "success",
          text: "If an account exists for this email, you will receive a password-reset link. Check your inbox and spam folder.",
        });
        return;
      }
      const credentials = { email: email.trim(), password };
      const result = isSignUp
        ? await supabase.auth.signUp({
            ...credentials,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(redirect)}`,
            },
          })
        : await supabase.auth.signInWithPassword(credentials);
      if (result.error) throw result.error;
      if (result.data?.session) {
        router.replace(redirect);
        return;
      }
      if (isSignUp && result.data?.user) {
        setMessage({
          type: "success",
          text: "Check your inbox for the next step. If email confirmation is required, follow the link before signing in. Already registered? Sign in with your existing password.",
        });
        setPassword("");
      } else {
        setMessage({
          type: "error",
          text: "We could not complete sign-in. Please try again.",
        });
      }
    } catch (error) {
      const text = /rate limit|too many requests/i.test(error?.message || "")
        ? "Too many attempts. Please wait a little before trying again, or contact admissions for help."
        : error?.message ||
          "We could not connect. Check your connection and try again.";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="student-experience student-auth">
      <header className="student-topbar">
        <Link className="student-brand" href="/" aria-label="Horizon home">
          Horizon<span>EDUCATIONAL CONSULTANCY</span>
        </Link>
        <Link href="/#contact" className="student-help-link">
          Need a hand? <span>Talk to us ↗</span>
        </Link>
      </header>
      <div className="student-auth-layout">
        <section className="student-auth-story">
          <span className="student-eyebrow">YOUR NEXT CHAPTER</span>
          <h1>
            A world of possibility.
            <br />
            <em>One place to begin.</em>
          </h1>
          <p>
            Your university journey, with a team beside you and a clear view of
            what comes next.
          </p>
          <ol className="student-benefits">
            <li>
              <span>01</span>
              <div>
                <strong>Build your application</strong>
                <p>Share your goals and documents in one place.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Follow every step</strong>
                <p>See your application status as our team updates it.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Get ready for what is next</strong>
                <p>Access your decision and available acceptance letter.</p>
              </div>
            </li>
          </ol>
          <div className="student-story-note">
            <span aria-hidden="true">✦</span> Based in Istanbul. Here for your
            future.
          </div>
        </section>
        <section className="student-auth-card" aria-labelledby="auth-heading">
          {!isRecovery && (
            <div
              className="student-auth-tabs"
              role="group"
              aria-label="Account options"
            >
              <button
                type="button"
                aria-pressed={!isSignUp}
                className={!isSignUp ? "active" : ""}
                disabled={loading}
                onClick={() => {
                  setIsSignUp(false);
                  setIsResetRequest(false);
                  setMessage(null);
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                aria-pressed={isSignUp}
                className={isSignUp ? "active" : ""}
                disabled={loading}
                onClick={() => {
                  setIsSignUp(true);
                  setIsResetRequest(false);
                  setMessage(null);
                }}
              >
                Create account
              </button>
            </div>
          )}
          <span className="student-eyebrow">STUDENT PORTAL</span>
          <h2 id="auth-heading">
            {isRecovery
              ? "A fresh start."
              : isResetRequest
                ? "Let’s get you back in."
                : isSignUp
                  ? "Your future starts here."
                  : "Welcome back."}
          </h2>
          <p className="student-auth-intro">
            {isRecovery
              ? "Choose a new, unique password for your account."
              : isResetRequest
                ? "Enter your student email to request a password-reset link."
                : isSignUp
                  ? "Create your account to begin your application."
                  : "Sign in to continue your university journey."}
          </p>
          {checkingSession ? (
            <div className="student-loading" role="status">
              <span className="student-spinner" />
              Checking your student session…
            </div>
          ) : (
            <form
              className="student-auth-form"
              onSubmit={handleSubmit}
              aria-busy={loading}
            >
              {!isRecovery && (
                <label htmlFor="student-email">
                  {t("auth.email")}
                  <input
                    id="student-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    maxLength={254}
                    value={email}
                    disabled={loading}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
              )}
              {!isResetRequest && !passwordUpdated && (
                <label htmlFor="student-password">
                  {t("auth.password")}
                  <span className="student-password-field">
                    <input
                      id="student-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        isSignUp || isRecovery
                          ? "new-password"
                          : "current-password"
                      }
                      required
                      minLength={isSignUp || isRecovery ? 8 : undefined}
                      value={password}
                      disabled={loading || (isRecovery && !canRecover)}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-describedby={
                        isSignUp || isRecovery ? "password-hint" : undefined
                      }
                      placeholder={
                        isSignUp || isRecovery
                          ? "Create a strong password"
                          : "Enter your password"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </span>
                </label>
              )}
              {(isSignUp || isRecovery) && !passwordUpdated && (
                <p id="password-hint" className="student-field-hint">
                  Use at least 8 characters. A longer, unique password is
                  better.
                </p>
              )}
              {isSignUp && !isRecovery && (
                <label className="student-consent">
                  <input type="checkbox" required disabled={loading} />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" target="_blank">
                      terms of service
                    </Link>{" "}
                    and have read the{" "}
                    <Link href="/privacy" target="_blank">
                      privacy policy
                    </Link>
                    .
                  </span>
                </label>
              )}
              {!isSignUp && !isRecovery && !isResetRequest && (
                <button
                  className="student-forgot-password"
                  type="button"
                  onClick={() => {
                    setIsResetRequest(true);
                    setMessage(null);
                  }}
                >
                  Forgot your password?
                </button>
              )}
              {message && (
                <div
                  className={`student-notice ${message.type}`}
                  role={message.type === "error" ? "alert" : "status"}
                >
                  {message.text}
                </div>
              )}
              {passwordUpdated ? (
                <Link href={redirect} className="student-primary">
                  {redirect.startsWith("/apply")
                    ? "Continue to my application ↗"
                    : "Continue to my portal ↗"}
                </Link>
              ) : (
                <button
                  type="submit"
                  className="student-primary"
                  disabled={loading || !supabase || (isRecovery && !canRecover)}
                >
                  {loading ? (
                    <>
                      <span className="student-spinner" />
                      {t("auth.processing")}
                    </>
                  ) : (
                    <>
                      {isRecovery
                        ? "Save new password"
                        : isResetRequest
                          ? "Send reset link"
                          : isSignUp
                            ? "Create my account"
                            : "Sign in"}
                      <span aria-hidden="true">↗</span>
                    </>
                  )}
                </button>
              )}
              {isRecovery && !canRecover && (
                <Link
                  href={`/student/auth?redirect=${encodeURIComponent(redirect)}`}
                  className="student-secondary"
                >
                  Return to sign in
                </Link>
              )}
            </form>
          )}
          <p className="student-auth-support">
            Having trouble signing in?{" "}
            <Link href="/#contact">Contact admissions</Link>
          </p>
          <div className="student-auth-bottom">
            <span aria-hidden="true">◇</span> Your application. Your next
            chapter.
          </div>
        </section>
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
