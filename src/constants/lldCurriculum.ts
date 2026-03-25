import type { QuizQuestion } from '@/constants/curriculumTypes';
import type { CodeExample, LLDChapter, LLDTopic, PracticeExercise, UMLDiagram } from './lldTypes';
import { CHAPTER_L1_TOPICS } from './lld-content/chapterL1';
import { CHAPTER_L2_TOPICS } from './lld-content/chapterL2';

export const LLD_TOPIC_COUNT = 47;

function placeholderRead(title: string): string {
  return `Content coming soon. This topic covers ${title}.`;
}

function placeholderQuiz(): QuizQuestion[] {
  return [];
}

function placeholderCodeExamples(): CodeExample[] {
  return [];
}

function placeholderDiagrams(): UMLDiagram[] {
  return [];
}

function placeholderExercises(): PracticeExercise[] {
  return [];
}

const mkTopic = (opts: {
  id: string;
  title: string;
  connectedHLDTopics?: string[];
}): LLDTopic => {
  const { id, title, connectedHLDTopics = [] } = opts;
  return {
    id,
    title,
    readContent: placeholderRead(title),
    codeExamples: placeholderCodeExamples(),
    diagrams: placeholderDiagrams(),
    exercises: placeholderExercises(),
    quizQuestions: placeholderQuiz(),
    interviewTip: 'Interview tip coming soon.',
    connectedHLDTopics,
  };
};

const mkChapter = (opts: {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  part: 'foundations' | 'problems';
  topics: LLDTopic[];
}): LLDChapter => opts;

