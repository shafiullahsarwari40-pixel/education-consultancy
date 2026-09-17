import StudentDashboardClient from "../../../components/StudentDashboardClient";

export const metadata = {
  title: "Your student dashboard",
  robots: { index: false, follow: false },
};

export default function StudentDashboardPage() {
  return <StudentDashboardClient />;
}
