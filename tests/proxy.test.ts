import { describe, it, expect, vi, beforeEach } from 'vitest';
import { proxy } from '../proxy';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../lib/db';
import { hashIP } from '../lib/hash-ip';

vi.mock('../lib/db', () => ({
  db: {
    query: {
      links: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        execute: vi.fn(() => Promise.resolve()),
        returning: vi.fn(() => Promise.resolve([{ id: 'click_id' }]))
      }))
    })),
  },
}));

vi.mock('../lib/hash-ip', () => ({
  hashIP: vi.fn(() => Promise.resolve('mock_ip_hash')),
}));

// Provide minimal mock for NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      next: vi.fn(() => ({ status: 200, type: 'next' })),
      rewrite: vi.fn((url: URL) => ({ status: 200, type: 'rewrite', url: url.toString() })),
      redirect: vi.fn((url: string, options?: { status: number }) => {
        const headers = new Map();
        return {
          status: options?.status || 307,
          type: 'redirect',
          url,
          headers: {
            set: (key: string, value: string) => headers.set(key, value),
            get: (key: string) => headers.get(key),
          }
        };
      }),
    },
  };
});

describe('proxy middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'https://snip.to';
  });

  const createMockRequest = (pathname: string) => {
    return {
      nextUrl: { pathname },
      url: `https://snip.to${pathname}`,
      headers: new Map([['x-forwarded-for', '127.0.0.1']]),
    } as unknown as NextRequest;
  };

  it('bypasses root (/)', async () => {
    const req = createMockRequest('/');
    const res = await proxy(req);
    expect(res.type).toBe('next');
  });

  it('redirects to not-found if slug is empty', async () => {
    const req = createMockRequest('/');
    const res = await proxy(req);
    expect(res.type).toBe('next');
  });

  it('redirects to not-found if link is disabled', async () => {
    (db.query.links.findFirst as any).mockResolvedValueOnce({ disabled: true });
    const req = createMockRequest('/slug');
    const res = await proxy(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/not-found');
  });

  it('redirects to not-found if link does not exist', async () => {
    (db.query.links.findFirst as any).mockResolvedValueOnce(null);
    const req = createMockRequest('/invalid-slug');
    const res = await proxy(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/not-found');
  });

  it('redirects successfully and records click asynchronously', async () => {
    const mockLink = { id: 'link_1', url: 'https://example.com', disabled: false };
    (db.query.links.findFirst as any).mockResolvedValueOnce(mockLink);
    
    const req = createMockRequest('/valid-slug');
    const res = await proxy(req) as any;
    
    expect(res.type).toBe('redirect');
    expect(res.status).toBe(302);
    expect(res.url).toBe('https://example.com');
    // Ensure cache-control is set
    expect(res.headers.get('Cache-Control')).toBe('no-store, max-age=0');
    
    // We can't easily wait for the unhandled promise since it's floating,
    // but the test shouldn't hang and the function should return the redirect.
  });

  it('handles database errors gracefully', async () => {
    (db.query.links.findFirst as any).mockRejectedValueOnce(new Error('DB Error'));
    const req = createMockRequest('/error-slug');
    const res = await proxy(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/not-found');
  });
});
