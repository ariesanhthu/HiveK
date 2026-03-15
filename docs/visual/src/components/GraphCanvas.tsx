import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge as FlowEdge,
  Node as FlowNode,
  Panel,
  useEdgesState,
  useNodesState
} from "reactflow";
import "reactflow/dist/style.css";
import { GraphData, GraphNode, GraphEdge, NodeFilterState, NodeType } from "../lib/schema";

type Props = {
  graph: GraphData;
  filters: NodeFilterState;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onGraphChange: (nodes: GraphNode[], edges: GraphEdge[]) => void;
};

const nodeTypeColors: Record<NodeType, string> = {
  feature: "#2563eb",
  workflow: "#0d9488",
  file: "#4b5563",
  folder: "#7c3aed",
  note: "#f97316"
};

export const GraphCanvas: React.FC<Props> = ({
  graph,
  filters,
  selectedNodeId,
  onSelectNode,
  onGraphChange
}) => {
  const filteredNodes = useMemo(() => {
    return graph.nodes.filter((node) => {
      if (filters.type !== "all" && node.type !== filters.type) return false;
      if (filters.feature && node.feature !== filters.feature) return false;
      if (filters.workflow && node.workflow !== filters.workflow) return false;
      return true;
    });
  }, [graph.nodes, filters]);

  const nodeIdSet = useMemo(() => new Set(filteredNodes.map((node) => node.id)), [filteredNodes]);

  const filteredEdges = useMemo(
    () =>
      graph.edges.filter(
        (edge) => nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)
      ),
    [graph.edges, nodeIdSet]
  );

  const initialFlowNodes: FlowNode[] = filteredNodes.map((node) => ({
    id: node.id,
    data: { label: node.label },
    position: node.position ?? { x: 0, y: 0 },
    style: {
      borderRadius: 8,
      padding: 8,
      border: `1px solid ${nodeTypeColors[node.type]}`,
      background: "#ffffff",
      fontSize: 12
    }
  }));

  const initialFlowEdges: FlowEdge[] = filteredEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label ?? edge.relation,
    type: "default",
    animated: edge.relation === "flows_to"
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlowEdges);

  const syncBackToGraph = useCallback(
    (nextNodes: FlowNode[], nextEdges: FlowEdge[]) => {
      const nodeMap: Record<string, GraphNode> = {};
      graph.nodes.forEach((node) => {
        nodeMap[node.id] = node;
      });

      const updatedNodes: GraphNode[] = nextNodes.map((flowNode) => {
        const existing = nodeMap[flowNode.id];
        if (!existing) {
          return {
            id: flowNode.id,
            type: "note",
            label: String(flowNode.data?.label ?? flowNode.id),
            path: "",
            parentId: null,
            feature: "",
            workflow: "",
            description: "",
            tags: [],
            status: "draft",
            position: flowNode.position,
            lastSyncedAt: new Date().toISOString()
          };
        }

        return {
          ...existing,
          position: flowNode.position,
          label: String(flowNode.data?.label ?? existing.label),
          lastSyncedAt: new Date().toISOString()
        };
      });

      const updatedEdges: GraphEdge[] = nextEdges.map((flowEdge) => {
        const existing = graph.edges.find((edge) => edge.id === flowEdge.id);
        if (!existing) {
          return {
            id: flowEdge.id,
            source: flowEdge.source,
            target: flowEdge.target,
            relation: "uses",
            label: typeof flowEdge.label === "string" ? flowEdge.label : ""
          };
        }

        return {
          ...existing,
          source: flowEdge.source,
          target: flowEdge.target,
          label: typeof flowEdge.label === "string" ? flowEdge.label : existing.label
        };
      });

      onGraphChange(updatedNodes, updatedEdges);
    },
    [graph.nodes, graph.edges, onGraphChange]
  );

  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const next = onNodesChange(changes, nds);
        syncBackToGraph(next, edges);
        return next;
      });
    },
    [edges, onNodesChange, setNodes, syncBackToGraph]
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const next = onEdgesChange(changes, eds);
        syncBackToGraph(nodes, next);
        return next;
      });
    },
    [nodes, onEdgesChange, setEdges, syncBackToGraph]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const next = addEdge(connection, eds);
        syncBackToGraph(nodes, next);
        return next;
      });
    },
    [nodes, setEdges, syncBackToGraph]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  const handleDeleteSelection = useCallback(() => {
    if (!selectedNodeId) return;
    const nextNodes = nodes.filter((node) => node.id !== selectedNodeId);
    const nextEdges = edges.filter(
      (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId
    );
    setNodes(nextNodes);
    setEdges(nextEdges);
    syncBackToGraph(nextNodes, nextEdges);
    onSelectNode(null);
  }, [edges, nodes, onSelectNode, selectedNodeId, setEdges, setNodes, syncBackToGraph]);

  return (
    <div className="graph-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background gap={16} size={1} />
        <MiniMap />
        <Controls />
        <Panel position="top-left">
          <button className="ghost-button" onClick={handleDeleteSelection} disabled={!selectedNodeId}>
            Xóa node đang chọn
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