export const LLD_CURRICULUM: LLDChapter[] = [
  mkChapter({
    id: 'L1',
    number: 1,
    title: 'Java OOP for LLD',
    description: 'Master the Java building blocks you need for every LLD interview',
    icon: 'Coffee',
    color: '#f97316',
    part: 'foundations',
    topics: CHAPTER_L1_TOPICS,
  }),
  mkChapter({
    id: 'L2',
    number: 2,
    title: 'SOLID Principles',
    description: 'The five principles that separate good design from bad design',
    icon: 'Shield',
    color: '#22c55e',
    part: 'foundations',
    topics: CHAPTER_L2_TOPICS,
  }),
  mkChapter({
    id: 'L3',
    number: 3,
    title: 'Creational Patterns',
    description: 'Patterns for creating objects the right way',
    icon: 'Hammer',
    color: '#3b82f6',
    part: 'foundations',
    topics: [
      mkTopic({ id: 'factory-method', title: 'Factory Method Pattern' }),
      mkTopic({ id: 'abstract-factory', title: 'Abstract Factory Pattern' }),
      mkTopic({ id: 'builder-pattern', title: 'Builder Pattern' }),
      mkTopic({ id: 'singleton-pattern', title: 'Singleton Pattern (and Its Problems)' }),
      mkTopic({ id: 'prototype-pattern', title: 'Prototype Pattern' }),
    ],
  }),
  mkChapter({
    id: 'L4',
    number: 4,
    title: 'Structural Patterns',
    description: 'Patterns for organizing classes and objects',
    icon: 'Layers',
    color: '#8b5cf6',
    part: 'foundations',
    topics: [
      mkTopic({ id: 'adapter-pattern', title: 'Adapter Pattern' }),
      mkTopic({ id: 'decorator-pattern', title: 'Decorator Pattern' }),
      mkTopic({ id: 'facade-pattern', title: 'Facade Pattern' }),
      mkTopic({ id: 'proxy-pattern', title: 'Proxy Pattern' }),
      mkTopic({ id: 'composite-pattern', title: 'Composite Pattern' }),
    ],
  }),
  mkChapter({
    id: 'L5',
    number: 5,
    title: 'Behavioral Patterns',
    description: 'Patterns for communication between objects',
    icon: 'Workflow',
    color: '#ec4899',
    part: 'foundations',
    topics: [
      mkTopic({ id: 'strategy-pattern', title: 'Strategy Pattern' }),
      mkTopic({ id: 'observer-pattern', title: 'Observer Pattern' }),
      mkTopic({ id: 'state-pattern', title: 'State Pattern' }),
      mkTopic({ id: 'command-pattern', title: 'Command Pattern' }),
      mkTopic({ id: 'chain-of-responsibility', title: 'Chain of Responsibility Pattern' }),
      mkTopic({ id: 'template-method', title: 'Template Method Pattern' }),
    ],
  }),
  mkChapter({
    id: 'L6',
    number: 6,
    title: 'Design Principles in Practice',
    description: 'Putting it all together — principles that guide real design decisions',
    icon: 'Lightbulb',
    color: '#eab308',
    part: 'foundations',
    topics: [
      mkTopic({ id: 'composition-over-inheritance', title: 'Composition over Inheritance' }),
      mkTopic({ id: 'program-to-interfaces', title: 'Program to Interfaces, Not Implementations' }),
      mkTopic({ id: 'dry-kiss-yagni', title: 'DRY, KISS, YAGNI in Real Code' }),
      mkTopic({ id: 'code-smells-refactoring', title: 'Code Smells and Refactoring' }),
    ],
  }),
  mkChapter({
    id: 'L7',
    number: 7,
    title: 'LLD Problems — Easy',
    description: 'Start here — fundamental OOP design problems',
    icon: 'Target',
    color: '#22c55e',
    part: 'problems',
    topics: [
      mkTopic({ id: 'design-parking-lot', title: 'Design a Parking Lot' }),
      mkTopic({ id: 'design-tic-tac-toe', title: 'Design Tic-Tac-Toe' }),
      mkTopic({ id: 'design-vending-machine', title: 'Design a Vending Machine' }),
      mkTopic({ id: 'design-library-management', title: 'Design a Library Management System' }),
      mkTopic({ id: 'design-stack-overflow', title: 'Design Stack Overflow (Simplified)' }),
    ],
  }),
  mkChapter({
    id: 'L8',
    number: 8,
    title: 'LLD Problems — Medium',
    description: 'Real interview problems — these come up frequently',
    icon: 'Target',
    color: '#f59e0b',
    part: 'problems',
    topics: [
      mkTopic({ id: 'design-lru-cache', title: 'Design an LRU Cache' }),
      mkTopic({ id: 'design-rate-limiter-lld', title: 'Design a Rate Limiter' }),
      mkTopic({ id: 'design-elevator-system', title: 'Design an Elevator System' }),
      mkTopic({ id: 'design-logger-framework', title: 'Design a Logger Framework' }),
      mkTopic({ id: 'design-task-scheduler', title: 'Design a Task Scheduler' }),
    ],
  }),
  mkChapter({
    id: 'L9',
    number: 9,
    title: 'LLD Problems — Hard',
    description: 'Advanced problems that test deep design thinking',
    icon: 'Target',
    color: '#ef4444',
    part: 'problems',
    topics: [
      mkTopic({ id: 'design-pub-sub-system', title: 'Design a Pub/Sub System' }),
      mkTopic({ id: 'design-url-shortener-lld', title: 'Design a URL Shortener Service' }),
      mkTopic({ id: 'design-online-auction', title: 'Design an Online Auction System' }),
      mkTopic({ id: 'design-notification-service-lld', title: 'Design a Notification Service' }),
      mkTopic({
        id: 'design-ride-sharing-pricing',
        title: 'Design a Ride-Sharing Pricing Engine',
      }),
    ],
  }),
];

export interface LLDTopicNavEntry {
  chapter: LLDChapter;
  topic: LLDTopic;
  topicIndexInChapter: number;
}

export const LLD_CURRICULUM_TOPIC_MAP: Map<string, { chapter: LLDChapter; topic: LLDTopic; topicIndex: number }> = new Map();

for (const chapter of LLD_CURRICULUM) {
  for (const [topicIndex, topic] of chapter.topics.entries()) {
    LLD_CURRICULUM_TOPIC_MAP.set(topic.id, { chapter, topic, topicIndex });
  }
}

export function getLLDTopicContext(topicId: string): { chapter: LLDChapter; topic: LLDTopic; topicIndex: number } | undefined {
  return LLD_CURRICULUM_TOPIC_MAP.get(topicId);
}

export function getLLDChapterById(chapterId: string): LLDChapter | undefined {
  return LLD_CURRICULUM.find((c) => c.id === chapterId);
}

export function getLLDTopicNavList(): LLDTopicNavEntry[] {
  const out: LLDTopicNavEntry[] = [];
  for (const chapter of LLD_CURRICULUM) {
    chapter.topics.forEach((topic, topicIndexInChapter) => {
      out.push({ chapter, topic, topicIndexInChapter });
    });
  }
  return out;
}

