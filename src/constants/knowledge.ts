import type { NodeBreakerNodeType } from '@/types';

export interface ComponentKnowledgeScale {
  throughput: number;
  latency: number;
  description: string;
}

export interface ComponentKnowledge {
  type: NodeBreakerNodeType;
  summary: string;
  explanation: string;
  realWorldExamples: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  commonPairings: string[];
  realisticDefaults: {
    small: ComponentKnowledgeScale;
    medium: ComponentKnowledgeScale;
    large: ComponentKnowledgeScale;
  };
  keyMetrics: string[];
  failureModes: string[];
  interviewTip: string;
  relatedConcepts: string[];
}

const genericScale = (small: number, medium: number, large: number) => ({
  small: { throughput: small, latency: 20, description: 'Small startup or internal workload' },
  medium: { throughput: medium, latency: 12, description: 'Growing product with steady usage' },
  large: { throughput: large, latency: 8, description: 'Large scale production traffic' },
});

export const KNOWLEDGE_BY_COMPONENT: Record<NodeBreakerNodeType, ComponentKnowledge> = {
  loadBalancer: {
    type: 'loadBalancer',
    summary: 'Distributes incoming traffic across multiple servers to prevent overload.',
    explanation:
      'A load balancer sits between clients and backend services so no single instance absorbs all traffic. L4 load balancers route by TCP/UDP metadata, while L7 load balancers inspect HTTP details such as host, path, headers, and cookies. L4 is generally faster and simpler, while L7 enables advanced routing and request-aware policies.\n\nRouting algorithms decide where each request goes. Round robin is fair for uniform nodes, least connections adapts to uneven request durations, IP hash can improve session affinity, and weighted routing supports heterogeneous server sizes or blue/green releases. Health checks are mandatory so dead or unhealthy targets are removed quickly. Sticky sessions are useful for legacy stateful workloads, but modern stateless services are usually easier to scale.',
    realWorldExamples: ['Nginx', 'AWS ALB/NLB', 'HAProxy', 'F5'],
    whenToUse: ['Multiple server instances', 'Need high availability', 'Traffic exceeds single server capacity'],
    whenNotToUse: ['Single server setup', 'Very low traffic apps'],
    commonPairings: ['Usually sits behind DNS/CDN, in front of application services'],
    realisticDefaults: {
      small: { throughput: 1000, latency: 5, description: 'Early product launch traffic' },
      medium: { throughput: 50000, latency: 4, description: 'Regional production load' },
      large: { throughput: 500000, latency: 3, description: 'Enterprise or global scale' },
    },
    keyMetrics: ['Request rate', 'P95/P99 latency', 'Healthy target count', 'Connection saturation'],
    failureModes: [
      'Single point of failure if not redundant',
      'Connection exhaustion under extreme load',
      'Misconfigured health checks routing to dead servers',
    ],
    interviewTip:
      'Always mention whether you need L4 (TCP) or L7 (HTTP) load balancing. Mention health checks. If asked about scaling, explain that LBs themselves can be scaled with DNS round-robin or anycast.',
    relatedConcepts: ['Load Balancing', 'Throughput', 'Latency', 'Failover', 'Single Point of Failure (SPOF)'],
  },
  database: {
    type: 'database',
    summary: 'Persistent data storage for your application.',
    explanation:
      'Databases trade off consistency, latency, and operational complexity depending on workload. SQL systems (PostgreSQL, MySQL) provide strong relational modeling, joins, and transactional guarantees. NoSQL systems can simplify horizontal scale for specific access patterns such as key-value or document retrieval.\n\nIn interviews, discuss ACID guarantees, indexing strategy, and read/write ratio first. Then cover replication (primary-replica) for availability and read scaling, and sharding for horizontal write scale. Connection pooling protects the database from connection storms, and the write-ahead log (WAL/binlog) underpins durability and replication.',
    realWorldExamples: ['PostgreSQL', 'MySQL', 'MongoDB', 'DynamoDB'],
    whenToUse: ['Need durable state', 'Transactional workflows', 'Complex querying and reporting'],
    whenNotToUse: ['Ephemeral-only data', 'Ultra-low-latency hot path without persistence needs'],
    commonPairings: ['Cache', 'Read replica', 'Queue', 'Search index'],
    realisticDefaults: {
      small: { throughput: 500, latency: 10, description: 'Single primary for startup workloads' },
      medium: { throughput: 5000, latency: 8, description: 'Primary + replicas with pooling' },
      large: { throughput: 50000, latency: 6, description: 'Sharded cluster with replicas' },
    },
    keyMetrics: ['QPS split (read/write)', 'Slow query count', 'Replication lag', 'Lock wait time', 'Cache hit ratio'],
    failureModes: ['Connection pool exhaustion', 'Slow queries blocking writes', 'Replication lag', 'Disk full', 'Lock contention'],
    interviewTip:
      'Always discuss: SQL vs NoSQL choice, indexing strategy, read/write ratio, replication for availability, sharding for scale. Mention CAP theorem tradeoffs.',
    relatedConcepts: ['Replication', 'Sharding', 'Read Replica', 'Write-Ahead Log (WAL)', 'CAP Theorem'],
  },
  cache: {
    type: 'cache',
    summary: 'In-memory data store for fast reads, reducing database load.',
    explanation:
      'Caching short-circuits expensive backend reads by storing hot data in memory. Common patterns are cache-aside (application loads and writes cache), write-through (writes both cache and DB together), and write-behind (cache writes asynchronously to DB). Cache-aside is most common because it keeps write-path complexity manageable.\n\nTTL and eviction policy drive freshness and memory behavior. LRU and LFU help preserve hot keys, while bad TTL choices can cause stampedes where many clients miss simultaneously. Invalidation strategy is the real design challenge: event-driven invalidation, versioned keys, and jittered TTLs reduce stale reads and synchronized expiry bursts.',
    realWorldExamples: ['Redis', 'Memcached', 'AWS ElastiCache'],
    whenToUse: ['Read-heavy endpoints', 'Expensive DB queries', 'Hot session/profile lookups'],
    whenNotToUse: ['Strictly fresh data with no staleness tolerance', 'Tiny systems where DB is underutilized'],
    commonPairings: ['Database', 'API Gateway', 'Rate Limiter', 'Session/Auth service'],
    realisticDefaults: {
      small: { throughput: 10000, latency: 1, description: 'Single-node cache for hot reads' },
      medium: { throughput: 100000, latency: 1, description: 'Replicated cache tier for core APIs' },
      large: { throughput: 1000000, latency: 1, description: 'Redis cluster with sharding' },
    },
    keyMetrics: ['Hit ratio', 'Memory usage', 'Eviction rate', 'Hot key skew', 'Miss burst rate'],
    failureModes: ['Cache stampede (many misses at once)', 'Hot key problem', 'Memory full + eviction', 'Stale data served after DB update'],
    interviewTip:
      'Cache invalidation is famously one of the two hard problems in CS. Always discuss your invalidation strategy and what happens on cache miss.',
    relatedConcepts: ['Cache Invalidation', 'Latency', 'Throughput', 'Bottleneck'],
  },
  queue: {
    type: 'queue',
    summary: 'Asynchronous message buffer that decouples producers from consumers.',
    explanation:
      'Queues absorb spikes by letting producers enqueue work quickly while consumers process at their own pace. This decoupling smooths traffic and protects downstream systems from sudden surges.\n\nDesign decisions include delivery guarantees (at-least-once vs exactly-once), ordering (FIFO vs partitioned ordering), retry/backoff, and dead-letter handling. Consumer groups enable parallelism, while backpressure policies prevent queue growth from becoming unbounded.',
    realWorldExamples: ['RabbitMQ', 'AWS SQS', 'Redis Streams'],
    whenToUse: ['Async processing', 'Traffic spike absorption', 'Decoupling services'],
    whenNotToUse: ['Synchronous request/response with tight latency SLA'],
    commonPairings: ['Worker', 'Lambda', 'Dead-letter queue', 'Event bus'],
    realisticDefaults: genericScale(5000, 50000, 300000),
    keyMetrics: ['Queue depth', 'Oldest message age', 'Consumer lag', 'Retry rate'],
    failureModes: ['Queue overflow (producers faster than consumers)', 'Message loss without persistence', 'Consumer crash leaving unacked messages', 'Head-of-line blocking'],
    interviewTip:
      'Queues are the answer to "how do you handle traffic spikes" and "how do you decouple services." Always mention retry strategy and dead letter queues.',
    relatedConcepts: ['Backpressure', 'Dead Letter Queue', 'Throughput', 'Fan-out'],
  },
  service: {
    type: 'service',
    summary: 'Application server that processes business logic.',
    explanation:
      'A service hosts domain logic, orchestrates dependencies, and enforces contracts. In modern distributed systems, stateless service instances are preferred so any request can be handled by any instance.\n\nHorizontal scaling, health checks, graceful shutdown, and dependency resilience patterns (timeouts, retries, circuit breakers) define production readiness. Thread pools, connection pools, and memory pressure are common bottlenecks that often dominate service behavior under load.',
    realWorldExamples: ['Node.js Express', 'Spring Boot', 'Django', 'Go HTTP server'],
    whenToUse: ['Core API/business logic', 'Domain boundary ownership', 'Independent deployability'],
    whenNotToUse: ['Pure static content serving', 'Long-running background tasks better suited for workers'],
    commonPairings: ['Load balancer', 'Database', 'Cache', 'Queue'],
    realisticDefaults: genericScale(2000, 20000, 150000),
    keyMetrics: ['Request latency', 'Error rate', 'CPU/memory', 'Downstream timeout rate'],
    failureModes: ['Memory leak', 'Thread pool exhaustion', 'Cascading failures from downstream dependency', 'OOM kill'],
    interviewTip:
      'Always make services stateless so they can scale horizontally. Mention circuit breakers for downstream dependencies.',
    relatedConcepts: ['Horizontal Scaling', 'Circuit Breaker', 'Bottleneck', 'Utilization'],
  },
  cdn: {
    type: 'cdn',
    summary: 'Geographically distributed network that caches static content close to users.',
    explanation:
      'A CDN serves content from edge locations near end users, reducing round-trip latency to the origin. It improves performance and offloads traffic from core infrastructure.\n\nOperational success depends on cache hit ratio, TTL policy, and invalidation strategy. CDNs also commonly provide TLS termination and DDoS shielding, making them both a performance and security primitive for internet-facing systems.',
    realWorldExamples: ['CloudFront', 'Cloudflare', 'Akamai', 'Fastly'],
    whenToUse: ['Global user base', 'Static assets', 'Cacheable API responses'],
    whenNotToUse: ['Highly personalized non-cacheable responses only'],
    commonPairings: ['DNS', 'WAF', 'Origin service', 'Object storage'],
    realisticDefaults: genericScale(50000, 300000, 2000000),
    keyMetrics: ['Cache hit ratio', 'Origin fetch rate', 'Edge latency', 'Bandwidth offload'],
    failureModes: ['Cache miss storm on purge', 'Origin overload if cache hit ratio drops', 'Stale content served'],
    interviewTip:
      'CDNs reduce latency by serving from edge. Great for static assets, API responses that do not change often. Mention cache hit ratio as the key metric.',
    relatedConcepts: ['Latency', 'Throughput', 'Failover'],
  },
  dns: {
    type: 'dns',
    summary: "Translates domain names to IP addresses — the internet's phone book.",
    explanation:
      'DNS resolution maps human-readable hostnames to network endpoints through recursive lookups and cached records. A/AAAA and CNAME records are the common building blocks.\n\nIn system design, DNS is frequently your first traffic control point. TTL tuning influences failover speed and query volume. GeoDNS and weighted routing can shift users across regions or stacks during incidents and migrations.',
    realWorldExamples: ['Route 53', 'Cloudflare DNS', 'Google DNS'],
    whenToUse: ['Any internet-facing application', 'Global or multi-region routing'],
    whenNotToUse: ['Internal-only local systems with direct addressing'],
    commonPairings: ['CDN', 'Load balancer', 'Edge router'],
    realisticDefaults: genericScale(100000, 500000, 3000000),
    keyMetrics: ['Query latency', 'NXDOMAIN/error rate', 'Record propagation delay'],
    failureModes: ['Bad record deployment', 'High TTL slowing failover', 'Provider outage'],
    interviewTip:
      'DNS is often the entry point in system design. Mention TTL tradeoffs: low TTL = fast failover but more DNS queries, high TTL = less queries but slow failover.',
    relatedConcepts: ['Failover', 'Latency', 'Load Balancing'],
  },
  apiGateway: {
    type: 'apiGateway',
    summary: 'Single entry point that routes, authenticates, and rate-limits API requests.',
    explanation:
      'API gateways centralize cross-cutting concerns before traffic reaches internal services. Typical functions include authn/authz, request routing, validation, transformation, and versioning.\n\nA gateway reduces duplicated code across services and enables consistent policies such as rate limiting and logging. The tradeoff is an extra hop and potential bottleneck if it is not scaled and monitored correctly.',
    realWorldExamples: ['Kong', 'AWS API Gateway', 'Apigee', 'Zuul'],
    whenToUse: ['Many backend services', 'Consistent auth/rate-limit policy', 'Public API programs'],
    whenNotToUse: ['Very small monolith where extra hop is unnecessary'],
    commonPairings: ['Auth service', 'Rate limiter', 'Service mesh', 'Logger'],
    realisticDefaults: genericScale(10000, 80000, 500000),
    keyMetrics: ['Auth failures', 'Throttle rate', 'Gateway latency', 'Per-route traffic'],
    failureModes: ['Misconfigured auth/routing', 'Rate limit over-blocking', 'Gateway saturation'],
    interviewTip:
      'API Gateway is the front door. It handles cross-cutting concerns so your services do not have to. Always mention rate limiting and auth.',
    relatedConcepts: ['Rate Limiting', 'Latency', 'Throughput', 'Fan-out'],
  },
  kafka: {
    type: 'kafka',
    summary: 'Distributed event streaming platform for high-throughput real-time data pipelines.',
    explanation:
      'Kafka stores ordered event logs in topics split into partitions, enabling high-throughput parallel consumption. Ordering is guaranteed only within a partition, so partition-key strategy is central to correctness.\n\nConsumer groups provide scalable processing, while offsets allow replay and recovery. Replication protects against broker failures. Log compaction can retain only latest value per key for changelog workloads, and transactions support stronger processing guarantees in advanced cases.',
    realWorldExamples: ['Apache Kafka', 'AWS MSK', 'Confluent Cloud'],
    whenToUse: ['Event-driven architecture', 'Audit/event replay', 'Streaming analytics'],
    whenNotToUse: ['Simple low-volume queueing where operational overhead is too high'],
    commonPairings: ['Stream processors', 'Data warehouse', 'Search indexing pipeline'],
    realisticDefaults: genericScale(50000, 300000, 1500000),
    keyMetrics: ['Consumer lag', 'Broker disk usage', 'Partition skew', 'Under-replicated partitions'],
    failureModes: ['Partition hotspot', 'Lag growth', 'Broker disk saturation', 'Mis-sized retention'],
    interviewTip:
      'Kafka is the answer for event-driven architecture, audit logs, and stream processing. Mention partitioning strategy for ordering and parallelism.',
    relatedConcepts: ['Fan-out', 'Backpressure', 'Idempotency', 'Replication'],
  },
  worker: { type: 'worker', summary: 'Background processor that pulls async jobs and executes them outside request path.', explanation: 'Workers consume queued tasks such as emails, media processing, or billing reconciliation. They improve API responsiveness by moving long operations off the synchronous path.\n\nReliability depends on idempotent handlers, retries with backoff, and dead-letter handling for poison messages.', realWorldExamples: ['Celery worker', 'BullMQ worker', 'Sidekiq'], whenToUse: ['Background jobs', 'Burst handling', 'Retryable tasks'], whenNotToUse: ['Interactive request/response only'], commonPairings: ['Queue', 'Database', 'Logger'], realisticDefaults: genericScale(1000, 10000, 100000), keyMetrics: ['Jobs/sec', 'Queue lag', 'Retry rate'], failureModes: ['Poison messages', 'Worker crashes', 'Runaway retries'], interviewTip: 'Call out idempotency and retry policy when discussing workers.', relatedConcepts: ['Idempotency', 'Backpressure', 'Dead Letter Queue'] },
  lambda: { type: 'lambda', summary: 'Serverless function that runs code on-demand without managing servers.', explanation: 'Lambdas scale automatically for bursty event-driven tasks and pay-per-use workloads. They are excellent for intermittent traffic, event handlers, and glue logic.\n\nKey tradeoffs are cold starts, execution timeouts, and limited runtime context. Keep functions small, stateless, and dependency-light.', realWorldExamples: ['AWS Lambda', 'Cloud Functions', 'Azure Functions'], whenToUse: ['Event-driven triggers', 'Bursty APIs', 'Low-ops background tasks'], whenNotToUse: ['Long-running compute', 'Ultra-low predictable latency paths'], commonPairings: ['Queue', 'Event bus', 'Object storage'], realisticDefaults: genericScale(2000, 20000, 150000), keyMetrics: ['Cold start rate', 'Duration', 'Concurrency'], failureModes: ['Cold start latency spikes', 'Timeouts', 'Concurrency throttling'], interviewTip: 'Mention cold starts, timeout limits, and idempotent retries.', relatedConcepts: ['Cold Start', 'Horizontal Scaling', 'Idempotency'] },
  container: { type: 'container', summary: 'Isolated runtime unit packaging app code and dependencies for consistent deployment.', explanation: 'Containers standardize runtime environments across dev and prod. They are usually orchestrated by platforms like Kubernetes for scheduling, scaling, and self-healing.\n\nDesign concerns include resource limits, startup probes, rolling deploys, and image security.', realWorldExamples: ['Docker', 'Kubernetes Pod', 'ECS Task'], whenToUse: ['Portable deployments', 'Microservices', 'Auto-scaling fleets'], whenNotToUse: ['Tiny single-host scripts'], commonPairings: ['Ingress', 'Service', 'Metrics collector'], realisticDefaults: genericScale(2000, 25000, 200000), keyMetrics: ['CPU/memory limits', 'Restart count', 'Pod startup time'], failureModes: ['OOM kills', 'Crash loops', 'Noisy neighbors'], interviewTip: 'Discuss stateless replicas, probes, and rolling deployments.', relatedConcepts: ['Horizontal Scaling', 'Health Check', 'Utilization'] },
  cronJob: { type: 'cronJob', summary: 'Scheduled task runner that executes jobs at fixed intervals.', explanation: 'Cron jobs handle periodic maintenance like backups, cleanup, and batch reconciliation. They are simple but easy to overload downstream systems if job timing is not controlled.\n\nUse jitter, locking, and idempotent logic to avoid duplicate runs.', realWorldExamples: ['Unix cron', 'Kubernetes CronJob', 'Cloud Scheduler'], whenToUse: ['Scheduled ETL', 'Maintenance tasks', 'Periodic reports'], whenNotToUse: ['Real-time stream processing'], commonPairings: ['Queue', 'Data warehouse', 'Blob storage'], realisticDefaults: genericScale(100, 2000, 10000), keyMetrics: ['Run duration', 'Missed schedules', 'Failure rate'], failureModes: ['Overlapping runs', 'Downstream spikes', 'Silent failures'], interviewTip: 'Mention idempotency and concurrency guards for scheduled jobs.', relatedConcepts: ['Idempotency', 'Backpressure'] },
  search: { type: 'search', summary: 'Specialized index optimized for fast text and faceted queries.', explanation: 'Search engines pre-index documents for relevance-ranked retrieval and low-latency filtering. They are eventually consistent with source-of-truth databases.\n\nShards and replicas balance throughput, durability, and query latency.', realWorldExamples: ['Elasticsearch', 'OpenSearch', 'Solr'], whenToUse: ['Full-text search', 'Facet/filter heavy queries', 'Autocomplete'], whenNotToUse: ['Strict transactional source of truth'], commonPairings: ['Database', 'Kafka', 'Logger'], realisticDefaults: genericScale(2000, 20000, 120000), keyMetrics: ['Indexing lag', 'Query P95', 'Shard balance'], failureModes: ['Shard hotspot', 'Slow reindex', 'Disk pressure'], interviewTip: 'State that primary data stays in DB; search index is derived and eventually consistent.', relatedConcepts: ['Eventual Consistency', 'Sharding', 'Replication'] },
  dataWarehouse: { type: 'dataWarehouse', summary: 'Analytical storage optimized for large scans and business intelligence queries.', explanation: 'Warehouses separate analytical workloads from transactional OLTP systems. They use columnar storage and batch/stream ingestion for reporting at scale.\n\nExpect higher query latency but huge scan throughput and cost-efficient analytics.', realWorldExamples: ['Snowflake', 'BigQuery', 'Redshift'], whenToUse: ['BI dashboards', 'Historical analytics', 'Batch reporting'], whenNotToUse: ['Low-latency transactional queries'], commonPairings: ['Kafka', 'ETL jobs', 'Object storage'], realisticDefaults: genericScale(500, 5000, 40000), keyMetrics: ['Ingestion lag', 'Query runtime', 'Storage growth'], failureModes: ['Stale pipelines', 'Cost spikes from bad queries', 'Schema drift'], interviewTip: 'Separate OLTP and OLAP concerns and mention ETL/ELT freshness tradeoffs.', relatedConcepts: ['Throughput', 'Latency', 'Eventual Consistency'] },
  blobStorage: { type: 'blobStorage', summary: 'Stores large unstructured binary files such as images, videos, and backups.', explanation: 'Blob stores provide durable, scalable storage for large objects addressed by path or key. They are optimized for throughput and durability rather than low-latency random updates.\n\nCommon patterns include signed URLs, lifecycle policies, and CDN fronting.', realWorldExamples: ['Azure Blob Storage', 'GCS', 'S3 (blob-style use)'], whenToUse: ['Media files', 'Backups', 'Static asset origin'], whenNotToUse: ['Relational transactional data'], commonPairings: ['CDN', 'Lambda', 'Data warehouse'], realisticDefaults: genericScale(5000, 60000, 300000), keyMetrics: ['PUT/GET latency', 'Error rate', 'Storage growth'], failureModes: ['Region outage', 'Permission misconfig', 'Unexpected egress cost'], interviewTip: 'Mention pre-signed URLs and CDN in front of object/blob storage.', relatedConcepts: ['Throughput', 'Latency', 'Failover'] },
  objectStore: { type: 'objectStore', summary: 'Durable key-addressable storage for immutable objects and data lakes.', explanation: 'Object stores expose simple APIs for large-scale durable storage with very high durability SLAs. They work well for logs, backups, and data-lake ingestion.\n\nCompared with local disks, they trade higher latency for massive scale and lifecycle tooling.', realWorldExamples: ['Amazon S3', 'MinIO', 'Ceph'], whenToUse: ['Data lake', 'Backups', 'Static files'], whenNotToUse: ['Low-latency block I/O requirements'], commonPairings: ['CDN', 'Data warehouse', 'Lambda'], realisticDefaults: genericScale(5000, 50000, 250000), keyMetrics: ['Request latency', 'Durability events', 'Lifecycle transitions'], failureModes: ['Credential leakage', 'Misconfigured bucket policy', 'Eventual listing consistency surprises'], interviewTip: 'Call out durability, lifecycle rules, and eventual consistency characteristics.', relatedConcepts: ['Eventual Consistency', 'Replication', 'Throughput'] },
  eventBus: { type: 'eventBus', summary: 'Central event routing layer that connects producers to many consumers.', explanation: 'An event bus enables loose coupling by publishing domain events that multiple consumers can subscribe to independently. This supports extensibility and asynchronous workflows.\n\nSchema governance and replay/retry policy are key for reliability.', realWorldExamples: ['AWS EventBridge', 'NATS', 'Google Eventarc'], whenToUse: ['Event-driven workflows', 'Cross-service integration'], whenNotToUse: ['Tight synchronous RPC workflows'], commonPairings: ['Lambda', 'Queue', 'Pub/Sub'], realisticDefaults: genericScale(5000, 70000, 350000), keyMetrics: ['Publish latency', 'Delivery success', 'Subscriber lag'], failureModes: ['Schema drift', 'Poison subscribers', 'Fan-out overload'], interviewTip: 'Emphasize decoupling plus schema/versioning strategy.', relatedConcepts: ['Fan-out', 'Backpressure', 'Idempotency'] },
  pubSub: { type: 'pubSub', summary: 'Messaging pattern where publishers broadcast to multiple subscribers.', explanation: 'Pub/Sub distributes one message to many consumers without direct producer awareness. It is useful for notifications, cache invalidation events, and analytics side-channels.\n\nGuarantees vary by platform; ordering and delivery semantics should be stated explicitly.', realWorldExamples: ['Google Pub/Sub', 'SNS', 'NATS'], whenToUse: ['Broadcast-style updates', 'Loose coupling'], whenNotToUse: ['Strict point-to-point guaranteed processing'], commonPairings: ['Queue', 'Service', 'Lambda'], realisticDefaults: genericScale(10000, 100000, 600000), keyMetrics: ['Delivery latency', 'Subscription lag', 'Redelivery rate'], failureModes: ['Subscriber backlog', 'Duplicate deliveries', 'Ordering surprises'], interviewTip: 'Clarify delivery semantics and subscriber idempotency.', relatedConcepts: ['Fan-out', 'Idempotency', 'Backpressure'] },
  reverseProxy: { type: 'reverseProxy', summary: 'Gateway in front of services that terminates connections and forwards requests.', explanation: 'Reverse proxies protect internal services, centralize TLS termination, and can perform routing, caching, and header manipulation. They are common at service and cluster boundaries.\n\nThey improve control but can become chokepoints if underprovisioned.', realWorldExamples: ['Nginx', 'Envoy', 'Traefik'], whenToUse: ['TLS termination', 'Request routing', 'Service shielding'], whenNotToUse: ['Direct internal service-to-service links only'], commonPairings: ['Load balancer', 'WAF', 'Ingress'], realisticDefaults: genericScale(10000, 80000, 500000), keyMetrics: ['Connection count', 'Proxy latency', '5xx rate'], failureModes: ['Config errors', 'Connection exhaustion', 'Header/routing bugs'], interviewTip: 'Mention TLS termination, routing policy, and observability at proxy layer.', relatedConcepts: ['Load Balancing', 'Latency', 'Health Check'] },
  edgeRouter: { type: 'edgeRouter', summary: 'Network edge component that routes traffic between networks and regions.', explanation: 'Edge routers control packet forwarding at network boundaries and are crucial for path selection and failover. They often pair with BGP/anycast strategies for resilient ingress.\n\nIn system design interviews, treat them as high-availability network primitives rather than business-logic components.', realWorldExamples: ['Cisco edge router', 'Juniper MX', 'Cloud edge router'], whenToUse: ['Multi-region networking', 'High-volume ingress'], whenNotToUse: ['Small single-VPC apps'], commonPairings: ['DNS', 'L4 load balancer', 'Firewall'], realisticDefaults: genericScale(50000, 300000, 1500000), keyMetrics: ['Packet loss', 'Route convergence', 'Interface saturation'], failureModes: ['Route misconfiguration', 'Convergence delays', 'Hardware failure'], interviewTip: 'Call out redundant edge routers and route failover behavior.', relatedConcepts: ['Failover', 'Single Point of Failure (SPOF)', 'Capacity'] },
  loadBalancerL4: { type: 'loadBalancerL4', summary: 'Transport-layer balancer that routes TCP/UDP connections with minimal inspection.', explanation: 'L4 balancing is efficient because routing decisions are made on network metadata, not HTTP payloads. It is ideal for very high throughput and low latency.\n\nYou lose application-aware features but gain performance and protocol flexibility.', realWorldExamples: ['AWS NLB', 'LVS', 'HAProxy TCP mode'], whenToUse: ['TCP services', 'Ultra-high throughput', 'Low-latency balancing'], whenNotToUse: ['Need path/header-based routing'], commonPairings: ['Edge router', 'Service pool', 'Firewall'], realisticDefaults: genericScale(80000, 500000, 2000000), keyMetrics: ['Connection rate', 'SYN backlog', 'Target health'], failureModes: ['Connection table exhaustion', 'Uneven flow hashing', 'Health check blind spots'], interviewTip: 'Differentiate L4 speed from L7 flexibility explicitly.', relatedConcepts: ['Load Balancing', 'Throughput', 'Latency'] },
  loadBalancerL7: { type: 'loadBalancerL7', summary: 'Application-layer balancer that routes HTTP traffic using request attributes.', explanation: 'L7 balancers inspect HTTP details to enable host/path routing, header-based canary, and auth-aware policies. They enable richer traffic control for modern APIs.\n\nThis comes with extra CPU overhead and potentially higher latency compared to L4.', realWorldExamples: ['AWS ALB', 'Envoy', 'NGINX Ingress'], whenToUse: ['HTTP routing rules', 'Canary/blue-green', 'App-aware policies'], whenNotToUse: ['Raw TCP/UDP traffic only'], commonPairings: ['API Gateway', 'Ingress', 'WAF'], realisticDefaults: genericScale(30000, 200000, 1000000), keyMetrics: ['P95 routing latency', 'Rule match errors', 'Target health'], failureModes: ['Rule misrouting', 'CPU saturation', 'TLS/config mistakes'], interviewTip: 'Mention L7 for request-aware routing and L4 for raw performance.', relatedConcepts: ['Load Balancing', 'Rate Limiting', 'Latency'] },
  authService: { type: 'authService', summary: 'Central service for identity verification, token issuance, and authorization checks.', explanation: 'Auth services issue and validate credentials (session, JWT, OAuth tokens) and often integrate with IAM/SSO providers. They are critical-path components for most API requests.\n\nReliability and latency matter because auth failures can look like full-system outages to users.', realWorldExamples: ['Keycloak', 'Auth0', 'AWS Cognito'], whenToUse: ['User identity', 'Session/token validation', 'Centralized authz policies'], whenNotToUse: ['Fully public anonymous endpoints only'], commonPairings: ['API Gateway', 'Rate limiter', 'Cache'], realisticDefaults: genericScale(5000, 50000, 300000), keyMetrics: ['Token issue latency', 'Auth error rate', 'Cache hit ratio'], failureModes: ['Token store outage', 'Clock skew/token expiry bugs', 'Dependency outage'], interviewTip: 'Discuss token strategy, TTL, revocation, and caching.', relatedConcepts: ['Rate Limiting', 'Latency', 'Failover'] },
  rateLimiter: { type: 'rateLimiter', summary: 'Controls request frequency to protect systems and enforce fairness.', explanation: 'Rate limiters enforce quotas per client, token, API key, or IP. Common algorithms include token bucket, leaky bucket, and fixed/sliding windows.\n\nDistributed rate limiting often uses Redis or gateway-native counters and must handle clock skew and multi-region consistency.', realWorldExamples: ['Envoy rate limit', 'NGINX limit_req', 'Redis-based limiter'], whenToUse: ['Public APIs', 'Abuse prevention', 'Downstream protection'], whenNotToUse: ['Trusted low-traffic internal systems'], commonPairings: ['API Gateway', 'Auth service', 'WAF'], realisticDefaults: genericScale(20000, 200000, 1200000), keyMetrics: ['Blocked request rate', 'Limiter latency', 'False positive block rate'], failureModes: ['Over-throttling legit users', 'Counter inconsistency', 'Limiter outage bypass'], interviewTip: 'Always define key dimension (IP/user/token) and algorithm used.', relatedConcepts: ['Rate Limiting', 'Capacity', 'Backpressure'] },
  firewall: { type: 'firewall', summary: 'Network security layer that filters traffic by policy.', explanation: 'Firewalls allow/deny traffic based on IPs, ports, protocols, and sometimes application context. They provide foundational perimeter and segmentation controls.\n\nPolicy hygiene and change management are critical to avoid accidental outages.', realWorldExamples: ['AWS Security Groups', 'Palo Alto', 'iptables'], whenToUse: ['Network segmentation', 'Ingress/egress control', 'Compliance boundaries'], whenNotToUse: ['As sole app-layer protection'], commonPairings: ['WAF', 'Edge router', 'Load balancer'], realisticDefaults: genericScale(50000, 400000, 2000000), keyMetrics: ['Blocked packet count', 'Rule hit distribution', 'Policy change errors'], failureModes: ['Overly broad allow rules', 'Accidental deny-all', 'Config drift'], interviewTip: 'Mention defense in depth: firewall + WAF + auth + rate limiting.', relatedConcepts: ['Failover', 'Single Point of Failure (SPOF)', 'Rate Limiting'] },
  logger: { type: 'logger', summary: 'Collects and stores application logs for debugging, audit, and operations.', explanation: 'Centralized logging aggregates events from many services for troubleshooting and incident response. Structured logs with correlation IDs are key in distributed systems.\n\nLogging pipelines need backpressure handling to avoid impacting request paths.', realWorldExamples: ['ELK Stack', 'Datadog Logs', 'CloudWatch Logs'], whenToUse: ['Observability', 'Audit trails', 'Incident debugging'], whenNotToUse: ['As only monitoring signal without metrics/traces'], commonPairings: ['Metrics collector', 'Service', 'Queue'], realisticDefaults: genericScale(10000, 100000, 500000), keyMetrics: ['Ingestion lag', 'Drop rate', 'Storage retention'], failureModes: ['Log loss under spike', 'Unbounded storage growth', 'PII leakage'], interviewTip: 'Highlight structured logging and correlation IDs.', relatedConcepts: ['Bottleneck', 'Backpressure', 'Throughput'] },
  healthCheck: { type: 'healthCheck', summary: 'Periodic probe that verifies whether a component is alive and ready.', explanation: 'Health checks detect failures quickly so traffic can be shifted away from unhealthy instances. Distinguish liveness (process alive) from readiness (can serve safely).\n\nPoor checks can create false positives or route traffic to broken instances.', realWorldExamples: ['Kubernetes probes', 'ALB target checks', 'Consul health checks'], whenToUse: ['Auto-healing', 'Load-balancer target gating', 'Deployment safety'], whenNotToUse: ['As only monitoring source'], commonPairings: ['Load balancer', 'Container orchestration', 'Service'], realisticDefaults: genericScale(1000, 5000, 30000), keyMetrics: ['Probe success rate', 'Detection time', 'False positive rate'], failureModes: ['Flaky checks', 'Too-shallow checks', 'Slow failure detection'], interviewTip: 'Explicitly mention readiness vs liveness.', relatedConcepts: ['Failover', 'Single Point of Failure (SPOF)', 'Latency'] },
  metricsCollector: { type: 'metricsCollector', summary: 'Ingests time-series telemetry for performance and reliability monitoring.', explanation: 'Metrics collectors scrape or receive counters, gauges, and histograms to power dashboards and alerts. They make system behavior visible over time.\n\nDesign concerns include label cardinality, retention, sampling, and alert quality.', realWorldExamples: ['Prometheus', 'Datadog', 'New Relic'], whenToUse: ['SLO monitoring', 'Capacity planning', 'Incident detection'], whenNotToUse: ['As replacement for logs/traces'], commonPairings: ['Logger', 'Service', 'Alerting stack'], realisticDefaults: genericScale(5000, 50000, 300000), keyMetrics: ['Ingestion rate', 'Series cardinality', 'Query latency'], failureModes: ['Cardinality explosion', 'Dropped samples', 'Alert fatigue'], interviewTip: 'Mention golden signals: latency, traffic, errors, saturation.', relatedConcepts: ['Utilization', 'Capacity', 'Bottleneck'] },
  waf: { type: 'waf', summary: 'Web application firewall that filters malicious HTTP traffic at the edge.', explanation: 'A WAF inspects HTTP requests for signatures and behavioral patterns such as SQL injection, XSS, and bot abuse. It complements network firewalls by operating at application layer.\n\nFalse positives and rule tuning are ongoing operational tasks.', realWorldExamples: ['Cloudflare WAF', 'AWS WAF', 'Akamai Kona'], whenToUse: ['Public web apps', 'Bot and exploit mitigation', 'Edge protection'], whenNotToUse: ['Internal-only trusted networks'], commonPairings: ['CDN', 'API Gateway', 'Rate limiter'], realisticDefaults: genericScale(10000, 120000, 700000), keyMetrics: ['Blocked request count', 'False positives', 'Inspection latency'], failureModes: ['Legitimate traffic blocked', 'Rule bypass', 'Config drift'], interviewTip: 'Describe WAF as app-layer defense, not a replacement for auth or secure coding.', relatedConcepts: ['Rate Limiting', 'Latency', 'Failover'] },
  ingress: { type: 'ingress', summary: 'Cluster entry controller that exposes internal services to external traffic.', explanation: 'Ingress defines L7 routing rules into a container platform, usually Kubernetes. It centralizes hostname/path routing, TLS termination, and traffic policy.\n\nIt is often implemented by NGINX, Envoy, or cloud-native controllers.', realWorldExamples: ['Kubernetes Ingress', 'NGINX Ingress Controller', 'Traefik Ingress'], whenToUse: ['Kubernetes external routing', 'Centralized TLS and rules'], whenNotToUse: ['Non-cluster or simple single-service deployments'], commonPairings: ['Service', 'Load balancer', 'WAF'], realisticDefaults: genericScale(8000, 70000, 400000), keyMetrics: ['Ingress latency', '4xx/5xx rate', 'Config sync health'], failureModes: ['Bad route manifests', 'Controller saturation', 'TLS misconfigurations'], interviewTip: 'Explain ingress as policy layer over cluster services.', relatedConcepts: ['Load Balancing', 'Latency', 'Health Check'] },
};

export function getComponentKnowledge(type: NodeBreakerNodeType): ComponentKnowledge {
  return KNOWLEDGE_BY_COMPONENT[type];
}
