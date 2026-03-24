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
  'stage-6': {
    title: 'When Things Break',
    estimatedMinutes: 12,
    content: [
      {
        type: 'text',
        content: `# Failure Is Not If, But When

In distributed systems, things WILL break. Servers crash.
Networks disconnect. Disks fill up. Databases corrupt. Cloud providers have outages.
A squirrel chews through a fiber optic cable (this actually happened to Google in 2017).

The question is not "how do I prevent failure?" - it's
"how do I design systems that keep working DESPITE failure?"

This mindset shift separates junior engineers from senior ones.
Beginners design for the happy path. Experts design for what goes wrong.`,
      },
      {
        type: 'text',
        content: `# Single Point of Failure (SPOF)

A Single Point of Failure is any component whose failure brings down the entire system.
If you have:

User -> Server -> Database

Both the server AND the database are SPOFs.

**How to find SPOFs:** For every component, ask:
"What happens if this dies right now?"
If the answer is "system goes down" - that is a SPOF.

**How to eliminate SPOFs:** redundancy:
- 1 server -> 2+ servers behind a load balancer
- 1 database -> primary + replica(s)
- 1 data center -> multi-region deployment
- 1 load balancer -> pair of LBs with failover`,
      },
      {
        type: 'analogy',
        content:
          'Think of an airplane. It has redundant engines, hydraulic systems, and backup controls. Flying is safe not because parts never fail, but because critical systems keep working during failure.',
      },
      {
        type: 'text',
        content: `# Redundancy Patterns

**Active-Active**
Both instances serve traffic at the same time.
Pros: full utilization, near-instant failover.
Cons: data synchronization complexity.

**Active-Passive**
One serves traffic, the other waits as standby.
Pros: simpler.
Cons: idle resources, slower failover.

Rule of thumb:
- Active-Active for stateless services
- Active-Passive for strongly stateful components`,
      },
      {
        type: 'text',
        content: `# Health Checks and Failover

**Health checks** detect broken components:
- Shallow checks: process/port alive
- Deep checks: can actually serve requests

Typical failover flow:
1. Health checks fail repeatedly
2. Node marked unhealthy
3. Traffic rerouted
4. Alerts fire
5. Node is restarted/replaced
6. Traffic is gradually restored

Key metrics:
- **MTTR** (Mean Time To Recovery)
- **MTBF** (Mean Time Between Failures)
- **Availability = MTBF / (MTBF + MTTR)**`,
      },
      {
        type: 'text',
        content: `# The Nines of Availability

Availability is measured in "nines":

| Availability | Downtime/year | Downtime/month |
|---|---|---|
| 99% (two nines) | 3.65 days | 7.3 hours |
| 99.9% (three nines) | 8.76 hours | 43.8 minutes |
| 99.99% (four nines) | 52.6 minutes | 4.38 minutes |
| 99.999% (five nines) | 5.26 minutes | 26.3 seconds |

Most systems target 99.9% to 99.99%.
Five nines is extremely expensive.

Interview tip: ask "how many nines?" before designing.`,
      },
      {
        type: 'text',
        content: `# Circuit Breaker Pattern

When a downstream service fails, sending more requests can worsen failure.
Circuit breakers prevent cascading outages.

States:
- **Closed:** normal flow
- **Open:** block calls quickly and return fallback/error
- **Half-open:** allow limited probes before closing again

This enables graceful degradation instead of full collapse.`,
      },
      {
        type: 'interactive',
        content: 'Break Things and Survive',
        interactivePrompt: `Build: LB -> Service A + Service B -> Database

Start simulation.
Crash Service A and observe LB rerouting to Service B.

Then crash Database and observe full failure.
How would you remove the remaining SPOF?`,
      },
      {
        type: 'quiz',
        content: 'Failure Quiz',
        quiz: {
          question:
            'Your system has 3 services behind a load balancer, each handling 33% traffic. One crashes. What happens?',
          options: [
            'System goes down immediately',
            'LB removes failed node and splits traffic across remaining servers',
            'LB keeps sending traffic to dead node forever',
            'No traffic changes at all',
          ],
          correctIndex: 1,
          explanation:
            'With health checks, failed nodes are removed from rotation and traffic is redistributed to healthy nodes.',
        },
      },
      {
        type: 'quiz',
        content: 'Availability Quiz',
        quiz: {
          question: 'Your SLA is 99.99% availability. Allowed downtime per month?',
          options: ['43.8 minutes', '4.38 minutes', '26.3 seconds', '7.3 hours'],
          correctIndex: 1,
          explanation: '99.99% (four nines) corresponds to about 4.38 minutes of downtime per month.',
        },
      },
      {
        type: 'text',
        content: `# Key Takeaways

- Failure is inevitable
- SPOFs are reliability killers
- Redundancy + health checks + failover are core
- Circuit breakers prevent cascading failures
- Availability targets ("nines") drive architecture`,
      },
    ],
  },
  'stage-7': {
    title: 'Queues & Async Processing',
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        content: `# The Problem: Slow Work Blocks Fast Responses

Some work is slow (image processing, video transcoding, emails, ML inference).
If user requests wait for all of it, UX becomes unusable.

Solution: respond fast for the user-facing action, and push heavy work to background workers.`,
      },
      {
        type: 'text',
        content: `# How Message Queues Work

Queue flow:
1. Producer writes message
2. API responds quickly
3. Consumer reads message
4. Worker processes job
5. Worker acknowledges completion

Queues decouple producers and consumers, smoothing bursty load.`,
      },
      {
        type: 'analogy',
        content:
          'A queue is like restaurant ticket rails: waiters keep taking orders while cooks process tickets at kitchen speed.',
      },
      {
        type: 'text',
        content: `# Delivery Guarantees

**At-most-once:** fastest, may lose messages.
**At-least-once:** most common, may duplicate processing.
**Exactly-once:** expensive/complex, often approximated with dedupe.

For at-least-once, make handlers **idempotent**.`,
      },
      {
        type: 'text',
        content: `# Backpressure

If producers are permanently faster than consumers, queues grow without bound.
Mitigate with:
- queue limits
- producer rate limiting
- consumer auto-scaling
- priority lanes

Queues absorb spikes; they do not fix sustained capacity mismatch.`,
      },
      {
        type: 'text',
        content: `# Dead Letter Queues (DLQ)

Poison messages that repeatedly fail should move to a DLQ after retry thresholds.
Without a DLQ, one bad message can block useful progress and hide operational issues.`,
      },
      {
        type: 'comparison',
        content: 'Queue Technologies',
        comparison: {
          left: 'RabbitMQ / SQS',
          leftItems: [
            'Task queue semantics',
            'Simple producer-consumer flow',
            'Great for background jobs',
            'Lower operational complexity',
          ],
          right: 'Kafka',
          rightItems: [
            'Durable event log semantics',
            'Multiple consumer groups',
            'Great for streaming + analytics',
            'Higher throughput and complexity',
          ],
        },
      },
      {
        type: 'interactive',
        content: 'Queue as a Buffer',
        interactivePrompt: `Build: Service -> Queue -> Database

Simulate bursty traffic.
Observe queue depth absorbing spikes while DB works at steady pace.
Then consider what happens if average input still exceeds processing rate.`,
      },
      {
        type: 'quiz',
        content: 'Queue Quiz',
        quiz: {
          question: 'Need sub-100ms user response with 5s image processing. Best architecture?',
          options: [
            'Process image synchronously before response',
            'Store upload, enqueue job, respond immediately',
            'Use faster CPU only',
            'Cache preprocessed images before upload',
          ],
          correctIndex: 1,
          explanation:
            'Fast synchronous ACK + async queue worker is the standard pattern for slow background processing.',
        },
      },
      {
        type: 'text',
        content: `# Key Takeaways

- Use queues to decouple and smooth load
- Keep user-facing paths fast and synchronous
- Push heavy work to async workers
- Plan retries, idempotency, and DLQs`,
      },
    ],
  },
  'stage-8': {
    title: 'Scaling to Millions',
    estimatedMinutes: 12,
    content: [
      {
        type: 'text',
        content: `# Your App Just Went Viral

Traffic jumps from hundreds to hundreds of thousands of requests per second.
You must scale quickly and systematically.`,
      },
      {
        type: 'comparison',
        content: 'Vertical vs Horizontal Scaling',
        comparison: {
          left: 'Vertical Scaling (Scale Up)',
          leftItems: [
            'Bigger machine',
            'Simple operationally',
            'No code changes initially',
            'Hard ceiling and SPOF risk',
          ],
          right: 'Horizontal Scaling (Scale Out)',
          rightItems: [
            'More machines',
            'Requires statelessness + LB',
            'Higher complexity',
            'Better resilience and growth ceiling',
          ],
        },
      },
      {
        type: 'text',
        content: `# The Stateless Rule

Horizontal scaling works best when app servers are stateless.
Store sessions/state externally (Redis, DB, object store) so any instance can serve any request.`,
      },
      {
        type: 'text',
        content: `# Database Scaling

Start with read replicas for read-heavy traffic.
Use sharding when a single primary can no longer sustain throughput/storage.

Sharding requires careful key choice and creates cross-shard query complexity.`,
      },
      {
        type: 'text',
        content: `# CDN: Bring Content Closer

CDNs reduce latency and origin load by serving cached content from edge locations.
Use for static assets and cacheable responses, not highly personalized volatile data.`,
      },
      {
        type: 'text',
        content: `# Back-of-Envelope Estimation

Estimate:
1. DAU/MAU
2. Requests per second (average + peak multipliers)
3. Storage growth
4. Bandwidth

These estimates justify architecture decisions in interviews.`,
      },
      {
        type: 'interactive',
        content: 'Scale Your System',
        interactivePrompt: `Start: LB -> 1 Service -> DB
Observe service bottleneck.

Add multiple services behind LB.
Then observe DB pressure and add cache.
Follow the bottleneck as it moves through layers.`,
      },
      {
        type: 'quiz',
        content: 'Scaling Quiz',
        quiz: {
          question: '10M users, 20 req/day each. Peak design target is usually?',
          options: ['~230 req/s', '~2,300 req/s', '~10,000 req/s', '~200M req/s'],
          correctIndex: 2,
          explanation:
            'Average is around 2,300 req/s, and peak often reaches 3-5x average, around 10,000 req/s.',
        },
      },
      {
        type: 'text',
        content: `# Key Takeaways

- Vertical scaling is fast but limited
- Horizontal scaling is the long-term path
- Stateless app tier is essential
- Read replicas and sharding address DB limits
- CDNs reduce latency at global scale`,
      },
    ],
  },
  'stage-9': {
    title: 'The Full Design',
    estimatedMinutes: 15,
    content: [
      {
        type: 'text',
        content: `# The System Design Interview Framework

Use this flow:
1. Clarify requirements
2. Estimate scale
3. Propose high-level architecture
4. Deep dive one path/component
5. Discuss bottlenecks and trade-offs`,
      },
      {
        type: 'text',
        content: `# Example: URL Shortener

Requirements:
- create short links
- redirect quickly
- collect analytics

Typical high-level path:
DNS -> CDN -> LB -> API -> Cache -> DB
                           -> Queue -> Worker -> Analytics store`,
      },
      {
        type: 'text',
        content: `# Write and Read Flows

Write flow: generate code, persist mapping, return short URL.
Read flow: edge/cache lookup first, DB fallback, async analytics event emission.`,
      },
      {
        type: 'text',
        content: `# Trade-offs You Should Discuss

- Consistency vs availability
- SQL vs NoSQL
- Cache freshness vs latency
- Sync vs async processing
- Monolith vs microservices`,
      },
      {
        type: 'text',
        content: `# What Interviewers Evaluate

- Communication clarity
- Structured thinking
- Requirement and scale awareness
- Trade-off literacy
- Ability to go deep when asked`,
      },
      {
        type: 'interactive',
        content: 'Design a URL Shortener',
        interactivePrompt: `Build a complete URL shortener architecture in the sandbox.
Include edge caching, API layer, persistent store, and async analytics pipeline.
Set realistic capacities and identify first bottleneck under load.`,
      },
      {
        type: 'quiz',
        content: 'Interview Quiz',
        quiz: {
          question: 'Interviewer asks to design chat. What should you do first?',
          options: [
            'Draw DB schema immediately',
            'Clarify requirements and expected scale',
            'Debate frameworks',
            'Choose cloud vendor services first',
          ],
          correctIndex: 1,
          explanation: 'Requirements and scale assumptions drive architecture. Ask first, design second.',
        },
      },
      {
        type: 'text',
        content: `# Key Takeaways

- Follow a repeatable framework
- Ask clarifying questions before drawing
- Use scale estimates to justify architecture
- Explain trade-offs explicitly`,
      },
    ],
  },
  'stage-10': {
    title: 'Chaos Engineering',
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        content: `# Breaking Things on Purpose

Chaos engineering validates resilience by injecting failures in controlled ways.
Confidence comes from evidence, not assumptions.`,
      },
      {
        type: 'text',
        content: `# Core Principles

1. Define a hypothesis
2. Minimize blast radius
3. Observe with strong telemetry
4. Automate recurring experiments
5. Fix and institutionalize learnings`,
      },
      {
        type: 'text',
        content: `# Types of Experiments

- Infrastructure: node/zone outages
- Network: latency, packet loss, partitions
- Application: dependency errors/timeouts
- Data/state: corruption, lag, clock skew`,
      },
      {
        type: 'text',
        content: `# Graceful Degradation

Goal is not "never fail."
Goal is "fail partially and recover quickly."

Use timeouts, retries with backoff, circuit breakers, and fallbacks to avoid cascades.`,
      },
      {
        type: 'text',
        content: `# Game Days

Run planned reliability drills:
plan scenario -> execute -> monitor -> recover -> retrospective.
This builds response muscle memory and improves runbooks.`,
      },
      {
        type: 'interactive',
        content: 'Run a Chaos Experiment',
        interactivePrompt: `Build a resilient topology with redundancy.
Inject failures one at a time:
- crash one service
- add cache latency
- crash primary DB

Compare observed behavior to your hypotheses and redesign where needed.`,
      },
      {
        type: 'quiz',
        content: 'Chaos Engineering Quiz',
        quiz: {
          question: 'Why run Chaos Monkey-style failures in production?',
          options: [
            'To reduce infra costs',
            'To verify resilience mechanisms under real conditions',
            'To replace staging tests entirely',
            'To detect syntax bugs',
          ],
          correctIndex: 1,
          explanation:
            'Controlled production experiments validate that failover and resilience mechanisms actually work under real traffic.',
        },
      },
      {
        type: 'text',
        content: `# Key Takeaways

- Chaos engineering builds confidence via experiments
- Start with low-risk blast radius
- Prefer graceful degradation over catastrophic failure
- Feed findings back into architecture and operations`,
      },
    ],
  },
};

