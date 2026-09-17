import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';

nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Set the server Supabase URL and secret/service role key before running this script.');

const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const bucket = 'student-documents';
const fileSizeLimit = 4 * 1024 * 1024;
const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const { data: buckets, error: listError } = await client.storage.listBuckets();
if (listError) throw new Error('Could not inspect storage bucket configuration.');
const existing = buckets.find((item) => item.name === bucket);
if (existing?.public) throw new Error('student-documents already exists and is public. Review its contents before changing its visibility.');
if (!existing) {
  const { error } = await client.storage.createBucket(bucket, {
    public: false,
    fileSizeLimit,
    allowedMimeTypes,
  });
  if (error) throw new Error('Could not create the private student document bucket.');
} else {
  const { error } = await client.storage.updateBucket(bucket, {
    public: false,
    fileSizeLimit,
    allowedMimeTypes,
  });
  if (error) throw new Error('Could not align the private student document bucket with production upload limits.');
}
const { data: verified, error } = await client.storage.getBucket(bucket);
if (error || verified?.public !== false) throw new Error('Could not verify that student-documents is private.');
console.log('Verified: student-documents is private and enforces the 4 MB production upload limit. No existing files were moved or deleted.');
