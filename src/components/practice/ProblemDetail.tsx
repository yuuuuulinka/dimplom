import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Tag, HelpCircle } from 'lucide-react';
import { PracticeProblem, ValidationResult } from '../../types/practice';
import InteractiveProblem from './InteractiveProblem';

interface ProblemDetailProps {
  problem: PracticeProblem;
  onBack: () => void;
}

const ProblemDetail: React.FC<ProblemDetailProps> = ({ problem, onBack }) => {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  
  // Reset scroll to top when component mounts or problem changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [problem.id]); // Trigger when problem ID changes
  
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
  
  const handleProblemSubmit = (result: ValidationResult) => {
    console.log('Problem submitted with result:', result);
    // Here you could send the result to a backend or update local state
  };
  
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Назад до завдань
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
          <div className="mt-2 md:mt-0 flex items-center space-x-3">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor()}`}>
              {problem.difficulty === 'easy' ? 'Легко' : 
               problem.difficulty === 'medium' ? 'Середньо' : 'Складно'}
            </span>
            <span className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-1" />
              {problem.estimatedTime} хв
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {problem.topics.map((topic, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
              <Tag size={12} className="mr-1" />
              {topic}
            </span>
          ))}
        </div>
      </div>
      
      {/* Use the new InteractiveProblem component */}
      <InteractiveProblem 
        problem={problem}
        onSubmit={handleProblemSubmit}
      />
      
      {/* Additional help section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowHint(!showHint)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <HelpCircle size={16} className="mr-2" />
            {showHint ? 'Сховати підказку' : 'Показати підказку'}
          </button>
          {problem.solution && (
            <button 
              onClick={() => setShowSolution(!showSolution)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {showSolution ? 'Сховати розв\'язок' : 'Показати розв\'язок'}
            </button>
          )}
        </div>
        
        {showHint && problem.hint && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Підказка</h3>
            <p className="text-blue-800">{problem.hint}</p>
          </div>
        )}
        
        {showSolution && problem.solution && (
          <div className="mt-4 p-4 bg-purple-50 rounded-md">
            <h3 className="text-lg font-medium text-purple-900 mb-2">✅ Розв'язок</h3>
            <div className="prose max-w-none text-purple-800">
              <p>{problem.solution}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Related problems section */}
      {problem.relatedProblems && problem.relatedProblems.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Пов'язані завдання</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problem.relatedProblems.map((related, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">{related.title}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    related.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    related.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {related.difficulty === 'easy' ? 'Легко' : 
                     related.difficulty === 'medium' ? 'Середньо' : 'Складно'}
                  </span>
                  <span className="text-xs text-gray-500">{related.topic}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDetail;