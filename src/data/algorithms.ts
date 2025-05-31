import { Algorithm, AlgorithmStep } from '../types/algorithms';
import { GraphType } from '../types/graph';

export const getAlgorithms = (): Algorithm[] => {
  return [
    {
      id: 'bfs',
      name: 'Пошук в ширину(BFS)',
      description: 'Пошук в ширину - це алгоритм обходу графа, який досліджує всіх сусідів на поточній глибині перед переходом до вершин наступного рівня глибини.',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      category: 'search',
      supportedGraphTypes: ['directed-unweighted', 'undirected-unweighted']
    },
    {
      id: 'dfs',
      name: 'Пошук в глибину(DFS)',
      description: 'Пошук в глибину - це алгоритм обходу графа, який досліджує якомога далі по кожній гілці перед поверненням назад.',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      category: 'search',
      supportedGraphTypes: ['directed-unweighted', 'undirected-unweighted']
    },
    {
      id: 'dijkstra',
      name: 'Алгоритм Дейкстри',
      description: 'Алгоритм Дейкстри знаходить найкоротші шляхи між вузлами в графі, який може представляти, наприклад, дорожні мережі.',
      timeComplexity: 'O(V² + E) or O((V+E)log V) with priority queue',
      spaceComplexity: 'O(V)',
      category: 'shortest-path',
      supportedGraphTypes: ['directed-weighted', 'undirected-weighted']
    },
    {
      id: 'prim',
      name: 'Алгоритм Прима',
      description: 'Алгоритм Прима - це жадібний алгоритм, який знаходить мінімальне кістякове дерево для зваженого неорієнтованого графа.',
      timeComplexity: 'O(V² + E) or O(E log V) with priority queue',
      spaceComplexity: 'O(V)',
      category: 'minimum-spanning-tree',
      supportedGraphTypes: ['undirected-weighted']
    },
    {
      id: 'kruskal',
      name: 'Алгоритм Крускала',
      description: 'Алгоритм Крускала - це алгоритм мінімального кістякового дерева, який знаходить ребро з найменшою можливою вагою, що з\'єднує будь-які два дерева в лісі.',
      timeComplexity: 'O(E log E) or O(E log V)',
      spaceComplexity: 'O(V)',
      category: 'minimum-spanning-tree',
      supportedGraphTypes: ['undirected-weighted', 'undirected-unweighted']
    },
    {
      id: 'bellman-ford',
      name: 'Алгоритм Беллмана-Форда',
      description: 'Алгоритм Беллмана-Форда - це алгоритм, який обчислює найкоротші шляхи від однієї початкової вершини до всіх інших вершин у зваженому орграфі.',
      timeComplexity: 'O(V × E)',
      spaceComplexity: 'O(V)',
      category: 'shortest-path',
      supportedGraphTypes: ['directed-weighted', 'undirected-weighted']
    }
  ];
};

export const getAlgorithmsForGraphType = (graphType: GraphType): Algorithm[] => {
  const allAlgorithms = getAlgorithms();
  return allAlgorithms.filter(algorithm => 
    algorithm.supportedGraphTypes.includes(graphType)
  );
};

export const getAlgorithmSteps = (algorithmId: string, startVertex?: string, customGraph?: any): AlgorithmStep[] => {
  // Mock steps for different algorithms
  switch (algorithmId) {
    case 'bfs':
      return getBFSSteps(startVertex, customGraph);
    case 'dfs':
      return getDFSSteps(startVertex, customGraph);
    case 'dijkstra':
      return getDijkstraSteps(startVertex, customGraph);
    case 'prim':
      return getPrimSteps(startVertex, customGraph);
    case 'kruskal':
      return getKruskalSteps(customGraph);
    case 'bellman-ford':
      return getBellmanFordSteps(startVertex, customGraph);
    default:
      return [];
  }
};

