# Horizon website upgrade — verification and release notes

Date: 16 September 2026

## What changed

- Cohesive navy, ivory and emerald visual system, editorial typography, responsive layouts, clearer navigation and calls to action.
- University discovery: searchable directory, city filters, sorting, device-local shortlist and 13 individual profiles with official university resources.
- Preparation guide with a persistent, account-free checklist.
- Redesigned application entry, four-step application, account screens, student dashboard and results; clearer failures, recovery, redirects and document downloads.
- Eight-language homepage/interface copy, right-to-left support, keyboard navigation, dialog focus management, accessible form labels and reduced-motion support. The directory, detailed guide and student portal content currently remain English.
- Optimized local images, route-specific metadata, social image, canonical URLs and generated sitemap/robots routes. Original image assets were retained.
- Authenticated document endpoints, private storage for new submissions, file validation, request limits and safe upload rollback. Existing homepage media were preserved.

## Evidence collected

- `npm run build`: compilation, type checking and generation of all 47 build entries passed.
- `node scripts/verify-api-contracts.mjs`: 8 isolated scenarios / 19 assertions passed. Uses mocked storage/authentication; no real applications or emails were sent.
- `node scripts/smoke-universities.mjs`: directory plus 13 profiles returned 200; all 14 exact page titles contain the brand once; 26 expected official HTTPS links were present; 525 rendered anchors used allowed protocols; 51 internal destinations resolved with no failures.
- Read-only HTTP checks: public pages 200, unknown page 404, protected student/admin endpoints 401 without authentication, GET-only misuse of contact/submission endpoints 405, homepage media API 200. Security headers and API no-store/noindex policies present.
- Browser: university search handles `izmir` against `İzmir`; shortlist survives reload; profile-to-application-to-signup preserves the chosen university.
- Browser: preparation checklist survives reload; mobile menu opens/closes with Escape and restores focus; media viewer opens and Escape restores focus to its trigger.
- Browser: desktop 1280px and mobile 390px layouts reviewed; Arabic sets `lang=ar`, `dir=rtl`, and has no horizontal overflow at 390px.
- Browser console/page-error checks were empty on the tested public pages. No framework error overlay was present.
- Image checks confirmed visible lazy-loaded story and media images completed with non-zero natural widths.
- Final axe-core 4.12.1 audits: **zero violations** on home, guide, directory, an individual university profile, application entry, student sign-in, student result, privacy and terms at desktop width. The mobile university directory also passed after correcting its sorting label. Some gradient/pseudo-element contrast and decorative symbols remain manual-review items; zero automated violations is not a guarantee of complete accessibility.
- Final mobile interaction checks: no-result search shows a useful empty state; resetting restores all 13 universities; the media viewer's visible close button dismisses its dialog.
- One final warm local desktop performance sample at 1264px: TTFB 6.8 ms, FCP 324 ms, LCP 324 ms, CLS 0. INP was not measured. These localhost/cache-dependent results are not production or real-user scores.
- Generated sitemap contains 19 intended public URLs and excludes admin/student routes; robots points to it and disallows private/API routes.
- Next.js was upgraded to 16.3.5, Nodemailer to 10.0.10 and Supabase JS to 2.116.0. `npm audit --omit=dev` reports **0 vulnerabilities**.
- Upload handling is capped at 4 MB per request, below Vercel Functions' 4.5 MB request limit, with bounded body reads and file-signature validation.
- CSP, HSTS, frame denial, MIME sniffing, referrer, permissions and cross-origin opener headers were verified on the final production build. `X-Powered-By` is absent.

Accessibility findings were corrected during testing, including low-contrast labels, the mobile sort control's accessible name, unique application landmarks and the media viewer close-button stacking. Automated audits are supplemented by visual checks; they are not a formal WCAG certification.

Local screenshots are kept under `artifacts/qa/` and excluded from Git. Some existing homepage media include student information; those captures should not be published in an issue or repository.

## Second design and interaction review

