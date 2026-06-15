const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(Boolean).reduce((acc, line) => {
  const idx = line.indexOf('=');
  if (idx < 0) return acc;
  const key = line.slice(0, idx);
  const val = line.slice(idx + 1);
  acc[key] = val;
  return acc;
}, {});
const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const token = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImJkYWExNzg3LTE3MmItNDJkMS04MjM0LTlkYzNlZjFkNGEwYiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2dvZXJqd2p4cHdtcGlta2Vpb2t4LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkMzdmZDk0Mi1hYmZhLTRlYTctYTY5OC1mZjIyOGQxNGYwYWUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgxNDY3MTAxLCJpYXQiOjE3ODE0NjM1MDEsImVtYWlsIjoic2hhZml1bGxhaHNoMzVAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3ODE0NjM1MDF9XSwic2Vzc2lvbl9pZCI6IjI0NzQ5NTJjLTdjNjEtNDc1Zi05ZGNkLTgwMjkxY2UzZTdhZiIsImlzX2Fub255bW91cyI6ZmFsc2V9.FEoj1lFSG61YA3TRx6R6T-j9E1jNZcBxCgbaBbdP-GDRX-T4_9d78AV0f0qVHuNvJIaNpUHUUsOVq3pDJl-i-w';
(async () => {
  try {
    const r = await supabaseAdmin.auth.getUser(token);
    console.log(JSON.stringify(r, null, 2));
  } catch (err) {
    console.error(err);
  }
})();
