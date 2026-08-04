import { describe, it, expect } from "vitest";
import { isExpired } from "./jwt";

// Build a real (unsigned) JWT — jwt-decode only base64url-decodes the payload,
// so no signature is needed to exercise isExpired.
function makeToken(payload: Record<string, unknown>): string {
  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.sig`;
}

describe("isExpired", () => {
  const nowSec = Math.floor(Date.now() / 1000);

  it("returns true when exp is in the past", () => {
    expect(isExpired(makeToken({ exp: nowSec - 60 }))).toBe(true);
  });

  it("returns false when exp is in the future", () => {
    expect(isExpired(makeToken({ exp: nowSec + 3600 }))).toBe(false);
  });

  it("returns true when the token has no exp claim", () => {
    expect(isExpired(makeToken({ sub: "user" }))).toBe(true);
  });

  it("returns true for an undecodable token", () => {
    expect(isExpired("not-a-jwt")).toBe(true);
  });
});
