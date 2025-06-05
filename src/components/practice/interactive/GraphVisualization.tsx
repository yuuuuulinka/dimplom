import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize, Minimize, RotateCcw } from 'lucide-react';

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

interface GraphVisualizationProps {
  graph: Graph;
  highlightedNodes?: number[];
  highlightedEdges?: Array<{source: number, target: number}>;
  selectedPath?: string[];
  className?: string;
  hideControls?: boolean;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  graph,
  highlightedNodes = [],
  highlightedEdges = [],
  selectedPath = [],
  className = '',
  hideControls = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [canvasSize, setCanvasSize] = useState<'small' | 'medium' | 'large' | 'fullscreen'>('medium');
  const [nodeSize, setNodeSize] = useState(60);

  const sizeConfig = {
    small: { height: '240px', nodeSize: 50, fontSize: '14px', edgeFontSize: '12px' },
    medium: { height: '400px', nodeSize: 60, fontSize: '16px', edgeFontSize: '14px' },
    large: { height: '600px', nodeSize: 70, fontSize: '18px', edgeFontSize: '16px' },
    fullscreen: { height: '80vh', nodeSize: 80, fontSize: '20px', edgeFontSize: '18px' }
  };

  const currentConfig = sizeConfig[canvasSize];

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert graph data to Cytoscape format
    const elements = [
      // Add nodes
      ...graph.nodes.map(node => ({
        data: { 
          id: node.id.toString(), 
          label: node.label,
          type: 'node'
        }
      })),
      // Add edges
      ...graph.edges.map((edge, index) => ({
        data: {
          id: `edge-${index}`,
          source: edge.source.toString(),
          target: edge.target.toString(),
          label: graph.weighted && edge.weight ? edge.weight.toString() : '',
          weight: edge.weight || 1,
          type: 'edge'
        }
      }))
    ];

