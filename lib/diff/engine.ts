import type { JsonDiffNode, JsonDiff, DiffSummary } from "./types";

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
  const leftType = getType(left);
  const rightType = getType(right);

  if (left === undefined && right !== undefined) {
    return {
      key,
      path,
      status: "added",
      type: rightType,
      rightValue: right,
      children:
        rightType !== "primitive" ? diffChildren(key, path, undefined, right) : undefined,
    };
  }

  if (left !== undefined && right === undefined) {
    return {
      key,
      path,
      status: "removed",
      type: leftType,
      leftValue: left,
      children:
        leftType !== "primitive" ? diffChildren(key, path, left, undefined) : undefined,
    };
  }

  if (leftType !== rightType) {
    return {
      key,
      path,
      status: "changed",
      type: rightType,
      leftValue: left,
      rightValue: right,
    };
  }

  if (leftType === "primitive") {
    return {
      key,
      path,
      status: isEqual(left, right) ? "unchanged" : "changed",
      type: "primitive",
      leftValue: left,
      rightValue: right,
    };
  }

  const children = diffChildren(key, path, left, right);
  const hasChanges = children.some((c) => c.status !== "unchanged");

  return {
    key,
    path,
    status: hasChanges ? "changed" : "unchanged",
    type: leftType,
    leftValue: left,
    rightValue: right,
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
  const leftArr = left || [];
  const rightArr = right || [];
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
