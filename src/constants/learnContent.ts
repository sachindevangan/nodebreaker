import type { LearnSection } from './journey';

export const LEARN_CONTENT_BY_STAGE: Record<string, LearnSection> = {
  'stage-1': {
    title: 'What Is a Server?',
    estimatedMinutes: 8,
    content: [
      {
        type: 'text',
        content: `# The Client-Server Model

Every time you open Instagram, search on Google, or send a message on WhatsApp, your phone (the **client**) is talking to a computer somewhere in a data center (the **server**).

The client sends a **request**: "Hey, show me my Instagram feed." The server processes that request - it checks who you follow, finds their latest posts, sorts them by relevance - and sends back a **response**: the data your app needs to display your feed.

This is the **client-server model**, and it's the foundation of every single web application ever built.`,
      },
      {
        type: 'analogy',
        content:
          'Think of a restaurant. You (the client) sit at a table and place an order (the request). The kitchen (the server) receives your order, prepares the food (processes the request), and a waiter brings it back to your table (the response). The kitchen can serve many tables at once, just like a server handles many users simultaneously.',
      },
      {
        type: 'diagram',
        content: 'Client -> Server -> Response flow',
        diagramTemplate: 'client-server-flow',
      },
      {
        type: 'text',
        content: `# What Does a Server Actually Do?

A server is just a computer - but optimized for handling many requests simultaneously instead of running a desktop UI. Here's what happens inside:

**1. Receive the request**
The server listens on a network port (usually port 80 for HTTP or 443 for HTTPS). When your browser connects, the server accepts the connection and reads what you're asking for.

**2. Process the request**
This is where your application code runs. For a URL shortener, it might look up a short code in the database. For a social media app, it might fetch posts from people you follow. This is called **business logic**.

**3. Talk to other services**
Most servers don't work alone. They connect to databases to read/write data, to caches for fast lookups, to other microservices for specific tasks. Each of these connections adds latency.

**4. Send the response**
The server sends back data - usually as JSON for APIs or HTML for web pages. Your browser or app then renders this into what you see on screen.`,
      },
      {
        type: 'comparison',
        content: 'Real-World Server Numbers',
        comparison: {
          left: 'Small Scale (Startup)',
          leftItems: [
            'Single server',
            '1,000 req/s throughput',
            '50ms average latency',
            '5,000 concurrent users',
            'One database',
            '$50-200/month hosting',
          ],
          right: 'Large Scale (Netflix/Google)',
          rightItems: [
            'Thousands of servers',
            '1,000,000+ req/s throughput',
            '<10ms average latency',
            '100,000,000+ concurrent users',
            'Distributed databases worldwide',
            '$1,000,000+/month infrastructure',
          ],
        },
      },
      {
        type: 'interactive',
        content: 'See it yourself',
        interactivePrompt: `Drop a Service node onto the canvas.
Set its throughput to 500 req/s. Start the simulation.
Then lower throughput to 50 req/s and watch the status shift from green to yellow/red.

This is a bottleneck in action.`,
      },
      {
        type: 'quiz',
        content: 'Quick Check',
        quiz: {
          question: 'A server has throughput of 1000 req/s and is receiving 1500 req/s. What happens?',
          options: [
            'It processes all 1500 requests normally',
            'It processes 1000 and queues/drops the extra 500',
            'It crashes immediately',
            'It automatically scales to handle 1500',
          ],
          correctIndex: 1,
          explanation:
            'The server can only handle 1000 req/s. The extra 500 either queue up (higher latency) or get dropped.',
        },
      },
      {
        type: 'text',
        content: `# Key Takeaways

- A **server** receives requests, processes them, and sends responses
- **Throughput** = requests per second (how much)
- **Latency** = time per request (how fast)
- **Capacity** = max concurrent load (how many at once)
- Single servers have limits; distributed systems solve this`,
      },
    ],
  },
  'stage-2': {
    title: 'Throughput, Latency & Capacity',
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        content: `# The Three Pillars of System Performance

In Stage 1, we introduced throughput, latency, and capacity. Now we go deeper so you can reason with numbers during design interviews.`,
      },
      {
        type: 'diagram',
        content: 'Throughput/Latency/Capacity relationship',
        diagramTemplate: 'performance-pillars',
      },
      {
        type: 'text',
        content: `# Throughput: The Highway Analogy

Throughput is the number of requests your system processes per second (req/s).

- Single-lane road: ~1,000 cars/hour
- 4-lane highway: ~4,000 cars/hour
- 8-lane expressway: ~8,000 cars/hour

In systems, "more lanes" means:
- horizontal scaling (more instances),
- vertical scaling (faster instances),
- and load balancing.`,
      },
      {
        type: 'analogy',
        content:
          "Throughput vs latency is like a water pipe: throughput is how much water flows per second (width), latency is how long one drop takes from end to end (length).",
      },
      {
        type: 'text',
        content: `# Latency: Where Time Goes

Latency includes:
- **Network latency** (distance)
- **Processing latency** (CPU, storage, DB)
- **Queue wait time** (utilization pressure)

As utilization approaches 100%, queueing delay rises sharply. Keep critical components below 70-80% utilization when possible.`,
      },
      {
        type: 'interactive',
        content: 'Find the Bottleneck',
        interactivePrompt: `Build this chain:
Load Balancer (10k req/s) -> Service (2k req/s) -> Database (100 req/s)

Run simulation and identify what turns red first.
Then increase the DB throughput and observe recovery.`,
      },
      {
        type: 'quiz',
        content: 'Throughput Quiz',
        quiz: {
          question: 'Your system: LB (50k) -> API (10k) -> DB (2k). What is max throughput?',
          options: ['50,000 req/s', '10,000 req/s', '2,000 req/s', '62,000 req/s'],
          correctIndex: 2,
          explanation: 'The bottleneck sets the maximum: DB at 2,000 req/s.',
        },
      },
      {
        type: 'quiz',
        content: 'Latency Quiz',
        quiz: {
          question: 'At 99% utilization, what typically happens to latency?',
          options: ['Small increase', 'No change', 'Dramatic increase', 'Latency decreases'],
          correctIndex: 2,
          explanation: 'Queueing explodes near capacity, so latency rises dramatically.',
        },
      },
    ],
  },
  'stage-3': {
    title: 'The Database Problem',
    estimatedMinutes: 12,
    content: [
      {
        type: 'text',
        content: `# Why Databases Become Bottlenecks

Compute and cache layers run in memory; databases often touch disk and complex query planning.
That makes DB latency higher and throughput lower than stateless services in many systems.`,
      },
      {
        type: 'diagram',
        content: 'API -> DB bottleneck view',
        diagramTemplate: 'database-bottleneck',
      },
      {
        type: 'comparison',
        content: 'SQL vs NoSQL Comparison',
        comparison: {
          left: 'SQL (PostgreSQL, MySQL)',
          leftItems: [
            'Fixed schema',
            'Strong ACID guarantees',
            'Great JOIN support',
            'Ideal for integrity-heavy workloads',
            'Typical throughput: 5k-20k qps',
          ],
          right: 'NoSQL (MongoDB, DynamoDB)',
          rightItems: [
            'Flexible schema',
            'Horizontal scale first',
            'Often eventual consistency',
            'Great for high volume/unstructured data',
            'Typical throughput: 50k+ ops/s',
          ],
        },
      },
      {
        type: 'text',
        content: `# Connection Pooling, Replication, Indexes

**Connection pooling** avoids expensive new DB handshakes for every request.

**Replication** splits reads away from the write primary and improves availability.

**Indexes** can turn table scans into fast lookups, but add write overhead and storage cost.`,
      },
      {
        type: 'interactive',
        content: 'See the DB bottleneck',
        interactivePrompt: `Build: LB (10k) -> Service (5k) -> Database (500).
Run simulation and observe DB pressure.

Then add another DB node and split traffic to model read replicas.`,
      },
      {
        type: 'quiz',
        content: 'Database Quiz',
        quiz: {
          question: 'Your app is read-heavy (10x reads to writes). Which step helps first?',
          options: ['Remove indexes', 'Add read replicas', 'Switch languages', 'Disable pooling'],
          correctIndex: 1,
          explanation: 'Read replicas are a standard first move for read-heavy bottlenecks.',
        },
      },
    ],
  },
  'stage-4': {
    title: 'Caching - The Speed Hack',
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        content: `# Why Caching Changes Everything

Caching stores hot data in RAM.
Typical cache lookup: **0.1-1ms**.
Typical DB query: **5-50ms**.

A high hit ratio dramatically cuts DB load and improves user experience.`,
      },
      {
        type: 'diagram',
        content: 'Cache-aside data flow',
        diagramTemplate: 'cache-aside',
      },
      {
        type: 'analogy',
        content:
          'Your desk (cache) holds docs you need constantly; filing cabinet (database) stores everything but is slower to access.',
      },
      {
        type: 'text',
        content: `# Cache Patterns and Risks

Common patterns:
- Cache-aside (most common)
- Write-through
- Write-behind

Common pitfalls:
- Stampede / thundering herd
- Hot keys
- Invalidation bugs
- Stale data from long TTL`,
      },
      {
        type: 'comparison',
        content: 'Redis vs Memcached',
        comparison: {
          left: 'Redis',
          leftItems: [
            'Rich data types',
            'Persistence options',
            'Pub/Sub support',
            'Excellent ecosystem',
            'Most common interview default',
          ],
          right: 'Memcached',
          rightItems: ['Simple key-value cache', 'No persistence', 'Very lightweight', 'Multi-threaded'],
        },
      },
      {
        type: 'interactive',
        content: 'Add a cache layer',
        interactivePrompt: `Build: LB -> Service -> Database (500 req/s).
Observe DB saturation.

Add a Cache node and route reads through it.
Observe DB pressure decrease.`,
      },
      {
        type: 'quiz',
        content: 'Caching Quiz',
        quiz: {
          question: 'Price changed in DB, cache TTL is 1 hour. Without invalidation, what happens?',
          options: [
            'Cache updates immediately',
            'Users may see stale price until TTL expires',
            'DB rejects write',
            'Cache automatically clears all keys',
          ],
          correctIndex: 1,
          explanation: 'TTL alone can keep stale values alive until expiration.',
        },
      },
    ],
  },
  'stage-5': {
    title: 'Load Balancers & Traffic Distribution',
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        content: `# One Server Is Never Enough

Multiple servers increase throughput and resilience, but they need a traffic distributor.
That component is the **load balancer**.`,
      },
      {
        type: 'diagram',
        content: 'Load balancer fan-out',
        diagramTemplate: 'load-balancer-fanout',
      },
      {
        type: 'text',
        content: `# L4 vs L7

**L4** routes by network attributes (IP/port), very fast.
**L7** routes by HTTP content (path/headers/cookies), more flexible.

For web apps, L7 is often the default; for raw TCP or extreme performance cases, consider L4.`,
      },
      {
        type: 'comparison',
        content: 'Algorithm Comparison',
        comparison: {
          left: 'Round Robin',
          leftItems: [
            'Simple and predictable',
            'Assumes similar servers',
            'Can overload slower nodes',
            'Great for uniform workloads',
          ],
          right: 'Least Connections',
          rightItems: [
            'Adapts to live load',
            'Better with uneven request times',
            'Needs connection tracking',
            'Great for mixed workloads',
          ],
        },
      },
      {
        type: 'text',
        content: `# Health Checks

Lbs probe targets on intervals.
If a server fails repeatedly, traffic is removed from it automatically.
When it recovers, traffic can be reintroduced.

This is core to high availability.`,
      },
      {
        type: 'interactive',
        content: 'Load balancing in action',
        interactivePrompt: `Build: Load Balancer -> 3 Service nodes.
Run simulation and watch traffic split.

Then simulate one service failure and observe remaining services absorb traffic.`,
      },
      {
        type: 'quiz',
        content: 'Load Balancer Quiz',
        quiz: {
          question: 'Server capacities differ: A is 2x stronger than B/C. Best algorithm?',
          options: ['Round Robin', 'Weighted Round Robin', 'Random', 'IP Hash'],
          correctIndex: 1,
          explanation: 'Weighted round robin maps traffic share to capacity.',
        },
      },
      {
        type: 'text',
        content: `# Key Takeaways

- Load balancers distribute traffic and detect failure
- L4 favors raw speed, L7 favors routing intelligence
- Pick algorithm based on workload shape
- Health checks + redundancy keep systems online`,
      },
    ],
  },
};

