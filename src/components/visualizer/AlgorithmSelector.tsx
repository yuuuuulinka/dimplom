import React from 'react';
import { Algorithm } from '../../types/algorithms';

interface AlgorithmSelectorProps {
  algorithms: Algorithm[];
  selectedAlgorithm: string;
  onSelect: (algorithmId: string) => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({ 
  algorithms, 
  selectedAlgorithm, 
  onSelect 
}) => {
  return (
    <div>
      <label htmlFor="algorithm-select" className="block text-sm font-medium text-gray-700 mb-1">
        Виберіть алгоритм
      </label>
      <select
        id="algorithm-select"
        value={selectedAlgorithm}
        onChange={(e) => onSelect(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
      >
        <option value="">Виберіть алгоритм</option>
        {algorithms.map((algorithm) => (
          <option key={algorithm.id} value={algorithm.id}>
            {algorithm.name}
          </option>
        ))}
      </select>
      
      {selectedAlgorithm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">
            {algorithms.find(a => a.id === selectedAlgorithm)?.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {algorithms.find(a => a.id === selectedAlgorithm)?.description}
          </p>
          <div className="text-xs text-gray-500">
            <span className="font-medium">Складність часу:</span> {algorithms.find(a => a.id === selectedAlgorithm)?.timeComplexity}
            <span className="mx-2">•</span>
            <span className="font-medium">Складність простору:</span> {algorithms.find(a => a.id === selectedAlgorithm)?.spaceComplexity}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmSelector;