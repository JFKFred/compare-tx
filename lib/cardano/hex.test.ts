import { describe, it, expect } from "vitest";
import { isOk, isErr } from "trynot";
import { cleanHex } from "./hex";

describe("cleanHex", () => {
  it("accepts a valid lowercase hex string", () => {
    const result = cleanHex("deadbeef");
    expect(isOk(result)).toBe(true);
    expect(result).toBe("deadbeef");
  });

  it("accepts uppercase hex", () => {
    const result = cleanHex("DEADBEEF");
    expect(result).toBe("DEADBEEF");
  });

  it("strips surrounding and internal whitespace", () => {
    const result = cleanHex("  dead beef\n00  ");
    expect(result).toBe("deadbeef00");
  });

  it("rejects an empty string", () => {
    const result = cleanHex("");
    expect(isErr(result)).toBe(true);
    expect((result as Error).message).toBe("Empty input");
  });

  it("rejects a whitespace-only string", () => {
    const result = cleanHex("   \n  ");
    expect(isErr(result)).toBe(true);
    expect((result as Error).message).toBe("Empty input");
  });

  it("rejects non-hex characters", () => {
    const result = cleanHex("xyz123");
    expect(isErr(result)).toBe(true);
    expect((result as Error).message).toBe("Invalid hex string");
  });
});
