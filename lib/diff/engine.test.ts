import { describe, it, expect } from "vitest";
import { diffJson } from "./engine";
import type { JsonDiffNode } from "./types";

function findNode(nodes: JsonDiffNode[], path: string): JsonDiffNode | undefined {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }
    if (node.children) {
      const found = findNode(node.children, path);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

describe("diffJson", () => {
  it("returns empty result when both sides are null", () => {
    const result = diffJson(null, null);
    expect(result.nodes).toEqual([]);
    expect(result.summary).toEqual({
      added: 0,
      removed: 0,
      changed: 0,
      unchanged: 0,
    });
  });

  it("marks identical objects as unchanged", () => {
    const result = diffJson({ a: 1, b: "x" }, { a: 1, b: "x" });
    expect(result.summary).toEqual({
      added: 0,
      removed: 0,
      changed: 0,
      unchanged: 2,
    });
  });

  it("detects a changed primitive", () => {
    const result = diffJson({ a: 1 }, { a: 2 });
    const node = findNode(result.nodes, "a");
    expect(node?.status).toBe("changed");
    expect(node?.leftValue).toBe(1);
    expect(node?.rightValue).toBe(2);
    expect(result.summary.changed).toBe(1);
  });

  it("detects added and removed keys", () => {
    const result = diffJson({ a: 1 }, { b: 2 });
    expect(findNode(result.nodes, "a")?.status).toBe("removed");
    expect(findNode(result.nodes, "b")?.status).toBe("added");
    expect(result.summary.added).toBe(1);
    expect(result.summary.removed).toBe(1);
  });

  it("treats a type change as changed", () => {
    const result = diffJson({ a: 1 }, { a: "1" });
    expect(findNode(result.nodes, "a")?.status).toBe("changed");
  });

  it("recurses into nested objects", () => {
    const result = diffJson(
      { outer: { inner: 1, same: "k" } },
      { outer: { inner: 2, same: "k" } }
    );
    expect(findNode(result.nodes, "outer")?.status).toBe("changed");
    expect(findNode(result.nodes, "outer.inner")?.status).toBe("changed");
    expect(findNode(result.nodes, "outer.same")?.status).toBe("unchanged");
  });

  it("parses nested JSON strings so they diff structurally", () => {
    const result = diffJson(
      { meta: '{"k":1}' },
      { meta: '{"k":2}' }
    );
    const node = findNode(result.nodes, "meta");
    expect(node?.isParsedJsonString).toBe(true);
    expect(findNode(result.nodes, "meta.k")?.status).toBe("changed");
  });

  describe("unordered set paths", () => {
    it("ignores element order for body.inputs", () => {
      const left = { body: { inputs: [{ id: "a" }, { id: "b" }] } };
      const right = { body: { inputs: [{ id: "b" }, { id: "a" }] } };
      const result = diffJson(left, right);
      expect(findNode(result.nodes, "body.inputs")?.status).toBe("unchanged");
    });

    it("still flags a genuine difference within an unordered set", () => {
      const left = { body: { inputs: [{ id: "a" }, { id: "b" }] } };
      const right = { body: { inputs: [{ id: "a" }, { id: "c" }] } };
      const result = diffJson(left, right);
      expect(findNode(result.nodes, "body.inputs")?.status).toBe("changed");
    });

    it("respects element order for non-set arrays like body.outputs", () => {
      const left = { body: { outputs: [{ id: "a" }, { id: "b" }] } };
      const right = { body: { outputs: [{ id: "b" }, { id: "a" }] } };
      const result = diffJson(left, right);
      expect(findNode(result.nodes, "body.outputs")?.status).toBe("changed");
    });

    it("ignores order for nested witnessSet.plutus_data.elems", () => {
      const left = { witnessSet: { plutus_data: { elems: [1, 2, 3] } } };
      const right = { witnessSet: { plutus_data: { elems: [3, 1, 2] } } };
      const result = diffJson(left, right);
      expect(
        findNode(result.nodes, "witnessSet.plutus_data.elems")?.status
      ).toBe("unchanged");
    });
  });
});
