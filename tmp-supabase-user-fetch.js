const fs = require('fs');
const envText = fs.readFileSync('.env.local', 'utf8');
const env = envText
  .split(/\r?\n/)
  .filter(Boolean)
  .reduce((acc, line) => {
    const idx = line.indexOf('=');
    if (idx < 0) return acc;
    const key = line.slice(0, idx);
    const value = line.slice(idx + 1);
    acc[key] = value;
    return acc;
  }, {});
const token = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImJkYWExNzg3LTE3MmItNDJkMS04MjM0LTlkYzNlZjFkNGEwYiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2dvZXJqd2p4cHdtcGlta2Vpb2t4LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkMzdmZDk0Mi1hYmZhLTRlYTctYTY5OC1mZjIyOGQxNGYwYWUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgxNDY3MTAxLCJpYXQiOjE3ODE0NjM1MDEsImVtYWlsIjoic2hhZml1bGxhaHNoMzVAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3ODE0NjM1MDF9XSwic2Vzc2lvbl9pZCI6IjI0NzQ5NTJjLTdjNjEtNDc1Zi05ZGNkLTgwMjkxY2UzZTdhZiIsImlzX2Fub255bW91cyI6ZmFsc2V9.FEoj1lFSG61YA3TRx6R6T-j9E1jNZcBxCgbaBbdP-GDRX-T4_9d78AV0f0qVHuNvJIaNpUHUUsOVq3pDJl-i-w';
const url = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '') + '/auth/v1/user';

(async () => {
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Accept: 'application/json'
      }
    });
    const text = await resp.text();
    console.log('status', resp.status, resp.statusText);
    console.log('body', text);
  } catch (err) {
    console.error('fetch error', err);
  }
})();
