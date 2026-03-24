import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_2_TOPICS: Topic[] = [
  {
    id: 'what-is-a-server',
    title: 'What Is a Server?',
    interviewTip:
      'Describe servers as processes waiting on ports, fronted by load balancers, with clear throughput/capacity limits. Mention overload behavior: queueing, errors, and cascading failures.',
    readContent: `# Client and server

A **server** is just a program (often many copies) that **listens on a network port**, accepts **connections** or **HTTP requests**, does work — read parameters, talk to a database, call other services — and returns a **response**. The **client** might be a browser, mobile app, or another backend service. Everything in distributed systems is ultimately this pattern at different scales.

# What a web server does, step by step

1. **Listen** — bind to an address/port (e.g. **:443**).
2. **Accept** — complete TCP/TLS handshakes.
3. **Parse** — decode HTTP (method, path, headers, body).
4. **Route** — pick the handler for **/checkout** vs **/health** (path examples).
5. **Authenticate / authorize** — tokens, cookies, API keys.
6. **Execute** — business rules, validations.
7. **Persist** — SQL, NoSQL, queues.
8. **Respond** — status, JSON/HTML, headers.

# Three numbers that define a server in interviews

| Number | Meaning |
| --- | --- |
| **Throughput** | How many **successful requests per second** under test |
| **Latency** | How long one request takes (median and tail) |
| **Capacity** | How many **concurrent** connections or in-flight requests it can hold |

You improve what you measure: a server that does 5k RPS at 50 ms P99 is different from one that does 5k RPS but 2 s P99.

# What happens when you overload

When requests arrive faster than workers can complete them, they **queue** in the OS or app. Latency rises **non-linearly**. Eventually buffers fill: you **drop** connections, return **503**, or **timeout** upstream. Protections include **rate limiting**, **autoscaling**, **caching**, and **shedding** non-critical work.

> ANALOGY: A server is a restaurant kitchen. **Throughput** is meals per hour. **Latency** is how long one table waits. **Capacity** is how many tickets the line can hold before orders spill onto the floor (errors and unhappy customers).

> NUMBERS: Single-process **Node** apps often land around **1k–10k RPS** for typical JSON APIs depending on workload — verify with load tests. **Java** thread pools often sit in the **hundreds of concurrent requests** per instance before contention bites. **Nginx** can terminate **50k+** idle or light requests per second on good hardware — but your **database** is usually lower.

## Mental model

If you can explain **ports**, **processes**, **threads/event loop**, and **backpressure**, you understand servers well enough to design systems around them.`,
    quizQuestions: [
      {
        id: '2-1-q1',
        question: 'In the client–server model, what does the server primarily do?',
        options: [
          'Render the browser DOM',
          'Accepts network requests and returns responses after processing',
          'Perform DNS resolution for the client',
          'Replace TCP/IP entirely',
        ],
        correctIndex: 1,
        explanation:
          'Servers wait for requests, do work (business logic, I/O), and send responses. Browsers handle rendering.',
      },
      {
        id: '2-1-q2',
        question: 'Which metric measures how many requests complete successfully per second?',
        options: ['Latency', 'Throughput', 'Packet loss', 'TTL'],
        correctIndex: 1,
        explanation:
          'Throughput (RPS/QPS) is the rate of successfully handled work. Latency is time per unit of work.',
      },
      {
        id: '2-1-q3',
        question: 'What typically happens first when a server is persistently overloaded?',
        options: [
          'DNS stops resolving',
          'Requests queue and latency grows before errors appear',
          'The database deletes data',
          'TLS is disabled automatically',
        ],
        correctIndex: 1,
        explanation:
          'Queues absorb bursts until they cannot; then timeouts, 503s, or connection failures surface.',
      },
      {
        id: '2-1-q4',
        question: 'Why do we care about P99 latency, not just average latency?',
        options: [
          'P99 is always lower than average',
          'Tail latency reflects worst common user experience and often dominates SLAs',
          'Averages ignore throughput',
          'P99 equals DNS TTL',
        ],
        correctIndex: 1,
        explanation:
          'A few slow requests ruin UX; P99 and P999 track those tails.',
      },
      {
        id: '2-1-q5',
        question: 'A "stateless" application server means?',
        options: [
          'It has no configuration',
          'It stores no per-user session data in local memory between requests',
          'It cannot use a database',
          'It only serves static files',
        ],
        correctIndex: 1,
        explanation:
          'State lives in external stores (DB, Redis) or tokens; any instance can handle any request.',
      },
      {
        id: '2-1-q6',
        question: 'Which component is often the first bottleneck in a simple CRUD API?',
        options: ['CSS files', 'The database or downstream I/O', 'User-Agent header size', 'Favicon requests'],
        correctIndex: 1,
        explanation:
          'CPU-light APIs usually wait on the database, cache, or other services — profile before guessing.',
      },
    ],
  },
  {
    id: 'how-a-server-processes-requests',
    title: 'How a Server Processes Requests',
    interviewTip:
      'Say whether your workload is CPU-bound (more cores, faster algorithms) or I/O-bound (async I/O, pooling, caching). That single sentence signals maturity.',
    readContent: `# The lifecycle of one request

Inside a running service, a request typically flows:

**Receive bytes → parse HTTP → route to handler → authenticate → validate input → business logic → database/cache/remote calls → serialize response → send bytes.**

Each step has a cost; the **slowest step** dominates perceived latency.

# Node.js: event loop and non-blocking I/O

**Node** runs JavaScript on a **single main thread** for your code, but offloads network and many I/O operations to the OS and **libuv** thread pool (for some file/crypto work). While waiting on the database, the event loop can process other requests — that is how one thread handles **many concurrent connections** when work is **I/O-bound**.

If you **block** the main thread (heavy CPU loop, synchronous file read on hot path), everyone waits.

# Java/Spring: thread-per-request

Many JVM servers assign a **thread** from a pool to each request. The model is easy to reason about: blocking JDBC calls tie up that thread, so pool size caps concurrency (often **hundreds** of threads). Throughput = threads / average latency when CPU is not saturated.

# Queues and rejection

When workers (threads, event loop capacity, or connection slots) are busy, new work **waits in a queue** or is **rejected**. A full queue often surfaces as **503 Service Unavailable** or **connection refused**.

# Rough timing intuition (not a benchmark)

| Step | Order of magnitude |
| --- | --- |
| Network + TLS termination | ~1–5 ms same DC |
| JSON parse | sub-ms to few ms |
| Auth check | ~1–5 ms if local JWT verify; more if remote |
| Business logic | ~1–50 ms |
| Database round trip | ~5–50+ ms |
| JSON serialize | sub-ms |

> NUMBERS: **Node** commonly handles **10k+ concurrent idle/light connections**; sustained RPS depends on work per request. **Thread pools** in Java services often sit around **200–500** threads before context switching hurts. **Go** goroutines schedule **hundreds of thousands** of lightweight tasks — still limited by actual I/O and CPU.

## CPU-bound vs I/O-bound

- **CPU-bound** — hashing video, big JSON transforms, regex on MB strings → add cores, optimize algorithms, move work to workers.
- **I/O-bound** — waiting on DB/HTTP → async patterns, pooling, caching, batching.`,
    quizQuestions: [
      {
        id: '2-2-q1',
        question: 'Why can Node.js handle many concurrent connections with one main JavaScript thread?',
        options: [
          'It creates a new OS thread for every socket',
          'It avoids blocking on I/O by using async callbacks and the event loop',
          'It disables TCP',
          'It runs only static files',
        ],
        correctIndex: 1,
        explanation:
          'While waiting on I/O, other callbacks run. Blocking CPU work on the main thread still stalls everyone.',
      },
      {
        id: '2-2-q2',
        question: 'In a classic Java thread-per-request server, what limits concurrent in-flight requests?',
        options: [
          'Number of CSS files',
          'Thread pool size and time each thread spends blocked',
          'DNS TTL',
          'Browser tabs',
        ],
        correctIndex: 1,
        explanation:
          'Each blocking call holds a thread; the pool is finite.',
      },
      {
        id: '2-2-q3',
        question: 'The internal request queue is full and the server refuses new work. Which response is common?',
        options: ['200 OK', '301 Moved', '503 Service Unavailable', '418 I am a teapot'],
        correctIndex: 2,
        explanation:
          '503 indicates the service cannot handle the request right now — often overload or maintenance.',
      },
      {
        id: '2-2-q4',
        question: 'Which workload should you optimize differently?',
        options: [
          'CPU-bound vs I/O-bound — different bottlenecks',
          'There is no difference',
          'Only front-end workloads matter',
          'Only DNS workloads matter',
        ],
        correctIndex: 0,
        explanation:
          'CPU-bound needs compute scaling; I/O-bound needs async I/O, caching, and fewer round trips.',
      },
      {
        id: '2-2-q5',
        question: 'Where is time usually spent in a typical CRUD API handler?',
        options: [
          'Parsing HTML entities',
          'Downstream I/O (database, cache, remote HTTP)',
          'Rendering React components',
          'Drawing fonts',
        ],
        correctIndex: 1,
        explanation:
          'Most APIs wait on I/O; measure with tracing to confirm for your app.',
      },
    ],
  },
  {
    id: 'threads-processes-concurrency',
    title: 'Threads, Processes & Concurrency',
    interviewTip:
      'Tie concurrency discussions to state: shared mutable state needs locks; stateless services and message passing avoid whole classes of bugs.',
    readContent: `# Processes

A **process** is an isolated running program with its own **virtual memory**. **fork()** creates a new process — heavier than spawning threads. Communication uses **IPC** (pipes, sockets) because memory is not shared by default. Crash isolation is excellent: one process can die without corrupting another's address space.

# Threads

A **thread** shares the **same address space** with sibling threads inside a process. That makes sharing data cheap — but **unsafe** without coordination. Threads are lighter than processes but still have real cost (stack memory, scheduler overhead).

# Concurrency vs parallelism

- **Concurrency** — many tasks **in progress**; on one core they **interleave** via scheduling.
- **Parallelism** — tasks literally **run at the same instant** on multiple cores.

You can have concurrency without parallelism (single core) and parallelism without much concurrency (embarrassingly parallel batch job).

# Race conditions

Two threads mutating the same structure without synchronization → **data races** — torn reads/writes, corrupted counters. Fix with **mutexes**, **atomic** operations, or **immutable** data.

# Deadlock

**Deadlock** happens when threads wait on each other in a cycle: Thread A holds lock 1, waits for lock 2; Thread B holds lock 2, waits for lock 1. Mitigations: **lock ordering**, **timeouts**, **avoid nested locks**, or **share-nothing** design.

# Green threads / goroutines / virtual threads

**Goroutines**, **Erlang processes**, and **Java virtual threads** provide **massive concurrency** with low per-task overhead by multiplexing many logical tasks onto fewer OS threads.

> ANALOGY: A **process** is a separate kitchen — isolated, expensive to open. **Threads** are cooks in the same kitchen — fast handoff, but they can bump into each other without rules. **Goroutines** are prep cooks who switch tasks quickly when waiting on the oven.

## Stateless services

When each request carries auth + parameters and data lives in **databases**, application instances do not fight over shared in-memory user state — simpler scaling.`,
    quizQuestions: [
      {
        id: '2-3-q1',
        question: 'What best describes a process vs a thread?',
        options: [
          'Threads do not share memory',
          'Threads share the process address space; processes are isolated by default',
          'Processes are lighter than threads',
          'There is no difference on Linux',
        ],
        correctIndex: 1,
        explanation:
          'Threads share heap within a process; processes default to separate memory spaces.',
      },
      {
        id: '2-3-q2',
        question: 'Concurrency vs parallelism — which statement is true?',
        options: [
          'They are identical terms',
          'Concurrency is about dealing with many tasks; parallelism is about simultaneous execution on multiple cores',
          'Parallelism requires UDP',
          'Concurrency requires a single-threaded language',
        ],
        correctIndex: 1,
        explanation:
          'You can interleave many tasks on one core (concurrent) or execute them truly in parallel on many cores.',
      },
      {
        id: '2-3-q3',
        question: 'What is a race condition?',
        options: [
          'A network packet race',
          'Two concurrent accesses to shared mutable state without synchronization leading to corruption',
          'A fast SSD',
          'A DNS round robin',
        ],
        correctIndex: 1,
        explanation:
          'Unsynchronized updates to shared data produce nondeterministic bugs.',
      },
      {
        id: '2-3-q4',
        question: 'What is deadlock?',
        options: [
          'When TLS fails',
          'When threads block forever waiting on each other for locks',
          'When DNS TTL is zero',
          'When HTTP returns 200',
        ],
        correctIndex: 1,
        explanation:
          'Circular wait on locks or resources with no preemption causes permanent stall.',
      },
      {
        id: '2-3-q5',
        question: 'Why do stateless HTTP servers reduce concurrency headaches?',
        options: [
          'They never use CPUs',
          'They avoid per-instance mutable session state that must be coordinated across threads/instances',
          'They disable databases',
          'They remove TCP',
        ],
        correctIndex: 1,
        explanation:
          'Shared nothing per request means less shared mutable state inside the app tier.',
      },
    ],
  },
  {
    id: 'thread-pools-connection-handling',
    title: 'Thread Pools & Connection Handling',
    interviewTip:
      'When sizing pools, connect thread count to workload: CPU-bound near core count; I/O-bound higher based on wait/compute ratios. Mention backlog and connection limits under load.',
    readContent: `# Why not spawn unlimited threads?

Creating an **OS thread** costs time (**~milliseconds** of setup) and memory (**512 KB–1 MB** stacks are common). Thousands of blocking threads → **context switch storms** and RAM pressure. That is why servers use **pools**.

# Thread pools

Pre-create **N** worker threads. A request borrows a thread, runs, returns the thread to the pool. **Too few threads** → queue latency. **Too many** → memory and scheduler overhead.

**Rule of thumb (very rough):**

- **CPU-bound** — threads ≈ **CPU cores** (sometimes cores − 1).
- **I/O-bound** — threads ≈ **cores × (1 + wait_time / compute_time)** (Little's intuition applies).

Measure; do not trust folklore.

# Connection handling

**HTTP keep-alive** reuses TCP connections for multiple requests — avoids repeated handshakes. Servers set **timeouts** so idle connections do not accumulate forever. **Max connections** protect memory and file descriptors.

# Backlog queue

The OS maintains an **incoming connection backlog** (defaults often **128–1024** depending on OS/config). If the app cannot **accept()** fast enough and backlog fills, new connects may see **ECONNREFUSED** or retries.

> NUMBERS: **Java** servers often configure **200–500** threads. **Node** uses **one** main thread plus a small **libuv** pool (commonly **4** worker threads for some fs/crypto). Each thread: **~512 KB–1 MB** stack reservation.

## Tuning mindset

Watch **pool utilization**, **queue depth**, and **latency**. If pool hits 100% often, scale out or increase efficiency before blindly raising thread counts.`,
    quizQuestions: [
      {
        id: '2-4-q1',
        question: 'Why do servers use thread pools instead of creating a brand-new OS thread per request forever?',
        options: [
          'Threads are illegal',
          'Thread creation and large numbers of threads are expensive; pools reuse workers',
          'Pools disable TCP',
          'Pools increase latency always',
        ],
        correctIndex: 1,
        explanation:
          'Pools amortize creation cost and cap memory/context switching.',
      },
      {
        id: '2-4-q2',
        question: 'For a mostly I/O-bound web workload, pool sizing often?',
        options: [
          'Exactly 1 thread',
          'Higher than CPU core count because threads wait on I/O',
          'Unlimited without consequence',
          'Equal to DNS TTL',
        ],
        correctIndex: 1,
        explanation:
          'While waiting on remote I/O, other threads can use the CPU.',
      },
      {
        id: '2-4-q3',
        question: 'What happens when every thread in the pool is busy and work keeps arriving?',
        options: [
          'Requests are always dropped silently',
          'Work queues grow, latency rises, and eventually requests may be rejected or time out',
          'The CPU turns off',
          'DNS stops',
        ],
        correctIndex: 1,
        explanation:
          'Queues absorb some burst; beyond capacity, failures surface.',
      },
      {
        id: '2-4-q4',
        question: 'What does HTTP keep-alive accomplish?',
        options: [
          'Disables TLS',
          'Reuses TCP connections for multiple requests to reduce handshake overhead',
          'Caches DNS forever',
          'Removes the need for load balancers',
        ],
        correctIndex: 1,
        explanation:
          'Keep-alive reduces connection setup cost on both client and server.',
      },
      {
        id: '2-4-q5',
        question: 'The OS listen backlog is full. What might a new client experience?',
        options: [
          'Instant 200 OK',
          'Connection refused or retry behavior depending on OS/TCP',
          'Automatic HTTP/3 upgrade',
          'Faster responses',
        ],
        correctIndex: 1,
        explanation:
          'Servers can only queue so many not-yet-accepted connections; overflow fails connects.',
      },
    ],
  },
  {
    id: 'stateless-vs-stateful',
    title: 'Stateless vs Stateful',
    interviewTip:
      "Default to stateless app servers. If asked how the server knows the user, answer JWT validation or session lookup in Redis — not 'we keep it in RAM on that box.'",
    readContent: `# Stateless application servers

A **stateless** service does **not** rely on local memory to remember a user's prior requests. Each call carries **enough context** (tokens, IDs) to process independently. Any replica can serve any request — **horizontal scaling** becomes straightforward.

# Stateful examples

- **WebSocket** connection tables on a specific node
- **Game** session state pinned to a shard
- **Databases** themselves — inherently stateful

# Stateless examples

- Typical **REST** APIs behind a load balancer
- **Static** file servers
- **AWS Lambda** handlers that fetch state from stores per invocation

# Moving from stateful to stateless

Push session data to **Redis**, **DynamoDB**, or your **SQL** DB. Prefer **signed JWTs** for claims that can be validated without a remote session fetch (mind revocation complexity). **Sticky sessions** route the same user to the same node — a **crutch** that hurts even load and failover.

# Twelve-Factor App

Processes should be **stateless** and **share-nothing**; persistence belongs to **backing services**.

> IMPORTANT: Stateless tiers scale out; state lives in **data stores designed for durability and replication**.

## Failure modes

If sessions lived only in **RAM** on one server and it dies, users are logged out or worse — **data loss**. Externalizing state fixes that.`,
    quizQuestions: [
      {
        id: '2-5-q1',
        question: 'Which is the most "stateless" description of a REST API tier?',
        options: [
          'Each instance stores user sessions only in local RAM',
          'Any instance can handle a request given headers/tokens; session data is externalized',
          'The server must run on one machine',
          'Stateless means no database',
        ],
        correctIndex: 1,
        explanation:
          'Stateless app servers do not pin user state locally between requests.',
      },
      {
        id: '2-5-q2',
        question: 'How do you externalize session state?',
        options: [
          'Store only in browser localStorage without HTTPS',
          'Use Redis, a database, or signed tokens with appropriate revocation strategy',
          'Use longer DNS TTL',
          'Disable cookies',
        ],
        correctIndex: 1,
        explanation:
          'Central stores or cryptographically verifiable tokens decouple sessions from individual VMs.',
      },
      {
        id: '2-5-q3',
        question: 'JWT access tokens primarily help with?',
        options: [
          'Faster DNS',
          'Validating identity/claims without server-side session storage per request (tradeoffs apply)',
          'Replacing TCP',
          'Removing need for TLS',
        ],
        correctIndex: 1,
        explanation:
          'JWTs are signed; services verify locally but revocation and size need care.',
      },
      {
        id: '2-5-q4',
        question: 'Why does statelessness help horizontal scaling?',
        options: [
          'It removes networks',
          'Any healthy instance can serve traffic; no affinity requirement',
          'It doubles RAM automatically',
          'It disables load balancers',
        ],
        correctIndex: 1,
        explanation:
          'Load balancers can distribute uniformly and replace instances freely.',
      },
      {
        id: '2-5-q5',
        question: 'What happens to classic in-memory-only sessions when a server crashes?',
        options: [
          'They migrate automatically to DNS',
          'Users lose that session unless replicated externally',
          'They become JWTs automatically',
          'Nothing — RAM survives crashes',
        ],
        correctIndex: 1,
        explanation:
          'Unreplicated process memory dies with the process.',
      },
    ],
  },
  {
    id: 'serverless-lambda',
    title: 'Serverless & Lambda',
    interviewTip:
      'Lead with cold starts and 15-minute limits. Recommend serverless for spiky, event-driven work and containers/VMs for steady high throughput when economics and latency dominate.',
    readContent: `# What "serverless" means

**Serverless** means you ship **functions** and the cloud runs them on demand — you do not patch OS images or reserve instances (though concurrency limits and provisioned concurrency exist). You pay for **invocations** and **GB-seconds** of execution.

# Lifecycle

An **event** (HTTP via API Gateway, S3 upload, schedule) triggers a **cold start**: download image, start runtime, run init code — **100 ms–3 s** is common depending on language, package size, and VPC. Warm invocations reuse containers: often **1–10 ms** of overhead before your handler runs.

# When it shines

- **Webhooks** and **ETL** triggers
- **Infrequent** or **spiky** workloads
- **Prototyping** quickly

# When to avoid

- **Tight latency SLOs** sensitive to cold starts (unless you buy **provisioned concurrency**)
- **Long jobs** beyond provider limits (**AWS Lambda max 15 minutes**)
- **Steady high RPS** where **dedicated containers** cost less per million requests

# Vendor surface

Handlers couple to **IAM**, **event shapes**, and **SDKs** — migration takes work. Abstract critical logic behind interfaces.

> NUMBERS: **Cold starts** often **100 ms–3 s**; **warm** path **1–10 ms** overhead. **Max timeout** **15 minutes** on Lambda. **Max memory** **10 GB**. Pricing ballpark **fractions of a dollar per million requests** plus duration — check current tables.

## Pattern

Use queues to absorb bursts; keep handlers **idempotent** because **retries** happen.`,
    quizQuestions: [
      {
        id: '2-6-q1',
        question: 'What is the cold start problem?',
        options: [
          'Servers never start',
          'First invocation after idle can be slow while runtime/container initializes',
          'TLS cannot be used',
          'DNS fails',
        ],
        correctIndex: 1,
        explanation:
          'Cold starts add latency before business logic runs; mitigations include smaller bundles, faster runtimes, provisioned concurrency.',
      },
      {
        id: '2-6-q2',
        question: 'When is serverless a great fit?',
        options: [
          'Long-running batch jobs beyond provider timeouts',
          'Event-driven, spiky, or low-average traffic workloads',
          'Only when you need raw TCP sockets',
          'Never — it is deprecated',
        ],
        correctIndex: 1,
        explanation:
          'Pay-per-use and managed scaling shine for intermittent work.',
      },
      {
        id: '2-6-q3',
        question: 'AWS Lambda billing is primarily based on?',
        options: [
          'Only storage GB',
          'Invocations plus compute duration scaled by allocated memory',
          'Only DNS queries',
          'Fixed $10k/month regardless of use',
        ],
        correctIndex: 1,
        explanation:
          'You pay for requests and GB-seconds (and associated networking/storage extras).',
      },
      {
        id: '2-6-q4',
        question: 'Maximum execution time for an AWS Lambda function is about?',
        options: ['1 minute', '15 minutes', '24 hours', 'Unlimited'],
        correctIndex: 1,
        explanation:
          '15 minutes is the hard cap today — long work must checkpoint to queues or move to containers.',
      },
      {
        id: '2-6-q5',
        question: 'Serverless vs containers for steady 50k RPS API?',
        options: [
          'Serverless is always cheaper at any scale',
          'Dedicated autoscaled containers/VMs often win on cost/latency for sustained high load',
          'Containers cannot autoscale',
          'Neither can serve HTTP',
        ],
        correctIndex: 1,
        explanation:
          'Economics cross over; measure TCO including cold starts and concurrency limits.',
      },
    ],
  },
  {
    id: 'containers-docker-kubernetes',
    title: 'Containers, Docker & Kubernetes',
    interviewTip:
      'Say: workloads are packaged as immutable images, run as containers, orchestrated by Kubernetes with health checks, rolling deploys, and HPA based on CPU/memory or custom metrics.',
    readContent: `# The problem: "works on my machine"

Developers had different **libraries**, **OS patches**, and **configs**. **Containers** package your app **plus dependencies** into an **image** that runs the same on laptop, CI, and production.

# Docker images

A **Dockerfile** lists steps; each step can create a **layer**. Layers **cache** — rebuilds skip unchanged early layers. Small, minimal base images (**distroless**, **Alpine**) shrink attack surface and pull time.

# Container vs VM

**VMs** include a **guest OS** — heavier (often **GBs** of disk, **minutes** to boot). **Containers** share the **host kernel**, isolate with **namespaces/cgroups** — lighter (**10–100 MB** images common), start in **seconds**.

# Kubernetes in one breath

**Kubernetes** schedules **pods** (one or more containers) onto nodes, **restarts** unhealthy ones, **exposes** stable **Services** for load balancing, performs **rolling updates**, and integrates **autoscaling**.

Key objects: **Pod**, **Deployment**, **Service**, **Namespace**.

| Concept | Role |
| --- | --- |
| **Pod** | Smallest deploy unit; shared network/IP |
| **Deployment** | Desired replica count + rollouts |
| **Service** | Stable DNS/IP to reach pods |

> ANALOGY: **Docker** is a **shipping container** — standard box, any port. **Kubernetes** is the **harbor crane** — places containers on the right ship, replaces dented ones, routes trucks (traffic) to open docks.

> NUMBERS: Containers often start in **1–5 seconds**; VMs commonly **30–60+ seconds**. A beefy host may run **tens to hundreds** of containers vs **single-digit** VMs.

## Production

Pair containers with **observability** (metrics, logs, traces) and **resource requests/limits** so the scheduler places work safely.`,
    quizQuestions: [
      {
        id: '2-7-q1',
        question: 'Why are containers usually lighter than VMs?',
        options: [
          'Containers include a full guest OS each',
          'Containers share the host kernel and isolate with OS primitives',
          'Containers cannot run Node.js',
          'VMs cannot use TCP',
        ],
        correctIndex: 1,
        explanation:
          'VMs duplicate OS kernels; containers reuse one kernel with isolated user spaces.',
      },
      {
        id: '2-7-q2',
        question: 'What problem does Docker primarily solve?',
        options: [
          'DNS resolution',
          'Packaging apps with dependencies so they run consistently across environments',
          'Replacing HTTP',
          'Encrypting disks only',
        ],
        correctIndex: 1,
        explanation:
          'Images capture deterministic runtime bits for dev/test/prod parity.',
      },
      {
        id: '2-7-q3',
        question: 'What does Kubernetes orchestrate?',
        options: [
          'Only laptop Wi-Fi settings',
          'Scheduling, scaling, health, and networking for containerized workloads',
          'Writing CSS',
          'TLS certificate issuance only',
        ],
        correctIndex: 1,
        explanation:
          'K8s automates where and how many pods run and how traffic reaches them.',
      },
      {
        id: '2-7-q4',
        question: 'What is a Kubernetes Service used for?',
        options: [
          'Storing Docker layers on disk',
          'Providing a stable endpoint to reach a set of pods',
          'Compiling JavaScript',
          'Managing DNS root servers',
        ],
        correctIndex: 1,
        explanation:
          'Services abstract ephemeral pod IPs behind cluster DNS and load balancing.',
      },
      {
        id: '2-7-q5',
        question: 'Typical container start time vs VM boot?',
        options: [
          'Containers slower',
          'Containers often seconds; VMs often tens of seconds to minutes',
          'Both always instant',
          'VMs always faster',
        ],
        correctIndex: 1,
        explanation:
          'Booting a full guest OS dominates VM startup; containers skip that.',
      },
    ],
  },
];
