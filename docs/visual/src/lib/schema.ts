export type NodeType = "feature" | "workflow" | "file" | "folder" | "note";

export type RelationType =
  | "contains"
  | "uses"
  | "depends_on"
  | "documents"
  | "implements"
  | "references"
  | "flows_to";

export type NodeStatus = "draft" | "active" | "deprecated";

export type Tag = string;

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  path: string;
  parentId: string | null;
  feature: string;
  workflow: string;
  description: string;
  tags: Tag[];
  status: NodeStatus;
  position: { x: number; y: number };
  lastSyncedAt: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: RelationType;
  label?: string;
}

export interface GraphData {
  version: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  lastUpdatedAt: string;
}

export interface NodeFilterState {
  feature: string;
  workflow: string;
  type: NodeType | "all";
}

