export interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  explanation: string;
  highlightComponent?: string;
  expectedAction:
    | { type: 'add_node'; nodeType: string }
    | { type: 'connect_nodes'; fromType: string; toType: string }
    | { type: 'change_property'; nodeType: string; property: string; value?: number }
    | { type: 'start_simulation' }
    | { type: 'stop_simulation' }
    | { type: 'inject_chaos'; chaosType: string; targetType: string }
    | { type: 'observe' };
  autoComplete?: boolean;
  tip?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  icon: string;
  color: string;
  concepts: string[];
  steps: TutorialStep[];
}

export const TUTORIALS: readonly Tutorial[] = [
  {
    id: 'first-system',
    title: 'Your First System',
    description: 'Build a basic three-tier architecture and understand request flow fundamentals.',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    icon: 'Rocket',
    color: '#22c55e',
    concepts: ['load balancing', 'request flow', 'throughput', 'latency'],
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to System Design',
        instruction: "In this tutorial, you'll build a simple web application architecture from scratch.",
        explanation:
          "Every web application needs at least three things: something to receive traffic, something to process it, and somewhere to store data. Let's build that.",
        expectedAction: { type: 'observe' },
      },
      {
        id: 'add-lb',
        title: 'Add a Load Balancer',
        instruction: 'Drag a Load Balancer from the sidebar onto the canvas.',
        explanation:
          'A Load Balancer is the front door of your system. When millions of users hit your website, the LB distributes those requests across multiple servers so no single server gets overwhelmed. Think of it like a restaurant host seating guests at different tables.',
        highlightComponent: 'loadBalancer',
        expectedAction: { type: 'add_node', nodeType: 'loadBalancer' },
        tip: 'In interviews, always start your design with how traffic enters the system.',
      },
      {
        id: 'add-service',
        title: 'Add a Service',
        instruction: 'Drag a Service component onto the canvas, to the right of the Load Balancer.',
        explanation:
          'This is your application server - it runs your business logic. When a user shortens a URL or sends a message, this server does the actual work. In the real world, this could be a Node.js Express server, a Spring Boot app, or a Django backend.',
        highlightComponent: 'service',
        expectedAction: { type: 'add_node', nodeType: 'service' },
      },
      {
        id: 'add-db',
        title: 'Add a Database',
        instruction: 'Drag a Database component to the right of the Service.',
        explanation:
          "Your service needs somewhere to store data permanently. Databases persist information even if your servers restart. You'll choose between SQL (PostgreSQL, MySQL) for structured data with relationships, or NoSQL (MongoDB, DynamoDB) for flexible, high-volume data.",
        highlightComponent: 'database',
        expectedAction: { type: 'add_node', nodeType: 'database' },
        tip: 'Interviewers love hearing you discuss SQL vs NoSQL tradeoffs. SQL = consistency + relationships. NoSQL = flexibility + horizontal scale.',
      },
      {
        id: 'connect-lb-service',
        title: 'Connect the Flow',
        instruction:
          "Connect Load Balancer -> Service by dragging from the LB's output handle to the Service's input handle.",
        explanation:
          'This connection represents network traffic flowing between components. In reality, this is HTTP requests, gRPC calls, or TCP connections traveling over the network.',
        expectedAction: { type: 'connect_nodes', fromType: 'loadBalancer', toType: 'service' },
      },
      {
        id: 'connect-service-db',
        title: 'Complete the Chain',
        instruction: 'Now connect Service -> Database.',
        explanation:
          'When your service needs to read or write data, it sends queries to the database. This connection typically uses a connection pool - a set of reusable database connections to avoid the overhead of creating a new connection for every request.',
        expectedAction: { type: 'connect_nodes', fromType: 'service', toType: 'database' },
      },
      {
        id: 'start-sim',
        title: 'Run the Simulation',
        instruction: 'Click START SIMULATION and watch what happens.',
        explanation:
          "Now you'll see traffic flowing through your system. The animated dots represent requests. Watch the colors - green means healthy, yellow means under pressure, red means overloaded. The metrics at the bottom show you exactly what's happening.",
        expectedAction: { type: 'start_simulation' },
        tip: 'This is what interviewers want you to think about: how does data flow through the system? Where are the potential bottlenecks?',
      },
      {
        id: 'observe-bottleneck',
        title: 'Spot the Bottleneck',
        instruction: 'Look at the metrics dashboard. Which component has the highest utilization?',
        explanation:
          "The component with the highest utilization percentage is your bottleneck - it's the weakest link in the chain. In real systems, bottlenecks are usually the database because disk I/O is much slower than in-memory computation. This is why caching exists - which we'll cover in the next tutorial.",
        expectedAction: { type: 'observe' },
      },
      {
        id: 'complete',
        title: 'Tutorial Complete!',
        instruction: 'You just built your first distributed system!',
        explanation:
          "You now understand the basic three-tier architecture: Load Balancer -> Application Server -> Database. This pattern handles most web applications. Next, you'll learn how to optimize it with caching.",
        expectedAction: { type: 'stop_simulation' },
        tip: 'This three-tier architecture is the foundation of 90% of system design interview answers.',
      },
    ],
  },
  {
    id: 'power-of-caching',
    title: 'The Power of Caching',
    description: 'Use cache-aside to reduce database pressure and improve read performance.',
    difficulty: 'beginner',
    estimatedMinutes: 7,
    icon: 'DatabaseZap',
    color: '#10b981',
    concepts: ['cache-aside pattern', 'cache hit ratio', 'TTL', 'reducing database load'],
    steps: [
      {
        id: 'db-struggling',
        title: 'Why your database is struggling',
        instruction: 'Read this quick setup before we optimize.',
        explanation:
          'Databases are slower because they often read from disk. Caches store hot data in RAM, which can be 100x faster for read-heavy workloads.',
        expectedAction: { type: 'observe' },
      },
      {
        id: 'build-chain',
        title: 'Build the baseline chain',
        instruction: 'Build or reuse a simple Load Balancer -> Service -> Database architecture.',
        explanation:
          'This baseline lets you compare behavior before and after adding a cache. We need a clear control architecture to prove impact.',
        expectedAction: { type: 'connect_nodes', fromType: 'service', toType: 'database' },
      },
      {
        id: 'run-baseline',
        title: 'Run baseline simulation',
        instruction: 'Start simulation and observe database pressure.',
        explanation:
          'Without a cache, almost every read hits the database. As read traffic climbs, utilization spikes and latency worsens.',
        expectedAction: { type: 'start_simulation' },
      },
      {
        id: 'stop-baseline',
        title: 'Pause for redesign',
        instruction: 'Stop simulation so we can add caching safely.',
        explanation:
          'When changing architecture, pause to make dependencies explicit and avoid mixing old and new runtime behavior.',
        expectedAction: { type: 'stop_simulation' },
      },
      {
        id: 'add-cache',
        title: 'Add a Cache',
        instruction: 'Add a Cache node between Service and Database.',
        explanation:
          'A cache keeps frequently requested values in memory so repeat reads skip expensive database access.',
        highlightComponent: 'cache',
        expectedAction: { type: 'add_node', nodeType: 'cache' },
      },
      {
        id: 'wire-cache-and-db',
        title: 'Connect Service -> Cache and Service -> Database',
        instruction: 'Connect the Service to both Cache and Database.',
        explanation:
          'This models cache-aside: the service checks cache first and falls back to database on cache miss.',
        expectedAction: { type: 'connect_nodes', fromType: 'service', toType: 'cache' },
      },
      {
        id: 'set-cache-throughput',
        title: 'Tune cache throughput',
        instruction: 'Increase Cache throughput to 50000 req/s in properties.',
        explanation:
          'High in-memory throughput is realistic for Redis-like systems. A fast cache absorbs most read demand.',
        expectedAction: { type: 'change_property', nodeType: 'cache', property: 'throughput', value: 50000 },
      },
      {
        id: 'run-with-cache',
        title: 'Run with cache enabled',
        instruction: 'Start simulation again and compare metrics.',
        explanation:
          'A healthy cache should stay green while database load drops significantly because only misses reach storage.',
        expectedAction: { type: 'start_simulation' },
      },
      {
        id: 'observe-cache-aside',
        title: 'Understand cache-aside',
        instruction: 'Observe and click Next after reviewing the metrics.',
        explanation:
          'Cache-aside typically yields 80-95% hit ratio in read-heavy systems. TTL and invalidation policies keep cached data fresh enough for your consistency needs.',
        expectedAction: { type: 'observe' },
      },
      {
        id: 'cache-complete',
        title: 'Tutorial Complete!',
        instruction: 'You reduced database load by adding one component.',
        explanation:
          'You just reduced database load by 80%+ with a single component. This is why Redis is common in production systems.',
        expectedAction: { type: 'stop_simulation' },
        tip: 'In interviews, whenever someone mentions high read traffic, your first instinct should be: add a cache.',
      },
    ],
  },
  {
    id: 'surviving-failures',
    title: 'Surviving Failures',
    description: 'Practice redundancy and chaos testing to remove single points of failure.',
    difficulty: 'intermediate',
    estimatedMinutes: 8,
    icon: 'ShieldAlert',
    color: '#f59e0b',
    concepts: ['single point of failure', 'redundancy', 'chaos engineering', 'health checks'],
    steps: [
      {
        id: 'failure-intro',
        title: 'What happens when things break?',
        instruction: 'Read the failure mindset before building.',
        explanation:
          'In distributed systems, failure is not if, but when. Design assumes crashes, latency spikes, and partitions will happen.',
        expectedAction: { type: 'observe' },
      },
      {
        id: 'build-spof',
        title: 'Build a single-service system',
        instruction: 'Build Load Balancer -> Service -> Database.',
        explanation: 'A single service instance is easy to reason about but creates a dangerous single point of failure.',
        expectedAction: { type: 'connect_nodes', fromType: 'service', toType: 'database' },
      },
      {
        id: 'start-healthy',
        title: 'Start simulation',
        instruction: 'Start simulation and verify everything is healthy.',
        explanation: 'We need baseline healthy behavior before chaos testing.',
        expectedAction: { type: 'start_simulation' },
      },
      {
        id: 'inject-crash',
        title: 'Crash the Service',
        instruction: 'Inject Node Crash chaos targeting a Service.',
        explanation:
          'If one service crash kills the system, that service is a SPOF. This is the most common reliability anti-pattern.',
        expectedAction: { type: 'inject_chaos', chaosType: 'node_crash', targetType: 'service' },
      },
      {
        id: 'stop-and-recover',
        title: 'Stop and recover',
        instruction: 'Stop simulation to redesign with redundancy.',
        explanation:
          'Use downtime to redesign architecture. Redundancy is a topology change, not just a runtime toggle.',
        expectedAction: { type: 'stop_simulation' },
      },
      {
        id: 'add-second-service',
        title: 'Add redundancy',
        instruction: 'Add a second Service, connect LB to both, and both services to Database.',
        explanation:
          'Now load balancer can route around failures. Multiple instances reduce blast radius and improve availability.',
        highlightComponent: 'service',
        expectedAction: { type: 'add_node', nodeType: 'service' },
      },
      {
        id: 'restart-with-redundancy',
        title: 'Test again with redundancy',
        instruction: 'Start simulation, then inject Node Crash on one Service.',
        explanation:
          'With health checks, the load balancer stops routing to the failed instance and keeps serving with healthy ones.',
        expectedAction: { type: 'inject_chaos', chaosType: 'node_crash', targetType: 'service' },
      },
      {
        id: 'reliability-patterns',
        title: 'Reliability patterns',
        instruction: 'Review the result, then continue.',
        explanation:
          'Health checks detect failed nodes. Graceful degradation preserves core functionality. Circuit breakers prevent repeated calls to unhealthy dependencies.',
        expectedAction: { type: 'observe' },
      },
      {
        id: 'failure-complete',
        title: 'Tutorial Complete!',
        instruction: 'You designed for failure and stayed online.',
        explanation:
          'Redundancy is the most important concept in distributed systems. Critical paths should never rely on one instance.',
        expectedAction: { type: 'stop_simulation' },
        tip: "In interviews, after drawing any component, ask: what happens if this dies? If the system goes down, add redundancy.",
      },
    ],
  },
  {
    id: 'scaling-under-load',
    title: 'Scaling Under Load',
    description: 'Compare vertical and horizontal scaling, then add queues for spike absorption.',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    icon: 'TrendingUp',
    color: '#f97316',
    concepts: ['horizontal vs vertical scaling', 'queue buffering', 'backpressure', 'auto-scaling'],
    steps: [
      {
        id: 'viral-intro',
        title: 'Your app just went viral',
        instruction: 'Read the scenario before building.',
        explanation:
          'Traffic spikes happen during launches, Black Friday, or viral events. Systems must handle sudden load growth.',
        expectedAction: { type: 'observe' },
      },
      {
        id: 'build-overload',
        title: 'Build a constrained system',
        instruction: 'Build LB -> Service -> Database and set Service throughput to 500 req/s.',
        explanation:
          'This intentionally constrained service will bottleneck under higher incoming traffic.',
        expectedAction: { type: 'change_property', nodeType: 'service', property: 'throughput', value: 500 },
      },
      {
        id: 'run-overload',
        title: 'Run under load',
        instruction: 'Start simulation and observe Service saturation.',
        explanation:
          "When offered traffic exceeds service throughput, queue depth and latency rise quickly. That's overload behavior.",
        expectedAction: { type: 'start_simulation' },
      },
      {
        id: 'vertical-scale',
        title: 'Option 1: Vertical scaling',
        instruction: 'Increase Service throughput to 5000 req/s.',
        explanation:
          'Vertical scaling upgrades a single machine. It helps quickly but has hard limits and increasing cost.',
        expectedAction: { type: 'change_property', nodeType: 'service', property: 'throughput', value: 5000 },
      },
      {
        id: 'stop-for-horizontal',
        title: 'Prepare for horizontal scaling',
        instruction: 'Stop simulation, then set Service throughput back to 500 req/s.',
        explanation:
          'To compare patterns fairly, reset capacity before introducing additional service instances.',
        expectedAction: { type: 'stop_simulation' },
      },
      {
        id: 'add-more-services',
        title: 'Option 2: Horizontal scaling',
        instruction: 'Add two more Service nodes and wire LB to all services.',
        explanation:
          'Horizontal scaling adds instances. With stateless services, capacity grows linearly with instance count.',
        highlightComponent: 'service',
        expectedAction: { type: 'add_node', nodeType: 'service' },
      },
      {
        id: 'start-shared-load',
        title: 'Run with three services',
        instruction: 'Start simulation and observe traffic sharing across service instances.',
        explanation:
          'Load balancing spreads requests over replicas, reducing utilization per instance and improving resilience.',
        expectedAction: { type: 'start_simulation' },
      },
      {
        id: 'increase-traffic',
        title: 'Simulate growth',
        instruction: 'Increase traffic slider to around 2000 and observe utilization.',
        explanation:
          'As demand keeps rising, replicas trend yellow. This is where auto-scaling usually adds more instances.',
        expectedAction: { type: 'observe' },
      },
      {
        id: 'stateless-note',
        title: 'Why stateless matters',
        instruction: 'Review statelessness notes, then continue.',
        explanation:
          'Horizontal scaling works best when services are stateless. Session or request state should live in shared stores like Redis or databases.',
        expectedAction: { type: 'observe' },
      },
      {
        id: 'add-queue',
        title: 'Add queue buffering',
        instruction: 'Add a Queue between Services and Database and connect at least one Service -> Queue.',
        explanation:
          'Queues decouple producers from slow consumers. They absorb spikes and apply backpressure to protect downstream systems.',
        highlightComponent: 'queue',
        expectedAction: { type: 'add_node', nodeType: 'queue' },
      },
      {
        id: 'scaling-complete',
        title: 'Tutorial Complete!',
        instruction: 'You implemented scalable traffic handling patterns.',
        explanation:
          'Scale horizontally whenever possible. Use queues to smooth spikes and isolate slow dependencies.',
        expectedAction: { type: 'observe' },
        tip: 'In interviews, explain horizontal scaling for stateless compute and vertical scaling for databases until sharding is needed.',
      },
    ],
  },
  {
    id: 'design-url-shortener',
    title: 'Design a URL Shortener',
    description: 'Complete a full interview-style architecture from requirements to tradeoffs.',
    difficulty: 'advanced',
    estimatedMinutes: 12,
    icon: 'Link',
    color: '#ef4444',
    concepts: ['requirements', 'estimation', 'data flow', 'scaling', 'tradeoffs'],
    steps: [
      {
        id: 'url-intro',
        title: 'The Classic Interview Question',
        instruction: 'Read requirements before designing.',
        explanation:
          'Design for shorten URL, redirect on click, and scale targets around 10k reads/sec and 1k writes/sec. Start with requirements before components.',
        expectedAction: { type: 'observe' },
      },
      {
        id: 'entry-layer',
        title: 'Step 1: Traffic entry',
        instruction: 'Add DNS -> CDN -> Load Balancer.',
        explanation:
          'DNS resolves domain, CDN serves cached redirects near users, and LB distributes remaining traffic to origin services.',
        highlightComponent: 'dns',
        expectedAction: { type: 'add_node', nodeType: 'dns' },
      },
      {
        id: 'api-layer',
        title: 'Step 2: API layer',
        instruction: 'Add API Gateway after Load Balancer.',
        explanation:
          'API Gateway centralizes authentication, request validation, and rate limiting before business logic.',
        highlightComponent: 'apiGateway',
        expectedAction: { type: 'add_node', nodeType: 'apiGateway' },
      },
      {
        id: 'core-service',
        title: 'Step 3: Core Service',
        instruction: 'Add a Service for URL shortener and connect API Gateway -> Service.',
        explanation:
          'The service implements short-code generation (often base62 + monotonic ID strategy) and redirect resolution.',
        highlightComponent: 'service',
        expectedAction: { type: 'connect_nodes', fromType: 'apiGateway', toType: 'service' },
      },
      {
        id: 'storage-layer',
        title: 'Step 4: Storage',
        instruction: 'Add Database and connect Service -> Database.',
        explanation:
          'A relational schema can use short_code, original_url, created_at, and click_count. Index short_code for fast lookups.',
        highlightComponent: 'database',
        expectedAction: { type: 'connect_nodes', fromType: 'service', toType: 'database' },
      },
      {
        id: 'cache-reads',
        title: 'Step 5: Caching for reads',
        instruction: 'Add Cache and connect Service -> Cache.',
        explanation:
          'Redirect traffic is read-heavy. Cache hot short codes in Redis to achieve 90%+ hit ratio and protect primary storage.',
        highlightComponent: 'cache',
        expectedAction: { type: 'connect_nodes', fromType: 'service', toType: 'cache' },
      },
      {
        id: 'analytics-pipeline',
        title: 'Step 6: Analytics pipeline',
        instruction: 'Add Queue -> Worker -> Data Warehouse for click analytics.',
        explanation:
          'Click tracking is asynchronous. Queue events quickly on redirect path, then process in workers to avoid adding user-facing latency.',
        highlightComponent: 'queue',
        expectedAction: { type: 'add_node', nodeType: 'queue' },
      },
      {
        id: 'run-full-design',
        title: 'Run the simulation',
        instruction: 'Start simulation and review end-to-end metrics.',
        explanation:
          'Validate throughput, latency, and saturation points. Simulation helps expose hidden bottlenecks early.',
        expectedAction: { type: 'start_simulation' },
      },
      {
        id: 'crash-db',
        title: 'Test graceful degradation',
        instruction: 'Inject Node Crash chaos on Database.',
        explanation:
          'If cache is warm, read path can remain partially available even when write path is degraded or down.',
        expectedAction: { type: 'inject_chaos', chaosType: 'node_crash', targetType: 'database' },
      },
      {
        id: 'estimation',
        title: 'Back-of-envelope estimation',
        instruction: 'Review this estimation and continue.',
        explanation:
          '10k reads/sec x 86400 sec/day = 864M reads/day. At roughly 100 bytes per URL mapping, 1B URLs is around 100GB before indexing and overhead.',
        expectedAction: { type: 'observe' },
      },
      {
        id: 'url-complete',
        title: 'Tutorial Complete!',
        instruction: 'You completed an interview-style system design walkthrough.',
        explanation:
          'This architecture pattern also applies to paste bins, file-sharing links, and link management platforms.',
        expectedAction: { type: 'stop_simulation' },
        tip: 'In interviews: requirements -> estimates -> architecture -> tradeoffs -> bottlenecks. Mention caching for reads, queues for writes, replication for availability.',
      },
    ],
  },
] as const;

export function getTutorialById(id: string): Tutorial | undefined {
  return TUTORIALS.find((tutorial) => tutorial.id === id);
}
