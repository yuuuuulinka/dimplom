import React, { useState, useEffect } from 'react';
import { Search, Filter, Award, Book, CheckCircle, FileText } from 'lucide-react';
import { usePracticeProblems } from '../../hooks/usePracticeProblems';
import { useTests } from '../../hooks/useTests';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ProblemCard from './ProblemCard';
import ProblemDetail from './ProblemDetail';
import TestCard from './TestCard';
import TestDetail from './TestDetail';
import { PracticeProblem, Test } from '../../types/practice';

const Practice: React.FC = () => {
  const { problems, isLoading: problemsLoading, error: problemsError } = usePracticeProblems();
  const { tests, isLoading: testsLoading, error: testsError } = useTests();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [activeTab, setActiveTab] = useState<'problems' | 'tests'>('problems');
  const [selectedProblem, setSelectedProblem] = useState<PracticeProblem | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testStats, setTestStats] = useState<{
    passedCount: number;
    passedTests: Array<{ testId: string; score: number }>;
  }>({ passedCount: 0, passedTests: [] });
  const [statsLoading, setStatsLoading] = useState(false);
  
  const difficulties = [
    { id: 'all', name: 'Усі рівні складності' },
    { id: 'easy', name: 'Легко' },
    { id: 'medium', name: 'Середньо' },
    { id: 'hard', name: 'Складно' },
  ];
  
  const topics = [
    { id: 'all', name: 'Усі теми' },
    { id: 'bfs', name: 'Пошук в ширину' },
    { id: 'dfs', name: 'Пошук в глибину' },
    { id: 'dijkstra', name: 'Алгоритм Дейкстри' },
    { id: 'mst', name: 'Мінімальне кістякове дерево' },
    { id: 'paths', name: 'Найкоротші шляхи' },
  ];
  
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'all' || problem.topics.includes(selectedTopic);
    
    return matchesSearch && matchesDifficulty && matchesTopic;
  });
  
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || test.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'all' || test.category === selectedTopic;
    
    return matchesSearch && matchesDifficulty && matchesTopic;
  });
  
  // Create a named function for fetchTestStats so it can be called from the callback
  const fetchTestStats = async () => {
    if (!user) return;
    
    setStatsLoading(true);
    try {
      const stats = await api.tests.getStats();
      setTestStats({
        passedCount: stats.passedCount,
        passedTests: stats.passedTests
      });
    } catch (error) {
      console.error('Failed to fetch test stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };
  
  // Fetch test statistics when user is available
  useEffect(() => {
    fetchTestStats();
  }, [user]);
  
  if (selectedProblem) {
    return (
      <ProblemDetail 
        problem={selectedProblem} 
        onBack={() => setSelectedProblem(null)} 
      />
    );
  }
  
  if (selectedTest) {
    return (
      <TestDetail 
        test={selectedTest} 
        onBack={() => setSelectedTest(null)}
        onTestCompleted={() => {
          // Refresh test stats when a test is completed
          if (user) {
            fetchTestStats();
          }
        }}
      />
    );
  }
  
  const isLoading = problemsLoading || testsLoading;
  const error = problemsError || testsError;

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Практичні завдання</h1>
        
        <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg mb-4">
          <button
            onClick={() => setActiveTab('problems')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'problems'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Award size={16} className="mr-2" />
            Завдання
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'tests'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} className="mr-2" />
            Тести
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative rounded-md flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Пошук завдань..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative inline-block w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={20} className="text-gray-400" />
              </div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative inline-block w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Book size={20} className="text-gray-400" />
              </div>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              >
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">Помилка завантаження завдань. Будь ласка, спробуйте пізніше.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'problems' ? (
            filteredProblems.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <Award size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Немає завдань</h3>
                <p className="text-gray-600">
                  Ми не знайшли жодного завдання, що відповідає вашим критеріям. Спробуйте скоригувати ваші фільтри.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {filteredProblems.length} Завдан{filteredProblems.length !== 1 ? 'ь' : 'ня'}
                  </h2>
                  <div className="text-sm text-gray-500 flex items-center">
                    <CheckCircle size={18} className="text-green-500 mr-1" />
                    <span>3 виконано</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProblems.map(problem => (
                    <ProblemCard 
                      key={problem.id} 
                      problem={problem} 
                      onClick={() => setSelectedProblem(problem)} 
                    />
                  ))}
                </div>
              </>
            )
          ) : (
            filteredTests.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Немає тестів</h3>
                <p className="text-gray-600">
                  Ми не знайшли жодного тесту, що відповідає вашим критеріям. Спробуйте скоригувати ваші фільтри.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {filteredTests.length} Тест{filteredTests.length !== 1 ? 'ів' : ''}
                  </h2>
                  {user && (
                    <div className="text-sm text-gray-500 flex items-center">
                      <CheckCircle size={18} className="text-green-500 mr-1" />
                      {statsLoading ? (
                        <span>Завантаження...</span>
                      ) : (
                        <span>{testStats.passedCount} виконано</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTests.map(test => {
                    // Check if this test is completed
                    const passedTest = testStats.passedTests.find(pt => pt.testId === test.id);
                    const testWithCompletion = {
                      ...test,
                      completed: !!passedTest,
                      score: passedTest?.score
                    };
                    
                    return (
                      <TestCard 
                        key={test.id} 
                        test={testWithCompletion} 
                        onClick={() => setSelectedTest(test)} 
                      />
                    );
                  })}
                </div>
              </>
            )
          )}
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ваша статистика практики</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-green-600 font-medium uppercase">Виконано</p>
                    <p className="text-2xl font-bold text-green-800">
                      {activeTab === 'tests' && user ? testStats.passedCount : '3'}
                    </p>
                  </div>
                  <CheckCircle size={32} className="text-green-500" />
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-yellow-600 font-medium uppercase">В процесі</p>
                    <p className="text-2xl font-bold text-yellow-800">
                      {activeTab === 'tests' && user 
                        ? Math.max(0, filteredTests.length - testStats.passedCount)
                        : activeTab === 'problems' ? '2' : '1'
                      }
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full border-4 border-yellow-500 border-r-transparent animate-spin"></div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-blue-600 font-medium uppercase">
                      {activeTab === 'problems' ? 'Точність' : 'Середній бал'}
                    </p>
                    <p className="text-2xl font-bold text-blue-800">
                      {activeTab === 'tests' && user && testStats.passedTests.length > 0
                        ? Math.round(testStats.passedTests.reduce((sum, test) => sum + test.score, 0) / testStats.passedTests.length) + '%'
                        : activeTab === 'problems' ? '75%' : '82%'
                      }
                    </p>
                  </div>
                  <Award size={32} className="text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Practice;