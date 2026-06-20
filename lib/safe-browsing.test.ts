import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkUrlSafety } from "./safe-browsing";

describe("checkUrlSafety - Fail-Open behavior", () => {
  const originalApiKey = process.env.SAFE_BROWSING_API_KEY;

  beforeEach(() => {
    vi.stubGlobal("console", {
      ...console,
      warn: vi.fn(),
      error: vi.fn(),
    });
  });

  afterEach(() => {
    process.env.SAFE_BROWSING_API_KEY = originalApiKey;
    vi.unstubAllGlobals();
  });

  it("should return safe: true if API key is not set (Dev Mode)", async () => {
    delete process.env.SAFE_BROWSING_API_KEY;
    const result = await checkUrlSafety("https://malware.testing.google.test/testing/malware/");
    expect(result).toEqual({ safe: true });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("SAFE_BROWSING_API_KEY not set")
    );
  });

  it("should return safe: true (fail-open) and log warn if API key is invalid", async () => {
    process.env.SAFE_BROWSING_API_KEY = "INVALID_API_KEY_SIMULATION";
    const result = await checkUrlSafety("https://malware.testing.google.test/testing/malware/");
    expect(result).toEqual({ safe: true });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Safe Browsing API returned status 400")
    );
  });
});

describe("checkUrlSafety - Normal operation", () => {
  const originalApiKey = process.env.SAFE_BROWSING_API_KEY;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.SAFE_BROWSING_API_KEY = "VALID_API_KEY_SIMULATION";
  });

  afterEach(() => {
    process.env.SAFE_BROWSING_API_KEY = originalApiKey;
    global.fetch = originalFetch;
  });

  it("should return safe: true if API returns no matches", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const result = await checkUrlSafety("https://safe-website.com");
    expect(result).toEqual({ safe: true });
    expect(global.fetch).toHaveBeenCalled();
  });

  it("should return safe: false and list threats if API returns matches", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        matches: [{ threatType: "MALWARE" }]
      }),
    });

    const result = await checkUrlSafety("https://malware.testing.google.test/testing/malware/");
    expect(result).toEqual({ safe: false, threats: ["MALWARE"] });
    expect(global.fetch).toHaveBeenCalled();
  });
});
