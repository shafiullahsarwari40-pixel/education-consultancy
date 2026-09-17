"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useLanguage } from "../lib/LanguageContext";
import { translations } from "../lib/translations";

const UNIVERSITIES = [
  "Adıyaman University",
  "Ankara Yıldırım Beyazıt University",
  "Burdur Mehmet Akif Ersoy University",
  "Kırıkkale University",
  "Düzce University",
  "Zonguldak Bülent Ecevit University",
  "Kastamonu University",
  "Uşak University",
  "İzmir Katip Çelebi University",
  "Mersin University",
  "Ondokuz Mayıs University",
  "Anadolu University",
  "Karabük University",
];
const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macao",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Samoa",
  "San Marino",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
].sort();
const DOCUMENTS = [
  { key: "passport", label: "Passport" },
  { key: "transcript", label: "Academic transcript" },
  { key: "diploma", label: "Diploma / graduation certificate" },
  { key: "exam_sheet", label: "Exam results" },
  { key: "id_card", label: "National ID / Tazkira" },
  { key: "photo", label: "Personal photograph" },
];
const STEPS = ["Your details", "Study plans", "Documents", "Review"];
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_TOTAL_SIZE = 4 * 1024 * 1024;
const formatSize = (size) => `${(size / 1024 / 1024).toFixed(1)} MB`;

