import StudentDashboardClient from '../../../components/StudentDashboardClient';

export default function StudentDashboardPage() {
  return (
    <main className="section" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 920, margin: '0 auto' }}>
        <StudentDashboardClient />
      </div>
    </main>
  );
}
