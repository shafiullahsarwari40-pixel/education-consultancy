// Exercises the real route code with an in-memory Supabase double.
// No database requests, documents, emails or Telegram messages leave this process.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = process.cwd();
const asModule = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const helperUrl = pathToFileURL(path.join(root, 'app/api/_lib/request.js')).href;
const storageUrl = asModule((await readFile(path.join(root, 'lib/documentStorage.js'), 'utf8')).replace("import 'server-only';", ''));
const nextUrl = pathToFileURL(require.resolve('next/server.js')).href;
const routeSource = await readFile(path.join(root, 'app/api/submit/route.js'), 'utf8');
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => { throw new Error('Network access disabled in contract checks'); };

function mockDatabase(options = {}) {
  const calls = { inserts: [], deletes: [], uploads: [], removals: [] };
  return {
    calls,
    auth: { getUser: async () => options.invalidAuth ? { error: { message: 'expired' } } : { data: { user: { id: `test-user-${Math.random()}` } } } },
    from(table) {
      return {
        insert(rows) {
          calls.inserts.push({ table, rows });
          if (table === 'applications') return { select: () => ({ single: async () => ({ data: { id: 'test-application' }, error: null }) }) };
          return Promise.resolve({ error: table === 'application_documents' && options.documentFailure ? { message: 'test failure' } : null });
        },
        delete() {
          return { eq: async (field, id) => { calls.deletes.push({ table, field, id }); return { error: null }; } };
        },
      };
    },
    storage: {
      from(bucket) {
        return {
          async upload(objectPath) {
            calls.uploads.push({ bucket, objectPath });
            return { error: options.failUpload === calls.uploads.length ? { message: 'test upload failure' } : null };
          },
          async remove(paths) { calls.removals.push({ bucket, paths }); return { error: null }; },
          getPublicUrl() { throw new Error('Private documents must never produce a public URL'); },
        };
      },
    },
  };
}

async function loadRoute(database) {
  globalThis.__horizonApiContract = { supabaseAdmin: database, isInvalidSupabaseApiKeyError: () => false };
  const source = routeSource
    .replace("from 'next/server'", `from '${nextUrl}'`)
    .replace(/import \{ supabaseAdmin, isInvalidSupabaseApiKeyError \} from '[^']+';/, 'const { supabaseAdmin, isInvalidSupabaseApiKeyError } = globalThis.__horizonApiContract;')
    .replace("from '../../../lib/documentStorage'", `from '${storageUrl}'`)
    .replace("from '../_lib/request'", `from '${helperUrl}'`)
    .replace("import nodemailer from 'nodemailer';", 'const nodemailer = { createTransport: () => ({ sendMail: async () => {} }) };');
  return import(`${asModule(source)}#${Math.random()}`);
}

function applicationRequest({ token = 'test-token', invalidFile = false, files = 0 } = {}) {
  const body = new FormData();
  body.set('full_name', 'Contract Test');
  body.set('email', 'contract@example.invalid');
  body.set('phone', '+905551234567');
  for (const type of ['passport', 'transcript'].slice(0, files)) {
    body.set(type, new Blob([invalidFile ? 'not a PDF' : '%PDF-1.7\ncontract-test'], { type: 'application/pdf' }), `${type}.pdf`);
  }
  return new Request('http://localhost/api/submit', { method: 'POST', body, headers: token ? { Authorization: `Bearer ${token}` } : {} });
}

try {
  {
    const db = mockDatabase();
    const { POST } = await loadRoute(db);
    const response = await POST(applicationRequest({ token: '' }));
    assert.equal(response.status, 401);
    assert.equal(db.calls.inserts.length, 0);
  }
  {
    const db = mockDatabase({ invalidAuth: true });
    const { POST } = await loadRoute(db);
    assert.equal((await POST(applicationRequest())).status, 401);
    assert.equal(db.calls.inserts.length, 0);
  }
  {
    const db = mockDatabase();
    const { POST } = await loadRoute(db);
    assert.equal((await POST(applicationRequest({ invalidFile: true, files: 1 }))).status, 400);
    assert.equal(db.calls.inserts.length, 0, 'Invalid documents must be rejected before an application is saved');
  }
  {
    const db = mockDatabase({ failUpload: 2 });
    const { POST } = await loadRoute(db);
    assert.equal((await POST(applicationRequest({ files: 2 }))).status, 500);
    assert.deepEqual(db.calls.removals[0].paths, [db.calls.uploads[0].objectPath]);
    assert.ok(db.calls.deletes.some(({ table, id }) => table === 'applications' && id === 'test-application'));
  }
  {
    const db = mockDatabase({ documentFailure: true });
    const { POST } = await loadRoute(db);
    assert.equal((await POST(applicationRequest({ files: 1 }))).status, 500);
    assert.equal(db.calls.removals[0].paths.length, 1);
    assert.ok(db.calls.deletes.some(({ table }) => table === 'applications'));
  }
  {
    const db = mockDatabase();
    const { POST } = await loadRoute(db);
    const response = await POST(applicationRequest({ files: 1 }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, applicationId: 'test-application' });
    assert.equal(db.calls.uploads[0].bucket, 'student-documents');
    const documents = db.calls.inserts.find(({ table }) => table === 'application_documents').rows[0];
    assert.match(documents.passport_url, /^storage:\/\/student-documents\//);
    assert.equal(db.calls.deletes.length, 0);
  }
  const { readJson, RequestError } = await import(helperUrl);
  await assert.rejects(readJson(new Request('http://localhost/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })), (error) => error instanceof RequestError && error.status === 400);
  await assert.rejects(readJson(new Request('http://localhost/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'a'.repeat(20_000) }) })), (error) => error instanceof RequestError && error.status === 413);
  console.log('PASS: auth gates, file signatures, private references, upload/document failure cleanup, success contract, malformed JSON and payload limits. No live submissions were made.');
} finally {
  globalThis.fetch = originalFetch;
  delete globalThis.__horizonApiContract;
}
