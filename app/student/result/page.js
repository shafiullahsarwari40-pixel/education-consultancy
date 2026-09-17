import StudentResultClient from "../../../components/StudentResultClient";

export const metadata = {
  title: "Your application result",
  description:
    "Check your university application status and download your acceptance letter.",
  robots: { index: false, follow: false },
};

export default function StudentResultPage() {
  return <StudentResultClient />;
}
