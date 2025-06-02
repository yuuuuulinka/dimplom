import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { AlgorithmStep } from '../../types/algorithms';

interface GraphDisplayProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({ steps, currentStepIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize cytoscape
    if (!cyRef.current) {
      cyRef.current = cytoscape({
        container: containerRef.current,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#E5E7EB',
              'label': 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'color': '#1F2937',
              'font-weight': 'bold',
              'font-size': '12px',
              'width': 60,
              'height': 60,
              'border-width': 3,
              'border-color': '#9CA3AF',
              'text-wrap': 'wrap',
              'text-max-width': '50px'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#9CA3AF',
              'target-arrow-color': '#9CA3AF',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(weight)',
              'font-size': '10px',
              'text-background-color': 'white',
              'text-background-opacity': 1,
              'text-background-padding': '2px'
            }
          },
          {
            selector: '.highlighted',
            style: {
              'background-color': '#8B5CF6',
              'border-color': '#7C3AED',
              'border-width': 3,
              'color': '#FFFFFF'
            }
          },
          {
            selector: 'edge.highlighted',
            style: {
              'line-color': '#8B5CF6',
              'target-arrow-color': '#8B5CF6',
              'width': 5,
              'label': 'data(weight)',
              'font-size': '10px',
              'color': '#1F2937',
              'text-background-color': 'white',
              'text-background-opacity': 1,
              'text-background-padding': '2px'
            }
          },
          {
            selector: '.visited',
            style: {
              'background-color': '#10B981',
              'border-color': '#059669',
              'color': '#FFFFFF'
            }
          },
          {
            selector: 'edge.visited',
            style: {
              'line-color': '#10B981',
              'target-arrow-color': '#10B981',
              'label': 'data(weight)',
              'font-size': '10px',
              'color': '#1F2937',
              'text-background-color': 'white',
              'text-background-opacity': 1,
              'text-background-padding': '2px'
            }
          },
          {
            selector: '.path',
            style: {
              'background-color': '#F59E0B',
              'border-color': '#D97706',
              'color': '#1F2937'
            }
          },
          {
            selector: 'edge.path',
            style: {
              'line-color': '#F59E0B',
              'target-arrow-color': '#F59E0B',
              'width': 5,
              'label': 'data(weight)',
              'font-size': '10px',
              'color': '#1F2937',
              'text-background-color': 'white',
              'text-background-opacity': 1,
              'text-background-padding': '2px'
            }
          },
          {
            selector: '.negative-cycle',
            style: {
              'background-color': '#EF4444',
              'border-color': '#DC2626',
              'border-width': 3,
              'color': '#FFFFFF'
            }
          },
          {
            selector: 'edge.negative-cycle',
            style: {
              'line-color': '#EF4444',
              'target-arrow-color': '#EF4444',
              'width': 6,
              'line-style': 'dashed',
              'label': 'data(weight)',
              'font-size': '10px',
              'color': '#1F2937',
              'text-background-color': 'white',
              'text-background-opacity': 1,
              'text-background-padding': '2px'
            }
          }
        ],
        layout: {
          name: 'cose',
          padding: 30,
          animate: false
        }
      });
    }

    // Update graph based on current step
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      
      // If it's the first step or we're resetting, rebuild the graph
      if (currentStepIndex === 0) {
        cyRef.current.elements().remove();
        
        // Add nodes
        currentStep.graph.nodes.forEach(node => {
          cyRef.current?.add({
            group: 'nodes',
            data: { 
              id: node.id.toString(), 
              label: node.label || node.id.toString() 
            }
          });
        });
        
        // Add edges
        currentStep.graph.edges.forEach(edge => {
          cyRef.current?.add({
            group: 'edges',
            data: { 
              id: `${edge.source}-${edge.target}`, 
              source: edge.source.toString(), 
              target: edge.target.toString(),
              weight: edge.weight
            }
          });
        });
        
        // Apply layout
        cyRef.current.layout({ name: 'cose', animate: false }).run();
      }
      
      // Reset all highlights
      cyRef.current.elements().removeClass('highlighted visited path negative-cycle');
      
      // Apply highlights based on the current step
      if (currentStep.highlights) {
        // Highlight nodes
        currentStep.highlights.nodes?.forEach(nodeId => {
          cyRef.current?.getElementById(nodeId.toString()).addClass('highlighted');
        });
        
        // Highlight edges - check if this is a negative cycle detection step
        currentStep.highlights.edges?.forEach(edge => {
          const edgeId = `${edge.source}-${edge.target}`;
          const edgeElement = cyRef.current?.getElementById(edgeId);
          if (currentStep.description.includes('Negative-weight cycle detected')) {
            edgeElement?.addClass('negative-cycle');
          } else {
            edgeElement?.addClass('highlighted');
          }
        });
      }
      
      // Apply visited status
      if (currentStep.visited) {
        currentStep.visited.nodes?.forEach(nodeId => {
          cyRef.current?.getElementById(nodeId.toString()).addClass('visited');
        });
        
        currentStep.visited.edges?.forEach(edge => {
          const edgeId = `${edge.source}-${edge.target}`;
          cyRef.current?.getElementById(edgeId).addClass('visited');
        });
      }
      
      // Apply final path if available
      if (currentStep.path) {
        currentStep.path.nodes?.forEach(nodeId => {
          cyRef.current?.getElementById(nodeId.toString()).addClass('path');
        });
        
        currentStep.path.edges?.forEach(edge => {
          const edgeId = `${edge.source}-${edge.target}`;
          cyRef.current?.getElementById(edgeId).addClass('path');
        });
      }
      
      // Center graph
      cyRef.current.fit();
      cyRef.current.center();
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [steps, currentStepIndex]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Queue Visualization */}
      {currentStep?.queue && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Черга BFS</h4>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Черга:</span>
            <div className="flex space-x-1">
              {currentStep.queue.length > 0 ? (
                currentStep.queue.map((vertex, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 bg-purple-100 border border-purple-300 rounded text-sm font-medium text-purple-800"
                  >
                    {vertex}
                  </div>
                ))
              ) : (
                <div className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-500">
                  Порожній
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Stack Visualization */}
      {currentStep?.stack && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Стек DFS</h4>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Стек:</span>
            <div className="flex space-x-1">
              {currentStep.stack.length > 0 ? (
                currentStep.stack.map((vertex, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 bg-orange-100 border border-orange-300 rounded text-sm font-medium text-orange-800"
                  >
                    {vertex}
                  </div>
                ))
              ) : (
                <div className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-500">
                  Порожній
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Вершина стеку: {currentStep.stack.length > 0 ? currentStep.stack[currentStep.stack.length - 1] : 'None'}
          </div>
        </div>
      )}
      
      {/* Distances Visualization */}
      {currentStep?.distances && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {currentStep.pass ? "Відстані Беллмана-Форда" : "Відстані Дейкстри"}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(currentStep.distances).map(([vertex, distance]) => (
              <div
                key={vertex}
                className="flex items-center justify-between px-2 py-1 bg-blue-50 border border-blue-200 rounded text-sm"
              >
                <span className="font-medium text-blue-800">{vertex}:</span>
                <span className="text-blue-700">{distance}</span>
              </div>
            ))}
          </div>
          {currentStep.pass && (
            <div className="mt-2 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <span className="font-medium text-yellow-800">Прохід {currentStep.pass.current} з {currentStep.pass.total}</span>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            {currentStep.pass ? "Поточні відстані від джерела" : "Поточна найкоротша відстань від джерела"}
          </div>
        </div>
      )}
      
      {/* MST Weight Visualization */}
      {currentStep?.mstWeight !== undefined && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {currentStep.unionFindSets ? "Прогрес МКД Крускала" : "Прогрес МКД Прима"}
          </h4>
          <div className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded text-lg">
            <span className="font-medium text-green-800">Загальна вага:</span>
            <span className="text-green-700 font-bold">{currentStep.mstWeight}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Поточна вага МКД
          </div>
        </div>
      )}
      
      {/* Union-Find Sets Visualization */}
      {currentStep?.unionFindSets && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg border border-gray-200 max-w-xs">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Непересічні множини (Union-Find)</h4>
          <div className="space-y-2">
            {currentStep.unionFindSets.map((set, index) => (
              <div
                key={index}
                className="flex items-center px-2 py-1 bg-orange-50 border border-orange-200 rounded text-sm"
              >
                <span className="font-medium text-orange-800 mr-1">Set {index + 1}:</span>
                <div className="flex space-x-1">
                  {set.map((vertex, vertexIndex) => (
                    <span
                      key={vertexIndex}
                      className="px-1 py-0.5 bg-orange-100 border border-orange-300 rounded text-xs font-medium text-orange-800"
                    >
                      {vertex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            З'єднані компоненти в поточному МКД
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Легенда</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Поточно обробляється</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Відвідано</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Не відвідано</span>
          </div>
          {currentStep?.description.includes('Negative-weight cycle') && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-red-500 border-dashed border border-red-600"></div>
              <span>Цикл з негативною вагою</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphDisplay;