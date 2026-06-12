"use client";

import { useSearchParams } from 'next/navigation';

export default function SelectedUniversityClient() {
  const searchParams = useSearchParams();
  const selectedUni = searchParams.get('uni');

  if (!selectedUni) return null;

  return (
    <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', padding: '2rem 1.5rem', borderRadius: '1rem', marginBottom: '2rem', boxShadow: 'var(--shadow-lg)', zIndex: 10 }}>
      <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Selected University:</p>
      <h3 style={{ margin: '0.5rem 0 0 0', color: 'white', fontSize: '1.5rem' }}>{decodeURIComponent(selectedUni)}</h3>
    </div>
  );
}
