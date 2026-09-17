import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';

nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!projectUrl || !serviceKey) throw new Error('Supabase server configuration is incomplete.');
if (new URL(projectUrl).hostname !== 'goerjwjxpwmpimkeiokx.supabase.co') throw new Error('Refusing to audit an unreviewed project.');

const admin = createClient(projectUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const profiles = [];
for (let start = 0; ; start += 500) {
  const { data, error } = await admin.from('profiles').select('id,role').order('id').range(start, start + 499);
  if (error) throw new Error('Could not read profile roles.');
  profiles.push(...data);
  if (data.length < 500) break;
}
const users = [];
for (let page = 1; ; page += 1) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw new Error('Could not read Auth users.');
  users.push(...data.users);
  if (data.users.length < 1000) break;
}
const byId = new Map(users.map((user) => [user.id, user]));
const profileAdmins = profiles.filter(({ role }) => role === 'admin');
const appAdmins = users.filter((user) => user.app_metadata?.role === 'admin');
const profileAdminsWithAppRole = profileAdmins.filter(({ id }) => byId.get(id)?.app_metadata?.role === 'admin');
console.log(JSON.stringify({
  projectHost: new URL(projectUrl).hostname,
  authUsers: users.length,
  profiles: profiles.length,
  profileStudents: profiles.filter(({ role }) => role === 'student').length,
  profileAdmins: profileAdmins.length,
  appMetadataAdmins: appAdmins.length,
  profileAdminsWithAppRole: profileAdminsWithAppRole.length,
  profileAdminsMissingAppRole: profileAdmins.length - profileAdminsWithAppRole.length,
  authUsersMissingProfiles: users.filter(({ id }) => !profiles.some((profile) => profile.id === id)).length,
}, null, 2));
