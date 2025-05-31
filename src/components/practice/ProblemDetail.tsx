import React, { useState } from 'react';
import { ArrowLeft, Play, CheckCircle, XCircle, Clock, Tag, HelpCircle } from 'lucide-react';
import { PracticeProblem } from '../../types/practice';

interface ProblemDetailProps {
  problem: PracticeProblem;
  onBack: () => void;
}

const ProblemDetail: React.FC<ProblemDetailProps> = ({ problem, onBack }) => {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userSolution, setUserSolution] = useState('');
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  
  const handleSubmit = () => {
    if (userSolution.trim() === '') {
      setFeedback({
        isCorrect: false,
        message: 'Будь ласка, введіть розв\'язок перед надсиланням.'
      });
      return;
    }
    
    // Mock validation - in a real app this would check against the actual solution
    const isCorrect = Math.random() > 0.5;
    
    setFeedback({
      isCorrect,
      message: isCorrect
        ? 'Вітаємо! Ваш розв\'язок правильний.'
        : 'Ваш розв\'язок неправильний. Будь ласка, спробуйте знову або перегляньте підказку.'
    });
  };
  
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
              {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Опис завдання</h2>
            <div className="prose max-w-none">
              <p>{problem.description}</p>
              {problem.examples && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Приклади</h3>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="mt-2 p-4 bg-gray-50 rounded-md">
                      <div className="mb-2">
                        <strong>Input:</strong> {example.input}
                      </div>
                      <div>
                        <strong>Output:</strong> {example.output}
                      </div>
                      {example.explanation && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Пояснення:</strong> {example.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {problem.constraints && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Обмеження</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {showHint && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Підказка</h3>
                <p className="text-blue-800">{problem.hint}</p>
              </div>
            )}
            
            {showSolution && (
              <div className="mt-6 p-4 bg-purple-50 rounded-md">
                <h3 className="text-lg font-medium text-purple-900 mb-2">Розв'язок</h3>
                <div className="prose max-w-none text-purple-800">
                  <p>{problem.solution}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ваш розв'язок</h2>
            
            {feedback && (
              <div className={`p-4 rounded-md mb-4 ${
                feedback.isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {feedback.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      feedback.isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {feedback.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <textarea
              value={userSolution}
              onChange={e => setUserSolution(e.target.value)}
              placeholder="Введіть ваш розв'язок тут..."
              className="w-full p-4 border border-gray-300 rounded-md h-64 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            ></textarea>
            
            <div className="mt-4 flex justify-between">
              <div>
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <HelpCircle size={16} className="mr-2" />
                  {showHint ? 'Сховати підказку' : 'Показати підказку'}
                </button>
                <button 
                  onClick={() => setShowSolution(!showSolution)}
                  className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {showSolution ? 'Сховати розв\'язок' : 'Показати розв\'язок'}
                </button>
              </div>
              <button 
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Play size={16} className="mr-2" />
                Надіслати розв'язок
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Статистика завдання</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Спробували</span>
                  <span>{problem.attemptedCount} користувачів</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Рівень успіху</span>
                  <span>{problem.successRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${problem.successRate}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Середній час</span>
                  <span>{problem.averageTime} хв</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Пов'язані завдання</h2>
            <ul className="space-y-3">
              {problem.relatedProblems?.map((relatedProblem, index) => (
                <li key={index} className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                  <a href="#" className="block hover:bg-gray-50 -mx-2 p-2 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{relatedProblem.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{relatedProblem.topic}</p>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        relatedProblem.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                        relatedProblem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {relatedProblem.difficulty.charAt(0).toUpperCase() + relatedProblem.difficulty.slice(1)}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;