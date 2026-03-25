import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_12_TOPICS: Topic[] = [
  {
    id: 'three-pillars-metrics-logs-traces',
    title: 'The Three Pillars: Metrics, Logs & Traces',
    interviewTip: 'Name all three pillars and how they complement each other.',
    readContent: `# The Three Pillars: Metrics, Logs & Traces
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Metrics show numeric trends over time.
- Logs capture event details and error context.
- Traces connect one request across service boundaries.
- Correlation IDs link pillars for fast debugging.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Error spike detection with metrics
- Root-cause analysis with logs
- Latency path diagnosis with traces
- SLO reporting dashboards

## Failure Modes and Trade-Offs
- Only metrics hides root cause
- Unstructured logs are hard to query
- No trace propagation in microservices
- High telemetry cost without retention policy

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: Car dashboard gauges are metrics, mechanic codes are logs, and GPS route history is tracing.
> INTERVIEW TIP: Say metrics detect, logs explain, traces localize bottlenecks.

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
        id: 'three-pillars-metrics-logs-traces-q1',
        question: 'Which pillar best shows request path across services?',
        options: ['Metrics', 'Logs', 'Traces', 'Backups'],
        correctIndex: 2,
        explanation: 'Tracing reveals span-by-span flow.',
      },
      {
        id: 'three-pillars-metrics-logs-traces-q2',
        question: 'Structured logs are preferred because:',
        options: ['Less searchable', 'Consistent queryable fields', 'No timestamps needed', 'Only for debug builds'],
        correctIndex: 1,
        explanation: 'JSON fields enable filtering and aggregation.',
      },
      {
        id: 'three-pillars-metrics-logs-traces-q3',
        question: 'Metrics are strongest for:',
        options: ['Single request stack trace', 'Trend dashboards and alert thresholds', 'Payload encryption', 'Schema migrations'],
        correctIndex: 1,
        explanation: 'Time-series metrics suit monitoring and alerts.',
      },
      {
        id: 'three-pillars-metrics-logs-traces-q4',
        question: 'Trace ID propagation enables:',
        options: ['Bigger payloads', 'Cross-service correlation for one request', 'No logging', 'DNS routing'],
        correctIndex: 1,
        explanation: 'Shared IDs tie events across services.',
      },
      {
        id: 'three-pillars-metrics-logs-traces-q5',
        question: 'If error rate spikes, best first step:',
        options: ['Delete logs', 'Use metrics to detect then inspect logs/traces', 'Disable monitoring', 'Restart all systems'],
        correctIndex: 1,
        explanation: 'Pillars work together in sequence.',
      },
      {
        id: 'three-pillars-metrics-logs-traces-q6',
        question: 'Telemetry cost control usually requires:',
        options: ['Infinite retention', 'Retention tiers and sampling', 'No indexes', 'Disable alerts'],
        correctIndex: 1,
        explanation: 'Cost-aware policies are essential at scale.',
      }
    ],
  },
  {
    id: 'monitoring-what-to-measure',
    title: 'Monitoring: What to Measure',
    interviewTip: 'Lead with golden signals and add service-specific metrics per layer.',
    readContent: `# Monitoring: What to Measure
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Four golden signals: latency, traffic, errors, saturation.
- RED method for services: Rate, Errors, Duration.
- USE method for resources: Utilization, Saturation, Errors.
- Track component-specific health metrics for LB/app/db/cache/queue.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Service health dashboards
- SLO-driven alerting
- Capacity planning
- Bottleneck identification

## Failure Modes and Trade-Offs
- Relying on average latency hides tail pain
- No saturation metrics misses capacity cliffs
- Too many vanity metrics
- No per-component ownership

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> NUMBERS: Healthy targets often include API P99 under 500 ms, error rate under 0.1 percent, and cache hit rate above 90 percent.
> INTERVIEW TIP: Mention P95/P99, not averages, and tie alerts to user impact.

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
        id: 'monitoring-what-to-measure-q1',
        question: 'Golden signal NOT in the four:',
        options: ['Latency', 'Traffic', 'Errors', 'Schema'],
        correctIndex: 3,
        explanation: 'Schema is not one of the four golden signals.',
      },
      {
        id: 'monitoring-what-to-measure-q2',
        question: 'Why P99 matters more than average:',
        options: ['Average is always higher', 'Tail latency captures worst user experience', 'P99 is free', 'No difference'],
        correctIndex: 1,
        explanation: 'Tail behavior determines perceived reliability for unlucky users.',
      },
      {
        id: 'monitoring-what-to-measure-q3',
        question: 'RED method stands for:',
        options: ['Rate Errors Duration', 'Read Execute Deploy', 'Retry Error Deadline', 'Region Edge Datacenter'],
        correctIndex: 0,
        explanation: 'RED is common for request services.',
      },
      {
        id: 'monitoring-what-to-measure-q4',
        question: 'USE method applies best to:',
        options: ['UI components', 'Infrastructure resources', 'Marketing data', 'DNS records'],
        correctIndex: 1,
        explanation: 'USE targets utilization/saturation/errors on resources.',
      },
      {
        id: 'monitoring-what-to-measure-q5',
        question: 'Cache metric often most important:',
        options: ['Hit ratio', 'File count', 'CSS size', 'Domain count'],
        correctIndex: 0,
        explanation: 'Hit ratio shows cache effectiveness directly.',
      },
      {
        id: 'monitoring-what-to-measure-q6',
        question: 'A good dashboard should:',
        options: ['Show only CPU', 'Combine latency/traffic/errors/saturation with clear status', 'Avoid colors', 'Hide trends'],
        correctIndex: 1,
        explanation: 'Operational dashboards should support fast scanning and action.',
      }
    ],
  },
  {
    id: 'logging-structured-aggregation',
    title: 'Logging: Structured & Aggregation',
    interviewTip: 'Say what fields every log line must include and where logs are aggregated.',
    readContent: `# Logging: Structured & Aggregation
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Structured JSON logs enable reliable querying and analytics.
- Use consistent fields: timestamp, level, service, trace_id, message.
- Aggregate logs centrally to avoid host-by-host debugging.
- Retention tiers control cost and compliance.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Incident triage
- Audit trails
- Cross-service correlation
- Operational anomaly investigation

## Failure Modes and Trade-Offs
- Missing trace IDs blocks cross-service analysis
- DEBUG logs in prod increase cost/noise
- No centralization slows incident response
- No retention policy inflates storage spend

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> IMPORTANT: At minimum include timestamp, level, service name, and trace_id in every production log.
> INTERVIEW TIP: Mention ELK or Loki stack with alerting on error spikes.

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
        id: 'logging-structured-aggregation-q1',
        question: 'Best log format for scale:',
        options: ['Free text only', 'Structured JSON with fields', 'Screenshot logs', 'Binary without schema'],
        correctIndex: 1,
        explanation: 'Structured fields are query-friendly.',
      },
      {
        id: 'logging-structured-aggregation-q2',
        question: 'INFO vs ERROR difference:',
        options: ['No difference', 'INFO for normal events, ERROR for failures needing attention', 'INFO only in tests', 'ERROR for success'],
        correctIndex: 1,
        explanation: 'Severity levels guide triage and signal quality.',
      },
      {
        id: 'logging-structured-aggregation-q3',
        question: 'Centralized logging helps because:',
        options: ['Single machine is enough', 'Distributed systems produce logs across many hosts/services', 'No search needed', 'It replaces metrics'],
        correctIndex: 1,
        explanation: 'Aggregation enables global search and correlation.',
      },
      {
        id: 'logging-structured-aggregation-q4',
        question: 'Trace ID in logs is for:',
        options: ['Compression', 'Correlating events belonging to one request', 'Database replication', 'Auth'],
        correctIndex: 1,
        explanation: 'Shared trace IDs connect logs across components.',
      },
      {
        id: 'logging-structured-aggregation-q5',
        question: 'Retention policy benefit:',
        options: ['Higher cost only', 'Controls cost and compliance lifecycle', 'Disables searching', 'No benefit'],
        correctIndex: 1,
        explanation: 'Different levels can have different retention windows.',
      },
      {
        id: 'logging-structured-aggregation-q6',
        question: 'Good production default for DEBUG:',
        options: ['Always on', 'Usually off except targeted troubleshooting', 'Mandatory for all endpoints', 'No levels'],
        correctIndex: 1,
        explanation: 'DEBUG noise and cost are high in production.',
      }
    ],
  },
  {
    id: 'distributed-tracing',
    title: 'Distributed Tracing',
    interviewTip: 'Mention OpenTelemetry instrumentation and sampling strategy explicitly.',
    readContent: `# Distributed Tracing
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Trace is full request journey; span is one operation.
- Trace context propagates via headers like traceparent.
- Tracing reveals critical path and bottleneck spans.
- Sampling balances observability depth with cost.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Microservice latency debugging
- Cross-team incident triage
- Critical path optimization
- Error-origin localization

## Failure Modes and Trade-Offs
- No propagation headers breaks trace continuity
- Sampling too low misses rare failures
- No span attributes reduces usefulness
- Only tracing without logs limits diagnosis

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: Package tracking shows each checkpoint in transit, like spans across services in one trace.
> INTERVIEW TIP: Use OpenTelemetry plus Jaeger/Tempo and sample all errors, subset of healthy traffic.

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
        id: 'distributed-tracing-q1',
        question: 'A span represents:',
        options: ['Entire month of metrics', 'Single operation inside trace', 'Only DB backup', 'An auth role'],
        correctIndex: 1,
        explanation: 'Spans are units of work with timing metadata.',
      },
      {
        id: 'distributed-tracing-q2',
        question: 'Trace ID should be generated at:',
        options: ['Last service only', 'Entry point and propagated downstream', 'Database layer only', 'Client CSS'],
        correctIndex: 1,
        explanation: 'Root trace context starts at ingress.',
      },
      {
        id: 'distributed-tracing-q3',
        question: 'Critical path means:',
        options: ['Longest latency-contributing chain', 'Most log lines', 'Most CPU cores', 'Oldest data'],
        correctIndex: 0,
        explanation: 'Optimizing critical path reduces end-to-end latency most effectively.',
      },
      {
        id: 'distributed-tracing-q4',
        question: 'Sampling is needed because:',
        options: ['Tracing is free at any scale', 'Full tracing can be expensive at high QPS', 'Headers are insecure', 'No collector exists'],
        correctIndex: 1,
        explanation: 'Sampling controls data volume and cost.',
      },
      {
        id: 'distributed-tracing-q5',
        question: 'OpenTelemetry provides:',
        options: ['One vendor lock-in only', 'Vendor-neutral instrumentation for metrics/logs/traces', 'Just UI dashboards', 'Only Java support'],
        correctIndex: 1,
        explanation: 'OTel standardizes telemetry collection/export.',
      },
      {
        id: 'distributed-tracing-q6',
        question: 'Tracing best complements:',
        options: ['No logs or metrics', 'Metrics and logs with shared IDs', 'Only DNS records', 'Only backups'],
        correctIndex: 1,
        explanation: 'Pillars together improve debugging quality.',
      }
    ],
  },
  {
    id: 'alerting-oncall',
    title: 'Alerting & On-Call',
    interviewTip: 'Share concrete thresholds and on-call expectations, not vague alerting claims.',
    readContent: `# Alerting & On-Call
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Alerts should be actionable, urgent, and low-noise.
- Severity levels map response urgency and escalation.
- Symptom-based alerts better reflect user impact.
- Runbooks reduce MTTR and improve consistency.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- P1 outage paging
- Latency/error threshold monitoring
- Business KPI anomaly alerts
- Operational rotation management

## Failure Modes and Trade-Offs
- Noisy alerts cause alert fatigue
- Cause-based alerts without impact context
- No runbooks slows first response
- No postmortems repeats incidents

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> IMPORTANT: If an alert is frequently ignored, tune or delete it. Noise destroys trust in paging.
> INTERVIEW TIP: State P1 thresholds and response targets with runbook-backed mitigation steps.

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
        id: 'alerting-oncall-q1',
        question: 'Best alert quality indicator:',
        options: ['High volume', 'Actionable and low false positive rate', 'Many duplicates', 'No owner'],
        correctIndex: 1,
        explanation: 'Useful alerts are specific and actionable.',
      },
      {
        id: 'alerting-oncall-q2',
        question: 'Symptom-based alert example:',
        options: ['CPU 60%', '5xx error rate above 1% for 5 minutes', 'Code style violation', 'Small disk write'],
        correctIndex: 1,
        explanation: 'User-impact symptoms are stronger paging signals.',
      },
      {
        id: 'alerting-oncall-q3',
        question: 'P1 incident usually means:',
        options: ['Optional improvement', 'Severe outage requiring immediate response', 'Monthly report', 'No impact'],
        correctIndex: 1,
        explanation: 'Critical severity should page immediately.',
      },
      {
        id: 'alerting-oncall-q4',
        question: 'Runbook purpose:',
        options: ['Store passwords', 'Step-by-step mitigation guidance', 'Replace monitoring', 'Disable alerts'],
        correctIndex: 1,
        explanation: 'Runbooks shorten response time and reduce guesswork.',
      },
      {
        id: 'alerting-oncall-q5',
        question: 'Postmortem should be:',
        options: ['Blame-focused', 'Blameless and systems-focused', 'Skipped', 'Private forever'],
        correctIndex: 1,
        explanation: 'Learning culture improves reliability over time.',
      },
      {
        id: 'alerting-oncall-q6',
        question: 'Alert fatigue occurs when:',
        options: ['No alerts exist', 'Too many noisy/non-actionable alerts', 'Only one alert type', 'Good thresholds'],
        correctIndex: 1,
        explanation: 'Excess noise leads teams to ignore real incidents.',
      }
    ],
  },
  {
    id: 'sre-principles-error-budgets',
    title: 'SRE Principles & Error Budgets',
    interviewTip: 'Explain how error budget balances shipping speed with reliability investment.',
    readContent: `# SRE Principles & Error Budgets
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- SRE treats reliability as an engineering discipline.
- SLI measures, SLO targets, SLA contracts consequences.
- Error budget quantifies acceptable unreliability.
- Toil should be automated to preserve engineering capacity.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Release gating by error budget
- SLO dashboarding
- Reliability-focused sprint planning
- Blameless postmortem culture

## Failure Modes and Trade-Offs
- No SLO makes reliability debates subjective
- Overly strict SLO slows product velocity
- Excess toil prevents improvements
- No budget policy causes recurring outages

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> NUMBERS: A 99.9 percent monthly availability target allows about 43.8 minutes downtime per month.
> INTERVIEW TIP: If budget is exhausted, freeze risky releases and focus on reliability work until recovery.

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
        id: 'sre-principles-error-budgets-q1',
        question: 'SLI is:',
        options: ['Contract penalty', 'Measured reliability indicator', 'Deployment strategy', 'Logging format'],
        correctIndex: 1,
        explanation: 'SLI is the raw metric used to evaluate service quality.',
      },
      {
        id: 'sre-principles-error-budgets-q2',
        question: 'SLO is:',
        options: ['Internal target for an SLI', 'Legal contract only', 'On-call schedule', 'Cloud provider'],
        correctIndex: 0,
        explanation: 'SLO sets desired reliability objective.',
      },
      {
        id: 'sre-principles-error-budgets-q3',
        question: 'SLA is:',
        options: ['No consequences', 'Customer contract with consequences if not met', 'A trace header', 'An IDE setting'],
        correctIndex: 1,
        explanation: 'SLA typically includes financial/legal terms.',
      },
      {
        id: 'sre-principles-error-budgets-q4',
        question: 'Error budget for 99.9% monthly availability is about:',
        options: ['4.38 hours', '43.8 minutes', '438 minutes', '4.38 minutes'],
        correctIndex: 1,
        explanation: '0.1 percent of month is roughly 43.8 minutes.',
      },
      {
        id: 'sre-principles-error-budgets-q5',
        question: 'If budget exhausted, team should:',
        options: ['Ship faster regardless', 'Prioritize reliability and limit risky launches', 'Disable monitoring', 'Lower uptime without notice'],
        correctIndex: 1,
        explanation: 'Budget policy aligns incentives across product and reliability.',
      },
      {
        id: 'sre-principles-error-budgets-q6',
        question: 'Toil refers to:',
        options: ['One-time architecture decision', 'Manual repetitive operational work lacking enduring value', 'Core product coding', 'User research'],
        correctIndex: 1,
        explanation: 'SRE aims to automate toil and free engineering time.',
      }
    ],
  }
];
