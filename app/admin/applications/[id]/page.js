'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

export default function ApplicationDetail({ params }) {
  const { id } = params;
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data?.session ?? null;
      if (!s) return router.push('/admin/login');
      setSession(s);
      await fetchDetail(s.access_token);
    })();
  }, [id]);

  async function fetchDetail(token) {
    setLoading(true);
    const res = await fetch(`/api/admin/applications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      console.error('Failed to fetch');
      setLoading(false);
      return;
    }
    const body = await res.json();
    setApplication(body.application);
    setDocuments(body.documents);
    setLoading(false);
  }

  async function openDocument(docUrl) {
    if (!session) return;
    try {
      if (docUrl.startsWith('/api/admin/document')) {
        window.open(docUrl, '_blank');
        return;
      }

      const res = await fetch(`/api/admin/document?publicUrl=${encodeURIComponent(docUrl)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Document fetch failed', err);
        alert(err.error || 'Failed to open document');
        return;
      }
      const contentType = res.headers.get('content-type') || 'application/octet-stream';
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(new Blob([blob], { type: contentType }));
      window.open(objectUrl, '_blank');
    } catch (err) {
      console.error('Open document error', err);
      alert('Unable to open document.');
    }
  }

  async function updateStatus(newStatus) {
    if (!session) return;
    setStatusUpdating(true);
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatusUpdating(false);
    if (res.ok) {
      const body = await res.json();
      setApplication(body.application);
    } else {
      const err = await res.json();
      console.error('Status update failed', err);
    }
  }

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;
  if (!application) return <p style={{ padding: 24 }}>Application not found.</p>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2>{application.full_name}</h2>
      <p>
        <strong>Email:</strong> {application.email}
      </p>
      <p>
        <strong>Phone:</strong> {application.phone}
      </p>
      <p>
        <strong>Country:</strong> {application.country}
      </p>
      <p>
        <strong>University:</strong> {application.university}
      </p>
      <p>
        <strong>Program:</strong> {application.program}
      </p>
      <p>
        <strong>Mother Name:</strong> {application.mother_name || '—'}
      </p>
      <p>
        <strong>Father Name:</strong> {application.father_name || '—'}
      </p>
      <p>
        <strong>Address:</strong> {application.address || '—'}
      </p>
      <p>
        <strong>Notes:</strong> {application.message}
      </p>
      <p>
        <strong>Submitted:</strong> {new Date(application.created_at).toLocaleString()}
      </p>

      <section style={{ marginTop: 16 }}>
        <label>
          <strong>Status:</strong>
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {['New', 'Contacted', 'Under Review', 'Accepted', 'Rejected'].map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={statusUpdating || application.status === s}
              style={{ padding: '6px 10px', background: application.status === s ? '#0070f3' : '#eee', color: application.status === s ? '#fff' : '#000' }}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Files</h3>
        {documents ? (
          <ul>
            {[
              { key: 'photo_url', label: 'Personal Photo' },
              { key: 'id_card_url', label: 'ID Card / Tazkira' },
              { key: 'passport_url', label: 'Passport' },
              { key: 'transcript_url', label: 'Transcript' },
              { key: 'diploma_url', label: 'Diploma' },
              { key: 'exam_sheet_url', label: 'Exam Sheet' },
            ].map(({ key, label }) => {
              const val = documents[key];
              if (!val || !val.startsWith('http')) return null;
              const filename = val.split('/').pop();
              return (
                <li key={key} style={{ marginBottom: 10 }}>
                  <div>
                    <strong>{label}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => openDocument(val)}
                      style={{ padding: '6px 10px', background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                      Open {filename}
                    </button>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>{val}</div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No files uploaded.</p>
        )}
      </section>
    </div>
  );
}
