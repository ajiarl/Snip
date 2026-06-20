import { describe, it, expect } from 'vitest';
import { hashIP } from './hash-ip';

describe('hashIP', () => {
  it('should return consistent hash for same IP', async () => {
    const ip = '192.168.1.100';
    const hash1 = await hashIP(ip);
    const hash2 = await hashIP(ip);
    
    expect(hash1).toBe(hash2);
  });

  it('should return different hashes for different IPs', async () => {
    const ip1 = '192.168.1.100';
    const ip2 = '192.168.1.101';
    
    const hash1 = await hashIP(ip1);
    const hash2 = await hashIP(ip2);
    
    expect(hash1).not.toBe(hash2);
  });

  it('should not return the original IP (actually hashed)', async () => {
    const ip = '192.168.1.100';
    const hash = await hashIP(ip);
    
    expect(hash).not.toBe(ip);
  });

  it('should return a hex string (SHA-256 format)', async () => {
    const ip = '192.168.1.100';
    const hash = await hashIP(ip);
    
    // SHA-256 hash is 64 character hex string
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should handle IPv6 addresses', async () => {
    const ipv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    const hash = await hashIP(ipv6);
    
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toBe(ipv6);
  });

  it('should produce different hashes for similar IPs', async () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';
    const ip3 = '192.168.2.1';
    
    const hash1 = await hashIP(ip1);
    const hash2 = await hashIP(ip2);
    const hash3 = await hashIP(ip3);
    
    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);
    expect(hash1).not.toBe(hash3);
  });

  it('should handle special case IPs', async () => {
    const localhost = '127.0.0.1';
    const hash = await hashIP(localhost);
    
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toBe(localhost);
  });
});
