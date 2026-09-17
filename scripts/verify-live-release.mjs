import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'node:crypto';

nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=') || true];
}));
if (!args.live) throw new Error('This test creates and removes disposable live records. Re-run with --live after reviewing the target.');

const baseUrl = String(args['base-url'] || 'http://localhost:3001').replace(/\/$/, '');
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!projectUrl || !anonKey || !serviceKey) throw new Error('Supabase release-test configuration is incomplete.');
if (new URL(projectUrl).hostname !== 'goerjwjxpwmpimkeiokx.supabase.co') throw new Error('Refusing to test an unreviewed Supabase project.');
if (!/^https?:\/\//.test(baseUrl)) throw new Error('Provide an HTTP(S) base URL.');

const admin = createClient(projectUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const runId = randomUUID();
const password = `Release-${randomBytes(18).toString('base64url')}!9a`;
const users = [];
const createdStorage = [];
let applicationId = null;
const checks = [];

function record(name, ok, detail = '') {
  checks.push({ name, ok, detail });
}

function assertResponse(name, response, expected) {
  const ok = Array.isArray(expected) ? expected.includes(response.status) : response.status === expected;
  record(name, ok, `HTTP ${response.status}`);
  return ok;
}

async function json(response) {
  return response.json().catch(() => ({}));
}

async function createTestUser(label) {
  const email = `release-audit-${label}-${runId}@example.invalid`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { release_audit: true },
  });
  if (error || !data?.user) throw new Error(`Could not create disposable ${label} account.`);
  users.push(data.user.id);
  return { id: data.user.id, email };
}

async function waitForProfile(id) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data } = await admin.from('profiles').select('id,role').eq('id', id).maybeSingle();
    if (data) return data;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

