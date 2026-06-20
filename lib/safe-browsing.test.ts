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