const getBFSSteps = (startVertex?: string, customGraph?: any): AlgorithmStep[] => {
  // Use custom graph if provided, otherwise use default
  const baseGraph = customGraph || {
    nodes: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
      { id: 3, label: 'C' },
      { id: 4, label: 'D' },
      { id: 5, label: 'E' },
      { id: 6, label: 'F' },
    ],
    edges: [
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      { source: 2, target: 4 },
      { source: 2, target: 5 },
      { source: 3, target: 6 },
    ]
  };

  // Helper function to get neighbors (works for both directed and undirected graphs)
  const getNeighbors = (nodeId: number): number[] => {
    const neighbors: number[] = [];
    
    // Check if this is an undirected graph by looking at the graph type if available
    const isUndirected = customGraph && (
      customGraph.type === 'undirected-weighted' || 
      customGraph.type === 'undirected-unweighted'
    );
    
    // For each edge, check if current node is source or target
    baseGraph.edges.forEach((edge: any) => {
      if (edge.source === nodeId) {
        neighbors.push(edge.target);
      }
      // For undirected graphs, also check if current node is target
      else if (isUndirected && edge.target === nodeId) {
        neighbors.push(edge.source);
      }
    });
    
    return neighbors;
  };

  // Find the starting node - default to first node if not specified
  let startNodeId = baseGraph.nodes[0]?.id || 1;
  let startLabel = baseGraph.nodes[0]?.label || 'A';
  
  if (startVertex) {
    const startNode = baseGraph.nodes.find((node: any) => 
      node.label === startVertex || node.id.toString() === startVertex
    );
    if (startNode) {
      startNodeId = startNode.id;
      startLabel = startNode.label;
    }
  }

  // BFS algorithm simulation with queue tracking
  const visited = new Set<number>();
  const queue: number[] = [];
  const visitOrder: string[] = [];
  const steps: AlgorithmStep[] = [];

  // Step 1: Initialize
  queue.push(startNodeId);
  visitOrder.push(startLabel);
  
  steps.push({
    step: 1,
    description: `Крок 1: Запуск BFS у вершині ${startLabel}. Додати в чергу: [${startLabel}]`,
    graph: baseGraph,
    highlights: {
      nodes: [startNodeId]
    },
    visited: {
      nodes: []
    },
    queue: [startLabel]
  });

  visited.add(startNodeId);
  let stepNumber = 2;

  // Continue BFS while queue is not empty
  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    const currentNode = baseGraph.nodes.find((n: any) => n.id === currentNodeId)!;
    
    // Find neighbors that haven't been visited
    const neighbors = getNeighbors(currentNodeId).filter(neighborId => !visited.has(neighborId));
    
    if (neighbors.length > 0) {
      // Add neighbors to queue and mark as visited
      const neighborLabels = neighbors.map(nodeId => {
        const node = baseGraph.nodes.find((n: any) => n.id === nodeId)!;
        queue.push(nodeId);
        visited.add(nodeId);
        visitOrder.push(node.label);
        return node.label;
      });

      const queueLabels = queue.map(nodeId => 
        baseGraph.nodes.find((n: any) => n.id === nodeId)!.label
      );

      steps.push({
        step: stepNumber,
        description: `Крок ${stepNumber}: Черга: ${currentNode.label}. Відвідати сусідів: ${neighborLabels.join(', ')}. Позначити як відвіданий. Черга: [${queueLabels.join(', ')}]`,
        graph: baseGraph,
        highlights: {
          nodes: neighbors,
          edges: baseGraph.edges.filter((edge: any) => 
            (edge.source === currentNodeId && neighbors.includes(edge.target)) ||
            (edge.target === currentNodeId && neighbors.includes(edge.source))
          )
        },
        visited: {
          nodes: Array.from(visited)
        },
        queue: queueLabels
      });
    } else {
      // No unvisited neighbors
      const queueLabels = queue.map(nodeId => 
        baseGraph.nodes.find((n: any) => n.id === nodeId)!.label
      );
      
      if (queue.length > 0) {
        steps.push({
          step: stepNumber,
          description: `Крок ${stepNumber}: Черга: ${currentNode.label}. Немає невідвіданих сусідів. Черга: [${queueLabels.join(', ')}]`,
          graph: baseGraph,
          highlights: {
            nodes: [currentNodeId]
          },
          visited: {
            nodes: Array.from(visited)
          },
          queue: queueLabels
        });
      }
    }
    
    stepNumber++;
  }

  // Final step - completion
  steps.push({
    step: stepNumber,
    description: `Готово: Всі досяжні вершини були відвідані в порядку BFS. Порядок: ${visitOrder.join(' -> ')}. BFS досліджує всіх сусідів на поточній глибині перед переходом до вершин наступного рівня глибини.`,
    graph: baseGraph,
    visited: {
      nodes: Array.from(visited)
    },
    queue: []
  });

  return steps;
};

