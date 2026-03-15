import { GraphData } from "./schema";

export function markGraphSynced(graph: GraphData): GraphData {
  return {
    ...graph,
    lastUpdatedAt: new Date().toISOString()
  };
}

