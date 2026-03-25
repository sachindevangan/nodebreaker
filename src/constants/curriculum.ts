import { CHAPTER_1_TOPICS } from '@/constants/content/chapter1';
import { CHAPTER_2_TOPICS } from '@/constants/content/chapter2';
import { CHAPTER_3_TOPICS } from '@/constants/content/chapter3';
import { CHAPTER_4_TOPICS } from '@/constants/content/chapter4';
import { CHAPTER_5_TOPICS } from '@/constants/content/chapter5';
import { CHAPTER_6_TOPICS } from '@/constants/content/chapter6';
import { CHAPTER_7_TOPICS } from '@/constants/content/chapter7';
import { CHAPTER_8_TOPICS } from '@/constants/content/chapter8';
import { CHAPTER_9_TOPICS } from '@/constants/content/chapter9';
import { CHAPTER_10_TOPICS } from '@/constants/content/chapter10';
import { CHAPTER_11_TOPICS } from '@/constants/content/chapter11';
import { CHAPTER_12_TOPICS } from '@/constants/content/chapter12';
import { CHAPTER_13_TOPICS } from '@/constants/content/chapter13';
import type { Chapter, QuizQuestion, Topic } from '@/constants/curriculumTypes';

export type {
  Chapter,
  QuizQuestion,
  SimulatorDemo,
  SimulatorDemoSetupEdge,
  SimulatorDemoSetupNode,
  Topic,
} from '@/constants/curriculumTypes';

function topic(
  partial: Omit<Topic, 'readContent' | 'quizQuestions'> & { readContent?: string; quizQuestions?: QuizQuestion[] }
): Topic {
  return {
    readContent: partial.readContent ?? `Content coming soon. This topic covers ${partial.title}.`,
    quizQuestions: partial.quizQuestions ?? [],
    id: partial.id,
    title: partial.title,
    simulatorDemo: partial.simulatorDemo,
    interviewTip: partial.interviewTip,
  };
}

function ch(
  number: number,
  id: string,
  title: string,
  description: string,
  icon: string,
  color: string,
  topics: Topic[]
): Chapter {
  return { id, number, title, description, icon, color, topics };
}

