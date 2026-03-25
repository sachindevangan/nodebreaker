import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_8_TOPICS: Topic[] = [
  {
    id: 'single-point-of-failure',
    title: 'Single Point of Failure',
    interviewTip:
      'After every diagram, rehearse “what if this dies?” for LB, DB, DNS, region, deploy pipeline, and monitoring. Acknowledge any remaining SPOF and how you would fund redundancy.',
    simulatorDemo: {
      description:
        'Contrast a single stateless instance in the request path with two redundant instances behind a load balancer.',
      instruction:
        'Start with **Load Balancer → Service → Database** and run the sim—overload or **Node Crash** on the lone **Service** removes all capacity. **Reset**, add a **second Service** behind the **Load Balancer**, both pointing at the **Database**, and run again: losing one **Service** still leaves another path. The first layout is a **SPOF** at the app tier; the second adds **redundancy**—still watch the **DB** as a potential **SPOF** until replicated.',
      simulationAutoStart: true,
      setupNodes: [
        {
          type: 'loadBalancer',
          label: 'Load Balancer',
          position: { x: 80, y: 280 },
          data: { throughput: 50000, latency: 3, capacity: 200000 },
        },
        {
          type: 'service',
          label: 'Service',
          position: { x: 380, y: 280 },
          data: { throughput: 3000, latency: 15, capacity: 15000 },
        },
        {
          type: 'database',
          label: 'Database',
          position: { x: 680, y: 280 },
          data: { throughput: 8000, latency: 8, capacity: 40000 },
        },
      ],
      setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }],
    },
    readContent: `# Single point of failure (SPOF)

A **single point of failure** is any component whose outage makes the whole system (or a critical slice) unavailable in a way you cannot absorb automatically. The classic example is **one database** with no hot standby: when that host dies, every feature that needs durable state stops at once. Another is **one load balancer** or **one DNS provider**—ingress disappears even if your app servers are healthy. SPOF analysis is not pessimism; it is the minimum adult conversation about reliability.

## How to hunt SPOFs systematically

For every box on the whiteboard, ask: **“If this dies right now, what happens?”** If the honest answer is “we are toast until someone manually fixes it,” you have found a SPOF or at least insufficient redundancy margin. Walk dependencies recursively: the app might be stateless and beautiful, but if it calls **one** authorization service, **one** payment provider integration, or **one** on-prem mainframe, that dependency is still a concentration risk. The weakest link sets your practical availability ceiling.

## Common SPOFs in web architectures

- **One primary database** without automated replica promotion or tested restore.
- **One hardware or software load balancer** (mitigate with paired LBs, health-checked VIP failover, or cloud-managed redundant planes).
- **One DNS provider** or **one TLS certificate** store with no break-glass path.
- **One region or one AZ** holding all stateful data for global users.
- **One CI/CD pipeline**—if you cannot deploy, you cannot roll forward a fix during an outage.
- **One on-call engineer** with no shadow or escalation backup—human SPOFs are real.

## Real incidents reinforce the lesson

Large **S3**, **Fastly**, and **DNS** provider outages reminded the industry that shared foundations create correlated failures: thousands of unrelated apps fall over together. Your architecture should assume **dependencies fail** and design **degraded modes** (cached reads, static fallbacks) even when the dependency is “always up.”

## Eliminating or mitigating SPOFs

- **Data tier**: primary + replicas, automatic failover, regular restore drills from backups (an untested backup is a SPOF dressed as safety).
- **Ingress**: redundant LBs, health checks, DNS failover records, multi-provider DNS for critical domains.
- **Failure domains**: spread across AZs and eventually regions when latency and compliance allow.
- **People and process**: runbooks, rotations, automated remediation—no single throat to choke.

## N+1 capacity thinking

If **N** instances carry steady-state traffic, plan **N+1** (or **N+2** during maintenance windows) so one loss still fits inside headroom. This is math, not heroics: if losing one of four nodes pushes the others above 95% CPU, you were already one bad deploy away from pain.

> ANALOGY: Old **series Christmas lights** fail as a chain—one bulb dies, the whole string goes dark. Modern **parallel** strings keep shining when one branch fails. Build **parallel paths** with **health-checked** routing, not single-threaded designs that secretly serialize your fate.

> INTERVIEW TIP: After you draw boxes, **walk the failure modes out loud**: LB dies, AZ dies, DB primary dies, dependency times out. Propose mitigations or honestly say “with more budget I would add X”—interviewers reward systematic thinking over perfect diagrams.

## Residual risk and honesty

Perfect elimination is rare—cost and complexity cap how much redundancy you can buy. Document **accepted residual SPOFs**, monitor them aggressively, and fund fixes when risk exceeds appetite. Teams that pretend “we are fully redundant” without testing fail harder than teams that admit one fragile edge and watch it.

SPOF reviews feel like boring checklist work—until Tuesday at 3pm when three unrelated alerts turn out to be one shared dependency catching fire. That is exactly when the boring work pays rent.

## Interview scenarios to rehearse

**“What happens if the region fails?”** **Multi-region** **active/active** vs **warm** **standby** vs **RTO** **measured** **in** **hours**. **“What** **about** **the** **CI** **system?”** Treat **deploy** **pipelines** as **tier-0** **infrastructure**. **“How** **do** **you** **prove** **HA** **works?”** **Game** **days**, **chaos** **in** **staging** **then** **prod** **with** **blast** **caps**. Show you can **prioritize** **mitigations** **by** **customer** **impact** **and** **likelihood**, not **alphabetical** **order**.
`,
    quizQuestions: [
      {
        id: '8-1-q1',
        question: 'A single point of failure is:',
        options: [
          'Any server that uses SSDs',
          'A component whose failure causes unacceptable system-wide impact without mitigation',
          'A metric for CPU',
          'A load testing tool',
        ],
        correctIndex: 1,
        explanation:
          'SPOFs are single components whose outage dominates availability.',
      },
      {
        id: '8-1-q2',
        question: 'N+1 redundancy generally means:',
        options: [
          'Delete one server daily',
          'Extra capacity beyond steady state so one node can fail without losing service',
          'Use only one region',
          'Disable monitoring',
        ],
        correctIndex: 1,
        explanation:
          'Additional headroom absorbs a single failure.',
      },
      {
        id: '8-1-q3',
        question: 'Which is a commonly forgotten organizational SPOF?',
        options: [
          'Using HTTPS',
          'Only one engineer who can deploy or only one on-call without backup',
          'Having a README',
          'Color of the logo',
        ],
        correctIndex: 1,
        explanation:
          'People and processes fail too—rotation and runbooks matter.',
      },
      {
        id: '8-1-q4',
        question: 'Dual DNS providers primarily mitigate:',
        options: [
          'CSS minification bugs',
          'DNS provider outages taking all name resolution offline',
          'GPU thermal throttling',
          'Git merge conflicts',
        ],
        correctIndex: 1,
        explanation:
          'DNS is still a critical chain—diversify providers or fast failover.',
      },
      {
        id: '8-1-q5',
        question: 'A single database primary with no failover strategy is:',
        options: [
          'Always fine for production',
          'A classic SPOF for data-dependent systems',
          'Required by law',
          'Faster than replicas',
        ],
        correctIndex: 1,
        explanation:
          'Database loss stops writes and strongly consistent reads.',
      },
      {
        id: '8-1-q6',
        question: 'Eliminating SPOFs typically involves:',
        options: [
          'Removing load balancers',
          'Redundancy, health checks, failover automation, and failure-domain spread',
          'Disabling TLS',
          'Single-threaded servers only',
        ],
        correctIndex: 1,
        explanation:
          'Redundant paths plus automation reduce blast radius.',
      },
    ],
  },
  {
    id: 'redundancy-active-active-passive',
    title: 'Redundancy: Active-Active & Active-Passive',
    interviewTip:
      'Stateless app tier: Active-Active behind LB. Primary database: Active-Passive with automatic promotion (RDS Multi-AZ, Patroni). Mention split-brain risk if two writers ever think they are primary.',
    readContent: `# Redundancy — active-active vs active-passive

**Redundancy** means you have extra components so one failure does not end the story—but not all redundancy looks the same. The two classic patterns are **active-active**, where every node pulls its weight during normal operation, and **active-passive**, where hot standbys wait to take over while the active node does all the work.

## Active-active: everyone serves, all the time

In **active-active** setups, multiple instances simultaneously handle live traffic. If one dies, the load balancer or client library shifts work to the survivors—often within seconds and without a human promotion ceremony. The upside is efficiency: you are not paying for idle metal “just in case.” Stateless HTTP APIs, CDN edges, and horizontally scaled workers are natural fits because any instance can serve any request once shared state lives in Redis, a database, or object storage.

The downside is complexity: you must design for concurrent updates, safe deploys, and sometimes split traffic carefully during schema migrations. For databases, true active-active multi-writer setups are rare and usually reserved for specialized engines or conflict-resolution-heavy workloads.

## Active-passive: one writer, standby for drama

**Active-passive** is the traditional database story: the **primary** takes all writes; **standby** replicas stream changes and answer reads (sometimes) but do not own writes until promotion. Benefits include a simple mental model—there is always exactly one authoritative writer—and fewer split-brain incidents if orchestration is solid. Costs include paying for standby capacity that does little during steady state, and failover time measured in tens of seconds to minutes depending on detection, replication lag, and connection string updates.

**Warm** standby means the passive node is running and caught up—promotion is fast. **Cold** standby might mean restoring from backups or booting frozen images—acceptable for DR drills, not for minute-level SLAs.

## Split-brain: the scary movie sequel

If a network partition makes **two** nodes think they are primary, you can get **split-brain**: both accept writes, and reconciling divergent histories is painful. Production systems use **quorum** (Raft, Paxos), **fencing** (STONITH), **external arbiters**, or cloud control planes to ensure only one writable leader. Interview answers should name the risk, not pretend it cannot happen.

## Multi-layer redundancy in real architectures

Typical stacks mix patterns: **active-active** LBs or anycast edges, **active-active** stateless app pools, **active-active** cache shards, and an **active-passive** relational primary with auto-failover (RDS Multi-AZ, Patroni, etc.). Each layer’s job is to shrink blast radius for the layer below.

> ANALOGY: **Active-active** is two pilots with hands on the yoke—if one freezes, the other already has context. **Active-passive** is a co-pilot reading a magazine—they can take over, but there is a beat of reorientation. Know which mode you are buying with each tier.

> INTERVIEW TIP: Say **active-active for stateless APIs behind health-checked load balancing**, and **active-passive for OLTP primaries** with **automatic failover** tooling. Mention **split-brain** and how your platform prevents it.

## Choosing between them

Optimize for **RTO/RPO**, cost, and operational maturity. A startup might accept longer DB failover; a payments processor might invest in faster detection and smaller blast radius. Whatever you pick, **test failover quarterly**—redundancy you have never exercised is just a diagram.

## Interview scenarios to rehearse

Compare **active-active** **API** **fleet** **vs** **active-passive** **Postgres**: **RTO**, **RPO**, **cost**, **complexity**. Discuss **split-brain** **mitigations** (**quorum**, **fencing**). Mention **cloud** **patterns**: **RDS** **Multi-AZ**, **Aurora** **global** **database**, **ElastiCache** **cluster** **mode**. If asked about **legacy** **mainframes**, show empathy—**strangler** **patterns**, **event** **bridges**, **not** **big** **bang** **rewrites**.
`,
    quizQuestions: [
      {
        id: '8-2-q1',
        question: 'Active-active redundancy means:',
        options: [
          'Only one node may ever run',
          'Multiple nodes simultaneously serve traffic',
          'No redundancy exists',
          'DNS is disabled',
        ],
        correctIndex: 1,
        explanation:
          'All active members participate in steady-state load.',
      },
      {
        id: '8-2-q2',
        question: 'Active-passive database pairs mainly address:',
        options: [
          'Frontend CSS',
          'Write leadership with a hot standby for failover',
          'Removing indexes',
          'Git rebases',
        ],
        correctIndex: 1,
        explanation:
          'One writer reduces complexity; standby takes over on failure.',
      },
      {
        id: '8-2-q3',
        question: 'Split-brain risk arises when:',
        options: [
          'Users use HTTP/2',
          'Two nodes both believe they are writable primaries during a partition',
          'TLS certificates expire in 90 days',
          'Logs are structured',
        ],
        correctIndex: 1,
        explanation:
          'Conflicting writes need quorum, fencing, or external coordination.',
      },
      {
        id: '8-2-q4',
        question: 'Warm standby differs from cold standby because:',
        options: [
          'Warm standby is running and replicating, enabling faster takeover',
          'Cold standby is always faster',
          'Warm standby cannot receive traffic ever',
          'They are identical terms',
        ],
        correctIndex: 0,
        explanation:
          'Warm systems reduce recovery time versus cold backups.',
      },
      {
        id: '8-2-q5',
        question: 'Active-active suits stateless HTTP services because:',
        options: [
          'They require sticky sessions only',
          'Any instance can handle any request if shared state is externalized',
          'They never use TLS',
          'They cannot scale horizontally',
        ],
        correctIndex: 1,
        explanation:
          'Interchangeable workers behind LB define active-active app tiers.',
      },
      {
        id: '8-2-q6',
        question: 'Multi-layer redundancy means:',
        options: [
          'Only the database needs HA',
          'You apply appropriate patterns per tier (LB, app, cache, DB)',
          'You run one giant server',
          'You remove monitoring',
        ],
        correctIndex: 1,
        explanation:
          'Each layer has distinct failure and scaling characteristics.',
      },
    ],
  },
  {
    id: 'health-checks-and-failover',
    title: 'Health Checks & Failover',
    interviewTip:
      'Specify HTTP /health with deep checks (DB ping, critical dependencies), interval ~10–30s, unhealthy threshold 2–3, and DB failover tooling (RDS Multi-AZ 60–120s). Differentiate liveness vs readiness in Kubernetes.',
    readContent: `# Health checks and automatic failover

**Health checks** are how load balancers, service meshes, and Kubernetes know whether to send traffic to a node. Without them, failed instances still receive requests—users see 500s, retries multiply, and outages feel “random” because the control plane lacks signal. Good health checks are **specific**, **bounded**, and **tested** under failure.

## Layers of checks: TCP, HTTP, and “deep” health

A **TCP** check only proves something is listening—fast, but shallow. A wedged process can still accept sockets while returning errors on every real request. An **HTTP /health** endpoint that returns 200 when the app’s main loop is responsive is better. **Deep** health checks additionally verify critical dependencies: **can we query the DB with a cheap SELECT 1?** **Redis ping?** **Disk space above 10%?** **Memory below a safe threshold?**

Deep checks catch “zombie” services that are alive but useless. The tradeoff: if every replica hammers the database every second for health, you create a thundering herd. Mitigate with **cached results**, **jittered** intervals, **read-only** health queries, or **dependency-specific** budgets.

## Timing: how fast do you detect failure?

Typical cloud defaults look like **10–30 second** probe intervals, **2–5 second** timeouts, **2–3 consecutive successes** to mark healthy, **2–3 consecutive failures** to mark unhealthy. That means **30–90 seconds** to detect a bad node—tune with product tolerance, but remember faster probes cost more noise and load.

## Automatic database failover (conceptual)

When the primary database stops responding, automation beats a human waking up—if it is safe. A common sequence: monitoring detects failure, **quorum** or **confirmation** waits to avoid flapping on a blip, the best replica is **promoted**, connection routing updates (DNS, proxy, or managed endpoint), and the old primary is **fenced** so it cannot accept writes and reintroduce split-brain. Total time **30 seconds to minutes** depending on platform—**RDS Multi-AZ** often falls in the **60–120 second** class for managed failover; self-managed **Patroni** or **Redis Sentinel** vary with tuning.

## Kubernetes: liveness vs readiness vs startup

- **Liveness**: **restart** the container if it is deadlocked—use sparingly; false positives cause restart loops.
- **Readiness**: **remove** the pod from Service endpoints if it cannot serve traffic—use for **load shedding** during dependency outages.
- **Startup**: **give slow JVMs** time before liveness kills them.

> IMPORTANT: **TCP-only health checks** are how you get a service that passes probes but **500s every request** because the DB pool is exhausted. Prefer HTTP + **deep checks** for critical paths.

> INTERVIEW TIP: Say **what /health validates**, **probe intervals**, **unhealthy thresholds**, and **expected failover time** for your database.

## Operations discipline

Alert on **unhealthy** **ratio**, not single blips; correlate with deploys; chaos-test probes by killing dependencies. Health checks turn hope into **closed-loop control**—they are worth the engineering time.

## Interview scenarios to rehearse

**“What should /health return during partial degradation?”** **200** **with** **degraded** **flag** **vs** **503** **readiness**—**tie** **to** **load** **balancer** **behavior**. **Kubernetes** **triad**: **startup** **probe** **for** **slow** **JVM**, **readiness** **for** **traffic** **gating**, **liveness** **for** **deadlock** **recovery**. **Database** **failover**: **cite** **60–120s** **RDS** **class** **failover**, **connection** **string** **rotation**, **DNS** **TTL** **tradeoffs**.
`,
    quizQuestions: [
      {
        id: '8-3-q1',
        question: 'A deep health check is better than TCP-only because:',
        options: [
          'TCP checks always reboot servers',
          'It can detect application-level or dependency failures an open port would miss',
          'It removes need for TLS',
          'It guarantees zero latency',
        ],
        correctIndex: 1,
        explanation:
          'Listening sockets can exist while the app is broken.',
      },
      {
        id: '8-3-q2',
        question: 'Kubernetes readiness probes primarily:',
        options: [
          'Restart the container on deadlock',
          'Remove the pod from service endpoints when it cannot serve traffic',
          'Upgrade cluster version',
          'Compile code',
        ],
        correctIndex: 1,
        explanation:
          'Readiness gates traffic; liveness restarts on deadlock.',
      },
      {
        id: '8-3-q3',
        question: 'Unhealthy thresholds exist to:',
        options: [
          'Increase flapping',
          'Avoid marking nodes down on transient network blips',
          'Disable logging',
          'Guarantee split-brain',
        ],
        correctIndex: 1,
        explanation:
          'Consecutive failures reduce false positives.',
      },
      {
        id: '8-3-q4',
        question: 'Automatic DB failover often includes:',
        options: [
          'Deleting all backups',
          'Replica promotion plus routing updates plus fencing the old primary',
          'Disabling replication permanently',
          'Removing HTTPS',
        ],
        correctIndex: 1,
        explanation:
          'Promotion must pair with preventing dual writers.',
      },
      {
        id: '8-3-q5',
        question: 'Liveness probes address:',
        options: [
          'Whether the container process is alive or needs restart',
          'Whether marketing approved the UI',
          'DNS TTL only',
          'Git branch protection',
        ],
        correctIndex: 0,
        explanation:
          'Liveness triggers restart on deadlocks that readiness cannot fix.',
      },
      {
        id: '8-3-q6',
        question: 'Why might deep health checks be designed carefully?',
        options: [
          'They cannot include dependencies',
          'They can overload shared dependencies if every instance hammers them simultaneously',
          'They replace databases',
          'They remove load balancers',
        ],
        correctIndex: 1,
        explanation:
          'Thundering herd on DB ping is real—cache, debounce, or shard checks.',
      },
    ],
  },
  {
    id: 'nines-of-availability',
    title: 'Nines of Availability',
    interviewTip:
      'Translate nines to minutes per month/year. Show composite availability math (series dependencies multiply). Tie 99.99% to automatic failover and tight ops—humans cannot fit in the error budget.',
    readContent: `# The nines of availability

**Availability** is the fraction of time a system correctly serves requests: **uptime ÷ (uptime + downtime)**. Engineers shorthand targets as **“nines”**—each additional nine shrinks permitted downtime dramatically, which sounds abstract until you translate it into **minutes per year** your team is allowed to be broken.

## Reference table (memorize the vibe)

| Availability | Downtime/year | Downtime/month (approx) |
| --- | --- | --- |
| **99%** | **3.65 days** | **~7.3 hours** |
| **99.9%** | **~8.76 hours** | **~43.8 minutes** |
| **99.99%** | **~52.6 minutes** | **~4.38 minutes** |
| **99.999%** | **~5.26 minutes** | **~26.3 seconds** |

## What each tier implies architecturally

- **Two nines (99%)** still allows **days** of downtime—fine for internal tools with maintenance windows, painful for consumer products.
- **Three nines (99.9%)** is a common **first serious production bar**: automated failover, monitoring, on-call, and no obvious SPOFs in the critical path.
- **Four nines (99.99%)** demands **multi-AZ**, fast detection, zero-downtime deploy patterns, and tight incident response—**manual failover** rarely fits in the error budget.
- **Five nines (99.999%)** is **multi-region**, heavy automation, chaos testing, and often dedicated SRE investment—each extra nine typically costs an order of magnitude more in engineering and infrastructure.

## Composite availability: series dependencies multiply

If **Service A** (0.999) calls **Service B** (0.999) in series, combined availability is **0.999 × 0.999 ≈ 0.998**—you just lost a chunk of your margin without noticing. Long chains of synchronous dependencies are availability vampires. Mitigate with **parallelism**, **caching**, **async decoupling**, and **graceful degradation** when downstreams wobble.

## SLA vs SLO vs error budget

An **SLA** is contractual—breach it and customers get credits or exit rights. An **SLO** is an internal goal; you usually set SLOs **stricter** than SLAs so you have buffer. An **error budget** is the allowed unavailability window implied by the SLO—at **99.9%** you get roughly **43.8 minutes/month** to spend on deploys, experiments, and mistakes. Burn it all and you should **freeze features** until reliability recovers—Google SRE popularized this discipline.

> NUMBERS: Many cloud services publish **99.95–99.99%** regional SLAs—**read the fine print** for exclusions. Rule of thumb: **each additional nine often costs ~10×** more to achieve in practice.

> INTERVIEW TIP: When someone says **“four nines,”** respond with **“that is about 4.3 minutes of downtime per month—automation and fast failover are mandatory; there is no room for manual heroics in that budget.”**

## Practical guidance

Most B2B SaaS teams can start around **99.9%** and tighten as revenue and customer contracts demand. Availability is a **feature with a price tag**—buy only the nines you need, and **instrument** whether you are actually meeting them.

## Interview scenarios to rehearse

**Translate** **SLA** **credits** **to** **engineering** **work**: **if** **we** **miss** **99.95%**, **customers** **get** **X%** **refund**—**what** **tests** **prove** **we** **can** **meet** **it**? **Composite** **availability** **math** **on** **the** **whiteboard**: **multiply** **dependent** **services**, **show** **how** **caching** **raises** **effective** **availability**. **Error** **budget** **policy**: **freeze** **features** **when** **burn** **rate** **spikes**—reference **Google** **SRE** **culture** **without** **name-dropping** **only** **buzzwords**.
`,
    quizQuestions: [
      {
        id: '8-4-q1',
        question: '99.9% availability allows roughly this much downtime per year:',
        options: [
          'Zero minutes',
          'About 8.76 hours',
          'About 365 days',
          'About 1 second',
        ],
        correctIndex: 1,
        explanation:
          'Three nines still permits hours of outage annually.',
      },
      {
        id: '8-4-q2',
        question: 'If Service A is 99.9% and Service B is 99.9% and both must work (series), availability is about:',
        options: [
          '99.99%',
          '99.8% (multiply independent availabilities)',
          '100%',
          '50%',
        ],
        correctIndex: 1,
        explanation:
          'Series reliability multiplies: 0.999 * 0.999 ≈ 0.998.',
      },
      {
        id: '8-4-q3',
        question: 'An error budget at 99.9% monthly is about:',
        options: [
          '0 minutes',
          '43.8 minutes of allowed bad minutes per month',
          'Infinite downtime',
          'Exactly 1 hour of guaranteed downtime',
        ],
        correctIndex: 1,
        explanation:
          '0.1% of a month is roughly 43.8 minutes.',
      },
      {
        id: '8-4-q4',
        question: 'SLA differs from SLO because:',
        options: [
          'SLA is never written down',
          'SLA is contractual with penalties; SLO is an internal target',
          'SLO always equals SLA',
          'They refer to CPU only',
        ],
        correctIndex: 1,
        explanation:
          'External commitments carry business consequences.',
      },
      {
        id: '8-4-q5',
        question: 'Improving composite availability often involves:',
        options: [
          'Adding more uncached serial dependencies',
          'Reducing series dependencies, adding redundancy, caching, async decoupling',
          'Removing monitoring',
          'Single-region only',
        ],
        correctIndex: 1,
        explanation:
          'Parallel paths and decoupling raise overall availability.',
      },
      {
        id: '8-4-q6',
        question: 'Each additional nine of availability typically:',
        options: [
          'Gets cheaper automatically',
          'Costs significantly more in engineering and infrastructure',
          'Requires fewer tests',
          'Eliminates the need for load balancers',
        ],
        correctIndex: 1,
        explanation:
          'Ultra-high availability demands automation and redundancy.',
      },
    ],
  },
  {
    id: 'circuit-breaker-pattern',
    title: 'Circuit Breaker Pattern',
    interviewTip:
      'For every sync dependency: circuit breaker + timeout + bulkhead + fallback (cache, static, degraded UX). Name libraries (resilience4j, Polly, Envoy) and failure modes (open vs half-open).',
    simulatorDemo: {
      description:
        'Show how latency on a downstream dependency can stall upstream unless failures fail fast.',
      instruction:
        'Run the simulation and inject a **Latency Spike** on **Service B** (Chaos palette). **Service A** waits for **Service B**, threads or connections **pile up**, and the **user-facing** path **degrades**—a **cascading failure**. In production, a **circuit breaker** on the **A→B** call would **trip** after **errors/latency** **breach**, **fail** **fast**, and return **cached/default** data instead of **blocking** the **fleet**.',
      simulationAutoStart: true,
      setupNodes: [
        {
          type: 'loadBalancer',
          label: 'Load Balancer',
          position: { x: 40, y: 260 },
          data: { throughput: 50000, latency: 3, capacity: 200000 },
        },
        {
          type: 'service',
          label: 'Service A',
          position: { x: 320, y: 260 },
          data: { throughput: 4000, latency: 12, capacity: 20000 },
        },
        {
          type: 'service',
          label: 'Service B',
          position: { x: 600, y: 260 },
          data: { throughput: 4000, latency: 12, capacity: 20000 },
        },
        {
          type: 'database',
          label: 'Database',
          position: { x: 880, y: 260 },
          data: { throughput: 10000, latency: 8, capacity: 50000 },
        },
      ],
      setupEdges: [
        { source: 0, target: 1 },
        { source: 1, target: 2 },
        { source: 2, target: 3 },
      ],
    },
    readContent: `# Circuit breaker pattern

When a downstream dependency **fails or slows**, upstream callers must not sit in **blocking waits** with **unbounded retries**—that exhausts **thread pools**, **connection pools**, and **CPU**, turning one sick service into a **cascading outage**. The **circuit breaker** pattern detects sustained failure and **stops forwarding** traffic for a cooling period, returning **fast fallbacks** instead.

## Electrical analogy

A household circuit breaker trips when current is dangerous, cutting power to stop a fire. Software breakers trip when **error rates** or **latencies** exceed policy, cutting request flow to the unhealthy dependency so the rest of the system survives.

## The three states

1. **Closed** — normal operation; failures accumulate in a sliding window.
2. **Open** — calls short-circuit immediately to a **fallback** or cached response; a timer governs how long you stay open.
3. **Half-open** — allow a **trickle** of probe traffic; success closes the circuit, failure reopens it.

Parameters include failure thresholds (count or percentage), window length, open duration, and maximum concurrent probes in half-open.

## Fallback strategies

Return **stale cache**, **generic recommendations**, **text-only** UI, enqueue work for later, or a **clear 503** with **Retry-After**. Netflix famously still loads when personalization fails by showing **“Popular on Netflix”**—users prefer degraded content to a blank screen.

## Where it lives

Application libraries (**resilience4j**, **Polly**, **opossum**) and **service meshes** (**Envoy** outlier detection, **Istio** circuit breaking) implement variants. The important part is **policy + observability**: you must see when circuits open.

> IMPORTANT: Cascading failure is one of the most common large-scale outage patterns. **Every synchronous dependency** should have **timeouts + bulkheads + circuit breakers**—not “nice to have.”

> INTERVIEW TIP: “**Circuit breaker on A→B**, trip on **50% 5xx in 60s** or **p99 > 500ms**, **fallback** to **cache**, **30s** open cooldown.”

## Testing with chaos

Inject latency or errors on **Service B** and verify **Service A** stays within SLA because the breaker opens and fallbacks engage. Circuit breakers trade **perfect freshness** for **collective survival**—choose fallbacks users can tolerate and measure satisfaction during degraded modes.

## Interview scenarios to rehearse

**Pair** **circuit** **breakers** **with** **timeouts** **and** **bulkheads** **(thread** **pool** **per** **dependency)**. Mention **Envoy** **outlier** **detection** **vs** **app-level** **Hystrix-style** **libraries**. Discuss **half-open** **flapping** **when** **dependencies** **oscillate**—**tune** **minimum** **open** **duration** **and** **success** **threshold**. **Show** **metrics**: **breaker** **state**, **fallback** **rate**, **user** **satisfaction** **during** **degraded** **mode**.
`,
    quizQuestions: [
      {
        id: '8-5-q1',
        question: 'In the circuit breaker pattern, the OPEN state means:',
        options: [
          'Normal operation',
          'Calls fail fast without hitting the unhealthy dependency',
          'Infinite retries',
          'Database migration in progress',
        ],
        correctIndex: 1,
        explanation:
          'Open short-circuits to protect the system and downstream.',
      },
      {
        id: '8-5-q2',
        question: 'Half-open state is used to:',
        options: [
          'Permanently delete the service',
          'Probe whether the downstream recovered before fully closing the circuit',
          'Disable TLS',
          'Increase thread pools without limit',
        ],
        correctIndex: 1,
        explanation:
          'Limited test traffic validates recovery.',
      },
      {
        id: '8-5-q3',
        question: 'A good fallback when recommendations are down is:',
        options: [
          'Return 500 to every user',
          'Serve popular/static items from cache',
          'Drop all HTTP connections',
          'Turn off logging',
        ],
        correctIndex: 1,
        explanation:
          'Degraded experience beats total failure.',
      },
      {
        id: '8-5-q4',
        question: 'Circuit breakers primarily prevent:',
        options: [
          'Caching',
          'Cascading failure from retry storms and resource exhaustion',
          'DNS resolution',
          'JSON serialization',
        ],
        correctIndex: 1,
        explanation:
          'They stop upstream from hammering a sick downstream.',
      },
      {
        id: '8-5-q5',
        question: 'Moving from closed to open typically requires:',
        options: [
          'A successful deploy only',
          'Breaching configured failure rate or latency thresholds',
          'A manual AWS ticket always',
          'Disabling health checks',
        ],
        correctIndex: 1,
        explanation:
          'Policies define when to trip based on observed errors.',
      },
      {
        id: '8-5-q6',
        question: 'Service mesh circuit breaking often lives at:',
        options: [
          'Only the database',
          'The data plane proxy (e.g. Envoy) enforcing outlier detection',
          'Git hooks only',
          'Client browsers exclusively',
        ],
        correctIndex: 1,
        explanation:
          'Sidecars centralize resilience policies for microservices.',
      },
    ],
  },
  {
    id: 'retry-strategies-exponential-backoff',
    title: 'Retry Strategies & Exponential Backoff',
    interviewTip:
      'Pair retries with exponential backoff + full jitter, cap max delay and attempts, retry only idempotent or keyed operations, and classify 4xx vs 5xx. Mention Retry-After for 429.',
    readContent: `# Retry strategies and exponential backoff

Networks glitch, pods restart, garbage collection pauses spike—**transient** failures are normal. **Retries** turn transient issues into successful requests. The failure mode is **retry storms**: thousands of clients hammering an already struggling server because they all retry **immediately** and **synchronously**, doubling load during an outage.

## Exponential backoff

Instead of retrying every millisecond, wait **base × 2^n** between attempts—classic sequences look like **1s, 2s, 4s, 8s** before giving up. That spreads load over time so the recovering service can catch its breath.

## Jitter

Add **randomness** to each wait so clients do not **resynchronize** into thundering herds. **Full jitter** (pick a random delay between zero and the exponential cap) is a common AWS recommendation: it spreads retries better than deterministic schedules.

## Caps and budgets

Cap **maximum attempts** (often **3–5**), cap **maximum delay** (**30–60 seconds**), and enforce an **end-to-end deadline** so one pathological dependency cannot stall a user request forever.

## What to retry

Generally retry **5xx**, **502/503**, **connect timeouts**, and **429** when honoring **Retry-After**. **Do not** blindly retry **400/401/403/404**—the request is wrong or unauthorized; repeating it wastes capacity. Idempotent reads are safer to retry than non-idempotent writes unless you have **idempotency keys**.

## Idempotency is mandatory

Retries mean **duplicate deliveries**. Payment APIs use **idempotency keys**; consumers use **deduplication tables**—design for duplicates from day one.

> ANALOGY: Calling a busy restaurant every five seconds jams the phone line; **polite backoff with jitter** is like spacing out callback attempts so the kitchen can recover.

> NUMBERS: **Base delay 1s**, **2× multiplier**, **max delay 30s**, **5 attempts** → total backoff time on the order of **tens of seconds** before giving up—tune to UX.

> INTERVIEW TIP: “We retry **only** **5xx/timeouts**, **exponential backoff with full jitter**, **max three attempts**, **idempotency keys on POST**, **respect Retry-After** on **429**.”

## Server responsibilities

Publish **Retry-After**, use **rate limits**, and avoid encouraging hedged retries unless you understand **load amplification**.

Retries are **fuel**—discipline prevents **wildfire**.

## Interview scenarios to rehearse

**Compare** **client** **retries** **vs** **broker** **redelivery**: **who** **owns** **backoff**—**SDK**, **service** **mesh**, **queue**? **Discuss** **idempotency** **keys** **for** **POST**, **dedup** **windows**, **and** **deadline** **propagation** **across** **services** (**OpenTelemetry** **context**). **Hedged** **requests**: **when** **helpful** **vs** **harmful** **(load** **amplification)**.
`,
    quizQuestions: [
      {
        id: '8-6-q1',
        question: 'Retry storms happen when:',
        options: [
          'Clients never retry',
          'Many clients retry simultaneously without backoff, amplifying load on a failing service',
          'TLS is enabled',
          'Caches hit',
        ],
        correctIndex: 1,
        explanation:
          'Synchronized retries overload an already struggling server.',
      },
      {
        id: '8-6-q2',
        question: 'Jitter primarily helps by:',
        options: [
          'Removing idempotency requirements',
          'Desynchronizing retry times to avoid thundering herds',
          'Increasing failure rates',
          'Disabling DNS',
        ],
        correctIndex: 1,
        explanation:
          'Randomness spreads retry attempts over time.',
      },
      {
        id: '8-6-q3',
        question: 'You should NOT blindly retry:',
        options: [
          '503 with backoff',
          '400 Bad Request indicating a client mistake',
          'Timeout of an unknown idempotent GET',
          'Connection reset on idempotent read',
        ],
        correctIndex: 1,
        explanation:
          'Client errors will not succeed on repeat without change.',
      },
      {
        id: '8-6-q4',
        question: 'Idempotency matters for retries because:',
        options: [
          'It makes DNS faster',
          'Duplicate deliveries should not change final state incorrectly',
          'It removes TLS',
          'It disables queues',
        ],
        correctIndex: 1,
        explanation:
          'At-least-once delivery requires safe replays.',
      },
      {
        id: '8-6-q5',
        question: 'Exponential backoff means delays typically:',
        options: [
          'Shrink to zero',
          'Grow multiplicatively per attempt until capped',
          'Are always exactly 1ms',
          'Are illegal in HTTP',
        ],
        correctIndex: 1,
        explanation:
          'Each wait expands by a factor until a max.',
      },
      {
        id: '8-6-q6',
        question: 'A maximum backoff cap prevents:',
        options: [
          'Any retries',
          'Waiting many minutes on a single retry cycle',
          'TLS handshakes',
          'JSON parsing',
        ],
        correctIndex: 1,
        explanation:
          'Uncapped exponential waits can become impractically long.',
      },
    ],
  },
  {
    id: 'graceful-degradation',
    title: 'Graceful Degradation',
    interviewTip:
      'Walk tier-1 vs tier-3 features: shed analytics first, keep checkout. Predefine fallbacks and test them. Connect to circuit breakers and feature flags.',
    readContent: `# Graceful degradation

**Graceful degradation** means the product **still delivers core value** when pieces fail—users get a worse experience, not a hard error. Netflix without personalization still streams video; Amazon without recommendations still lets you search and buy; maps without live traffic still route you.

## Strategies you can combine

1. **Feature flags** to disable non-critical paths under stress (recommendations, heavy analytics).
2. **Static fallbacks** when dynamic services fail—show “popular items” instead of personalized lists.
3. **Read-only mode** when writes are unsafe but cached reads still inform users.
4. **Load shedding**—return **503** to a fraction of low-priority traffic to protect capacity for checkout.
5. **Aggressive timeouts** on optional enrichment—if recommendations do not return in **200ms**, ship the page without them.

## Priority tiers

Define **tier 1** (auth, payments, core APIs), **tier 2** (notifications, secondary features), **tier 3** (analytics, A/B testing flourishes). When pressure hits, shed tier 3 first.

## Load shedding nuance

Shedding is intentional **request loss** to prevent **total collapse**—prefer **deterministic rules** (drop anonymous traffic first, preserve logged-in buyers) over random chaos unless randomness is your policy.

> ANALOGY: Rolling blackouts route power to hospitals before neon signs—a city **degrades** but does not disappear.

> IMPORTANT: Degradation must be **designed and load-tested** before production. Inventing it during a Sev-1 usually means **guessing** under adrenaline.

> INTERVIEW TIP: Walk through **what happens when dependency X fails** without being asked—senior engineers volunteer degradation stories.

## Observability

Emit metrics when **degraded mode** activates so you know you are running **limp-home**, not “healthy.”

Graceful degradation is **product management under fire**—decide what “must work” means before the pager rings.

## Interview scenarios to rehearse

**Walk** **through** **Black** **Friday**: **turn** **off** **recommendations**, **reduce** **image** **quality**, **extend** **cache** **TTLs**, **prioritize** **checkout** **traffic**. **Discuss** **ethical** **load** **shedding**: **paid** **users** **first**? **Geographic** **fairness**? **Measure** **customer** **trust** **impact** **when** **degrading** **personalization**. **Tie** **to** **feature** **flags** **(LaunchDarkly,** **internal** **config** **service)**.
`,
    quizQuestions: [
      {
        id: '8-7-q1',
        question: 'Graceful degradation means:',
        options: [
          'Always returning 500',
          'Reducing non-critical functionality while preserving core user value',
          'Deleting the database',
          'Disabling TLS',
        ],
        correctIndex: 1,
        explanation:
          'Partial service beats total outage.',
      },
      {
        id: '8-7-q2',
        question: 'A good first candidate to shed under load is:',
        options: [
          'User login',
          'Non-essential analytics or A/B testing traffic',
          'Payment capture',
          'CSRF protection',
        ],
        correctIndex: 1,
        explanation:
          'Tier-3 workloads protect tier-1 paths.',
      },
      {
        id: '8-7-q3',
        question: 'Read-only mode can help when:',
        options: [
          'Writes are unsafe but reads/cached content can still inform users',
          'You want to delete all data',
          'DNS is broken',
          'GPU drivers update',
        ],
        correctIndex: 0,
        explanation:
          'Browse-only beats hard failure when writes path is broken.',
      },
      {
        id: '8-7-q4',
        question: 'Load shedding differs from infinite retries because:',
        options: [
          'It intentionally drops some work to protect remaining capacity',
          'It always doubles traffic',
          'It removes monitoring',
          'It guarantees exactly-once delivery',
        ],
        correctIndex: 0,
        explanation:
          'Shedding sacrifices low-priority requests deliberately.',
      },
      {
        id: '8-7-q5',
        question: 'Tight timeouts on optional dependencies help:',
        options: [
          'Guarantee stronger consistency automatically',
          'Fail fast and render without enrichment when slowness would dominate UX',
          'Remove need for databases',
          'Disable caching',
        ],
        correctIndex: 1,
        explanation:
          'Optional features should not block the critical path.',
      },
      {
        id: '8-7-q6',
        question: 'Graceful degradation should be:',
        options: [
          'Designed and tested in advance with feature flags and runbooks',
          'Only invented during an outage with no prior thought',
          'Avoided entirely',
          'Only for static websites',
        ],
        correctIndex: 0,
        explanation:
          'Prepared degradation paths reduce incident duration.',
      },
    ],
  },
  {
    id: 'chaos-engineering',
    title: 'Chaos Engineering',
    interviewTip:
      'Hypothesis → experiment in prod with minimal blast radius → measure → fix. Reference Chaos Monkey, Gremlin/FIS/Litmus, game days. Tie to NodeBreaker chaos injections as practice.',
    readContent: `# Chaos engineering

**Chaos engineering** is the discipline of **experimenting on production systems** to build confidence they survive real-world turbulence. Netflix popularized it during their AWS migration: **Chaos Monkey** randomly terminated instances during business hours so teams were forced to build **autoscaling, redundancy, and automation** that actually worked—not just existed on slides.

## Simian Army heritage

The original **Simian Army** included tools to kill instances, inject latency, take out AZs, and more. Industry evolved toward safer, policy-driven tools: **Gremlin**, **AWS Fault Injection Simulator**, **LitmusChaos**, **Chaos Toolkit**. The names changed; the goal did not—**prove** your mitigations.

## Core principles

1. Start from a **steady-state hypothesis** (p99 latency, error rate under X%).
2. Introduce **realistic faults**: kill nodes, add latency, drop packets, fill disks.
3. Prefer **production** experiments with **tight blast radius**—staging traffic rarely matches prod skew.
4. **Minimize blast radius**: one cluster, one namespace, one percent of users.
5. **Automate** experiments on a schedule—reliability is not a one-off demo.

## Example experiments

Terminate a random pod—does traffic reroute cleanly? Inject **500ms** database latency—do circuit breakers trip and fallbacks engage? Simulate primary DB failover—does RTO fit the SLO? These are the same questions NodeBreaker’s chaos injections practice visually.

## Game days

Cross-functional **game days** script scenarios, communicate to stakeholders, execute controlled failures, observe dashboards, and write retrospectives. They build **muscle memory** better than reading runbooks alone.

## NodeBreaker connection

**NodeBreaker** chaos (**node crash**, **latency spike**, **packet loss**, **capacity drop**) mirrors what chaos engineers run in prod—use it to rehearse narratives you will tell in interviews and on-call.

> IMPORTANT: Chaos is **not** random vandalism. Every experiment needs a **hypothesis**, **abort criteria**, **blast caps**, and a **postmortem**—disciplined science, not adrenaline tourism.

> INTERVIEW TIP: “We run **quarterly fault injection** in prod with **canary scope**, validate **HA** and **breakers**, and track **error budget** impact.”

## Ethics and safety

Get stakeholder alignment, define **customer impact budgets**, maintain **instant rollback** levers, and never surprise legal or support.

Chaos engineering turns **PowerPoint resilience** into **evidence**—the only antidote to hoping your redundancy works.

## Interview scenarios to rehearse

**Hypothesis** **template**: **“If** **we** **lose** **AZ** **B,** **p99** **latency** **stays** **<** **200ms** **because** **…”**. **Blast** **radius** **controls**: **single** **cluster**, **single** **namespace**, **single** **customer** **canary**. **Compliance**: **notify** **support** **before** **customer-impacting** **faults**. **NodeBreaker** **practice**: **rehearse** **explaining** **each** **chaos** **injection** **as** **if** **to** **a** **VP**—**business** **language** **first**, **tech** **second**.
`,
    quizQuestions: [
      {
        id: '8-8-q1',
        question: 'Chaos engineering is primarily:',
        options: [
          'Randomly deleting data without backups',
          'Disciplined experiments to verify resilience hypotheses in realistic environments',
          'A replacement for unit tests',
          'A DNS feature',
        ],
        correctIndex: 1,
        explanation:
          'Controlled, hypothesis-driven fault injection builds confidence.',
      },
      {
        id: '8-8-q2',
        question: 'Why run chaos experiments in production carefully?',
        options: [
          'Staging traffic never differs from production patterns',
          'Real traffic reveals behaviors staging cannot, but blast radius must be minimized',
          'Production is illegal to touch',
          'Because TLS forbids it',
        ],
        correctIndex: 1,
        explanation:
          'Production realism matters; guardrails protect users.',
      },
      {
        id: '8-8-q3',
        question: 'Chaos Monkey famously:',
        options: [
          'Only ran in developer laptops',
          'Randomly terminated instances during business hours to ensure failover worked',
          'Replaced databases with Excel',
          'Calculated PI',
        ],
        correctIndex: 1,
        explanation:
          'Netflix forced continuous validation of autoscaling and redundancy.',
      },
      {
        id: '8-8-q4',
        question: 'A Game Day typically includes:',
        options: [
          'No communication',
          'Scenario planning, execution, observation, and retrospective',
          'Deleting backups',
          'Disabling monitoring',
        ],
        correctIndex: 1,
        explanation:
          'Structured drills build operational skill.',
      },
      {
        id: '8-8-q5',
        question: 'Chaos engineering differs from random breaking because:',
        options: [
          'It has hypotheses, controls, and learning goals',
          'It never touches production',
          'It avoids automation',
          'It guarantees zero failures',
        ],
        correctIndex: 0,
        explanation:
          'Scientific method distinguishes disciplined chaos from outages.',
      },
      {
        id: '8-8-q6',
        question: 'Blast radius minimization means:',
        options: [
          'Affect all users at once for efficiency',
          'Start small (one instance/service) and expand with evidence',
          'Never document experiments',
          'Disable rollbacks',
        ],
        correctIndex: 1,
        explanation:
          'Contain experiments to learn safely.',
      },
    ],
  },
];
