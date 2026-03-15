import { GraphData, GraphNode, GraphEdge } from "./schema";

const GRAPH_PATH = "graph.json";

const starterGraph: GraphData = {
  version: 1,
  lastUpdatedAt: new Date().toISOString(),
  nodes: [
    {
      id: "feature-docs-visual",
      type: "feature",
      label: "Docs Visualization",
      path: "docs/visual/README.md",
      parentId: null,
      feature: "Docs Visualization",
      workflow: "",
      description: "Visual explorer for docs and code relationships.",
      tags: ["docs", "visual", "reactflow"],
      status: "active",
      position: { x: 0, y: 0 },
      lastSyncedAt: new Date().toISOString()
    },
    {
      id: "workflow-explore-graph",
      type: "workflow",
      label: "Explore feature → workflow → file",
      path: "docs/Architecture/frontend/pages.md",
      parentId: "feature-docs-visual",
      feature: "Docs Visualization",
      workflow: "Explore graph",
      description: "Use React Flow graph to explore relationships.",
      tags: ["workflow"],
      status: "active",
      position: { x: 0, y: 200 },
      lastSyncedAt: new Date().toISOString()
    },
    {
      id: "file-graph-json",
      type: "file",
      label: "Graph Data (`graph.json`)",
      path: "docs/visual/graph.json",
      parentId: "workflow-explore-graph",
      feature: "Docs Visualization",
      workflow: "Explore graph",
      description: "Graph data used by React Flow workspace.",
      tags: ["graph", "data"],
      status: "active",
      position: { x: 300, y: 200 },
      lastSyncedAt: new Date().toISOString()
    },
    {
      id: "file-frontend-pages",
      type: "file",
      label: "Frontend Pages Architecture",
      path: "docs/Architecture/frontend/pages.md",
      parentId: "workflow-explore-graph",
      feature: "Docs Visualization",
      workflow: "Explore graph",
      description: "Detailed documentation for frontend pages and flows.",
      tags: ["frontend", "architecture"],
      status: "active",
      position: { x: -300, y: 200 },
      lastSyncedAt: new Date().toISOString()
    }
  ],
  edges: [
    {
      id: "edge-feature-workflow-explore",
      source: "feature-docs-visual",
      target: "workflow-explore-graph",
      relation: "contains",
      label: "contains workflow"
    },
    {
      id: "edge-workflow-file-graph",
      source: "workflow-explore-graph",
      target: "file-graph-json",
      relation: "uses",
      label: "uses graph data"
    },
    {
      id: "edge-workflow-file-frontend",
      source: "workflow-explore-graph",
      target: "file-frontend-pages",
      relation: "documents",
      label: "documents flows"
    }
  ]
};

export async function loadGraphWithFallback(): Promise<GraphData> {
  try {
    const response = await fetch(GRAPH_PATH, { cache: "no-cache" });
    if (!response.ok) {
      return starterGraph;
    }
    const data = (await response.json()) as GraphData;
    return data;
  } catch {
    return starterGraph;
  }
}

export function saveGraphToDownload(graph: GraphData): void {
  const blob = new Blob([JSON.stringify(graph, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "graph.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function createEmptyNodeId(nodes: GraphNode[]): string {
  let index = nodes.length + 1;
  while (nodes.some((node) => node.id === `node-${index}`)) {
    index += 1;
  }
  return `node-${index}`;
}

export function createEmptyEdgeId(edges: GraphEdge[]): string {
  let index = edges.length + 1;
  while (edges.some((edge) => edge.id === `edge-${index}`)) {
    index += 1;
  }
  return `edge-${index}`;
}

