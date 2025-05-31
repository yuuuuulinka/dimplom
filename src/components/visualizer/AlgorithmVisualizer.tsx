import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, PauseCircle, SkipForward, SkipBack, RotateCcw, Settings, HelpCircle, Download } from 'lucide-react';
import AlgorithmSelector from './AlgorithmSelector';
import VisualizerControls from './VisualizerControls';
import GraphDisplay from './GraphDisplay';
import { useAlgorithms } from '../../hooks/useAlgorithms';
import { AlgorithmStep } from '../../types/algorithms';
import { GraphData, GraphType } from '../../types/graph';

interface AlgorithmVisualizerProps {
  preselectedAlgorithm?: string;
  onAlgorithmChange?: (algorithmId: string) => void;
}

const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({ 
  preselectedAlgorithm, 
  onAlgorithmChange 
}) => {
  const { algorithms, executeAlgorithm } = useAlgorithms();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [needsStartVertex, setNeedsStartVertex] = useState(false);
  const [showStartVertexSelection, setShowStartVertexSelection] = useState(false);
  const [startVertex, setStartVertex] = useState('');
  const [currentGraph, setCurrentGraph] = useState<GraphData | null>(null);
  const [hasUserGraph, setHasUserGraph] = useState(false);
  
  const animationRef = useRef<number | null>(null);
  
  const algorithmsNeedingStartVertex = ['bfs', 'dfs', 'dijkstra', 'bellman-ford', 'prim'];
  
  // Handle preselected algorithm from props
  useEffect(() => {
    if (preselectedAlgorithm && preselectedAlgorithm !== selectedAlgorithm) {
      setSelectedAlgorithm(preselectedAlgorithm);
    }
  }, [preselectedAlgorithm]);
  
  // Main algorithm and graph handling useEffect
  useEffect(() => {
    if (selectedAlgorithm) {
      // Reset the visualization when a new algorithm is selected
      setSteps([]);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setNeedsStartVertex(false);
      setShowStartVertexSelection(false);
      
      // First, check for saved graph from Graph Editor
      const savedGraph = localStorage.getItem('graphForVisualization');
      if (savedGraph) {
        try {
          const parsedGraph: GraphData = JSON.parse(savedGraph);
          setCurrentGraph(parsedGraph);
          setHasUserGraph(true);
          
          if (algorithmsNeedingStartVertex.includes(selectedAlgorithm)) {
            setNeedsStartVertex(true);
            setShowStartVertexSelection(true);
            // Set default start vertex to first node
            if (parsedGraph.nodes.length > 0) {
              setStartVertex(parsedGraph.nodes[0].label || parsedGraph.nodes[0].id.toString());
            }
          } else {
            // Execute algorithm immediately for non-start-vertex algorithms
            executeAlgorithmWithGraph(selectedAlgorithm, parsedGraph);
          }
          
          // Clear the saved graph after use
          localStorage.removeItem('graphForVisualization');
          return; // Exit early to avoid setting up sample graph
        } catch (error) {
          console.error('Error parsing saved graph:', error);
          localStorage.removeItem('graphForVisualization');
        }
      }
      
      // If no user graph or user selects a new algorithm after already using the visualizer,
      // set up sample graph
      if (!hasUserGraph || !currentGraph) {
        setHasUserGraph(false);
        
        if (algorithmsNeedingStartVertex.includes(selectedAlgorithm)) {
          setNeedsStartVertex(true);
          setShowStartVertexSelection(true);
          // Use sample graph for demonstration
          const result = executeAlgorithm(selectedAlgorithm);
          const sampleGraph = result.steps[0]?.graph;
          if (sampleGraph) {
            const graphData: GraphData = {
              nodes: sampleGraph.nodes.map((node, index) => ({
                id: node.id,
                label: node.label || node.id.toString(),
                x: 100 + (index % 3) * 150,
                y: 100 + Math.floor(index / 3) * 150
              })),
              edges: sampleGraph.edges.map((edge, index) => ({
                id: index + 1,
                source: edge.source,
                target: edge.target,
                weight: edge.weight
              })),
              type: getGraphTypeForAlgorithm(selectedAlgorithm)
            };
            setCurrentGraph(graphData);
            setStartVertex(sampleGraph.nodes[0]?.label || sampleGraph.nodes[0]?.id.toString() || '');
          }
        } else {
          // Execute the algorithm to get steps for algorithms that don't need start vertex
          const result = executeAlgorithm(selectedAlgorithm);
          setSteps(result.steps);
          setCurrentGraph(null); // Clear current graph for algorithms that don't need start vertex
        }
      }
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [selectedAlgorithm, executeAlgorithm]);
  
  const handleAlgorithmSelect = (algorithmId: string) => {
    // When user manually selects a new algorithm, clear the user graph flag
    // so they get the sample graph for the new algorithm
    if (algorithmId !== selectedAlgorithm) {
      setHasUserGraph(false);
    }
    setSelectedAlgorithm(algorithmId);
    onAlgorithmChange?.(algorithmId);
  };
  
  const executeAlgorithmWithGraph = (algorithmId: string, graph: GraphData, startVertexId?: string) => {
    const startNode = startVertexId ? graph.nodes.find(n => n.id.toString() === startVertexId) : null;
    const startVertexLabel = startNode ? (startNode.label || startNode.id.toString()) : undefined;
    
    // Convert GraphData to the format expected by the algorithm functions
    const algorithmGraph = {
      nodes: graph.nodes.map(node => ({
        id: node.id,
        label: node.label || node.id.toString(),
        x: node.x || 0,
        y: node.y || 0
      })),
      edges: graph.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        weight: edge.weight
      }))
    };
    
    const result = executeAlgorithm(algorithmId, { 
      startVertex: startVertexLabel,
      customGraph: algorithmGraph
    });
    
    setSteps(result.steps);
  };
  
  // Helper function to determine graph type based on algorithm
  const getGraphTypeForAlgorithm = (algorithmId: string): GraphType => {
    const algorithm = algorithms.find(a => a.id === algorithmId);
    if (algorithm?.supportedGraphTypes.includes('directed-weighted')) {
      return 'directed-weighted';
    } else if (algorithm?.supportedGraphTypes.includes('undirected-weighted')) {
      return 'undirected-weighted';
    } else if (algorithm?.supportedGraphTypes.includes('directed-unweighted')) {
      return 'directed-unweighted';
    } else {
      return 'undirected-unweighted';
    }
  };
  
  const handleStartVisualization = () => {
    if (needsStartVertex && currentGraph && startVertex) {
      // Find the start vertex in the graph
      const startNode = currentGraph.nodes.find(node => 
        node.label === startVertex || node.id.toString() === startVertex
      );
      
      if (startNode) {
        executeAlgorithmWithGraph(selectedAlgorithm, currentGraph, startNode.id.toString());
        // Don't hide the starting vertex selection - keep it visible
        // setShowStartVertexSelection(false);
        setNeedsStartVertex(false);
      }
    }
  };
  
  const handleRestartWithNewVertex = () => {
    if (currentGraph && startVertex) {
      setSteps([]);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      
      const startNode = currentGraph.nodes.find(node => 
        node.label === startVertex || node.id.toString() === startVertex
      );
      
      if (startNode) {
        executeAlgorithmWithGraph(selectedAlgorithm, currentGraph, startNode.id.toString());
      }
    }
  };
  
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };
  
  const resetVisualization = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };
  
  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
    // Stop playing if we go back to allow manual navigation
    setIsPlaying(false);
  };
  
  // Handle animation
  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, speed);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, steps.length, speed]);
  
  return (
    <div className="h-full">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Візуалізатор алгоритмів</h1>
            <p className="text-gray-600">
              Візуалізуйте як працюють алгоритми на графах крок за кроком
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Settings size={18} className="mr-2" />
              Налаштування
            </button>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <HelpCircle size={18} className="mr-2" />
              Допомога
            </button>
            <button 
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Download size={18} className="mr-2" />
              Експорт
            </button>
          </div>
        </div>
        
        <AlgorithmSelector 
          algorithms={algorithms} 
          selectedAlgorithm={selectedAlgorithm} 
          onSelect={handleAlgorithmSelect} 
        />
      </div>
      
      {/* Starting Vertex Selection */}
      {(showStartVertexSelection || (algorithmsNeedingStartVertex.includes(selectedAlgorithm) && currentGraph)) && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Виберіть початкову вершину для {algorithms.find(a => a.id === selectedAlgorithm)?.name}
          </h3>
          <div className="flex items-center space-x-4 mb-4">
            <label htmlFor="startVertex" className="block text-sm font-medium text-gray-700">
              Початкова вершина:
            </label>
            <select
              id="startVertex"
              value={startVertex}
              onChange={(e) => setStartVertex(e.target.value)}
              className="block w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            >
              {currentGraph?.nodes.map(node => (
                <option key={node.id} value={node.label || node.id.toString()}>
                  {node.label || `Node ${node.id}`}
                </option>
              ))}
            </select>
            {needsStartVertex ? (
              <button
                onClick={handleStartVisualization}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Почати візуалізацію
              </button>
            ) : (
              <button
                onClick={handleRestartWithNewVertex}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Перезапустити з новою вершиною
              </button>
            )}
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Примітка:</strong> Алгоритм почне роботу з вибраної вершини і буде просуватися кроком за кроком. 
              Ви можете змінити початкову вершину {needsStartVertex ? 'перед початком' : 'і перезапустити'}, щоб побачити, як це впливає на порядок обходу.
            </p>
          </div>
        </div>
      )}
      
      {showHelp && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div>
              <p className="text-sm text-blue-700 font-medium mb-2">Як використовувати візуалізатор алгоритмів</p>
              <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                <li>Виберіть алгоритм з випадаючого меню</li>
                <li>Використовуйте кнопку відтворення/паузи для початку або призупинення візуалізації</li>
                <li>Використовуйте кнопку "Наступний крок" для переходу до наступного кроку алгоритму</li>
                <li>Використовуйте кнопку "Попередній крок" для повернення до попереднього кроку алгоритму</li>
                <li>Використовуйте кнопку скинути для початку знову</li>
                <li>Налаштуйте швидкість використанням слайдера в налаштуваннях</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {showSettings && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Налаштування візуалізації</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="speed" className="block text-sm font-medium text-gray-700 mb-1">
                Швидкість анімації
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Швидше</span>
                <input 
                  id="speed"
                  type="range" 
                  min="100" 
                  max="2000" 
                  step="100" 
                  value={speed} 
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500">Повільніше</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="h-[500px] relative">
          {selectedAlgorithm ? (
            <GraphDisplay 
              steps={steps} 
              currentStepIndex={currentStepIndex}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-gray-400 mb-2">
                <PlayCircle size={48} />
              </div>
              <p className="text-gray-500 text-lg">Виберіть алгоритм для початку візуалізації</p>
            </div>
          )}
        </div>
      </div>
      
      {selectedAlgorithm && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {algorithms.find(a => a.id === selectedAlgorithm)?.name || 'Algorithm'} - Крок {currentStepIndex + 1} з {steps.length}
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={resetVisualization}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                title="Скинути"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={previousStep}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                disabled={currentStepIndex <= 0}
                title="Попередній крок"
              >
                <SkipBack size={20} className={currentStepIndex <= 0 ? "opacity-50" : ""} />
              </button>
              <button 
                onClick={togglePlayPause} 
                className="p-2 rounded-full text-purple-600 hover:bg-purple-100"
                title={isPlaying ? "Пауза" : "Грати"}
              >
                {isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
              </button>
              <button 
                onClick={nextStep}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                disabled={currentStepIndex >= steps.length - 1}
                title="Наступний крок"
              >
                <SkipForward size={20} className={currentStepIndex >= steps.length - 1 ? "opacity-50" : ""} />
              </button>
            </div>
          </div>
          
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div 
                style={{ width: `${(currentStepIndex + 1) / steps.length * 100}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600 transition-all duration-300"
              ></div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Опис поточного кроку:</h4>
            <p className="text-gray-700">{steps[currentStepIndex]?.description || 'No description available'}</p>
          </div>
          
          <VisualizerControls 
            onPlay={togglePlayPause} 
            onStep={nextStep}
            onPreviousStep={previousStep}
            onReset={resetVisualization}
            isPlaying={isPlaying} 
            canStep={currentStepIndex < steps.length - 1}
            canStepBack={currentStepIndex > 0}
          />
        </div>
      )}
    </div>
  );
};

export default AlgorithmVisualizer;