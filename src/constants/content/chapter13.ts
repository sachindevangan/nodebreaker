import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_13_TOPICS: Topic[] = [
  {
    id: 'blob-object-storage',
    title: 'Blob & Object Storage',
    interviewTip: 'Use S3 with presigned URLs and CDN delivery for nearly all file workloads.',
    readContent: `# Blob & Object Storage
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Object storage uses key-object-metadata model in flat namespace.
- S3 is dominant due to scale, durability, and ecosystem.
- Presigned URLs let clients upload directly without passing through app servers.
- Storage classes optimize cost by access frequency and retrieval latency.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- User media uploads
- Backups and archives
- Static asset hosting
- Data lake raw storage

## Failure Modes and Trade-Offs
- Saving files in relational DB bloats OLTP workloads
- Public bucket misconfiguration leaks data
- No lifecycle policies increase cost
- No CDN leads to high origin egress

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: Object storage is an infinite labeled warehouse shelf system where key labels retrieve objects quickly.
> NUMBERS: S3 Standard storage is roughly 0.023 dollars per GB-month, with very high durability often described as eleven nines.
> INTERVIEW TIP: Say uploads go browser to S3 via presigned URL, API stores metadata only.

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
        id: 'blob-object-storage-q1',
        question: 'Object storage is best for:',
        options: ['Relational joins', 'Unstructured files and blobs', 'CPU scheduling', 'Auth sessions'],
        correctIndex: 1,
        explanation: 'Object stores excel at large binary/unstructured objects.',
      },
      {
        id: 'blob-object-storage-q2',
        question: 'S3 durability commonly quoted as:',
        options: ['99 percent', '11 nines class durability', '50 percent', 'No durability'],
        correctIndex: 1,
        explanation: 'S3 durability is extremely high by design.',
      },
      {
        id: 'blob-object-storage-q3',
        question: 'Presigned upload flow advantage:',
        options: ['All uploads hit app server', 'Client uploads directly to storage with temporary permission', 'No auth needed', 'Only for downloads'],
        correctIndex: 1,
        explanation: 'Offloads bandwidth and scales better.',
      },
      {
        id: 'blob-object-storage-q4',
        question: 'Storage class for infrequent cold archives:',
        options: ['Standard only', 'Glacier/Deep Archive classes', 'RDS', 'ElastiCache'],
        correctIndex: 1,
        explanation: 'Archive classes reduce cost with slower retrieval.',
      },
      {
        id: 'blob-object-storage-q5',
        question: 'Why avoid storing files in OLTP DB:',
        options: ['Impossible technically', 'Higher cost and poorer query/storage characteristics', 'No backups', 'No indexing'],
        correctIndex: 1,
        explanation: 'Blob-heavy DB usage harms transactional performance/cost.',
      },
      {
        id: 'blob-object-storage-q6',
        question: 'CDN with object storage provides:',
        options: ['Worse latency', 'Edge caching and reduced origin load', 'No security', 'No scaling'],
        correctIndex: 1,
        explanation: 'CDN improves global performance and origin efficiency.',
      }
    ],
  },
  {
    id: 'data-warehouses-oltp-vs-olap',
    title: 'Data Warehouses: OLTP vs OLAP',
    interviewTip: 'Always separate transactional and analytical workloads in interviews.',
    readContent: `# Data Warehouses: OLTP vs OLAP
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- OLTP handles high-concurrency transactional reads/writes.
- OLAP handles large analytical scans and aggregations.
- Row stores suit transactional access; column stores suit analytics.
- Separate systems prevent analytics from hurting production transactions.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Transactional app DB
- BI dashboards
- Revenue trend analysis
- Historical reporting

## Failure Modes and Trade-Offs
- Running heavy BI queries on OLTP slows user-facing traffic
- No ETL causes stale/inconsistent analytics
- Wrong storage model hurts performance
- Unclear ownership between data and app teams

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> NUMBERS: OLTP point reads are often millisecond scale; OLAP scans over large datasets may run seconds to minutes.
> INTERVIEW TIP: Say Postgres for OLTP and Redshift/BigQuery/Snowflake for OLAP with ETL/ELT pipeline.

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
        id: 'data-warehouses-oltp-vs-olap-q1',
        question: 'OLTP focus is:',
        options: ['Large historical scans', 'Low-latency transactional operations', 'Batch-only jobs', 'Object storage'],
        correctIndex: 1,
        explanation: 'OLTP is optimized for concurrent transactions.',
      },
      {
        id: 'data-warehouses-oltp-vs-olap-q2',
        question: 'OLAP focus is:',
        options: ['Single-row updates', 'Aggregations over large datasets', 'Session cookies', 'DNS routing'],
        correctIndex: 1,
        explanation: 'OLAP engines optimize analytical scans.',
      },
      {
        id: 'data-warehouses-oltp-vs-olap-q3',
        question: 'Columnar storage advantage:',
        options: ['Best for random row writes', 'Efficient scans/compression for analytic columns', 'No indexes', 'No schemas'],
        correctIndex: 1,
        explanation: 'Column stores accelerate aggregate analytics.',
      },
      {
        id: 'data-warehouses-oltp-vs-olap-q4',
        question: 'Why separate OLTP and OLAP:',
        options: ['Adds complexity only', 'Protects production performance and optimizes each workload', 'Cannot query both', 'No data sync needed'],
        correctIndex: 1,
        explanation: 'Different workloads need different system optimizations.',
      },
      {
        id: 'data-warehouses-oltp-vs-olap-q5',
        question: 'Typical data flow:',
        options: ['OLAP to OLTP', 'OLTP sources through ETL/ELT into warehouse', 'CDN to DB only', 'TLS to Kafka'],
        correctIndex: 1,
        explanation: 'Warehouses are usually fed by operational systems.',
      },
      {
        id: 'data-warehouses-oltp-vs-olap-q6',
        question: 'BigQuery pricing model often emphasized:',
        options: ['Per server node only', 'Pay per data scanned', 'Free unlimited', 'Per DNS request'],
        correctIndex: 1,
        explanation: 'Scan-based pricing is a key operational tradeoff.',
      }
    ],
  },
  {
    id: 'etl-pipelines',
    title: 'ETL Pipelines',
    interviewTip: 'Explain extract strategy, transform rules, and load mode with operational checks.',
    readContent: `# ETL Pipelines
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- ETL moves data from sources to analytical destinations.
- Extract can be full or incremental depending on volume and change rate.
- Transform cleans, joins, validates, and enriches data.
- Load strategies include full replace, incremental upsert, and append-only.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Nightly reporting
- Sales/finance reconciliation
- Marketing attribution
- Data quality standardization

## Failure Modes and Trade-Offs
- No idempotency leads duplicate loads
- Failed upstream extract breaks downstream models
- No lineage obscures data trust
- No monitoring causes silent stale data

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: ETL is like a supply chain: collect raw ingredients, process quality and packaging, then deliver to store shelves.
> INTERVIEW TIP: Mention Airflow orchestration and dbt transformations with alerting on failed DAG steps.

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
        id: 'etl-pipelines-q1',
        question: 'ETL stands for:',
        options: ['Extract Transform Load', 'Encrypt Transfer Log', 'Evaluate Test Launch', 'Export Track Learn'],
        correctIndex: 0,
        explanation: 'Standard data pipeline acronym.',
      },
      {
        id: 'etl-pipelines-q2',
        question: 'Incremental extract benefit:',
        options: ['Copies more data', 'Moves only changed records and reduces load', 'No complexity', 'No state tracking'],
        correctIndex: 1,
        explanation: 'Incremental pipelines are efficient at scale.',
      },
      {
        id: 'etl-pipelines-q3',
        question: 'Transform stage commonly does:',
        options: ['TLS handshakes', 'Cleaning, joining, and reshaping data', 'DNS caching', 'Image resizing only'],
        correctIndex: 1,
        explanation: 'Transformation applies business logic and quality rules.',
      },
      {
        id: 'etl-pipelines-q4',
        question: 'ELT differs because:',
        options: ['No transformation at all', 'Transforms happen after loading into warehouse', 'No extraction', 'No SQL usage'],
        correctIndex: 1,
        explanation: 'Modern cloud warehouses often favor ELT.',
      },
      {
        id: 'etl-pipelines-q5',
        question: 'Airflow primarily provides:',
        options: ['Object storage', 'Workflow orchestration with DAG dependencies', 'TLS certificates', 'Frontend rendering'],
        correctIndex: 1,
        explanation: 'Airflow schedules and manages pipeline dependencies.',
      },
      {
        id: 'etl-pipelines-q6',
        question: 'If upstream task fails, good orchestration does:',
        options: ['Continue downstream blindly', 'Block dependent tasks and alert owners', 'Delete all data', 'Disable retries'],
        correctIndex: 1,
        explanation: 'Dependency-aware orchestration prevents bad downstream outputs.',
      }
    ],
  },
  {
    id: 'batch-vs-stream-processing',
    title: 'Batch vs Stream Processing',
    interviewTip: 'Choose by business latency requirement first, then cost and ops complexity.',
    readContent: `# Batch vs Stream Processing
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Batch processes large data chunks on schedule with higher latency.
- Stream processes records continuously with low latency and always-on infrastructure.
- Batch is simpler and cheaper for many analytics workloads.
- Stream is justified when real-time decisions materially matter.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Nightly reports via batch
- Fraud scoring via stream
- Real-time dashboards
- Model retraining pipelines

## Failure Modes and Trade-Offs
- Using stream for non-real-time workloads increases cost/complexity
- Batch freshness may miss urgent events
- No replay plan in stream stack
- Unclear late-event handling

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> NUMBERS: Batch jobs over large datasets may run minutes to hours; stream systems often target millisecond to second latency but run continuously.
> INTERVIEW TIP: State daily analytics on batch and fraud/alerts on stream for sub-second response.

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
        id: 'batch-vs-stream-processing-q1',
        question: 'Batch processing is characterized by:',
        options: ['Continuous per-record execution', 'Scheduled chunk processing', 'No retries', 'No storage'],
        correctIndex: 1,
        explanation: 'Batch groups data and runs periodically.',
      },
      {
        id: 'batch-vs-stream-processing-q2',
        question: 'Stream processing is best when:',
        options: ['24-hour delay is fine', 'Near-real-time reaction is required', 'No events exist', 'Only monthly billing'],
        correctIndex: 1,
        explanation: 'Stream suits low-latency decision paths.',
      },
      {
        id: 'batch-vs-stream-processing-q3',
        question: 'Why batch is often cheaper:',
        options: ['No compute', 'Compute runs only during jobs, not always-on', 'Free storage', 'No engineering'],
        correctIndex: 1,
        explanation: 'Batch avoids constant runtime cost.',
      },
      {
        id: 'batch-vs-stream-processing-q4',
        question: 'Lambda architecture combines:',
        options: ['Only stream', 'Batch and stream layers', 'Only OLTP', 'Only ETL'],
        correctIndex: 1,
        explanation: 'Lambda merges speed and accuracy paths.',
      },
      {
        id: 'batch-vs-stream-processing-q5',
        question: 'Kappa architecture emphasizes:',
        options: ['Separate batch layer mandatory', 'Stream-first with replay for reprocessing', 'No logs', 'No state'],
        correctIndex: 1,
        explanation: 'Kappa simplifies around a stream log backbone.',
      },
      {
        id: 'batch-vs-stream-processing-q6',
        question: 'When stream is overkill:',
        options: ['Fraud detection', 'Daily business report generation', 'Live scoring', 'IoT alarms'],
        correctIndex: 1,
        explanation: 'If freshness requirement is loose, batch is simpler.',
      }
    ],
  },
  {
    id: 'mapreduce-distributed-computation',
    title: 'MapReduce & Distributed Computation',
    interviewTip: 'Explain map-shuffle-reduce clearly even if using Spark APIs today.',
    readContent: `# MapReduce & Distributed Computation
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- MapReduce divides large datasets into parallel map tasks and aggregate reduce tasks.
- Shuffle groups intermediate keys between map and reduce stages.
- Distributed computation is needed when data volume or time budget exceeds single-node capacity.
- Spark modernizes this pattern with in-memory execution.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Word count at scale
- Log analysis
- Recommendation precomputation
- Large dataset transformations

## Failure Modes and Trade-Offs
- Data skew causes straggler reducers
- Too few partitions underutilize cluster
- Too many tiny tasks add overhead
- No fault tolerance planning causes job restarts

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: Election counting: precincts count locally first, then central office aggregates totals by candidate.
> INTERVIEW TIP: Say Spark on EMR/Dataproc processing partitioned data in parallel then loading warehouse outputs.

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
        id: 'mapreduce-distributed-computation-q1',
        question: 'Map phase does what?',
        options: ['Aggregates final totals only', 'Transforms input records to key-value pairs in parallel', 'Deletes source files', 'Builds UI'],
        correctIndex: 1,
        explanation: 'Map emits intermediate key-value outputs.',
      },
      {
        id: 'mapreduce-distributed-computation-q2',
        question: 'Shuffle phase responsibility:',
        options: ['TLS termination', 'Group values by key before reduce', 'DNS routing', 'Row-level auth'],
        correctIndex: 1,
        explanation: 'Shuffle rearranges intermediate data by keys.',
      },
      {
        id: 'mapreduce-distributed-computation-q3',
        question: 'Reduce phase does:',
        options: ['Final aggregation per key', 'Connection pooling', 'Static asset caching', 'OAuth issuance'],
        correctIndex: 0,
        explanation: 'Reduce combines grouped values into results.',
      },
      {
        id: 'mapreduce-distributed-computation-q4',
        question: 'Need distributed processing when:',
        options: ['Data tiny and fast locally', 'Single-node runtime exceeds acceptable limits', 'No transformations needed', 'Only one file'],
        correctIndex: 1,
        explanation: 'Scale-out helps large-volume/time-constrained workloads.',
      },
      {
        id: 'mapreduce-distributed-computation-q5',
        question: 'Spark often faster than classic MapReduce because:',
        options: ['No disk usage ever', 'More in-memory execution and optimized DAG engine', 'No cluster needed', 'No partitioning'],
        correctIndex: 1,
        explanation: 'Spark reduces repeated disk IO overhead.',
      },
      {
        id: 'mapreduce-distributed-computation-q6',
        question: 'Data partitioning matters because:',
        options: ['No impact on performance', 'It determines parallelism and workload balance', 'Only for UI', 'Only for auth'],
        correctIndex: 1,
        explanation: 'Good partitioning improves throughput and avoids hotspots.',
      }
    ],
  },
  {
    id: 'time-series-databases',
    title: 'Time-Series Databases',
    interviewTip: 'Mention retention tiers and downsampling strategy explicitly.',
    readContent: `# Time-Series Databases
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Time-series data is append-heavy and indexed by timestamp.
- TSDBs optimize range queries, compression, retention, and downsampling.
- Monitoring and IoT workloads fit TSDBs better than general OLTP stores.
- Prometheus, InfluxDB, TimescaleDB, and others offer specialized capabilities.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- System metrics collection
- IoT telemetry
- Financial tick analysis
- Application performance monitoring

## Failure Modes and Trade-Offs
- No retention policy causes storage explosion
- High-cardinality labels harm query performance
- No downsampling increases long-range query cost
- Using OLTP DB for high-rate metrics can become expensive

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> NUMBERS: A common monitoring cadence is 15-second scrapes with raw retention for weeks and aggregated retention for months.
> INTERVIEW TIP: For metrics workloads, mention Prometheus plus Grafana and time-window aggregation policies.

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
        id: 'time-series-databases-q1',
        question: 'Time-series record usually includes:',
        options: ['Only user id', 'Timestamp, metric name, value', 'TLS key', 'File path'],
        correctIndex: 1,
        explanation: 'Timestamp-indexed metric values define time-series data.',
      },
      {
        id: 'time-series-databases-q2',
        question: 'TSDB advantage over OLTP for metrics:',
        options: ['Worse writes', 'Optimized append, range queries, compression, retention', 'No indexes', 'No aggregation'],
        correctIndex: 1,
        explanation: 'TSDB design aligns with metrics workload shape.',
      },
      {
        id: 'time-series-databases-q3',
        question: 'Downsampling means:',
        options: ['Delete all old data', 'Store coarser aggregates for older periods', 'Encrypt data', 'Move to cache'],
        correctIndex: 1,
        explanation: 'Downsampling preserves trends at lower storage/cost.',
      },
      {
        id: 'time-series-databases-q4',
        question: 'Prometheus pull model typically:',
        options: ['Scrapes targets on interval', 'Pushes email', 'Runs ETL only', 'Stores blobs'],
        correctIndex: 0,
        explanation: 'Prometheus polls target endpoints for metrics.',
      },
      {
        id: 'time-series-databases-q5',
        question: 'High-cardinality labels can:',
        options: ['Always improve performance', 'Increase storage/query cost significantly', 'Disable scraping', 'Reduce precision'],
        correctIndex: 1,
        explanation: 'Cardinality explosion is a common TSDB pain point.',
      },
      {
        id: 'time-series-databases-q6',
        question: 'Best use case for TSDB:',
        options: ['User profile storage', 'CPU and latency monitoring over time', 'Binary media hosting', 'Password hashing'],
        correctIndex: 1,
        explanation: 'TSDBs excel at time-windowed metric analysis.',
      }
    ],
  },
  {
    id: 'data-lakes',
    title: 'Data Lakes',
    interviewTip: 'Explain lake as raw source of truth and warehouse as curated serving layer.',
    readContent: `# Data Lakes
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Data lake stores raw structured, semi-structured, and unstructured data.
- Schema-on-read gives flexibility for exploration and ML.
- Warehouse stores curated schema-on-write data for BI reliability.
- Lakehouse formats add transactions and governance on object storage.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Raw landing zone for enterprise data
- ML feature exploration
- Ad-hoc analytics
- Long-term archival with replayable pipelines

## Failure Modes and Trade-Offs
- Uncataloged data becomes unusable swamp
- No access control leaks sensitive datasets
- No quality checks reduce trust
- Format fragmentation complicates query engines

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: Data lake is a large warehouse of raw inventory; data warehouse is curated store shelves ready for reporting.
> INTERVIEW TIP: Say raw data lands in S3/Parquet, cataloged with Glue, transformed by Spark/dbt into warehouse models.

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
        id: 'data-lakes-q1',
        question: 'Data lake schema style is usually:',
        options: ['Schema-on-write always', 'Schema-on-read', 'No schema ever', 'Manual only'],
        correctIndex: 1,
        explanation: 'Lakes often defer strict schema application to read time.',
      },
      {
        id: 'data-lakes-q2',
        question: 'Data warehouse differs by:',
        options: ['Keeping only raw files', 'Curated structured models for analytics', 'No SQL support', 'No governance'],
        correctIndex: 1,
        explanation: 'Warehouses optimize BI and consistent reporting.',
      },
      {
        id: 'data-lakes-q3',
        question: 'Common lake storage format for analytics:',
        options: ['JPEG', 'Parquet', 'TXT only', 'BMP'],
        correctIndex: 1,
        explanation: 'Parquet is columnar and efficient for analytics scans.',
      },
      {
        id: 'data-lakes-q4',
        question: 'Lakehouse aims to combine:',
        options: ['Only OLTP and cache', 'Lake storage economics with warehouse-style governance/ACID', 'Only DNS and CDN', 'Only ETL and UI'],
        correctIndex: 1,
        explanation: 'Lakehouse unifies flexibility and reliability features.',
      },
      {
        id: 'data-lakes-q5',
        question: 'Data swamp is prevented by:',
        options: ['No catalog', 'Catalog, lineage, naming standards, quality checks', 'Random file names', 'Public write access'],
        correctIndex: 1,
        explanation: 'Governance practices keep lake data discoverable and trustworthy.',
      },
      {
        id: 'data-lakes-q6',
        question: 'Athena/Trino are used to:',
        options: ['Run SQL queries on data lake storage', 'Issue TLS certs', 'Build mobile UI', 'Run OAuth flow'],
        correctIndex: 0,
        explanation: 'Query engines analyze lake data without full ingestion into OLTP DBs.',
      }
    ],
  }
];
