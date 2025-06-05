import React, { useState, useRef } from 'react';
import { GripVertical, RotateCcw } from 'lucide-react';

interface DragDropListProps {
  items: string[];
  onOrderChange: (newOrder: number[]) => void;
  disabled?: boolean;
  value?: number[];
}

const DragDropList: React.FC<DragDropListProps> = ({ 
  items, 
  onOrderChange, 
  disabled = false,
  value = []
}) => {
  // Initialize order: if value is provided, use it, otherwise use original order
  const [currentOrder, setCurrentOrder] = useState<number[]>(
    value.length > 0 ? value : items.map((_, index) => index)
  );
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (disabled) return;
    
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (disabled) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    if (disabled) return;
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (disabled || draggedIndex === null) return;
    
    e.preventDefault();
    
    const newOrder = [...currentOrder];
    const draggedItem = newOrder[draggedIndex];
    
    // Remove the dragged item
    newOrder.splice(draggedIndex, 1);
    
    // Insert it at the new position
    newOrder.splice(dropIndex, 0, draggedItem);
    
    setCurrentOrder(newOrder);
    onOrderChange(newOrder);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const resetOrder = () => {
    if (disabled) return;
    
    const originalOrder = items.map((_, index) => index);
    setCurrentOrder(originalOrder);
    onOrderChange(originalOrder);
  };

  const moveUp = (index: number) => {
    if (disabled || index === 0) return;
    
    const newOrder = [...currentOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setCurrentOrder(newOrder);
    onOrderChange(newOrder);
  };

  const moveDown = (index: number) => {
    if (disabled || index === currentOrder.length - 1) return;
    
    const newOrder = [...currentOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setCurrentOrder(newOrder);
    onOrderChange(newOrder);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Розташуйте елементи в правильному порядку</h3>
        {!disabled && (
          <button
            onClick={resetOrder}
            className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RotateCcw size={12} className="mr-1" />
            Скинути
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {currentOrder.map((originalIndex, currentPosition) => (
          <div
            key={originalIndex}
            ref={dragRef}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, currentPosition)}
            onDragOver={(e) => handleDragOver(e, currentPosition)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, currentPosition)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center p-3 bg-white border rounded-md transition-all duration-200
              ${!disabled ? 'cursor-move hover:shadow-md' : 'cursor-default'}
              ${draggedIndex === currentPosition ? 'opacity-50 scale-95' : ''}
              ${dragOverIndex === currentPosition ? 'border-purple-400 shadow-lg transform scale-105' : 'border-gray-300'}
              ${disabled ? 'bg-gray-50' : ''}
            `}
          >
            {!disabled && (
              <div className="flex flex-col space-y-1 mr-3">
                <button
                  onClick={() => moveUp(currentPosition)}
                  disabled={currentPosition === 0}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↑
                </button>
                <GripVertical size={16} className="text-gray-400" />
                <button
                  onClick={() => moveDown(currentPosition)}
                  disabled={currentPosition === currentOrder.length - 1}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↓
                </button>
              </div>
            )}
            
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-600 mr-3">
                {currentPosition + 1}.
              </span>
              <span className="text-gray-800">
                {items[originalIndex]}
              </span>
            </div>
            
            {draggedIndex === currentPosition && (
              <div className="text-xs text-purple-600 font-medium">
                Перетягується...
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-500 space-y-1">
        <p>💡 <strong>Способи сортування:</strong></p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Перетягуйте елементи мишею</li>
          <li>Використовуйте кнопки ↑ та ↓ для переміщення</li>
          <li>Натисніть "Скинути" для повернення до початкового порядку</li>
        </ul>
      </div>
    </div>
  );
};

export default DragDropList; 