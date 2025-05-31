import React from 'react';
import { MousePointer, Plus, GitBranch, Trash2 } from 'lucide-react';

interface EditorToolbarProps {
  mode: 'select' | 'addNode' | 'addEdge' | 'delete';
  onModeChange: (mode: 'select' | 'addNode' | 'addEdge' | 'delete') => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ mode, onModeChange }) => {
  const tools = [
    { id: 'select', label: 'Обрати', icon: <MousePointer size={18} /> },
    { id: 'addNode', label: 'Додати вузол', icon: <Plus size={18} /> },
    { id: 'addEdge', label: 'Додати ребро', icon: <GitBranch size={18} /> },
    { id: 'delete', label: 'Видалити', icon: <Trash2 size={18} /> }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onModeChange(tool.id as any)}
          className={`inline-flex items-center px-3 py-2 border ${
            mode === tool.id
              ? 'border-purple-600 bg-purple-100 text-purple-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          } rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
        >
          <span className="mr-2">{tool.icon}</span>
          {tool.label}
        </button>
      ))}
    </div>
  );
};

export default EditorToolbar;