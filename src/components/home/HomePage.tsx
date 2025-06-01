import React, { useState, useEffect } from 'react';
import { ArrowRight, Bookmark, BarChart3, Users, Book, Play, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface HomePageProps {
  onNavigate: (section: string) => void;
}

interface TestStats {
  passedCount: number;
  passedTests: Array<{
    testId: string;
    score: number;
  }>;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const [testStats, setTestStats] = useState<TestStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Total number of tests available (you can adjust this based on your actual test count)
  const totalTests = 12;

  useEffect(() => {
    if (isAuthenticated) {
      loadTestStats();
      
      // Add visibility change listener to refresh data when user switches back to tab
      const handleVisibilityChange = () => {
        if (!document.hidden && isAuthenticated) {
          loadTestStats();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [isAuthenticated]);

  const loadTestStats = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingStats(true);
    try {
      const response = await api.tests.getStats();
      setTestStats(response);
    } catch (error) {
      console.error('Failed to load test stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const calculateProgress = () => {
    if (!testStats || !isAuthenticated) return 0;
    return Math.round((testStats.passedCount / totalTests) * 100);
  };

  const getProgressLabel = () => {
    if (!isAuthenticated) return 'Увійдіть для відстеження прогресу';
    if (isLoadingStats) return 'Завантаження...';
    
    const progress = calculateProgress();
    if (progress === 0) return 'Почніть проходити тести';
    if (progress === 100) return 'Усі тести завершено!';
    return 'В процесі';
  };

  const getProgressColor = () => {
    if (!isAuthenticated || isLoadingStats) return 'gray';
    
    const progress = calculateProgress();
    if (progress === 0) return 'gray';
    if (progress === 100) return 'green';
    return 'purple';
  };

  const features = [
    {
      id: 'visualizer',
      title: 'Візуалізатор алгоритмів',
      description: 'Дивіться, як алгоритми, такі як Дейкстра, BFS і DFS, оживають крок за кроком з візуалізацією',
      icon: <Play className="h-8 w-8 text-purple-700" />,
      color: 'bg-purple-100',
    },
    {
      id: 'editor',
      title: 'Редактор графів',
      description: 'Створюйте та редагуйте власні графіки з інтуїтивною інтерфейсом перетягування та кидання',
      icon: <BarChart3 className="h-8 w-8 text-teal-600" />,
      color: 'bg-teal-100',
    },
    {
      id: 'learning',
      title: 'Матеріали для навчання',
      description: 'Доступ до всебічної бібліотеки підручників, статей та відео з теорії графів',
      icon: <Book className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-100',
    },
    {
      id: 'practice',
      title: 'Практичні завдання',
      description: 'Тестуйте свої знання з інтерактивними завданнями та отримуйте миттєвий зворотний зв\'язок',
      icon: <Award className="h-8 w-8 text-amber-600" />,
      color: 'bg-amber-100',
    },
  ];

  const latestUpdates = [
    { title: 'Новий алгоритм: Флойда-Уоршала', date: '2 дні тому' },
    { title: 'Додано 10 нових практичних завдань', date: '1 тиждень тому' },
    { title: 'Інтерактивний підручник про мінімальні остовні дерева', date: '2 тижні тому' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-8 md:p-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Навчайтеся теорії графів інтерактивно
            </h1>
            <p className="text-lg text-purple-100 mb-6">
              Маєте можливість навчатися теорії графів інтерактивно, практично та через всебічні матеріали для навчання.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('learning')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Почати навчання
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => onNavigate('visualizer')}
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Спробувати візуалізатор
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Досліджуйте GraphLearn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`${feature.color} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => onNavigate(feature.id)}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Materials & Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Algorithms */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Популярні алгоритми</h2>
          <ul className="space-y-3">
            {['Алгоритм Дейкстри', 'Пошук у ширину', 'Пошук у глибину', 'Алгоритм Крускала', 'Алгоритм Прима'].map((algo, index) => (
              <li key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors">
                <Bookmark className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-gray-700">{algo}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => onNavigate('visualizer')}
            className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Переглянути всі алгоритми
          </button>
        </section>

        {/* Latest Updates */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Останні оновлення</h2>
          <ul className="space-y-3">
            {latestUpdates.map((update, index) => (
              <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md transition-colors">
                <span className="text-gray-700">{update.title}</span>
                <span className="text-xs text-gray-500">{update.date}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium text-gray-900">Прогрес навчання</h3>
              {isAuthenticated && testStats && (
                <span className="text-sm text-gray-600">
                  {testStats.passedCount} з {totalTests} тестів
                </span>
              )}
            </div>
            
            {isAuthenticated ? (
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                      getProgressColor() === 'green' ? 'text-green-600 bg-green-200' :
                      getProgressColor() === 'gray' ? 'text-gray-600 bg-gray-200' :
                      'text-purple-600 bg-purple-200'
                    }`}>
                      {getProgressLabel()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold inline-block ${
                      getProgressColor() === 'green' ? 'text-green-600' :
                      getProgressColor() === 'gray' ? 'text-gray-600' :
                      'text-purple-600'
                    }`}>
                      {isLoadingStats ? '...' : `${calculateProgress()}%`}
                    </span>
                  </div>
                </div>
                <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
                  getProgressColor() === 'green' ? 'bg-green-200' :
                  getProgressColor() === 'gray' ? 'bg-gray-200' :
                  'bg-purple-200'
                }`}>
                  <div 
                    style={{ width: `${calculateProgress()}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 ${
                      getProgressColor() === 'green' ? 'bg-green-600' :
                      getProgressColor() === 'gray' ? 'bg-gray-600' :
                      'bg-purple-600'
                    }`}
                  ></div>
                </div>
                {testStats && testStats.passedCount > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    Середній бал: {Math.round(testStats.passedTests.reduce((sum, test) => sum + test.score, 0) / testStats.passedTests.length)}%
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">Увійдіть в систему, щоб відстежувати свій прогрес</p>
                <button
                  onClick={() => onNavigate('auth')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Увійти
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Testimonials or Community Section */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Приєднуйтесь до нашої спільноти</h2>
        <div className="flex items-center mb-4">
          <Users className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <p className="text-gray-700">Спілкуйтеся з понад 5,000 ентузіастами теорії графів, діліться рішеннями та навчайтеся разом.</p>
          </div>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
          Приєднатися до форуму обговорень
        </button>
      </section>
    </div>
  );
};

export default HomePage;