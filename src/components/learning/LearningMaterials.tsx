import React, { useState } from 'react';
import { Search, BookOpen, Filter, Clock } from 'lucide-react';
import { useMaterials } from '../../context/MaterialsContext';
import { useTests } from '../../hooks/useTests';
import MaterialCard from './MaterialCard';
import MaterialDetail from './MaterialDetail';
import { Material } from '../../types/materials';
import { Test } from '../../types/practice';
import TestDetail from '../practice/TestDetail';

const LearningMaterials: React.FC = () => {
  const { materials, isLoading, error } = useMaterials();
  const { getTestByMaterialId } = useTests();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  
  const categories = [
    { id: 'all', name: 'Всі матеріали' },
    { id: 'basics', name: 'Основи' },
    { id: 'algorithms', name: 'Алгоритми' },
    { id: 'applications', name: 'Застосування' },
    { id: 'advanced', name: 'Додаткові теми' },
  ];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleTakeTest = (testId: string) => {
    const test = getTestByMaterialId(selectedMaterial?.id || '');
    if (test) {
      setSelectedTest(test);
      setSelectedMaterial(null);
    }
  };

  if (selectedTest) {
    return (
      <TestDetail 
        test={selectedTest} 
        onBack={() => {
          setSelectedTest(null);
          // Scroll to top when returning to materials list
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
        }} 
      />
    );
  }

  if (selectedMaterial) {
    return (
      <MaterialDetail 
        material={selectedMaterial} 
        onBack={() => {
          setSelectedMaterial(null);
          // Scroll to top when returning to materials list
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
        }}
        onTakeTest={handleTakeTest}
      />
    );
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Матеріали для навчання</h1>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative rounded-md flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Пошук матеріалів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          
          <div className="relative inline-block w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={20} className="text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              <p className="text-sm text-red-700">Помилка завантаження матеріалів. Будь ласка, спробуйте пізніше.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {filteredMaterials.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Матеріали не знайдені</h3>
              <p className="text-gray-600">
                Ми не знайшли жодного матеріалу, що відповідає вашому запиту. Спробуйте використовувати різні ключові слова або перегляньте наші категорії.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {searchTerm ? `Результати пошуку для "${searchTerm}"` : 'Всі матеріали'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map(material => (
                  <MaterialCard 
                    key={material.id} 
                    material={material} 
                    onClick={() => {
                      setSelectedMaterial(material);
                      // Scroll to top when selecting a material
                      window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth'
                      });
                    }} 
                  />
                ))}
              </div>
              
              <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Clock size={20} className="mr-2 text-purple-600" />
                  Нещодавно переглянуті
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredMaterials.slice(0, 3).map(material => (
                    <div 
                      key={material.id} 
                      className="border border-gray-200 rounded-md p-4 hover:border-purple-300 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedMaterial(material);
                        // Scroll to top when selecting a material
                        window.scrollTo({
                          top: 0,
                          left: 0,
                          behavior: 'smooth'
                        });
                      }}
                    >
                      <h4 className="font-medium text-gray-900">{material.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{material.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LearningMaterials;