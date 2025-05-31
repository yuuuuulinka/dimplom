import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Material } from '../types/materials';
import { getMaterials } from '../data/materials';

interface MaterialsContextType {
  materials: Material[];
  isLoading: boolean;
  error: string | null;
  searchMaterials: (query: string) => Material[];
}

const MaterialsContext = createContext<MaterialsContextType>({
  materials: [],
  isLoading: false,
  error: null,
  searchMaterials: () => [],
});

export const useMaterials = () => useContext(MaterialsContext);

interface MaterialsProviderProps {
  children: ReactNode;
}

export const MaterialsProvider: React.FC<MaterialsProviderProps> = ({ children }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        // In a real app, we would fetch data from a backend
        // Simulating API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        const data = getMaterials();
        setMaterials(data);
        setError(null);
      } catch (err) {
        setError('Не вдалося завантажити матеріали');
        console.error('Помилка завантаження матеріалів:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMaterials();
  }, []);
  
  const searchMaterials = (query: string): Material[] => {
    if (!query) return materials;
    
    const lowercaseQuery = query.toLowerCase();
    return materials.filter(material => 
      material.title.toLowerCase().includes(lowercaseQuery) || 
      material.description.toLowerCase().includes(lowercaseQuery) ||
      material.category.toLowerCase().includes(lowercaseQuery)
    );
  };
  
  return (
    <MaterialsContext.Provider
      value={{
        materials,
        isLoading,
        error,
        searchMaterials,
      }}
    >
      {children}
    </MaterialsContext.Provider>
  );
};