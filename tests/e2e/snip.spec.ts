/**
 * E2E Tests for Snip Link Shortener
 * 
 * PREREQUISITES:
 * 1. Dev server must be running: npm run dev
 * 2. .env file must be configured with valid:
 *    - DATABASE_URL (Supabase connection)
 *    - SAFE_BROWSING_API_KEY
 *    - NEXT_PUBLIC_APP_URL=http://localhost:3000
 *    - IP_HASH_SALT
 * 
 * RUN: npm run test:e2e
 * 
 * NOTE: These tests are NOT included in CI because they require:
 * - Running dev server
 * - Database connection with secrets
 * Run manually in local development environment only.
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage - Shorten Flow', () => {
  test('should successfully shorten a valid URL', async ({ page }) => {
    await page.goto('/');
    
    // Fill form with valid URL
    await page.fill('[data-testid="url-input"]', 'https://example.com/test-page');
    
    // Click shorten button
    await page.click('button:has-text("Perpendek")');
    
    // Wait for result card to appear
    await expect(page.locator('[data-testid="result-card"]')).toBeVisible({ timeout: 10000 });
    
    // Verify short link is displayed
    const shortLink = page.locator('a[href*="localhost:3000/"]').first();
    await expect(shortLink).toBeVisible();
    
    // Verify QR code canvas is present
    const qrCode = page.locator('canvas');
    await expect(qrCode).toBeVisible();
  });

  test('should show error for invalid URL scheme (javascript:)', async ({ page }) => {
    await page.goto('/');
    
    // Fill form with dangerous URL
    await page.fill('[data-testid="url-input"]', 'javascript:alert(1)');
    
    // Click shorten button
    await page.click('button:has-text("Perpendek")');
    
    // Wait for error toast (Sonner toast)
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
    
    // Verify error message contains "Skema URL"
    await expect(page.locator('text=/Skema URL.*tidak diizinkan/i')).toBeVisible();
    
    // Verify result card does NOT appear
    await expect(page.locator('[data-testid="result-card"]')).not.toBeVisible();
  });

  test('should allow custom slug', async ({ page }) => {
    await page.goto('/');
    
    const randomSlug = `test-${Date.now()}`;
    
    // Fill URL and custom slug
    await page.fill('[data-testid="url-input"]', 'https://example.com/custom-slug-test');
    await page.fill('[data-testid="custom-slug-input"]', randomSlug);
    
    // Click shorten button
    await page.click('button:has-text("Perpendek")');
    
    // Wait for result
    await expect(page.locator('[data-testid="result-card"]')).toBeVisible({ timeout: 10000 });
    
    // Verify custom slug is in the short link
    await expect(page.locator(`text=/${randomSlug}`)).toBeVisible();
  });
});

test.describe('Redirect Flow', () => {
  test('should redirect from short link to destination URL', async ({ page, context }) => {
    // Step 1: Create a short link
    await page.goto('/');
    const destinationUrl = 'https://example.com/redirect-test';
    
    await page.fill('[data-testid="url-input"]', destinationUrl);
    await page.click('button:has-text("Perpendek")');
    
    await expect(page.locator('[data-testid="result-card"]')).toBeVisible({ timeout: 10000 });
    
    // Extract short link slug
    const shortLinkElement = page.locator('a[href*="localhost:3000/"]').first();
    const shortLinkHref = await shortLinkElement.getAttribute('href');
    expect(shortLinkHref).toBeTruthy();
    
    const slug = shortLinkHref!.split('/').pop();
    expect(slug).toBeTruthy();
    
    // Step 2: Visit short link and verify redirect
    const newPage = await context.newPage();
    await newPage.goto(`/${slug}`);
    
    // Wait for navigation to destination
    await newPage.waitForURL(/example\.com/, { timeout: 10000 });
    
    // Verify we're on the destination URL
    expect(newPage.url()).toContain('example.com');
  });
});

test.describe('Dashboard Flow', () => {
  test('should show created links in dashboard', async ({ page }) => {
    // Create a link first
    await page.goto('/');
    const testUrl = `https://example.com/dashboard-test-${Date.now()}`;
    
    await page.fill('[data-testid="url-input"]', testUrl);
    await page.click('button:has-text("Perpendek")');
    
    await expect(page.locator('[data-testid="result-card"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to dashboard
    await page.click('a:has-text("Dashboard")');
    
    // Wait for dashboard to load
    await expect(page.locator('h1:has-text("Link Saya")')).toBeVisible();
    
    // Verify the created link appears in the list
    await expect(page.locator(`text=${testUrl}`)).toBeVisible({ timeout: 5000 });
  });

  test('should allow deleting a link', async ({ page }) => {
    // Create a link first
    await page.goto('/');
    const testUrl = `https://example.com/delete-test-${Date.now()}`;
    
    await page.fill('[data-testid="url-input"]', testUrl);
    await page.click('button:has-text("Perpendek")');
    
    await expect(page.locator('[data-testid="result-card"]')).toBeVisible({ timeout: 10000 });
    
    // Go to dashboard
    await page.click('a:has-text("Dashboard")');
    await expect(page.locator('h1:has-text("Link Saya")')).toBeVisible();
    
    // Find and click delete button for the link
    const linkCard = page.locator(`text=${testUrl}`).locator('..').locator('..').locator('..');
    await linkCard.locator('button[title="Delete"], button:has(svg)').last().click();
    
    // Confirm deletion in AlertDialog
    await page.click('button:has-text("Hapus")');
    
    // Wait for success toast
    await expect(page.locator('text=/berhasil dihapus/i')).toBeVisible({ timeout: 5000 });
    
    // Verify link is removed from list
    await expect(page.locator(`text=${testUrl}`)).not.toBeVisible();
  });
});

test.describe('Validation Flow', () => {
  test('should reject URL with private IP (127.0.0.1)', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('[data-testid="url-input"]', 'http://127.0.0.1/test');
    await page.click('button:has-text("Perpendek")');
    
    // Verify error toast appears
    await expect(page.locator('text=/Alamat IP privat/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="result-card"]')).not.toBeVisible();
  });

  test('should reject too short custom slug', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('[data-testid="url-input"]', 'https://example.com/test');
    await page.fill('[data-testid="custom-slug-input"]', 'ab'); // Too short (< 3 chars)
    
    await page.click('button:has-text("Perpendek")');
    
    // Verify error toast
    await expect(page.locator('text=/Slug minimal 3 karakter/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="result-card"]')).not.toBeVisible();
  });
});