export const CURRICULUM: Chapter[] = [
  ch(1, 'chapter-1', 'How The Internet Works', 'Packets, protocols, and how requests cross the wire.', 'Globe', '#3b82f6', CHAPTER_1_TOPICS),
  ch(
    2,
    'chapter-2',
    'Servers & Computing',
    'How machines run your code and handle load.',
    'Server',
    '#6366f1',
    CHAPTER_2_TOPICS
  ),
  ch(3, 'chapter-3', 'The Three Numbers', 'Throughput, latency, and capacity intuition.', 'Gauge', '#f59e0b', CHAPTER_3_TOPICS),
  ch(
    4,
    'chapter-4',
    'Databases Deep Dive',
    'Storage engines, consistency, and query paths.',
    'Database',
    '#a855f7',
    CHAPTER_4_TOPICS
  ),
  ch(5, 'chapter-5', 'Caching', 'Speed layers, eviction, and cache pitfalls.', 'Zap', '#eab308', CHAPTER_5_TOPICS),
  ch(
    6,
    'chapter-6',
    'Load Balancing & Traffic',
    'Spreading work and staying healthy under load.',
    'GitBranch',
    '#06b6d4',
    CHAPTER_6_TOPICS
  ),
  ch(7, 'chapter-7', 'Scaling Strategies', 'Growing systems without losing control.', 'TrendingUp', '#22c55e', CHAPTER_7_TOPICS),
  ch(8, 'chapter-8', 'Reliability & Failure', 'Designing for faults and recovery.', 'ShieldAlert', '#ef4444', CHAPTER_8_TOPICS),
  ch(9, 'chapter-9', 'Async Processing & Messaging', 'Queues, events, and loose coupling.', 'ListOrdered', '#f97316', CHAPTER_9_TOPICS),
  ch(10, 'chapter-10', 'Networking & Communication', 'How services talk to each other.', 'Network', '#0ea5e9', CHAPTER_10_TOPICS),
  ch(11, 'chapter-11', 'Security', 'Identity, boundaries, and safe defaults.', 'Lock', '#f59e0b', CHAPTER_11_TOPICS),
  ch(12, 'chapter-12', 'Monitoring & Observability', 'See what your system is doing in production.', 'BarChart3', '#8b5cf6', CHAPTER_12_TOPICS),
  ch(13, 'chapter-13', 'Data Processing & Storage', 'Pipelines, warehouses, and large-scale data.', 'HardDrive', '#0ea5e9', CHAPTER_13_TOPICS),
  ch(14, 'chapter-14', 'Architecture Patterns', 'Shapes that show up in real systems.', 'Blocks', '#ec4899', [
    topic({ id: 'monolith-vs-microservices', title: 'Monolith vs Microservices' }),
    topic({ id: 'api-gateway-pattern', title: 'API Gateway Pattern' }),
    topic({ id: 'service-mesh', title: 'Service Mesh' }),
    topic({ id: 'cqrs', title: 'CQRS' }),
    topic({ id: 'event-sourcing', title: 'Event Sourcing' }),
    topic({ id: 'saga-pattern', title: 'Saga Pattern' }),
    topic({ id: 'strangler-fig-migration', title: 'Strangler Fig Migration' }),
    topic({ id: 'domain-driven-design', title: 'Domain-Driven Design' }),
  ]),
  ch(15, 'chapter-15', 'The Interview Framework', 'How to run a system design interview.', 'Target', '#6366f1', [
    topic({ id: 'clarify-requirements', title: 'Clarify Requirements' }),
    topic({ id: 'back-of-envelope-estimation-framework', title: 'Back-of-the-Envelope Estimation Framework' }),
    topic({ id: 'high-level-design', title: 'High-Level Design' }),
    topic({ id: 'deep-dive', title: 'Deep Dive' }),
    topic({ id: 'trade-offs-and-bottlenecks', title: 'Trade-offs & Bottlenecks' }),
    topic({ id: 'common-mistakes', title: 'Common Mistakes' }),
  ]),
  ch(16, 'chapter-16', 'Real-World System Designs', 'End-to-end design exercises.', 'Rocket', '#dc2626', [
    topic({ id: 'design-url-shortener', title: 'Design a URL Shortener' }),
    topic({ id: 'design-chat-app', title: 'Design a Chat App' }),
    topic({ id: 'design-social-feed', title: 'Design a Social Feed' }),
    topic({ id: 'design-payment-system', title: 'Design a Payment System' }),
    topic({ id: 'design-video-platform', title: 'Design a Video Platform' }),
    topic({ id: 'design-ride-sharing', title: 'Design Ride Sharing' }),
    topic({ id: 'design-search-engine', title: 'Design a Search Engine' }),
    topic({ id: 'design-file-storage', title: 'Design File Storage' }),
    topic({ id: 'design-notification-system', title: 'Design a Notification System' }),
    topic({ id: 'design-rate-limiter', title: 'Design a Rate Limiter' }),
  ]),
];

export const CURRICULUM_TOPIC_COUNT = CURRICULUM.reduce((n, c) => n + c.topics.length, 0);

export const CURRICULUM_TOPIC_MAP: Map<string, { chapter: Chapter; topic: Topic; topicIndex: number }> = new Map();
for (const chapter of CURRICULUM) {
  chapter.topics.forEach((topicItem, topicIndex) => {
    CURRICULUM_TOPIC_MAP.set(topicItem.id, { chapter, topic: topicItem, topicIndex });
  });
}

export function getChapterByTopicId(topicId: string): Chapter | undefined {
  return CURRICULUM_TOPIC_MAP.get(topicId)?.chapter;
}

export function getTopicContext(topicId: string): { chapter: Chapter; topic: Topic; topicIndex: number } | undefined {
  return CURRICULUM_TOPIC_MAP.get(topicId);
}

export interface TopicNavEntry {
  chapter: Chapter;
  topic: Topic;
  topicIndexInChapter: number;
}

export function getTopicNavList(): TopicNavEntry[] {
  return CURRICULUM.flatMap((chapter) =>
    chapter.topics.map((topicItem, topicIndexInChapter) => ({
      chapter,
      topic: topicItem,
      topicIndexInChapter,
    }))
  );
}

export function getPrevNextTopic(topicId: string): { prev: TopicNavEntry | null; next: TopicNavEntry | null } {
  const list = getTopicNavList();
  const idx = list.findIndex((e) => e.topic.id === topicId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? list[idx - 1]! : null,
    next: idx < list.length - 1 ? list[idx + 1]! : null,
  };
}