export default function ApplicationForm({ session }) {
  const { language } = useLanguage();
  const headingRef = useRef(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [consent, setConsent] = useState(false);
  const [formState, setFormState] = useState({
    full_name: "",
    email: session?.user?.email || "",
    phone: "",
    mother_name: "",
    father_name: "",
    address: "",
    country: "",
    program: "",
    faculty: "",
    university: "",
    message: "",
  });
  const [files, setFiles] = useState({});
  const totalSize = Object.values(files).reduce(
    (sum, file) => sum + (file?.size || 0),
    0,
  );
  const facultyOptions = Object.values(
    translations[language]?.faculties || translations.en.faculties || {},
  );
  const hasUnsavedChanges = Boolean(
    formState.full_name || formState.phone || formState.message || totalSize,
  );

  useEffect(() => {
    const university = new URLSearchParams(window.location.search).get("uni");
    if (university) setFormState((previous) => ({ ...previous, university }));
  }, []);

  useEffect(() => {
    if (!hasUnsavedChanges || submitted) return;
    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasUnsavedChanges, submitted]);

  function change(event) {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  }

  function goTo(nextStep) {
    setError("");
    setStep(nextStep);
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      headingRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  function changeFile(event, key) {
    const file = event.target.files?.[0];
    if (!file) return;
    const rejectFile = (message) => {
      setError(message);
      event.target.value = "";
    };
    if (
      ![
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ].includes(file.type)
    ) {
      rejectFile("Please use a PDF, JPG, PNG, WebP, or GIF file.");
      return;
    }
    if (file.size === 0) {
      rejectFile("This file is empty. Please choose another copy.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      rejectFile(
        `${file.name} is too large. Each file must be 4 MB or smaller.`,
      );
      return;
    }
    if (totalSize - (files[key]?.size || 0) + file.size > MAX_TOTAL_SIZE) {
      rejectFile(
        "Your documents total more than 4 MB. Please use smaller copies.",
      );
      return;
    }
    setError("");
    setFiles((previous) => ({ ...previous, [key]: file }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading || submitted) return;
    if (step < 3) {
      goTo(step + 1);
      return;
    }
    setError("");
    if (
      !formState.full_name.trim() ||
      !formState.email.trim() ||
      !formState.phone.trim()
    ) {
      setStep(0);
      setError("Please complete your full name, email, and phone number.");
      return;
    }
    if (!consent) {
      setError(
        "Please confirm your details and privacy consent before submitting.",
      );
      return;
    }
    setLoading(true);
    try {
      if (!supabase)
        throw new Error(
          "Applications are temporarily unavailable. Please contact admissions.",
        );
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data?.session)
        throw new Error(
          "Your session has expired. Sign in again in another tab, then return here to submit without losing your details.",
        );
      const body = new FormData();
      for (const [key, value] of Object.entries(formState)) {
        if (key === "faculty" || key === "message") continue;
        body.append(key, value.trim());
      }
      body.append(
        "message",
        [
          formState.faculty ? `Preferred subject: ${formState.faculty}` : "",
          formState.message.trim(),
        ]
          .filter(Boolean)
          .join("\n\n"),
      );
      for (const { key } of DOCUMENTS)
        if (files[key]) body.append(key, files[key]);
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        body,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 413)
          throw new Error(
            "Your upload was too large for the server. Please reduce the document sizes and try again.",
          );
        if (response.status === 401)
          throw new Error(
            "Your session has expired. Sign in again in another tab, then return here.",
          );
        throw new Error(
          result?.error ||
            "We could not confirm your submission. Check your application status before trying again, or contact admissions.",
        );
      }
      if (!result?.success)
        throw new Error(
          "We could not confirm your submission. Please check your application status before trying again.",
        );
      setSubmitted(result);
    } catch (err) {
      setError(
        err.message ||
          "We could not connect. Check your application status before retrying.",
      );
    } finally {
      setLoading(false);
    }
  }

  function field(name, label, options = {}) {
    return (
      <label
        className={`student-form-field ${options.full ? "full-row" : ""}`}
        htmlFor={`application-${name}`}
        key={name}
      >
        {label}
        {options.required ? " *" : ""}
        <input
          id={`application-${name}`}
          name={name}
          type={options.type || "text"}
          value={formState[name]}
          onChange={change}
          required={options.required}
          autoComplete={options.autoComplete}
          maxLength={options.maxLength || 200}
          placeholder={options.placeholder}
          disabled={loading}
        />
        {options.hint && <small>{options.hint}</small>}
      </label>
    );
  }

  if (submitted)
    return (
      <section className="student-state-card" role="status">
        <span className="student-state-symbol" aria-hidden="true">
          ✓
        </span>
        <span className="student-eyebrow">APPLICATION RECEIVED</span>
        <h1>
          You have taken
          <br />
          <em>the first step.</em>
        </h1>
        <p>
          Your application has been saved. Our admissions team will review your
          information and update your student portal as it progresses.
        </p>
        {submitted.applicationId && (
          <p>
            Reference: <strong>{submitted.applicationId}</strong>
          </p>
        )}
        <div className="student-action-row">
          <Link className="student-primary" href="/student/result">
            View my application <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    );

  return (
    <form className="student-form" onSubmit={handleSubmit} aria-busy={loading}>
      <ol className="student-form-steps" aria-label="Application progress">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={index <= step ? "active" : ""}
            aria-current={index === step ? "step" : undefined}
          >
            <span>
              {index < step ? "✓" : String(index + 1).padStart(2, "0")}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <div className="student-form-body">
        <h2 ref={headingRef} tabIndex={-1}>
          {
            [
              "Let’s get to know you.",
              "What would you like to study?",
              "Bring your story together.",
              "Ready for your next chapter?",
            ][step]
          }
        </h2>
        <p className="student-form-intro">
          {
            [
              "Use your details as shown on your official documents. * Required fields.",
              "Share your preferences. It is okay if you are still exploring.",
              "Add the documents you have available. Our team will advise if more are needed.",
              "Check your details carefully. You can edit any section before sending.",
            ][step]
          }
        </p>
        {step === 0 && (
          <div className="student-form-grid">
            {field("full_name", "Full name", {
              required: true,
              autoComplete: "name",
              placeholder: "As shown on your passport",
              full: true,
            })}
            {field("email", "Email address", {
              required: true,
              type: "email",
              autoComplete: "email",
              maxLength: 254,
            })}
            {field("phone", "Phone number", {
              required: true,
              type: "tel",
              autoComplete: "tel",
              placeholder: "Include your country code",
              maxLength: 40,
            })}
            <label className="student-form-field" htmlFor="application-country">
              Country
              <input
                id="application-country"
                name="country"
                list="application-countries"
                autoComplete="country-name"
                value={formState.country}
                onChange={change}
                placeholder="Start typing your country"
                maxLength={100}
              />
              <datalist id="application-countries">
                {COUNTRIES.map((country) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
            </label>
            {field("address", "Home address", {
              autoComplete: "street-address",
              maxLength: 500,
            })}
            {field("mother_name", "Mother’s full name", {
              autoComplete: "off",
            })}
            {field("father_name", "Father’s full name", {
              autoComplete: "off",
            })}
          </div>
        )}
        {step === 1 && (
          <div className="student-form-grid">
            <label className="student-form-field" htmlFor="application-program">
              Degree level
              <select
                id="application-program"
                name="program"
                value={formState.program}
                onChange={change}
              >
                <option value="">I would like guidance</option>
                <option value="Bachelor">Bachelor’s degree</option>
                <option value="Master">Master’s degree</option>
                <option value="PhD">Doctoral degree / PhD</option>
              </select>
            </label>
            <label className="student-form-field" htmlFor="application-faculty">
              Preferred subject
              <input
                id="application-faculty"
                name="faculty"
                list="application-faculties"
                value={formState.faculty}
                onChange={change}
                placeholder="Choose or type a subject"
                maxLength={200}
              />
              <datalist id="application-faculties">
                {facultyOptions.map((label) => (
                  <option key={label} value={label} />
                ))}
              </datalist>
            </label>
            <label
              className="student-form-field full-row"
              htmlFor="application-university"
            >
              Preferred university
              <input
                id="application-university"
                name="university"
                list="application-universities"
                value={formState.university}
                onChange={change}
                placeholder="Choose a university, or leave blank for guidance"
                maxLength={200}
              />
              <datalist id="application-universities">
                {UNIVERSITIES.map((university) => (
                  <option key={university} value={university} />
                ))}
              </datalist>
              <small>
                Your choice is a preference. Admission and program availability
                depend on the university.
              </small>
            </label>
            <label
              className="student-form-field full-row"
              htmlFor="application-message"
            >
              Anything else we should know?
              <textarea
                id="application-message"
                name="message"
                rows={4}
                value={formState.message}
                onChange={change}
                maxLength={4500}
                placeholder="Tell us about your interests, qualifications, preferred intake, or questions."
              />
            </label>
          </div>
        )}
        {step === 2 && (
          <>
            <div className="student-document-grid">
              {DOCUMENTS.map(({ key, label }) => (
                <div
                  className={`student-document ${files[key] ? "selected" : ""}`}
                  key={key}
                >
                  <h3
                    className="student-document-title"
                    id={`document-title-${key}`}
                  >
                    <span aria-hidden="true">{files[key] ? "✓" : "↥"}</span>
                    {label}
                  </h3>
                  <p
                    className="student-document-name"
                    id={`document-selection-${key}`}
                    aria-live="polite"
                  >
                    {files[key]
                      ? `${files[key].name} · ${formatSize(files[key].size)}`
                      : "No document selected"}
                  </p>
                  <input
                    id={`document-${key}`}
                    className="student-document-input"
                    type="file"
                    hidden
                    tabIndex={-1}
                    aria-hidden="true"
                    accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) => changeFile(event, key)}
                    aria-describedby="document-guidance"
                  />
                  <button
                    className="student-document-choose"
                    type="button"
                    aria-label={`${files[key] ? "Replace" : "Choose"} ${label.toLowerCase()}`}
                    aria-describedby={`document-selection-${key} document-guidance`}
                    onClick={() =>
                      document.getElementById(`document-${key}`)?.click()
                    }
                  >
                    {files[key] ? "Replace file" : "Choose file"}
                  </button>
                  {files[key] && (
                    <button
                      className="student-document-remove"
                      type="button"
                      onClick={() => {
                        setFiles((previous) => ({ ...previous, [key]: null }));
                        const input = document.getElementById(
                          `document-${key}`,
                        );
                        if (input) input.value = "";
                        setError("");
                      }}
                    >
                      Remove {label.toLowerCase()}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="student-upload-note" id="document-guidance">
              PDF, JPG, PNG, WebP, or GIF. Up to 4 MB per file and 4 MB in
              total.
              <br />
              Selected: {formatSize(totalSize)} of 4 MB. Files are sent only
              when you submit the application.
            </p>
          </>
        )}
        {step === 3 && (
          <>
            <section className="student-review-section">
              <div className="student-review-heading">
                <h3>Your details</h3>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => goTo(0)}
                >
                  Edit details
                </button>
              </div>
              <dl className="student-definition">
                {[
                  ["Full name", formState.full_name],
                  ["Email", formState.email],
                  ["Phone", formState.phone],
                  ["Country", formState.country],
                  ["Home address", formState.address],
                  ["Mother’s name", formState.mother_name],
                  ["Father’s name", formState.father_name],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || "Not provided"}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="student-review-section">
              <div className="student-review-heading">
                <h3>Study preferences</h3>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => goTo(1)}
                >
                  Edit preferences
                </button>
              </div>
              <dl className="student-definition">
                {[
                  ["Degree", formState.program],
                  ["Subject", formState.faculty],
                  ["University", formState.university],
                  ["Additional notes", formState.message],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || "To discuss with your advisor"}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="student-review-section">
              <div className="student-review-heading">
                <h3>Your documents</h3>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => goTo(2)}
                >
                  Edit documents
                </button>
              </div>
              {totalSize > 0 ? (
                <ul className="student-review-docs">
                  {DOCUMENTS.filter(({ key }) => files[key]).map(
                    ({ key, label }) => (
                      <li key={key}>✓ {label}</li>
                    ),
                  )}
                </ul>
              ) : (
                <p className="student-panel-note">
                  No documents attached. Our team may request them to proceed.
                </p>
              )}
            </section>
            <label className="student-consent student-review-consent">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                disabled={loading}
              />
              <span>
                I confirm that these details are accurate and have read the{" "}
                <Link href="/privacy" target="_blank">
                  privacy policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" target="_blank">
                  terms of service
                </Link>
                .
              </span>
            </label>
          </>
        )}
      </div>
      {error && (
        <div className="student-notice error" role="alert">
          {error}
          {step === 3 && (
            <div>
              <Link href="/student/result" target="_blank">
                Check application status ↗
              </Link>{" "}
              ·{" "}
              <Link href="/student/auth" target="_blank">
                Sign in ↗
              </Link>
            </div>
          )}
        </div>
      )}
      <div className="student-form-actions">
        {step > 0 ? (
          <button
            type="button"
            className="student-secondary"
            onClick={() => goTo(step - 1)}
            disabled={loading}
          >
            ← Back
          </button>
        ) : (
          <p>Step 1 of 4 · Your information</p>
        )}
        <button type="submit" className="student-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="student-spinner" />
              Submitting…
            </>
          ) : (
            <>
              {step === 3 ? "Submit application" : "Continue"}{" "}
              <span aria-hidden="true">↗</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
