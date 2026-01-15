"use client";

import { useState, useCallback, useRef } from "react";
import type { JsonDiff, JsonDiffNode } from "@/lib/diff/types";
import { JsonTreeView } from "./json-tree-view";

interface TransactionComparisonViewProps {
  diff: JsonDiff;
}

function collectAllPaths(nodeList: JsonDiffNode[]): Set<string> {
  const paths = new Set<string>();
  function collect(nodes: JsonDiffNode[]) {
    for (const node of nodes) {
      paths.add(node.path);
      if (node.children) {
        collect(node.children);
      }
    }
  }
  collect(nodeList);
  return paths;
}

export function TransactionComparisonView({ diff }: TransactionComparisonViewProps) {
  const { nodes, summary } = diff;
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => collectAllPaths(nodes));

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const handleLeftScroll = useCallback((scrollTop: number) => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = scrollTop;
    }
    requestAnimationFrame(() => {
      isScrolling.current = false;
    });
  }, []);

  const handleRightScroll = useCallback((scrollTop: number) => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = scrollTop;
    }
    requestAnimationFrame(() => {
      isScrolling.current = false;
    });
  }, []);

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedPaths(collectAllPaths(nodes));
  }, [nodes]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Summary:</span>
          <div className="flex gap-3 text-sm">
            <span className="px-2 py-0.5 rounded bg-diff-added">
              {summary.added} added
            </span>
            <span className="px-2 py-0.5 rounded bg-diff-removed">
              {summary.removed} removed
            </span>
            <span className="px-2 py-0.5 rounded bg-diff-changed">
              {summary.changed} changed
            </span>
            <span className="text-muted-foreground">
              {summary.unchanged} unchanged
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm font-medium text-muted-foreground px-2">
        <span>Transaction 1</span>
        <span>Transaction 2</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <JsonTreeView
          ref={leftScrollRef}
          nodes={nodes}
          side="left"
          expandedPaths={expandedPaths}
          onToggle={handleToggle}
          onScroll={handleLeftScroll}
        />
        <JsonTreeView
          ref={rightScrollRef}
          nodes={nodes}
          side="right"
          expandedPaths={expandedPaths}
          onToggle={handleToggle}
          onScroll={handleRightScroll}
        />
      </div>

      {nodes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No fields to compare
        </div>
      )}
    </div>
  );
}
