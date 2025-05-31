import React, { useState, useRef, useEffect } from 'react';
import { Save, Download, Upload, Trash2, Plus, Settings, HelpCircle } from 'lucide-react';
import EditorToolbar from './EditorToolbar';
import EditorCanvas from './EditorCanvas';
import AlgorithmSelector from '../visualizer/AlgorithmSelector';
import { GraphData, Node, Edge, GraphType, GraphTypeConfig } from '../../types/graph';
import { useAlgorithms } from '../../hooks/useAlgorithms';
import { graphs } from '../../services/api';

interface GraphEditorProps {
  onNavigateToVisualizer?: (algorithmId?: string) => void;
  initialGraph?: any;
}

const GraphEditor: React.FC<GraphEditorProps> = ({ onNavigateToVisualizer, initialGraph }) => {
  const [graph, setGraph] = useState<GraphData>({
    nodes: [],
    edges: [],
    type: 'directed-weighted'
  });
  
  const { algorithms, getFilteredAlgorithms } = useAlgorithms();
  const [mode, setMode] = useState<'select' | 'addNode' | 'addEdge' | 'delete'>('select');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [showEdgeForm, setShowEdgeForm] = useState(false);
  const [sourceNode, setSourceNode] = useState<Node | null>(null);
  const [targetNode, setTargetNode] = useState<Node | null>(null);
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const [nodeName, setNodeName] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);
  const [showAlgorithmModal, setShowAlgorithmModal] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveGraphName, setSaveGraphName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const nextNodeId = useRef(1);
  
  const graphTypes: GraphTypeConfig[] = [
    {
      id: 'directed-weighted',
      name: 'Орієнтований зважений',
      description: 'Ребра мають напрямок (стрілки) та ваги. Використовується для алгоритмів найкоротшого шляху, мережевого потоку.',
      isDirected: true,
      isWeighted: true
    },
    {
      id: 'directed-unweighted',
      name: 'Орієнтований незважений',
      description: 'Ребра мають напрямок, але без ваг. Використовується для графів залежностей, станів машин.',
      isDirected: true,
      isWeighted: false
    },
    {
      id: 'undirected-weighted',
      name: 'Неорієнтований зважений',
      description: 'Ребра мають ваги, але без напрямку. Використовується для мінімальних остовніх дерев, зваженої зв\'язності.',
      isDirected: false,
      isWeighted: true
    },
    {
      id: 'undirected-unweighted',
      name: 'Неорієнтований незважений',
      description: 'Прості графіки без напрямку або ваг. Використовуються для соціальних мереж, базової зв\'язності.',
      isDirected: false,
      isWeighted: false
    }
  ];
  
  const currentGraphConfig = graphTypes.find(type => type.id === graph.type) || graphTypes[0];
  
  useEffect(() => {
    if (hasInitialized) return; // Prevent re-initialization
    
    // First priority: use initialGraph prop if provided
    if (initialGraph) {
      console.log('Завантаження графу з пропсу:', initialGraph);
      setGraph(initialGraph);
      
      // Set nextNodeId based on the loaded graph
      if (initialGraph.nodes && initialGraph.nodes.length > 0) {
        const maxNodeId = Math.max(...initialGraph.nodes.map((node: Node) => node.id), 0);
        nextNodeId.current = maxNodeId + 1;
      } else {
        nextNodeId.current = 1;
      }
      
      setHasInitialized(true);
      return;
    }
    
    // Second priority: check localStorage for graphToLoad
    const graphToLoad = localStorage.getItem('graphToLoad');
    if (graphToLoad) {
      try {
        const parsedGraph = JSON.parse(graphToLoad);
        console.log('Завантаження графу з localStorage:', parsedGraph);
        setGraph(parsedGraph);
        
        // Set nextNodeId based on the loaded graph
        if (parsedGraph.nodes && parsedGraph.nodes.length > 0) {
          const maxNodeId = Math.max(...parsedGraph.nodes.map((node: Node) => node.id), 0);
          nextNodeId.current = maxNodeId + 1;
        } else {
          nextNodeId.current = 1;
        }
        
        localStorage.removeItem('graphToLoad'); // Clean up after loading
        setHasInitialized(true);
        return; // Skip default graph creation if we loaded from localStorage
      } catch (error) {
        console.error('Помилка завантаження графу з localStorage:', error);
        localStorage.removeItem('graphToLoad'); // Clean up corrupted data
      }
    }

    // Last priority: create default graph if no graph was loaded
    console.log('Створення графу за замовчуванням - не знайдено збереженого графу');
    const defaultGraph: GraphData = {
      nodes: [
        { id: 1, label: 'A', x: 100, y: 100 },
        { id: 2, label: 'B', x: 200, y: 200 },
        { id: 3, label: 'C', x: 300, y: 100 },
      ],
      edges: [
        { id: 1, source: 1, target: 2, weight: 5 },
        { id: 2, source: 2, target: 3, weight: 3 },
        { id: 3, source: 3, target: 1, weight: 2 },
      ],
      type: 'directed-weighted'
    };
    
    setGraph(defaultGraph);
    nextNodeId.current = 4;
    setHasInitialized(true);
  }, [hasInitialized, initialGraph]);

  const handleGraphTypeChange = (newType: GraphType) => {
    const newConfig = graphTypes.find(type => type.id === newType);
    if (!newConfig) return;

    setGraph(prevGraph => {
      const updatedGraph = { ...prevGraph, type: newType };
      
      // If switching to unweighted, remove weights from edges
      if (!newConfig.isWeighted) {
        updatedGraph.edges = prevGraph.edges.map(edge => {
          const { weight, ...edgeWithoutWeight } = edge;
          return edgeWithoutWeight;
        });
      } else if (!prevGraph.edges.some(edge => edge.weight !== undefined)) {
        // If switching to weighted and no weights exist, add default weights
        updatedGraph.edges = prevGraph.edges.map(edge => ({
          ...edge,
          weight: edge.weight || 1
        }));
      }
      
      return updatedGraph;
    });
  };

  const handleApplyAlgorithm = () => {
    setShowAlgorithmModal(true);
  };

  const handleAlgorithmSelect = (algorithmId: string) => {
    setSelectedAlgorithm(algorithmId);
    localStorage.setItem('graphForVisualization', JSON.stringify(graph));
    onNavigateToVisualizer?.(algorithmId);
    setShowAlgorithmModal(false);
  };
  
  const handleCanvasClick = (x: number, y: number) => {
    if (mode === 'addNode') {
      const newNode: Node = {
        id: nextNodeId.current++,
        label: String.fromCharCode(64 + nextNodeId.current),
        x,
        y
      };
      
      setGraph(prevGraph => ({
        ...prevGraph,
        nodes: [...prevGraph.nodes, newNode]
      }));
    }
  };
  
  const handleNodeClick = (node: Node) => {
    if (mode === 'select') {
      setSelectedNode(node);
      setSelectedEdge(null);
      setNodeName(node.label || '');
      setShowNodeForm(true);
    } else if (mode === 'delete') {
      setGraph(prevGraph => ({
        ...prevGraph,
        nodes: prevGraph.nodes.filter(n => n.id !== node.id),
        edges: prevGraph.edges.filter(e => e.source !== node.id && e.target !== node.id)
      }));
      setSelectedNode(null);
    } else if (mode === 'addEdge') {
      if (!sourceNode) {
        setSourceNode(node);
      } else if (sourceNode.id !== node.id) {
        setTargetNode(node);
        setShowEdgeForm(true);
      }
    }
  };
  
  const handleEdgeClick = (edge: Edge) => {
    if (mode === 'select') {
      setSelectedEdge(edge);
      setSelectedNode(null);
      setEdgeWeight(edge.weight || 1);
      setShowEdgeForm(true);
    } else if (mode === 'delete') {
      setGraph(prevGraph => ({
        ...prevGraph,
        edges: prevGraph.edges.filter(e => e.id !== edge.id)
      }));
      setSelectedEdge(null);
    }
  };
  
  const handleNodeMove = (nodeId: number, x: number, y: number) => {
    setGraph(prevGraph => ({
      ...prevGraph,
      nodes: prevGraph.nodes.map(node => 
        node.id === nodeId ? { ...node, x, y } : node
      )
    }));
  };
  
  const updateNodeName = () => {
    if (selectedNode) {
      setGraph(prevGraph => ({
        ...prevGraph,
        nodes: prevGraph.nodes.map(node => 
          node.id === selectedNode.id ? { ...node, label: nodeName } : node
        )
      }));
      setShowNodeForm(false);
    }
  };
  
  const addEdge = () => {
    if (sourceNode && targetNode) {
      const newEdge: Edge = {
        id: graph.edges.length + 1,
        source: sourceNode.id,
        target: targetNode.id,
        ...(currentGraphConfig.isWeighted && { weight: edgeWeight })
      };
      
      setGraph(prevGraph => ({
        ...prevGraph,
        edges: [...prevGraph.edges, newEdge]
      }));
      
      setSourceNode(null);
      setTargetNode(null);
      setEdgeWeight(1);
      setShowEdgeForm(false);
    }
  };
  
  const updateEdgeWeight = () => {
    if (selectedEdge && currentGraphConfig.isWeighted) {
      setGraph(prevGraph => ({
        ...prevGraph,
        edges: prevGraph.edges.map(edge => 
          edge.id === selectedEdge.id ? { ...edge, weight: edgeWeight } : edge
        )
      }));
      setShowEdgeForm(false);
    }
  };
  
  const clearGraph = () => {
    if (window.confirm('Ви впевнені, що хочете очистити граф?')) {
      setGraph({ nodes: [], edges: [], type: graph.type });
      nextNodeId.current = 1;
      setSelectedNode(null);
      setSelectedEdge(null);
      setMode('select');
    }
  };
  
  const saveToProfile = () => {
    setShowSaveModal(true);
    setSaveGraphName(`Граф ${Date.now()}`); // Default name
  };

  const handleSaveToProfile = async () => {
    if (!saveGraphName.trim()) {
      alert('Будь ласка, введіть назву графу');
      return;
    }

    setIsSaving(true);
    try {
      // Make POST request to backend using API service
      const result = await graphs.saveGraph(saveGraphName.trim(), graph);
      
      // Also save to localStorage as backup
      const existingSavedGraphs = localStorage.getItem('userSavedGraphs');
      const savedGraphs = existingSavedGraphs ? JSON.parse(existingSavedGraphs) : [];
      
      const newGraph = {
        id: result.graphId.toString(),
        name: saveGraphName.trim(),
        graph: graph,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };
      
      savedGraphs.push(newGraph);
      localStorage.setItem('userSavedGraphs', JSON.stringify(savedGraphs));
      
      alert('Граф успішно збережено в вашому профілі!');
      setShowSaveModal(false);
      setSaveGraphName('');
    } catch (error) {
      console.error('Помилка збереження графу:', error);
      alert('Не вдалося зберегти граф. Перевірте з\'єднання з інтернетом та спробуйте ще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
    setSaveGraphName('');
  };
  
  const loadGraph = () => {
    try {
      const savedGraph = localStorage.getItem('savedGraph');
      if (savedGraph) {
        const parsedGraph = JSON.parse(savedGraph);
        // Handle legacy graphs without type property
        const graphWithType = {
          ...parsedGraph,
          type: parsedGraph.type || 'directed-weighted'
        };
        setGraph(graphWithType);
        const maxNodeId = Math.max(...parsedGraph.nodes.map((node: Node) => node.id), 0);
        nextNodeId.current = maxNodeId + 1;
        alert('Граф успішно завантажено!');
      } else {
        alert('Не знайдено збереженого графу.');
      }
    } catch (error) {
      console.error('Помилка завантаження графу:', error);
      alert('Не вдалося завантажити граф.');
    }
  };
  
  return (
    <div className="h-full">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Редактор графів</h1>
            <p className="text-gray-600">
              Створюйте та редагуйте власні графіки за допомогою інструментів нижче
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button 
              onClick={saveToProfile}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Save size={18} className="mr-2" />
              Зберегти в профіль
            </button>
            <button 
              onClick={loadGraph}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Upload size={18} className="mr-2" />
              Завантажити
            </button>
            <button 
              onClick={clearGraph}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Trash2 size={18} className="mr-2" />
              Очистити
            </button>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <HelpCircle size={18} className="mr-2" />
              Допомога
            </button>
          </div>
        </div>
        
        {/* Graph Type Selector */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label htmlFor="graphType" className="text-sm font-medium text-gray-700">
              Тип графу:
            </label>
            <select
              id="graphType"
              value={graph.type}
              onChange={(e) => handleGraphTypeChange(e.target.value as GraphType)}
              className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            >
              {graphTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {currentGraphConfig.description}
            </span>
          </div>
        </div>
        
        {showHelp && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div>
              <h3 className="text-sm text-blue-700 font-bold mb-3">Як використовувати Редактор графів</h3>
              <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1 mb-4">
                <li>Використовуйте панель інструментів, щоб вибрати, який інструмент ви хочете використовувати</li>
                <li>В режимі "Вибір", клацніть на вузлах або ребрах, щоб редагувати їх властивості</li>
                <li>В режимі "Додавання вузла", клацніть будь-де на холсті, щоб додати новий вузол</li>
                <li>В режимі "Додавання ребра", клацніть на джерельному вузлі, а потім на цільовому вузлі, щоб створити ребро</li>
                <li>В режимі "Вилучення", клацніть на будь-якому вузлі або ребрі, щоб вилучити його</li>
                <li>Збережіть свій граф за допомогою кнопки Зберегти або очистіть його за допомогою кнопки Очистити</li>
              </ul>
              
              <h3 className="text-sm text-blue-700 font-bold mb-3">Навігація по холсту</h3>
              <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1 mb-4">
                <li><strong>Масштаб:</strong> Використовуйте колесо миші або клавіші Ctrl/Cmd + +/-</li>
                <li><strong>Переміщення:</strong> Ctrl+Click і перетягніть, або використовуйте середню кнопку миші і перетягніть</li>
                <li><strong>Переміщення вузлів:</strong> В режимі "Вибір", перетягніть вузли, щоб перемістити їх</li>
                <li><strong>Скидання перегляду:</strong> Натисніть Ctrl/Cmd + 0 або використовуйте кнопку скидання</li>
                <li><strong>Підгонка до вмісту:</strong> Використовуйте кнопку підгонки, щоб автоматично центрувати всі вузли</li>
                <li><strong>Керування масштабом:</strong> Використовуйте кнопки масштабування в правому верхньому кутку</li>
              </ul>
              
              <h3 className="text-sm text-blue-700 font-bold mb-3">Типи графів</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {graphTypes.map(type => (
                  <div key={type.id} className="bg-blue-100 rounded-md p-3">
                    <h4 className="font-semibold text-blue-800 mb-1">{type.name}</h4>
                    <p className="text-xs text-blue-700 mb-2">{type.description}</p>
                    <div className="flex space-x-4 text-xs text-blue-600 mb-2">
                      <span>Напрямок: {type.isDirected ? 'Так' : 'Ні'}</span>
                      <span>Ваги: {type.isWeighted ? 'Так' : 'Ні'}</span>
                    </div>
                    <div className="text-xs text-blue-700">
                      <span className="font-semibold">Доступні алгоритми:</span>
                      <ul className="mt-1 ml-2">
                        {getFilteredAlgorithms(type.id).map(algorithm => (
                          <li key={algorithm.id}>• {algorithm.name}</li>
                        ))}
                        {getFilteredAlgorithms(type.id).length === 0 && (
                          <li className="text-blue-500 italic">Немає доступних алгоритмів</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="text-sm text-blue-700 font-bold mb-3">Вибір алгоритму</h3>
              <div className="bg-blue-100 rounded-md p-3">
                <p className="text-xs text-blue-700 mb-2">
                  Кнопка "Застосувати алгоритм" покаже лише алгоритми, сумісні з вашим поточним типом графу:
                </p>
                <ul className="text-xs text-blue-700 space-y-1 ml-3">
                  <li>• <strong>Пошук</strong> (BFS, DFS): Працює на незважених графах</li>
                  <li>• <strong>Найкоротший шлях</strong> (Dijkstra's, Bellman-Ford): Потрібні зважені графи</li>
                  <li>• <strong>Мінімальне остовне дерево</strong> (Prim's): Потрібні неорієнтовані зважені графи</li>
                  <li>• <strong>Алгоритм Крускала</strong>: Працює на зважених і незважених неорієнтованих графах</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <EditorToolbar 
          mode={mode} 
          onModeChange={setMode} 
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 relative">
        <div className="absolute top-0 left-0 m-4 p-2 bg-white bg-opacity-80 rounded shadow z-10">
          <div className="text-sm text-gray-600">
            Режим: <span className="font-medium text-purple-700 capitalize">{mode}</span>
            {mode === 'addEdge' && sourceNode && (
              <span className="ml-2">
                Від: <span className="font-medium">{sourceNode.label}</span>
              </span>
            )}
          </div>
        </div>
        
        <div className="h-[500px]">
          <EditorCanvas 
            graph={graph} 
            mode={mode}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onCanvasClick={handleCanvasClick}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onNodeMove={handleNodeMove}
            graphConfig={currentGraphConfig}
          />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Інформація про граф</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-gray-700 mb-2">Вузли ({graph.nodes.length})</h4>
            <div className="max-h-40 overflow-y-auto">
              <ul className="space-y-1">
                {graph.nodes.map(node => (
                  <li key={node.id} className="text-sm text-gray-600">
                    Вузол {node.label} (ID: {node.id}) - Позиція: ({Math.round(node.x)}, {Math.round(node.y)})
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-gray-700 mb-2">Ребра ({graph.edges.length})</h4>
            <div className="max-h-40 overflow-y-auto">
              <ul className="space-y-1">
                {graph.edges.map(edge => {
                  const sourceNode = graph.nodes.find(n => n.id === edge.source);
                  const targetNode = graph.nodes.find(n => n.id === edge.target);
                  const connector = currentGraphConfig.isDirected ? '→' : '—';
                  const weightText = currentGraphConfig.isWeighted && edge.weight !== undefined 
                    ? ` (Вага: ${edge.weight})` 
                    : '';
                  
                  return (
                    <li key={edge.id} className="text-sm text-gray-600">
                      {sourceNode?.label || edge.source} {connector} {targetNode?.label || edge.target}{weightText}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          {(() => {
            const availableAlgorithms = getFilteredAlgorithms(graph.type);
            const hasAlgorithms = availableAlgorithms.length > 0;
            
            return (
              <button 
                onClick={handleApplyAlgorithm}
                disabled={!hasAlgorithms}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  hasAlgorithms 
                    ? 'text-white bg-purple-600 hover:bg-purple-700' 
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
                title={!hasAlgorithms ? `Немає доступних алгоритмів для ${currentGraphConfig.name} графів` : 'Застосувати алгоритм'}
              >
                <Settings size={18} className="mr-2" />
                Застосувати алгоритм
                {!hasAlgorithms && (
                  <span className="ml-2 text-xs">({availableAlgorithms.length})</span>
                )}
              </button>
            );
          })()}
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            <Download size={18} className="mr-2" />
            Експорт графу
          </button>
        </div>
      </div>
      
      {showAlgorithmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Виберіть алгоритм</h3>
            {(() => {
              const availableAlgorithms = getFilteredAlgorithms(graph.type);
              if (availableAlgorithms.length === 0) {
                return (
                  <div className="mb-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Немає доступних алгоритмів для <strong>{currentGraphConfig.name}</strong> графів.
                          </p>
                          <p className="text-sm text-yellow-700 mt-2">
                            Спробуйте переключитися на інший тип графу:
                          </p>
                          <ul className="text-sm text-yellow-700 mt-1 ml-4">
                            <li>• <strong>Орієнтований незважений</strong>: Пошук в ширину (BFS), Пошук в глибину (DFS)</li>
                            <li>• <strong>Неорієнтований незважений</strong>: Пошук в ширину (BFS), Пошук в глибину (DFS), Алгоритм Крускала (Kruskal's)</li>
                            <li>• <strong>Орієнтований зважений</strong>: Алгоритм Дейкстри, Алгоритм Белмана-Форда</li>
                            <li>• <strong>Неорієнтований незважений</strong>: Алгоритм Дейкстри, Алгоритм Прима, Алгоритм Крускала, Алгоритм Белмана-Форда</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div className="mb-4">
                  <AlgorithmSelector
                    algorithms={availableAlgorithms}
                    selectedAlgorithm={selectedAlgorithm}
                    onSelect={handleAlgorithmSelect}
                  />
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>{availableAlgorithms.length}</strong> алгоритм{availableAlgorithms.length !== 1 ? 'и' : ''} доступно для <strong>{currentGraphConfig.name}</strong> граф.
                    </p>
                  </div>
                </div>
              );
            })()}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAlgorithmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showNodeForm && selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Редагувати вузол</h3>
            <div className="mb-4">
              <label htmlFor="nodeName" className="block text-sm font-medium text-gray-700 mb-1">
                Назва вузла
              </label>
              <input
                type="text"
                id="nodeName"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNodeForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Скасувати
              </button>
              <button
                onClick={updateNodeName}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Оновити
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showEdgeForm && (selectedEdge || (sourceNode && targetNode)) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedEdge ? 'Редагувати ребро' : 'Додати ребро'}
            </h3>
            {!selectedEdge && sourceNode && targetNode && (
              <p className="mb-4 text-sm text-gray-600">
                Створення ребра від {sourceNode.label} до {targetNode.label}
              </p>
            )}
            {currentGraphConfig.isWeighted && (
              <div className="mb-4">
                <label htmlFor="edgeWeight" className="block text-sm font-medium text-gray-700 mb-1">
                  Вага ребра
                </label>
                <input
                  type="number"
                  id="edgeWeight"
                  min="1"
                  value={edgeWeight}
                  onChange={(e) => setEdgeWeight(Math.max(1, parseInt(e.target.value) || 1))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEdgeForm(false);
                  setSourceNode(null);
                  setTargetNode(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Скасувати
              </button>
              <button
                onClick={selectedEdge ? updateEdgeWeight : addEdge}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {selectedEdge ? 'Оновити' : 'Додати'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Зберегти граф в профіль</h3>
            <div className="mb-4">
              <label htmlFor="saveGraphName" className="block text-sm font-medium text-gray-700 mb-1">
                Назва графу
              </label>
              <input
                type="text"
                id="saveGraphName"
                value={saveGraphName}
                onChange={(e) => setSaveGraphName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Введіть назву графу..."
                onKeyPress={(e) => e.key === 'Enter' && !isSaving && handleSaveToProfile()}
                autoFocus
              />
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                <p><strong>Тип:</strong> {currentGraphConfig.name}</p>
                <p><strong>Вершини:</strong> {graph.nodes.length}</p>
                <p><strong>Ребра:</strong> {graph.edges.length}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelSave}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Скасувати
              </button>
              <button
                onClick={handleSaveToProfile}
                disabled={!saveGraphName.trim() || isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Збереження...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Зберегти
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphEditor;