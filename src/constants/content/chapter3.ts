import type { Topic } from '@/constants/curriculumTypes';

const demoThroughputChain: Topic['simulatorDemo'] = {
  description:
    'A simple three-tier chain: load balancer, app service, database. Throughput is limited by the slowest hop — watch which node saturates first.',
  instruction:
    'Watch the Database — it is the bottleneck limiting your system to 500 req/s. Click it and increase throughput toward 5000. Watch the system recover as the bottleneck moves.',
  simulationAutoStart: true,
  setupNodes: [
    {
      type: 'loadBalancer',
      label: 'Load Balancer',
      position: { x: 0, y: 80 },
      data: { throughput: 10000, latency: 2, capacity: 50000 },
    },
    {
      type: 'service',
      label: 'Service',
      position: { x: 250, y: 80 },
      data: { throughput: 5000, latency: 5, capacity: 20000 },
    },
    {
      type: 'database',
      label: 'Database',
      position: { x: 500, y: 80 },
      data: { throughput: 500, latency: 50, capacity: 5000 },
    },
  ],
  setupEdges: [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
  ],
};

const demoLatencyCache: Topic['simulatorDemo'] = {
  description:
    'Latency adds along the request path. A cache can short-circuit the slow database on hits.',
  instruction:
    'Total latency is additive: 5 ms + 50 ms ≈ 55 ms minimum along Service → Database. Add the Cache between Service and Database (already in the graph). Cache hit path: Service (5 ms) + Cache (1 ms) ≈ 6 ms — often 10× faster than hitting the DB.',
  simulationAutoStart: true,
  setupNodes: [
    {
      type: 'loadBalancer',
      label: 'Load Balancer',
      position: { x: 0, y: 80 },
      data: { throughput: 50000, latency: 1, capacity: 100000 },
    },
    {
      type: 'service',
      label: 'Service',
      position: { x: 250, y: 80 },
      data: { throughput: 10000, latency: 5, capacity: 20000 },
    },
    {
      type: 'cache',
      label: 'Cache',
      position: { x: 500, y: 80 },
      data: { throughput: 200000, latency: 1, capacity: 100000 },
    },
    {
      type: 'database',
      label: 'Database',
      position: { x: 750, y: 80 },
      data: { throughput: 10000, latency: 50, capacity: 50000 },
    },
  ],
  setupEdges: [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 3 },
  ],
};

const demoUtilization: Topic['simulatorDemo'] = {
  description:
    'One service with finite throughput. Ramp traffic to see utilization and latency change.',
  instruction:
    'Start the simulation. Traffic at 200 req/s on a 1000 req/s service ≈ 20% utilization (green). Increase toward 800 req/s (yellow — latency rises). Push to 1000 req/s (red — saturated, drops/timeouts). Real systems avoid running near 100% all the time.',
  simulationAutoStart: true,
  setupNodes: [
    {
      type: 'service',
      label: 'Service (1000 req/s max)',
      position: { x: 200, y: 100 },
      data: { throughput: 1000, latency: 10, capacity: 5000 },
    },
  ],
  setupEdges: [],
};

const demoBottleneckCascade: Topic['simulatorDemo'] = {
  description:
    'Fixing one bottleneck exposes the next. Caching can shift load off the database.',
  instruction:
    'Database caps at 500 req/s. Raise Database throughput to 5000 — now Service at 10k may limit. Add a Cache in the sandbox between Service and Database to absorb reads and push system throughput higher.',
  simulationAutoStart: true,
  setupNodes: [
    {
      type: 'loadBalancer',
      label: 'Load Balancer',
      position: { x: 0, y: 80 },
      data: { throughput: 50000, latency: 1, capacity: 100000 },
    },
    {
      type: 'service',
      label: 'Service',
      position: { x: 250, y: 80 },
      data: { throughput: 10000, latency: 5, capacity: 20000 },
    },
    {
      type: 'database',
      label: 'Database',
      position: { x: 500, y: 80 },
      data: { throughput: 500, latency: 50, capacity: 5000 },
    },
  ],
  setupEdges: [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
  ],
};

