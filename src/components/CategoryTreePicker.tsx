// File: src/components/CategoryTreePicker.tsx
"use client";

import React from "react";

export type CategoryNode = {
  id: number;
  name: string;
  children?: CategoryNode[];
};

type Props = {
  tree: CategoryNode[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  maxSelectable?: number | null;
};

function toggleSelection(selectedIds: number[], id: number, maxSelectable?: number | null) {
  const exists = selectedIds.includes(id);
  let next = exists ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
  if (maxSelectable && next.length > maxSelectable) {
    // keep the most recent selections up to the limit
    next = next.slice(next.length - maxSelectable);
  }
  return next;
}

function RenderNode({
  node,
  level,
  selectedIds,
  onChange,
  maxSelectable,
}: {
  node: CategoryNode;
  level: number;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  maxSelectable?: number | null;
}) {
  return (
    <div key={node.id} className="flex flex-col">
      <label className="flex items-center gap-2" style={{ paddingLeft: level * 12 }}>
        <input
          type="checkbox"
          checked={selectedIds.includes(node.id)}
          onChange={() => onChange(toggleSelection(selectedIds, node.id, maxSelectable))}
        />
        <span>{node.name}</span>
      </label>

      {node.children && node.children.length > 0 && (
        <div className="ml-2">
          {node.children.map((child) => (
            <RenderNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedIds={selectedIds}
              onChange={onChange}
              maxSelectable={maxSelectable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTreePicker({ tree, selectedIds, onChange, maxSelectable = null }: Props) {
  return <div className="space-y-2">{tree.map((n) => <RenderNode key={n.id} node={n} level={0} selectedIds={selectedIds} onChange={onChange} maxSelectable={maxSelectable} />)}</div>;
}
