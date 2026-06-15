import React, { Suspense } from 'react';
import StudentAuthClient from '../../../components/StudentAuthClient';

export const metadata = {
  title: 'Student Portal | Horizon Educational Consultancy',
  description: 'Sign in or create your student account to track your university application.',
};

export default function StudentAuthPage() {
  return (
    <Suspense fallback={<div>Loading student portal…</div>}>
      <StudentAuthClient />
    </Suspense>
  );
}
