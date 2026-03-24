import type { Topic } from '@/constants/curriculumTypes';

const demoScaleOut: Topic['simulatorDemo'] = {
  description:
    'One instance absorbs all traffic until it saturates. Spreading work across replicas raises effective capacity.',
  instruction:
    'Start with a single service at 2000 req/s capacity — ramp traffic in the simulator until it turns yellow/red. Reset, add a **Load Balancer** and **three Service** nodes (each ~2000 req/s), connect LB to all services, and run again: each replica handles roughly a third, staying in the green zone. That is why load balancers exist.',
  simulationAutoStart: true,
  setupNodes: [
    {
      type: 'service',
      label: 'Single API (2000 req/s)',
      position: { x: 220, y: 100 },
      data: { throughput: 2000, latency: 12, capacity: 8000 },
    },
  ],
  setupEdges: [],
};

export const CHAPTER_6_TOPICS: Topic[] = [
  {
    id: 'why-one-server-is-never-enough',
    title: 'Why One Server Is Never Enough',
    interviewTip:
      'Flag every singleton as SPOF. Answer "what if it dies?" with N≥2 instances behind health-checked load balancing plus stateless app tier.',
    simulatorDemo: demoScaleOut,
    readContent: `# Physical limits

A **single server** is bounded by **CPU cores**, **RAM**, **NIC bandwidth**, **disk IOPS**, and **kernel** tuning. Past those ceilings, **latency** climbs and **errors** appear no matter how clever your code is. You also inherit a **single point of failure**: **kernel panic**, **rack power**, **bad deploy**, or **noisy neighbor** takes **100%** of traffic offline.

# Blast radius

When that one box dies, **every user** is down simultaneously. **MTTR** includes provisioning, restore, and human panic. Finance and trust evaporate.

# Why multiple servers

**Horizontal scale** adds **aggregate throughput** and **fault isolation**: lose one of **N**, traffic **fails over** to siblings. You can **roll** deployments instance-by-instance (**rolling**), swap **blue/green** stacks, or **canary** a slice of users.

# Role of the load balancer

Clients want **one hostname**; **L4/L7 load balancers** present a **virtual IP** or DNS name, **health-check** backends, and **distribute** connections. Without an LB, you would hand users a **list of IPs** and pray.

# Evolution story

**Single host** → **DNS round robin** (no health awareness) → **hardware / cloud LB** with probes → **multi-AZ** LBs → **global** load balancing (later topic).

> ANALOGY: **One cashier** suffices for a quiet Tuesday. **Black Friday** needs **ten registers** and a **host** routing guests — the host is your **load balancer**.

> NUMBERS: A **t3.medium**-class VM might serve **~1k–5k** simple HTTP JSON RPS; **t3.xlarge** might reach **~5k–15k** before network or app limits — **ballpark** only, **load test** your binary. Beyond that, **shard** traffic.

> INTERVIEW TIP: Never present **one** stateless API instance. Always **N** behind LB with **health checks**.

## Stateful caveat

**WebSockets** and legacy **in-memory sessions** complicate scale-out — prefer **external** session stores.

# How this shows up on the job

Load balancers are only as good as **health checks** and **capacity**. You edit **Terraform** for **target groups**, tune **draining** so **in-flight** work finishes, and learn why **one** bad instance stayed **healthy** because **/** was fine but **/api** was not. Incidents trace to **timeout** chains and **retry storms** when half the fleet vanishes. Mention **deregistration delay**, **idle timeout**, and **client retry policy** in designs.

# What to practice next

Write your **timeout cascade**: browser → edge → LB → app → DB. Inner timeouts must be **shorter** than outer so failures **fail fast** with **context** instead of **hanging**.
`,
    quizQuestions: [
      {
        id: '6-1-q1',
        question: 'A single server failure without redundancy causes?',
        options: [
          'Automatic DNS healing',
          'Total outage for traffic pinned to that node',
          'Faster responses',
          'Infinite scale',
        ],
        correctIndex: 1,
        explanation:
          'No failover path means complete service loss.',
      },
      {
        id: '6-1-q2',
        question: 'Load balancers primarily provide?',
        options: [
          'Database indexing',
          'Single entry point, distribution, and health-aware routing',
          'TLS for SMTP only',
          'GPU scheduling',
        ],
        correctIndex: 1,
        explanation:
          'They decouple clients from individual backend lifecycles.',
      },
      {
        id: '6-1-q3',
        question: 'Rolling deployment means?',
        options: [
          'Stop all servers at once',
          'Update instances sequentially while others serve traffic',
          'Delete DNS',
          'Disable caching',
        ],
        correctIndex: 1,
        explanation:
          'Capacity remains during upgrade waves.',
      },
      {
        id: '6-1-q4',
        question: 'DNS round robin without health checks risks?',
        options: [
          'Perfect failover',
          'Sending users to dead IPs',
          'Removing HTTP',
          'Automatic sharding',
        ],
        correctIndex: 1,
        explanation:
          'DNS lacks instant awareness of backend failure.',
      },
      {
        id: '6-1-q5',
        question: 'Horizontal scaling helps when?',
        options: [
          'Workload partitions across stateless instances',
          'Single-threaded global lock forever',
          'Disk is irrelevant',
          'Only for DNS',
        ],
        correctIndex: 0,
        explanation:
          'Add boxes that share nothing except external data stores.',
      },
    ],
  },
  {
    id: 'l4-vs-l7-load-balancing',
    title: 'L4 vs L7 Load Balancing',
    interviewTip:
      'Default to L7 (ALB/NGINX) for HTTP APIs: path routing, TLS termination, WAF hooks. Mention NLB for TCP/gRPC raw perf or database tunnels.',
    readContent: `# Layers

**L4** (transport) sees **IPs**, **ports**, **TCP/UDP** segments — **not** HTTP paths or headers. Decisions are **fast** and **generic**: pick backend socket, forward packets.

**L7** (application) terminates **HTTP(S)**, inspects **method**, **path**, **Host**, **cookies**, maybe **body** snippets. Enables **routing rules**, **auth** integration, **compression**, **rate limits** per route.

# L4 strengths

**Game UDP**, **database TCP**, **TLS passthrough** when you must not decrypt, **millions** of long-lived connections with minimal CPU.

# L7 strengths

Route **/api** to **API cluster**, **/static** to **object storage**, **A/B** via cookies, **canonical** redirects, **WAF**, **WebSocket** upgrades, **gRPC** (with appropriate LB).

# Performance nuance

**L4** data planes can push **very high** packets/s. **L7** pays **TLS** + **HTTP parse** per request — still **hundreds of thousands** of RPS on modern hardware/cloud.

> IMPORTANT: For typical **REST/GraphQL** behind HTTPS, **L7** is the default — the **features** dominate the small overhead.

> INTERVIEW TIP: Say "**ALB (L7)** terminates TLS, routes **/v1** to blue stack" unless the workload is non-HTTP.

## Examples

**AWS NLB** ≈ L4, **AWS ALB** ≈ L7. **NGINX** can do both. **Envoy** often L7 with rich policy.

# How this shows up on the job

Load balancers are only as good as **health checks** and **capacity**. You edit **Terraform** for **target groups**, tune **draining** so **in-flight** work finishes, and learn why **one** bad instance stayed **healthy** because **/** was fine but **/api** was not. Incidents trace to **timeout** chains and **retry storms** when half the fleet vanishes. Mention **deregistration delay**, **idle timeout**, and **client retry policy** in designs.

# What to practice next

Write your **timeout cascade**: browser → edge → LB → app → DB. Inner timeouts must be **shorter** than outer so failures **fail fast** with **context** instead of **hanging**.
`,
    quizQuestions: [
      {
        id: '6-2-q1',
        question: 'L7 load balancer can?',
        options: [
          'Never terminate TLS',
          'Route based on URL path and headers',
          'Only see MAC addresses',
          'Replace TCP',
        ],
        correctIndex: 1,
        explanation:
          'Application awareness enables content-based routing.',
      },
      {
        id: '6-2-q2',
        question: 'Pure L4 balancer cannot reliably?',
        options: [
          'Forward TCP',
          'Inspect HTTP JSON field without terminating TLS',
          'Hash 5-tuple',
          'See port numbers',
        ],
        correctIndex: 1,
        explanation:
          'Encrypted payloads are opaque without MITM termination.',
      },
      {
        id: '6-2-q3',
        question: 'When prefer L4?',
        options: [
          'Path-based canary releases for REST',
          'Raw TCP/UDP performance or TLS passthrough compliance',
          'Cookie-based A/B',
          'HTTP header routing',
        ],
        correctIndex: 1,
        explanation:
          'Non-HTTP or end-to-end encryption drives L4.',
      },
      {
        id: '6-2-q4',
        question: 'TLS termination at LB means?',
        options: [
          'Clients speak plaintext HTTP only always',
          'LB decrypts client TLS; often HTTP to private backends',
          'No certificates needed',
          'Removes load balancing',
        ],
        correctIndex: 1,
        explanation:
          'Centralizes crypto and cert rotation.',
      },
      {
        id: '6-2-q5',
        question: 'L7 overhead vs L4 mainly from?',
        options: [
          'DNS TTL',
          'HTTP parsing and TLS handshake work per connection',
          'Slower RAM',
          'Fewer NICs',
        ],
        correctIndex: 1,
        explanation:
          'Inspection and crypto cost CPU cycles.',
      },
      {
        id: '6-2-q6',
        question: 'API path /admin to separate cluster is?',
        options: ['L4 only', 'L7 routing', 'DHCP', 'ARP'],
        correctIndex: 1,
        explanation:
          'Needs URL awareness.',
      },
    ],
  },
  {
    id: 'algorithms-round-robin-least-connections',
    title: 'Algorithms: Round Robin & Least Connections',
    interviewTip:
      'Recommend least connections for variable latency APIs; weighted round robin for heterogeneous instance sizes; mention power-of-two choices for mesh data planes.',
    readContent: `# Round robin

Send requests **1 → 2 → 3 → 1…**. **Zero state**, easy to reason. **Fails** when instances differ in **CPU** or requests differ in **duration** — stragglers pile up on busy nodes while idle siblings exist.

# Weighted round robin

Multiply slots per **capacity** (big metal gets weight 3). Helps **heterogeneous** fleets.

# Least connections

Pick backend with **fewest in-flight** connections / requests. Adapts to **long-polling**, **heavy** queries, **WebSockets**. Needs **state** or **approximation**.

# Weighted least connections

Blend **capacity weight** with **current load**.

# IP hash

**Hash(Source IP)** → backend for **session stickiness** without cookies. Risk: **skewed** NAT IPs.

# Least response time / EWMA

Track **latency** per backend; favor fast/healthy. Found in **commercial** ADCs or **service meshes**.

# Random & power-of-two

**Random** is surprisingly fair at scale. **Power-of-two choices**: sample **two** backends, pick **lighter** — near **least connections** quality with **O(1)** work — used in **Envoy**/academic LB.

> INTERVIEW TIP: "**Least connections** for our variable-latency Node APIs; **weighted RR** if GPU vs CPU nodes mix."

## Table

| Algorithm | State | Best when |
| --- | --- | --- |
| RR | None | Uniform nodes & requests |
| WRR | Weights | Mixed sizes |
| LC | Active counts | Variable duration |
| IP hash | Optional table | Sticky TCP without cookies |

# How this shows up on the job

Load balancers are only as good as **health checks** and **capacity**. You edit **Terraform** for **target groups**, tune **draining** so **in-flight** work finishes, and learn why **one** bad instance stayed **healthy** because **/** was fine but **/api** was not. Incidents trace to **timeout** chains and **retry storms** when half the fleet vanishes. Mention **deregistration delay**, **idle timeout**, and **client retry policy** in designs.

# What to practice next

Write your **timeout cascade**: browser → edge → LB → app → DB. Inner timeouts must be **shorter** than outer so failures **fail fast** with **context** instead of **hanging**.
`,
    quizQuestions: [
      {
        id: '6-3-q1',
        question: 'Naive round robin struggles when?',
        options: [
          'All requests identical and instant',
          'Request durations vary widely — long tasks strand on busy nodes',
          'TLS is off',
          'DNS is anycast',
        ],
        correctIndex: 1,
        explanation:
          'Fair rotation != fair utilization under variable service times.',
      },
      {
        id: '6-3-q2',
        question: 'Least connections targets?',
        options: [
          'Minimize DNS TTL',
          'Balance in-flight work for variable latency requests',
          'Encrypt disks',
          'Remove health checks',
        ],
        correctIndex: 1,
        explanation:
          'Favors backends with spare capacity.',
      },
      {
        id: '6-3-q3',
        question: 'Weighted round robin helps?',
        options: [
          'Identical containers only',
          'Servers with different CPU/memory capacity',
          'SMTP relay',
          'BGP only',
        ],
        correctIndex: 1,
        explanation:
          'Weights approximate horsepower.',
      },
      {
        id: '6-3-q4',
        question: 'IP hash provides?',
        options: [
          'Automatic SQL optimization',
          'Sticky routing by client IP (with skew risks)',
          'TLS certificates',
          'Sharding Mongo automatically',
        ],
        correctIndex: 1,
        explanation:
          'Same client tends to hit same backend.',
      },
      {
        id: '6-3-q5',
        question: 'Power-of-two choices approximate?',
        options: [
          'DNS',
          'Least loaded with minimal sampling cost',
          'RAID 0',
          'FTP',
        ],
        correctIndex: 1,
        explanation:
          'Pick best of two random backends — cheap and effective.',
      },
      {
        id: '6-3-q6',
        question: 'Long-lived WebSockets benefit from?',
        options: [
          'Blind RR ignoring open sockets',
          'Algorithms aware of connection load (least connections / sticky)',
          'Random disk seeks',
          'ICMP only',
        ],
        correctIndex: 1,
        explanation:
          'Connection counts reflect real load.',
      },
    ],
  },
  {
    id: 'health-checks',
    title: 'Health Checks',
    interviewTip:
      'Specify HTTP GET /health every 10s, success threshold 2, failure 3, and dependencies checked (DB ping). Mention K8s readiness vs liveness.',
    readContent: `# Why check

Without **health probes**, LB keeps sending users to **zombie** processes: **TCP accept** works, but app returns **500** because **DB** is down. Health checks **drain** bad nodes automatically.

# Shallow vs deep

**TCP connect** — fast, confirms **port open**, not **semantic** health.

**HTTP /healthz** — hit real **route** verifying **dependencies** you choose (DB **ping**, **queue** reachability). Return **200** vs **503**.

# Parameters

**Interval** (**5–30s**), **timeout** (**2–5s**), **healthy threshold** (**2–3** successes), **unhealthy threshold** (**2–5** failures). Tune to avoid **flapping**.

# Good endpoint

Check **readiness**: DB **SELECT 1**, **Redis PING**, **disk** free space, **dependency** circuit states. **Liveness** lighter (process up) in **Kubernetes** split.

# Kubernetes nuance

**Readiness** fail ⇒ **remove** from Service endpoints. **Liveness** fail ⇒ **restart** container. Never point liveness at **slow** external checks.

> IMPORTANT: **TCP-only** checks miss **application-level** failure modes — prefer **deep** HTTP checks in production.

> INTERVIEW TIP: "**Synthetic canary** + **LB health** + **metrics**" triad shows ops maturity.

## Graceful

Return **200** with **degraded: true** JSON for **optional** dependencies if product allows partial UX.

# How this shows up on the job

Load balancers are only as good as **health checks** and **capacity**. You edit **Terraform** for **target groups**, tune **draining** so **in-flight** work finishes, and learn why **one** bad instance stayed **healthy** because **/** was fine but **/api** was not. Incidents trace to **timeout** chains and **retry storms** when half the fleet vanishes. Mention **deregistration delay**, **idle timeout**, and **client retry policy** in designs.

# What to practice next

Write your **timeout cascade**: browser → edge → LB → app → DB. Inner timeouts must be **shorter** than outer so failures **fail fast** with **context** instead of **hanging**.
`,
    quizQuestions: [
      {
        id: '6-4-q1',
        question: 'TCP-only health check can falsely pass when?',
        options: [
          'Port listens but app logic is broken',
          'HTTP always 200',
          'DNS fails',
          'TLS off',
        ],
        correctIndex: 0,
        explanation:
          'Process accepting sockets != successful requests.',
      },
      {
        id: '6-4-q2',
        question: 'Kubernetes readiness failure does what?',
        options: [
          'Immediately SIGKILL host',
          'Stop sending traffic via Service endpoints while pod keeps running',
          'Resize PVC',
          'Change DNS TTL',
        ],
        correctIndex: 1,
        explanation:
          'Pod may recover without restart.',
      },
      {
        id: '6-4-q3',
        question: 'Liveness failure causes?',
        options: [
          'Traffic continues',
          'Container restart by kubelet',
          'Certificate issuance',
          'Shard migration',
        ],
        correctIndex: 1,
        explanation:
          'Designed to replace wedged processes.',
      },
      {
        id: '6-4-q4',
        question: 'Unhealthy threshold exists to?',
        options: [
          'Speed flapping',
          'Avoid removing nodes on single transient glitch',
          'Disable TLS',
          'Increase DNS weight',
        ],
        correctIndex: 1,
        explanation:
          'Consecutive failures reduce noise.',
      },
      {
        id: '6-4-q5',
        question: 'Deep health check should validate?',
        options: [
          'Only CPU model',
          'Critical dependencies the app needs to serve real requests',
          'Client browser version',
          'CSS variables',
        ],
        correctIndex: 1,
        explanation:
          'Mirror real failure modes.',
      },
      {
        id: '6-4-q6',
        question: 'Very aggressive liveness probe risk?',
        options: [
          'Never restarts',
          'Restart loops during slow dependency blips',
          'Infinite RAM',
          'Free TLS',
        ],
        correctIndex: 1,
        explanation:
          'Couple liveness to fast, local signals.',
      },
    ],
  },
  {
    id: 'sticky-sessions',
    title: 'Sticky Sessions',
    interviewTip:
      'Prefer Redis/session store; cite stickiness only for WebSockets or unmovable legacy. Expect interviewer pushback on crash loss.',
    readContent: `# Problem

User hits **Server A**, **session** stored in **RAM**. Next request lands on **Server B** — no cookie/session data — user appears **logged out**.

# Sticky sessions

LB pins client to **same backend** via **cookie** or **table** mapping. Works for **legacy** apps.

# Downsides

**Uneven** load (power users cling), **failure** evicts sessions, **scaling** in/out breaks mappings, **deploy** complexity.

# Better pattern

**External session store** (**Redis**, signed **JWT** + **refresh**) so **any** node serves any user.

# Still valid uses

**WebSocket** **affinity**, **GPU** shard pinning, **local cache** warming strategies.

> ANALOGY: Sticky is insisting every bank visit uses **teller #4** because they know you — great until teller #4 is sick. **Central CRM** (Redis) lets any teller help.

> INTERVIEW TIP: "**Redis session with 30m TTL**" beats sticky cookies for HTTP APIs.

## Cookie names

**AWSALB**, **JSESSIONID** stickiness — know they exist, avoid when possible.

# How this shows up on the job

Load balancers are only as good as **health checks** and **capacity**. You edit **Terraform** for **target groups**, tune **draining** so **in-flight** work finishes, and learn why **one** bad instance stayed **healthy** because **/** was fine but **/api** was not. Incidents trace to **timeout** chains and **retry storms** when half the fleet vanishes. Mention **deregistration delay**, **idle timeout**, and **client retry policy** in designs.

# What to practice next

Write your **timeout cascade**: browser → edge → LB → app → DB. Inner timeouts must be **shorter** than outer so failures **fail fast** with **context** instead of **hanging**.
`,
    quizQuestions: [
      {
        id: '6-5-q1',
        question: 'Sticky sessions can hurt availability because?',
        options: [
          'They increase RAM infinitely',
          'If pinned server dies, user loses in-memory session',
          'They remove TLS',
          'They speed DB',
        ],
        correctIndex: 1,
        explanation:
          'Affinity ties fate to one instance.',
      },
      {
        id: '6-5-q2',
        question: 'Preferred alternative for HTTP sessions?',
        options: [
          'Bigger sticky TTL only',
          'Centralized session store or stateless tokens',
          'Disable cookies',
          'FTP',
        ],
        correctIndex: 1,
        explanation:
          'Shared store decouples user from instance.',
      },
      {
        id: '6-5-q3',
        question: 'WebSockets often need?',
        options: [
          'Random UDP',
          'Connection affinity to the node holding the socket',
          'DNS only',
          'No TCP',
        ],
        correctIndex: 1,
        explanation:
          'TCP connection is tied to a process.',
      },
      {
        id: '6-5-q4',
        question: 'Sticky sessions impact horizontal scaling by?',
        options: [
          'Making load perfectly even always',
          'Creating uneven hotspots and complicating draining',
          'Removing health checks',
          'Deleting caches',
        ],
        correctIndex: 1,
        explanation:
          'New nodes get fewer pinned users initially.',
      },
      {
        id: '6-5-q5',
        question: 'External session store allows?',
        options: [
          'Only one server total',
          'Any healthy instance to serve authenticated requests',
          'No TLS',
          'No cookies ever',
        ],
        correctIndex: 1,
        explanation:
          'Session data travels with request via ID/token.',
      },
    ],
  },
  {
    id: 'ssl-tls-termination',
    title: 'SSL/TLS Termination',
    interviewTip:
      'Say: ALB terminates TLS with ACM certs; backends use HTTP on private VPC; use TLS passthrough only for compliance end-to-end.',
    readContent: `# TLS cost

**Handshake** + **bulk crypto** burn **CPU**. Every **new connection** pays **1–2 RTTs** for **session establishment** (unless **resumed**). Offloading **TLS** frees app **CPUs** for business logic.

# Termination at LB

Client ⇄ **TLS** ⇄ **LB** ⇄ **plain HTTP** ⇄ **pod** (inside **VPC**). **Certs** live on LB (**ACM**, **Let us Encrypt**). **Rotation** automated.

# Passthrough

LB forwards **encrypted** stream — backends terminate TLS. LB **cannot** route on **path**. Use when **compliance** demands **no decryption** in middle (sometimes **mutual TLS** everywhere).

# Re-encrypt

LB terminates client TLS, then **new TLS** to backend (**mTLS**). **Double** crypto cost, **defense in depth** for **zero trust** internal meshes.

> IMPORTANT: **Terminate at LB** is standard for **web** stacks; choose **passthrough/mTLS** when policy demands **E2E** encryption visibility.

> INTERVIEW TIP: Mention **SNI**, **cert auto-rotation**, and **HSTS** when hardening.

## Performance

Enable **session tickets**, **HTTP/2**, **OCSP stapling** on edge.

# How this shows up on the job

Load balancers are only as good as **health checks** and **capacity**. You edit **Terraform** for **target groups**, tune **draining** so **in-flight** work finishes, and learn why **one** bad instance stayed **healthy** because **/** was fine but **/api** was not. Incidents trace to **timeout** chains and **retry storms** when half the fleet vanishes. Mention **deregistration delay**, **idle timeout**, and **client retry policy** in designs.

# What to practice next

Write your **timeout cascade**: browser → edge → LB → app → DB. Inner timeouts must be **shorter** than outer so failures **fail fast** with **context** instead of **hanging**.
`,
    quizQuestions: [
      {
        id: '6-6-q1',
        question: 'TLS termination at LB mainly helps backends by?',
        options: [
          'Removing TCP',
          'Offloading crypto CPU and centralizing certificates',
          'Disabling HTTPS clients',
          'Deleting private networks',
        ],
        correctIndex: 1,
        explanation:
          'App servers see cheaper HTTP plaintext internally.',
      },
      {
        id: '6-6-q2',
        question: 'TLS passthrough means?',
        options: [
          'LB decrypts body for logging always',
          'LB forwards ciphertext; backends decrypt',
          'No certificates',
          'Only UDP',
        ],
        correctIndex: 1,
        explanation:
          'Middle box cannot inspect HTTP without breaking crypto.',
      },
      {
        id: '6-6-q3',
        question: 'Re-encrypt to backend adds?',
        options: [
          'Zero CPU',
          'Second TLS leg and more CPU',
          'Infinite bandwidth',
          'Automatic sharding',
        ],
        correctIndex: 1,
        explanation:
          'Trade cost for internal confidentiality.',
      },
      {
        id: '6-6-q4',
        question: 'ACM/Let us Encrypt help with?',
        options: [
          'Disk seeks',
          'Automated certificate issuance and renewal',
          'DNS root operation',
          'BGP tables',
        ],
        correctIndex: 1,
        explanation:
          'Short-lived certs need automation.',
      },
      {
        id: '6-6-q5',
        question: 'Plain HTTP private backend is acceptable when?',
        options: [
          'Over the public Internet untunneled',
          'Inside trusted VPC with network controls after edge TLS',
          'Never in any architecture',
          'Only with FTP',
        ],
        correctIndex: 1,
        explanation:
          'Defense relies on private network + auth, not double TLS everywhere.',
      },
    ],
  },
  {
    id: 'global-load-balancing-geodns',
    title: 'Global Load Balancing & GeoDNS',
    interviewTip:
      'Draw multi-region; use Route 53 latency/geo routing; discuss replication lag and whether writes are regional or multi-master; mention anycast CDNs.',
    readContent: `# Latency math

**Tokyo → Virginia** might be **200+ ms RTT** per **request**. **Chatty** APIs multiply pain. **Users expect** **<200 ms** perceived; physics disagrees unless you **move compute** close.

# GSLB / GeoDNS

**DNS** answers differ by **resolver geography** or **latency probes**: Asian users get **Tokyo** VIP, Europeans **Frankfurt**. **Route 53**, **Cloudflare**, **Akamai** sell this.

# Anycast

Same **IP** announced in **many POPs**; **routing** delivers to **nearest**. **Cloudflare** edge works this way.

# Active-active vs passive

**Active-active** — all regions live, **replicated** data, **conflict** resolution hardest.

**Active-passive** — **DR** region **warm**; simpler **consistency**, worse **latency** for far users.

# Challenges

**Replication lag**, **split-brain**, **compliance** data residency, **cost** (**2–3×** infra), **operational** complexity.

> ANALOGY: **Pizza chain** — you order from the **nearest** kitchen, not **headquarters** three states away.

> NUMBERS: **Same region** **~1–5 ms** RTT data center; **cross continent** **~100–200 ms**. **CDN cache hits** **<10 ms** often. **Multi-region** can **double/triple** spend.

> INTERVIEW TIP: Pair **GeoDNS** with **S3 cross-region replication** / **DynamoDB global tables** story for data.

## Consistency

Choose **single primary region for writes** unless you have **CRDT** / **conflict** stories.

# How this shows up on the job

Load balancers are only as good as **health checks** and **capacity**. You edit **Terraform** for **target groups**, tune **draining** so **in-flight** work finishes, and learn why **one** bad instance stayed **healthy** because **/** was fine but **/api** was not. Incidents trace to **timeout** chains and **retry storms** when half the fleet vanishes. Mention **deregistration delay**, **idle timeout**, and **client retry policy** in designs.

# What to practice next

Write your **timeout cascade**: browser → edge → LB → app → DB. Inner timeouts must be **shorter** than outer so failures **fail fast** with **context** instead of **hanging**.
`,
    quizQuestions: [
      {
        id: '6-7-q1',
        question: 'GeoDNS primarily reduces?',
        options: [
          'CPU cost only',
          'User-to-server network latency by routing to nearby POP/region',
          'Need for TLS',
          'Database normalization',
        ],
        correctIndex: 1,
        explanation:
          'Proximity cuts RTT and improves UX.',
      },
      {
        id: '6-7-q2',
        question: 'Anycast differs from GeoDNS by?',
        options: [
          'Using routing to nearest server with same IP vs DNS returning different IPs',
          'Removing IP addresses',
          'Only SMTP',
          'Disabling TCP',
        ],
        correctIndex: 0,
        explanation:
          'BGP steers flows without per-client DNS customization.',
      },
      {
        id: '6-7-q3',
        question: 'Active-active tradeoff?',
        options: [
          'Zero complexity',
          'Lower global latency but harder data consistency',
          'No redundancy',
          'Cannot use HTTP',
        ],
        correctIndex: 1,
        explanation:
          'Multi-writer conflicts need design.',
      },
      {
        id: '6-7-q4',
        question: 'Cross-region replication introduces?',
        options: [
          'Instant global strong consistency always',
          'Lag windows where reads may be stale',
          'Removal of DNS',
          'Single-threaded CPUs',
        ],
        correctIndex: 1,
        explanation:
          'Speed of light + async replication = delay.',
      },
      {
        id: '6-7-q5',
        question: 'Active-passive DR pattern means?',
        options: [
          'All regions always serve live user traffic',
          'Primary serves; secondary standby for failover',
          'No backups',
          'Only CDN',
        ],
        correctIndex: 1,
        explanation:
          'Simpler but distant users hit primary.',
      },
      {
        id: '6-7-q6',
        question: 'Multi-region cost often?',
        options: [
          'Identical to single region',
          'Higher due to duplicated infra and data transfer',
          'Free on all clouds',
          'Paid only with FTP',
        ],
        correctIndex: 1,
        explanation:
          'Budget for redundancy and egress.',
      },
    ],
  },
];
