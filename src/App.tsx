import React, { useState, useEffect } from 'react';
import { LayoutGrid, Home, BookOpen, Code, AlignJustify, UserCircle, X } from 'lucide-react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import HomePage from './components/home/HomePage';
import LearningMaterials from './components/learning/LearningMaterials';
import AlgorithmVisualizer from './components/visualizer/AlgorithmVisualizer';
import GraphEditor from './components/editor/GraphEditor';
import Practice from './components/practice/Practice';
import UserProfile from './components/profile/UserProfile';
import AuthModal from './components/auth/AuthModal';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';
import { MaterialsProvider } from './context/MaterialsContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [preselectedAlgorithm, setPreselectedAlgorithm] = useState<string>('');
  const [graphToEdit, setGraphToEdit] = useState<any>(null);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo(0, 0);
    // Clear graph data when leaving editor
    if (activeSection !== 'editor') {
      setGraphToEdit(null);
    }
  }, [activeSection]);

  // Check for URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const algorithmParam = urlParams.get('algorithm');
    const sectionParam = urlParams.get('section');
    
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
    
    if (algorithmParam) {
      setPreselectedAlgorithm(algorithmParam);
      setActiveSection('visualizer');
      // Clear URL parameters after processing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleNavigateToVisualizer = (algorithmId?: string) => {
    if (algorithmId) {
      setPreselectedAlgorithm(algorithmId);
    }
    setActiveSection('visualizer');
  };

  const handleNavigateToEditor = (savedGraphId?: string, graphData?: any) => {
    if (graphData) {
      setGraphToEdit(graphData);
      // Also set in localStorage as backup
      localStorage.setItem('graphToLoad', JSON.stringify(graphData));
    }
    setActiveSection('editor');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage onNavigate={setActiveSection} />;
      case 'learning':
        return <LearningMaterials />;
      case 'visualizer':
        return <AlgorithmVisualizer preselectedAlgorithm={preselectedAlgorithm} onAlgorithmChange={setPreselectedAlgorithm} />;
      case 'editor':
        return <GraphEditor onNavigateToVisualizer={handleNavigateToVisualizer} initialGraph={graphToEdit} />;
      case 'practice':
        return <Practice />;
      case 'profile':
        return <UserProfile onLoginClick={() => setShowAuthModal(true)} onNavigateToEditor={handleNavigateToEditor} />;
      default:
        return <HomePage onNavigate={setActiveSection} />;
    }
  };

  const navigationItems = [
    { id: 'home', label: 'Головна', icon: <Home size={20} /> },
    { id: 'learning', label: 'Навчальні матеріали', icon: <BookOpen size={20} /> },
    { id: 'visualizer', label: 'Візуалізатор алгоритмів', icon: <Code size={20} /> },
    { id: 'editor', label: 'Редактор графів', icon: <LayoutGrid size={20} /> },
    { id: 'practice', label: 'Практика', icon: <BookOpen size={20} /> },
  ];

  return (
    <AuthProvider>
      <MaterialsProvider>
        <NotificationProvider>
          <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
            <Header 
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)} 
              onLoginClick={() => setShowAuthModal(true)}
            />
            
            <div className="flex flex-1">
              {/* Mobile Menu Overlay */}
              {showMobileMenu && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
                     onClick={() => setShowMobileMenu(false)}>
                </div>
              )}
              
              {/* Mobile Sidebar */}
              <div className={`fixed inset-y-0 left-0 transform ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} 
                              w-64 bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out lg:hidden`}>
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold text-purple-800">GraphLearn</h2>
                  <button onClick={() => setShowMobileMenu(false)}>
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <nav className="p-4">
                  <ul className="space-y-2">
                    {navigationItems.map((item) => (
                      <li key={item.id}>
                        <button 
                          onClick={() => {
                            setActiveSection(item.id);
                            setShowMobileMenu(false);
                          }}
                          className={`w-full flex items-center p-2 rounded-lg ${
                            activeSection === item.id 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {item.icon}
                          <span className="ml-3">{item.label}</span>
                        </button>
                      </li>
                    ))}
                    <li>
                      <button 
                        onClick={() => {
                          setActiveSection('profile');
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center p-2 rounded-lg ${
                          activeSection === 'profile' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <UserCircle size={20} />
                        <span className="ml-3">Профіль</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
              
              {/* Desktop Sidebar */}
              <Sidebar 
                navigationItems={navigationItems} 
                activeSection={activeSection} 
                onNavigate={setActiveSection} 
              />
              
              {/* Main Content */}
              <main className="flex-1 p-4 lg:p-6 lg:ml-64 pb-6">
                {renderSection()}
              </main>
            </div>
            
            <Footer />
            
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
          </div>
        </NotificationProvider>
      </MaterialsProvider>
    </AuthProvider>
  );
}

export default App;