const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const envPath = path.join(process.cwd(), '.env.local');
const envRaw = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env = {};
for (const line of envRaw.split(/\r?\n/)) {
  const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)$/);
  if (!match) continue;
  let value = match[2].trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  env[match[1].trim()] = value;
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
console.log('SUPABASE_URL set:', Boolean(url));
console.log('SERVICE_ROLE_KEY set:', Boolean(key));
const token = process.argv[2];
if (!token) {
  console.error('Missing token argument');
  process.exit(1);
}
const supabaseAdmin = createClient(url, key);
(async () => {
  try {
    const user = await supabaseAdmin.auth.getUser(token);
    console.log('getUser result:', JSON.stringify(user, null, 2));
    if (user?.data?.user?.id) {
      const profile = await supabaseAdmin.from('profiles').select('id,role,email').eq('id', user.data.user.id).single();
      console.log('profile result:', JSON.stringify(profile, null, 2));
    }
  } catch (err) {
    console.error('ERR', err);
  }
})();
