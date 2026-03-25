import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_16_TOPICS: Topic[] = [
  {
    id: 'design-url-shortener',
    title: 'Design a URL Shortener',
    interviewTip: 'Cover code generation, cache-heavy reads, redirect semantics, and async analytics pipeline.',
    simulatorDemo: { description: 'Full URL shortener architecture with redirect and analytics flow.', instruction: 'Watch redirect requests flow through CDN and cache, while analytics are decoupled through queue and worker.', simulationAutoStart: true, setupNodes: [{ type: 'dns', label: 'DNS', position: { x: 0, y: 250 }, data: { throughput: 100000, latency: 2, capacity: 500000 } }, { type: 'cdn', label: 'CDN', position: { x: 200, y: 250 }, data: { throughput: 500000, latency: 3, capacity: 1000000 } }, { type: 'loadBalancer', label: 'Load Balancer', position: { x: 400, y: 250 }, data: { throughput: 50000, latency: 2, capacity: 200000 } }, { type: 'service', label: 'URL Service', position: { x: 600, y: 250 }, data: { throughput: 10000, latency: 15, capacity: 50000 } }, { type: 'cache', label: 'Redis Cache', position: { x: 800, y: 150 }, data: { throughput: 100000, latency: 1, capacity: 500000 } }, { type: 'database', label: 'PostgreSQL', position: { x: 800, y: 350 }, data: { throughput: 5000, latency: 10, capacity: 20000 } }, { type: 'queue', label: 'Analytics Queue', position: { x: 1000, y: 250 }, data: { throughput: 50000, latency: 2, capacity: 1000000 } }, { type: 'worker', label: 'Analytics Worker', position: { x: 1200, y: 250 }, data: { throughput: 2000, latency: 100, capacity: 10000 } }, { type: 'database', label: 'Analytics Warehouse', position: { x: 1400, y: 250 }, data: { throughput: 3000, latency: 20, capacity: 20000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 3 }, { source: 3, target: 4 }, { source: 3, target: 5 }, { source: 3, target: 6 }, { source: 6, target: 7 }, { source: 7, target: 8 }] },
    readContent: `# Design a URL Shortener

This is a full interview-style system design walkthrough. The right way to answer is not to jump into random components. Start by framing scope, quantify scale, draw a clean architecture, deep dive into one or two hard parts, and close with explicit tradeoffs.

## 1) Clarify Requirements

- Functional goals: create short URL from long URL, redirect short URL to original URL, optional custom aliases, expiration, and click analytics.
- Non-functional goals: high read volume, low redirect latency, strong availability for redirects, and durable mapping persistence.
- Scale assumptions: around 100 million URL creations per month and roughly 10 billion redirects per month.
- Security and abuse controls: URL validation, malicious link checks, and per-key rate limiting on create endpoint.

A clean requirement section usually separates functional and non-functional goals. Functional goals define user-visible behavior. Non-functional goals define scale, latency, consistency, availability, and durability expectations.

## 2) Back-of-Envelope Estimation

- Writes are roughly 40 per second average with bursts; reads around 4,000 per second average and much higher at peak.
- Read-to-write ratio is around 100:1, which strongly justifies aggressive caching.
- If each mapping is around 500 bytes, monthly mapping storage is around 50 GB plus index overhead.
- Five-year retention pushes into multi-terabyte metadata scale; analytics events are much larger and should be streamed asynchronously.

In interviews, exact values are less important than order of magnitude reasoning and transparent assumptions. Say your assumptions out loud and update them if the interviewer provides better constraints.

## 3) High-Level Architecture

- Request path: DNS to CDN to load balancer to URL service. Popular redirects are served quickly from edge or cache.
- URL service checks Redis cache first, then PostgreSQL for authoritative lookup, then returns redirect response.
- Create path writes mapping to PostgreSQL, updates Redis, and emits analytics/audit event to queue.
- Analytics worker consumes queue, aggregates click events, and stores analytical views in warehouse tables.

A good architecture answer traces key flows end-to-end: ingest path, read path, write path, async path, and failure handling path. Label each major arrow by protocol or event mechanism and identify where caching, queuing, and persistence are used.

## 4) Deep Dive: Hard Parts

- Short code generation options include base62 encoding of sequence IDs, hash-based codes with collision checks, or pre-generated code pools.
- Base62 with seven characters provides trillions of possible IDs and deterministic uniqueness if backed by monotonic ID generation.
- Redirect semantics: 301 improves caching and lower load but weakens per-click observability; 302 gives better tracking control.
- Cache strategy: hot key TTL with write-through update and fallback DB lookup on miss.

This section differentiates strong candidates. Pick one hard problem and show concrete mechanics, not generic statements. For example, discuss idempotency keys, partitioning keys, consistency model, replay strategy, or fallback behavior under degraded dependencies.

## 5) Data Model and Storage Strategy

Define the core entities and the most important query patterns. Choose storage systems by access pattern, not habit. Transactional writes and strict constraints often fit relational stores. High write throughput and time-ordered access may fit wide-column stores. Search and relevance ranking may require specialized indexes. Blobs and media belong in object storage behind CDN delivery.

## 6) Reliability, Security, and Operations

Cover timeouts, retries with backoff, dead-letter handling, rate limiting, and observability. Mention metrics, logs, and traces together. Include backup/restore and disaster recovery posture where appropriate. For public endpoints, include authentication, authorization, abuse prevention, and transport security.

## 7) Tradeoffs and Scaling Path

- Consistency tradeoff: prioritize availability for redirects while ensuring mapping writes are durable before response.
- Cost tradeoff: CDN and Redis reduce origin load significantly but add infrastructure spend.
- Simplicity tradeoff: single relational store is easiest first; sharding can be introduced after sustained growth.
- Analytics tradeoff: synchronous click counting adds latency; async pipeline decouples user path from reporting.

End with what you would do next as load grows: cache hit-rate improvements, partitioning/sharding, regional expansion, asynchronous fan-out, or precomputation. Show you understand that architecture evolves in stages.

> ANALOGY: A short code is like a coat-check ticket: tiny token quickly retrieves a full item record.
> NUMBERS: Sequence base62 with seven chars gives very large namespace; read-heavy ratio often exceeds 100 to 1.
> IMPORTANT: Do not perform heavy analytics writes in redirect critical path.
> INTERVIEW TIP: State read path, write path, code generation, cache hit strategy, and redirect status code rationale.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'design-url-shortener-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'design-url-shortener-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'design-url-shortener-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'design-url-shortener-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'design-url-shortener-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'design-url-shortener-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'design-chat-app',
    title: 'Design a Chat App',
    interviewTip: 'Explain WebSocket connection management, offline delivery, and fan-out strategy for group chat.',
    simulatorDemo: { description: 'Real-time chat architecture with WebSocket delivery and offline notification flow.', instruction: 'Observe chat traffic to gateway and message persistence to log/database, with separate presence and push branches.', simulationAutoStart: true, setupNodes: [{ type: 'loadBalancer', label: 'LB', position: { x: 0, y: 250 }, data: { throughput: 100000, latency: 2, capacity: 500000 } }, { type: 'service', label: 'WebSocket Gateway', position: { x: 250, y: 250 }, data: { throughput: 50000, latency: 5, capacity: 200000 } }, { type: 'service', label: 'Chat Service', position: { x: 500, y: 250 }, data: { throughput: 30000, latency: 10, capacity: 100000 } }, { type: 'kafka', label: 'Kafka', position: { x: 750, y: 150 }, data: { throughput: 500000, latency: 3, capacity: 5000000 } }, { type: 'database', label: 'Cassandra', position: { x: 750, y: 350 }, data: { throughput: 50000, latency: 5, capacity: 200000 } }, { type: 'service', label: 'Presence Service', position: { x: 500, y: 450 }, data: { throughput: 40000, latency: 6, capacity: 150000 } }, { type: 'cache', label: 'Redis Presence', position: { x: 750, y: 450 }, data: { throughput: 100000, latency: 1, capacity: 500000 } }, { type: 'queue', label: 'Push Notifications', position: { x: 1000, y: 250 }, data: { throughput: 100000, latency: 50, capacity: 1000000 } }, { type: 'service', label: 'APNs/FCM Worker', position: { x: 1200, y: 250 }, data: { throughput: 30000, latency: 40, capacity: 200000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 3 }, { source: 3, target: 4 }, { source: 2, target: 5 }, { source: 5, target: 6 }, { source: 3, target: 7 }, { source: 7, target: 8 }] },
    readContent: `# Design a Chat App

This is a full interview-style system design walkthrough. The right way to answer is not to jump into random components. Start by framing scope, quantify scale, draw a clean architecture, deep dive into one or two hard parts, and close with explicit tradeoffs.

## 1) Clarify Requirements

- Functional goals: one-to-one chat, group messaging, read receipts, message history, online status, and media attachments.
- Non-functional goals: near-real-time delivery, durable history, high availability, and low publish latency.
- Scale assumptions: hundreds of millions of daily users and tens of billions of messages per day.
- Delivery guarantees: at-least-once message transport with idempotent client/server processing and ordering per conversation.

A clean requirement section usually separates functional and non-functional goals. Functional goals define user-visible behavior. Non-functional goals define scale, latency, consistency, availability, and durability expectations.

## 2) Back-of-Envelope Estimation

- Fifty billion daily messages is hundreds of thousands of messages per second average, with significant peak multipliers.
- Message payloads are relatively small but cumulative storage is petabyte scale over multi-year retention.
- Persistent WebSocket fan-in/fan-out requires gateways sized for connection count and heartbeat overhead.
- Presence updates and typing indicators are high-churn and should be stored in memory-first systems.

In interviews, exact values are less important than order of magnitude reasoning and transparent assumptions. Say your assumptions out loud and update them if the interviewer provides better constraints.

## 3) High-Level Architecture

- Clients connect through load balancer to WebSocket gateway cluster maintaining long-lived sessions.
- Chat service persists messages through event log path into Cassandra-style write-optimized storage.
- Presence service uses Redis to maintain online state keyed by user and connection metadata.
- Offline path pushes notification events through channel workers for APNs and FCM delivery.

A good architecture answer traces key flows end-to-end: ingest path, read path, write path, async path, and failure handling path. Label each major arrow by protocol or event mechanism and identify where caching, queuing, and persistence are used.

## 4) Deep Dive: Hard Parts

- Delivery path must resolve recipient connection location quickly, often via connection registry service.
- Group fan-out can be direct push for small groups and topic-based fan-out for larger groups.
- Ordering strategy is usually per conversation partition key with sequence IDs.
- Exactly-once is impractical end-to-end; use idempotency keys and dedup windows.

This section differentiates strong candidates. Pick one hard problem and show concrete mechanics, not generic statements. For example, discuss idempotency keys, partitioning keys, consistency model, replay strategy, or fallback behavior under degraded dependencies.

## 5) Data Model and Storage Strategy

Define the core entities and the most important query patterns. Choose storage systems by access pattern, not habit. Transactional writes and strict constraints often fit relational stores. High write throughput and time-ordered access may fit wide-column stores. Search and relevance ranking may require specialized indexes. Blobs and media belong in object storage behind CDN delivery.

## 6) Reliability, Security, and Operations

Cover timeouts, retries with backoff, dead-letter handling, rate limiting, and observability. Mention metrics, logs, and traces together. Include backup/restore and disaster recovery posture where appropriate. For public endpoints, include authentication, authorization, abuse prevention, and transport security.

## 7) Tradeoffs and Scaling Path

- Strong ordering across all chats is expensive; per-conversation ordering is practical and sufficient.
- Synchronous fan-out simplifies consistency but can overload hot groups; async fan-out improves resilience.
- Storing media in object storage plus CDN avoids bloating message database.
- Presence freshness vs cost: faster heartbeats improve accuracy but increase overhead.

End with what you would do next as load grows: cache hit-rate improvements, partitioning/sharding, regional expansion, asynchronous fan-out, or precomputation. Show you understand that architecture evolves in stages.

> ANALOGY: A chat system is like a switching network where operators connect callers in real time and leave voicemail when unavailable.
> NUMBERS: Massive chat systems handle hundreds of thousands of message events per second and maintain millions of active sockets.
> IMPORTANT: Do not rely on polling at very high scale for real-time UX; persistent channels are the baseline.
> INTERVIEW TIP: Describe online path, offline path, and group fan-out separately to show complete coverage.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'design-chat-app-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'design-chat-app-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'design-chat-app-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'design-chat-app-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'design-chat-app-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'design-chat-app-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'design-social-feed',
    title: 'Design a Social Feed',
    interviewTip: 'Discuss fan-out-on-write vs fan-out-on-read and celebrity mitigation explicitly.',
    simulatorDemo: { description: 'Social feed architecture with fan-out service, feed cache, and post pipeline.', instruction: 'Observe post events enter Kafka and feed workers update cache while read path stays cache-first.', simulationAutoStart: true, setupNodes: [{ type: 'dns', label: 'DNS', position: { x: 0, y: 250 }, data: { throughput: 100000, latency: 2, capacity: 500000 } }, { type: 'cdn', label: 'CDN', position: { x: 180, y: 250 }, data: { throughput: 500000, latency: 3, capacity: 1000000 } }, { type: 'loadBalancer', label: 'LB', position: { x: 360, y: 250 }, data: { throughput: 80000, latency: 2, capacity: 300000 } }, { type: 'apiGateway', label: 'API Gateway', position: { x: 540, y: 250 }, data: { throughput: 50000, latency: 8, capacity: 200000 } }, { type: 'service', label: 'Feed Service', position: { x: 720, y: 180 }, data: { throughput: 25000, latency: 12, capacity: 120000 } }, { type: 'cache', label: 'Redis Feed Cache', position: { x: 920, y: 120 }, data: { throughput: 150000, latency: 1, capacity: 600000 } }, { type: 'service', label: 'Post Service', position: { x: 720, y: 320 }, data: { throughput: 12000, latency: 18, capacity: 80000 } }, { type: 'kafka', label: 'Kafka', position: { x: 920, y: 280 }, data: { throughput: 400000, latency: 3, capacity: 3000000 } }, { type: 'worker', label: 'Fan-out Workers', position: { x: 1120, y: 280 }, data: { throughput: 30000, latency: 35, capacity: 150000 } }, { type: 'database', label: 'Graph/Post DB', position: { x: 1120, y: 120 }, data: { throughput: 10000, latency: 9, capacity: 40000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 3 }, { source: 3, target: 4 }, { source: 4, target: 5 }, { source: 3, target: 6 }, { source: 6, target: 7 }, { source: 7, target: 8 }, { source: 8, target: 5 }, { source: 6, target: 9 }] },
    readContent: `# Design a Social Feed

This is a full interview-style system design walkthrough. The right way to answer is not to jump into random components. Start by framing scope, quantify scale, draw a clean architecture, deep dive into one or two hard parts, and close with explicit tradeoffs.

## 1) Clarify Requirements

- Functional goals: post content, follow graph, home feed retrieval, likes/comments, and optional ranking modes.
- Non-functional goals: low feed latency, high availability, and scalable fan-out for heavy poster accounts.
- Scale assumptions: hundreds of millions of DAU, high read amplification from repeated feed refresh.
- Product behavior: blend precomputed feed cache with on-demand ranking for freshness and relevance.

A clean requirement section usually separates functional and non-functional goals. Functional goals define user-visible behavior. Non-functional goals define scale, latency, consistency, availability, and durability expectations.

## 2) Back-of-Envelope Estimation

- Feed reads dominate writes by a wide margin, often an order of magnitude or more.
- Celebrity accounts create extreme fan-out spikes that cannot be treated like normal users.
- Media payloads should be served from CDN/object storage and excluded from feed metadata hot path.
- Cache hit targets above ninety percent are often required for stable feed latency at scale.

In interviews, exact values are less important than order of magnitude reasoning and transparent assumptions. Say your assumptions out loud and update them if the interviewer provides better constraints.

## 3) High-Level Architecture

- API gateway routes to post, feed, and graph services with Kafka-based event fan-out.
- Feed cache stores per-user candidate lists and recent ranked slices for fast retrieval.
- Post events trigger fan-out workers that write feed entries for normal users.
- Celebrity handling often switches to fan-out-on-read to avoid write explosions.

A good architecture answer traces key flows end-to-end: ingest path, read path, write path, async path, and failure handling path. Label each major arrow by protocol or event mechanism and identify where caching, queuing, and persistence are used.

## 4) Deep Dive: Hard Parts

- Fan-out-on-write precomputes recipient timelines for fast reads but expensive writes.
- Fan-out-on-read computes at request time with graph lookups and ranking, better for high-follower producers.
- Hybrid strategy combines both and classifies producers by follower count thresholds.
- Ranking pipeline may merge recency, engagement, and social affinity signals.

This section differentiates strong candidates. Pick one hard problem and show concrete mechanics, not generic statements. For example, discuss idempotency keys, partitioning keys, consistency model, replay strategy, or fallback behavior under degraded dependencies.

## 5) Data Model and Storage Strategy

Define the core entities and the most important query patterns. Choose storage systems by access pattern, not habit. Transactional writes and strict constraints often fit relational stores. High write throughput and time-ordered access may fit wide-column stores. Search and relevance ranking may require specialized indexes. Blobs and media belong in object storage behind CDN delivery.

## 6) Reliability, Security, and Operations

Cover timeouts, retries with backoff, dead-letter handling, rate limiting, and observability. Mention metrics, logs, and traces together. Include backup/restore and disaster recovery posture where appropriate. For public endpoints, include authentication, authorization, abuse prevention, and transport security.

## 7) Tradeoffs and Scaling Path

- Chronological feeds are simpler and predictable; ranked feeds improve engagement with more complexity.
- Precompute improves latency but increases storage and invalidation complexity.
- Consistency of likes/comments in cached feed cards can be eventual for scalability.
- Real-time updates via WebSocket improve UX but increase connection management cost.

End with what you would do next as load grows: cache hit-rate improvements, partitioning/sharding, regional expansion, asynchronous fan-out, or precomputation. Show you understand that architecture evolves in stages.

> ANALOGY: Feed construction is like preparing meal trays in advance for regular customers while custom-ordering for celebrity events.
> NUMBERS: For very large social systems, feed reads can be millions per second at peak; cache hit rate drives viability.
> IMPORTANT: Do not ignore celebrity fan-out; it is a core bottleneck in feed systems.
> INTERVIEW TIP: Discuss fan-out-on-write vs fan-out-on-read and celebrity mitigation explicitly.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'design-social-feed-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'design-social-feed-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'design-social-feed-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'design-social-feed-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'design-social-feed-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'design-social-feed-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'design-payment-system',
    title: 'Design a Payment System',
    interviewTip: 'Emphasize idempotency, ledger correctness, reconciliation, and failure-safe compensation.',
    simulatorDemo: { description: 'Payment architecture with fraud, settlement queue, and ledger path.', instruction: 'Observe gateway-limited ingress, fraud scoring, and asynchronous settlement/ledger updates.', simulationAutoStart: true, setupNodes: [{ type: 'loadBalancer', label: 'LB', position: { x: 0, y: 250 }, data: { throughput: 60000, latency: 2, capacity: 250000 } }, { type: 'apiGateway', label: 'API Gateway', position: { x: 180, y: 250 }, data: { throughput: 30000, latency: 8, capacity: 120000 } }, { type: 'rateLimiter', label: 'Rate Limiter', position: { x: 360, y: 250 }, data: { throughput: 25000, latency: 1, capacity: 100000 } }, { type: 'service', label: 'Payment Service', position: { x: 540, y: 250 }, data: { throughput: 12000, latency: 25, capacity: 60000 } }, { type: 'database', label: 'Payment DB', position: { x: 740, y: 180 }, data: { throughput: 7000, latency: 8, capacity: 30000 } }, { type: 'service', label: 'Fraud Service', position: { x: 740, y: 320 }, data: { throughput: 9000, latency: 18, capacity: 50000 } }, { type: 'queue', label: 'Settlement Queue', position: { x: 940, y: 250 }, data: { throughput: 60000, latency: 2, capacity: 500000 } }, { type: 'worker', label: 'Settlement Worker', position: { x: 1140, y: 220 }, data: { throughput: 5000, latency: 60, capacity: 25000 } }, { type: 'database', label: 'Ledger DB', position: { x: 1140, y: 360 }, data: { throughput: 8000, latency: 10, capacity: 40000 } }, { type: 'service', label: 'Webhook Service', position: { x: 1340, y: 250 }, data: { throughput: 8000, latency: 20, capacity: 30000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 3 }, { source: 3, target: 4 }, { source: 3, target: 5 }, { source: 3, target: 6 }, { source: 6, target: 7 }, { source: 7, target: 8 }, { source: 7, target: 9 }] },
    readContent: `# Design a Payment System

This is a full interview-style system design walkthrough. The right way to answer is not to jump into random components. Start by framing scope, quantify scale, draw a clean architecture, deep dive into one or two hard parts, and close with explicit tradeoffs.

## 1) Clarify Requirements

- Functional goals: authorize, capture, settle, refund, and notify merchant systems.
- Non-functional goals: correctness-first processing, strong auditability, and high fraud resistance.
- Scale assumptions: millions of daily transactions with peak spikes tied to commerce events.
- Compliance constraints include PCI DSS scope reduction and secure tokenization strategy.

A clean requirement section usually separates functional and non-functional goals. Functional goals define user-visible behavior. Non-functional goals define scale, latency, consistency, availability, and durability expectations.

## 2) Back-of-Envelope Estimation

- Transaction TPS may look moderate, but reliability expectations are strict and retries amplify load.
- Ledger writes and webhook delivery generate additional side-channel traffic.
- Fraud checks can be synchronous for high-risk flows and asynchronous for enrichment.
- Reconciliation jobs require batch processing against processor statements.

In interviews, exact values are less important than order of magnitude reasoning and transparent assumptions. Say your assumptions out loud and update them if the interviewer provides better constraints.

## 3) High-Level Architecture

- Clients hit API gateway and rate limiter before payment orchestration service.
- Payment service persists payment intent and lifecycle transitions with idempotency key semantics.
- Fraud service scores transactions and can step-up verification paths.
- Settlement workers and ledger writers run asynchronously with immutable journal entries.

A good architecture answer traces key flows end-to-end: ingest path, read path, write path, async path, and failure handling path. Label each major arrow by protocol or event mechanism and identify where caching, queuing, and persistence are used.

## 4) Deep Dive: Hard Parts

- Exactly-once effects are implemented as at-least-once transport plus idempotent processing.
- Double-entry ledger tracks balanced debits and credits for every money movement.
- Webhook delivery is retried with signatures and replay-safe event IDs.
- Reconciliation compares internal ledger with acquirer and bank reports to detect mismatches.

This section differentiates strong candidates. Pick one hard problem and show concrete mechanics, not generic statements. For example, discuss idempotency keys, partitioning keys, consistency model, replay strategy, or fallback behavior under degraded dependencies.

## 5) Data Model and Storage Strategy

Define the core entities and the most important query patterns. Choose storage systems by access pattern, not habit. Transactional writes and strict constraints often fit relational stores. High write throughput and time-ordered access may fit wide-column stores. Search and relevance ranking may require specialized indexes. Blobs and media belong in object storage behind CDN delivery.

## 6) Reliability, Security, and Operations

Cover timeouts, retries with backoff, dead-letter handling, rate limiting, and observability. Mention metrics, logs, and traces together. Include backup/restore and disaster recovery posture where appropriate. For public endpoints, include authentication, authorization, abuse prevention, and transport security.

## 7) Tradeoffs and Scaling Path

- Strong consistency in core ledger is prioritized over minimal latency.
- Fraud strictness reduces losses but can increase false declines and user friction.
- Sync confirmation gives certainty but can increase checkout latency; async update smooths UX.
- More compliance controls increase development overhead but reduce existential risk.

End with what you would do next as load grows: cache hit-rate improvements, partitioning/sharding, regional expansion, asynchronous fan-out, or precomputation. Show you understand that architecture evolves in stages.

> ANALOGY: Payments are like accounting books: every entry must balance, and corrections are explicit entries, not erasures.
> NUMBERS: At 10 million transactions per day, average throughput is around low hundreds TPS with higher peak multipliers.
> IMPORTANT: Never process financial side effects without idempotency and immutable ledger records.
> INTERVIEW TIP: Emphasize idempotency, ledger correctness, reconciliation, and failure-safe compensation.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'design-payment-system-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'design-payment-system-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'design-payment-system-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'design-payment-system-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'design-payment-system-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'design-payment-system-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'design-video-platform',
    title: 'Design a Video Platform',
    interviewTip: 'Separate upload/transcoding pipeline from playback metadata and recommendation serving path.',
    simulatorDemo: { description: 'Video upload and playback architecture with transcoding pipeline and metadata API path.', instruction: 'Watch uploads queue into transcoders while playback requests use metadata and CDN path.', simulationAutoStart: true, setupNodes: [{ type: 'service', label: 'Upload Service', position: { x: 0, y: 180 }, data: { throughput: 5000, latency: 30, capacity: 20000 } }, { type: 'queue', label: 'Transcode Queue', position: { x: 220, y: 180 }, data: { throughput: 50000, latency: 2, capacity: 800000 } }, { type: 'worker', label: 'Transcoder Workers', position: { x: 440, y: 180 }, data: { throughput: 4000, latency: 120, capacity: 15000 } }, { type: 'database', label: 'Object Storage', position: { x: 660, y: 180 }, data: { throughput: 20000, latency: 8, capacity: 90000 } }, { type: 'cdn', label: 'CDN', position: { x: 880, y: 180 }, data: { throughput: 400000, latency: 4, capacity: 1000000 } }, { type: 'loadBalancer', label: 'LB', position: { x: 0, y: 360 }, data: { throughput: 80000, latency: 2, capacity: 300000 } }, { type: 'service', label: 'Video API', position: { x: 220, y: 360 }, data: { throughput: 30000, latency: 12, capacity: 120000 } }, { type: 'database', label: 'Metadata DB', position: { x: 440, y: 360 }, data: { throughput: 12000, latency: 9, capacity: 40000 } }, { type: 'cache', label: 'Metadata Cache', position: { x: 660, y: 360 }, data: { throughput: 120000, latency: 1, capacity: 500000 } }, { type: 'service', label: 'Recommendation Service', position: { x: 880, y: 360 }, data: { throughput: 15000, latency: 25, capacity: 60000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 3 }, { source: 3, target: 4 }, { source: 5, target: 6 }, { source: 6, target: 7 }, { source: 6, target: 8 }, { source: 6, target: 9 }, { source: 9, target: 8 }, { source: 4, target: 9 }] },
    readContent: `# Design a Video Platform

This is a full interview-style system design walkthrough. The right way to answer is not to jump into random components. Start by framing scope, quantify scale, draw a clean architecture, deep dive into one or two hard parts, and close with explicit tradeoffs.

## 1) Clarify Requirements

- Functional goals: upload videos, transcode to multiple bitrates, stream playback globally, track views.
- Non-functional goals: high availability playback, low startup delay, and efficient global content delivery.
- Scale assumptions include billions of daily plays and heavy continuous upload volume.
- Product constraints include adaptive bitrate and recommendation relevance for engagement.

A clean requirement section usually separates functional and non-functional goals. Functional goals define user-visible behavior. Non-functional goals define scale, latency, consistency, availability, and durability expectations.

## 2) Back-of-Envelope Estimation

- View traffic dominates upload traffic by large multiple and requires CDN-heavy architecture.
- Raw storage growth is substantial and must account for multiple transcoded renditions.
- Metadata and interaction events are smaller but high volume and suitable for separate analytical paths.
- Playback egress cost is often one of the largest platform expenses.

In interviews, exact values are less important than order of magnitude reasoning and transparent assumptions. Say your assumptions out loud and update them if the interviewer provides better constraints.

## 3) High-Level Architecture

- Upload service writes objects to staging storage and emits transcoding jobs to queue.
- Worker fleet transcodes into multiple resolutions and codecs, then stores final artifacts in object storage.
- CDN serves playback with edge caching and origin pull fallback.
- API stack serves metadata, search, recommendations, and playback session control.

A good architecture answer traces key flows end-to-end: ingest path, read path, write path, async path, and failure handling path. Label each major arrow by protocol or event mechanism and identify where caching, queuing, and persistence are used.

## 4) Deep Dive: Hard Parts

- Adaptive bitrate protocols select segment quality based on real-time network conditions.
- View counting should be buffered/aggregated to avoid hot-row write contention.
- Recommendation pipeline combines batch model training and online ranking features.
- Integrity checks and moderation can be integrated into asynchronous upload workflow.

This section differentiates strong candidates. Pick one hard problem and show concrete mechanics, not generic statements. For example, discuss idempotency keys, partitioning keys, consistency model, replay strategy, or fallback behavior under degraded dependencies.

## 5) Data Model and Storage Strategy

Define the core entities and the most important query patterns. Choose storage systems by access pattern, not habit. Transactional writes and strict constraints often fit relational stores. High write throughput and time-ordered access may fit wide-column stores. Search and relevance ranking may require specialized indexes. Blobs and media belong in object storage behind CDN delivery.

## 6) Reliability, Security, and Operations

Cover timeouts, retries with backoff, dead-letter handling, rate limiting, and observability. Mention metrics, logs, and traces together. Include backup/restore and disaster recovery posture where appropriate. For public endpoints, include authentication, authorization, abuse prevention, and transport security.

## 7) Tradeoffs and Scaling Path

- More renditions improve playback quality but increase transcoding/storage cost.
- Aggressive edge caching cuts origin load but may delay metadata freshness.
- Real-time recommendation increases relevance but raises serving complexity.
- Strict moderation reduces harmful content risk but can delay publish latency.

End with what you would do next as load grows: cache hit-rate improvements, partitioning/sharding, regional expansion, asynchronous fan-out, or precomputation. Show you understand that architecture evolves in stages.

> ANALOGY: Video platform is like a global TV network with central production and distributed local broadcasters.
> NUMBERS: High-scale video platforms often process massive daily egress; CDN offload ratio is a primary cost lever.
> IMPORTANT: Never route large media payloads through app servers; use object storage and CDN paths.
> INTERVIEW TIP: Separate upload/transcoding pipeline from playback metadata and recommendation serving path.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'design-video-platform-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'design-video-platform-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'design-video-platform-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'design-video-platform-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'design-video-platform-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'design-video-platform-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'design-ride-sharing',
    title: 'Design Ride Sharing',
    interviewTip: 'Highlight geospatial matching, trip state machine, and real-time location update pipeline.',
    simulatorDemo: { description: 'Ride-sharing architecture with location index, matching engine, trip and payment services.', instruction: 'Observe rider request path through matching and trip lifecycle with notification branch.', simulationAutoStart: true, setupNodes: [{ type: 'loadBalancer', label: 'LB', position: { x: 0, y: 250 }, data: { throughput: 90000, latency: 2, capacity: 350000 } }, { type: 'apiGateway', label: 'API Gateway', position: { x: 180, y: 250 }, data: { throughput: 50000, latency: 8, capacity: 200000 } }, { type: 'service', label: 'Rider Service', position: { x: 360, y: 180 }, data: { throughput: 20000, latency: 10, capacity: 90000 } }, { type: 'service', label: 'Matching Service', position: { x: 560, y: 180 }, data: { throughput: 18000, latency: 20, capacity: 80000 } }, { type: 'cache', label: 'Redis Geo', position: { x: 760, y: 180 }, data: { throughput: 150000, latency: 1, capacity: 700000 } }, { type: 'service', label: 'Trip Service', position: { x: 560, y: 320 }, data: { throughput: 15000, latency: 15, capacity: 70000 } }, { type: 'database', label: 'Trip DB', position: { x: 760, y: 320 }, data: { throughput: 9000, latency: 9, capacity: 40000 } }, { type: 'service', label: 'Payment Service', position: { x: 960, y: 320 }, data: { throughput: 8000, latency: 18, capacity: 35000 } }, { type: 'queue', label: 'Notification Queue', position: { x: 960, y: 180 }, data: { throughput: 50000, latency: 3, capacity: 500000 } }, { type: 'worker', label: 'Notification Worker', position: { x: 1160, y: 180 }, data: { throughput: 12000, latency: 25, capacity: 50000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 3 }, { source: 3, target: 4 }, { source: 1, target: 5 }, { source: 5, target: 6 }, { source: 5, target: 7 }, { source: 5, target: 8 }, { source: 8, target: 9 }] },
    readContent: `# Design Ride Sharing

This is a full interview-style system design walkthrough. The right way to answer is not to jump into random components. Start by framing scope, quantify scale, draw a clean architecture, deep dive into one or two hard parts, and close with explicit tradeoffs.

## 1) Clarify Requirements

- Functional goals: rider request, driver matching, ETA, trip lifecycle, payment, and notifications.
- Non-functional goals: low match latency, high availability, and correct trip/payment state transitions.
- Scale assumptions include millions of concurrent drivers and high burst request windows.
- Geospatial accuracy and freshness are central for matching quality.

A clean requirement section usually separates functional and non-functional goals. Functional goals define user-visible behavior. Non-functional goals define scale, latency, consistency, availability, and durability expectations.

## 2) Back-of-Envelope Estimation

- Location updates create continuous write load independent of ride request volume.
- Match requests require low-latency nearest-driver search under dynamic supply conditions.
- Trip history and billing records require durable transactional storage.
- Notification and status fan-out should be asynchronous where possible.

In interviews, exact values are less important than order of magnitude reasoning and transparent assumptions. Say your assumptions out loud and update them if the interviewer provides better constraints.

## 3) High-Level Architecture

- API gateway routes to rider service, matching service, trip service, and payment flows.
- Driver location service stores live coordinates in geo-indexed in-memory store.
- Matching service computes candidate drivers and dispatches requests.
- Trip service manages lifecycle state machine and emits events for downstream systems.

A good architecture answer traces key flows end-to-end: ingest path, read path, write path, async path, and failure handling path. Label each major arrow by protocol or event mechanism and identify where caching, queuing, and persistence are used.

## 4) Deep Dive: Hard Parts

- Geohash or grid indexing accelerates nearest-neighbor candidate lookup.
- Matching fairness may balance distance, acceptance probability, and driver utilization.
- Surge pricing models depend on supply-demand imbalance by region/time.
- Trip state transitions must be validated strictly to prevent invalid billing states.

This section differentiates strong candidates. Pick one hard problem and show concrete mechanics, not generic statements. For example, discuss idempotency keys, partitioning keys, consistency model, replay strategy, or fallback behavior under degraded dependencies.

## 5) Data Model and Storage Strategy

Define the core entities and the most important query patterns. Choose storage systems by access pattern, not habit. Transactional writes and strict constraints often fit relational stores. High write throughput and time-ordered access may fit wide-column stores. Search and relevance ranking may require specialized indexes. Blobs and media belong in object storage behind CDN delivery.

## 6) Reliability, Security, and Operations

Cover timeouts, retries with backoff, dead-letter handling, rate limiting, and observability. Mention metrics, logs, and traces together. Include backup/restore and disaster recovery posture where appropriate. For public endpoints, include authentication, authorization, abuse prevention, and transport security.

## 7) Tradeoffs and Scaling Path

- More frequent location updates improve ETA accuracy but increase network and compute cost.
- Aggressive dispatch timeout improves rider speed but may lower driver acceptance quality.
- Centralized matcher simplifies policy but can become bottleneck without partitioning.
- Strict payment consistency can add latency but is necessary for trust and compliance.

End with what you would do next as load grows: cache hit-rate improvements, partitioning/sharding, regional expansion, asynchronous fan-out, or precomputation. Show you understand that architecture evolves in stages.

> ANALOGY: Ride matching is like dispatching nearest available ambulance with traffic-aware routing and strict state tracking.
> NUMBERS: Large ride platforms process high-frequency location updates and demand sub-second matching decisions.
> IMPORTANT: Treat trip and payment transitions as state machines with explicit validation.
> INTERVIEW TIP: Highlight geospatial matching, trip state machine, and real-time location update pipeline.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'design-ride-sharing-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'design-ride-sharing-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'design-ride-sharing-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'design-ride-sharing-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'design-ride-sharing-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'design-ride-sharing-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'design-search-engine',
    title: 'Design a Search Engine',
    interviewTip: 'Separate crawl/index pipeline from query-serving pipeline and explain inverted index mechanics.',
    simulatorDemo: { description: 'Search architecture with crawl-index pipeline and query-ranking serving path.', instruction: 'Observe crawler events build index shards while query service pulls ranked results with cache assist.', simulationAutoStart: true, setupNodes: [{ type: 'loadBalancer', label: 'LB', position: { x: 0, y: 120 }, data: { throughput: 120000, latency: 2, capacity: 500000 } }, { type: 'service', label: 'Query Service', position: { x: 220, y: 120 }, data: { throughput: 60000, latency: 10, capacity: 250000 } }, { type: 'database', label: 'Inverted Index Shards', position: { x: 440, y: 120 }, data: { throughput: 80000, latency: 6, capacity: 300000 } }, { type: 'service', label: 'Ranking Service', position: { x: 660, y: 120 }, data: { throughput: 40000, latency: 18, capacity: 180000 } }, { type: 'cache', label: 'Query Cache', position: { x: 880, y: 120 }, data: { throughput: 150000, latency: 1, capacity: 600000 } }, { type: 'queue', label: 'Crawl Frontier Queue', position: { x: 0, y: 340 }, data: { throughput: 60000, latency: 2, capacity: 1000000 } }, { type: 'worker', label: 'Crawler Workers', position: { x: 220, y: 340 }, data: { throughput: 20000, latency: 40, capacity: 90000 } }, { type: 'service', label: 'Index Builder', position: { x: 440, y: 340 }, data: { throughput: 15000, latency: 60, capacity: 70000 } }, { type: 'database', label: 'Index Store', position: { x: 660, y: 340 }, data: { throughput: 30000, latency: 8, capacity: 120000 } }, { type: 'service', label: 'Autocomplete Service', position: { x: 880, y: 340 }, data: { throughput: 25000, latency: 7, capacity: 100000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 1, target: 3 }, { source: 3, target: 4 }, { source: 5, target: 6 }, { source: 6, target: 7 }, { source: 7, target: 8 }, { source: 8, target: 2 }, { source: 1, target: 9 }] },
    readContent: `# Design a Search Engine

This is a full interview-style system design walkthrough. The right way to answer is not to jump into random components. Start by framing scope, quantify scale, draw a clean architecture, deep dive into one or two hard parts, and close with explicit tradeoffs.

## 1) Clarify Requirements

- Functional goals: crawl web content, build index, serve ranked search results, autocomplete and spell correction.
- Non-functional goals: high query throughput, low query latency, and robust indexing freshness strategy.
- Scale assumptions include very large document corpus and high sustained search QPS.
- Quality goals include relevance ranking and abuse/spam resistance.

A clean requirement section usually separates functional and non-functional goals. Functional goals define user-visible behavior. Non-functional goals define scale, latency, consistency, availability, and durability expectations.

## 2) Back-of-Envelope Estimation

- Query serving and crawling have different throughput and latency profiles and should scale independently.
- Index storage can be very large; compression and shard strategy are mandatory.
- Hot query caching dramatically reduces median and tail latency for repeated terms.
- Crawl bandwidth and politeness constraints limit refresh rate for parts of the corpus.

In interviews, exact values are less important than order of magnitude reasoning and transparent assumptions. Say your assumptions out loud and update them if the interviewer provides better constraints.

## 3) High-Level Architecture

- Query path: load balancer to query service to distributed inverted index and ranking layer.
- Crawler path: frontier queue to crawler workers to parser/index builder pipeline.
- Index builder writes shard segments and metadata for serving fleet.
- Caches store frequent query results and autocomplete prefixes.

A good architecture answer traces key flows end-to-end: ingest path, read path, write path, async path, and failure handling path. Label each major arrow by protocol or event mechanism and identify where caching, queuing, and persistence are used.

## 4) Deep Dive: Hard Parts

- Inverted index maps terms to posting lists with document IDs and optional field/position data.
- Ranking combines lexical relevance, link-based signals, freshness, and behavioral signals.
- Query processing includes tokenization, normalization, expansion, and result blending.
- Autocomplete is often backed by trie/prefix structures with popularity scoring.

This section differentiates strong candidates. Pick one hard problem and show concrete mechanics, not generic statements. For example, discuss idempotency keys, partitioning keys, consistency model, replay strategy, or fallback behavior under degraded dependencies.

## 5) Data Model and Storage Strategy

Define the core entities and the most important query patterns. Choose storage systems by access pattern, not habit. Transactional writes and strict constraints often fit relational stores. High write throughput and time-ordered access may fit wide-column stores. Search and relevance ranking may require specialized indexes. Blobs and media belong in object storage behind CDN delivery.

## 6) Reliability, Security, and Operations

Cover timeouts, retries with backoff, dead-letter handling, rate limiting, and observability. Mention metrics, logs, and traces together. Include backup/restore and disaster recovery posture where appropriate. For public endpoints, include authentication, authorization, abuse prevention, and transport security.

## 7) Tradeoffs and Scaling Path

- Fresh index updates improve relevance but increase indexing infrastructure cost.
- More ranking features increase quality but raise query latency and compute cost.
- Aggressive caching reduces cost but can serve slightly stale rankings.
- Distributed index sharding improves scale but complicates query fan-out and merge.

End with what you would do next as load grows: cache hit-rate improvements, partitioning/sharding, regional expansion, asynchronous fan-out, or precomputation. Show you understand that architecture evolves in stages.

> ANALOGY: Search is like a massive library catalog where index cards point to shelf locations and ranking orders recommendations.
> NUMBERS: High-scale search often targets around 100k QPS class workloads with large distributed index footprints.
> IMPORTANT: Without a strong inverted index and ranking strategy, search quality and latency both fail.
> INTERVIEW TIP: Separate crawl/index pipeline from query-serving pipeline and explain inverted index mechanics.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'design-search-engine-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'design-search-engine-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'design-search-engine-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'design-search-engine-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'design-search-engine-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'design-search-engine-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'design-file-storage',
    title: 'Design File Storage',
    interviewTip: 'Discuss chunking, deduplication, versioning, and sync conflict resolution explicitly.',
    simulatorDemo: { description: 'File storage architecture with metadata, block storage, and sync notification path.', instruction: 'Observe metadata operations and block transfer path with notification fan-out to clients.', simulationAutoStart: true, setupNodes: [{ type: 'loadBalancer', label: 'LB', position: { x: 0, y: 250 }, data: { throughput: 90000, latency: 2, capacity: 350000 } }, { type: 'service', label: 'API Service', position: { x: 180, y: 250 }, data: { throughput: 40000, latency: 10, capacity: 180000 } }, { type: 'service', label: 'Metadata Service', position: { x: 380, y: 180 }, data: { throughput: 20000, latency: 12, capacity: 90000 } }, { type: 'database', label: 'Metadata DB', position: { x: 580, y: 180 }, data: { throughput: 12000, latency: 8, capacity: 50000 } }, { type: 'service', label: 'Block Service', position: { x: 380, y: 320 }, data: { throughput: 25000, latency: 15, capacity: 110000 } }, { type: 'database', label: 'Block Storage', position: { x: 580, y: 320 }, data: { throughput: 40000, latency: 6, capacity: 200000 } }, { type: 'service', label: 'Sync Service', position: { x: 780, y: 250 }, data: { throughput: 18000, latency: 14, capacity: 80000 } }, { type: 'queue', label: 'Notification Queue', position: { x: 980, y: 250 }, data: { throughput: 50000, latency: 3, capacity: 600000 } }, { type: 'worker', label: 'Client Notify Worker', position: { x: 1180, y: 250 }, data: { throughput: 15000, latency: 25, capacity: 70000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 3 }, { source: 1, target: 4 }, { source: 4, target: 5 }, { source: 1, target: 6 }, { source: 6, target: 7 }, { source: 7, target: 8 }] },
    readContent: `# Design File Storage

This is a full interview-style system design walkthrough. The right way to answer is not to jump into random components. Start by framing scope, quantify scale, draw a clean architecture, deep dive into one or two hard parts, and close with explicit tradeoffs.

## 1) Clarify Requirements

- Functional goals: upload/download files, sync across devices, share links, and retain version history.
- Non-functional goals: durability, efficient bandwidth usage, and incremental synchronization.
- Scale assumptions include very large user base and frequent daily file updates.
- Product behavior includes conflict handling for concurrent edits and offline clients.

A clean requirement section usually separates functional and non-functional goals. Functional goals define user-visible behavior. Non-functional goals define scale, latency, consistency, availability, and durability expectations.

## 2) Back-of-Envelope Estimation

- Metadata traffic and block storage traffic should be treated as separate scaling dimensions.
- Chunk-level dedup can significantly reduce storage cost for repeated or similar files.
- Sync polling or push event volume can be substantial with many active clients.
- Version retention policy strongly influences long-term storage growth.

In interviews, exact values are less important than order of magnitude reasoning and transparent assumptions. Say your assumptions out loud and update them if the interviewer provides better constraints.

## 3) High-Level Architecture

- Metadata service stores file tree, ownership, permissions, and version pointers.
- Block service manages chunk upload/download and dedup hash index.
- Object storage holds immutable file blocks while metadata DB tracks manifests.
- Sync service emits change notifications to clients for near-real-time updates.

A good architecture answer traces key flows end-to-end: ingest path, read path, write path, async path, and failure handling path. Label each major arrow by protocol or event mechanism and identify where caching, queuing, and persistence are used.

## 4) Deep Dive: Hard Parts

- Chunking supports resumable uploads and partial sync for modified large files.
- Content hash indexing enables dedup by reusing existing block references.
- Conflict resolution can use version vectors, last-write-wins, or explicit user merge prompts.
- Client sync agents maintain local index and apply server deltas safely.

This section differentiates strong candidates. Pick one hard problem and show concrete mechanics, not generic statements. For example, discuss idempotency keys, partitioning keys, consistency model, replay strategy, or fallback behavior under degraded dependencies.

## 5) Data Model and Storage Strategy

Define the core entities and the most important query patterns. Choose storage systems by access pattern, not habit. Transactional writes and strict constraints often fit relational stores. High write throughput and time-ordered access may fit wide-column stores. Search and relevance ranking may require specialized indexes. Blobs and media belong in object storage behind CDN delivery.

## 6) Reliability, Security, and Operations

Cover timeouts, retries with backoff, dead-letter handling, rate limiting, and observability. Mention metrics, logs, and traces together. Include backup/restore and disaster recovery posture where appropriate. For public endpoints, include authentication, authorization, abuse prevention, and transport security.

## 7) Tradeoffs and Scaling Path

- Smaller chunks improve delta efficiency but increase metadata overhead.
- Aggressive dedup saves storage but raises CPU/hash computation cost.
- Last-write-wins is simple but may lose user intent in concurrent edits.
- Push sync improves freshness but increases persistent connection complexity.

End with what you would do next as load grows: cache hit-rate improvements, partitioning/sharding, regional expansion, asynchronous fan-out, or precomputation. Show you understand that architecture evolves in stages.

> ANALOGY: File sync is like shipping packages made of numbered boxes; identical boxes are reused instead of copied.
> NUMBERS: Chunk sizes are often selected to balance transfer efficiency and metadata overhead under typical file distributions.
> IMPORTANT: Separate metadata consistency from blob durability; they have different requirements and scaling patterns.
> INTERVIEW TIP: Discuss chunking, deduplication, versioning, and sync conflict resolution explicitly.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'design-file-storage-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'design-file-storage-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'design-file-storage-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'design-file-storage-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'design-file-storage-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'design-file-storage-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'design-notification-system',
    title: 'Design a Notification System',
    interviewTip: 'Cover multi-channel routing, user preferences, priority queues, and delivery tracking.',
    simulatorDemo: { description: 'Notification architecture with router, channel workers, and tracking analytics path.', instruction: 'Observe priority queue routing into push, email, and SMS workers with tracking feedback.', simulationAutoStart: true, setupNodes: [{ type: 'service', label: 'Producer Services', position: { x: 0, y: 250 }, data: { throughput: 70000, latency: 5, capacity: 250000 } }, { type: 'kafka', label: 'Notification Queue', position: { x: 220, y: 250 }, data: { throughput: 500000, latency: 3, capacity: 4000000 } }, { type: 'service', label: 'Router Service', position: { x: 440, y: 250 }, data: { throughput: 80000, latency: 10, capacity: 300000 } }, { type: 'service', label: 'Preference Service', position: { x: 660, y: 120 }, data: { throughput: 30000, latency: 8, capacity: 120000 } }, { type: 'database', label: 'Preference DB', position: { x: 860, y: 120 }, data: { throughput: 15000, latency: 9, capacity: 60000 } }, { type: 'worker', label: 'Push Worker', position: { x: 660, y: 250 }, data: { throughput: 50000, latency: 20, capacity: 180000 } }, { type: 'worker', label: 'Email Worker', position: { x: 660, y: 340 }, data: { throughput: 30000, latency: 30, capacity: 120000 } }, { type: 'worker', label: 'SMS Worker', position: { x: 660, y: 430 }, data: { throughput: 15000, latency: 35, capacity: 70000 } }, { type: 'service', label: 'Tracking Service', position: { x: 880, y: 300 }, data: { throughput: 60000, latency: 12, capacity: 220000 } }, { type: 'database', label: 'Analytics DB', position: { x: 1080, y: 300 }, data: { throughput: 20000, latency: 10, capacity: 90000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 3 }, { source: 3, target: 4 }, { source: 2, target: 5 }, { source: 2, target: 6 }, { source: 2, target: 7 }, { source: 5, target: 8 }, { source: 6, target: 8 }, { source: 7, target: 8 }, { source: 8, target: 9 }] },
    readContent: `# Design a Notification System

This is a full interview-style system design walkthrough. The right way to answer is not to jump into random components. Start by framing scope, quantify scale, draw a clean architecture, deep dive into one or two hard parts, and close with explicit tradeoffs.

## 1) Clarify Requirements

- Functional goals: send notifications via push, email, SMS, and in-app channels.
- Non-functional goals: reliable delivery, preference compliance, and provider failover resilience.
- Scale assumptions include around billion-notification daily volume across channels.
- Product constraints include per-user throttles and separation of transactional vs marketing traffic.

A clean requirement section usually separates functional and non-functional goals. Functional goals define user-visible behavior. Non-functional goals define scale, latency, consistency, availability, and durability expectations.

## 2) Back-of-Envelope Estimation

- Throughput should be partitioned by channel and priority to avoid cross-channel interference.
- Provider API limits and retries create variable latency and backpressure risk.
- Tracking events for delivered/opened/clicked create large analytics streams.
- Template rendering and localization can be a significant compute cost under campaign peaks.

In interviews, exact values are less important than order of magnitude reasoning and transparent assumptions. Say your assumptions out loud and update them if the interviewer provides better constraints.

## 3) High-Level Architecture

- Producer services publish notification intents into partitioned queue topics.
- Router service applies preference rules and chooses channel or fallback chain.
- Channel workers integrate with APNs/FCM, SES/SendGrid, and SMS providers.
- Tracking service consumes provider callbacks and updates analytics store.

A good architecture answer traces key flows end-to-end: ingest path, read path, write path, async path, and failure handling path. Label each major arrow by protocol or event mechanism and identify where caching, queuing, and persistence are used.

## 4) Deep Dive: Hard Parts

- Preference engine must support opt-in/opt-out by channel and notification category.
- Priority scheduling isolates critical transactional alerts from bulk campaigns.
- At-least-once delivery requires dedup keys to avoid user spam from retries.
- Rate limiter prevents per-user over-notification and protects provider quotas.

This section differentiates strong candidates. Pick one hard problem and show concrete mechanics, not generic statements. For example, discuss idempotency keys, partitioning keys, consistency model, replay strategy, or fallback behavior under degraded dependencies.

## 5) Data Model and Storage Strategy

Define the core entities and the most important query patterns. Choose storage systems by access pattern, not habit. Transactional writes and strict constraints often fit relational stores. High write throughput and time-ordered access may fit wide-column stores. Search and relevance ranking may require specialized indexes. Blobs and media belong in object storage behind CDN delivery.

## 6) Reliability, Security, and Operations

Cover timeouts, retries with backoff, dead-letter handling, rate limiting, and observability. Mention metrics, logs, and traces together. Include backup/restore and disaster recovery posture where appropriate. For public endpoints, include authentication, authorization, abuse prevention, and transport security.

## 7) Tradeoffs and Scaling Path

- Higher reliability retries improve delivery but can increase duplicate risk without idempotency.
- Real-time sending improves immediacy but batch processing is more cost-efficient for campaigns.
- Multi-provider redundancy improves resilience but increases integration complexity.
- Rich personalization increases engagement while raising compute and data requirements.

End with what you would do next as load grows: cache hit-rate improvements, partitioning/sharding, regional expansion, asynchronous fan-out, or precomputation. Show you understand that architecture evolves in stages.

> ANALOGY: A notification platform is like a logistics hub routing packages by urgency, destination, and transport method.
> NUMBERS: At very high scale, queue partitioning by priority and channel is essential for predictable delivery latency.
> IMPORTANT: Always enforce user preferences and unsubscribe rules before dispatching channel messages.
> INTERVIEW TIP: Cover multi-channel routing, user preferences, priority queues, and delivery tracking.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'design-notification-system-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'design-notification-system-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'design-notification-system-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'design-notification-system-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'design-notification-system-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'design-notification-system-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'design-rate-limiter',
    title: 'Design a Rate Limiter',
    interviewTip: 'Explain algorithm choice, distributed atomicity with Redis/Lua, and response semantics including headers.',
    simulatorDemo: { description: 'Rate limiter architecture with atomic counter store and protected downstream API.', instruction: 'Observe limiter absorb spikes and protect API/service/database from overload.', simulationAutoStart: true, setupNodes: [{ type: 'loadBalancer', label: 'Client Ingress', position: { x: 0, y: 250 }, data: { throughput: 150000, latency: 2, capacity: 600000 } }, { type: 'rateLimiter', label: 'Rate Limiter Service', position: { x: 220, y: 250 }, data: { throughput: 100000, latency: 1, capacity: 400000 } }, { type: 'cache', label: 'Redis Counters', position: { x: 440, y: 180 }, data: { throughput: 300000, latency: 1, capacity: 1000000 } }, { type: 'service', label: 'Config Service', position: { x: 440, y: 320 }, data: { throughput: 20000, latency: 6, capacity: 80000 } }, { type: 'service', label: 'API Service', position: { x: 660, y: 250 }, data: { throughput: 30000, latency: 15, capacity: 150000 } }, { type: 'database', label: 'Application DB', position: { x: 880, y: 250 }, data: { throughput: 10000, latency: 10, capacity: 50000 } }, { type: 'queue', label: 'Rejected Events Queue', position: { x: 660, y: 420 }, data: { throughput: 50000, latency: 3, capacity: 400000 } }, { type: 'worker', label: 'Audit Worker', position: { x: 880, y: 420 }, data: { throughput: 6000, latency: 30, capacity: 40000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 3, target: 1 }, { source: 1, target: 4 }, { source: 4, target: 5 }, { source: 1, target: 6 }, { source: 6, target: 7 }] },
    readContent: `# Design a Rate Limiter

This is a full interview-style system design walkthrough. The right way to answer is not to jump into random components. Start by framing scope, quantify scale, draw a clean architecture, deep dive into one or two hard parts, and close with explicit tradeoffs.

## 1) Clarify Requirements

- Functional goals: enforce request limits per key dimensions such as user, IP, endpoint, and global quotas.
- Non-functional goals: minimal added latency, high availability, and deterministic policy behavior.
- Scale assumptions include around hundred-thousand QPS through limiter path.
- Operational goals include runtime policy updates without full redeploy.

A clean requirement section usually separates functional and non-functional goals. Functional goals define user-visible behavior. Non-functional goals define scale, latency, consistency, availability, and durability expectations.

## 2) Back-of-Envelope Estimation

- At one hundred thousand QPS, limiter backend must support very high atomic counter throughput.
- Added latency budget is commonly sub-millisecond to single-digit milliseconds at P99.
- Policy cardinality influences memory footprint for active counters/windows.
- Burst handling requires algorithm and bucket sizing aligned to client behavior.

In interviews, exact values are less important than order of magnitude reasoning and transparent assumptions. Say your assumptions out loud and update them if the interviewer provides better constraints.

## 3) High-Level Architecture

- Client request first hits rate limiter service before API service execution.
- Limiter service evaluates policy, checks counter/token state in Redis, and decides allow/reject.
- Redis operations use Lua scripts for atomic read-modify-write under concurrency.
- Config service distributes limits dynamically to limiter instances.

A good architecture answer traces key flows end-to-end: ingest path, read path, write path, async path, and failure handling path. Label each major arrow by protocol or event mechanism and identify where caching, queuing, and persistence are used.

## 4) Deep Dive: Hard Parts

- Token bucket supports bursts with controlled sustained rate and is common in production.
- Sliding window counter offers smoother fairness than fixed windows with moderate complexity.
- Distributed race conditions are solved with atomic scripts and key TTL management.
- Rejected responses include 429 plus Retry-After and remaining quota headers where applicable.

This section differentiates strong candidates. Pick one hard problem and show concrete mechanics, not generic statements. For example, discuss idempotency keys, partitioning keys, consistency model, replay strategy, or fallback behavior under degraded dependencies.

## 5) Data Model and Storage Strategy

Define the core entities and the most important query patterns. Choose storage systems by access pattern, not habit. Transactional writes and strict constraints often fit relational stores. High write throughput and time-ordered access may fit wide-column stores. Search and relevance ranking may require specialized indexes. Blobs and media belong in object storage behind CDN delivery.

## 6) Reliability, Security, and Operations

Cover timeouts, retries with backoff, dead-letter handling, rate limiting, and observability. Mention metrics, logs, and traces together. Include backup/restore and disaster recovery posture where appropriate. For public endpoints, include authentication, authorization, abuse prevention, and transport security.

## 7) Tradeoffs and Scaling Path

- Centralized limiter service gives consistency but can become bottleneck without horizontal scale.
- Embedded library is lower latency but harder to coordinate globally across instances.
- Strict global limits improve protection but can reduce elasticity for legitimate spikes.
- Rich per-dimension limits increase control but add configuration and observability complexity.

End with what you would do next as load grows: cache hit-rate improvements, partitioning/sharding, regional expansion, asynchronous fan-out, or precomputation. Show you understand that architecture evolves in stages.

> ANALOGY: A rate limiter is a smart gate that tracks entrants by ticket class and safely throttles crowd surges.
> NUMBERS: For high-throughput APIs, limiter path often targets roughly 100k QPS class and under 1ms decision overhead.
> IMPORTANT: Distributed limiter correctness depends on atomic operations; naive counters produce inconsistent enforcement.
> INTERVIEW TIP: Explain algorithm choice, distributed atomicity with Redis/Lua, and response semantics including headers.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'design-rate-limiter-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'design-rate-limiter-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'design-rate-limiter-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'design-rate-limiter-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'design-rate-limiter-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'design-rate-limiter-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  }
];
