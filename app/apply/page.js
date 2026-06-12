import React, { Suspense } from 'react';
import Link from 'next/link';
import ApplicationForm from '../../components/ApplicationForm';
import SelectedUniversityClient from '../../components/SelectedUniversityClient';

export default function ApplyPage() {
  return (
    <main className="section contact">
      <div className="container">
        <header className="site-header" style={{ position: 'static', background: 'transparent', border: 'none' }}>
          <div className="header-inner" style={{ padding: 0 }}>
            <Link href="/" className="brand">
              Horizon
            </Link>
            <nav className="nav-menu">
              <Link href="/">Back</Link>
            </nav>
          </div>
        </header>

        <Suspense fallback={null}>
          <SelectedUniversityClient />
        </Suspense>

        <div className="section-header">
          <span>Application</span>
          <h2>Apply for your chosen university</h2>
          <p>Please provide your contact details and upload the requested documents.</p>
        </div>

        <ApplicationForm />
      </div>
    </main>
  );
}
