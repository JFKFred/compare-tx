"use client";

import { forwardRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { JsonDiffNode, DiffStatus } from "@/lib/diff/types";
import { cn } from "@/lib/utils";

interface JsonTreeViewProps {
  nodes: JsonDiffNode[];
  side: "left" | "right";
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onScroll?: (scrollTop: number) => void;
}

function getStatusClass(status: DiffStatus): string {
  switch (status) {
    case "added":
      return "bg-diff-added";
    case "removed":
      return "bg-diff-removed";
    case "changed":
      return "bg-diff-changed";
    default:
      return "";
  }
}

function formatValue(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return `"${value}"`;
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }
  if (typeof value === "object") {
    return `{${Object.keys(value).length} keys}`;
  }
  return String(value);
}

interface TreeNodeProps {
  node: JsonDiffNode;
  side: "left" | "right";
  depth: number;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
}

function TreeNode({ node, side, depth, expandedPaths, onToggle }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedPaths.has(node.path);
  const value = side === "left" ? node.leftValue : node.rightValue;
  const isPresent = value !== undefined;

  const shouldHighlight =
    node.status === "changed" ||
    (node.status === "added" && side === "right") ||
    (node.status === "removed" && side === "left");

  if (!isPresent && (node.status === "added" || node.status === "removed")) {
    return (
      <div
        className="py-0.5 px-2 text-muted-foreground/50 font-mono text-xs"
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        {node.status === "added" && side === "left" && "(not present)"}
        {node.status === "removed" && side === "right" && "(not present)"}
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-0.5 px-2 font-mono text-xs hover:bg-muted/50",
          shouldHighlight && getStatusClass(node.status)
        )}
        style={{ paddingLeft: depth * 16 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.path)}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-muted-foreground">{node.key}:</span>
        {node.isParsedJsonString && (
          <span className="text-xs text-blue-500 px-1" title="Parsed from JSON string">
            JSON
          </span>
        )}
        <span className="break-all">{formatValue(value)}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              side={side}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const JsonTreeView = forwardRef<HTMLDivElement, JsonTreeViewProps>(
  function JsonTreeView({ nodes, side, expandedPaths, onToggle, onScroll }, ref) {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div
          ref={ref}
          className="max-h-150 overflow-y-auto"
          onScroll={(e) => onScroll?.((e.target as HTMLDivElement).scrollTop)}
        >
          {nodes.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              side={side}
              depth={0}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
            />
          ))}
          {nodes.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No data to display
            </div>
          )}
        </div>
      </div>
    );
  }
);
