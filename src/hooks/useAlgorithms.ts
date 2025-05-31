import { useState, useCallback } from 'react';
import { Algorithm, AlgorithmStep } from '../types/algorithms';
import { GraphType } from '../types/graph';
import { getAlgorithms, getAlgorithmSteps, getAlgorithmsForGraphType } from '../data/algorithms';

interface AlgorithmParams {
  startVertex?: string;
  customGraph?: any;
}

export const useAlgorithms = () => {
  const [algorithms] = useState<Algorithm[]>(getAlgorithms());
  
  const executeAlgorithm = useCallback((algorithmId: string, params?: AlgorithmParams) => {
    // In a real app, we might execute the algorithm on the current graph
    // Here we just return pre-computed steps for the algorithm
    return {
      steps: getAlgorithmSteps(algorithmId, params?.startVertex, params?.customGraph)
    };
  }, []);
  
  const getFilteredAlgorithms = useCallback((graphType: GraphType): Algorithm[] => {
    return getAlgorithmsForGraphType(graphType);
  }, []);
  
  return {
    algorithms,
    executeAlgorithm,
    getFilteredAlgorithms
  };
};