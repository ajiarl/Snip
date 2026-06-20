import { describe, it, expect } from 'vitest';
import { generateSlug, isReservedSlug } from './slug';

describe('generateSlug', () => {
  it('should generate slug with default length of 6 characters', () => {
    const slug = generateSlug();
    expect(slug).toHaveLength(6);
  });

  it('should generate slug with custom length', () => {
    const slug = generateSlug(10);
    expect(slug).toHaveLength(10);
  });

  it('should generate URL-safe characters only', () => {
    const slug = generateSlug();
    // nanoid uses A-Za-z0-9_- by default
    expect(slug).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('should generate different slugs on multiple calls', () => {
    const slug1 = generateSlug();
    const slug2 = generateSlug();
    const slug3 = generateSlug();
    
    // Very unlikely to generate same slug twice with 6 char nanoid
    expect(slug1).not.toBe(slug2);
    expect(slug2).not.toBe(slug3);
    expect(slug1).not.toBe(slug3);
  });

  it('should generate slugs that pass validation', () => {
    const slug = generateSlug();
    
    // Should be valid length (6 chars by default, >=3 for validation)
    expect(slug.length).toBeGreaterThanOrEqual(3);
    expect(slug.length).toBeLessThanOrEqual(50);
    
    // Should contain only valid characters
    expect(slug).toMatch(/^[a-z0-9-_]+$/i);
  });
});

describe('isReservedSlug', () => {
  it('should return true for reserved slug "api"', () => {
    expect(isReservedSlug('api')).toBe(true);
  });

  it('should return true for reserved slug "dashboard"', () => {
    expect(isReservedSlug('dashboard')).toBe(true);
  });

  it('should return true for reserved slug "admin"', () => {
    expect(isReservedSlug('admin')).toBe(true);
  });

  it('should return true for reserved slug "_next"', () => {
    expect(isReservedSlug('_next')).toBe(true);
  });

  it('should return false for non-reserved slug', () => {
    expect(isReservedSlug('my-link')).toBe(false);
  });

  it('should return false for random generated slug', () => {
    const slug = generateSlug();
    // Generated slugs should not be reserved (extremely unlikely)
    expect(isReservedSlug(slug)).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isReservedSlug('API')).toBe(true);
    expect(isReservedSlug('Api')).toBe(true);
    expect(isReservedSlug('DASHBOARD')).toBe(true);
  });
});
