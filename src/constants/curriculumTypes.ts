import type { NodeBreakerNodeType } from '@/types';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SimulatorDemoSetupNode {
  type: NodeBreakerNodeType;
  label: string;
  position: { x: number; y: number };
  data?: Record<string, unknown>;
}

export interface SimulatorDemoSetupEdge {
  source: number;
  target: number;
}

export interface SimulatorDemo {
  description: string;
  instruction: string;
  templateId?: string;
  setupNodes?: SimulatorDemoSetupNode[];
  setupEdges?: SimulatorDemoSetupEdge[];
  chaosToInject?: string;
  simulationAutoStart?: boolean;
}

export interface Topic {
  id: string;
  title: string;
  readContent: string;
  simulatorDemo?: SimulatorDemo;
  quizQuestions: QuizQuestion[];
  interviewTip?: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  topics: Topic[];
}
