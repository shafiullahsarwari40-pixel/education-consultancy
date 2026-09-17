// Preserve the public-site preference while keeping the student workflow
// consistently English until that workflow has its own complete translations.
const ENGLISH_WORKFLOW_ROUTES = ['/admin', '/student', '/apply', '/auth/callback'];

export function isEnglishWorkflowRoute(pathname) {
  return typeof pathname === 'string' && ENGLISH_WORKFLOW_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
