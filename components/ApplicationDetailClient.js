"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import "../app/student-experience.css";

export default function ApplicationDetailClient({ id }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [application, setApplication] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionError, setActionError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadingLetter, setUploadingLetter] = useState(false);
  const [letterUploadError, setLetterUploadError] = useState("");
  const [letterUploadSuccess, setLetterUploadSuccess] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [letterFile, setLetterFile] = useState(null);
  const letterInput = useRef(null);

  useEffect(() => {
    if (!supabase) {
      setErrorMsg(
        "Supabase client is not configured. Check the public Supabase URL and publishable key.",
      );
      setLoading(false);
      return;
    }

    if (!id) {
      setErrorMsg("No ID provided to component");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const s = data?.session ?? null;
        if (!s) {
          router.push("/admin/login");
          return;
        }

        // Verify user has admin role
        const verifyRes = await fetch("/api/admin/applications", {
          headers: { Authorization: `Bearer ${s.access_token}` },
        });
        if (verifyRes.status === 403) {
          await supabase.auth.signOut();
          setErrorMsg("Access denied: You do not have admin permissions.");
          router.push("/admin/login");
          return;
        }

        setSession(s);
        setErrorMsg(null);
        await fetchDetail(s.access_token);
      } catch {
        setErrorMsg(
          "We could not load this application. Please check your connection and try again.",
        );
        setLoading(false);
      }
    })();
  }, [id, router]);

  async function fetchDetail(token) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }
        const body = await res.json().catch(() => ({ error: "Unknown error" }));
        const msg = body?.error || `Request failed (${res.status})`;
        console.error("Failed to fetch application detail", msg);
        setErrorMsg(msg);
        setLoading(false);
        return;
      }
      const body = await res.json();
      setApplication(body.application);
      setDocuments(body.documents);
      setAdminNote(body.application?.admin_note || "");
    } catch (err) {
      console.error("Fetch detail error", err);
      setErrorMsg(err.message || "Fetch error");
    } finally {
      setLoading(false);
    }
  }

  async function openDocument(docUrl) {
    if (!session) return;
    setActionError("");
    try {
      const targetUrl = docUrl.startsWith("/api/admin/document")
        ? docUrl
        : `/api/admin/document?publicUrl=${encodeURIComponent(docUrl)}`;

      const res = await fetch(targetUrl, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Document fetch failed", err);
        setActionError(
          err.error || "Failed to download document. Please try again.",
        );
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition") || "";
      let filename = "document.pdf";
      const filenameMatch = contentDisposition.match(/filename\*?=([^;]+)/i);
      if (filenameMatch) {
        filename = filenameMatch[1].trim().replace(/(^"|"$)/g, "");
      } else {
        const urlFilename = targetUrl.split("?")[0].split("/").pop();
        if (urlFilename) filename = urlFilename;
      }

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download document error", err);
      setActionError("Unable to download document. Please try again.");
    }
  }

  async function updateStatus(newStatus) {
    if (!session) return;
    setStatusUpdating(true);
    setActionError("");
    setStatusMessage("");
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.replace("/admin/login");
          return;
        }
        throw new Error(
          body.error || "The status could not be saved. Please try again.",
        );
      }
      setApplication(body.application);
      setStatusMessage("Application status updated.");
    } catch (err) {
      setActionError(
        err.message ||
          "We could not connect. Your change has not been confirmed.",
      );
    } finally {
      setStatusUpdating(false);
    }
  }

  async function uploadAcceptanceLetter() {
    if (!session) return;
    setLetterUploadError("");
    setLetterUploadSuccess("");

    if (!letterFile) {
      setLetterUploadError("Please select a PDF file to upload.");
      return;
    }

    if (!letterFile.type.includes("pdf")) {
      setLetterUploadError(
        "Only PDF files are allowed for acceptance letters.",
      );
      return;
    }

    if (letterFile.size > 4 * 1024 * 1024) {
      setLetterUploadError(
        "The acceptance letter file must be 4 MB or smaller.",
      );
      return;
    }

    setUploadingLetter(true);
    try {
      const formData = new FormData();
      formData.append("file", letterFile);
      formData.append("status", "accepted");
      formData.append("admin_note", adminNote || "");

      const res = await fetch(`/api/admin/applications/${id}/letter`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }
        throw new Error(result?.error || "Failed to upload acceptance letter.");
      }

      setApplication(result.application || application);
      setLetterUploadSuccess("Acceptance letter uploaded successfully.");
      setLetterFile(null);
      if (letterInput.current) letterInput.current.value = "";
    } catch (err) {
      console.error("Letter upload failed", err);
      setLetterUploadError(err?.message || "Upload failed.");
    } finally {
      setUploadingLetter(false);
    }
  }

  function handleLetterFileChange(event) {
    setLetterUploadError("");
    setLetterUploadSuccess("");
    const file = event.target.files?.[0] || null;
    setLetterFile(file);
  }

  if (loading)
    return (
      <div className="student-experience student-loading" role="status">
        <span className="student-spinner" />
        Loading application details…
      </div>
    );
  if (errorMsg)
    return (
      <div className="student-experience">
        <section className="student-state-card">
          <h1>Unable to load application.</h1>
          <p role="alert">{errorMsg}</p>
          <Link href="/admin" className="student-secondary">
            Back to applications
          </Link>
        </section>
      </div>
    );
  if (!application)
    return (
      <div className="student-experience">
        <section className="student-state-card">
          <h1>Application not found.</h1>
          <Link href="/admin" className="student-secondary">
            Back to applications
          </Link>
        </section>
      </div>
    );

  return (
    <div className="student-experience student-admin-detail">
      <Link href="/admin" className="student-admin-back">
        ← Back to applications
      </Link>
      <span className="student-eyebrow">APPLICATION REVIEW</span>
      <h2>{application.full_name}</h2>
      {actionError && (
        <div className="student-notice error" role="alert">
          {actionError}
        </div>
      )}
      {statusMessage && (
        <div className="student-notice success" role="status">
          {statusMessage}
        </div>
      )}
      <p>
        <strong>Email:</strong> {application.email}
      </p>
      <p>
        <strong>Phone:</strong> {application.phone}
      </p>
      <p>
        <strong>Country:</strong> {application.country}
      </p>
      <p>
        <strong>University:</strong> {application.university}
      </p>
      <p>
        <strong>Program:</strong> {application.program}
      </p>
      <p>
        <strong>Mother Name:</strong> {application.mother_name || "—"}
      </p>
      <p>
        <strong>Father Name:</strong> {application.father_name || "—"}
      </p>
      <p>
        <strong>Address:</strong> {application.address || "—"}
      </p>
      <p>
        <strong>Notes:</strong> {application.message}
      </p>
      <p>
        <strong>Submitted:</strong>{" "}
        {new Date(application.created_at).toLocaleString()}
      </p>

      <section style={{ marginTop: 16 }}>
        <div>
          <strong>Status:</strong>
        </div>
        <div
          style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}
        >
          {["submitted", "evaluating", "accepted", "rejected"].map((s) => (
            <button
              key={s}
              type="button"
              className={
                application.application_status === s
                  ? "student-primary"
                  : "student-secondary"
              }
              onClick={() => updateStatus(s)}
              disabled={statusUpdating || application.application_status === s}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section
        style={{
          marginTop: 20,
          padding: "1rem",
          borderRadius: 14,
          background: "#f9fbff",
          border: "1px solid #e3e9f6",
        }}
      >
        <h3>Acceptance Letter</h3>
        {application.acceptance_letter_url ? (
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: 0 }}>
              An acceptance letter has already been uploaded for this
              application.
            </p>
            <button
              type="button"
              onClick={() => openDocument(application.acceptance_letter_url)}
              className="button button-secondary"
              style={{ marginTop: 10 }}
            >
              Download Acceptance Letter
            </button>
          </div>
        ) : (
          <p style={{ marginBottom: 12 }}>
            Upload the student&apos;s acceptance letter PDF here to make it
            available for download.
          </p>
        )}

        <div style={{ display: "grid", gap: "0.75rem", maxWidth: 520 }}>
          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span style={{ fontWeight: 600 }}>Upload PDF</span>
            <input
              ref={letterInput}
              type="file"
              accept="application/pdf"
              onChange={handleLetterFileChange}
              disabled={uploadingLetter}
            />
          </label>

          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span style={{ fontWeight: 600 }}>Admin Note (optional)</span>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: 10,
                border: "1px solid #d6dde8",
              }}
              placeholder="Add an optional note that will be saved with the update."
            />
          </label>

          <button
            type="button"
            onClick={uploadAcceptanceLetter}
            disabled={uploadingLetter || !letterFile}
            className="button button-primary"
            style={{ width: "fit-content" }}
          >
            {uploadingLetter ? "Uploading…" : "Upload Acceptance Letter"}
          </button>

          {letterUploadError && (
            <p className="student-notice error" role="alert">
              {letterUploadError}
            </p>
          )}
          {letterUploadSuccess && (
            <p className="student-notice success" role="status">
              {letterUploadSuccess}
            </p>
          )}
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Files</h3>
        {documents ? (
          <ul>
            {[
              { key: "photo_url", label: "Personal Photo" },
              { key: "id_card_url", label: "ID Card / Tazkira" },
              { key: "passport_url", label: "Passport" },
              { key: "transcript_url", label: "Transcript" },
              { key: "diploma_url", label: "Diploma" },
              { key: "exam_sheet_url", label: "Exam Sheet" },
            ].map(({ key, label }) => {
              const val = documents[key];
              if (
                !val ||
                typeof val !== "string" ||
                !(
                  val.startsWith("http") ||
                  val.startsWith("/api/admin/document")
                )
              )
                return null;
              const filename = val.split("?")[0].split("/").pop();
              return (
                <li key={key} style={{ marginBottom: 10 }}>
                  <div>
                    <strong>{label}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => openDocument(val)}
                      style={{
                        padding: "6px 10px",
                        background: "#0070f3",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Open {filename}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No files uploaded.</p>
        )}
      </section>
    </div>
  );
}
