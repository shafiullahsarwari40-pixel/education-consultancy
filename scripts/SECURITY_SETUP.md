# Student document and account security

## Private uploads

Run `node scripts/setup-private-documents.mjs` with the application's existing
server environment. It creates `student-documents` only if missing and verifies
that it is private. It does not change, move or delete existing files. The bucket
accepts PDF, JPEG, PNG, WebP and GIF, up to 4 MB per request. This stays below
Vercel Functions' 4.5 MB request-body limit, including multipart overhead.

New applications store `storage://student-documents/...` references. Staff can
download through `/api/admin/document`; students can download their own latest
application documents through `/api/student/document?type=passport` (or another
supported document type). Both routes verify the Supabase session; staff routes
also verify the stored admin role. These API responses must not be cached.

The existing `application-uploads` bucket is public and also serves homepage
media. Do not make it private wholesale. Existing applicant files in this bucket
need a controlled migration:

1. Back up and inventory references in `application_documents`; do not log file
   contents, student names or full document URLs.
2. Copy only referenced applicant documents to `student-documents`.
3. Verify each copy's size/content checksum and that unauthenticated access fails.
4. Update each reference to its private `storage://` location and verify staff and
   owner downloads. Preserve a recovery mapping until verification is complete.
5. Remove only the verified original applicant objects after explicit review.
   Keep all homepage media untouched. Until removal, original public URLs may
   still work even after database references have changed.

The application reads both old public references and new private references.
`acceptance-letters` is already private and remains separate.

### Reviewable legacy migration

Release order matters: the currently deployed application may still expect public
document URLs. Deploy the compatible `storage://` document APIs and updated
application code first, then verify authenticated staff and student downloads in
that deployment. Only after those checks pass should the reviewed legacy
migration run. Running it while the old application is live would break existing
document links. The prepared dry-run journal is retained; it has not been applied.

Run `node scripts/migrate-private-documents.mjs --dry-run` to create an exact
inventory and local recovery journal under `.private-migrations/` (gitignored).
The console prints counts only. The journal contains sensitive identifiers and
old/new references, so keep it local and do not attach it to issues or commits.
Dry-run does not copy, update, or remove anything in Supabase.

After reviewing that plan, execute only the same run with
`node scripts/migrate-private-documents.mjs --apply --resume=RUN_ID`.
Keep document/media editing paused during execution. It copies all candidate
objects before changing any references, verifies SHA-256 hashes and byte lengths,
updates one exact field/row only when its original value still matches, and
rechecks all known document/acceptance/media references before each exact removal.
The private copy and original are rehashed immediately before removal. Public
access is checked with a fresh URL after removal. Previously cached responses in
external browsers cannot be recalled.

Any error halts execution and keeps the recovery journal. Run the same command
with the same run ID to resume only after reviewing the cause. Copies and mapping
are retained; no broad bucket cleanup is performed. Homepage media collisions are
excluded, and unknown references/public acceptance-letter variants halt execution
for separate review. Raw acceptance-letter paths are treated as references to the
existing private `acceptance-letters` bucket, matching current application code.

## Lock down database access

The live release audit found that the `applications` table is readable through
the anonymous Data API and that one authenticated student can directly read
another student's application. The application routes enforce ownership, but a
caller can bypass those routes and contact Supabase directly. This blocks release.

Run `scripts/lock-down-sensitive-tables.sql` in the SQL editor for project
`goerjwjxpwmpimkeiokx`. It makes all application-owned tables server-only,
removes every permissive policy on those tables, revokes `anon` and
`authenticated` grants, preserves service-role access, forces RLS, and installs a
second role-column guard on profiles. The current browser application uses
authenticated Next.js API routes for these workflows and does not need direct
table privileges.

After applying it, run:

`node scripts/verify-live-release.mjs --live --base-url=http://localhost:3001`

Do not deploy or migrate legacy documents until every check passes. The verifier
creates disposable accounts, one application, and tiny test files; its cleanup
removes them and reports cleanup failures.

## Rotate the exposed server key

A legacy `service_role` JWT was committed to the public GitHub repository in a
debug helper. The debug helpers have been removed from the current tree, but Git
history is immutable and the credential remains compromised.

Use Supabase's zero-downtime key migration:

1. Create a new `sb_publishable_...` key and a new `sb_secret_...` key.
2. Set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` for local,
   Vercel Preview, and Vercel Production environments.
3. Deploy and run the complete disposable release verifier.
4. Confirm every component uses the new keys, then disable the legacy `anon` and
   `service_role` keys in Supabase. Do not publish the new secret in issues, logs,
   chat, screenshots, or source control.

The app accepts both naming schemes only for the transition. New deployments
should use the new variables.

## Deployment checks

- Keep `SUPABASE_SECRET_KEY` (or a temporary legacy
  `SUPABASE_SERVICE_ROLE_KEY`) server-only. Never name
  an elevated credential `NEXT_PUBLIC_*`.
- The contact/application burst guards are local to each server instance. Use a
  shared production rate limiter or hosting firewall when running multiple instances.
- The application and acceptance-letter routes accept 4 MB per request so their
  multipart bodies remain below Vercel Functions' 4.5 MB limit. Use private,
  short-lived signed direct uploads before advertising larger files.
- Verify a real account/application workflow in staging using test documents.
  Local validation checks intentionally do not submit real student applications.
