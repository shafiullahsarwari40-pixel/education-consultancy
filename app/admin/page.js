'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [apps, setApps] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data?.session ?? null;
      if (!s) return router.push('/admin/login');
      setSession(s);
      await Promise.all([
        fetchApps(s.access_token, search, sort),
        fetchMessages(s.access_token),
      ]);
    })();
  }, []);

  async function fetchMessages(token) {
    setError(null);
    try {
      const res = await fetch('/api/admin/contact-messages', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unable to fetch contact messages' }));
        throw new Error(body.error || 'Unable to fetch contact messages');
      }
      const body = await res.json();
      setMessages(body.messages || []);
    } catch (err) {
      console.error('Fetch contact messages error', err);
      setError(err.message || 'Failed to load contact messages');
    }
  }

  async function fetchApps(token, q = '', sortOrder = 'desc') {
    setLoading(true);
    setError(null);
    const url = `/api/admin/applications?search=${encodeURIComponent(q)}&sort=${sortOrder}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      setLoading(false);
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Fetch error', err);
      setError(err.error || err.message || 'Failed to fetch applications');
      return;
    }
    const body = await res.json();
    setApps(body.applications || []);
    setStats(body.stats || null);
    setLoading(false);
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  async function handleSearchSubmit(e) {
    e.preventDefault();
    if (!session) return;
    await fetchApps(session.access_token, search, sort);
  }

  async function handleSortToggle() {
    const next = sort === 'desc' ? 'asc' : 'desc';
    setSort(next);
    if (session) await fetchApps(session.access_token, search, next);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin Dashboard</h1>
        <div>
          <Link href="/">Home</Link>
        </div>
      </header>

      <section style={{ marginTop: 20 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Search name or email" value={search} onChange={handleSearchChange} />
          <button type="submit">Search</button>
          <button type="button" onClick={handleSortToggle}>Sort: {sort}</button>
        </form>
      </section>

      <section style={{ marginTop: 20 }}>
        {stats ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ padding: 12, border: '1px solid #ddd' }}>Total: {stats.total}</div>
            <div style={{ padding: 12, border: '1px solid #ddd' }}>New: {stats.new}</div>
            <div style={{ padding: 12, border: '1px solid #ddd' }}>Accepted: {stats.accepted}</div>
            <div style={{ padding: 12, border: '1px solid #ddd' }}>Rejected: {stats.rejected}</div>
            <div style={{ padding: 12, border: '1px solid #ddd' }}>This month: {stats.this_month}</div>
          </div>
        ) : (
          <p>Loading stats…</p>
        )}
      </section>

      {error && (
        <section style={{ marginTop: 12, color: 'crimson' }}>
          <strong>Error:</strong> {error}
        </section>
      )}

      <section style={{ marginTop: 20 }}>
        {loading ? (
          <p>Loading applications…</p>
        ) : apps.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Program</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>
                    <Link href={`/admin/applications/${a.id}`}>{a.full_name}</Link>
                  </td>
                  <td style={{ padding: 8 }}>{a.email}</td>
                  <td style={{ padding: 8 }}>{a.program}</td>
                  <td style={{ padding: 8 }}>{a.status || 'New'}</td>
                  <td style={{ padding: 8 }}>{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 40 }}>
        <h2>Contact Messages</h2>
        {messages.length === 0 ? (
          <p>No contact messages found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Subject</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Message</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Received</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{msg.name}</td>
                  <td style={{ padding: 8 }}>{msg.email}</td>
                  <td style={{ padding: 8 }}>{msg.subject || '—'}</td>
                  <td style={{ padding: 8, whiteSpace: 'pre-wrap', maxWidth: 360 }}>{msg.message}</td>
                  <td style={{ padding: 8 }}>{new Date(msg.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
