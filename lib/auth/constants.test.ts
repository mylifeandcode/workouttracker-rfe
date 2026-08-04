import { describe, it, expect, vi, afterEach } from "vitest";
import { cookieOptions } from "./constants";

describe("cookieOptions", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses httpOnly, SameSite=Lax, root path, and a 7-day maxAge", () => {
    const opts = cookieOptions();
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe("lax");
    expect(opts.path).toBe("/");
    expect(opts.maxAge).toBe(60 * 60 * 24 * 7);
  });

  it("is not Secure outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(cookieOptions().secure).toBe(false);
  });

  it("is Secure in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(cookieOptions().secure).toBe(true);
  });
});