const getDFSSteps = (startVertex?: string, customGraph?: any): AlgorithmStep[] => {
  // Use custom graph if provided, otherwise use default
  const baseGraph = customGraph || {
    nodes: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
      { id: 3, label: 'C' },
      { id: 4, label: 'D' },
      { id: 5, label: 'E' },
      { id: 6, label: 'F' },
    ],
    edges: [
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      { source: 2, target: 4 },
      { source: 2, target: 5 },
      { source: 3, target: 6 },
    ]
  };

  // Helper function to get neighbors (works for both directed and undirected graphs)
  const getNeighbors = (nodeId: number): number[] => {
    const neighbors: number[] = [];
    
    // Check if this is an undirected graph by looking at the graph type if available
    const isUndirected = customGraph && (
      customGraph.type === 'undirected-weighted' || 
      customGraph.type === 'undirected-unweighted'
    );
    
    // For each edge, check if current node is source or target
    baseGraph.edges.forEach((edge: any) => {
      if (edge.source === nodeId && !visited.has(edge.target)) {
        neighbors.push(edge.target);
      }
      // For undirected graphs, also check if current node is target
      else if (isUndirected && edge.target === nodeId && !visited.has(edge.source)) {
        neighbors.push(edge.source);
      }
    });
    
    return neighbors;
  };

  // Find the starting node - default to first node if not specified
  let startNodeId = baseGraph.nodes[0]?.id || 1;
  let startLabel = baseGraph.nodes[0]?.label || 'A';
  
  if (startVertex) {
    const startNode = baseGraph.nodes.find((node: any) => 
      node.label === startVertex || node.id.toString() === startVertex
    );
    if (startNode) {
      startNodeId = startNode.id;
      startLabel = startNode.label;
    }
  }

  // DFS algorithm simulation with stack tracking
  const visited = new Set<number>();
  const stack: number[] = [];
  const visitOrder: string[] = [];
  const steps: AlgorithmStep[] = [];

  // Helper function to get stack labels
  const getStackLabels = (): string[] => {
    return stack.map(nodeId => 
      baseGraph.nodes.find((n: any) => n.id === nodeId)!.label
    );
  };

  // Step 1: Initialize
  stack.push(startNodeId);
  
  steps.push({
    step: 1,
    description: `Крок 1: Запуск DFS у вершині ${startLabel}. Додати в стек: [${startLabel}]`,
    graph: baseGraph,
    highlights: {
      nodes: [startNodeId]
    },
    visited: {
      nodes: []
    },
    stack: [startLabel]
  });

  let stepNumber = 2;

  // Continue DFS while stack is not empty
  while (stack.length > 0) {
    const currentNodeId = stack[stack.length - 1]; // Peek at top of stack
    const currentNode = baseGraph.nodes.find((n: any) => n.id === currentNodeId)!;
    
    // Mark as visited if not already visited
    if (!visited.has(currentNodeId)) {
      visited.add(currentNodeId);
      visitOrder.push(currentNode.label);
      
      steps.push({
        step: stepNumber,
        description: `Крок ${stepNumber}: Позначити вершину ${currentNode.label} як відвідану.`,
        graph: baseGraph,
        highlights: {
          nodes: [currentNodeId]
        },
        visited: {
          nodes: Array.from(visited)
        },
        stack: getStackLabels()
      });
      stepNumber++;
    }

    // Find unvisited neighbors
    const neighbors = getNeighbors(currentNodeId);
    
    if (neighbors.length > 0) {
      // Choose the first unvisited neighbor (or could be sorted alphabetically)
      const nextNodeId = neighbors[0];
      const nextNode = baseGraph.nodes.find((n: any) => n.id === nextNodeId)!;
      
      // Push neighbor to stack
      stack.push(nextNodeId);
      
      steps.push({
        step: stepNumber,
        description: `Крок ${stepNumber}: Дослідити сусіда ${nextNode.label} з ${currentNode.label}. Додати в стек: [${getStackLabels().join(', ')}]`,
        graph: baseGraph,
        highlights: {
          nodes: [nextNodeId],
          edges: [{ source: currentNodeId, target: nextNodeId }]
        },
        visited: {
          nodes: Array.from(visited)
        },
        stack: getStackLabels()
      });
      stepNumber++;
    } else {
      // No unvisited neighbors, backtrack
      stack.pop();
      
      if (stack.length > 0) {
        const backtrackToNode = baseGraph.nodes.find((n: any) => n.id === stack[stack.length - 1])!;
        steps.push({
          step: stepNumber,
          description: `Крок ${stepNumber}: Немає невідвіданих сусідів у вершині ${currentNode.label}. Повернутися до вершини ${backtrackToNode.label}. Стек: [${getStackLabels().join(', ')}]`,
          graph: baseGraph,
          highlights: {
            nodes: [stack[stack.length - 1]]
          },
          visited: {
            nodes: Array.from(visited)
          },
          stack: getStackLabels()
        });
      } else {
        steps.push({
          step: stepNumber,
          description: `Крок ${stepNumber}: Немає невідвіданих сусідів у вершині ${currentNode.label}. Стек порожній.`,
          graph: baseGraph,
          highlights: {
            nodes: []
          },
          visited: {
            nodes: Array.from(visited)
          },
          stack: []
        });
      }
      stepNumber++;
    }
  }

  // Final step
  steps.push({
    step: stepNumber,
    description: `Готово: Всі досяжні вершини були відвідані за допомогою DFS. Порядок: ${visitOrder.join(' -> ')}`,
    graph: baseGraph,
    visited: {
      nodes: Array.from(visited)
    },
    stack: []
  });

  return steps;
};

