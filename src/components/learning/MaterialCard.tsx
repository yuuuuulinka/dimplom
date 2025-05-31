import React from 'react';
import { Clock, BookOpen, Video, FileText, Star } from 'lucide-react';
import { Material } from '../../types/materials';

interface MaterialCardProps {
  material: Material;
  onClick: () => void;
}
const MaterialCard: React.FC<MaterialCardProps> = ({ material, onClick }) => {
  const getTypeIcon = () => {
    switch (material.type) {
      case 'article':
        return <FileText size={16} className="mr-1 text-blue-500" />;
      case 'video':
        return <Video size={16} className="mr-1 text-red-500" />;
      case 'tutorial':
        return <BookOpen size={16} className="mr-1 text-green-500" />;
      default:
        return <FileText size={16} className="mr-1 text-gray-500" />;
    }
  };

  const getCategoryColor = () => {
    switch (material.category) {
      case 'basics':
        return 'bg-blue-100 text-blue-800';
      case 'algorithms':
        return 'bg-purple-100 text-purple-800';
      case 'applications':
        return 'bg-green-100 text-green-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {material.thumbnailUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={material.thumbnailUrl} 
            alt={material.title}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor()}`}>
            {material.category.charAt(0).toUpperCase() + material.category.slice(1)}
          </span>
          <div className="flex items-center">
            <Star size={16} className="text-yellow-400" />
            <span className="ml-1 text-sm text-gray-700">{material.rating}</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{material.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2" style={{ maxHeight: '2.5rem', overflow: 'hidden' }}>
          {material.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center">
            {getTypeIcon()}
            {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
          </span>
          <span className="flex items-center">
            <Clock size={16} className="mr-1" />
            {material.duration}
          </span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          Переглянути матеріал
        </button>
      </div>
    </div>
  );
};

export default MaterialCard;