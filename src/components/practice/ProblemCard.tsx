import React from 'react';
import { Tag, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { PracticeProblem } from '../../types/practice';

interface ProblemCardProps {
  problem: PracticeProblem;
  onClick: () => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onClick }) => {
  const getDifficultyColor = () => {
    switch (problem.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor()}`}>
            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
          </span>
          {problem.completed && (
            <CheckCircle size={20} className="text-green-500" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2" style={{ maxHeight: '2.5rem', overflow: 'hidden' }}>
          {problem.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {problem.topics.map((topic, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
              <Tag size={12} className="mr-1" />
              {topic}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Clock size={14} className="mr-1" />
            {problem.estimatedTime} min
          </span>
          <span className="flex items-center">
            <BarChart3 size={14} className="mr-1" />
            {problem.successRate}% success rate
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard;