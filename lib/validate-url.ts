import { z } from "zod";

const DANGEROUS_SCHEMES = ["javascript:", "data:", "file:", "vbscript:"];

/**
 * Checks whether a hostname resolves to a private, loopback, or link-local
 * address — including alternative representations that would bypass naive
 * regex checks (integer, hex, octal, IPv6-mapped IPv4, IPv6 private ranges).
 */
function isPrivateOrLocalHost(hostname: string): boolean {
  // Strip IPv6 brackets: [::1] → ::1
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  // ── Loopback / any-local ──────────────────────────────────────────────────
  if (h === "localhost" || h === "::1" || h === "0.0.0.0") return true;

  // ── IPv6 Link-local: fe80::/10 ────────────────────────────────────────────
  // Covers fe80–febf (top nibble fe8x / fe9x / feax / febx)
  if (/^fe[89ab][0-9a-f]:/i.test(h)) return true;

  // ── IPv6 Unique Local Address: fc00::/7 ───────────────────────────────────
  // Covers fc00–fdff (top byte fc or fd)
  if (/^f[cd][0-9a-f]{2}:/i.test(h)) return true;

  // ── IPv6-mapped IPv4: ::ffff:<part> ─────────────────────────────────────────
  // Node.js normalises ::ffff:127.0.0.1 → ::ffff:7f00:1 (two hex groups).
  // We handle both the original dotted-decimal form and the normalised hex form.
  if (/^::ffff:/i.test(h)) {
    const rest = h.replace(/^::ffff:/i, "");

    // Case A: dotted-decimal  →  ::ffff:127.0.0.1
    if (rest.includes(".")) return isPrivateOrLocalHost(rest);

    // Case B: two hex groups  →  ::ffff:7f00:1  (each group is 16-bit)
    // Decode each 16-bit group into two octets and reconstruct dotted-decimal.
    const parts = rest.split(":");
    if (parts.length === 2) {
      const hi = parseInt(parts[0], 16); // e.g. 0x7f00 → 127*256 + 0
      const lo = parseInt(parts[1], 16); // e.g. 0x0001 → 0*256 + 1
      if (!isNaN(hi) && !isNaN(lo)) {
        const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
        return isPrivateOrLocalHost(ipv4);
      }
    }

    return false;
  }

  // ── Alternative numeric representations of IPv4 ──────────────────────────
  // Integer: 2130706433 == 127.0.0.1
  // Hex:     0x7f000001 == 127.0.0.1
  // Octal:   0177.0.0.1
  // These do NOT contain dots mixed with letters (except hex 0x prefix),
  // so we detect them and normalise via the URL parser.
  const looksNumeric =
    /^\d+$/.test(h) ||          // pure integer
    /^0x[\da-f]+$/i.test(h) ||  // pure hex (0xdeadbeef)
    /^0\d{2,}$/.test(h);        // pure octal (01) — must be > 1 digit to distinguish from bare "0"

  if (looksNumeric) {
    try {
      // Let the platform URL parser normalise the representation.
      const normalised = new URL(`http://${h}`).hostname;
      // If the parser changed the hostname it must have resolved it to dotted-decimal.
      if (normalised !== h) return isPrivateOrLocalHost(normalised);
    } catch {
      // Unparseable → treat as safe; the upstream z.string().url() check will
      // have already rejected genuinely-malformed URLs before we get here.
      return false;
    }
  }

  // ── Standard IPv4 private ranges (dotted-decimal only, already normalised) ─
  if (/^127\./.test(h)) return true;               // 127.0.0.0/8  loopback
  if (/^10\./.test(h)) return true;                // 10.0.0.0/8
  if (/^192\.168\./.test(h)) return true;          // 192.168.0.0/16
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true; // 172.16.0.0/12
  if (/^169\.254\./.test(h)) return true;          // 169.254.0.0/16 link-local

  return false;
}

export const urlSchema = z
  .string()
  .url("Format URL tidak valid")
  .refine(
    (url) => {
      const lower = url.toLowerCase();
      return DANGEROUS_SCHEMES.every((scheme) => !lower.startsWith(scheme));
    },
    { message: "Skema URL ini tidak diizinkan (javascript:, data:, dll)" }
  )
  .refine(
    (url) => {
      try {
        const { hostname } = new URL(url);
        return !isPrivateOrLocalHost(hostname);
      } catch {
        return false;
      }
    },
    { message: "Alamat IP privat tidak diizinkan" }
  );

export const slugSchema = z
  .string()
  .min(3, "Slug minimal 3 karakter")
  .max(50, "Slug maksimal 50 karakter")
  .regex(/^[a-z0-9-_]+$/i, "Slug hanya boleh berisi huruf, angka, tanda hubung, dan underscore");
