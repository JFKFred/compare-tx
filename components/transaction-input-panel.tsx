"use client";

import { Textarea } from "@/components/ui/textarea";

interface TransactionInputPanelProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  placeholder?: string;
}

export function TransactionInputPanel({
  label,
  value,
  onChange,
  error,
  placeholder = "Paste hex-encoded CBOR transaction...",
}: TransactionInputPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-90 font-mono text-xs resize-y min-h-32"
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
