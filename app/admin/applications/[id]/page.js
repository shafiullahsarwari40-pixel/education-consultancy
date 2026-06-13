import ApplicationDetailClient from '../../../../components/ApplicationDetailClient';

export default async function ApplicationDetail({ params }) {
  const { id } = await params;

  if (!id) {
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ color: 'crimson' }}>Invalid application id</h2>
      </div>
    );
  }

  return <ApplicationDetailClient id={id} />;
}
