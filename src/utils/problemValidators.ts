import { Submission, ValidationResult, ProblemConfig } from '../types/practice';

// Graph utilities for validation
interface GraphNode {
  id: number;
  label: string;
}

interface GraphEdge {
  source: number;
  target: number;
  weight?: number;
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  type: 'directed' | 'undirected';
  weighted: boolean;
}

class GraphValidator {
  static getNodeByLabel(graph: Graph, label: string): GraphNode | undefined {
    return graph.nodes.find(node => node.label === label);
  }

  static getNeighbors(graph: Graph, nodeId: number): number[] {
    const neighbors: number[] = [];
    
    graph.edges.forEach(edge => {
      if (edge.source === nodeId) {
        neighbors.push(edge.target);
      }
      if (graph.type === 'undirected' && edge.target === nodeId) {
        neighbors.push(edge.source);
      }
    });
    
    return neighbors;
  }

  static findShortestPath(graph: Graph, startLabel: string, endLabel: string): string[] | null {
    const startNode = this.getNodeByLabel(graph, startLabel);
    const endNode = this.getNodeByLabel(graph, endLabel);
    
    if (!startNode || !endNode) return null;
    
    // BFS for unweighted graphs
    if (!graph.weighted) {
      return this.bfsShortestPath(graph, startNode.id, endNode.id);
    }
    
    // Dijkstra for weighted graphs
    return this.dijkstraShortestPath(graph, startNode.id, endNode.id);
  }

