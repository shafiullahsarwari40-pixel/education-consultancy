export default function TestRoute({ params }) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Route Test</h1>
      <p>Params received by server component:</p>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: 12 }}>{JSON.stringify(params)}</pre>
    </div>
  );
}
