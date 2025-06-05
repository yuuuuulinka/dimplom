import React, { useState, useEffect } from 'react';
import { Plus, Minus, RotateCcw, CheckCircle } from 'lucide-react';
import GraphVisualization from './GraphVisualization';

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

interface GraphEditorProps {
  initialNodes: GraphNode[];
  value: GraphEdge[];
  onChange: (edges: GraphEdge[]) => void;
  disabled?: boolean;
  directed?: boolean;
}

const GraphEditor: React.FC<GraphEditorProps> = ({
  initialNodes,
  value,
  onChange,
  disabled = false,
  directed = true
}) => {
  const [edges, setEdges] = useState<GraphEdge[]>(value || []);
  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  useEffect(() => {
    setEdges(value || []);
  }, [value]);

  const addEdge = () => {
    if (selectedSource === null || selectedTarget === null || disabled) return;
    
    // Check if edge already exists
    const edgeExists = edges.some(edge => 
      edge.source === selectedSource && edge.target === selectedTarget
    );
    
    if (edgeExists || selectedSource === selectedTarget) {
      return; // Don't add duplicate edges or self-loops
    }
    
    const newEdge: GraphEdge = {
      source: selectedSource,
      target: selectedTarget
    };
    
    const newEdges = [...edges, newEdge];
    setEdges(newEdges);
    onChange(newEdges);
    
    // Reset selection
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  const removeEdge = (sourceId: number, targetId: number) => {
    if (disabled) return;
    
    const newEdges = edges.filter(edge => 
      !(edge.source === sourceId && edge.target === targetId)
    );
    setEdges(newEdges);
    onChange(newEdges);
  };

  const clearAllEdges = () => {
    if (disabled) return;
    
    setEdges([]);
    onChange([]);
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  const getNodeLabel = (nodeId: number) => {
    return initialNodes.find(node => node.id === nodeId)?.label || nodeId.toString();
  };

  const currentGraph: Graph = {
    nodes: initialNodes,
    edges: edges,
    type: directed ? 'directed' : 'undirected',
    weighted: false
  };

  return (
    <div className="space-y-4">
      {/* Graph Visualization */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <span>📊 Поточний граф</span>
          <span className="text-sm text-gray-500">({edges.length} ребер)</span>
        </h3>
        <div className="h-64 w-full">
          <GraphVisualization 
            graph={currentGraph}
            className="w-full h-full"
            hideControls={true}
          />
        </div>
      </div>

      {/* Edge Controls */}
      {!disabled && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">🔗 Додавання ребер</h3>
          
          {/* Add Edge Section - More Compact */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Від вершини:</label>
                <select
                  value={selectedSource || ''}
                  onChange={(e) => setSelectedSource(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Оберіть</option>
                  {initialNodes.map(node => (
                    <option key={node.id} value={node.id}>{node.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">До вершини:</label>
                <select
                  value={selectedTarget || ''}
                  onChange={(e) => setSelectedTarget(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Оберіть</option>
                  {initialNodes.map(node => (
                    <option key={node.id} value={node.id}>{node.label}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={addEdge}
                disabled={selectedSource === null || selectedTarget === null || selectedSource === selectedTarget}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  selectedSource !== null && selectedTarget !== null && selectedSource !== selectedTarget
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus size={14} />
                <span>Додати ребро</span>
              </button>
            </div>
            
            {selectedSource === selectedTarget && selectedSource !== null && (
              <p className="text-orange-600 text-sm mt-2">⚠️ Не можна створювати петлі</p>
            )}
          </div>

          {/* Current Edges List - More Compact */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800">Поточні ребра:</h4>
              {edges.length > 0 && (
                <button
                  onClick={clearAllEdges}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                >
                  <RotateCcw size={14} />
                  <span>Очистити все</span>
                </button>
              )}
            </div>
            
            {edges.length === 0 ? (
              <p className="text-gray-500 text-sm italic py-2">Ребра відсутні. Додайте ребра для створення графа.</p>
            ) : (
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded bg-white">
                {edges.map((edge, index) => (
                  <div key={index} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium">
                      {getNodeLabel(edge.source)} → {getNodeLabel(edge.target)}
                    </span>
                    <button
                      onClick={() => removeEdge(edge.source, edge.target)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                      title="Видалити ребро"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics - More Compact */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <span><strong className="text-blue-800">Вершин:</strong> {initialNodes.length}</span>
            <span><strong className="text-blue-800">Ребер:</strong> {edges.length}</span>
            <span><strong className="text-blue-800">Тип:</strong> {directed ? 'Орієнтований' : 'Неорієнтований'}</span>
          </div>
          <div className="text-xs text-blue-700">
            💡 Мін. {initialNodes.length} ребер для зв'язності
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphEditor; 