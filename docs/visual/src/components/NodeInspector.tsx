import React, { useState } from "react";
import { GraphNode, NodeType, NodeStatus } from "../lib/schema";

type Props = {
  node: GraphNode | null;
  onChange: (id: string, updated: Partial<GraphNode>) => void;
};

const nodeTypes: NodeType[] = ["feature", "workflow", "file", "folder", "note"];
const nodeStatuses: NodeStatus[] = ["draft", "active", "deprecated"];

export const NodeInspector: React.FC<Props> = ({ node, onChange }) => {
  const [localDescription, setLocalDescription] = useState<string>("");

  if (!node) {
    return (
      <section className="panel">
        <h2 className="panel-title">Node metadata</h2>
        <p className="panel-empty">Chọn một node để xem chi tiết.</p>
      </section>
    );
  }

  const handleChange = <K extends keyof GraphNode>(key: K, value: GraphNode[K]) => {
    onChange(node.id, { [key]: value } as Partial<GraphNode>);
  };

  return (
    <section className="panel">
      <h2 className="panel-title">Node metadata</h2>
      <div className="panel-body">
        <div className="field">
          <label className="field-label">ID</label>
          <div className="field-static">{node.id}</div>
        </div>

        <div className="field">
          <label className="field-label">Type</label>
          <select
            className="field-input"
            value={node.type}
            onChange={(event) => handleChange("type", event.target.value as NodeType)}
          >
            {nodeTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Label</label>
          <input
            className="field-input"
            value={node.label}
            onChange={(event) => handleChange("label", event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label">Path</label>
          <input
            className="field-input"
            value={node.path}
            onChange={(event) => handleChange("path", event.target.value)}
          />
        </div>

        <div className="field-grid">
          <div className="field">
            <label className="field-label">Feature</label>
            <input
              className="field-input"
              value={node.feature}
              onChange={(event) => handleChange("feature", event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">Workflow</label>
            <input
              className="field-input"
              value={node.workflow}
              onChange={(event) => handleChange("workflow", event.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Status</label>
          <select
            className="field-input"
            value={node.status}
            onChange={(event) => handleChange("status", event.target.value as NodeStatus)}
          >
            {nodeStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Tags (comma-separated)</label>
          <input
            className="field-input"
            value={node.tags.join(", ")}
            onChange={(event) =>
              handleChange(
                "tags",
                event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              )
            }
          />
        </div>

        <div className="field">
          <label className="field-label">Description</label>
          <textarea
            className="field-textarea"
            value={localDescription || node.description}
            onChange={(event) => {
              setLocalDescription(event.target.value);
              handleChange("description", event.target.value);
            }}
          />
        </div>
      </div>
    </section>
  );
};