- Refined the header, hero proportions, mobile gutters, editorial typography, image framing and application-plan card placement. Removed duplicated hero facts and small inset images. Replaced the story portrait with an optimized graduate-group image from the existing assets.
- Added a self-hosted Arabic font through Next.js and explicit English reading direction on English-only content. Localized notices explain which public pages remain English. Account/application screens consistently use English while preserving the visitor's public-site language preference.
- Improved tablet sign-in spacing and file-picker controls. Recovery links now retain an allowed application destination, including its university query, through the callback. Redirect targets are explicitly validated.
- Added stable media loading placeholders, localized retry/empty states, image-proportioned mobile dialogs and non-overlapping navigation controls. Retry uses a stable heading as its focus target; modal keyboard navigation respects the reading direction and native video controls.
- Visual checks covered 1440px desktop, 1024px tablet, 390px mobile and 320px narrow mobile. French navigation fits at 1024px; French at 320px and Arabic at 390px have no horizontal overflow. The graduate image, desktop hero and mobile viewer were inspected directly.
- Verified that entering `/apply` with Arabic selected changes the document to English/LTR; returning home restores Arabic. Escape closes the media viewer and returns focus to its opening button. A browser-only simulated media request failure displayed the localized retry control; retry restored all three existing items after removing the network block.
- `node --test tests/student-redirects.test.mjs`: all 6 non-network tests passed. The university crawl was rerun: all 13 profiles and 51 internal destinations passed again. The mocked API contract suite was also rerun successfully, including its intentional failure/cleanup scenarios.
- Fresh mobile axe audits reported zero violations on home, directory, guide, an individual university profile, application entry, student sign-in, privacy and terms. Gradient/pseudo-element contrast and decorative-symbol checks still require manual judgment. Tested pages had no browser page errors.
- Final production rebuild passed (47/47 generated entries). On that exact build, English ArrowRight advances the viewer, while Arabic ArrowLeft advances and ArrowRight reverses it; visible chevrons and button positions agree. Retry retained focus on the stable section heading after both a simulated failure and a successful response. The final Arabic homepage axe check also reported zero violations, and the browser page-error log was empty.

These refinements do not remove the production-release requirements below. A live disposable flow created three temporary users, one temporary application and tiny test files, then removed them. Cleanup checks passed. No real student data was created and the legacy document migration was not applied.

## Before production release

This is a local upgrade, not a deployed release. No world ranking, real-user performance score, or blanket “100% complete” claim is implied.

1. **Critical — database access:** the live verifier passed 20/21 original checks but proved that one student can directly read another student's application through Supabase. An anonymous Data API request can also count 12 existing application rows. The Next.js API correctly enforces ownership, but it can be bypassed. Apply `scripts/lock-down-sensitive-tables.sql` in the verified project, then rerun the full verifier. Do not deploy before it passes.
2. **Critical — exposed credential:** a working legacy `service_role` JWT exists in the public Git history. Debug copies were removed from the current tree, but history remains compromised. Create new Supabase publishable/secret keys, move local and Vercel environments to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`, verify the deployment, then disable the legacy keys.
3. **Existing public application files:** the private bucket for new submissions was created and verified. The reviewed dry run found 53 legacy applicant objects to migrate. Deploy compatible code and pass the security flow first; only then resume the journaled migration. Do not make the shared homepage-media bucket private wholesale.
4. **Notifications and abuse protection:** Vercel currently has no SMTP variables, so submissions are saved for the admin dashboard but email notification is skipped. The contact/application burst guard is per-process; the current Vercel plan did not expose project WAF rate limiting. Add a shared limiter or supported firewall before high-volume marketing.
5. **Content approval:** review translations with native speakers, confirm business/legal text, and confirm consent to publish existing student-result media. No partnerships, guaranteed admissions or success statistics were invented.
6. **Production verification:** after the two critical items pass, create an isolated preview, rerun the disposable flow, promote the exact verified artifact, inspect production logs/headers, and measure deployed Core Web Vitals on target devices.

Detailed security procedure and release order: [scripts/SECURITY_SETUP.md](scripts/SECURITY_SETUP.md).

## Local preview

Run `npm run build`, then `npm run start -- --port 3001`.

Preview: http://localhost:3001

The existing unrelated service on port 3000 was left untouched. User changes and original assets were preserved; no Git commit or deployment was made.
