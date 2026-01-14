"use client";

import { Button } from "@/components/ui/button";
import { TransactionInputPanel } from "@/components/transaction-input-panel";
import { TransactionComparisonView } from "@/components/transaction-comparison-view";
import { useComparisonStore } from "@/store/comparison-store";

export default function Home() {
  const {
    leftHex,
    rightHex,
    leftError,
    rightError,
    diff,
    isComparing,
    setLeftHex,
    setRightHex,
    compare,
  } = useComparisonStore();

  const canCompare = leftHex.trim().length > 0 && rightHex.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Cardano Transaction Comparator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Compare two Cardano transactions side by side
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <TransactionInputPanel
            label="Transaction 1"
            value={leftHex}
            onChange={setLeftHex}
            error={leftError}
          />
          <TransactionInputPanel
            label="Transaction 2"
            value={rightHex}
            onChange={setRightHex}
            error={rightError}
          />
        </div>

        <div className="flex justify-center mb-8">
          <Button
            onClick={compare}
            disabled={!canCompare || isComparing}
            size="lg"
          >
            {isComparing ? "Comparing..." : "Compare Transactions"}
          </Button>
        </div>

        {diff && <TransactionComparisonView diff={diff} />}

        {!diff && !leftError && !rightError && (
          <div className="text-center py-16 text-muted-foreground">
            <p>
              Paste two hex-encoded CBOR transactions above and click Compare
            </p>
          </div>
        )}

        {(leftError || rightError) && !diff && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Fix the errors above to compare transactions</p>
          </div>
        )}
      </div>
    </div>
  );
}
