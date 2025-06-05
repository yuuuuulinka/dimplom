import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Award, RotateCcw } from 'lucide-react';
import { Test, TestQuestion } from '../../types/practice';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';

interface TestDetailProps {
  test: Test;
  onBack: () => void;
  onTestCompleted?: () => void;
}

const TestDetail: React.FC<TestDetailProps> = ({ test, onBack, onTestCompleted }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(test.estimatedTime * 60); // Convert to seconds
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Reset scroll to top when component mounts or test changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [test.id]);

  useEffect(() => {
    if (!isSubmitted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSubmitted, timeRemaining]);

  const currentQuestion = test.questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    test.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / test.questions.length) * 100);
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);
    setShowResults(true);

    // Record test success if user passed and is authenticated
    if (user && finalScore >= test.passingScore) {
      try {
        const response = await api.tests.recordSuccess(test.id, finalScore, test.passingScore);
        console.log('Test success recorded:', response.message);
        
        // Show success notification
        addNotification({
          type: 'success',
          message: response.created 
            ? 'Вітаємо! Ваш успіх у тесті збережено!' 
            : response.updated 
            ? 'Ваш результат оновлено з кращим результатом!' 
            : 'Тест пройдено успішно!'
        });

        // Call the callback to refresh test stats in parent components
        if (onTestCompleted) {
          onTestCompleted();
        }
      } catch (error) {
        console.error('Failed to record test success:', error);
        addNotification({
          type: 'warning',
          message: 'Тест пройдено, але не вдалося зберегти результат. Спробуйте пізніше.'
        });
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsSubmitted(false);
    setTimeRemaining(test.estimatedTime * 60);
    setShowResults(false);
    setScore(0);
    
    // Scroll to top when restarting the test
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = () => {
    switch (test.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showResults) {
    return (
      <div>
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Назад до практики
          </button>
          
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              score >= test.passingScore ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {score >= test.passingScore ? (
                <CheckCircle size={32} className="text-green-600" />
              ) : (
                <XCircle size={32} className="text-red-600" />
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Тест завершено!</h1>
            <p className="text-lg text-gray-600 mb-4">
              Ви набрали <span className={`font-bold ${score >= test.passingScore ? 'text-green-600' : 'text-red-600'}`}>
                {score}%
              </span> на {test.title}
            </p>
            
            <div className="flex justify-center space-x-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{test.questions.filter(q => answers[q.id] === q.correctAnswer).length}</div>
                <div className="text-sm text-gray-500">Правильно</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{test.questions.length - test.questions.filter(q => answers[q.id] === q.correctAnswer).length}</div>
                <div className="text-sm text-gray-500">Неправильно</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{test.passingScore}%</div>
                <div className="text-sm text-gray-500">Потрібно</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={handleRestart}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RotateCcw size={16} className="mr-2" />
                Повторно пройти тест
              </button>
              <button 
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                Назад до практики
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Переглянути ваші відповіді</h2>
          <div className="space-y-6">
            {test.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={question.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start mb-2">
                    <span className="font-medium text-gray-900 mr-2">Q{index + 1}.</span>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-3">{question.question}</p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div 
                            key={optionIndex} 
                            className={`p-2 rounded-md border ${
                              optionIndex === question.correctAnswer 
                                ? 'bg-green-50 border-green-200' 
                                : optionIndex === userAnswer && !isCorrect
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span>{option}</span>
                              {optionIndex === question.correctAnswer && (
                                <CheckCircle size={16} className="ml-2 text-green-600" />
                              )}
                              {optionIndex === userAnswer && !isCorrect && (
                                <XCircle size={16} className="ml-2 text-red-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Пояснення:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Назад до практики
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
          <div className="mt-2 md:mt-0 flex items-center space-x-3">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor()}`}>
              {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
            </span>
            <span className={`flex items-center text-sm font-medium ${
              timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'
            }`}>
              <Clock size={16} className="mr-1" />
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Завдання {currentQuestionIndex + 1} з {test.questions.length}
          </div>
          <div className="text-sm text-gray-600">
            {Object.keys(answers).length} / {test.questions.length} відповідей
          </div>
        </div>
        
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Завдання {currentQuestionIndex + 1}
          </h2>
          <p className="text-gray-700 text-lg mb-6">{currentQuestion.question}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label 
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuestion.id] === index
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={index}
                  checked={answers[currentQuestion.id] === index}
                  onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${
                  answers[currentQuestion.id] === index
                    ? 'border-purple-500'
                    : 'border-gray-300'
                }`}>
                  {answers[currentQuestion.id] === index && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </div>
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Попереднє
          </button>
          
          <div className="flex space-x-2">
            {currentQuestionIndex === test.questions.length - 1 ? (
              <button 
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== test.questions.length}
                className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Надіслати тест
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Наступне
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetail; 