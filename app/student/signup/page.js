import { Suspense } from "react";
import StudentAuthClient from "../../../components/StudentAuthClient";

export const metadata = {
  title: "Create your student account",
  robots: { index: false, follow: false },
};

export default function StudentSignupPage() {
  return (
    <Suspense
      fallback={
        <main className="student-experience student-loading" role="status">
          Preparing your student portal…
        </main>
      }
    >
      <StudentAuthClient initialMode="signup" />
    </Suspense>
  );
}
