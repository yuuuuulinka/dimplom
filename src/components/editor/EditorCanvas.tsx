import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { GraphData, Node, Edge, GraphTypeConfig } from '../../types/graph';

interface EditorCanvasProps {
  graph: GraphData;
  mode: 'select' | 'addNode' | 'addEdge' | 'delete';
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onCanvasClick: (x: number, y: number) => void;
  onNodeClick: (node: Node) => void;
  onEdgeClick: (edge: Edge) => void;
  onNodeMove?: (nodeId: number, x: number, y: number) => void;
  graphConfig?: GraphTypeConfig;
}

interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  graph,
  mode,
  selectedNode,
  selectedEdge,
  onCanvasClick,
  onNodeClick, 
  onEdgeClick,
  onNodeMove,
  graphConfig
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Viewport state for panning and zooming
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<'canvas' | 'node' | null>(null);
  const [draggedNode, setDraggedNode] = useState<Node | null>(null);
  
  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - viewport.x) / viewport.scale,
      y: (screenY - viewport.y) / viewport.scale
    };
  }, [viewport]);
  
  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    return {
      x: worldX * viewport.scale + viewport.x,
      y: worldY * viewport.scale + viewport.y
    };
  }, [viewport]);
  
  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Get the world position before zoom
    const worldPos = screenToWorld(mouseX, mouseY);
    
    // Calculate new scale
    const zoomFactor = 1.1;
    const delta = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;
    const newScale = Math.max(0.1, Math.min(3, viewport.scale * delta));
    
    // Calculate new viewport position to keep the mouse position fixed
    const newX = mouseX - worldPos.x * newScale;
    const newY = mouseY - worldPos.y * newScale;
    
    setViewport({ x: newX, y: newY, scale: newScale });
  }, [viewport, screenToWorld]);
  
  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldPos = screenToWorld(mouseX, mouseY);
    
    // Check if clicked on a node first
    const nodeRadius = 20;
    let clickedNode: Node | null = null;
    
    for (let i = graph.nodes.length - 1; i >= 0; i--) {
      const node = graph.nodes[i];
      const distance = Math.sqrt(Math.pow(node.x - worldPos.x, 2) + Math.pow(node.y - worldPos.y, 2));
      
      if (distance <= nodeRadius / viewport.scale) {
        clickedNode = node;
        break;
      }
    }
    
    if (clickedNode && mode === 'select') {
      // Start node dragging
      setIsDragging(true);
      setDragType('node');
      setDraggedNode(clickedNode);
      setDragStart({ x: worldPos.x - clickedNode.x, y: worldPos.y - clickedNode.y });
    } else if (!clickedNode && (e.button === 1 || (e.button === 0 && e.ctrlKey))) {
      // Start canvas panning (middle mouse or ctrl+left mouse)
      setIsDragging(true);
      setDragType('canvas');
      setDragStart({ x: mouseX - viewport.x, y: mouseY - viewport.y });
    }
  };
  
  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (dragType === 'canvas') {
      // Pan the canvas
      setViewport(prev => ({
        ...prev,
        x: mouseX - dragStart.x,
        y: mouseY - dragStart.y
      }));
    } else if (dragType === 'node' && draggedNode && onNodeMove) {
      // Move the node
      const worldPos = screenToWorld(mouseX, mouseY);
      const newX = worldPos.x - dragStart.x;
      const newY = worldPos.y - dragStart.y;
      onNodeMove(draggedNode.id, newX, newY);
    }
  }, [isDragging, dragType, dragStart, draggedNode, onNodeMove, screenToWorld]);
  
  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    setDraggedNode(null);
    setDragStart({ x: 0, y: 0 });
  }, []);
  
  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== canvas && e.target !== document.body) return;
      
      switch (e.key) {
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Reset view
            setViewport({ x: 0, y: 0, scale: 1 });
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Zoom in
            setViewport(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }));
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Zoom out
            setViewport(prev => ({ ...prev, scale: Math.max(0.1, prev.scale / 1.2) }));
          }
          break;
      }
    };
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp]);
  
  // Zoom functions for external controls
  const zoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }));
  }, []);
  
  const zoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.max(0.1, prev.scale / 1.2) }));
  }, []);
  
  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
  }, []);
  
  const fitToContent = useCallback(() => {
    if (graph.nodes.length === 0) return;
    
    // Calculate bounding box
    const minX = Math.min(...graph.nodes.map(n => n.x)) - 50;
    const maxX = Math.max(...graph.nodes.map(n => n.x)) + 50;
    const minY = Math.min(...graph.nodes.map(n => n.y)) - 50;
    const maxY = Math.max(...graph.nodes.map(n => n.y)) + 50;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const scaleX = containerRect.width / width;
      const scaleY = containerRect.height / height;
      const scale = Math.min(scaleX, scaleY, 2); // Don't zoom in too much
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      setViewport({
        x: containerRect.width / 2 - centerX * scale,
        y: containerRect.height / 2 - centerY * scale,
        scale
      });
    }
  }, [graph.nodes]);
  
  // Initialize viewport to fit content when graph first loads
  useEffect(() => {
    if (graph.nodes.length > 0 && viewport.scale === 1 && viewport.x === 0 && viewport.y === 0) {
      // Small delay to ensure container is properly sized
      setTimeout(() => {
        fitToContent();
      }, 100);
    }
  }, [graph.nodes.length, fitToContent, viewport]);
  
  // Draw the graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to match container
    const resizeCanvas = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply viewport transformation
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);
    
    // Define node radius and colors
    const nodeRadius = 20;
    const nodeColor = '#6B7280';
    const selectedNodeColor = '#8B5CF6';
    const nodeTextColor = '#FFFFFF';
    const edgeColor = '#9CA3AF';
    const selectedEdgeColor = '#8B5CF6';
    const nodeStrokeWidth = 2;
    const edgeStrokeWidth = 2;
    const selectedEdgeStrokeWidth = 4;
    
    // Helper function to draw an arrow
    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) => {
      // Calculate the angle of the line
      const angle = Math.atan2(toY - fromY, toX - fromX);
      
      // Calculate the actual end point (outside of node)
      const endX = toX - nodeRadius * Math.cos(angle);
      const endY = toY - nodeRadius * Math.sin(angle);
      
      // Draw the line
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = width / viewport.scale; // Adjust line width for zoom
      ctx.stroke();
      
      // Draw the arrowhead only for directed graphs
      if (graphConfig?.isDirected) {
        const arrowSize = 10;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle - Math.PI / 6),
          endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle + Math.PI / 6),
          endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }
    };
    
    // Helper function to draw a simple line (for undirected graphs)
    const drawLine = (fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) => {
      // Calculate the angle of the line
      const angle = Math.atan2(toY - fromY, toX - fromX);
      
      // Calculate start and end points (outside of nodes)
      const startX = fromX + nodeRadius * Math.cos(angle);
      const startY = fromY + nodeRadius * Math.sin(angle);
      const endX = toX - nodeRadius * Math.cos(angle);
      const endY = toY - nodeRadius * Math.sin(angle);
      
      // Draw the line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = width / viewport.scale; // Adjust line width for zoom
      ctx.stroke();
    };
    
    // Draw edges first (so they appear behind nodes)
    graph.edges.forEach(edge => {
      const sourceNode = graph.nodes.find(node => node.id === edge.source);
      const targetNode = graph.nodes.find(node => node.id === edge.target);
      
      if (sourceNode && targetNode) {
        const isSelected = selectedEdge && selectedEdge.id === edge.id;
        const color = isSelected ? selectedEdgeColor : edgeColor;
        const width = isSelected ? selectedEdgeStrokeWidth : edgeStrokeWidth;
        
        // Draw the edge
        if (graphConfig?.isDirected) {
          drawArrow(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y, color, width);
        } else {
          drawLine(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y, color, width);
        }
        
        // Draw the weight
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        
        // Only show weights for weighted graphs
        if (graphConfig?.isWeighted && edge.weight !== undefined) {
          // Background for text
          ctx.beginPath();
          ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1 / viewport.scale; // Adjust line width for zoom
          ctx.stroke();
          
          // Text
          ctx.font = `${12 / viewport.scale}px Arial`; // Adjust font size for zoom
          ctx.fillStyle = '#4B5563';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(edge.weight.toString(), midX, midY);
        }
      }
    });
    
    // Draw nodes
    graph.nodes.forEach(node => {
      const isSelected = selectedNode && selectedNode.id === node.id;
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? selectedNodeColor : nodeColor;
      ctx.fill();
      ctx.strokeStyle = '#F3F4F6';
      ctx.lineWidth = nodeStrokeWidth / viewport.scale; // Adjust line width for zoom
      ctx.stroke();
      
      // Draw node label
      ctx.font = `bold ${14 / viewport.scale}px Arial`; // Adjust font size for zoom
      ctx.fillStyle = nodeTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label || node.id.toString(), node.x, node.y);
    });
    
    // Draw source node indicator in addEdge mode
    if (mode === 'addEdge' && selectedNode) {
      ctx.beginPath();
      ctx.arc(selectedNode.x, selectedNode.y, nodeRadius + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = selectedNodeColor;
      ctx.lineWidth = 2 / viewport.scale; // Adjust line width for zoom
      ctx.setLineDash([5 / viewport.scale, 3 / viewport.scale]); // Adjust dash for zoom
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Restore the canvas transformation
    ctx.restore();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [graph, mode, selectedNode, selectedEdge, viewport, graphConfig]);
  
  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Skip click handling if we just finished dragging
    if (dragType) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldPos = screenToWorld(mouseX, mouseY);
    
    // Check if clicked on a node first
    const nodeRadius = 20;
    let clickedNode: Node | null = null;
    
    for (let i = graph.nodes.length - 1; i >= 0; i--) {
      const node = graph.nodes[i];
      const distance = Math.sqrt(Math.pow(node.x - worldPos.x, 2) + Math.pow(node.y - worldPos.y, 2));
      
      if (distance <= nodeRadius) {
        clickedNode = node;
        break;
      }
    }
    
    if (clickedNode) {
      onNodeClick(clickedNode);
      return;
    }
    
    // Check if clicked on an edge
    let clickedEdge: Edge | null = null;
    
    for (let i = graph.edges.length - 1; i >= 0; i--) {
      const edge = graph.edges[i];
      const sourceNode = graph.nodes.find(node => node.id === edge.source);
      const targetNode = graph.nodes.find(node => node.id === edge.target);
      
      if (sourceNode && targetNode) {
        // Calculate distance from point to line
        const lineLength = Math.sqrt(
          Math.pow(targetNode.x - sourceNode.x, 2) + 
          Math.pow(targetNode.y - sourceNode.y, 2)
        );
        
        if (lineLength === 0) continue;
        
        const distToLine = Math.abs(
          (targetNode.y - sourceNode.y) * worldPos.x -
          (targetNode.x - sourceNode.x) * worldPos.y +
          targetNode.x * sourceNode.y -
          targetNode.y * sourceNode.x
        ) / lineLength;
        
        // Check if point is within line segment bounding box (adjusted for world coordinates)
        const withinBounds = 
          worldPos.x >= Math.min(sourceNode.x, targetNode.x) - 5 &&
          worldPos.x <= Math.max(sourceNode.x, targetNode.x) + 5 &&
          worldPos.y >= Math.min(sourceNode.y, targetNode.y) - 5 &&
          worldPos.y <= Math.max(sourceNode.y, targetNode.y) + 5;
        
        if (distToLine < 10 && withinBounds) {
          clickedEdge = edge;
          break;
        }
      }
    }
    
    if (clickedEdge) {
      onEdgeClick(clickedEdge);
      return;
    }
    
    // If not clicked on a node or edge, handle canvas click with world coordinates
    onCanvasClick(worldPos.x, worldPos.y);
  };
  
  return (
    <div ref={containerRef} className="w-full h-full bg-gray-50 relative">
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
        className={`w-full h-full ${
          isDragging 
            ? dragType === 'canvas' 
              ? 'cursor-grabbing' 
              : 'cursor-move'
            : mode === 'addNode' 
              ? 'cursor-cell' 
              : mode === 'addEdge' 
                ? 'cursor-crosshair' 
                : mode === 'delete' 
                  ? 'cursor-no-drop' 
                  : 'cursor-grab'
        }`}
      ></canvas>
      
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button
          onClick={zoomIn}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded shadow-sm border border-gray-200 transition-all"
          title="Збільшити (Ctrl/Cmd +)"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={zoomOut}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded shadow-sm border border-gray-200 transition-all"
          title="Зменшити (Ctrl/Cmd -)"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={fitToContent}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded shadow-sm border border-gray-200 transition-all"
          title="Підійти під вміст"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={resetView}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded shadow-sm border border-gray-200 transition-all"
          title="Скинути вид (Ctrl/Cmd 0)"
        >
          <RotateCcw size={16} />
        </button>
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-600">
        {Math.round(viewport.scale * 100)}%
      </div>
      
      {/* Controls help text */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-600 max-w-xs">
        <div>• Колесо миші: Збільшити/Зменшити</div>
        <div>• Ctrl+Клік або Середній клік: Перемістити</div>
        <div>• Ctrl/Cmd + 0: Скинути вид</div>
        <div>• Ctrl/Cmd + +/-: Збільшити/Зменшити</div>
        {mode === 'select' && <div>• Перетягніть вузли, щоб перемістити їх</div>}
      </div>
    </div>
  );
};

export default EditorCanvas;