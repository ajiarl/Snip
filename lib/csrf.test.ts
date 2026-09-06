import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateOrigin } from "./csrf";

describe("validateOrigin", () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://snipid.my.id";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it("allows request without Origin and Referer headers", () => {
    const req = new Request("https://snipid.my.id/api/links", {
      method: "DELETE",
    });
    expect(validateOrigin(req)).toBe(true);
  });

  it("allows request with matching Origin (exact)", () => {
    const req = new Request("https://snipid.my.id/api/links", {
      method: "DELETE",
      headers: { Origin: "https://snipid.my.id" },
    });
    expect(validateOrigin(req)).toBe(true);
  });

  it("allows request with www origin variant", () => {
    const req = new Request("https://www.snipid.my.id/api/links", {
      method: "DELETE",
      headers: { Origin: "https://www.snipid.my.id" },
    });
    expect(validateOrigin(req)).toBe(true);
  });

  it("allows request with matching Referer header", () => {
    const req = new Request("https://snipid.my.id/api/links", {
      method: "DELETE",
      headers: { Referer: "https://www.snipid.my.id/dashboard" },
    });
    expect(validateOrigin(req)).toBe(true);
  });

  it("rejects request from malicious cross-origin site", () => {
    const req = new Request("https://snipid.my.id/api/links", {
      method: "DELETE",
      headers: { Origin: "https://malicious-site.com" },
    });
    expect(validateOrigin(req)).toBe(false);
  });
});