async function signIn(user) {
  const client = createClient(projectUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInWithPassword({ email: user.email, password });
  if (error || !data?.session) throw new Error('Disposable sign-in failed.');
  return { client, token: data.session.access_token };
}

async function cleanup() {
  if (applicationId) {
    const { data: documents } = await admin.from('application_documents')
      .select('passport_url,transcript_url,diploma_url,exam_sheet_url,id_card_url,photo_url')
      .eq('application_id', applicationId);
    for (const row of documents || []) {
      for (const value of Object.values(row)) {
        if (typeof value === 'string' && value.startsWith('storage://student-documents/')) {
          createdStorage.push({ bucket: 'student-documents', path: value.slice('storage://student-documents/'.length) });
        }
      }
    }
    const { data: application } = await admin.from('applications')
      .select('acceptance_letter_path').eq('id', applicationId).maybeSingle();
    if (application?.acceptance_letter_path) createdStorage.push({ bucket: 'acceptance-letters', path: application.acceptance_letter_path });
    await admin.from('admin_notifications').delete().eq('application_id', applicationId);
    await admin.from('application_documents').delete().eq('application_id', applicationId);
    await admin.from('applications').delete().eq('id', applicationId);
  }
  for (const item of createdStorage) await admin.storage.from(item.bucket).remove([item.path]);
  if (users.length) await admin.from('profiles').delete().in('id', users);
  for (const id of users.reverse()) await admin.auth.admin.deleteUser(id);
}

try {
  const [studentA, studentB, staff] = await Promise.all([
    createTestUser('student-a'),
    createTestUser('student-b'),
    createTestUser('staff'),
  ]);
  const profiles = await Promise.all([studentA, studentB, staff].map(({ id }) => waitForProfile(id)));
  record('new students have no privileged profile', profiles.slice(0, 2).every((profile) => !profile || profile.role === 'student'));

  const [{ client: clientA, token: tokenA }, { client: clientB, token: tokenB }, { token: staffToken }] = await Promise.all([
    signIn(studentA), signIn(studentB), signIn(staff),
  ]);

  const anonymous = createClient(projectUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const anonymousApplicationRead = await anonymous.from('applications').select('id').limit(1);
  record('anonymous application table access denied', Boolean(anonymousApplicationRead.error));

  const roleAttempt = await clientA.from('profiles').update({ role: 'admin' }).eq('id', studentA.id).select('role');
  const insertAttempt = await clientA.from('profiles').insert({ id: studentA.id, email: studentA.email, role: 'admin' }).select('role');
  const { data: roleAfter } = await admin.from('profiles').select('role').eq('id', studentA.id).single();
  const roleProtected = (!roleAttempt.data?.length || Boolean(roleAttempt.error))
    && Boolean(insertAttempt.error)
    && roleAfter?.role !== 'admin';
  record('student role escalation denied', roleProtected, roleProtected ? 'denied' : 'role protection missing');
  if (!roleProtected) await admin.from('profiles').delete().eq('id', studentA.id);

  const promote = await admin.from('profiles').upsert({ id: staff.id, email: staff.email, role: 'admin' }).select('role').single();
  record('trusted server admin assignment', !promote.error && promote.data?.role === 'admin');

  const unauthorized = await fetch(`${baseUrl}/api/student/application`);
  assertResponse('student API requires authentication', unauthorized, 401);

  const form = new FormData();
  Object.entries({
    full_name: 'Release Audit Student', email: studentA.email, phone: '+900000000000',
    country: 'Türkiye', program: 'Bachelor', university: 'Release Audit University',
    message: `Automated disposable release verification ${runId}`,
  }).forEach(([key, value]) => form.append(key, value));
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  form.append('passport', new Blob([png], { type: 'image/png' }), 'release-audit.png');
  const submission = await fetch(`${baseUrl}/api/submit`, { method: 'POST', headers: { Authorization: `Bearer ${tokenA}` }, body: form });
  const submissionBody = await json(submission);
  applicationId = submissionBody.applicationId || null;
  record('authenticated application submission', submission.ok && submissionBody.success && Boolean(applicationId), `HTTP ${submission.status}`);
  if (!applicationId) throw new Error('Application flow stopped at submission.');

  const ownApplication = await fetch(`${baseUrl}/api/student/application`, { headers: { Authorization: `Bearer ${tokenA}` } });
  const ownBody = await json(ownApplication);
  record('student reads own application', ownApplication.ok && ownBody.application?.id === applicationId && ownBody.documents?.includes('passport'));

  const otherApplication = await fetch(`${baseUrl}/api/student/application`, { headers: { Authorization: `Bearer ${tokenB}` } });
  const otherBody = await json(otherApplication);
  record('student cannot read another application', otherApplication.ok && otherBody.application === null);

  const ownDocument = await fetch(`${baseUrl}/api/student/document?type=passport`, { headers: { Authorization: `Bearer ${tokenA}` } });
  record('student downloads own private document', ownDocument.ok && ownDocument.headers.get('cache-control')?.includes('no-store'));
  const otherDocument = await fetch(`${baseUrl}/api/student/document?type=passport`, { headers: { Authorization: `Bearer ${tokenB}` } });
  assertResponse('student cannot download another document', otherDocument, 404);

  const deniedAdmin = await fetch(`${baseUrl}/api/admin/applications`, { headers: { Authorization: `Bearer ${tokenA}` } });
  assertResponse('student denied from admin API', deniedAdmin, 403);
  const allowedAdmin = await fetch(`${baseUrl}/api/admin/applications`, { headers: { Authorization: `Bearer ${staffToken}` } });
  const allowedAdminBody = await json(allowedAdmin);
  record('staff reads admin applications', allowedAdmin.ok && allowedAdminBody.applications?.some(({ id }) => id === applicationId));

  const rlsA = await clientA.from('applications').select('id,user_id').eq('id', applicationId);
  const rlsB = await clientB.from('applications').select('id,user_id').eq('id', applicationId);
  record('student direct application-table access denied', Boolean(rlsA.error) && Boolean(rlsB.error));

  const adminDetail = await fetch(`${baseUrl}/api/admin/applications/${applicationId}`, { headers: { Authorization: `Bearer ${staffToken}` } });
  const detailBody = await json(adminDetail);
  const passportEndpoint = detailBody.documents?.passport_url;
  record('staff reads application detail', adminDetail.ok && detailBody.application?.id === applicationId && typeof passportEndpoint === 'string');
  const staffDocument = await fetch(new URL(passportEndpoint, baseUrl), { headers: { Authorization: `Bearer ${staffToken}` } });
  record('staff downloads private student document', staffDocument.ok && staffDocument.headers.get('cache-control')?.includes('no-store'));

  const letterForm = new FormData();
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
  letterForm.append('file', new Blob([pdf], { type: 'application/pdf' }), 'release-audit.pdf');
  letterForm.append('status', 'accepted');
  letterForm.append('admin_note', 'Disposable release verification');
  const letterUpload = await fetch(`${baseUrl}/api/admin/applications/${applicationId}/letter`, {
    method: 'POST', headers: { Authorization: `Bearer ${staffToken}` }, body: letterForm,
  });
  const letterBody = await json(letterUpload);
  record('staff uploads private acceptance letter', letterUpload.ok && letterBody.application?.application_status === 'accepted');
  const studentLetter = await fetch(`${baseUrl}/api/student/acceptance-letter`, { headers: { Authorization: `Bearer ${tokenA}` } });
  record('student downloads own acceptance letter', studentLetter.ok && studentLetter.headers.get('cache-control')?.includes('no-store'));
  const otherLetter = await fetch(`${baseUrl}/api/student/acceptance-letter`, { headers: { Authorization: `Bearer ${tokenB}` } });
  assertResponse('student cannot download another acceptance letter', otherLetter, 404);

  const { data: storedDocs } = await admin.from('application_documents').select('passport_url').eq('application_id', applicationId).single();
  const privatePath = storedDocs?.passport_url?.replace('storage://student-documents/', '');
  const publicCandidate = admin.storage.from('student-documents').getPublicUrl(privatePath).data.publicUrl;
  const publicResponse = await fetch(`${publicCandidate}?release_audit=${runId}`, { method: 'HEAD', cache: 'no-store' });
  record('student document rejects public access', publicResponse.status >= 400, `HTTP ${publicResponse.status}`);
} catch (error) {
  record('test execution completed', false, error instanceof Error ? error.message : 'Unknown error');
} finally {
  await cleanup();
  const cleanupChecks = await Promise.all(users.map((id) => admin.auth.admin.getUserById(id)));
  record('disposable accounts removed', cleanupChecks.every(({ data }) => !data?.user));
  if (applicationId) {
    const { data } = await admin.from('applications').select('id').eq('id', applicationId).maybeSingle();
    record('disposable application removed', !data);
  }
  const failed = checks.filter(({ ok }) => !ok);
  console.log(JSON.stringify({ target: new URL(baseUrl).origin, passed: checks.length - failed.length, failed: failed.length, checks }, null, 2));
  if (failed.length) process.exitCode = 1;
}
