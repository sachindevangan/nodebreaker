import type { QuizQuestion } from '@/constants/curriculumTypes';

export interface CodeExample {
  id: string;
  title: string; // e.g. "Bad: God Class" or "Good: Single Responsibility"
  language: string; // always "java"
  code: string;
  explanation: string;
  highlightLines?: number[];
  isGood: boolean;
}

export interface UMLDiagram {
  id: string;
  title: string;
  type: string; // "class" | "sequence"
  mermaidCode: string;
}

export interface PracticeExercise {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  requirements: string[];
  starterCode: string;
  testCases: string[];
  hints: string[]; // 3 progressive hints
  solution: string;
  solutionExplanation: string;
  designPrinciples: string[];
  connectedHLDTopic: string | null; // HLD topic id if connected
}

export interface LLDTopic {
  id: string;
  title: string;
  readContent: string; // markdown
  codeExamples: CodeExample[];
  diagrams: UMLDiagram[];
  exercises: PracticeExercise[];
  quizQuestions: QuizQuestion[];
  interviewTip: string;
  connectedHLDTopics: string[];
}

export interface LLDChapter {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string; // lucide icon name
  color: string;
  topics: LLDTopic[];
  part: 'foundations' | 'problems';
}

