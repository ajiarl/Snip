import { nanoid } from "nanoid";

export function generateAnonId(): string {
  return nanoid(32);
}

export function getAnonIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const match = cookieHeader.match(/anon_id=([^;]+)/);
  return match ? match[1] : null;
}

export function createAnonIdCookie(anonId: string): string {
  const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds
  return `anon_id=${anonId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}
