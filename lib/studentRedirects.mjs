const LOCAL_ORIGIN = "https://horizon.invalid";
const DEFAULT_DESTINATION = "/student/result";
const STUDENT_PATHS = new Set([
  "/apply",
  "/student/result",
  "/student/dashboard",
]);

function parseLocalDestination(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  ) {
    return null;
  }

  try {
    const url = new URL(value, LOCAL_ORIGIN);
    const originalPath = value.split(/[?#]/, 1)[0];
    // Do not accept browser-normalized traversal paths or external origins.
    if (url.origin !== LOCAL_ORIGIN || url.pathname !== originalPath)
      return null;
    return url;
  } catch {
    return null;
  }
}

export function getSafeStudentRedirect(value) {
  const url = parseLocalDestination(value);
  if (!url || !STUDENT_PATHS.has(url.pathname)) return DEFAULT_DESTINATION;
  return `${url.pathname}${url.search}`;
}

export function buildStudentRecoveryPath(destination) {
  const redirect = getSafeStudentRedirect(destination);
  return `/student/auth?mode=recovery&redirect=${encodeURIComponent(redirect)}`;
}

export function getSafeAuthCallbackRedirect(value) {
  const url = parseLocalDestination(value);
  if (
    url?.pathname === "/student/auth" &&
    url.searchParams.get("mode") === "recovery"
  ) {
    return buildStudentRecoveryPath(url.searchParams.get("redirect"));
  }
  return getSafeStudentRedirect(value);
}

export function getStudentSignInDestination(callbackDestination) {
  const url = parseLocalDestination(callbackDestination);
  return getSafeStudentRedirect(
    url?.pathname === "/student/auth"
      ? url.searchParams.get("redirect")
      : callbackDestination,
  );
}