const getDijkstraSteps = (startVertex?: string, customGraph?: any): AlgorithmStep[] => {
  // Use custom graph if provided, otherwise use default
  const baseGraph = customGraph || {
    nodes: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
      { id: 3, label: 'C' },
      { id: 4, label: 'D' },
      { id: 5, label: 'E' },
    ],
    edges: [
      { source: 1, target: 2, weight: 4 },
      { source: 1, target: 3, weight: 2 },
      { source: 2, target: 4, weight: 5 },
      { source: 3, target: 2, weight: 1 },
      { source: 3, target: 4, weight: 8 },
      { source: 3, target: 5, weight: 10 },
      { source: 4, target: 5, weight: 2 },
    ]
  };

  // Find the starting node - default to 'A' (id: 1) if not specified
  let startNodeId = 1;
  let startLabel = 'A';
  
  if (startVertex) {
    const startNode = baseGraph.nodes.find(node => 
      node.label === startVertex || node.id.toString() === startVertex
    );
    if (startNode) {
      startNodeId = startNode.id;
      startLabel = startNode.label;
    }
  }

  // Dijkstra's algorithm simulation with distance tracking
  const distances = new Map<number, number>();
  const previous = new Map<number, number | null>();
  const visited = new Set<number>();
  const unvisited = new Set<number>();
  const steps: AlgorithmStep[] = [];

  // Initialize distances
  baseGraph.nodes.forEach(node => {
    distances.set(node.id, node.id === startNodeId ? 0 : Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  });

  // Helper function to get neighbors with weights
  const getNeighbors = (nodeId: number): Array<{nodeId: number, weight: number}> => {
    return baseGraph.edges
      .filter(edge => edge.source === nodeId)
      .map(edge => ({
        nodeId: edge.target,
        weight: edge.weight || 1
      }));
  };

  // Helper function to get the unvisited node with minimum distance
  const getMinDistanceNode = (): number | null => {
    let minDistance = Infinity;
    let minNode = null;
    
    for (const nodeId of unvisited) {
      if (distances.get(nodeId)! < minDistance) {
        minDistance = distances.get(nodeId)!;
        minNode = nodeId;
      }
    }
    
    return minNode;
  };

  // Helper function to format distances for display
  const getDistancesDisplay = (): Record<string, number | string> => {
    const display: Record<string, number | string> = {};
    baseGraph.nodes.forEach(node => {
      const dist = distances.get(node.id)!;
      display[node.label] = dist === Infinity ? '∞' : dist;
    });
    return display;
  };

  // Helper function to get node label by id
  const getNodeLabel = (nodeId: number): string => {
    return baseGraph.nodes.find(n => n.id === nodeId)!.label;
  };

  // Step 1: Initialize
  steps.push({
    step: 1,
    description: `Крок 1: Запуск алгоритму Дейкстри у вершині ${startLabel}. Встановити відстань до ${startLabel} як 0, а всі інші як ∞. Додати всі вершини в чергу з пріоритетом.`,
    graph: baseGraph,
    highlights: {
      nodes: [startNodeId]
    },
    visited: {
      nodes: []
    },
    distances: getDistancesDisplay()
  });

  let stepNumber = 2;

  // Continue Dijkstra while there are unvisited nodes
  while (unvisited.size > 0) {
    const currentNodeId = getMinDistanceNode();
    
    if (currentNodeId === null || distances.get(currentNodeId) === Infinity) {
      // No more reachable nodes
      break;
    }

    const currentNode = baseGraph.nodes.find(n => n.id === currentNodeId)!;
    unvisited.delete(currentNodeId);
    visited.add(currentNodeId);
    
    // Visit the current node
    steps.push({
      step: stepNumber,
      description: `Крок ${stepNumber}: Відвідати вершину ${currentNode.label} (відстань = ${distances.get(currentNodeId)}). Позначити як відвіданий.`,
      graph: baseGraph,
      highlights: {
        nodes: [currentNodeId]
      },
      visited: {
        nodes: Array.from(visited)
      },
      distances: getDistancesDisplay()
    });
    stepNumber++;

    // Get neighbors of current node
    const neighbors = getNeighbors(currentNodeId);
    
    if (neighbors.length > 0) {
      const updatedNodes: number[] = [];
      const updatedEdges: Array<{source: number, target: number}> = [];
      const updates: string[] = [];
      
      neighbors.forEach(({nodeId: neighborId, weight}) => {
        if (!visited.has(neighborId)) {
          const currentDistance = distances.get(currentNodeId)!;
          const neighborCurrentDistance = distances.get(neighborId)!;
          const newDistance = currentDistance + weight;
          
          if (newDistance < neighborCurrentDistance) {
            distances.set(neighborId, newDistance);
            previous.set(neighborId, currentNodeId);
            updatedNodes.push(neighborId);
            updatedEdges.push({source: currentNodeId, target: neighborId});
            
            const neighborLabel = getNodeLabel(neighborId);
            if (neighborCurrentDistance === Infinity) {
              updates.push(`${neighborLabel} = ${newDistance}`);
            } else {
              updates.push(`${neighborLabel} = min(${neighborCurrentDistance}, ${currentDistance}+${weight}) = ${newDistance}`);
            }
          } else {
            const neighborLabel = getNodeLabel(neighborId);
            if (neighborCurrentDistance !== Infinity) {
              updates.push(`${neighborLabel} = min(${neighborCurrentDistance}, ${currentDistance}+${weight}) = ${neighborCurrentDistance} (no change)`);
            }
          }
        }
      });
      
      if (updatedNodes.length > 0) {
        steps.push({
          step: stepNumber,
          description: `Крок ${stepNumber}: Дослідити сусідів вершини ${currentNode.label}. Оновити відстані: ${updates.join(', ')}.`,
          graph: baseGraph,
          highlights: {
            nodes: updatedNodes,
            edges: updatedEdges
          },
          visited: {
            nodes: Array.from(visited)
          },
          distances: getDistancesDisplay()
        });
        stepNumber++;
      } else if (neighbors.some(({nodeId}) => !visited.has(nodeId))) {
        // Check neighbors but no updates
        steps.push({
          step: stepNumber,
          description: `Крок ${stepNumber}: Перевірити сусідів вершини ${currentNode.label}. Не знайдено коротших шляхів.`,
          graph: baseGraph,
          highlights: {
            nodes: neighbors.filter(({nodeId}) => !visited.has(nodeId)).map(({nodeId}) => nodeId),
            edges: neighbors.filter(({nodeId}) => !visited.has(nodeId)).map(({nodeId}) => ({source: currentNodeId, target: nodeId}))
          },
          visited: {
            nodes: Array.from(visited)
          },
          distances: getDistancesDisplay()
        });
        stepNumber++;
      }
    }
  }

  // Build final distances summary
  const finalDistances: string[] = [];
  baseGraph.nodes.forEach(node => {
    const dist = distances.get(node.id)!;
    finalDistances.push(`${node.label} → ${dist === Infinity ? '∞' : dist}`);
  });

  // Final step
  steps.push({
    step: stepNumber,
    description: `Готово: Всі найкоротші шляхи від вершини ${startLabel} були обчислені. Кінцеві відстані: ${finalDistances.join(', ')}.`,
    graph: baseGraph,
    visited: {
      nodes: Array.from(visited)
    },
    distances: getDistancesDisplay()
  });

  return steps;
};

