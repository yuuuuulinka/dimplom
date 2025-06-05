import React, { useState, useEffect } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

interface DistanceInputProps {
  availableNodes: string[];
  startNode: string;
  value: { [node: string]: number };
  onChange: (distances: { [node: string]: number }) => void;
  disabled?: boolean;
}

const DistanceInput: React.FC<DistanceInputProps> = ({
  availableNodes,
  startNode,
  value,
  onChange,
  disabled = false
}) => {
  const [distances, setDistances] = useState<{ [node: string]: number }>(() => {
    // Initialize with start node distance = 0 if not provided
    const initialDistances = value || {};
    if (!initialDistances[startNode] && initialDistances[startNode] !== 0) {
      initialDistances[startNode] = 0;
    }
    return initialDistances;
  });

  useEffect(() => {
    const newDistances = value || {};
    // Ensure start node is always included with distance 0
    if (!newDistances[startNode] && newDistances[startNode] !== 0) {
      newDistances[startNode] = 0;
    }
    setDistances(newDistances);
  }, [value, startNode]);

  // Automatically set start node distance to 0 and notify parent
  useEffect(() => {
    if (!distances[startNode] && distances[startNode] !== 0) {
      const updatedDistances = { ...distances, [startNode]: 0 };
      setDistances(updatedDistances);
      onChange(updatedDistances);
    }
  }, [startNode, distances, onChange]);

  // Notify parent of initial distances when component mounts
  useEffect(() => {
    if (distances[startNode] === 0) {
      onChange(distances);
    }
  }, []); // Empty dependency array to run only on mount

  const handleDistanceChange = (node: string, distance: string) => {
    if (disabled || node === startNode) return; // Prevent changes to start node

    const newDistances = { ...distances };
    
    if (distance === '' || distance === '-') {
      delete newDistances[node];
    } else if (distance === '∞' || distance === 'inf' || distance === 'Infinity') {
      newDistances[node] = Infinity;
    } else {
      const numDistance = parseFloat(distance);
      if (!isNaN(numDistance)) {
        newDistances[node] = numDistance;
      }
    }
    
    setDistances(newDistances);
    onChange(newDistances);
  };

  const resetDistances = () => {
    if (disabled) return;
    
    const resetValues = { [startNode]: 0 };
    setDistances(resetValues);
    onChange(resetValues);
  };

  const initializeWithInfinity = () => {
    if (disabled) return;
    
    const initDistances = { [startNode]: 0 };
    availableNodes.forEach(node => {
      if (node !== startNode) {
        initDistances[node] = Infinity;
      }
    });
    
    setDistances(initDistances);
    onChange(initDistances);
  };

  const otherNodes = availableNodes.filter(node => node !== startNode);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Відстані від вершини {startNode}</h3>
          </div>
          
          {!disabled && (
            <div className="flex space-x-2">
              <button
                onClick={initializeWithInfinity}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Ініціалізувати ∞
              </button>
              <button
                onClick={resetDistances}
                className="flex items-center space-x-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
              >
                <RotateCcw size={12} />
                <span>Скинути</span>
              </button>
            </div>
          )}
        </div>

        {/* Distance inputs */}
        <div className="space-y-3">
          {/* Start node - always 0 */}
          <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-12 text-center">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                {startNode}
              </span>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-green-800">
                Відстань до {startNode} (початкова вершина):
              </label>
            </div>
            <div className="w-20">
              <input
                type="text"
                value="0"
                disabled
                className="w-full px-2 py-1 text-center text-sm border border-green-300 rounded bg-green-100 text-green-800 font-bold"
              />
            </div>
          </div>

          {/* Other nodes */}
          {otherNodes.map((node) => {
            const currentDistance = distances[node];
            const displayValue = currentDistance === undefined ? '' : 
                               currentDistance === Infinity ? '∞' : 
                               currentDistance.toString();
            
            return (
              <div key={node} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="w-12 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                    {node}
                  </span>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Відстань до {node}:
                  </label>
                </div>
                <div className="w-20">
                  <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => handleDistanceChange(node, e.target.value)}
                    disabled={disabled}
                    placeholder="∞"
                    className={`w-full px-2 py-1 text-center text-sm border rounded transition-colors ${
                      disabled 
                        ? 'bg-gray-100 text-gray-500 border-gray-300' 
                        : 'bg-white text-gray-900 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Hints and validation */}
        <div className="mt-4 space-y-2">
          <div className="text-xs text-gray-600">
            💡 <strong>Підказка:</strong> Введіть ∞ (або inf) для нескінченної відстані. 
            Алгоритм Беллмана-Форда може обробляти від'ємні ваги.
          </div>
          
          {Object.keys(distances).length > 1 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Поточні відстані:</h4>
              <div className="flex flex-wrap gap-2 text-sm">
                {availableNodes.map(node => {
                  const dist = distances[node];
                  const displayDist = dist === undefined ? '?' : 
                                    dist === Infinity ? '∞' : 
                                    dist;
                  return (
                    <span key={node} className="px-2 py-1 bg-white rounded border text-blue-800">
                      <strong>{node}:</strong> {displayDist}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistanceInput; 