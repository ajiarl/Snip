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
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  // No CSRF-relevant header present → allow (not a browser-initiated cross-origin request)
  if (!originHeader && !refererHeader) return true;

  const rawAllowed =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const allowedOrigin = rawAllowed.replace(/\/+$/, "");

  // Collect all valid origins
  const allowedOrigins = new Set<string>([allowedOrigin]);

  // Include request's own origin (same-origin check)
  try {
    const reqUrlOrigin = new URL(request.url).origin.replace(/\/+$/, "");
    if (reqUrlOrigin) allowedOrigins.add(reqUrlOrigin);
  } catch {
    // ignore
  }

  // Include host/x-forwarded-host headers
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") || "https";
    allowedOrigins.add(`${proto}://${host}`.replace(/\/+$/, ""));
  }

  if (process.env.VERCEL_URL) {
    allowedOrigins.add(`https://${process.env.VERCEL_URL}`.replace(/\/+$/, ""));
  }

  // Also include www and non-www variants for each origin
  for (const orig of Array.from(allowedOrigins)) {
    try {
      const url = new URL(orig);
      if (url.hostname.startsWith("www.")) {
        const withoutWww = `${url.protocol}//${url.hostname.slice(4)}${url.port ? `:${url.port}` : ""}`;
        allowedOrigins.add(withoutWww);
      } else {
        const withWww = `${url.protocol}//www.${url.hostname}${url.port ? `:${url.port}` : ""}`;
        allowedOrigins.add(withWww);
      }
    } catch {
      // ignore
    }
  }

  if (originHeader) {
    const origin = originHeader.replace(/\/+$/, "");
    return allowedOrigins.has(origin);
  }

  if (refererHeader) {
    try {
      const refererOrigin = new URL(refererHeader).origin.replace(/\/+$/, "");
      return allowedOrigins.has(refererOrigin);
    } catch {
      return false;
    }
  }

  return false;
}
