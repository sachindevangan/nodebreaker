export interface JourneyStage {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  parts: {
    learn: LearnSection;
    build: BuildExercise;
    tutorial?: string;
    challenge?: string;
    interviewCard: InterviewCard;
  };
  concepts: string[];
  prerequisites: string[];
  xpReward: number;
}

export interface LearnSection {
  title: string;
  content: LearnBlock[];
  estimatedMinutes: number;
}

export interface LearnBlock {
  type: 'text' | 'diagram' | 'interactive' | 'analogy' | 'comparison' | 'quiz';
  content: string;
  diagramTemplate?: string;
  interactivePrompt?: string;
  comparison?: { left: string; leftItems: string[]; right: string; rightItems: string[] };
  quiz?: { question: string; options: string[]; correctIndex: number; explanation: string };
}

export interface BuildExercise {
  title: string;
  description: string;
  instruction: string;
  successCriteria: string;
  hint: string;
}

export interface InterviewCard {
  question: string;
  exampleAnswer: string;
  keyPoints: string[];
  followUps: string[];
}

import { LEARN_CONTENT_BY_STAGE } from './learnContent';

const placeholderLearn = (topic: string): LearnSection => ({
  title: topic,
  estimatedMinutes: 8,
  content: [
    {
      type: 'text',
      content: `## ${topic}\n\nThis stage introduces the core ideas behind ${topic.toLowerCase()} and why they matter in production systems.`,
    },
    {
      type: 'analogy',
      content:
        'Think of this as a real-world traffic system: smooth flow requires good entry points, clear routing, and fail-safe paths.',
    },
    {
      type: 'interactive',
      content: 'Try this concept in the mini canvas to make the behavior concrete.',
      interactivePrompt: 'Adjust components and observe how metrics change in real time.',
    },
  ],
});

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'stage-1',
    number: 1,
    title: 'What Is a Server?',
    subtitle: 'Where every request begins',
    icon: 'Server',
    color: '#3b82f6',
    description:
      'A server is the system that receives requests and returns responses. This stage builds a mental model for client-server communication and request flow. You will connect these basics to how modern web apps actually run.',
    parts: {
      learn: LEARN_CONTENT_BY_STAGE['stage-1'] ?? placeholderLearn('What Is a Server?'),
      build: {
        title: 'Hello Server',
        description: 'Create your first working server-style flow in the simulator.',
        instruction:
          'Drop a Service node, set throughput to 1000, start simulation. Watch requests flow in.',
        successCriteria: 'You see the node processing requests.',
        hint: 'The Service component represents your application server.',
      },
      tutorial: 'first-system',
      challenge: 'traffic-surge',
      interviewCard: {
        question: 'What happens when you type a URL in the browser?',
        exampleAnswer:
          'The browser sends a DNS query to resolve the domain to an IP address, establishes a TCP connection, sends an HTTP request to the server, the server processes it and returns a response, which the browser renders.',
        keyPoints: ['DNS resolution', 'TCP handshake', 'HTTP request/response', 'Server processing'],
        followUps: ['What is DNS?', "What's the difference between HTTP and HTTPS?"],
      },
    },
    concepts: ['server', 'request', 'response', 'client-server model'],
    prerequisites: [],
    xpReward: 100,
  },
  {
    id: 'stage-2',
    number: 2,
    title: 'Throughput, Latency & Capacity',
    subtitle: 'The three numbers that define every system',
    icon: 'Gauge',
    color: '#f59e0b',
    description:
      'Performance is not one metric. You need to balance throughput, latency, and capacity while watching utilization. This stage helps you reason about bottlenecks and tradeoffs.',
    parts: {
      learn: LEARN_CONTENT_BY_STAGE['stage-2'] ?? placeholderLearn('Throughput, Latency & Capacity'),
      build: {
        title: 'Find the Bottleneck',
        description: 'Create a constrained system and identify the pressure point.',
        instruction:
          'Create LB -> Service -> DB. Set DB throughput to 100. Start simulation. Watch the DB become a bottleneck. Then increase DB throughput to 5000 and watch it recover.',
        successCriteria: 'You can clearly observe bottleneck behavior and recovery.',
        hint: 'The slowest component sets effective system throughput.',
      },
      interviewCard: {
        question: "What's the difference between throughput and latency?",
        exampleAnswer:
          'Throughput is how many requests per second a system handles - like the width of a highway. Latency is how long each individual request takes - like the speed limit. You can have high throughput with high latency or low throughput with low latency.',
        keyPoints: ['Throughput = volume over time', 'Latency = time per request', 'They are related but different'],
        followUps: ['How do you reduce p99 latency?', 'What is utilization and why does it matter?'],
      },
    },
    concepts: ['throughput', 'latency', 'capacity', 'utilization', 'bottleneck'],
    prerequisites: ['stage-1'],
    xpReward: 150,
  },
  {
    id: 'stage-3',
    number: 3,
    title: 'The Database Problem',
    subtitle: 'Why your database is always the bottleneck',
    icon: 'Database',
    color: '#a855f7',
    description:
      'Storage layers are powerful but often slower than compute. You will learn when to use SQL vs NoSQL, why indexes matter, and how replication and pooling keep systems stable.',
    parts: {
      learn: LEARN_CONTENT_BY_STAGE['stage-3'] ?? placeholderLearn('The Database Problem'),
      build: {
        title: 'DB Stress Test',
        description: 'Experiment with indexing and throughput constraints.',
        instruction: 'Create a DB-heavy path and tune DB throughput to observe queueing and latency.',
        successCriteria: 'You can explain what changed and why performance shifted.',
        hint: 'Database optimization is usually a mix of schema, indexes, and access patterns.',
      },
      interviewCard: {
        question: 'SQL vs NoSQL - when do you pick each?',
        exampleAnswer:
          'SQL when you need ACID transactions, complex joins, and strong integrity. NoSQL when you need horizontal scale, flexible schema, and very high write throughput.',
        keyPoints: ['ACID and relational queries', 'Schema flexibility', 'Scale pattern and workload type'],
        followUps: ['What is eventual consistency?', 'What is connection pooling?'],
      },
    },
    concepts: ['SQL vs NoSQL', 'ACID', 'indexes', 'connection pooling', 'replication'],
    prerequisites: ['stage-2'],
    xpReward: 200,
  },
  {
    id: 'stage-4',
    number: 4,
    title: 'Caching - The Speed Hack',
    subtitle: 'How Redis makes everything 100x faster',
    icon: 'Zap',
    color: '#eab308',
    description:
      'Caching moves hot reads to memory and dramatically improves response time. This stage covers cache-aside, TTL, invalidation, and how to avoid stampedes.',
    parts: {
      learn: LEARN_CONTENT_BY_STAGE['stage-4'] ?? placeholderLearn('Caching'),
      build: {
        title: 'Cache Boost',
        description: 'Add a cache layer and compare before/after metrics.',
        instruction: 'Insert a Cache node and route read-heavy traffic through it.',
        successCriteria: 'Latency drops and database utilization improves.',
        hint: 'Start with cache-aside and a practical TTL.',
      },
      tutorial: 'power-of-caching',
      challenge: 'speed-demon',
      interviewCard: {
        question: 'Explain cache invalidation strategies',
        exampleAnswer:
          'TTL is simple but can serve stale data. Write-through updates cache on writes for stronger consistency. Write-behind improves write latency but risks delayed persistence. Most systems combine TTL with selective invalidation.',
        keyPoints: ['TTL-based expiration', 'Write-through', 'Write-behind', 'Staleness tradeoff'],
        followUps: ['What is a cache stampede?', 'How do you choose TTL values?'],
      },
    },
    concepts: ['cache-aside', 'TTL', 'eviction', 'cache stampede', 'invalidation'],
    prerequisites: ['stage-3'],
    xpReward: 200,
  },
  {
    id: 'stage-5',
    number: 5,
    title: 'Load Balancers & Traffic Distribution',
    subtitle: 'One server is never enough',
    icon: 'GitBranch',
    color: '#06b6d4',
    description:
      'Load balancers spread traffic and improve reliability. You will compare L4 and L7 approaches, balancing strategies, and sticky session behavior.',
    parts: {
      learn: LEARN_CONTENT_BY_STAGE['stage-5'] ?? placeholderLearn('Load Balancing'),
      build: {
        title: 'Distribute the Load',
        description: 'Route traffic across multiple services.',
        instruction: 'Place an LB in front of at least two Service nodes and run simulation.',
        successCriteria: 'Traffic visibly spreads across service instances.',
        hint: 'Enable health-aware routing by avoiding single-path designs.',
      },
      interviewCard: {
        question: 'L4 vs L7 load balancing - when to use each?',
        exampleAnswer:
          'Use L4 for high-performance transport-level balancing. Use L7 when you need HTTP-aware routing, headers, path-based rules, and richer traffic policies.',
        keyPoints: ['L4 = transport', 'L7 = application aware', 'Performance vs routing flexibility'],
        followUps: ['What are sticky sessions?', 'What health checks should be used?'],
      },
    },
    concepts: ['L4 vs L7', 'round robin', 'least connections', 'health checks', 'sticky sessions'],
    prerequisites: ['stage-2'],
    xpReward: 200,
  },
  {
    id: 'stage-6',
    number: 6,
    title: 'When Things Break',
    subtitle: 'Designing for failure, not against it',
    icon: 'ShieldAlert',
    color: '#ef4444',
    description:
      'Reliable systems assume failure and recover quickly. This stage focuses on removing SPOFs, adding redundancy, and reducing MTTR with better failover design.',
    parts: {
      learn: placeholderLearn('Failure Design'),
      build: {
        title: 'Failure Drill',
        description: 'Build a topology that survives node crashes.',
        instruction: 'Create redundancy on critical path components and inject chaos events.',
        successCriteria: 'System remains partially or fully available during faults.',
        hint: 'If one component dying takes down the whole flow, it is a SPOF.',
      },
      tutorial: 'surviving-failures',
      challenge: 'unbreakable-system',
      interviewCard: {
        question: 'How do you eliminate single points of failure?',
        exampleAnswer:
          'Replicate critical components, use health checks and automatic failover, and ensure traffic can reroute to healthy instances. Apply this across compute, data, and networking layers.',
        keyPoints: ['Redundancy', 'Failover', 'Health checks', 'Critical-path analysis'],
        followUps: ['How do you test failover?', 'What is MTTR?'],
      },
    },
    concepts: ['SPOF', 'redundancy', 'failover', 'replication', 'MTTR', 'health checks'],
    prerequisites: ['stage-5'],
    xpReward: 250,
  },
  {
    id: 'stage-7',
    number: 7,
    title: 'Queues & Async Processing',
    subtitle: "Don't make users wait",
    icon: 'ListOrdered',
    color: '#f97316',
    description:
      'Queues decouple slow work from user-facing requests. You will learn backpressure, delivery guarantees, and how async workers smooth traffic spikes.',
    parts: {
      learn: placeholderLearn('Queues & Async Processing'),
      build: {
        title: 'Async Pipeline',
        description: 'Split request acknowledgment from background work.',
        instruction: 'Insert Queue -> Worker flow behind a frontend service.',
        successCriteria: 'User-facing latency stays low while processing continues asynchronously.',
        hint: 'Aim for fast ACKs and durable queue writes.',
      },
      tutorial: 'scaling-under-load',
      challenge: 'async-pipeline',
      interviewCard: {
        question: 'When would you use a message queue?',
        exampleAnswer:
          'Use a queue when tasks are slow, bursty, or should not block the request path. It improves resilience, enables retries, and decouples producers from consumers.',
        keyPoints: ['Async work', 'Spike absorption', 'Retries and DLQ', 'Decoupling'],
        followUps: ['At-least-once vs exactly-once?', 'What is backpressure?'],
      },
    },
    concepts: ['message queues', 'async processing', 'backpressure', 'dead letter queue', 'at-least-once delivery'],
    prerequisites: ['stage-4'],
    xpReward: 250,
  },
  {
    id: 'stage-8',
    number: 8,
    title: 'Scaling to Millions',
    subtitle: 'From 1 server to a global system',
    icon: 'TrendingUp',
    color: '#22c55e',
    description:
      'At large scale, architecture must evolve across regions and data layers. This stage combines replicas, sharding, CDN strategy, and DNS-aware distribution.',
    parts: {
      learn: placeholderLearn('Scaling to Millions'),
      build: {
        title: '10x Growth Plan',
        description: 'Expand architecture for large read/write traffic.',
        instruction: 'Add horizontal scaling, read replicas, and CDN-aware request paths.',
        successCriteria: 'System handles higher throughput with acceptable latency.',
        hint: 'Scale bottlenecks independently instead of overbuilding everything.',
      },
      challenge: 'ten-million-users',
      interviewCard: {
        question: 'How would you scale this system to 10x traffic?',
        exampleAnswer:
          'Scale stateless services horizontally, add caching and read replicas, partition large datasets, and use CDN/DNS strategies to reduce origin load and latency.',
        keyPoints: ['Horizontal scaling', 'Caching', 'Data partitioning', 'Global distribution'],
        followUps: ['When do you shard?', 'How do you avoid hot partitions?'],
      },
    },
    concepts: ['horizontal scaling', 'vertical scaling', 'sharding', 'read replicas', 'CDN', 'DNS'],
    prerequisites: ['stage-6', 'stage-7'],
    xpReward: 300,
  },
  {
    id: 'stage-9',
    number: 9,
    title: 'The Full Design',
    subtitle: 'Putting it all together',
    icon: 'Layout',
    color: '#8b5cf6',
    description:
      'This stage mirrors interview flow end-to-end. You will gather requirements, estimate scale, propose architecture, and defend tradeoffs like a senior engineer.',
    parts: {
      learn: placeholderLearn('The Full Design'),
      build: {
        title: 'Interview Walkthrough',
        description: 'Deliver a complete architecture in structured steps.',
        instruction: 'Build a design from requirements to tradeoffs and validate via simulation.',
        successCriteria: 'You can explain each major component and why it exists.',
        hint: 'Narrative matters: requirements -> estimates -> architecture -> tradeoffs.',
      },
      tutorial: 'design-url-shortener',
      interviewCard: {
        question: 'Design a URL shortener like bit.ly',
        exampleAnswer:
          'Use a read-optimized path with cache in front of storage, generate unique short codes, and process analytics asynchronously through queues and workers.',
        keyPoints: ['Requirements first', 'Data model and key generation', 'Caching for redirects', 'Async analytics'],
        followUps: ['How do you prevent collisions?', 'How do you handle custom aliases?'],
      },
    },
    concepts: ['requirements gathering', 'back-of-envelope estimation', 'tradeoff discussion', 'component selection'],
    prerequisites: ['stage-8'],
    xpReward: 400,
  },
  {
    id: 'stage-10',
    number: 10,
    title: 'Chaos Engineering',
    subtitle: 'Break everything. On purpose.',
    icon: 'Flame',
    color: '#dc2626',
    description:
      'The final stage validates resilience under realistic failure scenarios. You will limit blast radius, apply graceful degradation, and make reliability a repeatable practice.',
    parts: {
      learn: placeholderLearn('Chaos Engineering'),
      build: {
        title: 'Game Day',
        description: 'Run controlled failure drills on your production-like design.',
        instruction: 'Inject multiple chaos events and verify critical user paths still function.',
        successCriteria: 'Core functionality survives while failures are isolated.',
        hint: 'Start with one failure, then layer scenarios to test blast radius.',
      },
      challenge: 'chaos-survivor',
      interviewCard: {
        question: 'How do you test that your system is resilient?',
        exampleAnswer:
          'Use staged chaos experiments in production-like environments, define steady-state metrics, limit blast radius, and verify graceful degradation with clear rollback paths.',
        keyPoints: ['Hypothesis-driven experiments', 'Blast radius controls', 'Steady-state metrics', 'Game days and runbooks'],
        followUps: ['What is a circuit breaker?', 'How do you run chaos safely in production?'],
      },
    },
    concepts: ['chaos engineering', 'blast radius', 'circuit breakers', 'graceful degradation', 'game days'],
    prerequisites: ['stage-9'],
    xpReward: 500,
  },
];

export function getJourneyStageById(stageId: string): JourneyStage | undefined {
  return JOURNEY_STAGES.find((stage) => stage.id === stageId);
}
