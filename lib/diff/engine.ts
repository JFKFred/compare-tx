import type { JsonDiffNode, JsonDiff, DiffSummary } from "./types";

type JsonStringParseResult =
  | { isParsedJson: true; parsed: object | unknown[] }
  | { isParsedJson: false };

function tryParseJsonString(value: unknown): JsonStringParseResult {
  if (typeof value !== "string") {
    return { isParsedJson: false };
  }

  const trimmed = value.trim();

  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
    return { isParsedJson: false };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "object" && parsed !== null) {
      return { isParsedJson: true, parsed };
    }
    return { isParsedJson: false };
  } catch {
    return { isParsedJson: false };
  }
}

function sortArrayByJson(arr: unknown[]): unknown[] {
  return [...arr].sort((a, b) => {
    const aStr = JSON.stringify(a);
    const bStr = JSON.stringify(b);
    return aStr.localeCompare(bStr);
  });
}

function getType(value: unknown): "object" | "array" | "primitive" {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value !== null && typeof value === "object") {
    return "object";
  }
  return "primitive";
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a === null || b === null) {
    return a === b;
  }
  if (typeof a !== "object") {
    return a === b;
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

function diffValue(
  key: string,
  path: string,
  left: unknown,
  right: unknown
): JsonDiffNode {
  const leftParsed = tryParseJsonString(left);
  const rightParsed = tryParseJsonString(right);

  const isParsedJsonString = leftParsed.isParsedJson || rightParsed.isParsedJson;
  const effectiveLeft = leftParsed.isParsedJson ? leftParsed.parsed : left;
  const effectiveRight = rightParsed.isParsedJson ? rightParsed.parsed : right;

  const leftType = getType(effectiveLeft);
  const rightType = getType(effectiveRight);

  const baseNode = {
    key,
    path,
    ...(isParsedJsonString && { isParsedJsonString: true }),
  };

  if (effectiveLeft === undefined && effectiveRight !== undefined) {
    return {
      ...baseNode,
      status: "added",
      type: rightType,
      rightValue: effectiveRight,
      children:
        rightType !== "primitive"
          ? diffChildren(key, path, undefined, effectiveRight)
          : undefined,
    };
  }

  if (effectiveLeft !== undefined && effectiveRight === undefined) {
    return {
      ...baseNode,
      status: "removed",
      type: leftType,
      leftValue: effectiveLeft,
      children:
        leftType !== "primitive"
          ? diffChildren(key, path, effectiveLeft, undefined)
          : undefined,
    };
  }

  if (leftType !== rightType) {
    return {
      ...baseNode,
      status: "changed",
      type: rightType,
      leftValue: effectiveLeft,
      rightValue: effectiveRight,
    };
  }

  if (leftType === "primitive") {
    return {
      ...baseNode,
      status: isEqual(effectiveLeft, effectiveRight) ? "unchanged" : "changed",
      type: "primitive",
      leftValue: effectiveLeft,
      rightValue: effectiveRight,
    };
  }

  const children = diffChildren(key, path, effectiveLeft, effectiveRight);
  const hasChanges = children.some((c) => c.status !== "unchanged");

  return {
    ...baseNode,
    status: hasChanges ? "changed" : "unchanged",
    type: leftType,
    leftValue: effectiveLeft,
    rightValue: effectiveRight,
    children,
  };
}

function diffChildren(
  _parentKey: string,
  parentPath: string,
  left: unknown,
  right: unknown
): JsonDiffNode[] {
  const leftType = getType(left);
  const rightType = getType(right);

  if (leftType === "array" || rightType === "array") {
    return diffArrays(parentPath, left as unknown[], right as unknown[]);
  }

  if (leftType === "object" || rightType === "object") {
    return diffObjects(
      parentPath,
      left as Record<string, unknown>,
      right as Record<string, unknown>
    );
  }

  return [];
}

function diffArrays(
  parentPath: string,
  left: unknown[] | undefined,
  right: unknown[] | undefined
): JsonDiffNode[] {
  let leftArr = left || [];
  let rightArr = right || [];

  if (parentPath === "witnessSet.plutus_data.elems") {
    leftArr = sortArrayByJson(leftArr);
    rightArr = sortArrayByJson(rightArr);
  }

  const maxLen = Math.max(leftArr.length, rightArr.length);
  const nodes: JsonDiffNode[] = [];

  for (let i = 0; i < maxLen; i++) {
    const path = `${parentPath}[${i}]`;
    const leftItem = leftArr[i];
    const rightItem = rightArr[i];

    nodes.push(diffValue(String(i), path, leftItem, rightItem));
  }

  return nodes;
}

function diffObjects(
  parentPath: string,
  left: Record<string, unknown> | undefined,
  right: Record<string, unknown> | undefined
): JsonDiffNode[] {
  const leftObj = left || {};
  const rightObj = right || {};
  const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]);
  const nodes: JsonDiffNode[] = [];

  for (const key of allKeys) {
    const path = parentPath ? `${parentPath}.${key}` : key;
    nodes.push(diffValue(key, path, leftObj[key], rightObj[key]));
  }

  return nodes;
}

function countSummary(nodes: JsonDiffNode[]): DiffSummary {
  const summary: DiffSummary = { added: 0, removed: 0, changed: 0, unchanged: 0 };

  function count(node: JsonDiffNode) {
    if (node.type === "primitive" || !node.children || node.children.length === 0) {
      summary[node.status]++;
    } else {
      for (const child of node.children) {
        count(child);
      }
    }
  }

  for (const node of nodes) {
    count(node);
  }

  return summary;
}

export function diffJson(left: object | null, right: object | null): JsonDiff {
  if (!left && !right) {
    return { nodes: [], summary: { added: 0, removed: 0, changed: 0, unchanged: 0 } };
  }

  const nodes = diffObjects(
    "",
    left as Record<string, unknown>,
    right as Record<string, unknown>
  );

  return {
    nodes,
    summary: countSummary(nodes),
  };
}
