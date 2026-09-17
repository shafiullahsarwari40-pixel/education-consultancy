import 'server-only';

export const STUDENT_DOCUMENT_BUCKET = 'student-documents';
const ALLOWED_BUCKETS = new Set([STUDENT_DOCUMENT_BUCKET, 'application-uploads', 'acceptance-letters']);

export function documentReference(bucket, objectPath) {
  return `storage://${bucket}/${objectPath}`;
}

// New references contain no public URL. Legacy URLs remain readable by staff
// until the original documents have been migrated out of the public bucket.
export function parseDocumentReference(reference) {
  try {
    const url = new URL(reference);
    let bucket;
    let objectPath;
    if (url.protocol === 'storage:') {
      bucket = url.hostname;
      objectPath = decodeURIComponent(url.pathname.slice(1));
    } else {
      if (url.protocol !== 'https:') return null;
      const expectedHost = process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
        : null;
      if (!expectedHost || url.hostname !== expectedHost) return null;
      const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public\/|sign\/|authenticated\/)?([^/]+)\/(.+)$/);
      if (!match) return null;
      bucket = match[1];
      objectPath = decodeURIComponent(match[2]);
    }
    if (!ALLOWED_BUCKETS.has(bucket) || !objectPath || objectPath.split('/').some((part) => part === '..' || part === '.')) return null;
    return { bucket, objectPath };
  } catch {
    return null;
  }
}