  private static bfsShortestPath(graph: Graph, startId: number, endId: number): string[] | null {
    const queue: number[] = [startId];
    const visited = new Set<number>([startId]);
    const parent = new Map<number, number>();
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      if (currentId === endId) {
        // Reconstruct path
        const path: string[] = [];
        let current = endId;
        
        while (current !== undefined) {
          const node = graph.nodes.find(n => n.id === current)!;
          path.unshift(node.label);
          current = parent.get(current)!;
        }
        
        return path;
      }
      
      const neighbors = this.getNeighbors(graph, currentId);
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          parent.set(neighborId, currentId);
          queue.push(neighborId);
        }
      }
    }
    
    return null; // No path found
  }

  private static dijkstraShortestPath(graph: Graph, startId: number, endId: number): string[] | null {
    const distances = new Map<number, number>();
    const previous = new Map<number, number>();
    const unvisited = new Set<number>();
    
    // Initialize
    graph.nodes.forEach(node => {
      distances.set(node.id, node.id === startId ? 0 : Infinity);
      unvisited.add(node.id);
    });
    
    while (unvisited.size > 0) {
      // Get unvisited node with minimum distance
      let currentId: number | null = null;
      let minDistance = Infinity;
      
      for (const nodeId of unvisited) {
        if (distances.get(nodeId)! < minDistance) {
          minDistance = distances.get(nodeId)!;
          currentId = nodeId;
        }
      }
      
      if (currentId === null || distances.get(currentId) === Infinity) break;
      
      unvisited.delete(currentId);
      
      if (currentId === endId) {
        // Reconstruct path
        const path: string[] = [];
        let current: number | undefined = endId;
        
        while (current !== undefined) {
          const node = graph.nodes.find(n => n.id === current)!;
          path.unshift(node.label);
          current = previous.get(current);
        }
        
        return path;
      }
      
      // Update distances to neighbors
      const neighbors = this.getNeighbors(graph, currentId);
      for (const neighborId of neighbors) {
        if (unvisited.has(neighborId)) {
          const edge = graph.edges.find(e => 
            (e.source === currentId && e.target === neighborId) ||
            (graph.type === 'undirected' && e.target === currentId && e.source === neighborId)
          );
          
          if (edge) {
            const newDistance = distances.get(currentId)! + (edge.weight || 1);
            if (newDistance < distances.get(neighborId)!) {
              distances.set(neighborId, newDistance);
              previous.set(neighborId, currentId);
            }
          }
        }
      }
    }
    
    return null;
  }

  static findMST(graph: Graph): Array<{source: string, target: string, weight: number}> {
    if (graph.type === 'directed') return [];
    
    // Kruskal's algorithm
    const edges = graph.edges
      .map(edge => ({
        ...edge,
        weight: edge.weight || 1
      }))
      .sort((a, b) => a.weight - b.weight);
    
    const parent = new Map<number, number>();
    const rank = new Map<number, number>();
    
    // Initialize Union-Find
    graph.nodes.forEach(node => {
      parent.set(node.id, node.id);
      rank.set(node.id, 0);
    });
    
    const find = (x: number): number => {
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x)!));
      }
      return parent.get(x)!;
    };
    
    const union = (x: number, y: number): boolean => {
      const rootX = find(x);
      const rootY = find(y);
      
      if (rootX === rootY) return false;
      
      const rankX = rank.get(rootX)!;
      const rankY = rank.get(rootY)!;
      
      if (rankX < rankY) {
        parent.set(rootX, rootY);
      } else if (rankX > rankY) {
        parent.set(rootY, rootX);
      } else {
        parent.set(rootY, rootX);
        rank.set(rootX, rankX + 1);
      }
      return true;
    };
    
    const mst: Array<{source: string, target: string, weight: number}> = [];
    
    for (const edge of edges) {
      if (union(edge.source, edge.target)) {
        const sourceNode = graph.nodes.find(n => n.id === edge.source)!;
        const targetNode = graph.nodes.find(n => n.id === edge.target)!;
        
        mst.push({
          source: sourceNode.label,
          target: targetNode.label,
          weight: edge.weight
        });
        
        if (mst.length === graph.nodes.length - 1) break;
      }
    }
    
    return mst;
  }

  static bfsTraversal(graph: Graph, startLabel: string): string[] {
    const startNode = this.getNodeByLabel(graph, startLabel);
    if (!startNode) return [];
    
    const queue: number[] = [startNode.id];
    const visited = new Set<number>([startNode.id]);
    const traversal: string[] = [];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = graph.nodes.find(n => n.id === currentId)!;
      traversal.push(currentNode.label);
      
      const neighbors = this.getNeighbors(graph, currentId)
        .filter(id => !visited.has(id))
        .sort(); // For consistent ordering
      
      for (const neighborId of neighbors) {
        visited.add(neighborId);
        queue.push(neighborId);
      }
    }
    
    return traversal;
  }

  static dfsTraversal(graph: Graph, startLabel: string): string[] {
    const startNode = this.getNodeByLabel(graph, startLabel);
    if (!startNode) return [];
    
    const visited = new Set<number>();
    const traversal: string[] = [];
    
    const dfs = (nodeId: number) => {
      visited.add(nodeId);
      const node = graph.nodes.find(n => n.id === nodeId)!;
      traversal.push(node.label);
      
      const neighbors = this.getNeighbors(graph, nodeId)
        .filter(id => !visited.has(id))
        .sort(); // For consistent ordering
      
      for (const neighborId of neighbors) {
        dfs(neighborId);
      }
    };
    
    dfs(startNode.id);
    return traversal;
  }

  static hasCycle(graph: Graph): boolean {
    if (graph.type === 'directed') {
      return this.hasDirectedCycle(graph);
    } else {
      return this.hasUndirectedCycle(graph);
    }
  }

  private static hasDirectedCycle(graph: Graph): boolean {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const colors = new Map<number, number>();
    
    graph.nodes.forEach(node => colors.set(node.id, WHITE));
    
    const dfs = (nodeId: number): boolean => {
      colors.set(nodeId, GRAY);
      
      const neighbors = this.getNeighbors(graph, nodeId);
      for (const neighborId of neighbors) {
        const color = colors.get(neighborId)!;
        if (color === GRAY || (color === WHITE && dfs(neighborId))) {
          return true;
        }
      }
      
      colors.set(nodeId, BLACK);
      return false;
    };
    
    for (const node of graph.nodes) {
      if (colors.get(node.id) === WHITE && dfs(node.id)) {
        return true;
      }
    }
    
    return false;
  }

  private static hasUndirectedCycle(graph: Graph): boolean {
    const visited = new Set<number>();
    
    const dfs = (nodeId: number, parentId: number | null): boolean => {
      visited.add(nodeId);
      
      const neighbors = this.getNeighbors(graph, nodeId);
      for (const neighborId of neighbors) {
        if (neighborId === parentId) continue;
        
        if (visited.has(neighborId) || dfs(neighborId, nodeId)) {
          return true;
        }
      }
      
      return false;
    };
    
    for (const node of graph.nodes) {
      if (!visited.has(node.id) && dfs(node.id, null)) {
        return true;
      }
    }
    
    return false;
  }

  static isBipartite(graph: Graph): boolean {
    if (graph.type === 'directed') return false;
    
    const colors = new Map<number, number>();
    
    const bfs = (startId: number): boolean => {
      const queue: number[] = [startId];
      colors.set(startId, 0);
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentColor = colors.get(currentId)!;
        
        const neighbors = this.getNeighbors(graph, currentId);
        for (const neighborId of neighbors) {
          if (!colors.has(neighborId)) {
            colors.set(neighborId, 1 - currentColor);
            queue.push(neighborId);
          } else if (colors.get(neighborId) === currentColor) {
            return false;
          }
        }
      }
      
      return true;
    };
    
    for (const node of graph.nodes) {
      if (!colors.has(node.id) && !bfs(node.id)) {
        return false;
      }
    }
    
    return true;
  }

  static topologicalSort(graph: Graph): string[] {
    if (graph.type !== 'directed') return [];
    
    const inDegree = new Map<number, number>();
    const result: string[] = [];
    
    // Initialize in-degrees
    graph.nodes.forEach(node => inDegree.set(node.id, 0));
    
    // Calculate in-degrees
    graph.edges.forEach(edge => {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });
    
    // Queue for nodes with no incoming edges
    const queue: number[] = [];
    graph.nodes.forEach(node => {
      if (inDegree.get(node.id) === 0) {
        queue.push(node.id);
      }
    });
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = graph.nodes.find(n => n.id === nodeId)!;
      result.push(node.label);
      
      // Update in-degrees of neighbors
      const neighbors = this.getNeighbors(graph, nodeId);
      neighbors.forEach(neighborId => {
        inDegree.set(neighborId, inDegree.get(neighborId)! - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      });
    }
    
    return result.length === graph.nodes.length ? result : []; // Check for cycles
  }

  static bellmanFord(graph: Graph, startLabel: string): { distances: Map<string, number>, hasNegativeCycle: boolean } {
    const startNode = this.getNodeByLabel(graph, startLabel);
    if (!startNode) return { distances: new Map(), hasNegativeCycle: false };
    
    const distances = new Map<string, number>();
    
    // Initialize distances
    graph.nodes.forEach(node => {
      distances.set(node.label, node.id === startNode.id ? 0 : Infinity);
    });
    
    // Relax edges V-1 times
    for (let i = 0; i < graph.nodes.length - 1; i++) {
      for (const edge of graph.edges) {
        const sourceNode = graph.nodes.find(n => n.id === edge.source)!;
        const targetNode = graph.nodes.find(n => n.id === edge.target)!;
        const weight = edge.weight || 1;
        
        if (distances.get(sourceNode.label) !== Infinity) {
          const newDistance = distances.get(sourceNode.label)! + weight;
          if (newDistance < distances.get(targetNode.label)!) {
            distances.set(targetNode.label, newDistance);
          }
        }
      }
    }
    
    // Check for negative cycles
    let hasNegativeCycle = false;
    for (const edge of graph.edges) {
      const sourceNode = graph.nodes.find(n => n.id === edge.source)!;
      const targetNode = graph.nodes.find(n => n.id === edge.target)!;
      const weight = edge.weight || 1;
      
      if (distances.get(sourceNode.label) !== Infinity) {
        const newDistance = distances.get(sourceNode.label)! + weight;
        if (newDistance < distances.get(targetNode.label)!) {
          hasNegativeCycle = true;
          break;
        }
      }
    }
    
    return { distances, hasNegativeCycle };
  }

  static tarjanSCC(graph: Graph): string[][] {
    if (graph.type !== 'directed') return [];
    
    let index = 0;
    const stack: number[] = [];
    const indices = new Map<number, number>();
    const lowlinks = new Map<number, number>();
    const onStack = new Set<number>();
    const sccs: string[][] = [];
    
    const strongConnect = (nodeId: number) => {
      indices.set(nodeId, index);
      lowlinks.set(nodeId, index);
      index++;
      stack.push(nodeId);
      onStack.add(nodeId);
      
      const neighbors = this.getNeighbors(graph, nodeId);
      neighbors.forEach(neighborId => {
        if (!indices.has(neighborId)) {
          strongConnect(neighborId);
          lowlinks.set(nodeId, Math.min(lowlinks.get(nodeId)!, lowlinks.get(neighborId)!));
        } else if (onStack.has(neighborId)) {
          lowlinks.set(nodeId, Math.min(lowlinks.get(nodeId)!, indices.get(neighborId)!));
        }
      });
      
      if (lowlinks.get(nodeId) === indices.get(nodeId)) {
        const scc: string[] = [];
        let w: number;
        do {
          w = stack.pop()!;
          onStack.delete(w);
          const node = graph.nodes.find(n => n.id === w)!;
          scc.push(node.label);
        } while (w !== nodeId);
        sccs.push(scc);
      }
    };
    
    graph.nodes.forEach(node => {
      if (!indices.has(node.id)) {
        strongConnect(node.id);
      }
    });
    
    return sccs;
  }
}

