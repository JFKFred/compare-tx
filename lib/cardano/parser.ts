import { Transaction } from "@emurgo/cardano-serialization-lib-browser";

export type TxJson = {
  body: object;
  witnessSet: object;
  auxiliaryData: object | null;
  isValid: boolean;
};

export type ParseResult =
  | { ok: true; json: TxJson }
  | { ok: false; error: string };

export function parseTransaction(hex: string): ParseResult {
  const cleanHex = hex.trim().replace(/\s/g, "");

  if (cleanHex.length === 0) {
    return { ok: false, error: "Empty input" };
  }

  if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
    return { ok: false, error: "Invalid hex string" };
  }

  try {
    const tx = Transaction.from_hex(cleanHex);

    const txJson: TxJson = {
      body: JSON.parse(tx.body().to_json()),
      witnessSet: JSON.parse(tx.witness_set().to_json()),
      auxiliaryData: tx.auxiliary_data()
        ? JSON.parse(tx.auxiliary_data()!.to_json())
        : null,
      isValid: tx.is_valid(),
    };

    return { ok: true, json: txJson };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to parse transaction";
    return { ok: false, error: message };
  }
}
