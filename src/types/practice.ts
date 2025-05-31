export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface RelatedProblem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
}

export interface PracticeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  examples?: Example[];
  constraints?: string[];
  hint?: string;
  solution?: string;
  completed?: boolean;
  estimatedTime: number;
  successRate: number;
  attemptedCount: number;
  averageTime: number;
  relatedProblems?: RelatedProblem[];
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  materialId?: string; // linked material
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  questions: TestQuestion[];
  passingScore: number; // percentage required to pass
  completed?: boolean;
  score?: number;
  attempts?: number;
}