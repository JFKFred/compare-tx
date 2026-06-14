import type { Result } from "trynot";

// Trims, strips whitespace, and validates that the input is a hex string.
// Pure and free of the WASM serialization library so it can be unit tested.
export function cleanHex(hex: string): Result<string> {
  const cleaned = hex.trim().replace(/\s/g, "");

  if (cleaned.length === 0) {
    return new Error("Empty input");
  }

  if (!/^[0-9a-fA-F]*$/.test(cleaned)) {
    return new Error("Invalid hex string");
  }

  return cleaned;
}
