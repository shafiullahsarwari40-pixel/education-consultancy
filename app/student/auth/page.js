import React, { Suspense } from "react";
import StudentAuthClient from "../../../components/StudentAuthClient";

export const metadata = {
  title: "Student portal",
  description:
    "Sign in or create your student account to track your university application.",
  robots: { index: false, follow: false },
};

export default function StudentAuthPage() {
  return (
    <Suspense
      fallback={
        <main className="student-experience student-loading" role="status">
          Preparing your student portal…
        </main>
      }
    >
      <StudentAuthClient />
    </Suspense>
  );
}
