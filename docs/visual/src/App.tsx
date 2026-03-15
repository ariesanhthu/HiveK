import React, { useEffect, useMemo, useState } from "react";
import { GraphCanvas } from "./components/GraphCanvas";
import { Sidebar } from "./components/Sidebar";
import { NodeInspector } from "./components/NodeInspector";
import { MarkdownEditor } from "./components/MarkdownEditor";
import { Toolbar } from "./components/Toolbar";
import { GraphData, GraphNode, GraphEdge, NodeFilterState } from "./lib/schema";
import { loadGraphWithFallback, saveGraphToDownload } from "./lib/graph";
import { loadMarkdown } from "./lib/markdown";

export const App: React.FC = () => {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [markdownPath, setMarkdownPath] = useState<string | null>(null);
  const [filters, setFilters] = useState<NodeFilterState>({
    feature: "",
    workflow: "",
    type: "all"
  });

  useEffect(() => {
    loadGraphWithFallback().then(setGraph).catch(console.error);
  }, []);

  const selectedNode = useMemo<GraphNode | null>(() => {
    if (!graph || !selectedNodeId) return null;
    return graph.nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [graph, selectedNodeId]);

  useEffect(() => {
    if (!selectedNode || !selectedNode.path || !selectedNode.path.endsWith(".md")) {
      setMarkdownContent("");
      setMarkdownPath(null);
      return;
    }

    const path = selectedNode.path;
    setMarkdownPath(path);

    loadMarkdown(path)
      .then(setMarkdownContent)
      .catch(() => {
        setMarkdownContent(`# ${selectedNode.label}\n\n_No markdown file found yet at \`${path}\`._`);
      });
  }, [selectedNode]);

  const handleGraphChange = (nextNodes: GraphNode[], nextEdges: GraphEdge[]) => {
    if (!graph) return;
    const nextGraph: GraphData = {
      ...graph,
      nodes: nextNodes,
      edges: nextEdges,
      lastUpdatedAt: new Date().toISOString()
    };
    setGraph(nextGraph);
  };

  const handleNodeMetadataChange = (nodeId: string, updated: Partial<GraphNode>) => {
    if (!graph) return;
    const nextNodes = graph.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            ...updated,
            lastSyncedAt: new Date().toISOString()
          }
        : node
    );
    handleGraphChange(nextNodes, graph.edges);
  };

  const handleSaveGraph = () => {
    if (!graph) return;
    saveGraphToDownload(graph);
  };

  if (!graph) {
    return (
      <div className="app-root">
        <div className="app-shell">
          <header className="app-header">HIVEK Docs Visual Workspace</header>
          <main className="app-main">
            <div className="loading">Đang tải graph từ `graph.json`...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-title">HIVEK Docs Visual Workspace</div>
          <Toolbar
            graph={graph}
            filters={filters}
            onFiltersChange={setFilters}
            onSaveGraph={handleSaveGraph}
          />
        </header>
        <main className="app-main">
          <Sidebar graph={graph} filters={filters} onSelectNode={setSelectedNodeId} />
          <section className="app-main-center">
            <GraphCanvas
              graph={graph}
              filters={filters}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onGraphChange={handleGraphChange}
            />
          </section>
          <section className="app-main-right">
            <NodeInspector node={selectedNode} onChange={handleNodeMetadataChange} />
            <MarkdownEditor
              node={selectedNode}
              markdownPath={markdownPath}
              markdownContent={markdownContent}
              onMarkdownChange={setMarkdownContent}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

