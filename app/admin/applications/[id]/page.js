'use client';

import { useParams } from 'next/navigation';
import ApplicationDetailClient from '../../../../components/ApplicationDetailClient';

export default function ApplicationDetailPage() {
  const params = useParams();
  let id = params?.id;

  if (!id && typeof window !== 'undefined') {
    const parts = window.location.pathname.split('/').filter(Boolean);
    id = parts[parts.length - 1];
  }

  if (!id) {
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ color: 'crimson' }}>Invalid application id</h2>
      </div>
    );
  }

  return <ApplicationDetailClient id={id} />;
}
