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

function topic(partial: Omit<Topic, 'readContent' | 'quizQuestions'> & { readContent?: string; quizQuestions?: QuizQuestion[] }): Topic {
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
  ch(1, 'chapter-1', 'How The Internet Works', 'Packets, protocols, and how requests cross the wire.', 'Globe', '#3b82f6', [
    topic({ id: 'what-happens-when-you-type-a-url', title: 'What Happens When You Type a URL?' }),
    topic({ id: 'http-https-request-response', title: 'HTTP, HTTPS & Request/Response' }),
    topic({ id: 'dns-the-internets-phone-book', title: "DNS: The Internet's Phone Book" }),
    topic({ id: 'tcp-ip-and-udp', title: 'TCP/IP and UDP' }),
    topic({ id: 'rest-apis', title: 'REST APIs' }),
    topic({ id: 'websockets-real-time-communication', title: 'WebSockets & Real-Time Communication' }),
  ]),
  ch(2, 'chapter-2', 'Servers & Computing', 'How machines run your code and handle load.', 'Server', '#6366f1', [
    topic({ id: 'what-is-a-server', title: 'What Is a Server?' }),
    topic({ id: 'how-a-server-processes-requests', title: 'How a Server Processes Requests' }),
    topic({ id: 'threads-processes-concurrency', title: 'Threads, Processes & Concurrency' }),
    topic({ id: 'thread-pools-connection-handling', title: 'Thread Pools & Connection Handling' }),
    topic({ id: 'stateless-vs-stateful', title: 'Stateless vs Stateful' }),
    topic({ id: 'serverless-lambda', title: 'Serverless & Lambda' }),
    topic({ id: 'containers-docker-kubernetes', title: 'Containers, Docker & Kubernetes' }),
  ]),
  ch(3, 'chapter-3', 'The Three Numbers', 'Throughput, latency, and capacity intuition.', 'Gauge', '#f59e0b', [
    topic({ id: 'throughput', title: 'Throughput' }),
    topic({ id: 'latency-numbers-every-engineer-should-know', title: 'Latency Numbers Every Engineer Should Know' }),
    topic({ id: 'capacity-and-concurrent-connections', title: 'Capacity & Concurrent Connections' }),
    topic({ id: 'utilization-the-danger-zone', title: 'Utilization: The Danger Zone' }),
    topic({ id: 'bottlenecks-finding-the-weakest-link', title: 'Bottlenecks: Finding the Weakest Link' }),
    topic({ id: 'slas-slos-slis', title: 'SLAs, SLOs & SLIs' }),
  ]),
  ch(4, 'chapter-4', 'Databases Deep Dive', 'Storage engines, consistency, and query paths.', 'Database', '#a855f7', [
    topic({ id: 'what-is-a-database', title: 'What Is a Database?' }),
    topic({ id: 'sql-databases', title: 'SQL Databases' }),
    topic({ id: 'acid-transactions', title: 'ACID Transactions' }),
    topic({ id: 'nosql-databases', title: 'NoSQL Databases' }),
    topic({ id: 'sql-vs-nosql-decision-framework', title: 'SQL vs NoSQL Decision Framework' }),
    topic({ id: 'indexes', title: 'Indexes' }),
    topic({ id: 'connection-pooling', title: 'Connection Pooling' }),
    topic({ id: 'transactions-and-isolation-levels', title: 'Transactions & Isolation Levels' }),
    topic({ id: 'normalization-vs-denormalization', title: 'Normalization vs Denormalization' }),
    topic({ id: 'cap-theorem', title: 'CAP Theorem' }),
  ]),
  ch(5, 'chapter-5', 'Caching', 'Speed layers, eviction, and cache pitfalls.', 'Zap', '#eab308', [
    topic({ id: 'why-caching-matters', title: 'Why Caching Matters' }),
    topic({ id: 'cache-aside-pattern', title: 'Cache-Aside Pattern' }),
    topic({ id: 'write-through-write-behind', title: 'Write-Through & Write-Behind' }),
    topic({ id: 'ttl-and-eviction-policies', title: 'TTL & Eviction Policies' }),
    topic({ id: 'cache-stampede', title: 'Cache Stampede' }),
    topic({ id: 'cache-invalidation', title: 'Cache Invalidation' }),
    topic({ id: 'hot-key-problem', title: 'Hot Key Problem' }),
    topic({ id: 'redis-vs-memcached', title: 'Redis vs Memcached' }),
  ]),
  ch(6, 'chapter-6', 'Load Balancing & Traffic', 'Spreading work and staying healthy under load.', 'GitBranch', '#06b6d4', [
    topic({ id: 'why-one-server-is-never-enough', title: 'Why One Server Is Never Enough' }),
    topic({ id: 'l4-vs-l7-load-balancing', title: 'L4 vs L7 Load Balancing' }),
    topic({ id: 'algorithms-round-robin-least-connections', title: 'Algorithms: Round Robin & Least Connections' }),
    topic({ id: 'health-checks', title: 'Health Checks' }),
    topic({ id: 'sticky-sessions', title: 'Sticky Sessions' }),
    topic({ id: 'ssl-tls-termination', title: 'SSL/TLS Termination' }),
    topic({ id: 'global-load-balancing-geodns', title: 'Global Load Balancing & GeoDNS' }),
  ]),
  ch(7, 'chapter-7', 'Scaling Strategies', 'Growing systems without losing control.', 'TrendingUp', '#22c55e', [
    topic({ id: 'vertical-vs-horizontal-scaling', title: 'Vertical vs Horizontal Scaling' }),
    topic({ id: 'why-horizontal-requires-statelessness', title: 'Why Horizontal Scaling Requires Statelessness' }),
    topic({ id: 'database-read-replicas', title: 'Database Read Replicas' }),
    topic({ id: 'database-sharding', title: 'Database Sharding' }),
    topic({ id: 'consistent-hashing', title: 'Consistent Hashing' }),
    topic({ id: 'cdn-content-delivery', title: 'CDN & Content Delivery' }),
    topic({ id: 'auto-scaling', title: 'Auto-Scaling' }),
    topic({ id: 'back-of-envelope-estimation', title: 'Back-of-the-Envelope Estimation' }),
  ]),
  ch(8, 'chapter-8', 'Reliability & Failure', 'Designing for faults and recovery.', 'ShieldAlert', '#ef4444', [
    topic({ id: 'single-point-of-failure', title: 'Single Point of Failure' }),
    topic({ id: 'redundancy-active-active-passive', title: 'Redundancy: Active-Active & Active-Passive' }),
    topic({ id: 'health-checks-and-failover', title: 'Health Checks & Failover' }),
    topic({ id: 'nines-of-availability', title: 'Nines of Availability' }),
    topic({ id: 'circuit-breaker-pattern', title: 'Circuit Breaker Pattern' }),
    topic({ id: 'retry-strategies-exponential-backoff', title: 'Retry Strategies & Exponential Backoff' }),
    topic({ id: 'graceful-degradation', title: 'Graceful Degradation' }),
    topic({ id: 'chaos-engineering', title: 'Chaos Engineering' }),
  ]),
  ch(9, 'chapter-9', 'Async Processing & Messaging', 'Queues, events, and loose coupling.', 'ListOrdered', '#f97316', [
    topic({ id: 'why-synchronous-is-slow', title: 'Why Synchronous Is Slow' }),
    topic({ id: 'message-queues', title: 'Message Queues' }),
    topic({ id: 'delivery-guarantees', title: 'Delivery Guarantees' }),
    topic({ id: 'idempotency', title: 'Idempotency' }),
    topic({ id: 'backpressure', title: 'Backpressure' }),
    topic({ id: 'dead-letter-queues', title: 'Dead Letter Queues' }),
    topic({ id: 'event-streaming-kafka', title: 'Event Streaming & Kafka' }),
    topic({ id: 'pub-sub-pattern', title: 'Pub/Sub Pattern' }),
  ]),
  ch(10, 'chapter-10', 'Networking & Communication', 'How services talk to each other.', 'Network', '#0ea5e9', [
    topic({ id: 'service-to-service-communication', title: 'Service-to-Service Communication' }),
    topic({ id: 'rest-grpc-graphql', title: 'REST, gRPC & GraphQL' }),
    topic({ id: 'async-communication-patterns', title: 'Async Communication Patterns' }),
    topic({ id: 'service-discovery', title: 'Service Discovery' }),
    topic({ id: 'api-versioning', title: 'API Versioning' }),
    topic({ id: 'rate-limiting-and-throttling', title: 'Rate Limiting & Throttling' }),
    topic({ id: 'timeouts-and-connection-management', title: 'Timeouts & Connection Management' }),
  ]),
  ch(11, 'chapter-11', 'Security', 'Identity, boundaries, and safe defaults.', 'Lock', '#f59e0b', [
    topic({ id: 'authentication-vs-authorization', title: 'Authentication vs Authorization' }),
    topic({ id: 'oauth-and-jwt', title: 'OAuth & JWT' }),
    topic({ id: 'api-gateway-the-front-door', title: 'API Gateway: The Front Door' }),
    topic({ id: 'rate-limiting-protection', title: 'Rate Limiting for Protection' }),
    topic({ id: 'waf-and-ddos-protection', title: 'WAF & DDoS Protection' }),
    topic({ id: 'cors-and-https-tls', title: 'CORS & HTTPS/TLS' }),
    topic({ id: 'secrets-management-encryption', title: 'Secrets Management & Encryption' }),
  ]),
  ch(12, 'chapter-12', 'Monitoring & Observability', 'See what your system is doing in production.', 'BarChart3', '#8b5cf6', [
    topic({ id: 'three-pillars-metrics-logs-traces', title: 'The Three Pillars: Metrics, Logs & Traces' }),
    topic({ id: 'monitoring-what-to-measure', title: 'Monitoring: What to Measure' }),
    topic({ id: 'logging-structured-aggregation', title: 'Logging: Structured & Aggregation' }),
    topic({ id: 'distributed-tracing', title: 'Distributed Tracing' }),
    topic({ id: 'alerting-oncall', title: 'Alerting & On-Call' }),
    topic({ id: 'sre-principles-error-budgets', title: 'SRE Principles & Error Budgets' }),
  ]),
  ch(13, 'chapter-13', 'Data Processing & Storage', 'Pipelines, warehouses, and large-scale data.', 'HardDrive', '#0ea5e9', [
    topic({ id: 'blob-object-storage', title: 'Blob & Object Storage' }),
    topic({ id: 'data-warehouses-oltp-vs-olap', title: 'Data Warehouses: OLTP vs OLAP' }),
    topic({ id: 'etl-pipelines', title: 'ETL Pipelines' }),
    topic({ id: 'batch-vs-stream-processing', title: 'Batch vs Stream Processing' }),
    topic({ id: 'mapreduce-distributed-computation', title: 'MapReduce & Distributed Computation' }),
    topic({ id: 'time-series-databases', title: 'Time-Series Databases' }),
    topic({ id: 'data-lakes', title: 'Data Lakes' }),
  ]),
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
