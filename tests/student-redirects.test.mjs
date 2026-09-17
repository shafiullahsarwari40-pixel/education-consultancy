import test from "node:test";
import assert from "node:assert/strict";
import {
  buildStudentRecoveryPath,
  getSafeAuthCallbackRedirect,
  getSafeStudentRedirect,
  getStudentSignInDestination,
} from "../lib/studentRedirects.mjs";

test("student destinations remain limited to the application and portal", () => {
  for (const destination of [
    "/apply",
    "/student/result",
    "/student/dashboard",
    "/apply?uni=Anadolu%20University",
  ]) {
    assert.equal(getSafeStudentRedirect(destination), destination);
  }
});

test("unsafe and unrelated destinations fall back to the student result page", () => {
  for (const destination of [
    undefined,
    "",
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "javascript:alert(1)",
    "/admin",
    "/apply/../../admin",
    "/apply/../student/result",
    "/apply/%2e%2e/student/result",
    "/student/auth",
    "/apply\n?uni=test",
  ]) {
    assert.equal(
      getSafeStudentRedirect(destination),
      "/student/result",
      String(destination),
    );
    assert.equal(
      getSafeAuthCallbackRedirect(destination),
      "/student/result",
      String(destination),
    );
  }
});

test("university and application preferences survive the complete recovery URL round trip", () => {
  const university = "Ankara Yıldırım Beyazıt University";
  const query = new URLSearchParams({ uni: university, intake: "Autumn 2027" });
  const destination = `/apply?${query}`;
  const recovery = buildStudentRecoveryPath(destination);
  const emailCallback = new URL("https://horizon.invalid/auth/callback");
  emailCallback.searchParams.set("returnTo", recovery);
  const callbackDestination = getSafeAuthCallbackRedirect(
    emailCallback.searchParams.get("returnTo"),
  );
  const recoveryPage = new URL(callbackDestination, "https://horizon.invalid");
  assert.equal(recoveryPage.pathname, "/student/auth");
  assert.equal(recoveryPage.searchParams.get("mode"), "recovery");
  const finalDestination = getSafeStudentRedirect(
    recoveryPage.searchParams.get("redirect"),
  );
  assert.equal(finalDestination, destination);
  assert.equal(
    new URL(finalDestination, "https://horizon.invalid").searchParams.get(
      "uni",
    ),
    university,
  );
  assert.equal(getStudentSignInDestination(callbackDestination), destination);
});

test("old recovery links still work with a safe default destination", () => {
  assert.equal(
    getSafeAuthCallbackRedirect("/student/auth?mode=recovery"),
    buildStudentRecoveryPath("/student/result"),
  );
});

test("tampered nested recovery redirects cannot escape to external or admin pages", () => {
  for (const destination of [
    "https://example.com",
    "//example.com",
    "/admin",
    "/student/auth?mode=recovery",
  ]) {
    const callbackDestination = getSafeAuthCallbackRedirect(
      `/student/auth?mode=recovery&redirect=${encodeURIComponent(destination)}`,
    );
    assert.equal(
      callbackDestination,
      buildStudentRecoveryPath("/student/result"),
    );
    assert.equal(
      getStudentSignInDestination(callbackDestination),
      "/student/result",
    );
  }
});

test("other auth modes are not added to the callback allowlist", () => {
  assert.equal(
    getSafeAuthCallbackRedirect("/student/auth?mode=signup&redirect=/apply"),
    "/student/result",
  );
  assert.equal(
    getSafeAuthCallbackRedirect("/student/auth?redirect=/apply"),
    "/student/result",
  );
});
