'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

const INITIAL_FORM = {
  id: '',
  media_type: 'image',
  title: '',
  description: '',
  button_text: '',
  button_link: '',
  is_published: true,
  sort_order: 0,
  file: null,
};

function validateLink(value) {
  if (!value) return true;
  const trimmed = String(value).trim();
  if (!trimmed) return true;
  if (/^(https?:\/\/|mailto:|tel:|\/|\.\/|\.\.\/)/i.test(trimmed)) return true;
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

export default function HomepageMediaAdminPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState('');

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session ?? null;
      if (!currentSession) {
        router.replace('/admin/login');
        return;
      }

      setSession(currentSession);
      await loadItems(currentSession.access_token);
    })();
  }, [router]);

  async function loadItems(token) {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/homepage-media', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Failed to load homepage media' }));
      setError(body.error || 'Failed to load homepage media');
      setLoading(false);
      return;
    }
    const body = await res.json();
    setItems(body.items || []);
    setLoading(false);
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId('');
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!session) return;
    if (!form.file && !editingId) {
      setError('Please select a file to upload.');
      return;
    }
    if (!validateLink(form.button_link)) {
      setError('Please enter a valid button link.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const data = new FormData();
    if (editingId) data.append('id', editingId);
    data.append('media_type', form.media_type);
    data.append('title', form.title || '');
    data.append('description', form.description || '');
    data.append('button_text', form.button_text || '');
    data.append('button_link', form.button_link || '');
    data.append('is_published', form.is_published ? 'true' : 'false');
    data.append('sort_order', String(form.sort_order || 0));
    if (form.file) data.append('file', form.file);

    const method = editingId ? 'PATCH' : 'POST';
    const url = editingId ? '/api/admin/homepage-media' : '/api/admin/homepage-media';

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: data,
    });

    const body = await res.json().catch(() => ({ error: 'Save failed' }));
    setSaving(false);
    if (!res.ok) {
      setError(body.error || 'Save failed');
      return;
    }

    setSuccess(editingId ? 'Media item updated.' : 'Media item created.');
    resetForm();
    await loadItems(session.access_token);
  }

  async function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      id: item.id,
      media_type: item.media_type || 'image',
      title: item.title || '',
      description: item.description || '',
      button_text: item.button_text || '',
      button_link: item.button_link || '',
      is_published: Boolean(item.is_published),
      sort_order: item.sort_order || 0,
      file: null,
    });
  }

  async function handlePublish(item, published) {
    if (!session) return;
    const res = await fetch('/api/admin/homepage-media', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: item.id, is_published: published }),
    });
    const body = await res.json().catch(() => ({ error: 'Unable to update publication status' }));
    if (!res.ok) {
      setError(body.error || 'Unable to update publication status');
      return;
    }
    setSuccess('Status updated.');
    await loadItems(session.access_token);
  }

  async function handleReorder(item, direction) {
    if (!session) return;
    const targetIndex = items.findIndex((entry) => entry.id === item.id);
    if (targetIndex < 0) return;

    const nextIndex = direction === 'up' ? targetIndex - 1 : targetIndex + 1;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    const targetItem = items[targetIndex];
    const swapItem = items[nextIndex];
    const res1 = await fetch('/api/admin/homepage-media', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: targetItem.id, sort_order: swapItem.sort_order }),
    });
    const res2 = await fetch('/api/admin/homepage-media', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: swapItem.id, sort_order: targetItem.sort_order }),
    });

    const body1 = await res1.json().catch(() => ({ error: 'Unable to reorder item' }));
    const body2 = await res2.json().catch(() => ({ error: 'Unable to reorder item' }));
    if (!res1.ok || !res2.ok) {
      setError(body1.error || body2.error || 'Unable to reorder item');
      return;
    }
    await loadItems(session.access_token);
  }

  async function handleDelete(item) {
    if (!session) return;
    if (!window.confirm(`Delete ${item.title || 'this media item'}?`)) return;
    const res = await fetch('/api/admin/homepage-media', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: item.id }),
    });
    const body = await res.json().catch(() => ({ error: 'Unable to delete item' }));
    if (!res.ok) {
      setError(body.error || 'Unable to delete item');
      return;
    }
    setSuccess('Media item deleted.');
    await loadItems(session.access_token);
  }

  const isEditing = Boolean(editingId);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Homepage Media</h1>
          <p style={{ margin: '4px 0 0', color: '#5a6472' }}>Upload and manage homepage media for the public showcase.</p>
        </div>
        <Link href="/admin" style={{ color: '#1e5a96', fontWeight: 600 }}>← Back to dashboard</Link>
      </div>

      {error ? <div style={{ background: '#fff0f0', color: '#b42318', padding: 12, borderRadius: 8, marginBottom: 12 }}>{error}</div> : null}
      {success ? <div style={{ background: '#ecfdf3', color: '#027a48', padding: 12, borderRadius: 8, marginBottom: 12 }}>{success}</div> : null}

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e4e7ec', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Media type</span>
            <select value={form.media_type} onChange={(event) => setForm((prev) => ({ ...prev, media_type: event.target.value }))}>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Upload file</span>
            <input type="file" accept={form.media_type === 'video' ? '.mp4,.webm' : '.jpg,.jpeg,.png,.webp'} onChange={(event) => setForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Display order</span>
            <input type="number" value={form.sort_order} onChange={(event) => setForm((prev) => ({ ...prev, sort_order: Number(event.target.value) }))} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 28 }}>
            <input type="checkbox" checked={form.is_published} onChange={(event) => setForm((prev) => ({ ...prev, is_published: event.target.checked }))} />
            <span>Published</span>
          </label>
        </div>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Title (optional)</span>
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Short description (optional)</span>
            <input value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Button text (optional)</span>
            <input value={form.button_text} onChange={(event) => setForm((prev) => ({ ...prev, button_text: event.target.value }))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Button link (optional)</span>
            <input value={form.button_link} onChange={(event) => setForm((prev) => ({ ...prev, button_link: event.target.value }))} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button type="submit" disabled={saving} className="button button-primary">{saving ? 'Saving...' : isEditing ? 'Save changes' : 'Save'}</button>
          <button type="button" onClick={resetForm} className="button button-secondary">Cancel</button>
        </div>
      </form>

      <div style={{ background: '#fff', border: '1px solid #e4e7ec', borderRadius: 16, padding: 20 }}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Media items</h2>
        {loading ? <p>Loading...</p> : items.length === 0 ? <p>No media items yet.</p> : (
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((item, index) => (
              <div key={item.id} style={{ border: '1px solid #e4e7ec', borderRadius: 12, padding: 12, display: 'grid', gap: 12, gridTemplateColumns: 'minmax(120px, 160px) 1fr auto' }}>
                <div>
                  {item.media_type === 'video' ? (
                    <video src={item.media_url} poster={item.thumbnail_url || ''} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} muted playsInline preload="metadata" />
                  ) : (
                    <img src={item.media_url} alt={item.title || 'Media item'} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong>{item.title || 'Untitled media'}</strong>
                    <span style={{ fontSize: 12, color: '#5a6472', textTransform: 'capitalize' }}>{item.media_type}</span>
                    <span style={{ fontSize: 12, color: item.is_published ? '#027a48' : '#b42318' }}>{item.is_published ? 'Published' : 'Hidden'}</span>
                  </div>
                  <div style={{ color: '#5a6472', marginTop: 4, fontSize: 13 }}>
                    Order: {item.sort_order || 0} · Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                  </div>
                  {item.description ? <div style={{ marginTop: 6, color: '#5a6472' }}>{item.description}</div> : null}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button type="button" onClick={() => handlePublish(item, !item.is_published)} className="button button-secondary">{item.is_published ? 'Hide' : 'Publish'}</button>
                  <button type="button" onClick={() => handleEdit(item)} className="button button-secondary">Edit</button>
                  <button type="button" onClick={() => handleReorder(item, 'up')} disabled={index === 0} className="button button-secondary">Move up</button>
                  <button type="button" onClick={() => handleReorder(item, 'down')} disabled={index === items.length - 1} className="button button-secondary">Move down</button>
                  <button type="button" onClick={() => handleDelete(item)} className="button button-secondary">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
