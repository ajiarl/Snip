import { describe, it, expect } from 'vitest';
import { urlSchema, slugSchema } from './validate-url';

describe('urlSchema', () => {
  describe('valid URLs', () => {
    it('should accept valid HTTP URLs', () => {
      const result = urlSchema.safeParse('http://example.com');
      expect(result.success).toBe(true);
    });

    it('should accept valid HTTPS URLs', () => {
      const result = urlSchema.safeParse('https://example.com');
      expect(result.success).toBe(true);
    });

    it('should accept URLs with paths and query params', () => {
      const result = urlSchema.safeParse('https://example.com/path?query=value');
      expect(result.success).toBe(true);
    });
  });

  describe('dangerous URL schemes', () => {
    it('should reject javascript: scheme', () => {
      const result = urlSchema.safeParse('javascript:alert(1)');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Skema URL ini tidak diizinkan');
      }
    });

    it('should reject data: scheme', () => {
      const result = urlSchema.safeParse('data:text/html,<script>alert(1)</script>');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Skema URL ini tidak diizinkan');
      }
    });

    it('should reject file: scheme', () => {
      const result = urlSchema.safeParse('file:///etc/passwd');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Skema URL ini tidak diizinkan');
      }
    });

    it('should reject vbscript: scheme', () => {
      const result = urlSchema.safeParse('vbscript:msgbox(1)');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Skema URL ini tidak diizinkan');
      }
    });
  });

  describe('private IP addresses', () => {
    it('should reject localhost', () => {
      const result = urlSchema.safeParse('http://localhost/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    it('should reject 127.0.0.1', () => {
      const result = urlSchema.safeParse('http://127.0.0.1/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    it('should reject 192.168.x.x private network', () => {
      const result = urlSchema.safeParse('http://192.168.1.1/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    it('should reject 10.x.x.x private network', () => {
      const result = urlSchema.safeParse('http://10.0.0.1/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    it('should reject 172.16-31.x.x private network', () => {
      const result = urlSchema.safeParse('http://172.16.0.1/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    it('should reject 169.254.x.x link-local addresses', () => {
      const result = urlSchema.safeParse('http://169.254.169.254/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    // ── Alternative numeric representations (IP encoding bypass) ──────────────

    it('should reject 127.0.0.1 represented as decimal integer (2130706433)', () => {
      const result = urlSchema.safeParse('http://2130706433/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    it('should reject 127.0.0.1 represented as hex (0x7f000001)', () => {
      const result = urlSchema.safeParse('http://0x7f000001/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    // ── IPv6 loopback and mapped IPv4 ─────────────────────────────────────────

    it('should reject IPv6 loopback ::1', () => {
      const result = urlSchema.safeParse('http://[::1]/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    it('should reject IPv6-mapped IPv4 loopback ::ffff:127.0.0.1', () => {
      const result = urlSchema.safeParse('http://[::ffff:127.0.0.1]/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    it('should reject IPv6-mapped private IP ::ffff:192.168.1.1', () => {
      const result = urlSchema.safeParse('http://[::ffff:192.168.1.1]/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    // ── IPv6 link-local: fe80::/10 ────────────────────────────────────────────

    it('should reject IPv6 link-local fe80::1 (fe80::/10)', () => {
      const result = urlSchema.safeParse('http://[fe80::1]/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    it('should reject IPv6 link-local fe80::dead:beef (fe80::/10)', () => {
      const result = urlSchema.safeParse('http://[fe80::dead:beef]/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    // ── IPv6 Unique Local Address: fc00::/7 ───────────────────────────────────

    it('should reject IPv6 ULA starting with fc (fc00::/7)', () => {
      const result = urlSchema.safeParse('http://[fc00::1]/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    it('should reject IPv6 ULA starting with fd (fd00::/8 within fc00::/7)', () => {
      const result = urlSchema.safeParse('http://[fd12:3456:789a::1]/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Alamat IP privat tidak diizinkan');
      }
    });

    // ── Sanity: public IPs must still be accepted ─────────────────────────────

    it('should accept a valid public IP address (8.8.8.8)', () => {
      const result = urlSchema.safeParse('http://8.8.8.8/test');
      expect(result.success).toBe(true);
    });
  });

  describe('invalid URL formats', () => {
    it('should reject plain text without scheme', () => {
      const result = urlSchema.safeParse('not-a-url');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Format URL tidak valid');
      }
    });

    it('should reject empty string', () => {
      const result = urlSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });
});

describe('slugSchema', () => {
  describe('valid slugs', () => {
    it('should accept valid slug with 6 characters', () => {
      const result = slugSchema.safeParse('abc123');
      expect(result.success).toBe(true);
    });

    it('should accept slug with hyphens', () => {
      const result = slugSchema.safeParse('my-link');
      expect(result.success).toBe(true);
    });

    it('should accept slug with underscores', () => {
      const result = slugSchema.safeParse('my_link');
      expect(result.success).toBe(true);
    });

    it('should accept slug with mixed case', () => {
      const result = slugSchema.safeParse('MyLink');
      expect(result.success).toBe(true);
    });

    it('should accept slug at min length (3 chars)', () => {
      const result = slugSchema.safeParse('abc');
      expect(result.success).toBe(true);
    });

    it('should accept slug at max length (50 chars)', () => {
      const result = slugSchema.safeParse('a'.repeat(50));
      expect(result.success).toBe(true);
    });
  });

  describe('invalid slugs', () => {
    it('should reject slug shorter than 3 characters', () => {
      const result = slugSchema.safeParse('ab');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Slug minimal 3 karakter');
      }
    });

    it('should reject slug longer than 50 characters', () => {
      const result = slugSchema.safeParse('a'.repeat(51));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Slug maksimal 50 karakter');
      }
    });

    it('should reject slug with spaces', () => {
      const result = slugSchema.safeParse('my link');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Slug hanya boleh berisi');
      }
    });

    it('should reject slug with special characters', () => {
      const result = slugSchema.safeParse('my@link');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Slug hanya boleh berisi');
      }
    });

    it('should reject slug with dots', () => {
      const result = slugSchema.safeParse('my.link');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Slug hanya boleh berisi');
      }
    });

    it('should reject empty slug', () => {
      const result = slugSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });
});
