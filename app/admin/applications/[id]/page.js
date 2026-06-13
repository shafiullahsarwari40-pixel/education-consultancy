import ApplicationDetailClient from '../../../../components/ApplicationDetailClient';

export default async function ApplicationDetail({ params }) {
  const id = params?.id ?? null;

  // Render params server-side into the page for debugging
  if (!id) {
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ color: 'crimson' }}>Debug: No `id` in params</h2>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: 12 }}>{JSON.stringify(params)}</pre>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Debug: Server params</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: 12 }}>{JSON.stringify(params)}</pre>
      <ApplicationDetailClient id={id} />
    </div>
  );
}