// Validators for different problem types
export const problemValidators = {
  'shortest-path': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (!config.graph || !config.startNode || !config.endNode || !submission.path) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Неправильні параметри задачі або відповіді'
      };
    }
    
    const expectedPath = GraphValidator.findShortestPath(config.graph, config.startNode, config.endNode);
    
    if (!expectedPath) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Шлях між вузлами не існує',
        correctAnswer: null
      };
    }
    
    const userPath = submission.path;
    const isCorrect = JSON.stringify(userPath) === JSON.stringify(expectedPath);
    
    if (isCorrect) {
      return {
        isCorrect: true,
        score: 100,
        feedback: `Вітаємо! Ви знайшли правильний найкоротший шлях: ${userPath.join(' → ')}`
      };
    }
    
    // Check if user path is valid but not optimal
    let isValidPath = true;
    const graph = config.graph;
    
    for (let i = 0; i < userPath.length - 1; i++) {
      const currentNode = GraphValidator.getNodeByLabel(graph, userPath[i]);
      const nextNode = GraphValidator.getNodeByLabel(graph, userPath[i + 1]);
      
      if (!currentNode || !nextNode) {
        isValidPath = false;
        break;
      }
      
      const hasEdge = graph.edges.some(edge => 
        (edge.source === currentNode.id && edge.target === nextNode.id) ||
        (graph.type === 'undirected' && edge.target === currentNode.id && edge.source === nextNode.id)
      );
      
      if (!hasEdge) {
        isValidPath = false;
        break;
      }
    }
    
    if (!isValidPath) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Ваш шлях містить неіснуючі ребра або неправильні вузли',
        correctAnswer: expectedPath
      };
    }
    
    if (userPath[0] !== config.startNode || userPath[userPath.length - 1] !== config.endNode) {
      return {
        isCorrect: false,
        score: 25,
        feedback: 'Ваш шлях не починається або не закінчується в правильних вузлах',
        correctAnswer: expectedPath
      };
    }
    
    return {
      isCorrect: false,
      score: 50,
      feedback: `Ваш шлях правильний, але не найкоротший. Найкоротший шлях: ${expectedPath.join(' → ')}`,
      correctAnswer: expectedPath
    };
  },

  'bellman-ford': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (!config.graph || !config.startNode || !config.endNode || !submission.path || !submission.distances) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Потрібно вказати як шлях, так і відстані до всіх вершин'
      };
    }

    // Calculate expected distances using Bellman-Ford
    const bellmanResult = GraphValidator.bellmanFord(config.graph, config.startNode);
    
    if (bellmanResult.hasNegativeCycle) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Граф містить від\'ємний цикл, тому найкоротші шляхи не визначені'
      };
    }

    const expectedDistances = bellmanResult.distances;
    const userDistances = submission.distances;
    
    // Check distances accuracy
    let distanceScore = 0;
    let correctDistances = 0;
    const totalNodes = config.graph.nodes.length;
    
    const distanceFeedback: string[] = [];
    
    for (const node of config.graph.nodes) {
      const nodeLabel = node.label;
      const expectedDist = expectedDistances.get(nodeLabel);
      const userDist = userDistances[nodeLabel];
      
      if (expectedDist !== undefined && userDist !== undefined) {
        if (Math.abs(expectedDist - userDist) < 0.0001) { // Account for floating point precision
          correctDistances++;
        } else {
          distanceFeedback.push(`${nodeLabel}: ваша відстань ${userDist}, правильна ${expectedDist}`);
        }
      } else if (expectedDist !== undefined) {
        distanceFeedback.push(`${nodeLabel}: відстань не вказана, має бути ${expectedDist}`);
      }
    }
    
    distanceScore = (correctDistances / totalNodes) * 80; // 80% for distances
    
    // Check path accuracy
    const expectedPath = GraphValidator.findShortestPath(config.graph, config.startNode, config.endNode);
    let pathScore = 0;
    
    if (expectedPath && JSON.stringify(submission.path) === JSON.stringify(expectedPath)) {
      pathScore = 20; // 20% for correct path
    }
    
    const totalScore = Math.round(distanceScore + pathScore);
    const isCorrect = totalScore >= 95;
    
    if (isCorrect) {
      return {
        isCorrect: true,
        score: 100,
        feedback: `Відмінно! Ви правильно обчислили всі відстані алгоритмом Беллмана-Форда та знайшли найкоротший шлях: ${submission.path.join(' → ')}`
      };
    }
    
    let feedback = `Загальний бал: ${totalScore}/100. `;
    
    if (distanceFeedback.length > 0) {
      feedback += `Помилки у відстанях: ${distanceFeedback.slice(0, 3).join(', ')}`;
      if (distanceFeedback.length > 3) {
        feedback += ` та ще ${distanceFeedback.length - 3} помилок`;
      }
      feedback += '. ';
    }
    
    if (pathScore === 0 && expectedPath) {
      feedback += `Шлях неправильний. Правильний найкоротший шлях: ${expectedPath.join(' → ')}.`;
    }
    
    // Create correct answer display
    const correctDistancesObj: { [key: string]: number } = {};
    expectedDistances.forEach((distance, node) => {
      correctDistancesObj[node] = distance;
    });
    
    return {
      isCorrect: false,
      score: totalScore,
      feedback: feedback.trim(),
      correctAnswer: {
        path: expectedPath,
        distances: correctDistancesObj
      }
    };
  },

  'graph-traversal': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (!config.graph || !config.startNode || !submission.traversalOrder) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Неправильні параметри задачі або відповіді'
      };
    }
    
    // Determine if BFS or DFS based on problem configuration
    const isBFS = config.graph.type === 'directed' || submission.traversalOrder.length > 0; // Default to BFS
    
    const expectedTraversal = isBFS 
      ? GraphValidator.bfsTraversal(config.graph, config.startNode)
      : GraphValidator.dfsTraversal(config.graph, config.startNode);
    
    const userTraversal = submission.traversalOrder;
    const isCorrect = JSON.stringify(userTraversal) === JSON.stringify(expectedTraversal);
    
    if (isCorrect) {
      return {
        isCorrect: true,
        score: 100,
        feedback: `Відмінно! Ваш порядок обходу правильний: ${userTraversal.join(' → ')}`
      };
    }
    
    // Check if all nodes are visited exactly once
    const uniqueNodes = new Set(userTraversal);
    const expectedNodes = new Set(expectedTraversal);
    
    if (uniqueNodes.size !== userTraversal.length) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Деякі вузли відвідані кілька разів або пропущені',
        correctAnswer: expectedTraversal
      };
    }
    
    if (uniqueNodes.size !== expectedNodes.size || ![...uniqueNodes].every(node => expectedNodes.has(node))) {
      return {
        isCorrect: false,
        score: 25,
        feedback: 'Відвідані не всі досяжні вузли або включені недосяжні',
        correctAnswer: expectedTraversal
      };
    }
    
    return {
      isCorrect: false,
      score: 75,
      feedback: `Всі вузли відвідані, але порядок неправильний. Правильний порядок: ${expectedTraversal.join(' → ')}`,
      correctAnswer: expectedTraversal
    };
  },

  'minimum-spanning-tree': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (!config.graph || !submission.mstEdges) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Неправильні параметри задачі або відповіді'
      };
    }
    
    if (config.graph.type === 'directed') {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'МКД існує тільки для неорієнтованих графів'
      };
    }
    
    const expectedMST = GraphValidator.findMST(config.graph);
    const userMST = submission.mstEdges;
    
    // Check if correct number of edges
    if (userMST.length !== config.graph.nodes.length - 1) {
      return {
        isCorrect: false,
        score: 0,
        feedback: `МКД повинно мати ${config.graph.nodes.length - 1} ребер, але ви вказали ${userMST.length}`,
        correctAnswer: expectedMST
      };
    }
    
    // Calculate total weights
    const expectedWeight = expectedMST.reduce((sum, edge) => sum + edge.weight, 0);
    const userWeight = userMST.reduce((sum, edge) => sum + edge.weight, 0);
    
    if (userWeight === expectedWeight) {
      return {
        isCorrect: true,
        score: 100,
        feedback: `Вітаємо! Ви знайшли МКД з правильною мінімальною вагою: ${userWeight}`
      };
    }
    
    return {
      isCorrect: false,
      score: userWeight > expectedWeight ? 25 : 50,
      feedback: `Ваша загальна вага ${userWeight}, але мінімальна можлива: ${expectedWeight}`,
      correctAnswer: expectedMST
    };
  },

  'cycle-detection': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (!config.graph || submission.answer === undefined) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Неправильні параметри задачі або відповіді'
      };
    }
    
    const hasCycle = GraphValidator.hasCycle(config.graph);
    const userAnswer = submission.answer;
    
    const isCorrect = hasCycle === userAnswer;
    
    if (isCorrect) {
      return {
        isCorrect: true,
        score: 100,
        feedback: hasCycle 
          ? 'Правильно! Граф містить цикл'
          : 'Правильно! Граф не містить циклів'
      };
    }
    
    return {
      isCorrect: false,
      score: 0,
      feedback: hasCycle 
        ? 'Неправильно. Граф містить цикл - уважно проаналізуйте ребра'
        : 'Неправильно. Граф не містить циклів - це дерево або ліс',
      correctAnswer: hasCycle
    };
  },

  'bipartite-check': (submission: Submission, config: any): ValidationResult => {
    if (!submission.nodeColors || Object.keys(submission.nodeColors).length === 0) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Будь ласка, розфарбуйте вершини графа двома кольорами.'
      };
    }

    const graph = config.graph;
    const colors = submission.nodeColors;
    
    // Check if exactly 2 colors are used
    const uniqueColors = new Set(Object.values(colors));
    if (uniqueColors.size !== 2) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Для дводольного графа потрібно використовувати рівно два кольори.'
      };
    }

    // Check if all nodes are colored
    const nodeIds = graph.nodes.map((n: any) => n.id);
    for (const nodeId of nodeIds) {
      if (!colors[nodeId]) {
        return {
          isCorrect: false,
          score: 20,
          feedback: `Вершина ${graph.nodes.find((n: any) => n.id === nodeId)?.label} не розфарбована.`
        };
      }
    }

    // Check bipartite property: no two adjacent nodes should have the same color
    for (const edge of graph.edges) {
      const sourceColor = colors[edge.source];
      const targetColor = colors[edge.target];
      
      if (sourceColor === targetColor) {
        const sourceLabel = graph.nodes.find((n: any) => n.id === edge.source)?.label;
        const targetLabel = graph.nodes.find((n: any) => n.id === edge.target)?.label;
        return {
          isCorrect: false,
          score: 40,
          feedback: `Помилка: вершини ${sourceLabel} та ${targetLabel} з'єднані ребром, але мають однаковий колір. Сусідні вершини повинні мати різні кольори.`
        };
      }
    }

    // Verify that the graph is actually bipartite (this specific graph should be)
    const colorValues = Array.from(uniqueColors);
    const group1 = [];
    const group2 = [];
    
    for (const [nodeId, color] of Object.entries(colors)) {
      const nodeLabel = graph.nodes.find((n: any) => n.id === parseInt(nodeId))?.label;
      if (color === colorValues[0]) {
        group1.push(nodeLabel);
      } else {
        group2.push(nodeLabel);
      }
    }

    return {
      isCorrect: true,
      score: 100,
      feedback: `Відмінно! Граф успішно розфарбований як дводольний. Група 1: ${group1.join(', ')}. Група 2: ${group2.join(', ')}.`
    };
  },

  'multiple-choice': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (config.correctAnswer === undefined || submission.selectedOption === undefined) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Неправильні параметри задачі або відповіді'
      };
    }
    
    const isCorrect = submission.selectedOption === config.correctAnswer;
    
    if (isCorrect) {
      return {
        isCorrect: true,
        score: 100,
        feedback: 'Правильна відповідь!'
      };
    }
    
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Неправильна відповідь. Спробуйте ще раз.',
      correctAnswer: config.correctAnswer
    };
  },

  'drag-and-drop': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (!config.correctOrder || !submission.orderedItems) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Неправильні параметри задачі або відповіді'
      };
    }
    
    const isCorrect = JSON.stringify(submission.orderedItems) === JSON.stringify(config.correctOrder);
    
    if (isCorrect) {
      return {
        isCorrect: true,
        score: 100,
        feedback: 'Правильний порядок!'
      };
    }
    
    // Partial credit based on correct positions
    let correctPositions = 0;
    for (let i = 0; i < Math.min(submission.orderedItems.length, config.correctOrder.length); i++) {
      if (submission.orderedItems[i] === config.correctOrder[i]) {
        correctPositions++;
      }
    }
    
    const score = Math.round((correctPositions / config.correctOrder.length) * 100);
    
    return {
      isCorrect: false,
      score,
      feedback: `Частково правильно. ${correctPositions} з ${config.correctOrder.length} позицій правильні.`,
      correctAnswer: config.correctOrder
    };
  },

  'topological-sort': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (!config.graph || !submission.traversalOrder) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Неправильні параметри задачі або відповіді'
      };
    }
    
    if (config.graph.type !== 'directed') {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Топологічне сортування існує тільки для орієнтованих графів'
      };
    }
    
    const expectedOrder = GraphValidator.topologicalSort(config.graph);
    
    if (expectedOrder.length === 0) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Граф містить цикл, топологічне сортування неможливе',
        correctAnswer: null
      };
    }
    
    const userOrder = submission.traversalOrder;
    
    // Check if all nodes are included
    if (userOrder.length !== expectedOrder.length) {
      return {
        isCorrect: false,
        score: 0,
        feedback: `Має бути ${expectedOrder.length} вершин, але вказано ${userOrder.length}`,
        correctAnswer: expectedOrder
      };
    }
    
    // Validate topological order
    const nodePosition = new Map<string, number>();
    userOrder.forEach((node, index) => nodePosition.set(node, index));
    
    let isValidTopological = true;
    for (const edge of config.graph.edges) {
      const sourceNode = config.graph.nodes.find(n => n.id === edge.source)!;
      const targetNode = config.graph.nodes.find(n => n.id === edge.target)!;
      
      const sourcePos = nodePosition.get(sourceNode.label);
      const targetPos = nodePosition.get(targetNode.label);
      
      if (sourcePos === undefined || targetPos === undefined || sourcePos >= targetPos) {
        isValidTopological = false;
        break;
      }
    }
    
    if (isValidTopological) {
      return {
        isCorrect: true,
        score: 100,
        feedback: `Відмінно! Ваше топологічне сортування правильне: ${userOrder.join(' → ')}`
      };
    }
    
    return {
      isCorrect: false,
      score: 25,
      feedback: 'Порядок вершин порушує топологічні обмеження (існують ребра, що йдуть "назад")',
      correctAnswer: expectedOrder
    };
  },

  'strongly-connected': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (!config.graph || submission.answer === undefined) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Неправильні параметри задачі або відповіді'
      };
    }
    
    if (config.graph.type !== 'directed') {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Сильна зв\'язність визначається тільки для орієнтованих графів'
      };
    }
    
    const sccs = GraphValidator.tarjanSCC(config.graph);
    const isStronglyConnected = sccs.length === 1;
    const userAnswer = submission.answer;
    
    if (isStronglyConnected === userAnswer) {
      return {
        isCorrect: true,
        score: 100,
        feedback: isStronglyConnected 
          ? 'Правильно! Граф є сильно зв\'язним - з будь-якої вершини можна дійти до будь-якої іншої'
          : `Правильно! Граф не є сильно зв\'язним. Він має ${sccs.length} сильно зв\'язних компонент`
      };
    }
    
    return {
      isCorrect: false,
      score: 0,
      feedback: isStronglyConnected 
        ? 'Неправильно. Граф є сильно зв\'язним - існує орієнтований шлях між будь-якою парою вершин'
        : `Неправильно. Граф не є сильно зв\'язним, він розбивається на ${sccs.length} компонент`,
      correctAnswer: isStronglyConnected
    };
  },

  'graph-construction': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (!config.graph || !submission.constructedEdges) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Потрібно створити граф, додавши ребра між вершинами'
      };
    }

    // Create graph from user's constructed edges
    const userGraph = {
      nodes: config.graph.nodes,
      edges: submission.constructedEdges.map(edge => ({
        source: edge.source,
        target: edge.target
      })),
      type: config.graph.type,
      weighted: false
    };

    // Check if the constructed graph is strongly connected
    const sccs = GraphValidator.tarjanSCC(userGraph as any);
    const isStronglyConnected = sccs.length === 1;
    
    if (isStronglyConnected) {
      return {
        isCorrect: true,
        score: 100,
        feedback: `Відмінно! Ви створили сильно зв'язний граф з ${submission.constructedEdges.length} ребрами. З будь-якої вершини можна дійти до будь-якої іншої.`
      };
    }

    // Provide detailed feedback about what's missing
    const nodeCount = config.graph.nodes.length;
    const edgeCount = submission.constructedEdges.length;
    
    let feedback = `Граф не є сильно зв'язним. `;
    
    if (edgeCount === 0) {
      feedback += 'Додайте ребра для з\'єднання вершин.';
    } else if (edgeCount < nodeCount) {
      feedback += `У вас ${edgeCount} ребер, але для сильної зв'язності потрібно мінімум ${nodeCount} ребер.`;
    } else if (sccs.length > 1) {
      feedback += `Граф має ${sccs.length} сильно зв'язних компонент замість 1. Переконайтеся, що з кожної вершини можна дійти до всіх інших.`;
    }

    // Partial score based on connectivity progress
    const connectivityScore = Math.round((1 / sccs.length) * 60); // Max 60 points for partial connectivity
    const edgeScore = Math.min(edgeCount / nodeCount, 1) * 40; // Max 40 points for having enough edges
    
    return {
      isCorrect: false,
      score: Math.round(connectivityScore + edgeScore),
      feedback: feedback,
      correctAnswer: `Граф повинен бути сильно зв'язним - з кожної вершини має існувати шлях до кожної іншої.`
    };
  },

  'matrix-completion': (submission: Submission, config: ProblemConfig): ValidationResult => {
    if (!config.testCases || !submission.answer) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Неправильні параметри задачі або відповіді'
      };
    }
    
    const expectedMatrix = config.testCases[0].expectedOutput;
    const userMatrix = submission.answer;
    
    if (JSON.stringify(userMatrix) === JSON.stringify(expectedMatrix)) {
      return {
        isCorrect: true,
        score: 100,
        feedback: 'Вітаємо! Матриця заповнена правильно'
      };
    }
    
    // Calculate partial score based on correct entries
    let correctEntries = 0;
    let totalEntries = 0;
    
    for (let i = 0; i < expectedMatrix.length; i++) {
      for (let j = 0; j < expectedMatrix[i].length; j++) {
        totalEntries++;
        if (userMatrix[i] && userMatrix[i][j] === expectedMatrix[i][j]) {
          correctEntries++;
        }
      }
    }
    
    const score = Math.round((correctEntries / totalEntries) * 100);
    
    return {
      isCorrect: false,
      score,
      feedback: `Частково правильно. ${correctEntries} з ${totalEntries} елементів матриці правильні.`,
      correctAnswer: expectedMatrix
    };
  }
}; 