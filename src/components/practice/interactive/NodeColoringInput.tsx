import React, { useState } from 'react';
import { Palette, RotateCcw, MousePointer } from 'lucide-react';

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

interface NodeColoringInputProps {
  graph: Graph;
  value?: { [nodeId: number]: string };
  onChange: (colors: { [nodeId: number]: string }) => void;
}

const NodeColoringInput: React.FC<NodeColoringInputProps> = ({
  graph,
  value = {},
  onChange
}) => {
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6'); // Blue
  const [mode, setMode] = useState<'select' | 'color'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const [nodePositions, setNodePositions] = useState<{ [nodeId: number]: { x: number, y: number } }>(() => {
    // Initialize with default positions
    return {
      1: { x: 150, y: 80 },   // A
      2: { x: 350, y: 80 },   // B  
      3: { x: 450, y: 200 },  // C
      4: { x: 350, y: 320 },  // D
      5: { x: 150, y: 320 },  // E
      6: { x: 50, y: 200 },   // F
      7: { x: 250, y: 240 },  // G
      8: { x: 550, y: 200 }   // H
    };
  });

  const availableColors = [
    { name: 'Синій', value: '#3B82F6', bg: 'bg-blue-500' },
    { name: 'Червоний', value: '#EF4444', bg: 'bg-red-500' },
    { name: 'Зелений', value: '#10B981', bg: 'bg-green-500' },
    { name: 'Жовтий', value: '#F59E0B', bg: 'bg-yellow-500' }
  ];

  const handleNodeClick = (nodeId: number) => {
    if (mode === 'select') return; // Don't color in select mode
    
    const newColors = { ...value };
    if (newColors[nodeId] === selectedColor) {
      // If node already has selected color, remove color
      delete newColors[nodeId];
    } else {
      // Set node to selected color
      newColors[nodeId] = selectedColor;
    }
    onChange(newColors);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (mode === 'select' && !draggingNode) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (mode === 'select') {
      if (draggingNode && dragStart) {
        // Dragging a node
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        setNodePositions(prev => ({
          ...prev,
          [draggingNode]: {
            x: prev[draggingNode].x + deltaX,
            y: prev[draggingNode].y + deltaY
          }
        }));
        
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isDragging && dragStart) {
        // Dragging the canvas
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setCanvasOffset({
          x: canvasOffset.x + deltaX,
          y: canvasOffset.y + deltaY
        });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggingNode(null);
    setDragStart(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: number) => {
    if (mode === 'select') {
      e.stopPropagation();
      setDraggingNode(nodeId);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleReset = () => {
    onChange({});
    setCanvasOffset({ x: 0, y: 0 }); // Reset canvas position too
    // Reset node positions to default
    setNodePositions({
      1: { x: 150, y: 80 },   // A
      2: { x: 350, y: 80 },   // B  
      3: { x: 450, y: 200 },  // C
      4: { x: 350, y: 320 },  // D
      5: { x: 150, y: 320 },  // E
      6: { x: 50, y: 200 },   // F
      7: { x: 250, y: 240 },  // G
      8: { x: 550, y: 200 }   // H
    });
  };

  const getNodeColor = (nodeId: number): string => {
    return value[nodeId] || '#E5E7EB'; // Default gray
  };

  return (
    <div className="space-y-6">
      {/* Task Description */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Завдання: Перевірка дводольності графа</h3>
        </div>
        <div className="space-y-3 text-gray-700">
          <p className="text-base">
            <strong>Мета:</strong> Розфарбуйте всі вершини графа у два кольори так, щоб жодні дві сусідні вершини (з'єднані ребром) не мали однакового кольору.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <strong className="text-blue-600">🎯 Як виконати:</strong>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Оберіть колір з палітри нижче</li>
                <li>Клацніть на вершини для розфарбовування</li>
                <li>Переконайтеся, що сусідні вершини мають різні кольори</li>
                <li>Розфарбуйте всі 8 вершин</li>
              </ol>
            </div>
            <div className="bg-white p-3 rounded border">
              <strong className="text-green-600">💡 Підказка:</strong>
              <p className="mt-2 text-sm">Почніть з вершини A (синій колір), потім її сусіди B,D,F зробіть червоними. Продовжуйте цей принцип для всіх вершин.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode and Color palette */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Оберіть режим або колір</h3>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Select Mode Button */}
          <button
            onClick={() => setMode('select')}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all
              ${mode === 'select' 
                ? 'border-gray-900 bg-gray-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <MousePointer className="w-5 h-5" />
            <span className="text-sm font-medium text-gray-700">Select</span>
          </button>

          {/* Color Buttons */}
          {availableColors.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                setSelectedColor(color.value);
                setMode('color');
              }}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all
                ${mode === 'color' && selectedColor === color.value 
                  ? 'border-gray-900 bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className={`w-6 h-6 rounded-full ${color.bg}`} />
              <span className="text-sm font-medium text-gray-700">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive graph for coloring */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">
            {mode === 'select' ? 'Перетягніть канву або вершини для переміщення' : 'Клікніть на вершини, щоб розфарбувати'}
          </h3>
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Скинути</span>
          </button>
        </div>

        {/* Graph visualization */}
        <div 
          className="relative w-full h-96 bg-gray-50 rounded-lg overflow-hidden"
          style={{ cursor: mode === 'select' ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          <svg className="w-full h-full">
            <g transform={`translate(${canvasOffset.x}, ${canvasOffset.y})`}>
              {/* Render edges first */}
              {graph.edges.map((edge: GraphEdge, index: number) => {
                const sourcePos = nodePositions[edge.source];
                const targetPos = nodePositions[edge.target];
                
                if (!sourcePos || !targetPos) return null;
                
                return (
                  <line
                    key={index}
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke="#6B7280"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Render nodes */}
              {graph.nodes.map((node: GraphNode) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;

                return (
                  <g key={node.id}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="25"
                      fill={getNodeColor(node.id)}
                      stroke="#374151"
                      strokeWidth="3"
                      style={{
                        cursor: mode === 'color' ? 'pointer' : mode === 'select' ? 'grab' : 'inherit'
                      }}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeClick(node.id);
                      }}
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="16"
                      fontWeight="bold"
                      fill={value[node.id] ? '#FFFFFF' : '#374151'}
                      pointerEvents="none"
                      style={{
                        userSelect: 'none'
                      }}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-800">
              <strong>Інструкція:</strong> 
              {mode === 'select' 
                ? 'Використовуйте режим Select для переміщення канви (клік на порожньому місці) або окремих вершин (клік на вершині). Затисніть та перетягніть для переміщення.'
                : 'Спочатку оберіть колір з палітри, потім клікніть на вершини графа, щоб розфарбувати їх. Пам\'ятайте: сусідні вершини повинні мати різні кольори!'
              }
            </p>
            
            {/* Progress indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800 font-medium">
                  {Object.keys(value).length} / {graph.nodes.length} вершин
                </span>
              </div>
              {Object.keys(value).length === graph.nodes.length && (
                <span className="text-green-600 font-semibold">✅ Всі розфарбовані!</span>
              )}
            </div>
          </div>
          
          {/* Validation hint */}
          {Object.keys(value).length > 0 && (
            <div className="text-xs text-blue-700 mt-1">
              Після розфарбовування всіх вершин натисніть "Перевірити" для валідації дводольності.
            </div>
          )}
        </div>

        {/* Current coloring status */}
        {Object.keys(value).length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Поточне розфарбовування:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(value).map(([nodeId, color]) => {
                const node = graph.nodes.find((n: GraphNode) => n.id === parseInt(nodeId));
                const colorName = availableColors.find(c => c.value === color)?.name || 'Невідомий';
                
                return (
                  <div
                    key={nodeId}
                    className="flex items-center space-x-2 px-2 py-1 bg-white rounded border"
                  >
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium">{node?.label}</span>
                    <span className="text-xs text-gray-500">({colorName})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeColoringInput; 