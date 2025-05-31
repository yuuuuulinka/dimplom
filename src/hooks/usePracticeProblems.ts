import { useState, useEffect } from 'react';
import { PracticeProblem } from '../types/practice';
import { getProblems } from '../data/practice';

export const usePracticeProblems = () => {
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        // In a real app, we would fetch from a backend
        // Simulating API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        const data = getProblems();
        setProblems(data);
        setError(null);
      } catch (err) {
        setError('Не вдалося завантажити практичні задачі');
        console.error('Помилка завантаження практичних задач:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProblems();
  }, []);
  
  return { problems, isLoading, error };
};