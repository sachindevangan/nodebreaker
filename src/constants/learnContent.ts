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
        content: 'CLIENT_SERVER_FLOW',
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
        type: 'text',
        content: `# The Three Numbers That Define a Server

Every server in system design is described by three key metrics:

**Throughput** - How many requests per second it can handle. 
A simple Node.js server might handle 1,000-5,000 req/s. 
A highly optimized Go server might handle 50,000+ req/s. 
This is like how many customers a restaurant can serve per hour.

**Latency** - How long it takes to process ONE request, 
measured in milliseconds (ms). Reading from memory: ~0.1ms. 
Reading from an SSD: ~0.1ms. A database query: 1-50ms. 
An API call to another service: 10-200ms. Users notice 
anything above 200ms.

**Capacity** - The maximum number of concurrent connections 
or requests the server can hold before it starts dropping 
them. When capacity is exceeded, new requests get queued 
or rejected. This is like how many tables a restaurant has.`,
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
        type: 'text',
        content: `# What Happens When a Server Gets Overloaded?

Imagine your restaurant only has 10 tables but 100 customers walk in. What happens?

- First, customers wait in line (**queueing**)
- The wait gets longer and longer (**increased latency**)
- Eventually, people give up and leave (**dropped requests**)
- If the kitchen gets too many orders, food quality drops (**degraded performance**)
- In the worst case, the kitchen catches fire and shuts down entirely (**server crash**)

This is exactly what happens to a real server under too much load. In the NodeBreaker simulator, you can SEE this happening:
- Green node = healthy, handling traffic fine
- Yellow node = under pressure, latency increasing
- Red node = overloaded, dropping requests

This is why we need more than just one server - which is what the rest of this journey will teach you.`,
      },
      {
        type: 'interactive',
        content: 'See it yourself',
        interactivePrompt: `Drop a Service node onto the canvas.
Set its throughput to 500 req/s. Start the simulation.
The node should be green - it can handle the load.

Now click the node and lower throughput to 50 req/s.
Watch it turn yellow, then red as it gets overwhelmed.

This is a bottleneck - and learning to identify and fix bottlenecks is the core skill of system design.`,
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
            'The server can only handle 1000 req/s. The extra 500 requests either queue up (adding latency) or get dropped. Servers do not automatically scale - that requires additional infrastructure like load balancers and auto-scaling groups.',
        },
      },
      {
        type: 'text',
        content: `# Key Takeaways

- A **server** receives requests, processes them, and sends responses
- **Throughput** = requests per second (how much)
- **Latency** = time per request (how fast)
- **Capacity** = max concurrent load (how many at once)
- When load exceeds capacity -> queueing -> dropping -> crash
- Single servers have limits - that's why distributed systems exist`,
      },
      {
        type: 'quiz',
        content: 'Final Check',
        quiz: {
          question: 'In a system design interview, what should you think about FIRST?',
          options: [
            'Which database to use',
            'How traffic enters the system and flows through it',
            'What programming language to use',
            'How to make the UI look good',
          ],
          correctIndex: 1,
          explanation:
            'Always start with the traffic flow: How do requests enter? Where do they go? What processes them? This is the client-server model and it shapes every design decision that follows.',
        },
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
- More server instances (horizontal scaling)
- Faster processing per server (vertical scaling)
- Smarter routing to avoid congestion (load balancing)

**Real-world throughput numbers you should memorize:**
- A single web server (Node.js/Express): 1,000 - 10,000 req/s
- Redis cache: 100,000+ req/s
- PostgreSQL database: 5,000 - 20,000 queries/s
- Kafka message broker: 1,000,000+ messages/s
- Nginx load balancer: 50,000+ req/s`,
      },
      {
        type: 'analogy',
        content:
          "Throughput vs latency is like a water pipe: throughput is how much water flows per second (width), latency is how long one drop takes from end to end (length).",
      },
      {
        type: 'text',
        content: `# Latency: Where Time Goes

Latency is the total time from "request sent" to "response received." But where does that time actually go?

**Network latency** - Time for data to travel over the wire.
- Same data center: 0.5ms
- Same continent: 30-50ms  
- Cross-continent: 100-200ms
- With satellite: 500ms+

**Processing latency** - Time for the server to do its work.
- Read from memory (RAM): 0.0001ms
- Read from SSD: 0.1ms
- Read from database: 1-50ms
- Complex computation: 10-500ms

**Queue wait time** - Time spent waiting in line.
- When a server is at 50% utilization: ~1ms extra
- At 80% utilization: ~5ms extra
- At 95% utilization: ~20ms extra
- At 99% utilization: requests wait FOREVER

This is why keeping utilization below 70-80% is critical.
Latency doesn't increase linearly - it increases EXPONENTIALLY as you approach capacity.`,
      },
      {
        type: 'text',
        content: `# The Latency Numbers Every Engineer Should Know

Memorize these - they come up in interviews:

| Operation | Time |
|---|---|
| L1 cache reference | 0.5 ns |
| Read from RAM | 100 ns |
| Read from SSD | 100,000 ns (0.1 ms) |
| Read from HDD | 10,000,000 ns (10 ms) |
| Send packet within data center | 500,000 ns (0.5 ms) |
| Send packet coast to coast | 30,000,000 ns (30 ms) |

The key insight: **memory is 100,000x faster than disk**. This is why caching is so powerful.`,
      },
      {
        type: 'text',
        content: `# Capacity & Utilization

Capacity is the maximum load a component can handle. But you should NEVER run at 100% capacity.

The rule of thumb:
- **Under 50%** - Healthy
- **50-70%** - Normal
- **70-85%** - Warning
- **85%+** - Danger

In NodeBreaker, you can see this as colors:
- Green = under 50%
- Yellow = 50-80%
- Red = 80%+`,
      },
      {
        type: 'text',
        content: `# Bottlenecks: Finding the Weakest Link

A system is only as fast as its slowest component.
If your chain is:

Load Balancer (50k req/s) -> Service (10k req/s) -> Database (500 req/s)

Your ENTIRE system can only handle 500 req/s - because the database is the bottleneck.

**How to find bottlenecks:**
1. Look for highest utilization
2. That's your bottleneck
3. Fix by scaling, caching, or redesigning flow`,
      },
      {
        type: 'interactive',
        content: 'Find the Bottleneck',
        interactivePrompt: `Build this chain:
Load Balancer (10k req/s) -> Service (2k req/s) -> Database (100 req/s)

Start the simulation. Which component turns red first?
That is your bottleneck.

Now try fixing it: click the Database and increase its throughput to 5000.
Watch the system recover.`,
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
          explanation:
            'Latency increases exponentially near capacity. At 99% utilization, queue wait times skyrocket because there is almost no spare capacity.',
        },
      },
      {
        type: 'text',
        content: `# Key Takeaways

- **Throughput** = how many (req/s). Highway width.
- **Latency** = how fast (ms). Highway length.
- **Capacity** = max concurrent load.
- Latency increases **exponentially** near capacity
- Keep utilization under **70-80%**
- **Bottleneck** = slowest component`,
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

In almost every system you design, the database will be the slowest component.

Servers and caches use memory (RAM), which is extremely fast.
Databases read/write persistent storage and execute query planning/joins/sorts, which is slower.

Most databases max out at lower throughput than stateless services.
This is why caching, replication, sharding, and queues are so important.`,
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
        content: `# Connection Pooling: Don't Open a New Door Every Time

Creating a new DB connection can take 20-50ms.
Connection pooling creates reusable connections upfront so each request borrows one.

Typical pool sizes are 20-100 per service instance.
Too small: requests wait.
Too large: DB is overwhelmed managing connections.`,
      },
      {
        type: 'text',
        content: `# Replication: Copies of Your Data

**Primary-replica replication**:
- Primary handles writes
- Replicas handle reads
- Replicas are asynchronously updated

This scales read traffic and improves availability.
Tradeoff: replication lag and eventual consistency.`,
      },
      {
        type: 'text',
        content: `# Indexing: The Difference Between 1ms and 1 second

Without indexes, large tables require scans.
With indexes, the engine can jump directly to matching rows.

Rule of thumb: index frequently filtered/sorted columns, but avoid over-indexing because each index slows writes.`,
      },
      {
        type: 'interactive',
        content: 'See the DB bottleneck',
        interactivePrompt: `Build: LB (10k) -> Service (5k) -> Database (500 req/s)

Start simulation. The database turns red immediately - it is the bottleneck.

Now add a second Database node (read replica). Connect Service to BOTH databases.
Watch the load split across them.`,
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
      {
        type: 'text',
        content: `# Key Takeaways

- Databases are often bottlenecks
- **SQL** for strong integrity + structured queries
- **NoSQL** for flexibility + horizontal scale
- Connection pooling reduces connection overhead
- Replication scales reads and adds redundancy
- Indexes speed reads but can slow writes`,
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

If 90% of requests are cache hits, DB load drops by ~90%.
This is why Redis is one of the highest ROI infrastructure components.`,
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
        type: 'text',
        content: `# TTL: When Cache Data Expires

TTL controls freshness vs load:
- Short TTL = fresher data, more misses
- Long TTL = fewer misses, staler data

Choose TTL based on how quickly the underlying data changes.`,
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
        interactivePrompt: `Build: LB -> Service -> Database (500 req/s)

Start simulation - DB turns red.
Stop simulation.

Now add a Cache node and route read traffic through it.
Start again and watch DB pressure drop.`,
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
          explanation:
            'With TTL-based caching, users can see stale data until expiry unless you explicitly invalidate on write.',
        },
      },
      {
        type: 'text',
        content: `# Key Takeaways

- Caches are memory-speed reads
- High hit ratio removes huge DB load
- Cache-aside is the default pattern
- TTL is freshness/performance tradeoff
- Know stampede, hot keys, invalidation`,
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
        content: `# What a Load Balancer Actually Does

Key responsibilities:
1. **Distribute traffic** across servers
2. **Health checks** to avoid failed servers
3. **SSL termination** for HTTPS
4. **Session persistence** when needed`,
      },
      {
        type: 'text',
        content: `# L4 vs L7

**Layer 4 (Transport)**: routes by IP/port, very fast, no HTTP awareness.
**Layer 7 (Application)**: inspects URL/headers/cookies, supports advanced HTTP routing.

Interview default: L7 for web apps, L4 for raw TCP or extreme packet-forwarding performance.`,
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
        interactivePrompt: `Build: Load Balancer -> 3 Service nodes (each 1000 req/s)
Run simulation and watch traffic split evenly.

Now inject a crash on one service.
Watch the LB reroute traffic to remaining healthy services.`,
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
- Health checks + redundancy keep systems online
- In interviews: mention LB type, algorithm, and health check policy`,
      },
    ],
  },
};

