import React, { useMemo } from "react";
import { GraphData, NodeFilterState } from "../lib/schema";

type Props = {
  graph: GraphData;
  filters: NodeFilterState;
  onSelectNode: (id: string | null) => void;
};

export const Sidebar: React.FC<Props> = ({ graph, filters, onSelectNode }) => {
  const features = useMemo(
    () =>
      Array.from(
        new Set(graph.nodes.map((node) => node.feature).filter((value) => Boolean(value)))
      ).sort(),
    [graph.nodes]
  );

  const workflows = useMemo(
    () =>
      Array.from(
        new Set(graph.nodes.map((node) => node.workflow).filter((value) => Boolean(value)))
      ).sort(),
    [graph.nodes]
  );

  const visibleNodes = useMemo(
    () =>
      graph.nodes.filter((node) => {
        if (filters.type !== "all" && node.type !== filters.type) return false;
        if (filters.feature && node.feature !== filters.feature) return false;
        if (filters.workflow && node.workflow !== filters.workflow) return false;
        return true;
      }),
    [graph.nodes, filters]
  );

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Nodes</h2>
      <div className="sidebar-list">
        {visibleNodes.map((node) => (
          <button
            key={node.id}
            className="sidebar-node-button"
            onClick={() => onSelectNode(node.id)}
          >
            <div className="sidebar-node-label">{node.label}</div>
            <div className="sidebar-node-meta">
              <span>{node.type}</span>
              {node.feature && <span>· {node.feature}</span>}
              {node.workflow && <span>· {node.workflow}</span>}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

