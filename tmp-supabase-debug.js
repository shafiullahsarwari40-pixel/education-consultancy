const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const envText = fs.readFileSync('.env.local', 'utf8');
const env = envText
  .split(/\r?\n/)
  .filter(Boolean)
  .reduce((acc, line) => {
    const idx = line.indexOf('=');
    if (idx < 0) return acc;
    acc[line.slice(0, idx)] = line.slice(idx + 1);
    return acc;
  }, {});

const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('env keys:', {
    url: env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
    anon: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
    service: env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
  });

  try {
    const login = await anonClient.auth.signInWithPassword({
      email: 'shafiullahsh35@gmail.com',
      password: 'Afghan@3578',
    });
    console.log('signInWithPassword', JSON.stringify(login, null, 2));
    const accessToken = login.data?.session?.access_token;
    if (!accessToken) {
      console.log('no access token returned');
      return;
    }

    try {
      const userCheck = await adminClient.auth.getUser(accessToken);
      console.log('adminClient.auth.getUser result', JSON.stringify(userCheck, null, 2));
    } catch (adminErr) {
      console.error('adminClient.auth.getUser error', adminErr);
    }

    try {
      const resp = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Accept: 'application/json',
        },
      });
      const text = await resp.text();
      console.log('fetch /auth/v1/user status', resp.status, resp.statusText, 'body', text);
    } catch (fetchErr) {
      console.error('fetch error', fetchErr);
    }
  } catch (err) {
    console.error('login error', err);
  }
})();