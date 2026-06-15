import { supabaseAdmin, supabaseAdminKeyMalformed } from './lib/supabaseAdmin.js';
console.log('supabaseAdminKeyMalformed=', supabaseAdminKeyMalformed);
console.log('supabaseAdmin loaded=', !!supabaseAdmin);
if (!supabaseAdmin) process.exit(0);
try {
  const res = await supabaseAdmin.from('applications').select('id').limit(1);
  console.log('result', JSON.stringify(res, null, 2));
} catch (err) {
  console.error('request failed', err);
}
