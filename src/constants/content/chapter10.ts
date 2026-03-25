import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_10_TOPICS: Topic[] = [
  {
    id: 'service-to-service-communication',
    title: 'Service-to-Service Communication',
    interviewTip: 'Label every arrow as sync or async and explain failure mode per hop.',
    readContent: `# Service-to-Service Communication
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Synchronous calls use request/response. Caller waits; great for immediate user feedback and simple CRUD paths.
- Asynchronous messaging decouples producers and consumers with queues or event buses; caller continues immediately.
- Most production systems use a hybrid: synchronous at the edge, asynchronous for internal fan-out and long work.
- East-west traffic is internal service-to-service traffic; north-south is client-to-platform ingress/egress.
- Service mesh adds routing, retries, mTLS, circuit breaking, and telemetry without changing business code.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Login/profile reads
- Order placement followed by async fulfillment
- Notification fan-out
- Fraud checks and payment orchestration

## Failure Modes and Trade-Offs
- Cascading failures on slow sync dependencies
- Eventual consistency confusion in async workflows
- Poor tracing across mixed sync and async paths
- Retry storms without backoff and idempotency

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: Synchronous is a phone call where both sides wait; asynchronous is a text message where work continues and replies arrive later.
> INTERVIEW TIP: When drawing service interactions, explicitly annotate protocol and coupling impact for each link.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'service-to-service-communication-q1',
        question: 'A product search endpoint that must return immediately is best as:',
        options: ['Asynchronous pub-sub only', 'Synchronous request-response', 'Batch ETL', 'Offline report generation'],
        correctIndex: 1,
        explanation: 'Interactive user flows usually require immediate synchronous responses.',
      },
      {
        id: 'service-to-service-communication-q2',
        question: 'Which risk grows with deep synchronous chains?',
        options: ['Improved decoupling', 'Cascading latency and failure', 'Lower observability', 'Guaranteed eventual consistency'],
        correctIndex: 1,
        explanation: 'If one dependency is slow, upstream calls stack and degrade.',
      },
      {
        id: 'service-to-service-communication-q3',
        question: 'Best use case for asynchronous communication:',
        options: ['Password validation', 'Immediate auth token issuance', 'Email and report generation', 'Static profile read'],
        correctIndex: 2,
        explanation: 'Background tasks are ideal async candidates.',
      },
      {
        id: 'service-to-service-communication-q4',
        question: 'East-west traffic refers to:',
        options: ['Client to API Gateway', 'Service to service inside the platform', 'CDN edge traffic', 'Database replication only'],
        correctIndex: 1,
        explanation: 'East-west is internal service communication.',
      },
      {
        id: 'service-to-service-communication-q5',
        question: 'A hybrid design usually means:',
        options: ['Everything is synchronous', 'Everything is event-driven', 'Sync for user response, async for downstream processing', 'No queues allowed'],
        correctIndex: 2,
        explanation: 'Hybrid preserves UX while improving internal decoupling.',
      },
      {
        id: 'service-to-service-communication-q6',
        question: 'Service mesh primarily helps with:',
        options: ['Business validation rules', 'Frontend rendering', 'Cross-cutting communication controls', 'Schema design'],
        correctIndex: 2,
        explanation: 'Mesh handles retries, routing, mTLS, and telemetry.',
      }
    ],
  },
  {
    id: 'rest-grpc-graphql',
    title: 'REST, gRPC & GraphQL',
    interviewTip: 'Default to REST outside, gRPC inside, and GraphQL for client-driven aggregation needs.',
    readContent: `# REST, gRPC & GraphQL
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- REST uses HTTP verbs and JSON, easy tooling and broad compatibility.
- gRPC uses protobuf and HTTP/2 with strong schemas and streaming modes.
- GraphQL lets clients request exact fields and reduce over/under-fetching.
- Protocol choice should map to external compatibility, internal latency, and client flexibility.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Public APIs with REST
- Internal low-latency services with gRPC
- Mobile and complex UI data composition with GraphQL
- Polyglot microservices with generated clients

## Failure Modes and Trade-Offs
- Using GraphQL without resolver batching causes N+1 queries
- Using gRPC for browsers without a proxy adds friction
- REST endpoint explosion for complex UIs
- Ignoring schema governance causes contract drift

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> NUMBERS: Typical JSON parsing is 1-5 ms while protobuf is often around 0.1-0.5 ms; protobuf payloads can be roughly 3x smaller for common objects.
> INTERVIEW TIP: Explain protocol selection by requirements, not trend names.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'rest-grpc-graphql-q1',
        question: 'Best default for public third-party API compatibility:',
        options: ['gRPC only', 'REST', 'Raw TCP', 'Kafka topic'],
        correctIndex: 1,
        explanation: 'REST has strongest browser/tooling compatibility.',
      },
      {
        id: 'rest-grpc-graphql-q2',
        question: 'Why protobuf is popular internally:',
        options: ['Human readable', 'Binary compact and strongly typed', 'No schema needed', 'Bigger payloads'],
        correctIndex: 1,
        explanation: 'Protobuf is small, fast, and schema-driven.',
      },
      {
        id: 'rest-grpc-graphql-q3',
        question: 'GraphQL solves which common API issue?',
        options: ['TLS expiration', 'Over-fetching and under-fetching', 'DNS resolution', 'Clock skew'],
        correctIndex: 1,
        explanation: 'Clients request exactly required fields.',
      },
      {
        id: 'rest-grpc-graphql-q4',
        question: 'Native bidirectional streaming is strongest in:',
        options: ['REST', 'gRPC', 'SOAP', 'CSV'],
        correctIndex: 1,
        explanation: 'gRPC supports built-in streaming modes.',
      },
      {
        id: 'rest-grpc-graphql-q5',
        question: 'A downside of GraphQL is:',
        options: ['No schema', 'Cannot query nested data', 'Potential N+1 and variable query cost', 'No browser support'],
        correctIndex: 2,
        explanation: 'Resolver design and query complexity require control.',
      },
      {
        id: 'rest-grpc-graphql-q6',
        question: 'For mobile app with varied screen data needs:',
        options: ['REST with many endpoints only', 'GraphQL is often a strong fit', 'FTP', 'SFTP'],
        correctIndex: 1,
        explanation: 'GraphQL can reduce round trips and payload size.',
      }
    ],
  },
  {
    id: 'async-communication-patterns',
    title: 'Asynchronous Communication Patterns',
    interviewTip: 'Use orchestration for critical business workflows and choreography for non-critical event propagation.',
    readContent: `# Asynchronous Communication Patterns
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Point-to-point queues deliver one message to one worker.
- Pub-sub topics broadcast events to multiple subscribers.
- Request-reply over queues uses correlation IDs for deferred responses.
- Choreography decentralizes flow; orchestration centralizes workflow control.
- Saga coordinates distributed transactions with compensating actions.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Order events fan out to inventory/billing/shipping
- Media processing pipelines
- Credit checks with async replies
- Cross-service business workflows

## Failure Modes and Trade-Offs
- Hard debugging in fully choreographed systems
- Hidden coupling through undocumented events
- Compensation logic bugs in sagas
- Missing correlation IDs break tracing

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: Choreography is a potluck where everyone brings what they think is needed; orchestration is a planner assigning each responsibility.
> INTERVIEW TIP: State explicitly why control plane choice matches business criticality.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'async-communication-patterns-q1',
        question: 'Queue pattern guarantees:',
        options: ['All subscribers process each message', 'One consumer in a group handles each message', 'Global ordering always', 'No retries'],
        correctIndex: 1,
        explanation: 'Point-to-point distributes tasks among workers.',
      },
      {
        id: 'async-communication-patterns-q2',
        question: 'Pub-sub is ideal for:',
        options: ['Single worker task', 'Broadcasting domain events to many services', 'Local file writes', 'Schema migration only'],
        correctIndex: 1,
        explanation: 'Multiple independent consumers need same event.',
      },
      {
        id: 'async-communication-patterns-q3',
        question: 'Async request-reply links response to request via:',
        options: ['TTL', 'Correlation ID', 'DNS CNAME', 'Cookie domain'],
        correctIndex: 1,
        explanation: 'Correlation ID maps deferred reply to original request.',
      },
      {
        id: 'async-communication-patterns-q4',
        question: 'Choreography drawback:',
        options: ['No scalability', 'Hard to understand end-to-end flow', 'Requires monolith', 'No events'],
        correctIndex: 1,
        explanation: 'Distributed responsibility can obscure workflow logic.',
      },
      {
        id: 'async-communication-patterns-q5',
        question: 'Saga handles distributed transactions by:',
        options: ['Global lock only', 'Compensating actions after failures', 'Two-phase commit always', 'Dropping failed steps'],
        correctIndex: 1,
        explanation: 'Sagas rollback business effects with compensations.',
      },
      {
        id: 'async-communication-patterns-q6',
        question: 'Critical multi-step payment flow often prefers:',
        options: ['Pure choreography', 'Orchestration for centralized control', 'No retries', 'No monitoring'],
        correctIndex: 1,
        explanation: 'Centralized orchestration simplifies reliability and auditing.',
      }
    ],
  },
  {
    id: 'service-discovery',
    title: 'Service Discovery',
    interviewTip: 'In Kubernetes interviews, mention Service DNS and health-based pod routing first.',
    readContent: `# Service Discovery
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Dynamic infrastructure means service instances change IPs frequently.
- Client-side discovery pushes instance selection to callers.
- Server-side discovery delegates to proxies or platform routers.
- DNS-based discovery is universal but metadata-limited.
- Kubernetes gives stable Service DNS names and routes to healthy pods.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Kubernetes internal service calls
- Consul-based VM environments
- Eureka in Java ecosystems
- Envoy/mesh-based routing

## Failure Modes and Trade-Offs
- Hardcoded URLs break on instance churn
- Stale DNS caches delay failover
- Client libraries create language lock-in
- Proxy hop can add latency if misconfigured

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: Think of service discovery as a live company directory that updates when people join, move, or leave teams.
> INTERVIEW TIP: Say services register on startup and deregister on shutdown so routing stays current.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'service-discovery-q1',
        question: 'Why hardcoded IPs fail in cloud systems?',
        options: ['Too secure', 'Instances are ephemeral and addresses change', 'Kubernetes forbids IPs', 'DNS cannot resolve'],
        correctIndex: 1,
        explanation: 'Dynamic scheduling changes host identity frequently.',
      },
      {
        id: 'service-discovery-q2',
        question: 'Client-side discovery means:',
        options: ['LB chooses instance', 'Caller queries registry and chooses target', 'No registry required', 'Static hosts file'],
        correctIndex: 1,
        explanation: 'Clients handle instance lookup and load balancing.',
      },
      {
        id: 'service-discovery-q3',
        question: 'Server-side discovery benefit:',
        options: ['Caller must include registry SDK', 'Language-agnostic caller simplicity', 'No extra hops ever', 'No health checks'],
        correctIndex: 1,
        explanation: 'Proxy/platform handles routing details.',
      },
      {
        id: 'service-discovery-q4',
        question: 'DNS discovery limitation:',
        options: ['Cannot return IPs', 'Can suffer from caching staleness and limited metadata', 'Works only in Java', 'No scaling'],
        correctIndex: 1,
        explanation: 'DNS is simple but less expressive than service registries.',
      },
      {
        id: 'service-discovery-q5',
        question: 'In Kubernetes, a Service provides:',
        options: ['Only node IP', 'Stable DNS and virtual IP over pods', 'No routing', 'Only external traffic'],
        correctIndex: 1,
        explanation: 'Service abstraction hides pod churn.',
      },
      {
        id: 'service-discovery-q6',
        question: 'Registry tool commonly used with health checks and KV:',
        options: ['Consul', 'Photoshop', 'Redis CLI', 'Helm'],
        correctIndex: 0,
        explanation: 'Consul supports discovery and health checks.',
      }
    ],
  },
  {
    id: 'api-versioning',
    title: 'API Versioning',
    interviewTip: 'Use /v1 and /v2 for major breaks, keep minor changes backward compatible.',
    readContent: `# API Versioning
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Versioning prevents breaking existing clients as APIs evolve.
- URL path versioning is explicit and operationally simple.
- Header/content-negotiation approaches keep URLs clean but harder to debug.
- Breaking changes require major version increments.
- Deprecation must be communicated with timelines and migration guides.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Public partner APIs
- Mobile app backend evolution
- SDK compatibility programs
- Enterprise integration lifecycles

## Failure Modes and Trade-Offs
- Breaking v1 behavior silently destroys trust
- Version sprawl with duplicated code
- No sunset policy prolongs old stacks
- Insufficient telemetry on old version usage

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> IMPORTANT: Never break a published version contract. Deprecate with clear timeline and support plan.
> INTERVIEW TIP: Mention deprecation headers, migration docs, and a realistic sunset window.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'api-versioning-q1',
        question: 'Which is usually a breaking change?',
        options: ['Add optional field', 'Add new endpoint', 'Change field type from string to object', 'Improve error message'],
        correctIndex: 2,
        explanation: 'Type changes break parsers and client assumptions.',
      },
      {
        id: 'api-versioning-q2',
        question: 'Most common versioning style in production:',
        options: ['URL path versioning', 'No versioning', 'FTP folder versioning', 'DNS TXT versioning'],
        correctIndex: 0,
        explanation: 'Path versioning is explicit and easy to route.',
      },
      {
        id: 'api-versioning-q3',
        question: 'When NOT to bump major version:',
        options: ['Removing endpoint', 'Changing response semantics', 'Adding optional field', 'Renaming required field'],
        correctIndex: 2,
        explanation: 'Backward-compatible additions should not require major bump.',
      },
      {
        id: 'api-versioning-q4',
        question: 'Deprecation best practice includes:',
        options: ['Immediate shutdown without warning', '6-12 month migration window', 'No usage telemetry', 'Secret endpoint removal'],
        correctIndex: 1,
        explanation: 'Clients need time and guidance to migrate.',
      },
      {
        id: 'api-versioning-q5',
        question: 'Header-based versioning downside:',
        options: ['Cannot use headers', 'Less visible and harder to test manually', 'No proxies support headers', 'Breaks HTTPS'],
        correctIndex: 1,
        explanation: 'Path changes are easier to inspect and debug.',
      },
      {
        id: 'api-versioning-q6',
        question: 'HTTP code often used after final removal:',
        options: ['200', '301', '410', '206'],
        correctIndex: 2,
        explanation: '410 Gone explicitly signals permanent removal.',
      }
    ],
  },
  {
    id: 'rate-limiting-and-throttling',
    title: 'Rate Limiting & Throttling',
    interviewTip: 'State algorithm, scope, and 429 contract whenever discussing API design.',
    simulatorDemo: { description: 'Demonstrate gateway protection by intentionally throttling inbound traffic before it reaches downstream components.', instruction: 'The Rate Limiter intentionally limits traffic to 500 req/s even though 2000 are coming in. Watch it turn yellow/red while the Service and Database stay green. This is the purpose of rate limiting — protecting your system by rejecting excess traffic.', simulationAutoStart: true, setupNodes: [{ type: 'loadBalancer', label: 'Load Balancer', position: { x: 0, y: 250 }, data: { throughput: 50000, latency: 2, capacity: 200000 } }, { type: 'rateLimiter', label: 'Rate Limiter', position: { x: 300, y: 250 }, data: { throughput: 500, latency: 1, capacity: 2000 } }, { type: 'service', label: 'API Service', position: { x: 600, y: 250 }, data: { throughput: 5000, latency: 25, capacity: 20000 } }, { type: 'database', label: 'Database', position: { x: 900, y: 250 }, data: { throughput: 2000, latency: 10, capacity: 10000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 3 }] },
    readContent: `# Rate Limiting & Throttling
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Rate limiting controls request volume per time to protect capacity and fairness.
- Token bucket is common because it allows bursts while constraining sustained rate.
- Distributed limits require shared counters, often Redis with atomic operations.
- Return clear 429 responses with Retry-After and remaining quota headers.
- Limits can be per user, key, IP, endpoint, and global safety valves.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Public API protection
- Login endpoint abuse control
- Tiered monetization limits
- Protecting expensive search endpoints

## Failure Modes and Trade-Offs
- Fixed windows allow boundary bursts
- Local counters break in multi-instance environments
- Opaque 429 messages hurt developer experience
- Lack of per-endpoint policies creates abuse hotspots

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: A nightclub bouncer allows only safe flow inside; when capacity is reached, extra guests wait outside.
> NUMBERS: Typical API tiers are around 100/min free, 1000/min basic, and 10000/min premium; return 429 with Retry-After.
> INTERVIEW TIP: Mention token bucket plus Redis distributed counters for horizontally scaled gateways.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'rate-limiting-and-throttling-q1',
        question: 'Token bucket characteristic:',
        options: ['No bursts ever', 'Allows bursts up to bucket size', 'No refill', 'Only daily limits'],
        correctIndex: 1,
        explanation: 'Tokens accumulate and permit short bursts.',
      },
      {
        id: 'rate-limiting-and-throttling-q2',
        question: 'Fixed window weakness:',
        options: ['Too accurate', 'Boundary burst effect', 'Needs Redis always', 'No counters'],
        correctIndex: 1,
        explanation: 'Clients can spike at edge of adjacent windows.',
      },
      {
        id: 'rate-limiting-and-throttling-q3',
        question: 'Best place for baseline API limits:',
        options: ['Browser only', 'API gateway', 'Database trigger', 'CDN CSS'],
        correctIndex: 1,
        explanation: 'Gateway blocks excess before services are hit.',
      },
      {
        id: 'rate-limiting-and-throttling-q4',
        question: 'Why Redis for distributed limits?',
        options: ['Image storage', 'Atomic shared counters across instances', 'TLS issuance', 'Schema migrations'],
        correctIndex: 1,
        explanation: 'Centralized atomic counts enforce global policy.',
      },
      {
        id: 'rate-limiting-and-throttling-q5',
        question: 'Proper status when limited:',
        options: ['201', '301', '429', '503 always'],
        correctIndex: 2,
        explanation: '429 Too Many Requests is standard response.',
      },
      {
        id: 'rate-limiting-and-throttling-q6',
        question: 'Endpoint-specific limits matter because:',
        options: ['All endpoints cost the same', 'Expensive endpoints need tighter control', 'They break auth', 'No benefit'],
        correctIndex: 1,
        explanation: 'Cost-aware limits protect scarce resources.',
      }
    ],
  },
  {
    id: 'timeouts-and-connection-management',
    title: 'Timeouts & Connection Management',
    interviewTip: 'State concrete timeout numbers and total budget in design interviews.',
    readContent: `# Timeouts & Connection Management
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Every external call must have finite connection and response timeouts.
- Missing timeouts cause thread pool exhaustion and cascading failures.
- Connection pools have their own acquisition timeouts and capacity limits.
- Retries must fit inside a total deadline budget.
- Propagate remaining deadline across service chains.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Internal service calls
- Database and cache access
- Third-party API integrations
- Large upload workflows

## Failure Modes and Trade-Offs
- Infinite client defaults hang requests forever
- Too-aggressive retries amplify outages
- No deadline propagation creates multiplied latency
- Pool starvation blocks healthy requests

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> IMPORTANT: Every external dependency call must have explicit timeouts. Infinite defaults are outage multipliers.
> INTERVIEW TIP: Example phrasing: 3-second downstream timeout, 2 retries with backoff, 10-second end-to-end budget.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'timeouts-and-connection-management-q1',
        question: 'Connection timeout controls:',
        options: ['Time to establish TCP connection', 'Time to parse JSON', 'Cache eviction', 'DNS TTL'],
        correctIndex: 0,
        explanation: 'It limits initial connect wait when peer is unreachable.',
      },
      {
        id: 'timeouts-and-connection-management-q2',
        question: 'Read timeout controls:',
        options: ['Queue depth', 'Wait for response bytes after connect', 'Certificate rotation', 'Connection pool size'],
        correctIndex: 1,
        explanation: 'It bounds response wait after a connection is open.',
      },
      {
        id: 'timeouts-and-connection-management-q3',
        question: 'Without timeouts, common failure is:',
        options: ['Higher throughput', 'Thread pool exhaustion and cascading outage', 'Fewer alerts', 'No retries'],
        correctIndex: 1,
        explanation: 'Blocked workers accumulate until service is unavailable.',
      },
      {
        id: 'timeouts-and-connection-management-q4',
        question: 'Deadline propagation means:',
        options: ['Reset timeout at each hop', 'Pass remaining budget downstream', 'Disable retries', 'Use only UDP'],
        correctIndex: 1,
        explanation: "Downstream should honor caller's remaining time budget.",
      },
      {
        id: 'timeouts-and-connection-management-q5',
        question: 'Pool acquisition timeout is:',
        options: ['Same as TCP timeout always', 'Wait time for an available pooled connection', 'Only for DNS', 'Unused setting'],
        correctIndex: 1,
        explanation: 'Pool starvation is different from remote network failure.',
      },
      {
        id: 'timeouts-and-connection-management-q6',
        question: 'Best retry strategy with timeouts:',
        options: ['Infinite immediate retries', 'Backoff with total operation deadline', 'No timeout with retries', 'Retry forever on user path'],
        correctIndex: 1,
        explanation: 'Retry logic must stay inside user-perceived budget.',
      }
    ],
  }
];
