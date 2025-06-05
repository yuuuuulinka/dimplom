import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Trophy, Users } from 'lucide-react';
import { PracticeProblem, Submission, ValidationResult } from '../../types/practice';
import GraphVisualization from './interactive/GraphVisualization';
import PathInput from './interactive/PathInput';
import DragDropList from './interactive/DragDropList';
import NodeColoringInput from './interactive/NodeColoringInput';
import DistanceInput from './interactive/DistanceInput';
import GraphEditor from './interactive/GraphEditor';

interface InteractiveProblemProps {
  problem: PracticeProblem;
  onSubmit?: (result: ValidationResult) => void;
  disabled?: boolean;
}

const InteractiveProblem: React.FC<InteractiveProblemProps> = ({
  problem,
  onSubmit,
  disabled = false
}) => {
  const [submission, setSubmission] = useState<Partial<Submission>>({});
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleSubmit = async () => {
    if (!problem.validator || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const validationResult = problem.validator(submission as Submission);
      setResult(validationResult);
      
      if (onSubmit) {
        onSubmit(validationResult);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setResult({
        isCorrect: false,
        score: 0,
        feedback: 'Помилка при перевірці відповіді. Спробуйте ще раз.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetProblem = () => {
    setSubmission({});
    setResult(null);
    
    // Scroll to top when resetting the problem
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  const renderInputComponent = () => {
    switch (problem.type) {
      case 'shortest-path':
        if (!problem.config?.graph) return null;
        
        return (
          <div className="space-y-6">
            <GraphVisualization 
              graph={problem.config.graph}
              selectedPath={submission.path || []}
              className="mb-4"
            />
            <PathInput
              availableNodes={problem.config.graph.nodes.map(n => n.label)}
              startNode={problem.config.startNode}
              endNode={problem.config.endNode}
              onPathChange={(path) => setSubmission({ ...submission, path })}
              value={submission.path || []}
              disabled={disabled || result?.isCorrect}
            />
            
            {/* Add distance input for Bellman-Ford problems */}
            {problem.id === 'bellman-ford-negative-weights' && problem.config.startNode && (
              <DistanceInput
                availableNodes={problem.config.graph.nodes.map(n => n.label)}
                startNode={problem.config.startNode}
                value={submission.distances || {}}
                onChange={(distances) => setSubmission({ ...submission, distances })}
                disabled={disabled || result?.isCorrect}
              />
            )}
          </div>
        );

      case 'graph-traversal':
        if (!problem.config?.graph) return null;
        
        return (
          <div className="space-y-6">
            <GraphVisualization 
              graph={problem.config.graph}
              selectedPath={submission.traversalOrder || []}
              className="mb-4"
            />
            <PathInput
              availableNodes={problem.config.graph.nodes.map(n => n.label)}
              startNode={problem.config.startNode}
              onPathChange={(order) => setSubmission({ ...submission, traversalOrder: order })}
              value={submission.traversalOrder || []}
              disabled={disabled || result?.isCorrect}
            />
          </div>
        );

      case 'topological-sort':
        if (!problem.config?.graph) return null;
        
        return (
          <div className="space-y-6">
            <GraphVisualization 
              graph={problem.config.graph}
              selectedPath={submission.traversalOrder || []}
              className="mb-4"
            />
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Топологічне сортування</h3>
              <p className="text-sm text-gray-600 mb-4">
                Розташуйте вершини у такому порядку, щоб для кожного ребра u → v вершина u йшла перед v.
              </p>
              <PathInput
                availableNodes={problem.config.graph.nodes.map(n => n.label)}
                onPathChange={(order) => setSubmission({ ...submission, traversalOrder: order })}
                value={submission.traversalOrder || []}
                disabled={disabled || result?.isCorrect}
              />
            </div>
          </div>
        );

      case 'cycle-detection':
      case 'strongly-connected':
        if (!problem.config?.graph) return null;
        
        return (
          <div className="space-y-6">
            <GraphVisualization 
              graph={problem.config.graph}
              className="mb-4"
            />
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Ваша відповідь</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="answer"
                    value="true"
                    checked={submission.answer === true}
                    onChange={() => setSubmission({ ...submission, answer: true })}
                    disabled={disabled || result?.isCorrect}
                    className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">
                    {problem.type === 'cycle-detection' ? 'Так, граф містить цикл' : 
                     'Так, граф є сильно зв\'язним'}
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="answer"
                    value="false"
                    checked={submission.answer === false}
                    onChange={() => setSubmission({ ...submission, answer: false })}
                    disabled={disabled || result?.isCorrect}
                    className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">
                    {problem.type === 'cycle-detection' ? 'Ні, граф не містить циклу' : 
                     'Ні, граф не є сильно зв\'язним'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'bipartite-check':
        if (!problem.config?.graph) return null;
        
        return (
          <div className="space-y-6">
            <NodeColoringInput
              graph={problem.config.graph}
              value={submission.nodeColors || {}}
              onChange={(colors) => setSubmission({ ...submission, nodeColors: colors })}
            />
          </div>
        );

      case 'minimum-spanning-tree':
        if (!problem.config?.graph) return null;
        
        return (
          <div className="space-y-6">
            <GraphVisualization 
              graph={problem.config.graph}
              highlightedEdges={submission.mstEdges?.map(edge => ({
                source: problem.config.graph!.nodes.find(n => n.label === edge.source)?.id || 0,
                target: problem.config.graph!.nodes.find(n => n.label === edge.target)?.id || 0
              })) || []}
              className="mb-4"
            />
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Оберіть ребра для мінімального кісткового дерева</h3>
              <div className="space-y-3">
                {problem.config.graph.edges.map((edge, index) => {
                  const sourceLabel = problem.config.graph!.nodes.find(n => n.id === edge.source)?.label || '';
                  const targetLabel = problem.config.graph!.nodes.find(n => n.id === edge.target)?.label || '';
                  const isSelected = submission.mstEdges?.some(mstEdge => 
                    (mstEdge.source === sourceLabel && mstEdge.target === targetLabel) ||
                    (mstEdge.source === targetLabel && mstEdge.target === sourceLabel)
                  ) || false;
                  
                  return (
                    <label key={index} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentMstEdges = submission.mstEdges || [];
                          if (e.target.checked) {
                            const newEdge = {
                              source: sourceLabel,
                              target: targetLabel,
                              weight: edge.weight || 1
                            };
                            setSubmission({ 
                              ...submission, 
                              mstEdges: [...currentMstEdges, newEdge]
                            });
                          } else {
                            const filteredEdges = currentMstEdges.filter(mstEdge =>
                              !((mstEdge.source === sourceLabel && mstEdge.target === targetLabel) ||
                                (mstEdge.source === targetLabel && mstEdge.target === sourceLabel))
                            );
                            setSubmission({ 
                              ...submission, 
                              mstEdges: filteredEdges
                            });
                          }
                        }}
                        disabled={disabled || result?.isCorrect}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-700">
                        {sourceLabel} ↔ {targetLabel} (вага: {edge.weight || 1})
                      </span>
                    </label>
                  );
                })}
              </div>
              {submission.mstEdges && submission.mstEdges.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-medium text-blue-900">Обрані ребра:</h4>
                  <div className="text-sm text-blue-800 mt-1">
                    {submission.mstEdges.map((edge, index) => (
                      <span key={index}>
                        {edge.source}↔{edge.target}({edge.weight})
                        {index < submission.mstEdges!.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-blue-700 mt-2">
                    Загальна вага: {submission.mstEdges.reduce((sum, edge) => sum + edge.weight, 0)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'multiple-choice':
        if (!problem.config?.options) return null;
        
        return (
          <div className="space-y-6">
            {/* Show question if available */}
            {problem.config.question && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">?</span>
                  </div>
                  <h3 className="text-xl font-bold text-blue-900">Питання</h3>
                </div>
                <p className="text-lg font-medium text-blue-800 pl-11">{problem.config.question}</p>
              </div>
            )}

            {/* Show graph examples if available */}
            {problem.config.graphExamples && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-6">🔍 Приклади різних типів графів:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {problem.config.graphExamples.map((example, index) => (
                    <div key={index} className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:border-blue-300 transition-colors">
                      <h5 className="font-semibold text-lg text-center mb-4 text-gray-800">
                        {example.title}
                      </h5>
                      <div className="h-48 mb-4 bg-gray-50 rounded-lg p-2">
                        <GraphVisualization 
                          graph={example.graph}
                          className="w-full h-full"
                          hideControls={true}
                        />
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800 mb-1">
                          {example.type === 'complete' && '🔗 Всі вершини з\'єднані між собою'}
                          {example.type === 'tree' && '🌳 Ациклічний граф (без циклів)'}
                          {example.type === 'regular' && '⚖️ Всі вершини мають однаковий степінь'}
                          {example.type === 'bipartite' && '🎨 Можна розфарбувати двома кольорами'}
                        </div>
                        <div className="text-xs text-blue-600">
                          {example.type === 'complete' && 'Для 4 вершин: 6 ребер'}
                          {example.type === 'tree' && '3 ребра для 4 вершин'}
                          {example.type === 'regular' && 'Кожна вершина має степінь 2'}
                          {example.type === 'bipartite' && 'Вершини A,B в одній групі, C,D в іншій'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <h6 className="font-semibold text-yellow-800 mb-2">Підказка для розв'язання:</h6>
                      <p className="text-sm text-yellow-700">
                        Уважно розгляньте кожен тип графа та порівняйте їх з означеннями у варіантах відповідей. 
                        У повному графі кожна пара вершин обов'язково з'єднана ребром.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show graph if available (for other multiple choice problems) */}
            {problem.config.graph && !problem.config.graphExamples && (
              <div className="space-y-4">
                <GraphVisualization 
                  graph={problem.config.graph}
                  className="mb-4"
                  selectedPath={problem.id === 'floyd-warshall-matrix' ? ['A', 'B', 'C', 'D'] : undefined}
                />
                
                {/* Add explanation for Floyd-Warshall specifically */}
                {problem.id === 'floyd-warshall-matrix' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Аналіз шляхів від A до D:</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>• Прямий шлях: A → D = 9</div>
                      <div>• Через B: A → B → D = 3 + 5 = 8</div>
                      <div>• Через B та C: A → B → C → D = 3 + 1 + 1 = 5 ⭐</div>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Алгоритм Флойда-Воршалла знаходить найкоротший шлях, перевіряючи всі можливі проміжні вершини.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">
                {problem.config.question ? 'Оберіть правильну відповідь:' : 'Оберіть правильну відповідь'}
              </h3>
              <div className="space-y-4">
                {problem.config.options.map((option, index) => (
                  <label key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200">
                    <input
                      type="radio"
                      name="option"
                      value={index}
                      checked={submission.selectedOption === index}
                      onChange={() => setSubmission({ ...submission, selectedOption: index })}
                      disabled={disabled || result?.isCorrect}
                      className="h-5 w-5 text-purple-600 border-gray-300 focus:ring-purple-500 mt-1 flex-shrink-0"
                    />
                    <span className="text-gray-800 text-base leading-relaxed">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'drag-and-drop':
        if (!problem.config?.items) return null;
        
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            <DragDropList
              items={problem.config.items}
              onOrderChange={(order) => setSubmission({ ...submission, orderedItems: order })}
              disabled={disabled || result?.isCorrect}
              value={submission.orderedItems || []}
            />
          </div>
        );

      case 'graph-construction':
        if (!problem.config?.graph) return null;
        
        return (
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Завдання:</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Створіть сильно зв'язний граф, додавши ребра між вершинами. 
                    Граф буде сильно зв'язним, якщо з кожної вершини можна буде дійти до кожної іншої.
                  </p>
                  <div className="text-xs text-yellow-600">
                    <strong>Підказка:</strong> Найпростіший спосіб - створити цикл через всі вершини: A→B→C→D→E→A
                  </div>
                </div>
              </div>
            </div>
            
            <GraphEditor
              initialNodes={problem.config.graph.nodes}
              value={submission.constructedEdges || []}
              onChange={(edges) => setSubmission({ ...submission, constructedEdges: edges })}
              disabled={disabled || result?.isCorrect}
              directed={problem.config.graph.type === 'directed'}
            />
          </div>
        );

      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Тип завдання "{problem.type}" ще не підтримується.</p>
          </div>
        );
    }
  };

  const canSubmit = () => {
    switch (problem.type) {
      case 'shortest-path':
        const hasPath = submission.path && submission.path.length > 0;
        // For Bellman-Ford, also require distances to be filled
        if (problem.id === 'bellman-ford-negative-weights') {
          const hasDistances = submission.distances && Object.keys(submission.distances).length > 0;
          return hasPath && hasDistances;
        }
        return hasPath;
      case 'graph-traversal':
      case 'topological-sort':
        return submission.traversalOrder && submission.traversalOrder.length > 0;
      case 'cycle-detection':
      case 'strongly-connected':
        return submission.answer !== undefined;
      case 'bipartite-check':
        return submission.nodeColors && Object.keys(submission.nodeColors).length > 0;
      case 'minimum-spanning-tree':
        return submission.mstEdges && submission.mstEdges.length > 0;
      case 'multiple-choice':
        return submission.selectedOption !== undefined;
      case 'drag-and-drop':
        return submission.orderedItems && submission.orderedItems.length > 0;
      case 'graph-construction':
        return submission.constructedEdges && submission.constructedEdges.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Problem header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{problem.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {problem.difficulty === 'easy' ? 'Легко' : 
                 problem.difficulty === 'medium' ? 'Середньо' : 'Складно'}
              </span>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{problem.estimatedTime} хв</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy size={14} />
                <span>{problem.successRate}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={14} />
                <span>{problem.attemptedCount}</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">{problem.description}</p>
        
        {/* Topics */}
        <div className="flex flex-wrap gap-2">
          {problem.topics.map((topic, index) => (
            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Interactive component */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Розв'язання</h2>
        {renderInputComponent()}
        
        {/* Submit button */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting || disabled || result?.isCorrect}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              canSubmit() && !isSubmitting && !disabled && !result?.isCorrect
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Перевірка...' : 'Перевірити'}
          </button>
          
          {result && (
            <button
              onClick={resetProblem}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Спробувати ще раз
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`border rounded-lg p-6 ${
          result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {result.isCorrect ? (
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
            ) : (
              <XCircle className="text-red-600 mt-0.5" size={20} />
            )}
            
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h3 className={`font-semibold ${
                  result.isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.isCorrect ? 'Правильно!' : 'Неправильно'}
                </h3>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.score}/100 балів
                </span>
              </div>
              
              <p className={`text-sm ${
                result.isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.feedback}
              </p>
              
              {result.correctAnswer && !result.isCorrect && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Правильна відповідь:</strong> {
                      typeof result.correctAnswer === 'object' && result.correctAnswer.path && result.correctAnswer.distances ? (
                        <div className="mt-2 space-y-2">
                          <div><strong>Шлях:</strong> {result.correctAnswer.path.join(' → ')}</div>
                          <div><strong>Відстані:</strong> {
                            Object.entries(result.correctAnswer.distances)
                              .map(([node, distance]) => `${node}: ${distance === Infinity ? '∞' : distance}`)
                              .join(', ')
                          }</div>
                        </div>
                      ) : Array.isArray(result.correctAnswer) 
                        ? result.correctAnswer.join(' → ')
                        : result.correctAnswer.toString()
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hint and examples */}
      <div className="space-y-4">
        {problem.hint && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Підказка</h3>
            <p className="text-blue-800 text-sm">{problem.hint}</p>
          </div>
        )}
        
        {problem.examples && problem.examples.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">📝 Приклади</h3>
            {problem.examples.map((example, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700">Вхід:</strong>
                    <p className="text-gray-600 mt-1">{example.input}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Вихід:</strong>
                    <p className="text-gray-600 mt-1">{example.output}</p>
                  </div>
                </div>
                {example.explanation && (
                  <div className="mt-2">
                    <strong className="text-gray-700 text-sm">Пояснення:</strong>
                    <p className="text-gray-600 text-sm mt-1">{example.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveProblem;