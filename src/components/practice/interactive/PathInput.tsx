import React, { useState } from 'react';
import { Plus, X, ArrowRight } from 'lucide-react';

interface PathInputProps {
  availableNodes: string[];
  startNode?: string;
  endNode?: string;
  onPathChange: (path: string[]) => void;
  value: string[];
  disabled?: boolean;
}

const PathInput: React.FC<PathInputProps> = ({ 
  availableNodes, 
  startNode, 
  endNode, 
  onPathChange, 
  value,
  disabled = false 
}) => {
  const [currentPath, setCurrentPath] = useState<string[]>(value || []);

  const addNode = (node: string) => {
    if (disabled) return;
    
    const newPath = [...currentPath, node];
    setCurrentPath(newPath);
    onPathChange(newPath);
  };

  const removeNode = (index: number) => {
    if (disabled) return;
    
    const newPath = currentPath.filter((_, i) => i !== index);
    setCurrentPath(newPath);
    onPathChange(newPath);
  };

  const clearPath = () => {
    if (disabled) return;
    
    setCurrentPath([]);
    onPathChange([]);
  };

  // Suggest starting with the start node if provided and path is empty
  const suggestedStart = startNode && currentPath.length === 0;
  
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Введіть шлях</h3>
        
        {/* Current path display */}
        <div className="mb-4">
          <div className="min-h-[3rem] p-3 bg-white border border-gray-300 rounded-md">
            {currentPath.length > 0 ? (
              <div className="flex items-center space-x-2 flex-wrap">
                {currentPath.map((node, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                      <span className="font-medium">{node}</span>
                      {!disabled && (
                        <button
                          onClick={() => removeNode(index)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    {index < currentPath.length - 1 && (
                      <ArrowRight size={16} className="text-gray-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                {suggestedStart 
                  ? `Почніть з вершини ${startNode}...`
                  : 'Оберіть вершини для побудови шляху...'
                }
              </div>
            )}
          </div>
        </div>

        {/* Node selection buttons */}
        {!disabled && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {availableNodes.map((node) => {
                const canAdd = true; // Allow multiple visits for now
                const isStartNode = node === startNode;
                const isEndNode = node === endNode;
                
                return (
                  <button
                    key={node}
                    onClick={() => addNode(node)}
                    disabled={!canAdd}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isStartNode
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : isEndNode
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : canAdd
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300'
                        : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <Plus size={14} />
                      <span>{node}</span>
                      {isStartNode && <span className="text-xs">(Початок)</span>}
                      {isEndNode && <span className="text-xs">(Кінець)</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {currentPath.length > 0 && (
              <button
                onClick={clearPath}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Очистити шлях
              </button>
            )}
          </div>
        )}
        
        {/* Path validation hints */}
        {startNode && endNode && (
          <div className="mt-3 text-sm text-gray-600">
            <div>Початок: <span className="font-medium text-green-700">{startNode}</span></div>
            <div>Кінець: <span className="font-medium text-red-700">{endNode}</span></div>
            
            {currentPath.length > 0 && (
              <div className="mt-2">
                {currentPath[0] !== startNode && (
                  <div className="text-orange-600">⚠️ Шлях повинен починатися з {startNode}</div>
                )}
                {currentPath[currentPath.length - 1] !== endNode && (
                  <div className="text-orange-600">⚠️ Шлях повинен закінчуватися в {endNode}</div>
                )}
                {currentPath[0] === startNode && currentPath[currentPath.length - 1] === endNode && (
                  <div className="text-green-600">✓ Шлях має правильні початок і кінець</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PathInput; 