export const CHAPTER_3_TOPICS: Topic[] = [
  {
    id: 'throughput',
    title: 'Throughput',
    interviewTip:
      'Always name the bottleneck in a pipeline. Say: effective RPS is min of components unless parallelized — and caching changes the effective read path.',
    simulatorDemo: demoThroughputChain,
    readContent: `# Throughput in plain language

**Throughput** is how much **work** your system completes per unit time — usually **requests per second (RPS)** or **queries per second (QPS)**. **Transactions per second (TPS)** shows up around databases and payment systems. Higher throughput means more users served with the same latency budget.

# How to measure

- **HTTP**: RPS at the load balancer or gateway with success/error split.
- **Database**: QPS or TPS from the query planner / metrics.
- **Queues**: messages consumed per second.

Always specify **what counts** as success (HTTP 2xx? idempotent retries?).

# Factors that affect throughput

- **CPU** speed and **efficiency** of your code
- **Memory** bandwidth and garbage collection (managed languages)
- **Network** bandwidth and NIC offload
- **Disk I/O** (SSD vs HDD) for persistence-heavy paths
- **Connection pool** sizing and **thread** / **event loop** health
- **Concurrency model** (threads vs async vs multiprocessing)

# Throughput vs bandwidth

**Bandwidth** is the **maximum theoretical** bit rate of a link. **Throughput** is what you **actually achieve** after protocol overhead, retries, serialization, and contention. A 10 Gbps link might deliver far less throughput if your app is single-threaded.

# Improving throughput

- **Horizontal scaling** — more instances behind a load balancer
- **Caching** — fewer expensive backend calls
- **Async processing** — queues for heavy work off the hot path
- **Code optimization** — fewer round trips, better algorithms

> IMPORTANT: **Throughput of a serial chain equals the throughput of the slowest component** (when work must pass through each hop). If LB = 50k RPS, Service = 10k RPS, DB = 2k RPS, your **end-to-end** capacity is **~2k RPS** unless you cache or read from replicas.

> NUMBERS: Order-of-magnitude anchors (highly workload-dependent — **verify with load tests**): **Node** services often **1k–10k RPS** for typical APIs; **Redis** **100k+ ops/s** on a single node for simple commands; **PostgreSQL** single-node **5k–20k** simple queries; **Kafka** **1M+ messages/s** cluster-scale; **Nginx** **50k+** RPS for static/light work.

## The highway analogy

Think of **lanes** as parallel workers and **speed** as latency. Throughput is **how many cars exit per minute**. A **narrow bridge** (slow DB) caps everyone behind it no matter how many lanes feed into it.`,
    quizQuestions: [
      {
        id: '3-1-q1',
        question: 'In a pipeline LB → API → DB, which component caps end-to-end throughput if each request must hit the DB?',
        options: [
          'Always the load balancer',
          'The slowest component in the chain',
          'Always the browser',
          'The fastest component',
        ],
        correctIndex: 1,
        explanation:
          'The narrowest hop limits steady-state flow through a serial path.',
      },
      {
        id: '3-1-q2',
        question: 'Throughput vs bandwidth — which is true?',
        options: [
          'They are identical terms',
          'Bandwidth is theoretical maximum; throughput is achieved goodput under real conditions',
          'Bandwidth only applies to DNS',
          'Throughput cannot be measured',
        ],
        correctIndex: 1,
        explanation:
          'Real systems achieve throughput ≤ bandwidth after overhead and contention.',
      },
      {
        id: '3-1-q3',
        question: 'Which change most directly improves read throughput for hot data?',
        options: [
          'Lower DNS TTL only',
          'Add a cache layer (Redis/CDN) to avoid repeated expensive reads',
          'Increase font size',
          'Disable TLS',
        ],
        correctIndex: 1,
        explanation:
          'Caching reduces duplicate work — the database stops being the repeated bottleneck.',
      },
      {
        id: '3-1-q4',
        question: 'Horizontal scaling improves throughput when?',
        options: [
          'Never',
          'Work can be partitioned across instances and downstream dependencies are not already saturated',
          'Only if you use UDP',
          'Only for static files',
        ],
        correctIndex: 1,
        explanation:
          'If the database is the cap, more app servers alone cannot raise total RPS — you must scale or cache the data tier.',
      },
      {
        id: '3-1-q5',
        question: 'Why measure RPS with success vs error split?',
        options: [
          'Errors are irrelevant',
          'High RPS with many 503s is not useful throughput',
          'HTTP does not have status codes',
          'Load balancers never emit metrics',
        ],
        correctIndex: 1,
        explanation:
          'Sustainable throughput counts good responses — not retries storming the system.',
      },
      {
        id: '3-1-q6',
        question: 'A system has Service 10k RPS and Database 2k RPS. What is the realistic sustained cap on synchronous DB reads?',
        options: ['10k RPS', '2k RPS', '12k RPS', 'Unlimited'],
        correctIndex: 1,
        explanation:
          'The database is the bottleneck at 2k unless reads are cached or replicated.',
      },
    ],
  },
  {
    id: 'latency-numbers-every-engineer-should-know',
    title: 'Latency Numbers Every Engineer Should Know',
    interviewTip:
      'Cite P99 latency and explain tail amplification: parallel calls to many services raise the chance one tail latency ruins the user request.',
    simulatorDemo: demoLatencyCache,
    readContent: `# Where time goes

Latency is **end-to-end delay** — queuing + serialization + network + processing + **tail effects** at load. **P50** (median) is "typical." **P99** is "worst common case" — often what **SLOs** target because **users experience tails**.

# Percentiles

| Metric | Meaning |
| --- | --- |
| **P50** | Half of requests faster |
| **P95** | 95% faster |
| **P99** | 99% faster — **sensitive to stragglers** |

# Tail latency amplification

If your **API** calls **10 services** in parallel each with **P99 = 100 ms**, the chance **at least one** exceeds 100 ms is high — your **P99** becomes dominated by **max** behavior, not average.

# Latency hierarchy (orders of magnitude)

| Step | Approximate |
| --- | --- |
| L1 cache reference | **~0.5 ns** |
| L2 cache | **~7 ns** |
| RAM | **~100 ns** |
| SSD read | **~50 µs** |
| HDD seek | **~5 ms** |
| Same-region datacenter RTT | **~0.5–2 ms** |
| Cross-region RTT | **~30–150 ms** |

> NUMBERS: These anchors explain why **caching in RAM** and **avoiding cross-region calls** matter more than micro-optimizing a few CPU instructions when your p95 is dominated by I/O.

# Reducing latency

- **Cache** hot data (RAM beats disk)
- **CDN** for static assets closer to users
- **Connection pooling** to avoid handshake storms
- **Async** offloading for non-critical work
- **Data locality** — co-locate services with their data

## Latency near saturation

As utilization approaches **100%**, **queueing delay** explodes — latency grows **non-linearly** even if "average CPU" looks okay. Watch **queue depth** and **P99**, not just averages.`,
    quizQuestions: [
      {
        id: '3-2-q1',
        question: 'Why do teams often set SLOs on P99 latency instead of only average?',
        options: [
          'P99 is always lower than P50',
          'Tail latency reflects bad user experiences that averages hide',
          'Averages are illegal',
          'P99 equals throughput',
        ],
        correctIndex: 1,
        explanation:
          'A few slow requests ruin UX; P99 tracks the slow-but-common tail.',
      },
      {
        id: '3-2-q2',
        question: 'Tail latency amplification happens because?',
        options: [
          'DNS uses UDP',
          'Parallel fan-out means one slow dependency can dominate the user-facing latency',
          'TLS is optional',
          'Caches are always cold',
        ],
        correctIndex: 1,
        explanation:
          'User latency often tracks max/sum of downstream stragglers.',
      },
      {
        id: '3-2-q3',
        question: 'Which is fastest typical access?',
        options: ['HDD seek', 'L1 cache hit', 'Cross-region HTTP', 'TLS handshake'],
        correctIndex: 1,
        explanation:
          'On-chip caches are nanoseconds; disks and WAN are milliseconds.',
      },
      {
        id: '3-2-q4',
        question: 'How does caching reduce latency?',
        options: [
          'It removes networks',
          'It avoids repeating slow I/O by serving hot data from faster storage tiers',
          'It increases DNS TTL',
          'It disables TCP',
        ],
        correctIndex: 1,
        explanation:
          'RAM/SSD cache tiers shorten the critical path for repeated reads.',
      },
      {
        id: '3-2-q5',
        question: 'Latency near 100% utilization often increases sharply because?',
        options: [
          'CPUs get slower',
          'Queueing time grows nonlinearly as buffers fill',
          'HTTP changes to UDP',
          'TLS turns off',
        ],
        correctIndex: 1,
        explanation:
          'M/M/1-style intuition: wait time blows up as ρ→1.',
      },
      {
        id: '3-2-q6',
        question: 'P50 = 40 ms and P99 = 800 ms implies?',
        options: [
          'Most users see 800 ms',
          'Typical request is fast but a few are very slow',
          'P50 is useless',
          'The system is idle',
        ],
        correctIndex: 1,
        explanation:
          'Large P99/P50 gap means tail latency issues — investigate stragglers.',
      },
    ],
  },
  {
    id: 'capacity-and-concurrent-connections',
    title: 'Capacity & Concurrent Connections',
    interviewTip:
      "Use Little's Law to connect throughput, latency, and concurrency: L = λ × W. It shows why small latency increases explode required concurrency at fixed RPS.",
    readContent: `# Capacity vs throughput

**Throughput** (RPS) is **flow rate**. **Capacity** is how many **in-flight** requests/connections a component can handle at once — **pool sizes**, **threads**, **file descriptors**, **memory**.

They are related by **Little's Law** (stable systems):

**Concurrent requests ≈ throughput × average latency**

Example: **1000 RPS** × **0.1 s** average latency ⇒ **~100** concurrent requests in flight. If your thread pool has **100** threads and each request blocks **100 ms**, you are **at the edge** — any spike queues.

# Connection limits

- **ulimit** / **file descriptors** — default **1024** on many Linux boxes; production often **65k+**.
- **Memory per connection** — **~1–10 KB** baseline for buffers; TLS adds more.
- **Threads** per connection in thread-per-connection servers.

**Theoretical** idle connections can reach **millions** on tuned boxes — **real apps** burn CPU/memory per active request.

> NUMBERS: **Default FD limit** often **1024** — raise for WebSocket/chat servers. **~10 KB** per TCP connection is a rough mental anchor for overhead. **16 GB RAM** might theoretically hold **~1M** idle lightweight connections — **OS and app** overhead will reduce that substantially.

# At capacity

New connections **queue**, **refuse**, or **time out**. Existing work **slows** due to queueing. **Memory pressure** can trigger **OOM kills** or **GC thrash**.

## Concurrency vs throughput

You can have **high concurrency** (many open sockets) but **low throughput** if each request is blocked waiting on I/O — optimize **per-request work** and **dependency latency**.`,
    quizQuestions: [
      {
        id: '3-3-q1',
        question: 'Little’s Law relates?',
        options: [
          'DNS and TLS',
          'Average concurrency ≈ throughput × average time in system',
          'CPU GHz to RAM size',
          'Only batch jobs',
        ],
        correctIndex: 1,
        explanation:
          'It links arrival rate, queue occupancy, and latency.',
      },
      {
        id: '3-3-q2',
        question: 'Why do production servers raise file descriptor limits?',
        options: [
          'To disable networking',
          'Many concurrent connections each consume an FD',
          'To lower throughput',
          'To remove HTTP',
        ],
        correctIndex: 1,
        explanation:
          'Sockets are FDs; defaults are too low for high-connection workloads.',
      },
      {
        id: '3-3-q3',
        question: 'Throughput vs capacity — which statement fits?',
        options: [
          'They are identical',
          'Throughput is rate; capacity is how many simultaneous in-flight units you can hold',
          'Capacity cannot be measured',
          'Throughput only applies to DNS',
        ],
        correctIndex: 1,
        explanation:
          'You can be at high concurrency but low throughput if work is blocked.',
      },
      {
        id: '3-3-q4',
        question: 'What happens when a TCP backlog and app queues are full?',
        options: [
          'Latency drops to zero',
          'New work is rejected or times out; errors rise',
          'HTTP automatically switches to UDP',
          'Nothing — TCP infinite buffers',
        ],
        correctIndex: 1,
        explanation:
          'Queues are finite; overload surfaces as failures and latency spikes.',
      },
      {
        id: '3-3-q5',
        question: '1000 RPS with 100 ms average service time implies about how many concurrent requests in flight (roughly)?',
        options: ['1', '10', '100', '10,000'],
        correctIndex: 2,
        explanation:
          'Little’s Law: 1000 × 0.1 s = 100 concurrent requests.',
      },
    ],
  },
  {
    id: 'utilization-the-danger-zone',
    title: 'Utilization: The Danger Zone',
    interviewTip:
      'Argue for 70% CPU/autoscaling headroom: spikes, retries, and deploys need slack. Pair utilization with queue depth and P99, not averages alone.',
    simulatorDemo: demoUtilization,
    readContent: `# Utilization zones

Think of **green / yellow / red**:

| Zone | Utilization | What it means |
| --- | --- | --- |
| **Green** | **<50%** | Plenty of headroom; maybe overspending |
| **Yellow** | **50–80%** | Healthy but watch tails |
| **Red** | **80%+** | **Latency spikes**; little margin for spikes |

These are **rules of thumb** — always use **your** metrics.

# Queueing intuition

A simple **M/M/1** mental model: average wait **ρ / (1 − ρ)** where **ρ** is utilization **fraction**. At **ρ=0.5** wait ~**1×** service; at **0.8** → **4×**; at **0.95** → **19×**; at **0.99** → **99×**. Real systems differ but the **nonlinearity** is universal.

# Why not run at 100%?

Traffic spikes, **retries**, **deploys**, **GC pauses**, and **background jobs** need **slack**. **Autoscaling** should trigger **before** the red zone — e.g. **scale out at ~70%** with **cooldown** to avoid thrash.

# What to monitor

- **CPU** utilization
- **Memory** pressure
- **Disk I/O** utilization
- **Network** saturation
- **Connection pool** / **thread pool** utilization

## Autoscaling

**Scale up** at **~70%** sustained load; **scale down** conservatively **~30%** with **cooldown** windows to avoid flapping.`,
    quizQuestions: [
      {
        id: '3-4-q1',
        question: 'In the simple M/M/1 wait formula, what happens to wait time as ρ approaches 1?',
        options: [
          'It approaches zero',
          'It grows explosively',
          'It becomes constant',
          'It only affects DNS',
        ],
        correctIndex: 1,
        explanation:
          'Queueing delay blows up near saturation.',
      },
      {
        id: '3-4-q2',
        question: 'Why avoid running production services at ~100% utilization forever?',
        options: [
          'CPUs dislike work',
          'No headroom for spikes, retries, deploys, or failures',
          'HTTP forbids it',
          'TLS requires idle cores',
        ],
        correctIndex: 1,
        explanation:
          'Slack absorbs variance; saturated systems exhibit long tails and failures.',
      },
      {
        id: '3-4-q3',
        question: 'A common autoscaling trigger pattern is?',
        options: [
          'Scale at 100% only',
          'Scale out before the red zone (e.g. ~70% sustained) with cooldown',
          'Scale randomly',
          'Never scale down',
        ],
        correctIndex: 1,
        explanation:
          'Early scaling prevents latency cliffs; cooldown prevents oscillation.',
      },
      {
        id: '3-4-q4',
        question: 'The "yellow zone" (50–80%) implies?',
        options: [
          'Immediate outage',
          'Healthy but watch queue depth and tail latency',
          'TLS is off',
          'DNS is broken',
        ],
        correctIndex: 1,
        explanation:
          'Still usable — but tighten observability and capacity planning.',
      },
      {
        id: '3-4-q5',
        question: '80% utilization with rising P99 latency suggests?',
        options: [
          'Users are happier',
          'Queueing effects are dominating; you need more capacity or less work',
          'The database disappeared',
          'Caching is impossible',
        ],
        correctIndex: 1,
        explanation:
          'High utilization + long tails = queueing or overload.',
      },
    ],
  },
  {
    id: 'bottlenecks-finding-the-weakest-link',
    title: 'Bottlenecks: Finding the Weakest Link',
    interviewTip:
      'In interviews, name the bottleneck, metric proving it (high utilization / queue depth), and the fix — then name the next bottleneck after the fix.',
    simulatorDemo: demoBottleneckCascade,
    readContent: `# Systems are only as fast as the slowest link

A **bottleneck** is the resource with **highest utilization** or **longest critical path** time — **CPU**, **memory**, **disk I/O**, **network**, or **database**.

# Types

| Type | Symptoms | Fix directions |
| --- | --- | --- |
| **CPU** | High CPU %, hot profiles | Optimize code, scale out, cache results |
| **Memory** | OOM, paging, GC pauses | More RAM, smaller objects, streaming |
| **I/O** | Disk/network saturation | SSD, batching, fewer round trips |
| **Database** | Lock waits, slow queries | Indexes, caching, replicas, sharding |

# Identify

**Measure** each tier: **utilization**, **queue depth**, **latency** per dependency. The **hottest** component under load is your first suspect.

# Cascade effect

After you **double database** throughput, **application** code may become the cap — then **network** — optimization is **iterative**.

> IMPORTANT: In system design interviews, **always** identify the bottleneck and how you would **relax** it. It shows holistic thinking.

## Caching and read replicas

**Caches** reduce read pressure on the **DB**. **Read replicas** share read load — **writes** still hit the primary.

**Sharding** spreads data when **vertical** scaling fails.`,
    quizQuestions: [
      {
        id: '3-5-q1',
        question: 'In LB → Service → DB, if DB CPU is pegged and others are idle, what is the bottleneck?',
        options: ['Load balancer', 'Database', 'CSS', 'DNS TTL'],
        correctIndex: 1,
        explanation:
          'The saturated resource limits the pipeline.',
      },
      {
        id: '3-5-q2',
        question: 'What is the cascade effect?',
        options: [
          'DNS cascades to UDP',
          'After fixing one bottleneck, the next slowest component becomes the bottleneck',
          'Caches never help',
          'Throughput becomes infinite',
        ],
        correctIndex: 1,
        explanation:
          'Systems improve stepwise; always re-profile after changes.',
      },
      {
        id: '3-5-q3',
        question: 'How can caching address a read-heavy DB bottleneck?',
        options: [
          'It removes the database',
          'It serves hot reads from fewer expensive DB hits',
          'It increases SQL joins',
          'It disables indexes',
        ],
        correctIndex: 1,
        explanation:
          'Fewer duplicate queries reach the slowest tier.',
      },
      {
        id: '3-5-q4',
        question: 'Which is a common I/O bottleneck symptom?',
        options: ['Low CPU with fast disk queues', 'Disk queue saturation high await times', 'HTTP 200 only', 'Zero network packets'],
        correctIndex: 1,
        explanation:
          'Disks/networks show utilization and await spikes in metrics.',
      },
      {
        id: '3-5-q5',
        question: 'What should you optimize first?',
        options: [
          'Random micro-optimizations',
          'The resource on the critical path with highest impact under measured load',
          'Only the front-end CSS',
          'Only DNS',
        ],
        correctIndex: 1,
        explanation:
          'Profile and measure; fix what actually limits user-visible latency.',
      },
    ],
  },
  {
    id: 'slas-slos-slis',
    title: 'SLAs, SLOs & SLIs',
    interviewTip:
      "Say: 'I would set SLIs on availability and P99 latency, define SLO targets, and manage an error budget so teams balance velocity with reliability.'",
    readContent: `# SLI — what we measure

An **SLI** (Service Level **Indicator**) is a **quantified metric**: availability, error rate, **P99 latency**, throughput, **freshness**.

# SLO — what we target

An **SLO** (Service Level **Objective**) is a **goal** for an SLI: e.g. **"P99 < 200 ms"** or **"99.9% monthly availability."**

# SLA — what we contract

An **SLA** (Service Level **Agreement**) is a **business/legal** contract with **remedies** — e.g. service credits if availability falls below **99.9%**.

**SLOs** guide engineering; **SLAs** bind customers and vendors.

# Error budgets

If availability SLO is **99.9%**, you have **0.1%** monthly **error budget** for planned + unplanned downtime and **bad deploys**. **Burn** it carefully — **fast releases** vs **stability** trade off.

# Choosing targets

Align with **user perception** — **~200 ms** latency starts to feel sluggish; **>1%** errors feel broken. **Internal** services can relax.

# Nines table (approximate annual downtime)

| Availability | Downtime / year |
| --- | --- |
| **99%** | **~3.65 days** |
| **99.9%** | **~8.76 hours** |
| **99.99%** | **~52.6 minutes** |
| **99.999%** | **~5.26 minutes** |

Higher nines cost **exponentially** more engineering and redundancy.

## Operating model

**SRE** practices pair **SLOs** with **error budgets** to decide **launch gates** and **freeze** when reliability regresses.`,
    quizQuestions: [
      {
        id: '3-6-q1',
        question: 'Which statement is correct?',
        options: [
          'SLA = internal engineering goal',
          'SLI is the measured metric; SLO is the target; SLA is the contractual commitment',
          'SLO is always illegal',
          'SLI only measures DNS',
        ],
        correctIndex: 1,
        explanation:
          'Indicators vs objectives vs contracts differ.',
      },
      {
        id: '3-6-q2',
        question: 'An error budget is?',
        options: [
          'Unlimited downtime',
          'The allowable unreliability window implied by your SLO',
          'Only for front-end CSS',
          'A database table',
        ],
        correctIndex: 1,
        explanation:
          'Tight SLOs leave tiny monthly budgets — changes must be careful.',
      },
      {
        id: '3-6-q3',
        question: '99.9% availability implies roughly how much downtime per year?',
        options: ['~5 minutes', '~8.76 hours', '~0 seconds', '~30 days'],
        correctIndex: 1,
        explanation:
          'Three nines still allows hours of downtime annually — plan budgets accordingly.',
      },
      {
        id: '3-6-q4',
        question: 'P99 latency SLO means?',
        options: [
          'Average latency',
          '99% of requests are faster than the threshold',
          'Exactly 99 requests per second',
          'DNS TTL',
        ],
        correctIndex: 1,
        explanation:
          'Percentile SLOs bound tail latency.',
      },
      {
        id: '3-6-q5',
        question: 'Why not set all SLOs to 99.999% by default?',
        options: [
          'It is free',
          'Cost and complexity explode; not every feature needs five nines',
          'It is impossible to measure',
          'HTTP forbids it',
        ],
        correctIndex: 1,
        explanation:
          'Higher availability requires redundant infra, rigorous processes, and slower change rates.',
      },
    ],
  },
];
