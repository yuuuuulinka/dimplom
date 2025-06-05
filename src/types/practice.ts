export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface RelatedProblem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
}

// Test case for algorithm validation
export interface TestCase {
  input: any;
  expectedOutput: any;
  description?: string;
}

// Interactive problem types
export type ProblemType = 
  | 'algorithm-implementation'  // Code a specific algorithm
  | 'shortest-path'            // Find shortest path in graph
  | 'graph-traversal'          // BFS/DFS traversal
  | 'minimum-spanning-tree'    // Find MST
  | 'cycle-detection'          // Detect cycles
  | 'bipartite-check'         // Check if graph is bipartite
  | 'graph-coloring'          // Color vertices with minimum colors
  | 'topological-sort'        // Topological ordering of vertices
  | 'strongly-connected'      // Find strongly connected components
  | 'graph-construction'      // Construct graph by adding edges
  | 'matrix-completion'       // Complete distance/adjacency matrix
  | 'multiple-choice'         // Multiple choice questions
  | 'drag-and-drop';          // Drag and drop ordering

// Problem configuration for different problem types
export interface ProblemConfig {
  type: ProblemType;
  graph?: {
    nodes: Array<{id: number, label: string}>;
    edges: Array<{source: number, target: number, weight?: number}>;
    type: 'directed' | 'undirected';
    weighted: boolean;
  };
  startNode?: string;
  endNode?: string;
  testCases?: TestCase[];
  question?: string;           // For multiple choice questions
  options?: string[];          // For multiple choice
  correctAnswer?: number;      // Index for multiple choice
  items?: string[];           // For drag and drop
  correctOrder?: number[];    // For drag and drop
  graphExamples?: Array<{     // For visual graph examples
    type: string;
    title: string;
    graph: {
      nodes: Array<{id: number, label: string}>;
      edges: Array<{source: number, target: number, weight?: number}>;
      type: 'directed' | 'undirected';
      weighted: boolean;
    };
  }>;
}

// User submission for different problem types
export interface Submission {
  type: ProblemType;
  answer?: any;               // Generic answer
  path?: string[];           // For path problems
  traversalOrder?: string[]; // For traversal problems
  mstEdges?: Array<{source: string, target: string, weight: number}>; // For MST
  code?: string;             // For algorithm implementation
  selectedOption?: number;   // For multiple choice
  orderedItems?: number[];   // For drag and drop
  selectedNodes?: number[];
  nodeColors?: { [nodeId: number]: string }; // For vertex coloring problems
  distances?: { [node: string]: number }; // For Bellman-Ford and other distance algorithms
  constructedEdges?: Array<{source: number, target: number}>; // For graph construction problems
}

// Validation result
export interface ValidationResult {
  isCorrect: boolean;
  score: number;            // 0-100
  feedback: string;
  detailedFeedback?: string;
  hints?: string[];
  correctAnswer?: any;
}

export interface PracticeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  
  // Enhanced for interactive problems
  type: ProblemType;
  config: ProblemConfig;
  
  examples?: Example[];
  constraints?: string[];
  hint?: string;
  solution?: string;
  completed?: boolean;
  estimatedTime: number;
  successRate: number;
  attemptedCount: number;
  averageTime: number;
  relatedProblems?: RelatedProblem[];
  
  // For validation
  validator?: (submission: Submission) => ValidationResult;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  materialId?: string; // linked material
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  questions: TestQuestion[];
  passingScore: number; // percentage required to pass
  completed?: boolean;
  score?: number;
  attempts?: number;
}