const getPrimSteps = (startVertex?: string, customGraph?: any): AlgorithmStep[] => {
  // Use custom graph if provided, otherwise use default
  const baseGraph = customGraph || {
    nodes: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
      { id: 3, label: 'C' },
      { id: 4, label: 'D' },
      { id: 5, label: 'E' },
    ],
    edges: [
      { source: 1, target: 2, weight: 2 },
      { source: 1, target: 3, weight: 3 },
      { source: 1, target: 4, weight: 4 },
      { source: 2, target: 3, weight: 1 },
      { source: 2, target: 4, weight: 5 },
      { source: 3, target: 4, weight: 6 },
      { source: 4, target: 5, weight: 2 },
    ]
  };

  // Find the starting node - default to 'A' (id: 1) if not specified
  let startNodeId = 1;
  let startLabel = 'A';
  
  if (startVertex) {
    const startNode = baseGraph.nodes.find(node => 
      node.label === startVertex || node.id.toString() === startVertex
    );
    if (startNode) {
      startNodeId = startNode.id;
      startLabel = startNode.label;
    }
  }

  // Prim's algorithm simulation with MST tracking
  const visited = new Set<number>();
  const mstEdges: Array<{source: number, target: number, weight: number}> = [];
  const steps: AlgorithmStep[] = [];
  let totalWeight = 0;

  // Helper function to get all edges from visited vertices to unvisited vertices
  const getAvailableEdges = (): Array<{source: number, target: number, weight: number}> => {
    const edges: Array<{source: number, target: number, weight: number}> = [];
    
    // For undirected graph, check both directions
    baseGraph.edges.forEach(edge => {
      if (visited.has(edge.source) && !visited.has(edge.target)) {
        edges.push(edge);
      }
      // Check reverse direction for undirected graph
      if (visited.has(edge.target) && !visited.has(edge.source)) {
        edges.push({
          source: edge.target,
          target: edge.source,
          weight: edge.weight || 1
        });
      }
    });
    
    return edges;
  };

  // Helper function to get node label by id
  const getNodeLabel = (nodeId: number): string => {
    return baseGraph.nodes.find(n => n.id === nodeId)!.label;
  };

  // Helper function to format edge list
  const formatEdges = (edges: Array<{source: number, target: number, weight: number}>): string => {
    return edges.map(edge => 
      `(${getNodeLabel(edge.source)}-${getNodeLabel(edge.target)}=${edge.weight})`
    ).join(', ');
  };

  // Step 1: Initialize with starting vertex
  visited.add(startNodeId);
  
  steps.push({
    step: 1,
    description: `Крок 1: Запуск алгоритму Прима у вершині ${startLabel}. Позначити як відвіданий: {${startLabel}}`,
    graph: baseGraph,
    highlights: {
      nodes: [startNodeId]
    },
    visited: {
      nodes: [startNodeId]
    },
    mstWeight: 0
  });

  let stepNumber = 2;

  // Continue until all vertices are in MST
  while (visited.size < baseGraph.nodes.length) {
    const availableEdges = getAvailableEdges();
    
    if (availableEdges.length === 0) {
      // No more edges available (disconnected graph)
      break;
    }

    // Find the edge with minimum weight
    const minEdge = availableEdges.reduce((min, edge) => 
      edge.weight < min.weight ? edge : min
    );

    // Add the edge and vertex to MST
    visited.add(minEdge.target);
    mstEdges.push(minEdge);
    totalWeight += minEdge.weight;

    const sourceLabel = getNodeLabel(minEdge.source);
    const targetLabel = getNodeLabel(minEdge.target);
    const visitedLabels = Array.from(visited).map(nodeId => getNodeLabel(nodeId)).sort();

    // Show available edges and selection
    if (availableEdges.length > 1) {
      steps.push({
        step: stepNumber,
        description: `Крок ${stepNumber}: Ребра з відвіданих вершин: ${formatEdges(availableEdges)} → вибрати ${sourceLabel}-${targetLabel} (мінімальна вага = ${minEdge.weight})`,
        graph: baseGraph,
        highlights: {
          edges: availableEdges
        },
        visited: {
          nodes: Array.from(visited).filter(nodeId => nodeId !== minEdge.target),
          edges: mstEdges.slice(0, -1)
        },
        mstWeight: totalWeight - minEdge.weight
      });
      stepNumber++;
    }

    // Add vertex to MST
    steps.push({
      step: stepNumber,
      description: `Крок ${stepNumber}: Додати ${targetLabel} → відвідано = {${visitedLabels.join(', ')}}`,
      graph: baseGraph,
      highlights: {
        nodes: [minEdge.target],
        edges: [minEdge]
      },
      visited: {
        nodes: Array.from(visited),
        edges: mstEdges
      },
      mstWeight: totalWeight
    });
    stepNumber++;
  }

  // Final step - completion
  const edgeWeights = mstEdges.map(edge => edge.weight);
  const weightSum = edgeWeights.join(' + ');
  
  steps.push({
    step: stepNumber,
    description: `Готово: Всі вершини з'єднані. Загальна вага МКД = ${weightSum} = ${totalWeight}`,
    graph: baseGraph,
    visited: {
      nodes: Array.from(visited),
      edges: mstEdges
    },
    mstWeight: totalWeight
  });

  return steps;
};

