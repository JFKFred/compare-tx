import { create } from "zustand";
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
  compare: () => void;
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

  compare: () => {
    const { leftHex, rightHex } = get();

    set({ isComparing: true, leftError: null, rightError: null });

    const leftResult = parseTransaction(leftHex);
    const rightResult = parseTransaction(rightHex);

    const leftJson = leftResult.ok ? leftResult.json : null;
    const rightJson = rightResult.ok ? rightResult.json : null;
    const leftError = leftResult.ok ? null : leftResult.error;
    const rightError = rightResult.ok ? null : rightResult.error;

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
