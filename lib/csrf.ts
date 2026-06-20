/**
 * CSRF origin validation helper.
 *
 * Rules:
 * - If the request carries neither an `Origin` nor a `Referer` header,
 *   we allow it. Many legitimate callers (curl, server-to-server, some
 *   mobile browsers) omit these headers and are not CSRF threats.
 * - If either header IS present, it must match NEXT_PUBLIC_APP_URL
 *   (falling back to http://localhost:3000 during local development).
 *
 * Trailing slashes are normalised on both sides so that
 *   NEXT_PUBLIC_APP_URL=https://snip.app/
 * and
 *   NEXT_PUBLIC_APP_URL=https://snip.app
 * are treated identically.
 */
export function validateOrigin(request: Request): boolean {
  const rawAllowed =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // Normalise: strip trailing slash
  const allowedOrigin = rawAllowed.replace(/\/+$/, "");

  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  // No CSRF-relevant header present → allow (not a browser-initiated cross-origin request)
  if (!originHeader && !refererHeader) return true;

  if (originHeader) {
    const origin = originHeader.replace(/\/+$/, "");
    return origin === allowedOrigin;
  }

  if (refererHeader) {
    // Referer may include a path — we only need the prefix to match
    const referer = refererHeader.replace(/\/+$/, "");
    return referer === allowedOrigin || referer.startsWith(allowedOrigin + "/");
  }

  return false;
}
