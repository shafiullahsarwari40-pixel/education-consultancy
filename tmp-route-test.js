const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
  if (!line || line.startsWith('#')) return acc;
  const idx = line.indexOf('=');
  if (idx < 0) return acc;
  const key = line.slice(0, idx).trim();
  let val = line.slice(idx + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  acc[key] = val;
  return acc;
}, {});

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const browserToken = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImJkYWExNzg3LTE3MmItNDJkMS04MjM0LTlkYzNlZjFkNGEwYiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2dvZXJqd2p4cHdtcGlta2Vpb2t4LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJlNGExZmU0Ni05YTcxLTRiODYtOGQ4ZC03ZWNlZThkOTM0OTUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgxNTc1ODA5LCJpYXQiOjE3ODE1NzIyMDksImVtYWlsIjoic2hhZml1bGxhaHNhcndhcmk0MEBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoic2hhZml1bGxhaHNhcndhcmk0MEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiJlNGExZmU0Ni05YTcxLTRiODYtOGQ4ZC03ZWNlZThkOTM0OTUifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc4MTU3MjIwOX1dLCJzZXNzaW9uX2lkIjoiYjJmYjgyNDEtOGIzOC00ZDYyLTg5MmItNDY0YmFhZjZjNmExIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.tozq4xWl45kRBLerE0hdDuMDAKFQm8uX27xae5Un0BMYiZytGOLbKV2lV3NkiTmZPzol7A5pkPNI5oFy106_nA';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
  } catch (error) {
    return null;
  }
}

(async () => {
  try {
    console.log('token payload', decodeJwt(browserToken));

    const result = await admin.auth.getUser(browserToken);
    console.log('supabaseAdmin.auth.getUser result', JSON.stringify(result, null, 2));

    const authUrl = `${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`;
    const res = await fetch(authUrl, {
      headers: {
        Authorization: `Bearer ${browserToken}`,
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Accept: 'application/json',
      },
    });
    console.log('direct auth/v1/user status', res.status);
    console.log('direct auth/v1/user body', await res.text());
  } catch (err) {
    console.error('exception', err);
  }
})();
