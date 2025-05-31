import React, { useState, useEffect } from 'react';
import { User, Settings, Award, BookOpen, Clock, BarChart3, Calendar, ChevronRight, Edit, LogOut, Trophy, Star, CheckCircle, XCircle, Save, Eye, Trash2, FolderOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { GraphData, GraphType } from '../../types/graph';
import { graphs, SavedGraph, achievements } from '../../services/api';

interface UserProfileProps {
  onLoginClick: () => void;
  onNavigateToEditor?: (savedGraphId?: string, graphData?: GraphData) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLoginClick, onNavigateToEditor }) => {
  const { user, isAuthenticated, logout, updateUser, deleteAccount } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('savedGraphs');
  const [isEditing, setIsEditing] = useState(false);
  const [savedGraphs, setSavedGraphs] = useState<SavedGraph[]>([]);
  const [editingGraphId, setEditingGraphId] = useState<string | null>(null);
  const [editingGraphName, setEditingGraphName] = useState('');
  const [isLoadingGraphs, setIsLoadingGraphs] = useState(false);
  const [deletingGraphId, setDeletingGraphId] = useState<string | null>(null);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    preferences: {
      emailNotifications: user?.preferences?.emailNotifications || false,
      darkMode: user?.preferences?.darkMode || false,
      saveProgress: user?.preferences?.saveProgress || false
    }
  });
  
  const topics = [
    {
      id: 'graph-basics',
      name: 'Основи графів',
      description: 'Основні поняття теорії графів',
      completed: true,
      progress: 100,
      subtopics: ['Вершини та ребра', 'Типи графів', 'Властивості графів']
    },
    {
      id: 'graph-traversal',
      name: 'Обхід графів',
      description: 'Методи для відвідування вершин графів',
      completed: true,
      progress: 100,
      subtopics: ['BFS', 'DFS', 'Застосування']
    },
    {
      id: 'shortest-paths',
      name: 'Найкоротші шляхи',
      description: 'Алгоритми для знаходження найкоротших шляхів',
      completed: false,
      progress: 60,
      subtopics: ['Алгоритм Дейкстри', 'Алгоритм Беллмана-Форда', 'Алгоритм Флойда-Уоршелла']
    },
    {
      id: 'minimum-spanning-trees',
      name: 'Мінімальні кістякові дерева',
      description: 'Знаходження мінімальних кістякових дерев у зважених графів',
      completed: false,
      progress: 30,
      subtopics: ['Алгоритм Прима', 'Алгоритм Крускала']
    },
    {
      id: 'network-flow',
      name: 'Потоки в мережах',
      description: 'Максимальні потоки та мінімальні розрізи',
      completed: false,
      progress: 0,
      subtopics: ['Алгоритм Форда-Фалкерсона', 'Алгоритм Едмондса-Карпа', 'Мінімальні розрізи']
    }
  ];
  
  const loadSavedGraphs = async () => {
    if (isLoadingGraphs) return; // Prevent multiple simultaneous calls
    
    setIsLoadingGraphs(true);
    try {
      const response = await graphs.getUserGraphs();
      const loadedGraphs = response.graphs || [];
      setSavedGraphs(loadedGraphs);
      return loadedGraphs;
    } catch (error) {
      console.error('Помилка завантаження збережених графів:', error);
      addNotification({
        type: 'error',
        message: 'Не вдалося завантажити збережені графи'
      });
      return [];
    } finally {
      setIsLoadingGraphs(false);
    }
  };

  const loadUserAchievements = async () => {
    if (isLoadingAchievements) return;
    
    setIsLoadingAchievements(true);
    try {
      const response = await achievements.getUserAchievements();
      const loadedAchievements = response.achievements || [];
      setUserAchievements(loadedAchievements);
      return loadedAchievements;
    } catch (error) {
      console.error('Помилка завантаження досягнень:', error);
      addNotification({
        type: 'error',
        message: 'Не вдалося завантажити досягнення'
      });
      return [];
    } finally {
      setIsLoadingAchievements(false);
    }
  };

  // Load saved graphs and achievements from API on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedGraphs();
      loadUserAchievements();
    }
  }, [isAuthenticated]);

  // Save graphs to localStorage whenever savedGraphs changes
  useEffect(() => {
    if (isAuthenticated && savedGraphs.length >= 0) {
      localStorage.setItem('userSavedGraphs', JSON.stringify(savedGraphs));
    }
  }, [savedGraphs, isAuthenticated]);

  const getGraphTypeDescription = (graphType: string): string => {
    const descriptions: Record<string, string> = {
      'directed-weighted': 'Орієнтований зважений',
      'directed-unweighted': 'Орієнтований неважений', 
      'undirected-weighted': 'Неорієнтований зважений',
      'undirected-unweighted': 'Неорієнтований неважений'
    };
    return descriptions[graphType] || 'Невідомий тип';
  };

  const handleRenameGraph = (graphId: string, currentName: string) => {
    setEditingGraphId(graphId);
    setEditingGraphName(currentName);
  };

  const saveGraphRename = () => {
    if (editingGraphId && editingGraphName.trim()) {
      setSavedGraphs(prevGraphs =>
        prevGraphs.map(graph =>
          graph.id === editingGraphId
            ? { ...graph, name: editingGraphName.trim(), dateModified: new Date().toISOString() }
            : graph
        )
      );
      addNotification({
        type: 'success',
        message: 'Граф перейменовано успішно!'
      });
    }
    setEditingGraphId(null);
    setEditingGraphName('');
  };

  const cancelGraphRename = () => {
    setEditingGraphId(null);
    setEditingGraphName('');
  };

  const handleViewGraph = (savedGraph: SavedGraph) => {
    // Log the graph being saved for debugging
    console.log('Збереження графа для перегляду:', {
      graphId: savedGraph.id,
      graphName: savedGraph.name,
      graphType: savedGraph.graph.type,
      nodesCount: savedGraph.graph.nodes.length,
      edgesCount: savedGraph.graph.edges.length,
      graphData: savedGraph.graph
    });
    
    // Convert the graph to match GraphData interface
    const graphData: GraphData = {
      ...savedGraph.graph,
      type: savedGraph.graph.type as GraphType
    };
    
    // Navigate to the editor with the graph data
    onNavigateToEditor?.(savedGraph.id, graphData);
  };

  const handleDeleteGraph = async (graphId: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей граф? Ця дія не може бути скасована.')) {
      setDeletingGraphId(graphId);
      try {
        await graphs.deleteGraph(graphId);
        
        // Remove from local state
        setSavedGraphs(prevGraphs => prevGraphs.filter(graph => graph.id !== graphId));
        
        // Also remove from localStorage backup
        const existingSavedGraphs = localStorage.getItem('userSavedGraphs');
        if (existingSavedGraphs) {
          const savedGraphs = JSON.parse(existingSavedGraphs);
          const updatedGraphs = savedGraphs.filter((graph: SavedGraph) => graph.id !== graphId);
          localStorage.setItem('userSavedGraphs', JSON.stringify(updatedGraphs));
        }
        
        addNotification({
          type: 'success',
          message: 'Граф видалено успішно!'
        });
      } catch (error) {
        console.error('Помилка видалення графу:', error);
        addNotification({
          type: 'error',
          message: 'Не вдалося видалити граф. Спробуйте ще раз.'
        });
      } finally {
        setDeletingGraphId(null);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Ви впевнені, що хочете видалити свій обліковий запис? Це незворотна дія.')) {
      try {
        await deleteAccount();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const renderSavedGraphs = () => {
    if (isLoadingGraphs) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Завантаження графів...</h3>
          <p className="text-gray-600">
            Будь ласка, зачекайте, поки ми завантажуємо ваші збережені графи.
          </p>
        </div>
      );
    }

    if (savedGraphs.length === 0) {
      return (
        <div className="text-center py-12">
          <FolderOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Немає збережених графів</h3>
          <p className="text-gray-600 mb-4">
            Створіть та збережіть графів у Редакторі графів, щоб побачити їх тут.
          </p>
          <button
            onClick={() => onNavigateToEditor?.()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Відкрити Редактор графів
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {savedGraphs.map((savedGraph) => (
          <div key={savedGraph.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {editingGraphId === savedGraph.id ? (
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={editingGraphName}
                      onChange={(e) => setEditingGraphName(e.target.value)}
                      className="text-lg font-medium border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => e.key === 'Enter' && saveGraphRename()}
                      autoFocus
                    />
                    <button
                      onClick={saveGraphRename}
                      className="text-green-600 hover:text-green-800"
                      title="Save"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={cancelGraphRename}
                      className="text-gray-400 hover:text-gray-600"
                      title="Cancel"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                ) : (
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{savedGraph.name}</h3>
                )}
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Тип:</strong> {getGraphTypeDescription(savedGraph.graph.type)}</p>
                  <p><strong>Вершини:</strong> {savedGraph.graph.nodes.length}</p>
                  <p><strong>Ребра:</strong> {savedGraph.graph.edges.length}</p>
                  <p><strong>Створено:</strong> {new Date(savedGraph.dateCreated).toLocaleDateString()}</p>
                  <p><strong>Змінено:</strong> {new Date(savedGraph.dateModified).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleRenameGraph(savedGraph.id, savedGraph.name)}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  title="Перейменувати граф"
                >
                  <Edit size={16} className="mr-1" />
                  Перейменувати
                </button>
                <button
                  onClick={() => handleViewGraph(savedGraph)}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  title="Переглянути граф"
                >
                  <Eye size={16} className="mr-1" />
                  Переглянути
                </button>
                <button
                  onClick={() => handleDeleteGraph(savedGraph.id)}
                  disabled={deletingGraphId === savedGraph.id}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Видалити граф"
                >
                  {deletingGraphId === savedGraph.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      Видалення...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-1" />
                      Видалити
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <User size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Увійдіть у систему, щоб побачити свій профіль</h2>
        <p className="text-gray-600 mb-6">
          Вам потрібно увійти в систему, щоб побачити свій профіль та стежити за своїм прогресом.
        </p>
        <button 
          onClick={onLoginClick}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Увійти
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        preferences: formData.preferences
      });
      setIsEditing(false);
      addNotification({
        type: 'success',
        message: 'Профіль оновлено успішно!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Не вдалося оновити профіль'
      });
    }
  };

  const renderAchievements = () => {
    const achievements = userAchievements.length > 0 ? userAchievements : (user?.achievements || []);

    if (isLoadingAchievements) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Завантаження досягнень...</h3>
          <p className="text-gray-600">
            Будь ласка, зачекайте, поки ми завантажуємо ваші досягнення.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Achievements Cards Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">🏆 Ваші досягнення</h3>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏆</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Досягнення відсутні</h4>
              <p className="text-gray-600">Ваші досягнення з'являться тут автоматично.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                    achievement.earned 
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md hover:shadow-lg' 
                      : 'bg-gray-50 border-gray-200 opacity-75'
                  }`}
                >
                  {achievement.earned && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-yellow-400 rounded-full p-1">
                        <Trophy size={16} className="text-yellow-800" />
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h4 className={`font-semibold text-sm mb-2 ${
                      achievement.earned ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.name}
                    </h4>
                    <p className={`text-xs leading-relaxed ${
                      achievement.earned ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {achievement.earned && achievement.earnedDate && (
                      <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 rounded-full px-2 py-1">
                        Отримано {new Date(achievement.earnedDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    {!achievement.earned && (
                      <div className="mt-3 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                        Ще не отримано
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topics Progress Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Прогрес тем</h3>
          <div className="space-y-6">
            {topics.map((topic) => (
              <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {topic.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-2" />
                      )}
                      <h4 className="text-lg font-medium text-gray-900">{topic.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                  </div>
                  <span className={`text-sm font-medium ${
                    topic.completed ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {topic.progress}%
                  </span>
                </div>
                
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        topic.completed ? 'bg-green-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${topic.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {topic.subtopics.map((subtopic, index) => (
                    <div 
                      key={index}
                      className="flex items-center text-sm text-gray-600"
                    >
                      {topic.progress > (index / topic.subtopics.length) * 100 ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300 mr-2" />
                      )}
                      {subtopic}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'progress':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Прогрес навчання</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Основи графів</span>
                    <span>7/10 завершено</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Алгоритми пошуку</span>
                    <span>4/8 завершено</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Алгоритми знаходження найкоротших шляхів</span>
                    <span>2/6 завершено</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Мінімальні кістякові дерева</span>
                    <span>0/4 завершено</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Статистика практики</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-purple-600 font-medium uppercase">Розв'язані задачі</p>
                      <p className="text-2xl font-bold text-purple-800">12</p>
                    </div>
                    <BookOpen size={32} className="text-purple-500" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-green-600 font-medium uppercase">Рівень успіху</p>
                      <p className="text-2xl font-bold text-green-800">75%</p>
                    </div>
                    <BarChart3 size={32} className="text-green-500" />
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase">Час навчання</p>
                      <p className="text-2xl font-bold text-blue-800">28h</p>
                    </div>
                    <Clock size={32} className="text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'achievements':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ваші досягнення</h3>
            {renderAchievements()}
          </div>
        );
      case 'savedGraphs':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Збережені графи</h3>
            {renderSavedGraphs()}
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Налаштування облікового запису</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Персональна інформація</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Ім'я
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
                        Прізвище
                      </label>
                      <input
                        type="text"
                        id="surname"
                        value={formData.surname}
                        onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Електронна пошта
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Зміна пароля</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Поточний пароль
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        Новий пароль
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Налаштування</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="emailNotifications"
                        type="checkbox"
                        checked={formData.preferences.emailNotifications}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            emailNotifications: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="emailNotifications" className="ml-3 block text-sm font-medium text-gray-700">
                        Отримувати електронні сповіщення
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="darkMode"
                        type="checkbox"
                        checked={formData.preferences.darkMode}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            darkMode: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="darkMode" className="ml-3 block text-sm font-medium text-gray-700">
                        Темний режим
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="saveProgress"
                        type="checkbox"
                        checked={formData.preferences.saveProgress}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            saveProgress: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="saveProgress" className="ml-3 block text-sm font-medium text-gray-700">
                        Зберігати прогрес автоматично
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-5 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Скасувати
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Зберегти зміни
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Видалити профіль
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 text-xl font-bold mr-4">
              {user?.surname?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{`${user?.name || ''} ${user?.surname || ''}`}</h1>
              <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button 
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <LogOut size={16} className="mr-2" />
              Вийти
            </button>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex overflow-x-auto space-x-4 pb-1">
            <button
              onClick={() => setActiveTab('savedGraphs')}
              className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'savedGraphs'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Збережені графи
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'progress'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Прогрес навчання
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'achievements'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Досягнення
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'settings'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Налаштування
            </button>
          </div>
        </div>
      </div>
      
      {renderTabContent()}
    </div>
  );
};

export default UserProfile;