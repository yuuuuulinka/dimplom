import { GraphType } from './graph';

export interface Algorithm {
  id: string;
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  category: string;
  supportedGraphTypes: GraphType[];
}

export interface Node {
  id: number;
  label?: string;
}

export interface Edge {
  source: number;
  target: number;
  weight?: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface Highlight {
  nodes?: number[];
  edges?: Edge[];
}

export interface AlgorithmStep {
  step: number;
  description: string;
  graph: Graph;
  highlights?: Highlight;
  visited?: Highlight;
  path?: Highlight;
  queue?: string[]; // For visualizing algorithm state like BFS queue with vertex labels
  stack?: string[]; // For visualizing algorithm state like DFS stack with vertex labels
  distances?: Record<string, number | string>; // For visualizing distances in Dijkstra's algorithm
  mstWeight?: number; // For visualizing current MST weight in Prim's algorithm
  unionFindSets?: string[][]; // For visualizing disjoint sets in Kruskal's algorithm
  pass?: { current: number; total: number }; // For visualizing algorithm passes in Bellman-Ford
}