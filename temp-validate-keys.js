const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .reduce((acc, line) => {
    const idx = line.indexOf('=');
    if (idx < 0) return acc;
    acc[line.slice(0, idx)] = line.slice(idx + 1);
    return acc;
  }, {});

const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const url = env.NEXT_PUBLIC_SUPABASE_URL;
console.log('URL:', url);
console.log('Anon key exists:', Boolean(anonKey));
console.log('Anon key length:', anonKey?.length || 0);
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    let normalized = payload.replace(/-/g,'+').replace(/_/g,'/');
    while (normalized.length % 4 !== 0) normalized += '=';
    return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
  } catch (err) {
    return { error: err.message };
  }
}
console.log('Anon payload:', anonKey ? decodeJwt(anonKey) : null);
if (url && anonKey) {
  const supabase = createClient(url, anonKey);
  supabase.auth.getSession().then((res) => {
    console.log('getSession result:', res);
    return supabase.auth.signInWithPassword({ email: 'test@example.com', password: 'fakePassword123' });
  }).then((res) => {
    console.log('signInWithPassword result:', res);
  }).catch((err) => {
    console.error('error:', err);
  });
}
