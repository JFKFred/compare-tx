export type DiffStatus = "unchanged" | "added" | "removed" | "changed";

export interface JsonDiffNode {
  key: string;
  path: string;
  status: DiffStatus;
  type: "object" | "array" | "primitive";
  leftValue?: unknown;
  rightValue?: unknown;
  children?: JsonDiffNode[];
  isParsedJsonString?: boolean;
}

export interface DiffSummary {
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}

export interface JsonDiff {
  nodes: JsonDiffNode[];
  summary: DiffSummary;
}