    // Initialize cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#E5E7EB',
            'border-color': '#9CA3AF',
            'border-width': 3,
            'label': 'data(label)',
            'color': '#1F2937',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': currentConfig.fontSize,
            'font-weight': 'bold',
            'width': currentConfig.nodeSize as any,
            'height': currentConfig.nodeSize as any,
            'text-wrap': 'wrap',
            'text-max-width': (currentConfig.nodeSize - 10) as any
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#6B7280',
            'target-arrow-color': '#6B7280',
            'target-arrow-shape': graph.type === 'directed' ? 'triangle' : 'none',
            'arrow-scale': 1.5,
            'curve-style': 'bezier',
            'label': graph.weighted ? 'data(label)' : '',
            'font-size': currentConfig.edgeFontSize,
            'font-weight': 'bold',
            'color': '#374151',
            'text-background-color': 'white',
            'text-background-opacity': 1,
            'text-background-padding': '4px',
            'text-border-color': '#E5E7EB',
            'text-border-width': 1,
            'text-border-opacity': 1
          }
        },
        {
          selector: '.highlighted-node',
          style: {
            'background-color': '#8B5CF6',
            'border-color': '#7C3AED',
            'border-width': 4,
            'color': '#FFFFFF'
          }
        },
        {
          selector: '.highlighted-edge',
          style: {
            'line-color': '#8B5CF6',
            'target-arrow-color': '#8B5CF6',
            'width': 5,
            'text-background-color': '#8B5CF6',
            'color': '#FFFFFF'
          }
        },
        {
          selector: '.path-node',
          style: {
            'background-color': '#10B981',
            'border-color': '#059669',
            'border-width': 4,
            'color': '#FFFFFF'
          }
        },
        {
          selector: '.path-edge',
          style: {
            'line-color': '#10B981',
            'target-arrow-color': '#10B981',
            'width': 5,
            'text-background-color': '#10B981',
            'color': '#FFFFFF'
          }
        }
      ],
      layout: {
        name: 'circle',
        fit: true,
        padding: canvasSize === 'fullscreen' ? 80 : canvasSize === 'large' ? 60 : 50,
        avoidOverlap: true,
        radius: canvasSize === 'fullscreen' ? 
          Math.min(400, Math.max(150, graph.nodes.length * 50)) :
          canvasSize === 'large' ?
          Math.min(350, Math.max(130, graph.nodes.length * 45)) :
          Math.min(300, Math.max(120, graph.nodes.length * 40))
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      minZoom: 0.3,
      maxZoom: 3
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graph, canvasSize]);

  // Update highlights when props change
  useEffect(() => {
    if (!cyRef.current) return;

    // Clear previous highlights
    cyRef.current.elements().removeClass('highlighted-node highlighted-edge path-node path-edge');

    // Highlight specified nodes
    highlightedNodes.forEach(nodeId => {
      cyRef.current!.getElementById(nodeId.toString()).addClass('highlighted-node');
    });

    // Highlight specified edges
    highlightedEdges.forEach(edge => {
      const edgeElement = cyRef.current!.edges().filter(el => {
        const data = el.data();
        return (data.source === edge.source.toString() && data.target === edge.target.toString()) ||
               (graph.type === 'undirected' && data.source === edge.target.toString() && data.target === edge.source.toString());
      });
      edgeElement.addClass('highlighted-edge');
    });

    // Highlight path if provided
    if (selectedPath.length > 0) {
      // Convert labels to node IDs
      const pathNodeIds = selectedPath.map(label => {
        const node = graph.nodes.find(n => n.label === label);
        return node ? node.id.toString() : null;
      }).filter(id => id !== null);

      // Highlight path nodes
      pathNodeIds.forEach(nodeId => {
        cyRef.current!.getElementById(nodeId!).addClass('path-node');
      });

      // Highlight path edges
      for (let i = 0; i < pathNodeIds.length - 1; i++) {
        const sourceId = pathNodeIds[i];
        const targetId = pathNodeIds[i + 1];
        
        const edgeElement = cyRef.current!.edges().filter(el => {
          const data = el.data();
          return (data.source === sourceId && data.target === targetId) ||
                 (graph.type === 'undirected' && data.source === targetId && data.target === sourceId);
        });
        edgeElement.addClass('path-edge');
      }
    }
  }, [highlightedNodes, highlightedEdges, selectedPath, graph]);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };

  const handleResetView = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
  };

  const getSizeButtonClass = (size: typeof canvasSize) => {
    return `px-2 py-1 text-xs rounded transition-colors ${
      canvasSize === size
        ? 'bg-purple-600 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Canvas size and zoom controls - only show when hideControls is false */}
      {!hideControls && (
        <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Розмір канви:</span>
            <button
              onClick={() => setCanvasSize('small')}
              className={getSizeButtonClass('small')}
            >
              <Minimize size={12} className="mr-1 inline" />
              Малий
            </button>
            <button
              onClick={() => setCanvasSize('medium')}
              className={getSizeButtonClass('medium')}
            >
              Середній
            </button>
            <button
              onClick={() => setCanvasSize('large')}
              className={getSizeButtonClass('large')}
            >
              Великий
            </button>
            <button
              onClick={() => setCanvasSize('fullscreen')}
              className={getSizeButtonClass('fullscreen')}
            >
              <Maximize size={12} className="mr-1 inline" />
              Повний екран
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
              title="Зменшити"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleResetView}
              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
              title="Скинути вид"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
              title="Збільшити"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full border border-gray-300 rounded-lg bg-white shadow-sm"
        style={{ 
          height: hideControls ? '100%' : currentConfig.height,
          minHeight: hideControls ? '200px' : '240px',
          transition: 'height 0.3s ease'
        }}
      />
      
      {/* Graph info - only show when hideControls is false */}
      {!hideControls && (
        <>
          <div className="mt-3 text-sm text-gray-600 flex flex-wrap gap-4">
            <span>
              Тип: <span className="font-medium">
                {graph.type === 'directed' ? 'Орієнтований' : 'Неорієнтований'}
                {graph.weighted ? ', зважений' : ', незважений'}
              </span>
            </span>
            <span>Вершин: <span className="font-medium">{graph.nodes.length}</span></span>
            <span>Ребер: <span className="font-medium">{graph.edges.length}</span></span>
          </div>
          
          {/* Legend */}
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded-full"></div>
              <span>Звичайна вершина</span>
            </div>
            {highlightedNodes.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 border-2 border-purple-600 rounded-full"></div>
                <span>Виділена вершина</span>
              </div>
            )}
            {selectedPath.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 border-2 border-green-600 rounded-full"></div>
                <span>Вершина шляху</span>
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="mt-2 text-xs text-gray-500">
            💡 <strong>Керування:</strong> Використовуйте коліщатко миші для збільшення/зменшення, 
            тягніть для переміщення по канві, або використовуйте кнопки управління вище.
          </div>
        </>
      )}
    </div>
  );
};

export default GraphVisualization; 