const getKruskalSteps = (customGraph?: any): AlgorithmStep[] => {
  // Use custom graph if provided, otherwise use default
  const baseGraph = customGraph || {
    nodes: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
      { id: 3, label: 'C' },
      { id: 4, label: 'D' },
      { id: 5, label: 'E' },
    ],
    edges: [
      { source: 1, target: 2, weight: 2 },
      { source: 1, target: 3, weight: 3 },
      { source: 2, target: 3, weight: 1 },
      { source: 2, target: 4, weight: 5 },
      { source: 3, target: 4, weight: 4 },
      { source: 3, target: 5, weight: 6 },
      { source: 4, target: 5, weight: 2 },
    ]
  };

  // Kruskal's algorithm simulation with Union-Find tracking
  const mstEdges: Array<{source: number, target: number, weight: number}> = [];
  const steps: AlgorithmStep[] = [];
  let totalWeight = 0;

  // Union-Find data structure
  class UnionFind {
    parent: Map<number, number>;
    rank: Map<number, number>;

    constructor(nodes: number[]) {
      this.parent = new Map();
      this.rank = new Map();
      nodes.forEach(node => {
        this.parent.set(node, node);
        this.rank.set(node, 0);
      });
    }

    find(x: number): number {
      if (this.parent.get(x) !== x) {
        this.parent.set(x, this.find(this.parent.get(x)!));
      }
      return this.parent.get(x)!;
    }

    union(x: number, y: number): boolean {
      const rootX = this.find(x);
      const rootY = this.find(y);

      if (rootX === rootY) return false;

      const rankX = this.rank.get(rootX)!;
      const rankY = this.rank.get(rootY)!;

      if (rankX < rankY) {
        this.parent.set(rootX, rootY);
      } else if (rankX > rankY) {
        this.parent.set(rootY, rootX);
      } else {
        this.parent.set(rootY, rootX);
        this.rank.set(rootX, rankX + 1);
      }
      return true;
    }

    getSets(): string[][] {
      const groups = new Map<number, number[]>();
      baseGraph.nodes.forEach(node => {
        const root = this.find(node.id);
        if (!groups.has(root)) {
          groups.set(root, []);
        }
        groups.get(root)!.push(node.id);
      });

      return Array.from(groups.values()).map(group =>
        group.map(nodeId => getNodeLabel(nodeId)).sort()
      );
    }
  }

  // Helper function to get node label by id
  const getNodeLabel = (nodeId: number): string => {
    return baseGraph.nodes.find(n => n.id === nodeId)!.label;
  };

  // Helper function to format edge
  const formatEdge = (edge: {source: number, target: number, weight: number}): string => {
    return `${getNodeLabel(edge.source)}-${getNodeLabel(edge.target)}(${edge.weight})`;
  };

  // Sort all edges by weight
  const sortedEdges = [...baseGraph.edges].sort((a, b) => (a.weight || 0) - (b.weight || 0));
  
  // Initialize Union-Find
  const uf = new UnionFind(baseGraph.nodes.map(n => n.id));

  // Step 1: Show sorted edges
  const sortedEdgeLabels = sortedEdges.map(edge => formatEdge(edge));
  steps.push({
    step: 1,
    description: `Крок 1: Сортувати всі ребра за вагою: [${sortedEdgeLabels.join(', ')}]`,
    graph: baseGraph,
    highlights: {
      edges: sortedEdges
    },
    visited: {
      nodes: [],
      edges: []
    },
    unionFindSets: uf.getSets(),
    mstWeight: 0
  });

  let stepNumber = 2;
  let edgeIndex = 0;

  // Process each edge in sorted order
  for (const edge of sortedEdges) {
    edgeIndex++;
    const sourceLabel = getNodeLabel(edge.source);
    const targetLabel = getNodeLabel(edge.target);
    const edgeLabel = formatEdge(edge);

    // Check if adding this edge would create a cycle
    const sourceRoot = uf.find(edge.source);
    const targetRoot = uf.find(edge.target);
    const wouldCreateCycle = sourceRoot === targetRoot;

    if (!wouldCreateCycle) {
      // Add edge to MST
      uf.union(edge.source, edge.target);
      mstEdges.push(edge);
      totalWeight += edge.weight || 0;

      steps.push({
        step: stepNumber,
        description: `Крок ${stepNumber}: Перевірити ребро ${edgeLabel}: вершини в різних множинах → додати до МКД`,
        graph: baseGraph,
        highlights: {
          nodes: [edge.source, edge.target],
          edges: [edge]
        },
        visited: {
          nodes: [],
          edges: mstEdges
        },
        unionFindSets: uf.getSets(),
        mstWeight: totalWeight
      });
    } else {
      // Skip edge (would create cycle)
      steps.push({
        step: stepNumber,
        description: `Крок ${stepNumber}: Перевірити ребро ${edgeLabel}: вершини в одній множині → пропустити (створить цикл)`,
        graph: baseGraph,
        highlights: {
          edges: [edge]
        },
        visited: {
          nodes: [],
          edges: mstEdges
        },
        unionFindSets: uf.getSets(),
        mstWeight: totalWeight
      });
    }

    stepNumber++;

    // Check if MST is complete (n-1 edges for n nodes)
    if (mstEdges.length === baseGraph.nodes.length - 1) {
      break;
    }
  }

  // Final step - completion
  const edgeWeights = mstEdges.map(edge => edge.weight || 0);
  const mstEdgeLabels = mstEdges.map(edge => `${getNodeLabel(edge.source)}-${getNodeLabel(edge.target)}`);
  
  steps.push({
    step: stepNumber,
    description: `Готово: Алгоритм Крускала завершено! МКД утворений ребрами: [${mstEdgeLabels.join(', ')}]. Загальна вага: ${totalWeight}`,
    graph: baseGraph,
    visited: {
      nodes: baseGraph.nodes.map(n => n.id),
      edges: mstEdges
    },
    unionFindSets: uf.getSets(),
    mstWeight: totalWeight
  });

  return steps;
};

const getBellmanFordSteps = (startVertex?: string, customGraph?: any): AlgorithmStep[] => {
  // Use custom graph if provided, otherwise use default
  const baseGraph = customGraph || {
    nodes: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
      { id: 3, label: 'C' },
      { id: 4, label: 'D' },
      { id: 5, label: 'E' },
    ],
    edges: [
      { source: 1, target: 2, weight: 4 },
      { source: 1, target: 3, weight: 2 },
      { source: 2, target: 4, weight: 3 },
      { source: 3, target: 2, weight: -1 }, // Negative edge weight
      { source: 3, target: 4, weight: 8 },
      { source: 3, target: 5, weight: 10 },
      { source: 4, target: 5, weight: 2 },
      { source: 5, target: 4, weight: -3 }, // Another negative edge
    ]
  };

  // Find the starting node - default to 'A' (id: 1) if not specified
  let startNodeId = 1;
  let startLabel = 'A';
  
  if (startVertex) {
    const startNode = baseGraph.nodes.find(node => 
      node.label === startVertex || node.id.toString() === startVertex
    );
    if (startNode) {
      startNodeId = startNode.id;
      startLabel = startNode.label;
    }
  }

  // Bellman-Ford algorithm simulation with distance tracking
  const distances = new Map<number, number>();
  const previous = new Map<number, number | null>();
  const steps: AlgorithmStep[] = [];
  const numVertices = baseGraph.nodes.length;

  // Helper function to get node label by id
  const getNodeLabel = (nodeId: number): string => {
    return baseGraph.nodes.find(n => n.id === nodeId)!.label;
  };

  // Helper function to format distances for display
  const getDistancesDisplay = (): Record<string, number | string> => {
    const display: Record<string, number | string> = {};
    baseGraph.nodes.forEach(node => {
      const dist = distances.get(node.id)!;
      display[node.label] = dist === Infinity ? '∞' : dist;
    });
    return display;
  };

  // Step 1: Initialize distances
  baseGraph.nodes.forEach(node => {
    distances.set(node.id, node.id === startNodeId ? 0 : Infinity);
    previous.set(node.id, null);
  });

  steps.push({
    step: 1,
    description: `Крок 1: Ініціалізувати відстані. Встановити ${startLabel} = 0, всі інші = ∞`,
    graph: baseGraph,
    highlights: {
      nodes: [startNodeId]
    },
    visited: {
      nodes: []
    },
    distances: getDistancesDisplay()
  });

  let stepNumber = 2;
  let hasChanges = false;

  // Main Bellman-Ford algorithm: V-1 iterations
  for (let pass = 1; pass <= numVertices - 1; pass++) {
    hasChanges = false;
    const relaxedEdges: Array<{source: number, target: number, weight: number}> = [];
    const passUpdates: string[] = [];

    // Check all edges for relaxation
    for (const edge of baseGraph.edges) {
      const sourceDistance = distances.get(edge.source)!;
      const targetDistance = distances.get(edge.target)!;
      const newDistance = sourceDistance + (edge.weight || 0);

      if (sourceDistance !== Infinity && newDistance < targetDistance) {
        // Relax the edge
        distances.set(edge.target, newDistance);
        previous.set(edge.target, edge.source);
        relaxedEdges.push(edge);
        hasChanges = true;

        const sourceLabel = getNodeLabel(edge.source);
        const targetLabel = getNodeLabel(edge.target);
        const oldDist = targetDistance === Infinity ? '∞' : targetDistance;
        passUpdates.push(`${sourceLabel}→${targetLabel}: ${oldDist} → ${newDistance}`);
      }
    }

    if (hasChanges) {
      steps.push({
        step: stepNumber,
        description: `Прохід ${pass} з ${numVertices - 1}: Ослабити ребра. Оновлення: ${passUpdates.join(', ')}`,
        graph: baseGraph,
        highlights: {
          edges: relaxedEdges
        },
        visited: {
          nodes: []
        },
        distances: getDistancesDisplay(),
        pass: { current: pass, total: numVertices - 1 }
      });
    } else {
      steps.push({
        step: stepNumber,
        description: `Прохід ${pass} з ${numVertices - 1}: Неможливо ослабити ребра. Рання термінація.`,
        graph: baseGraph,
        highlights: {
          edges: []
        },
        visited: {
          nodes: []
        },
        distances: getDistancesDisplay(),
        pass: { current: pass, total: numVertices - 1 }
      });
      // Early termination if no changes
      break;
    }
    stepNumber++;
  }

  // Step: Check for negative cycles (V-th iteration)
  const negativeCycleEdges: Array<{source: number, target: number, weight: number}> = [];
  let hasNegativeCycle = false;

  for (const edge of baseGraph.edges) {
    const sourceDistance = distances.get(edge.source)!;
    const targetDistance = distances.get(edge.target)!;
    const newDistance = sourceDistance + (edge.weight || 0);

    if (sourceDistance !== Infinity && newDistance < targetDistance) {
      negativeCycleEdges.push(edge);
      hasNegativeCycle = true;
    }
  }

  if (hasNegativeCycle) {
    // Negative cycle detected
    steps.push({
      step: stepNumber,
      description: `Крок ${stepNumber}: Виявлено цикл з негативною вагою! Наступні ребра все ще можуть бути ослаблені: ${negativeCycleEdges.map(e => `${getNodeLabel(e.source)}→${getNodeLabel(e.target)}`).join(', ')}`,
      graph: baseGraph,
      highlights: {
        edges: negativeCycleEdges
      },
      visited: {
        nodes: []
      },
      distances: getDistancesDisplay()
    });
    stepNumber++;

    steps.push({
      step: stepNumber,
      description: `Помилка: Алгоритм Беллмана-Форда не може обчислювати найкоротші шляхи, коли існують цикли з негативною вагою. Відстані будуть зменшуватися нескінченно.`,
      graph: baseGraph,
      highlights: {
        edges: negativeCycleEdges
      },
      visited: {
        nodes: []
      },
      distances: getDistancesDisplay()
    });
  } else {
    // No negative cycle, algorithm completed successfully
    steps.push({
      step: stepNumber,
      description: `Крок ${stepNumber}: Перевірити наявність циклів з негативною вагою... Неможливо ослабити ребра.`,
      graph: baseGraph,
      highlights: {
        edges: []
      },
      visited: {
        nodes: []
      },
      distances: getDistancesDisplay()
    });
    stepNumber++;

    // Build final distances summary and shortest paths
    const finalDistances: string[] = [];
    const shortestPathNodes: number[] = [];
    const shortestPathEdges: Array<{source: number, target: number}> = [];

    baseGraph.nodes.forEach(node => {
      const dist = distances.get(node.id)!;
      finalDistances.push(`${node.label} → ${dist === Infinity ? '∞' : dist}`);
      
      // Build shortest path for reachable nodes
      if (dist !== Infinity && node.id !== startNodeId) {
        let current = node.id;
        const pathNodes = [current];
        const pathEdges = [];
        
        while (previous.get(current) !== null) {
          const prev = previous.get(current)!;
          pathEdges.unshift({ source: prev, target: current });
          pathNodes.unshift(prev);
          current = prev;
        }
        
        shortestPathNodes.push(...pathNodes);
        shortestPathEdges.push(...pathEdges);
      }
    });

    // Add start node to shortest path visualization
    shortestPathNodes.push(startNodeId);

    steps.push({
      step: stepNumber,
      description: `Готово: Алгоритм Беллмана-Форда завершено успішно! Найкоротші відстані від ${startLabel}: ${finalDistances.join(', ')}.`,
      graph: baseGraph,
      visited: {
        nodes: [...new Set(shortestPathNodes)], // Remove duplicates
        edges: shortestPathEdges
      },
      distances: getDistancesDisplay()
    });
  }

  return steps;
};