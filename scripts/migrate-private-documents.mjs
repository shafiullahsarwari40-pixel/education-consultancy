import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const args = process.argv.slice(2);
if (args.some((arg) => !['--apply', '--dry-run'].includes(arg) && !arg.startsWith('--resume='))) {
  throw new Error('Use --dry-run (default), --apply, or --resume=RUN_ID with either mode.');
}
if (args.includes('--apply') && args.includes('--dry-run')) throw new Error('Choose one mode.');
const apply = args.includes('--apply');
const resumedRun = args.find((arg) => arg.startsWith('--resume='))?.slice(9);
if (resumedRun && !/^[0-9A-Za-z-]{20,80}$/.test(resumedRun)) throw new Error('Invalid recovery run ID.');
if (apply && !resumedRun) throw new Error('Run the default dry-run first, then execute only its reviewed plan with --apply --resume=RUN_ID.');
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!projectUrl || !secret) throw new Error('Server Supabase configuration is required.');
const expectedHost = 'goerjwjxpwmpimkeiokx.supabase.co';
if (new URL(projectUrl).hostname !== expectedHost) throw new Error('This migration is restricted to the reviewed application project.');
const client = createClient(projectUrl, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const sourceBucket = 'application-uploads';
const targetBucket = 'student-documents';
const documentColumns = ['passport_url', 'transcript_url', 'diploma_url', 'exam_sheet_url', 'id_card_url', 'photo_url'];
const documentColumnSet = new Set(documentColumns);
const auditRoot = path.resolve(process.cwd(), '.private-migrations');
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
const objectKey = ({ bucket, objectPath }) => bucket + '/' + objectPath;

function documentMime(buffer) {
  if (buffer.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  if (['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString())) return 'image/gif';
  return null;
}

function parseReference(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    let bucket;
    let objectPath;
    if (url.protocol === 'storage:') {
      bucket = url.hostname;
      objectPath = decodeURIComponent(url.pathname.slice(1));
    } else {
      if (url.protocol !== 'https:' || url.hostname !== expectedHost) return null;
      const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public\/|sign\/|authenticated\/)?([^/]+)\/(.+)$/);
      if (!match) return null;
      bucket = match[1];
      objectPath = decodeURIComponent(match[2]);
    }
    if (!objectPath || /[\u0000-\u001f]/.test(objectPath) || objectPath.split('/').some((part) => ['.', '..', ''].includes(part))) return null;
    return { bucket, objectPath };
  } catch {
    return null;
  }
}

async function rows(table, columns) {
  const result = [];
  for (let start = 0; ; start += 500) {
    const { data, error } = await client.from(table).select(columns).order('id').range(start, start + 499);
    if (error) throw new Error('Could not read the required migration inventory from ' + table + '. No changes made in this phase.');
    result.push(...data);
    if (data.length < 500) return result;
  }
}

async function inventory() {
  const [documents, applications, media, bucketResult] = await Promise.all([
    rows('application_documents', ['id', 'application_id', ...documentColumns].join(',')),
    rows('applications', 'id,acceptance_letter_url,acceptance_letter_path'),
    rows('homepage_media', 'id,media_url,media_path,thumbnail_url,button_link'),
    client.storage.listBuckets(),
  ]);
  if (bucketResult.error) throw new Error('Could not verify bucket visibility.');
  const publicBuckets = new Set(bucketResult.data.filter((bucket) => bucket.public).map((bucket) => bucket.name));
  const mediaReferences = new Set();
  for (const row of media) {
    for (const column of ['media_url', 'thumbnail_url', 'button_link']) {
      const reference = parseReference(row[column]);
      if (reference) mediaReferences.add(objectKey(reference));
    }
    if (row.media_path) {
      const direct = parseReference(row.media_path);
      if (direct) mediaReferences.add(objectKey(direct));
      else mediaReferences.add(sourceBucket + '/' + decodeURIComponent(row.media_path).replace(/^\/+/, ''));
    }
  }
  const references = [];
  let unknownReferences = 0;
  let publicAcceptanceReferences = 0;
  let privateAcceptanceReferences = 0;
  for (const row of documents) {
    for (const column of documentColumns) {
      if (!row[column]) continue;
      const source = parseReference(row[column]);
      if (!source) { unknownReferences += 1; continue; }
      references.push({ table: 'application_documents', id: row.id, column, oldValue: row[column], source });
    }
  }
  for (const row of applications) {
    const source = parseReference(row.acceptance_letter_url);
    if (source) {
      references.push({ table: 'applications', id: row.id, column: 'acceptance_letter_url', oldValue: row.acceptance_letter_url, source });
      if (publicBuckets.has(source.bucket)) publicAcceptanceReferences += 1;
      else privateAcceptanceReferences += 1;
    }
    if (row.acceptance_letter_path) {
      // The current schema stores these raw paths in the existing PRIVATE bucket.
      const pathReference = parseReference(row.acceptance_letter_path) || { bucket: 'acceptance-letters', objectPath: row.acceptance_letter_path };
      references.push({ table: 'applications', id: row.id, column: 'acceptance_letter_path', oldValue: row.acceptance_letter_path, source: pathReference });
      if (publicBuckets.has(pathReference.bucket)) publicAcceptanceReferences += 1;
      else privateAcceptanceReferences += 1;
    }
  }
  return { documents, references, mediaReferences, publicBuckets, unknownReferences, publicAcceptanceReferences, privateAcceptanceReferences };
}

async function makePlan() {
  const current = await inventory();
  const groups = new Map();
  const counts = {
    documentRows: current.documents.length,
    referencedObjects: new Set(current.references.map(({ source }) => objectKey(source))).size,
    candidateRows: 0,
    candidateReferences: 0,
    candidateObjects: 0,
    excludedHomepageObjects: 0,
    excludedPrivateReferences: 0,
    excludedOutOfScopeReferences: 0,
    unknownReferences: current.unknownReferences,
    publicAcceptanceReferences: current.publicAcceptanceReferences,
    privateAcceptanceReferences: current.privateAcceptanceReferences,
  };
  const candidateRows = new Set();
  const collisions = new Set();
  const runId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomBytes(4).toString('hex');
  for (const reference of current.references) {
    const { source } = reference;
    const key = objectKey(source);
    if (!current.publicBuckets.has(source.bucket)) { counts.excludedPrivateReferences += 1; continue; }
    if (current.mediaReferences.has(key)) { collisions.add(key); continue; }
    // Acceptance letters are currently private. Any public legacy acceptance
    // reference requires a separate schema/route review before changing buckets.
    if (reference.table !== 'application_documents' || source.bucket !== sourceBucket || !source.objectPath.startsWith('applications/')) {
      counts.excludedOutOfScopeReferences += 1;
      continue;
    }
    if (!groups.has(key)) {
      const extension = source.objectPath.split('.').pop()?.toLowerCase();
      groups.set(key, {
        source,
        targetPath: 'legacy-migration/' + runId + '/' + hash(Buffer.from(key)) + (extension && /^[a-z0-9]{1,8}$/.test(extension) ? '.' + extension : ''),
        references: [],
        sha256: null,
        bytes: null,
        copied: false,
        removed: false,
      });
    }
    groups.get(key).references.push({ table: reference.table, id: reference.id, column: reference.column, oldValue: reference.oldValue, updated: false });
    candidateRows.add(reference.id);
    counts.candidateReferences += 1;
  }
  counts.candidateRows = candidateRows.size;
  counts.candidateObjects = groups.size;
  counts.excludedHomepageObjects = collisions.size;
  return { version: 1, projectHost: expectedHost, runId, createdAt: new Date().toISOString(), phase: 'planned', counts, entries: [...groups.values()] };
}

let plan;
let journalPath;
async function saveJournal() {
  const temporary = journalPath + '.tmp';
  await writeFile(temporary, JSON.stringify(plan, null, 2), { mode: 0o600 });
  await rename(temporary, journalPath);
}

async function download(reference, optional = false) {
  const { data, error } = await client.storage.from(reference.bucket).download(reference.objectPath);
  if (error) {
    const status = Number(error.statusCode || error.status || 0);
    if (optional && ([400, 404].includes(status) || /not found/i.test(error.message || ''))) return null;
    throw new Error('A referenced object could not be read. Migration halted without deleting that object.');
  }
  return { buffer: Buffer.from(await data.arrayBuffer()), mime: data.type.split(';')[0] };
}

function assertSafePlan() {
  if (plan.projectHost !== expectedHost || !/^[0-9A-Za-z-]{20,80}$/.test(plan.runId)) throw new Error('Recovery journal project/run mismatch.');
  for (const entry of plan.entries) {
    if (entry.source.bucket !== sourceBucket || !entry.source.objectPath.startsWith('applications/') || !entry.targetPath.startsWith('legacy-migration/' + plan.runId + '/')) throw new Error('Recovery journal contains an out-of-scope path.');
    if (entry.source.objectPath.split('/').some((part) => ['.', '..', ''].includes(part))) throw new Error('Recovery journal contains an unsafe path.');
    for (const ref of entry.references) {
      if (ref.table !== 'application_documents' || !documentColumnSet.has(ref.column) || ref.id == null || objectKey(parseReference(ref.oldValue) || {}) !== objectKey(entry.source)) throw new Error('Recovery journal contains an invalid database reference.');
    }
  }
}

async function applyPlan() {
  assertSafePlan();
  if (plan.counts.publicAcceptanceReferences || plan.counts.unknownReferences) throw new Error('Unresolved reference types need review before this migration can execute.');
  const { data: bucket, error } = await client.storage.getBucket(targetBucket);
  if (error || bucket.public) throw new Error('The private destination bucket has not been verified.');
  execFileSync('git', ['check-ignore', '-q', path.join(auditRoot, 'mapping.json')], { stdio: 'ignore' });
  const runDirectory = path.join(auditRoot, plan.runId);
  await mkdir(runDirectory, { recursive: true, mode: 0o700 });
  journalPath = path.join(runDirectory, 'journal.json');
  await saveJournal();

  plan.phase = 'copy-and-verify';
  await saveJournal();
  const fresh = await inventory();
  if (plan.entries.some((entry) => fresh.mediaReferences.has(objectKey(entry.source)))) throw new Error('A candidate is now referenced by homepage media. Migration halted.');
  for (const entry of plan.entries) {
    if (entry.removed) continue;
    const source = await download(entry.source, Boolean(entry.copied && entry.sha256));
    if (!source) {
      // Only a previously verified/resumable object may have a removed original.
      const target = await download({ bucket: targetBucket, objectPath: entry.targetPath });
      if (hash(target.buffer) !== entry.sha256 || target.buffer.length !== entry.bytes) throw new Error('Recovery copy verification failed.');
      continue;
    }
    const sourceHash = hash(source.buffer);
    if (entry.sha256 && (sourceHash !== entry.sha256 || source.buffer.length !== entry.bytes)) throw new Error('A source object changed after inventory. Migration halted.');
    const contentType = documentMime(source.buffer);
    if (!contentType) throw new Error('An existing document has an unsupported file signature. Review it before continuing.');
    entry.sha256 = sourceHash;
    entry.bytes = source.buffer.length;
    await saveJournal();
    let target = await download({ bucket: targetBucket, objectPath: entry.targetPath }, true);
    if (!target) {
      const { error: uploadError } = await client.storage.from(targetBucket).upload(entry.targetPath, source.buffer, { upsert: false, cacheControl: '0', contentType });
      if (uploadError) throw new Error('Private copy could not be created. Originals and database references remain available.');
      target = await download({ bucket: targetBucket, objectPath: entry.targetPath });
    }
    if (hash(target.buffer) !== sourceHash || target.buffer.length !== source.buffer.length) throw new Error('Private copy hash/length did not match. No original will be removed.');
    entry.copied = true;
    await saveJournal();
  }
  console.log('Copy phase complete: all planned objects verified by SHA-256 and byte length.');

  plan.phase = 'update-references';
  await saveJournal();
  for (const entry of plan.entries) {
    const newValue = 'storage://' + targetBucket + '/' + entry.targetPath;
    for (const ref of entry.references) {
      const { data: current, error: readError } = await client.from(ref.table).select(ref.column).eq('id', ref.id).single();
      if (readError) throw new Error('A source database record changed or disappeared. Originals have been preserved.');
      if (current[ref.column] !== newValue) {
        if (current[ref.column] !== ref.oldValue) throw new Error('Concurrent document update detected. Originals have been preserved.');
        const { data: updated, error: updateError } = await client.from(ref.table).update({ [ref.column]: newValue }).eq('id', ref.id).eq(ref.column, ref.oldValue).select('id');
        if (updateError || updated?.length !== 1) throw new Error('Optimistic reference update did not match exactly one row. Originals have been preserved.');
      }
      ref.updated = true;
      await saveJournal();
    }
  }
  console.log('Reference phase complete: all changes matched the reviewed original values.');

  plan.phase = 'remove-verified-originals';
  await saveJournal();
  for (const entry of plan.entries) {
    if (entry.removed) continue;
    const current = await inventory();
    const key = objectKey(entry.source);
    if (current.mediaReferences.has(key) || current.references.some(({ source }) => objectKey(source) === key)) throw new Error('An original is still referenced. It was not removed.');
    const target = await download({ bucket: targetBucket, objectPath: entry.targetPath });
    if (hash(target.buffer) !== entry.sha256 || target.buffer.length !== entry.bytes) throw new Error('Final private copy verification failed. Original preserved.');
    const source = await download(entry.source, true);
    if (source) {
      if (hash(source.buffer) !== entry.sha256 || source.buffer.length !== entry.bytes) throw new Error('Original changed before removal. Original preserved.');
      const { error: removeError } = await client.storage.from(sourceBucket).remove([entry.source.objectPath]);
      if (removeError) throw new Error('Exact original removal failed. Private copy and recovery mapping are preserved.');
    }
    const { data: publicData } = client.storage.from(sourceBucket).getPublicUrl(entry.source.objectPath);
    const publicUrl = new URL(publicData.publicUrl);
    publicUrl.searchParams.set('migration_check', plan.runId);
    const response = await fetch(publicUrl, { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    if (![400, 403, 404, 410].includes(response.status)) throw new Error('Original removal needs a public-access recheck. Recovery journal preserved.');
    entry.removed = true;
    await saveJournal();
  }
  plan.phase = 'complete';
  plan.completedAt = new Date().toISOString();
  await saveJournal();
  console.log(JSON.stringify({ status: 'complete', runId: plan.runId, migratedObjects: plan.entries.length, migratedReferences: plan.counts.candidateReferences }));
}

try {
  if (resumedRun) {
    journalPath = path.join(auditRoot, resumedRun, 'journal.json');
    plan = JSON.parse(await readFile(journalPath, 'utf8'));
    assertSafePlan();
  } else {
    plan = await makePlan();
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', runId: plan.runId, counts: plan.counts, phases: ['copy all candidate objects', 'verify SHA-256 and byte lengths', 'optimistic database reference updates', 'fresh reference/media checks', 'remove only exact verified unreferenced public originals', 'verify public access is denied'] }, null, 2));
  if (apply) {
    await applyPlan();
  } else {
    assertSafePlan();
    execFileSync('git', ['check-ignore', '-q', path.join(auditRoot, 'mapping.json')], { stdio: 'ignore' });
    const runDirectory = path.join(auditRoot, plan.runId);
    await mkdir(runDirectory, { recursive: true, mode: 0o700 });
    journalPath = path.join(runDirectory, 'journal.json');
    await saveJournal();
    console.log('Dry-run only: no storage or database changes. The exact reviewed mapping is saved in the gitignored .private-migrations directory.');
  }
} catch (error) {
  // Only deliberately generic migration errors are printed; SDK payloads and
  // stored references never reach stdout.
  console.error('Migration stopped. ' + (error instanceof Error && !error.cause ? error.message.replace(/https?:\/\/\S+/g, '[redacted]') : 'Review the recovery journal and configuration.'));
  process.exitCode = 1;
}
