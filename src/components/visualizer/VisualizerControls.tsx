import React from 'react';
import { PlayCircle, PauseCircle, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

interface VisualizerControlsProps {
  onPlay: () => void;
  onStep: () => void;
  onPreviousStep: () => void;
  onReset: () => void;
  isPlaying: boolean;
  canStep: boolean;
  canStepBack: boolean;
}

const VisualizerControls: React.FC<VisualizerControlsProps> = ({
  onPlay,
  onStep,
  onPreviousStep,
  onReset,
  isPlaying,
  canStep,
  canStepBack
}) => {
  return (
    <div className="mt-6 flex justify-center">
      <div className="flex space-x-4">
        <button
          onClick={onReset}
          className="flex items-center justify-center p-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          title="Скинути"
        >
          <RotateCcw size={24} />
        </button>
        <button
          onClick={onPreviousStep}
          className={`flex items-center justify-center p-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
            !canStepBack ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!canStepBack}
          title="Попередній крок"
        >
          <SkipBack size={24} />
        </button>
        <button
          onClick={onPlay}
          className="flex items-center justify-center p-2 border border-purple-600 rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          title={isPlaying ? 'Пауза' : 'Грати'}
        >
          {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
        </button>
        <button
          onClick={onStep}
          className={`flex items-center justify-center p-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
            !canStep ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!canStep}
          title="Наступний крок"
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default VisualizerControls;