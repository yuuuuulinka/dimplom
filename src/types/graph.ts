export interface Node {
  id: number;
  label?: string;
  x: number;
  y: number;
}

export interface Edge {
  id: number;
  source: number;
  target: number;
  weight?: number;
}

export type GraphType = 'directed-weighted' | 'directed-unweighted' | 'undirected-weighted' | 'undirected-unweighted';

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  type: GraphType;
}

export interface GraphTypeConfig {
  id: GraphType;
  name: string;
  description: string;
  isDirected: boolean;
  isWeighted: boolean;
}