'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function ApplicationDetailClient({ id }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [application, setApplication] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [uploadingLetter, setUploadingLetter] = useState(false);
  const [letterUploadError, setLetterUploadError] = useState('');
  const [letterUploadSuccess, setLetterUploadSuccess] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [letterFile, setLetterFile] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setErrorMsg('Supabase client is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    if (!id) {
      setErrorMsg('No ID provided to component');
      setLoading(false);
      return;
    }

    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data?.session ?? null;
      if (!s) {
        router.push('/admin/login');
        return;
      }
      
      // Verify user has admin role
      const verifyRes = await fetch('/api/admin/applications', { headers: { Authorization: `Bearer ${s.access_token}` } });
      if (verifyRes.status === 403) {
        await supabase.auth.signOut();
        setErrorMsg('Access denied: You do not have admin permissions.');
        router.push('/admin/login');
        return;
      }
      
      setSession(s);
      setErrorMsg(null);
      await fetchDetail(s.access_token);
    })();
  }, [id, router]);

  async function fetchDetail(token) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          await supabase.auth.signOut();
          router.replace('/admin/login');
          return;
        }
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        const msg = body?.error || `Request failed (${res.status})`;
        console.error('Failed to fetch application detail', msg);
        setErrorMsg(msg);
        setLoading(false);
        return;
      }
      const body = await res.json();
      setApplication(body.application);
      setDocuments(body.documents);
    } catch (err) {
      console.error('Fetch detail error', err);
      setErrorMsg(err.message || 'Fetch error');
    } finally {
      setLoading(false);
    }
  }

  async function openDocument(docUrl) {
    if (!session) return;

    const newWindow = window.open('about:blank');
    if (!newWindow) {
      alert('Please allow popups for this site to download documents.');
      return;
    }

    try {
      const targetUrl = docUrl.startsWith('/api/admin/document')
        ? docUrl
        : `/api/admin/document?publicUrl=${encodeURIComponent(docUrl)}`;

      const res = await fetch(targetUrl, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          await supabase.auth.signOut();
          router.replace('/admin/login');
          return;
        }
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Document fetch failed', err);
        newWindow.close();
        alert(err.error || 'Failed to open document');
        return;
      }

      const contentType = res.headers.get('content-type') || 'application/octet-stream';
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(new Blob([blob], { type: contentType }));
      newWindow.location.href = objectUrl;
    } catch (err) {
      console.error('Open document error', err);
      newWindow.close();
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
      if (res.status === 401 || res.status === 403) {
        await supabase.auth.signOut();
        router.replace('/admin/login');
        return;
      }
      const err = await res.json();
      console.error('Status update failed', err);
    }
  }

  async function uploadAcceptanceLetter() {
    if (!session) return;
    setLetterUploadError('');
    setLetterUploadSuccess('');

    if (!letterFile) {
      setLetterUploadError('Please select a PDF file to upload.');
      return;
    }

    if (!letterFile.type.includes('pdf')) {
      setLetterUploadError('Only PDF files are allowed for acceptance letters.');
      return;
    }

    if (letterFile.size > 10 * 1024 * 1024) {
      setLetterUploadError('The acceptance letter file must be smaller than 10MB.');
      return;
    }

    setUploadingLetter(true);
    try {
      const formData = new FormData();
      formData.append('file', letterFile);
      formData.append('status', 'accepted');
      formData.append('admin_note', adminNote || '');

      const res = await fetch(`/api/admin/applications/${id}/letter`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          await supabase.auth.signOut();
          router.replace('/admin/login');
          return;
        }
        throw new Error(result?.error || 'Failed to upload acceptance letter.');
      }

      setApplication(result.application || application);
      setLetterUploadSuccess('Acceptance letter uploaded successfully.');
      setLetterFile(null);
    } catch (err) {
      console.error('Letter upload failed', err);
      setLetterUploadError(err?.message || 'Upload failed.');
    } finally {
      setUploadingLetter(false);
    }
  }

  function handleLetterFileChange(event) {
    setLetterUploadError('');
    setLetterUploadSuccess('');
    const file = event.target.files?.[0] || null;
    setLetterFile(file);
  }

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;
  if (errorMsg) return <p style={{ padding: 24, color: 'crimson' }}>Error: {errorMsg}</p>;
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
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {['submitted', 'evaluating', 'accepted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={statusUpdating || application.application_status === s}
              style={{ padding: '6px 10px', background: application.application_status === s ? '#0070f3' : '#eee', color: application.application_status === s ? '#fff' : '#000' }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 20, padding: '1rem', borderRadius: 14, background: '#f9fbff', border: '1px solid #e3e9f6' }}>
        <h3>Acceptance Letter</h3>
        {application.acceptance_letter_url ? (
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: 0 }}>An acceptance letter has already been uploaded for this application.</p>
            <button
              type="button"
              onClick={() => window.open(application.acceptance_letter_url, '_blank')}
              className="button button-secondary"
              style={{ marginTop: 10 }}
            >
              Open Acceptance Letter
            </button>
          </div>
        ) : (
          <p style={{ marginBottom: 12 }}>Upload the student&apos;s acceptance letter PDF here to make it available for download.</p>
        )}

        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 520 }}>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Upload PDF</span>
            <input type="file" accept="application/pdf" onChange={handleLetterFileChange} />
          </label>

          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Admin Note (optional)</span>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #d6dde8' }}
              placeholder="Add an optional note that will be saved with the update."
            />
          </label>

          <button
            type="button"
            onClick={uploadAcceptanceLetter}
            disabled={uploadingLetter || !letterFile}
            className="button button-primary"
            style={{ width: 'fit-content' }}
          >
            {uploadingLetter ? 'Uploading…' : 'Upload Acceptance Letter'}
          </button>

          {letterUploadError && <p style={{ margin: 0, color: '#d32f2f' }}>{letterUploadError}</p>}
          {letterUploadSuccess && <p style={{ margin: 0, color: '#2e7d32' }}>{letterUploadSuccess}</p>}
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
              if (!val || typeof val !== 'string' || !(val.startsWith('http') || val.startsWith('/api/admin/document'))) return null;
              const filename = val.split('?')[0].split('/').pop();
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
