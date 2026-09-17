"use client";

import { useEffect, useState } from "react";

const tasks = [
  [
    "goals",
    "Define your direction",
    "Choose a study level, a subject, and your preferred teaching language.",
  ],
  [
    "shortlist",
    "Build a university shortlist",
    "Compare location, program requirements, and the current application window.",
  ],
  [
    "documents",
    "Review your documents",
    "Check passport validity, academic records, and any required translations.",
  ],
  [
    "budget",
    "Make a complete budget",
    "Include tuition, housing, daily expenses, insurance, travel, and document costs.",
  ],
  [
    "questions",
    "Write down your questions",
    "Bring anything uncertain to your consultation before you commit.",
  ],
];
const storageKey = "horizon:preparation:v1";

export default function PreparationChecklist() {
  const [checked, setChecked] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(value))
        setChecked(value.filter((id) => tasks.some((task) => task[0] === id)));
    } catch {
      setSaved(false);
    }
    setLoaded(true);
  }, []);
  function toggle(id) {
    const next = checked.includes(id)
      ? checked.filter((value) => value !== id)
      : [...checked, id];
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }
  return (
    <div className="guide-checklist">
      <div className="guide-checklist-header">
        <span className="section-label">Your preparation list</span>
        <strong aria-live="polite">
          {checked.length} / {tasks.length} ready
        </strong>
      </div>
      <div
        className="guide-progress"
        role="progressbar"
        aria-label="Preparation complete"
        aria-valuemin={0}
        aria-valuemax={tasks.length}
        aria-valuenow={checked.length}
      >
        <span style={{ width: `${(checked.length / tasks.length) * 100}%` }} />
      </div>
      {tasks.map(([id, title, detail], index) => (
        <label
          key={id}
          className={`guide-task${checked.includes(id) ? " is-complete" : ""}`}
        >
          <input
            type="checkbox"
            checked={checked.includes(id)}
            onChange={() => toggle(id)}
            disabled={!loaded}
          />
          <span>
            <strong>
              <small>0{index + 1}</small>
              {title}
            </strong>
            <span>{detail}</span>
          </span>
        </label>
      ))}
      <p className="guide-storage-note">
        {saved
          ? "Your progress stays in this browser. No account needed."
          : "Your browser cannot save this list. You can still use it during this visit."}
      </p>
    </div>
  );
}
