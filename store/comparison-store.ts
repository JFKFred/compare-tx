import { create } from "zustand";
import { isOk } from "trynot";
import type { TxJson } from "@/lib/cardano/parser";
import type { JsonDiff } from "@/lib/diff/types";
import { parseTransaction } from "@/lib/cardano/parser";
import { diffJson } from "@/lib/diff/engine";

interface ComparisonState {
  leftHex: string;
  rightHex: string;
  leftJson: TxJson | null;
  rightJson: TxJson | null;
  leftError: string | null;
  rightError: string | null;
  diff: JsonDiff | null;
  isComparing: boolean;
}

interface ComparisonActions {
  setLeftHex: (hex: string) => void;
  setRightHex: (hex: string) => void;
  compare: () => Promise<void>;
  reset: () => void;
}

type ComparisonStore = ComparisonState & ComparisonActions;

const initialState: ComparisonState = {
  leftHex: "",
  rightHex: "",
  leftJson: null,
  rightJson: null,
  leftError: null,
  rightError: null,
  diff: null,
  isComparing: false,
};

export const useComparisonStore = create<ComparisonStore>((set, get) => ({
  ...initialState,

  setLeftHex: (hex: string) => {
    set({ leftHex: hex, leftError: null, leftJson: null, diff: null });
  },

  setRightHex: (hex: string) => {
    set({ rightHex: hex, rightError: null, rightJson: null, diff: null });
  },

  compare: async () => {
    const { leftHex, rightHex } = get();

    set({ isComparing: true, leftError: null, rightError: null, diff: null });

    // Yield to the event loop so the "Comparing..." state paints before the
    // synchronous CBOR decode and diff block the main thread.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const leftResult = parseTransaction(leftHex);
    const rightResult = parseTransaction(rightHex);

    const leftJson = isOk(leftResult) ? leftResult : null;
    const rightJson = isOk(rightResult) ? rightResult : null;
    const leftError = isOk(leftResult) ? null : leftResult.message;
    const rightError = isOk(rightResult) ? null : rightResult.message;

    let diff: JsonDiff | null = null;
    if (leftJson && rightJson) {
      diff = diffJson(leftJson, rightJson);
    }

    set({
      leftJson,
      rightJson,
      leftError,
      rightError,
      diff,
      isComparing: false,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
