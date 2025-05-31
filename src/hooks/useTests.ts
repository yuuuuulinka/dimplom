import { useState, useEffect } from 'react';
import { Test } from '../types/practice';
import { getTests } from '../data/tests';

export const useTests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        // In a real app, we would fetch from a backend
        // Simulating API call with timeout
        await new Promise(resolve => setTimeout(resolve, 300));
        const data = getTests();
        setTests(data);
        setError(null);
      } catch (err) {
        setError('Не вдалося завантажити тести');
        console.error('Помилка завантаження тестів:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTests();
  }, []);
  
  const getTestByMaterialId = (materialId: string): Test | undefined => {
    return tests.find(test => test.materialId === materialId);
  };
  
  return { tests, isLoading, error, getTestByMaterialId };
}; 