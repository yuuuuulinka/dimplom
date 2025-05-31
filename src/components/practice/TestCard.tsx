import React from 'react';
import { Clock, CheckCircle, BarChart3, Award } from 'lucide-react';
import { Test } from '../../types/practice';

interface TestCardProps {
  test: Test;
  onClick: () => void;
}

const TestCard: React.FC<TestCardProps> = ({ test, onClick }) => {
  const getDifficultyColor = () => {
    switch (test.difficulty) {
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

  const getCategoryColor = () => {
    switch (test.category) {
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor()}`}>
            {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
          </span>
          {test.completed && (
            <CheckCircle size={20} className="text-green-500" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.title}</h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2" style={{ maxHeight: '2.5rem', overflow: 'hidden' }}>
          {test.description}
        </p>
        
        <div className="mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor()}`}>
            {test.category.charAt(0).toUpperCase() + test.category.slice(1)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center">
            <Clock size={14} className="mr-1" />
            {test.estimatedTime} хв
          </span>
          <span className="flex items-center">
            <BarChart3 size={14} className="mr-1" />
            {test.questions.length} завдань
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center">
            <Award size={14} className="mr-1" />
            Пройти: {test.passingScore}%
          </span>
          {test.score !== undefined && (
            <span className={`font-medium ${test.score >= test.passingScore ? 'text-green-600' : 'text-red-600'}`}>
              Оцінка: {test.score}%
            </span>
          )}
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
        {test.completed ? 'Повторно пройти тест' : 'Пройти тест'}
        </button>
      </div>
    </div>
  );
};

export default TestCard; 