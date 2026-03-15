import React from "react";
import { GraphData, NodeFilterState, NodeType } from "../lib/schema";

type Props = {
  graph: GraphData;
  filters: NodeFilterState;
  onFiltersChange: (next: NodeFilterState) => void;
  onSaveGraph: () => void;
};

const nodeTypes: Array<NodeType | "all"> = ["all", "feature", "workflow", "file", "folder", "note"];

export const Toolbar: React.FC<Props> = ({ filters, onFiltersChange, onSaveGraph }) => {
  const handleFilterChange = (patch: Partial<NodeFilterState>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <label className="toolbar-label">
          Type
          <select
            className="toolbar-select"
            value={filters.type}
            onChange={(event) =>
              handleFilterChange({ type: event.target.value as NodeType | "all" })
            }
          >
            {nodeTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="toolbar-group">
        <label className="toolbar-label">
          Feature
          <input
            className="toolbar-input"
            placeholder="feature..."
            value={filters.feature}
            onChange={(event) => handleFilterChange({ feature: event.target.value })}
          />
        </label>
      </div>

      <div className="toolbar-group">
        <label className="toolbar-label">
          Workflow
          <input
            className="toolbar-input"
            placeholder="workflow..."
            value={filters.workflow}
            onChange={(event) => handleFilterChange({ workflow: event.target.value })}
          />
        </label>
      </div>

      <div className="toolbar-spacer" />

      <button className="primary-button" onClick={onSaveGraph}>
        Tải graph.json (export)
      </button>
    </div>
  );
};

