import { Transaction } from "@emurgo/cardano-serialization-lib-browser";
import { wrap, isErr, type Result } from "trynot";
import { cleanHex } from "./hex";

export type TxJson = {
  body: object;
  witnessSet: object;
  auxiliaryData: object | null;
  isValid: boolean;
};

// wrap's function overload returns a sync/async union; decode is synchronous,
// so we narrow it back to a plain Result.
const decode = wrap((cleanHex: string): TxJson => {
  const tx = Transaction.from_hex(cleanHex);
  const body = tx.body();
  const witnessSet = tx.witness_set();
  const auxiliaryData = tx.auxiliary_data();

  try {
    return {
      body: JSON.parse(body.to_json()),
      witnessSet: JSON.parse(witnessSet.to_json()),
      auxiliaryData: auxiliaryData ? JSON.parse(auxiliaryData.to_json()) : null,
      isValid: tx.is_valid(),
    };
  } finally {
    auxiliaryData?.free();
    witnessSet.free();
    body.free();
    tx.free();
  }
}) as (cleanHex: string) => Result<TxJson>;

export function parseTransaction(hex: string): Result<TxJson> {
  const cleaned = cleanHex(hex);

  if (isErr(cleaned)) {
    return cleaned;
  }

  return decode(cleaned);
}
