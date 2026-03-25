import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_7_TOPICS: Topic[] = [
  {
    id: 'vertical-vs-horizontal-scaling',
    title: 'Vertical vs Horizontal Scaling',
    interviewTip:
      'Always explain scaling as a progression: start vertical for simplicity; when a single instance is exhausted, scale stateless tiers horizontally behind a load balancer; for databases add read replicas first, then consider sharding only when write volume or data size forces it.',
    simulatorDemo: {
      description:
        'Compare scaling one node up versus adding more identical nodes behind a load balancer when traffic exceeds a single service’s comfortable throughput.',
      instruction:
        'First try vertical scaling: select the **Service** node and raise its throughput toward **5000** so it stays green at **1000 req/s** demand — that is **vertical scaling** (more power per box). Reset, set the Service back toward **1000**, then add **four** more **Service** nodes behind the **Load Balancer** so each handles ~**1000 req/s** for **5000** total — that is **horizontal scaling**. Both fix overload; one upgrades a single machine, the other adds machines.',
      simulationAutoStart: true,
      setupNodes: [
        {
          type: 'loadBalancer',
          label: 'Load Balancer',
          position: { x: 100, y: 300 },
          data: { throughput: 50000, latency: 3, capacity: 200000 },
        },
        {
          type: 'service',
          label: 'Service',
          position: { x: 400, y: 300 },
          data: { throughput: 1000, latency: 25, capacity: 5000 },
        },
        {
          type: 'database',
          label: 'Database',
          position: { x: 700, y: 300 },
          data: { throughput: 5000, latency: 10, capacity: 20000 },
        },
      ],
      setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }],
    },
    readContent: `# Vertical vs horizontal scaling

When traffic grows, you only have two fundamental directions: make **one machine bigger** (**vertical scaling**, “scale up”) or add **more machines of roughly the same size** (**horizontal scaling**, “scale out”). Everything else—replicas, shards, regions—is a variation on those ideas combined with networking and data placement.

## Vertical scaling (scale up)

**Vertical scaling** means giving a **single host** more **CPU**, **RAM**, faster **disk**, or **network** bandwidth. You are still running **one** logical instance of the database or app server; it just has a higher ceiling. Operationally it feels like a **swap-in upgrade**: same hostname, same process layout, bigger limits.

**Advantages:** often **no application changes** for monolithic stateful databases; **no distributed systems** semantics for that tier; **simpler** mental model and ops (one place to patch, one place to watch). Many **relational** workloads scale surprisingly far vertically before you need exotic partitioning—especially when **reads** dominate and **replicas** help.

**Disadvantages:** you hit a **hardware ceiling** (there is always a biggest instance in a cloud region). You keep a **single point of failure** unless you add redundancy separately. **Cost** often grows **superlinearly** at the top end (the largest SKUs are priced for buyers who have no alternative). **Maintenance windows** for disk/CPU upgrades can mean **downtime** unless you have HA pairs.

## Horizontal scaling (scale out)

**Horizontal scaling** adds **more nodes** that each run a slice of the work (or identical **stateless** copies behind a load balancer). Total capacity is the **sum** (minus overhead) of the fleet.

**Advantages:** in theory you can keep **adding** commodity boxes until economics or coordination breaks. You get **redundancy by default**—lose one instance, others continue. **Cost** tracks **linearly** with small instances more often than with one “monster” box. **Elastic** fleets can track **diurnal** traffic if your platform supports quick add/remove.

**Disadvantages:** the **application** must tolerate distribution—usually **stateless** app tiers, **externalized** sessions, **idempotent** APIs, **load balancers**, **service discovery**, and careful **data** placement. **Partial failures**, **network partitions**, and **consistency** become everyday design constraints. Not every workload **parallelizes** (big single-threaded jobs, heavy cross-row transactions).

## How real teams combine them

Most production systems use **both**: **vertical** for the **primary database** until **replicas** and **sharding** enter the picture; **horizontal** for **stateless** APIs and workers. The **startup journey** is a cliché because it is true: **one server** → **bigger server** → **multiple app servers + load balancer** → **read replicas** → **sharding or specialized stores** → **multi-region** when **latency and availability** demand it.

> ANALOGY: **Vertical** scaling is like giving **one** person a better laptop, more monitors, and stronger coffee—they can do more per hour, but one human still has a ceiling. **Horizontal** scaling is like **hiring more people**—total throughput can grow with headcount, but you need **coordination** (standups, managers, shared tools). One expert can carry a prototype; a company needs **process**.

> NUMBERS: On **AWS**, instance sizes span from roughly **t3.micro** (**1 vCPU**, **1 GiB RAM**, on the order of **~$8/month** in many regions) to monster metal such as **u-24tb1.metal** (**448 vCPUs**, **24 TiB RAM**, on the order of **~$200k/month**—pricing moves with region and contract). Moving within a **family** (e.g. **t3.small** → **t3.2xlarge**) is often roughly **linear** in both **price** and **resources**. Jumping to the **largest** SKUs is where **cost** explodes—**1000×** spend for **nowhere near** **1000×** practical **headroom** once you factor **IO** and **software** limits.

> INTERVIEW TIP: Frame answers as a **progression**: “We **scale vertically** first for **simplicity**; when the **stateless** tier saturates, we **scale horizontally** behind an **LB**; for **read-heavy** DB access we add **read replicas**; we only **shard** when **writes** or **dataset size** force it.”

## Cost and failure modes

Vertical scaling can be the **right** trade when **coordination cost** exceeds **hardware cost**. Horizontal scaling shines when you need **fault isolation** and **elasticity**. In interviews, tie choices to **metrics**: **CPU**, **memory pressure**, **p99 latency**, **error rate**, **connection counts**, and **data growth**.

## What to watch in production

Capacity planning should include **burst** multipliers (often **3–10×** short peaks vs daily averages), **deployment** overhead (draining connections), and **dependencies** (a bigger app server can **overwhelm** a small database). Scaling is never “just add RAM”—it is **holistic** system tuning.

## Interview deep-dive prompts

Interviewers love follow-ups: “**When would you refuse to scale horizontally?**” (legacy stateful sessions, licensing constraints, GPU-bound single-threaded workloads). “**How do you pick instance sizes?**” (measure p95 CPU, memory working set, network saturation—**right-size** with load tests, not guesses). “**What breaks first when you scale up a database?**” (often **IOPS** or **replication lag**, not CPU). Practice narrating a **concrete** migration: **t3.small** struggling at **2k RPS** → **scale up** to **t3.2xlarge** for breathing room → **add ALB + N stateless nodes** when CPU is fine but **connection** or **availability** demands grow. Numbers do not need to be perfect—they need to show **structured thinking** and awareness of **cloud ceilings** and **cost cliffs**.
`,
    quizQuestions: [
      {
        id: '7-1-q1',
        question:
          'Which statement best describes vertical scaling?',
        options: [
          'Adding more identical servers behind a load balancer',
          'Increasing CPU, RAM, disk, or network on a single machine',
          'Sharding a database across regions',
          'Replacing HTTP with UDP',
        ],
        correctIndex: 1,
        explanation:
          'Vertical scaling upgrades the capacity of one host rather than adding more hosts.',
      },
      {
        id: '7-1-q2',
        question: 'A major disadvantage of vertical scaling at the cloud extreme is:',
        options: [
          'It always requires sharding',
          'Hardware ceilings, superlinear top-end cost, and still a single-node failure domain without HA',
          'It forbids load balancers',
          'It eliminates the need for monitoring',
        ],
        correctIndex: 1,
        explanation:
          'Even the largest instance is bounded, expensive, and often still one failure domain unless paired with replication or failover.',
      },
      {
        id: '7-1-q3',
        question: 'Horizontal scaling of web traffic usually requires:',
        options: [
          'Sticky DNS with no health checks',
          'Stateless application instances and externalized session data',
          'Disabling TLS',
          'A single global mutex',
        ],
        correctIndex: 1,
        explanation:
          'Requests must be routable to any instance; local session state breaks random routing unless externalized or stickied (with downsides).',
      },
      {
        id: '7-1-q4',
        question:
          'Why can horizontal scaling be more cost-effective at large scale?',
        options: [
          'It removes the need for databases',
          'Commodity-sized instances often scale cost closer to linearly than one ultra-large SKU',
          'It eliminates network traffic',
          'It guarantees strong consistency automatically',
        ],
        correctIndex: 1,
        explanation:
          'Many small boxes are priced more competitively per unit capacity than the largest premium instances.',
      },
      {
        id: '7-1-q5',
        question:
          'Which progression matches a common startup scaling story?',
        options: [
          'Multi-region first, then one laptop',
          'Single server → larger server → horizontal app tier with LB → DB replicas → sharding / advanced data tiers',
          'Immediate infinite sharding on day one',
          'Only vertical scaling forever with no redundancy',
        ],
        correctIndex: 1,
        explanation:
          'Teams grow tiers as load and complexity demand—vertical first for simplicity, then horizontal for stateless tiers, then data scaling patterns.',
      },
      {
        id: '7-1-q6',
        question:
          'Sticky sessions as the primary session strategy for horizontal scaling:',
        options: [
          'Is always superior to external session stores',
          'Can defeat even load distribution and still lose sessions if an instance dies',
          'Eliminates load balancers',
          'Guarantees serializable transactions',
        ],
        correctIndex: 1,
        explanation:
          'Sticky routing reduces flexibility; sessions should live in Redis or similar for true horizontal elasticity.',
      },
    ],
  },
  {
    id: 'why-horizontal-requires-statelessness',
    title: 'Why Horizontal Scaling Requires Statelessness',
    interviewTip:
      'State explicitly: “Our API tier is stateless—sessions and carts live in Redis/DB; JWTs are validated without server memory.” If something is stateful today, describe the migration plan (externalize, sticky-only-as-bridge).',
    readContent: `# Why horizontal scaling requires statelessness

**Horizontal scaling** means the **load balancer** can send **each request** to **any** healthy instance. That only works if **no instance** holds **private** information about a user that other instances cannot see. If important state lives **in local memory** on **Server A**, then **Server B** is blind—and your system is not truly horizontally elastic.

## What “state” means here

**State** is anything **user-specific** or **request-specific** that survives beyond a single handler invocation **and** is stored **locally** on a machine: **sessions**, **shopping carts**, **auth context** held only in RAM, **per-server caches** of profile data, **temporary files**, **in-memory rate limits**, or **local** feature flags. None of these are forbidden—they just **cannot** be **trapped** on one host if you want **free routing**.

## The stateful server failure mode

Imagine **Server A** stores a **session** after login. The next click goes to **Server B**. **B** has **no session**—the user looks **logged out** even though they authenticated. The same bug shows up for **carts**, **partial uploads**, and **per-node locks**. The LB is doing its job; **your architecture** broke **affinity expectations**.

## Sticky sessions: a bandage

**Sticky sessions** (session affinity) route **all** of a user’s requests to the **same** backend. That **masks** local state—but at a cost: **hot spots** (uneven load), **weaker failover** (that server dies, session dies), and **harder canary** and **autoscaling** (new nodes do not pick up old stickiness cleanly). Sticky can be a **bridge** during migration, not the **end state** for high-growth systems.

## Externalize everything important

Production pattern: **sessions** → **Redis** or your **primary database**; **carts** → **Redis**/SQL; **auth** → **signed JWTs** (stateless verification) plus short-lived tokens or server-side revocation lists as needed; **uploads** → **object storage** (e.g. **S3**); **counters** → **Redis atomic** ops or **DB** rows; **ephemeral compute** → still backed by **durable** metadata elsewhere.

With **externalized** state, instances become **interchangeable**. You can **kill** one, **add ten**, or **roll** a deploy without **migrating RAM**.

## Twelve-Factor thinking

**Twelve-Factor App**, factor **VI** (**processes**): run the app as **stateless** processes; persistence belongs in **backing services**. That philosophy aligns directly with **horizontal scale**.

> ANALOGY: Think of servers as **call-center agents** with an identical **CRM**. If each agent scribbles notes on a **private notepad**, customers must always reach the **same** agent. If everyone uses the **shared CRM**, **any** agent can continue the case—**that** is how you scale to **hundreds** of agents tomorrow.

> IMPORTANT: The **number one** blocker for horizontal scaling is **local state**. Before scaling out, **audit** RAM, local disk, and **per-node** caches. Move durable or shared concerns to **Redis**, **SQL**, or **object storage**.

> INTERVIEW TIP: Say it plainly: “**Stateless services**; **Redis** for session; **JWT** for transport claims; **S3** for blobs.” Interviewers listen for **intentional** state placement.

## Operations benefits

Stateless tiers simplify **auto-scaling**, **blue/green** deploys, and **chaos** drills—any instance is **fungible**. Stateful tiers (databases, queues) still exist; they get **replication**, **backups**, and **failover**, not random **round-robin**.

## When local state is acceptable

**Purely derived** caches can live in memory **if** they can be **rebuilt** after restart and **mis-routing** only causes **misses**, not **wrong answers**. Still prefer **central** caches for **coherency** at scale.

## Closing thought

**Horizontal scaling** is not a **feature flag**—it is a **contract** between **traffic routing** and **data location**. Meet that contract and your fleet can grow; violate it and you will fight **mysterious** logouts and **ghost** carts forever.

## Interview deep-dive prompts

Expect: “**Where do you store sessions?**” Answer **Redis** with **TTL**, **encryption at rest**, **VPC isolation**, and **failover**. “**What about sticky sessions?**” Acknowledge **affinity** trade-offs—**hot spots**, **failover** loss—then pivot to **external** stores. “**JWT vs server sessions?**” Discuss **revocation** (**short TTL**, **refresh tokens**, **denylist** for compromise). Show you can **audit** a codebase for **local disk**, **/tmp** uploads, **per-node** caches, and **in-memory** rate limits—those are the **silent** blockers that keep teams from scaling out even after they buy bigger machines.
`,
    quizQuestions: [
      {
        id: '7-2-q1',
        question:
          'Why does storing sessions only in a server’s local memory break horizontal scaling?',
        options: [
          'Because HTTP forbids cookies',
          'Because other instances cannot see that session on subsequent requests',
          'Because load balancers cannot parse JSON',
          'Because TLS uses too much CPU',
        ],
        correctIndex: 1,
        explanation:
          'Without shared session storage or sticky routing, another instance has no session context.',
      },
      {
        id: '7-2-q2',
        question: 'Sticky sessions primarily mitigate:',
        options: [
          'SQL injection',
          'Local session affinity requirements by pinning users to one backend',
          'DNS TTL issues',
          'Disk fragmentation',
        ],
        correctIndex: 1,
        explanation:
          'Stickiness keeps a user on the server that holds their local session—but creates load imbalance and weaker failover.',
      },
      {
        id: '7-2-q3',
        question: 'Which is a good external home for short-lived session data at scale?',
        options: [
          'A random text file in /tmp on one web server',
          'A shared datastore like Redis or a database designed for fast lookups',
          'Only browser localStorage with no server validation',
          'Environment variables on one container',
        ],
        correctIndex: 1,
        explanation:
          'Central stores let any app instance validate and load session state.',
      },
      {
        id: '7-2-q4',
        question: 'JWT access tokens (properly signed and validated) help because:',
        options: [
          'They remove the need for HTTPS',
          'Verification can occur without server-side session RAM per request (with tradeoffs around revocation)',
          'They guarantee exactly-once delivery',
          'They replace databases',
        ],
        correctIndex: 1,
        explanation:
          'Cryptographic validation enables stateless verification though revocation and rotation must still be designed.',
      },
      {
        id: '7-2-q5',
        question: 'Twelve-Factor “stateless processes” implies:',
        options: [
          'No databases allowed',
          'Persist shared data in backing services, not local ephemeral filesystems as the source of truth',
          'Only one process globally',
          'No caching',
        ],
        correctIndex: 1,
        explanation:
          'Durability belongs in managed stores; processes remain disposable.',
      },
      {
        id: '7-2-q6',
        question:
          'After externalizing sessions, horizontal scaling gains:',
        options: [
          'Guaranteed strong consistency across the globe automatically',
          'Interchangeable instances that any load balancer can route to',
          'Removal of all need for databases',
          'Automatic GDPR compliance',
        ],
        correctIndex: 1,
        explanation:
          'Shared session storage (or stateless tokens) restores routing freedom.',
      },
    ],
  },
  {
    id: 'database-read-replicas',
    title: 'Database Read Replicas',
    interviewTip:
      'On read-heavy workloads: “Primary for writes; N replicas for reads; async replication with typical lag under ~100ms; read-your-writes for profile reads after update.”',
    simulatorDemo: {
      description:
        'Show a primary database hot on writes and reads, then distribute read load across replicas while the primary keeps writes.',
      instruction:
        'Run the simulation: the **Service** stresses the **Primary DB**. Pause, add **Read Replica 1** and **Read Replica 2** and connect the **Service** to all three databases. Start again—read load spreads while the primary still owns writes in your mental model. Notice how **replicas** protect **read throughput** even when the **primary** is busy.',
      simulationAutoStart: true,
      setupNodes: [
        {
          type: 'loadBalancer',
          label: 'Load Balancer',
          position: { x: 0, y: 250 },
          data: { throughput: 50000, latency: 3, capacity: 200000 },
        },
        {
          type: 'service',
          label: 'Service',
          position: { x: 300, y: 250 },
          data: { throughput: 10000, latency: 25, capacity: 50000 },
        },
        {
          type: 'database',
          label: 'Primary DB',
          position: { x: 600, y: 100 },
          data: { throughput: 2000, latency: 10, capacity: 10000 },
        },
        {
          type: 'database',
          label: 'Read Replica 1',
          position: { x: 600, y: 250 },
          data: { throughput: 2000, latency: 10, capacity: 10000 },
        },
        {
          type: 'database',
          label: 'Read Replica 2',
          position: { x: 600, y: 400 },
          data: { throughput: 2000, latency: 10, capacity: 10000 },
        },
      ],
      setupEdges: [
        { source: 0, target: 1 },
        { source: 1, target: 2 },
        { source: 1, target: 3 },
        { source: 1, target: 4 },
      ],
    },
    readContent: `# Database read replicas

Most internet workloads are **read-heavy**: **80–95%** of queries are **SELECTs**. A single **primary** database that serves **both** reads and writes can become **contended**—**locks**, **buffer pool** churn, and **CPU** spent parsing similar queries repeatedly. **Read replicas** offload **read traffic** while keeping **writes** on one **primary**.

## What a replica is

A **read replica** is a **copy** of the dataset that accepts **read-only** queries. **Writes** go to the **primary** (leader). Changes stream from the primary’s **log** (**WAL** in **PostgreSQL**, **binlog** in **MySQL**) to replicas that **apply** the same operations in order—**streaming replication**.

## Throughput intuition

If **5%** of operations are writes and **95%** are reads, the primary still must **durably commit** writes, but **read replicas** shrink **per-node read QPS**. With **three** balanced replicas, each might see roughly **a third** of read traffic—dramatically lowering **hot** CPU and **IO** on any single reader.

## Replication lag and stale reads

Replication is usually **asynchronous**: a transaction commits on the primary **before** every replica applies it. That gap is **replication lag**—often **milliseconds**, sometimes **seconds** under load or network issues. Users can **write** then **read** a stale row from a replica: “I updated my name but still see the old one.”

### Mitigations

- **Read-your-writes**: after a user **mutates** data, route their **subsequent reads** to the **primary** (or a **fresh** replica) for a short **window** or until a **version** matches.
- **Causal** or **session** consistency patterns if the datastore supports them.
- **Synchronous** replication to some/all replicas for stronger guarantees—at the cost of **latency** and **availability** tradeoffs (classic **CAP** tension).

## Failover and HA

If the **primary** dies, a **replica** can be **promoted** to **primary**—foundation of **RDS Multi-AZ**, **Patroni**, **Galera** variants, etc. That is a different problem than **read scaling**, but the same **replica** technology enables it.

> ANALOGY: The **primary** is the **professor** lecturing; **replicas** are students **taking notes**. Everyone **eventually** matches, but ask a student **too soon** after a new slide and their notebook might **lag**—that is **replica lag**.

> NUMBERS: **PostgreSQL** streaming lag is often **<100 ms** in healthy LAN/regional links; **spikes** to **1–10 s** happen under **heavy write** load, **vacuum**/maintenance, or **network** issues. **AWS RDS** commonly allows **up to five** read replicas per **MySQL/Postgres** primary in many configurations—check current service limits. A well-sized replica often delivers a large fraction of a primary’s **read** throughput—planning at **~80%** of primary read capacity per replica is a reasonable **back-of-envelope** when instances match.

> INTERVIEW TIP: Say: “**Async replicas** → **eventual consistency**; **p95/p99 lag** monitored; **read-your-writes** for **self-profile** reads after updates.”

## When replicas do not help

**Write-bound** problems (hot **rows**, **monotonic** counters) need **sharding**, **queueing**, or **architecture** changes—not more readers. **Strongly consistent** read-after-write globally needs **different** stores or **sync** models.

## Operational checklist

Monitor **lag** seconds, **replica IOPS**, **disk** free space, and **replay** errors. Alert when **lag** breaks **SLA** for **product** flows. Test **promotion** drills.

Read replicas are **not** a magic cache—they are **consistent-enough copies** that let you **scale reads** and **improve availability** when paired with **runbooks** and **client routing** smarts.

## Interview deep-dive prompts

Be ready to sketch **write path vs read path** routing—**ORM** middleware that sends **SELECTs** to replicas but **INSERT/UPDATE** to primary, or **CQRS-lite** services. Discuss **replica lag monitoring** (**seconds behind primary**), **application-level** **read-your-writes** for **profile** pages, and **global** systems where **regional** replicas plus **routing** matter. Mention **failover**: **RTO/RPO** targets, **automatic promotion**, **connection pool** **drain**. If asked about **strong consistency**, explain why **sync replicas** hurt **availability**—tie to **CAP** intuition without sounding like a textbook.
`,
    quizQuestions: [
      {
        id: '7-3-q1',
        question: 'Where do writes go in a primary/replica setup?',
        options: [
          'Only to read replicas',
          'To the primary (writer) database',
          'Round-robin across all replicas',
          'To the load balancer',
        ],
        correctIndex: 1,
        explanation:
          'Replicas serve reads; the primary accepts writes (with variants like multi-writer being special cases).',
      },
      {
        id: '7-3-q2',
        question: 'Replication lag primarily causes:',
        options: [
          'Faster writes',
          'Stale reads on replicas compared with the latest primary commit',
          'Automatic sharding',
          'Loss of all writes',
        ],
        correctIndex: 1,
        explanation:
          'Asynchronous replication means replicas can trail the primary.',
      },
      {
        id: '7-3-q3',
        question: 'Read-your-writes consistency means:',
        options: [
          'All users worldwide see writes instantly',
          'After a user writes, their subsequent reads reflect that write (often by reading the primary or a fresh source)',
          'Deletes are forbidden',
          'Replicas never lag',
        ],
        correctIndex: 1,
        explanation:
          'It ties session reads to recent writes for the same actor.',
      },
      {
        id: '7-3-q4',
        question: 'Promoting a replica when the primary fails is mainly about:',
        options: [
          'Caching images',
          'High availability and disaster recovery',
          'Removing TLS',
          'Compiling code faster',
        ],
        correctIndex: 1,
        explanation:
          'Promotion continues write availability using a standby that caught up as much as possible.',
      },
      {
        id: '7-3-q5',
        question:
          'If 95% of traffic is reads and you add three balanced read replicas, each replica roughly handles:',
        options: [
          '95% of all traffic alone',
          'About one-third of read traffic (plus primary still handles writes)',
          '0% of traffic',
          '100% of writes',
        ],
        correctIndex: 1,
        explanation:
          'Reads split across replicas; writes still hit the primary.',
      },
      {
        id: '7-3-q6',
        question: 'Streaming replication applies changes by:',
        options: [
          'Deleting the database nightly',
          'Reading the primary’s log and replaying operations on replicas',
          'Random UDP packets',
          'Disabling indexes',
        ],
        correctIndex: 1,
        explanation:
          'Log shipping/replay keeps replicas aligned with the primary’s committed order.',
      },
    ],
  },
  {
    id: 'database-sharding',
    title: 'Database Sharding',
    interviewTip:
      'Lead with shard key rationale (hash vs range vs tenant), acknowledge cross-shard query pain, mention rebalancing and consistent hashing when clusters grow. Say “we’d avoid sharding until replicas and vertical headroom are exhausted.”',
    readContent: `# Database sharding

**Sharding** splits one logical database into **multiple physical databases** (**shards**), each holding a **subset** of rows. Think of splitting a **phone book** into **A–M** and **N–Z** volumes—lookup by last name routes to **one** volume, but **cross-volume** research needs **two** stops.

## Why shard

Shard when **one** database **cannot** absorb **write** throughput, when **dataset size** exceeds **comfortable** operational limits on one host, or when **data residency** rules require **geographic** placement. **Read replicas** help **read** scale; they **do not** multiply **write** capacity for a **single** primary handling **all** writes for a hot table.

## Shard keys

The **shard key** decides **which shard** owns a row—usually a **high-cardinality** column like **user_id**, **tenant_id**, or **order_id**. Bad keys cause **hot shards** (one celebrity tenant) or **uneven** growth.

### Strategies

1. **Range**: consecutive keys live together—**great** for range scans, **risky** for hotspots (time-series **append** to latest range).
2. **Hash**: **hash(key) mod N** or **consistent hashing**—**even** spread; **range** queries may require **scatter/gather** across **all** shards.
3. **Geography**: **EU** users on **EU** shards for **latency** and **compliance**.
4. **Tenant**: **enterprise SaaS** sometimes places **big customers** on **dedicated** shards.

## Hard problems

- **Cross-shard joins** are **expensive** or **disallowed**—you **denormalize**, **precompute**, or **fan out** queries.
- **Rebalancing** when shards grow requires **online** moves—risky, tool-heavy work.
- **Foreign keys** do not span shards—**application** code enforces **invariants**.
- **Hot spots** need **special** routing or **sub-sharding**.
- **Operations** multiply: **backups**, **migrations**, **monitoring** per shard.

## Consistent hashing

When the **shard count** changes, naive **hash mod N** **remaps** most keys. **Consistent hashing** limits movement to roughly **1/N** of keys when adding/removing a node—critical for **caches** and **distributed** stores (**DynamoDB**, **Cassandra**-style rings).

> ANALOGY: Sharding is **branch libraries** by category—fast local lookups, but a project needing **both** **science** and **history** walks **two** buildings—your **cross-shard** query.

> IMPORTANT: **Sharding is a last resort** for many products. **Vertical scale**, **read replicas**, **caching**, and **archival** buy **years**. Many businesses never **need** user-defined sharding on relational stores—**managed** services auto-partition under the hood.

> NUMBERS: Comfortable **PostgreSQL** sizes often land **500 GB–2 TB** for many teams before pain; beyond **5–10 TB** on one host, **operational** drag rises. **DynamoDB** partitions **~10 GB** chunks (service-managed). **MongoDB** sharding depends on your **shard key** and **chunk** splits—design early if you know you will shard.

> INTERVIEW TIP: Always discuss **shard key** tradeoffs, **cross-shard** workflows, and **rebalancing**. If the prompt is **modest** scale, say you would **not** shard yet—**judgment** scores points.

## When not to shard

If **replicas** + **cache** + **better queries** solve **hot reads**, stop. If **writes** are modest, **bigger** hardware or **partitioned tables** inside one engine may suffice.

## Migration path

Start with **clear bounded contexts**, **read paths** that can **fan out**, **idempotent** writes, and **observability** per shard. **Dual-write** or **change-data-capture** migrations are common patterns—never **big bang** without **rollback**.

Sharding turns a **database problem** into a **distributed systems** problem—use it when benefits clearly outweigh **complexity**.

## Interview deep-dive prompts

You may be asked to **pick a shard key** for a **multi-tenant SaaS** app—often **tenant_id** with **dedicated** shards for whales. For **social graphs**, naive **user_id** hashing works until **celebrity** hot spots—mitigate with **separate** routing, **sub-sharding**, or **caching**. Discuss **resharding**: **dual-write**, **CDC**, **backfill**, **verification** jobs. Show restraint: “**We would try replicas + caching first**—**sharding** only when **write** **IOPS** or **disk** **size** force it.” That sentence signals **senior judgment**.
`,
    quizQuestions: [
      {
        id: '7-4-q1',
        question: 'What is the primary purpose of a shard key?',
        options: [
          'To encrypt backups',
          'To determine which shard stores a given row',
          'To replace TCP',
          'To measure CPU',
        ],
        correctIndex: 1,
        explanation:
          'The shard key routes data to the correct partition.',
      },
      {
        id: '7-4-q2',
        question: 'Cross-shard joins are often painful because:',
        options: [
          'HTTP/2 forbids them',
          'They require fan-out, denormalization, or application-level coordination',
          'They are always free',
          'They run only on Fridays',
        ],
        correctIndex: 1,
        explanation:
          'Distributed joins lack single-node foreign-key enforcement and are expensive.',
      },
      {
        id: '7-4-q3',
        question: 'Range-based sharding can suffer from:',
        options: [
          'Hot shards when new data always lands in the same range',
          'Perfect even distribution in every workload automatically',
          'Eliminating all indexes',
          'Removing replication lag',
        ],
        correctIndex: 0,
        explanation:
          'Append-only time-series patterns can concentrate load on the latest range.',
      },
      {
        id: '7-4-q4',
        question: 'Consistent hashing mainly helps with:',
        options: [
          'Making DNS faster',
          'Minimizing key remapping when cluster membership changes',
          'Eliminating the need for TLS',
          'Guaranteeing ACID across unrelated databases',
        ],
        correctIndex: 1,
        explanation:
          'Only a fraction of keys move when nodes join/leave a ring.',
      },
      {
        id: '7-4-q5',
        question: 'Read replicas alone do not solve:',
        options: [
          'Read scaling for SELECT-heavy workloads',
          'Primary write throughput limits for a single hot write path',
          'Geographic read locality if placed in-region',
          'Serving stale data for some queries',
        ],
        correctIndex: 1,
        explanation:
          'All writes still hit the writer; replicas multiply read capacity, not single-primary write ceiling.',
      },
      {
        id: '7-4-q6',
        question: 'Tenant-based sharding is attractive when:',
        options: [
          'Every query joins 50 unrelated tenants',
          'Large customers need isolation, noisy-neighbor control, or per-tenant SLAs',
          'You want infinite cross-tenant foreign keys',
          'You cannot use backups',
        ],
        correctIndex: 1,
        explanation:
          'Per-tenant shards isolate blast radius and capacity.',
      },
    ],
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    interviewTip:
      'Draw the ring, explain clockwise ownership, why virtual nodes balance load, and that only ~1/N keys move on membership change—classic senior cache/partition question.',
    readContent: `# Consistent hashing

**Distributed caches**, **sharded databases**, and **peer** storage systems need a **stable** way to map **keys** to **nodes**. Naive **hash(key) mod N** is simple until **N changes**—then **most** keys **move**, causing **cache stampedes**, **thundering herds**, and **massive** data migration.

## The problem with mod N

With **10** nodes, **hash mod 10** spreads keys evenly—great. Add **one** node (**11** total). **mod 11** remaps roughly **10/11** of keys—**~90%** churn when you wanted a **small** adjustment. The same issue hits **removals**.

## Consistent hashing idea

Map both **nodes** and **keys** onto a **ring** (conceptually **0..2³²−1**). Hash each **node id** to a point; hash each **key** to a point. Walk **clockwise** from the key’s position to the **first** node—**that** node owns the key. When a **node joins**, it **splits** a **segment** of the ring with its **neighbor**—only keys in that arc **move**. When a node **leaves**, its **arc** merges to the **next** clockwise node—again **local** movement. **Expected** fraction of moved keys ≈ **1/N**—far better than **almost all**.

## Virtual nodes

One **physical** node at one **ring position** can get **unlucky**—**light** load if its arc is tiny, **heavy** if huge. Real systems assign **100–200+ virtual nodes** per physical host at **random** positions on the ring to **smooth** distribution and **speed** recovery when a machine disappears.

## Implementation notes

Maintain the ring as a **sorted** structure for **O(log N)** lookup. Use **well-distributed** hash functions (**Murmur**, **xxHash**, **SHA** family truncations—choices depend on **security** vs **speed**). Tune **virtual node count** vs **memory** for **metadata**.

## Where you meet it

**Amazon Dynamo**-family systems, **Cassandra**, **Riak**, many **CDNs**, **Discord**-style routing, **Memcached** client libraries, and **service mesh** subsets for **subset** load balancing—all borrow the **ring** metaphor.

> ANALOGY: Picture a **circular track** divided into **ownership arcs**. A new runner **splits** **one** arc instead of **everyone** **reshuffling** lanes—**minimal** disruption.

> NUMBERS: **Mod** hash with **10→11** nodes can remap **~90%** of keys. **Consistent hashing** often moves **~1/10** (**~10%**) when one of ten nodes joins. **200** virtual nodes per physical node commonly keeps **skew** low—often **under ~5%** variance versus naive single-point placement in many simulations.

> INTERVIEW TIP: Mention **virtual nodes**, **clockwise** ownership, and **1/N** movement—then connect to **caches** or **Kafka** partition leadership if relevant.

## Limits

Consistent hashing **does not** solve **hot keys**—a **viral** object still **overloads** one node without **application**-level **splitting** or **replication** of **hot** items.

## Takeaway

When **membership** changes **often** or **elasticity** matters, **consistent hashing** is the standard **mental model** for **minimal churn**—pair it with **operational** playbooks for **rebalancing** hotspots.

## Interview deep-dive prompts

Interviewers love a **whiteboard ring**: hash **nodes**, hash **keys**, walk **clockwise**. **Contrast** with **mod N** reshuffling. Explain **virtual nodes** smoothing **skew**. Tie to **Dynamo**, **Cassandra**, **Memcached** **ketama** clients. If asked about **hot keys**, admit **consistent hashing** does not solve **viral** popularity—**cache** **replication**, **application-level** **sharding**, or **separate** **hot** **key** **stores** are needed. Mention **operational** **rebalancing** when **adding** **datacenters**—**multi-ring** or **tiered** **routing** strategies show **real-world** experience.
`,
    quizQuestions: [
      {
        id: '7-5-q1',
        question: 'Why does simple hash(key) mod N cause large remaps when N changes?',
        options: [
          'Because hashes are always constant',
          'Because the modulus changes, altering most bucket assignments',
          'Because TLS renegotiates',
          'Because databases forbid COUNT(*)',
        ],
        correctIndex: 1,
        explanation:
          'A different modulus reshuffles nearly all remainders.',
      },
      {
        id: '7-5-q2',
        question: 'On a hash ring, a key’s home is typically:',
        options: [
          'The farthest counterclockwise server',
          'The first server encountered clockwise from the key’s position',
          'Always the lowest IP address globally',
          'Chosen by DNS TTL',
        ],
        correctIndex: 1,
        explanation:
          'Clockwise walk from hashed key to next node defines ownership.',
      },
      {
        id: '7-5-q3',
        question: 'Virtual nodes exist primarily to:',
        options: [
          'Remove encryption',
          'Balance load and reduce skew by giving each physical node multiple ring positions',
          'Disable monitoring',
          'Guarantee SQL joins',
        ],
        correctIndex: 1,
        explanation:
          'Many virtual replicas smooth arc sizes across physical machines.',
      },
      {
        id: '7-5-q4',
        question: 'When a new node joins a consistent hash ring, roughly what fraction of keys move?',
        options: [
          '100% always',
          'About 1/N of keys (expected), not almost all',
          '0% always',
          'Exactly 50% always',
        ],
        correctIndex: 1,
        explanation:
          'Only keys in the affected arc relocate—on average ~1/N.',
      },
      {
        id: '7-5-q5',
        question: 'A real-world use of consistent hashing includes:',
        options: [
          'Compiling TypeScript',
          'Distributed caches and databases like Dynamo/Cassandra-style partitioning',
          'Printing invoices only',
          'RGB color selection',
        ],
        correctIndex: 1,
        explanation:
          'Ring hashing underpins many distributed storage systems.',
      },
      {
        id: '7-5-q6',
        question: 'Consistent hashing does NOT automatically solve:',
        options: [
          'Membership changes with less data movement',
          'Hot keys that overload a single node',
          'Elastic ring operations conceptually',
          'Partitioning keys across nodes',
        ],
        correctIndex: 1,
        explanation:
          'Popular keys can still skew load; needs app-level sharding/replication strategies.',
      },
    ],
  },
  {
    id: 'cdn-content-delivery',
    title: 'CDN & Content Delivery',
    interviewTip:
      'For global users or static assets: “CDN at the edge, high cache hit ratio, Cache-Control/s-maxage, versioned URLs, purge API for emergencies.” Mention edge compute when personalization must be fast.',
    readContent: `# CDN — content delivery networks

A **CDN** is a **network of edge caches** (**PoPs**—Points of Presence) that serve **content** close to users. Instead of every **request** crossing an **ocean** to your **origin**, repeat visitors hit a **nearby** edge **POP**—often cutting **RTT** from **hundreds of milliseconds** to **single digits** for cached payloads.

## The latency problem

A user in **Tokyo** fetching a **1 MB** image from **Virginia** pays **propagation delay** **round-trip** often **~150–250 ms** before **bytes** even flow steadily—plus **TCP slow start**. A **Tokyo** edge already holding the object can deliver over **last-mile** in **~5–20 ms** typical **TTFB** for cache hits—**orders of magnitude** better **user** experience.

## Request flow (pull CDN)

1. Browser requests **https://cdn.example.com/image.jpg**.
2. **DNS** returns an **anycast** or **geo-steered** IP for a **nearby** edge.
3. Edge checks **cache**:
   - **HIT**: return immediately with **200** + **Age**/**CDN-Cache** headers.
   - **MISS**: edge **fetches** from **origin**, **stores** per **TTL**, returns to client.
4. Subsequent nearby users **hit** cache until **TTL** expires or **purge** happens.

## Push vs pull

**Pull** (**origin on miss**): **lazy**, **automatic**, great for **web** assets—**first** user pays **miss**, **others** ride the **HIT**.

**Push** (**preloaded**): you **upload** **large** **video** **mezzanines** or **release** **binaries** to **all** regions—**predictable**, **higher** **ops** **work**, **strong** control for **massive** files.

## What belongs on a CDN

**Static** assets: **images**, **JS**, **CSS**, **fonts**, **video** segments, **software** downloads, **PDFs**, **marketing** pages. **Cacheable** **API** responses with **careful** **auth** (**signed URLs**, **short TTL**).

## What to avoid caching blindly

Highly **personalized** **HTML**, **private** **account** data without **token** **scoping**, **live** **data** that must be **fresh**, **write** operations—unless you architect **edge** **compute** with **correct** **authorization**.

## Invalidation

**Versioned** filenames (**app.v2.js**) let **immutable** **long TTL** without **purge** **storms**. **Purges** by **URL**, **prefix**, or **tag** for **mistakes**. **Stale-while-revalidate** improves **perceived** **speed** while **refreshing** **async**.

## Cache-Control recap

**max-age**: browser cache; **s-maxage**: **shared** caches (CDN). **no-store** for **secrets**. **no-cache** forces **revalidation**. Combine **CDN** headers with **origin** **Cache-Control** deliberately—**misconfigured** **private** pages on **public** edges are **security** **incidents**.

## Edge compute

**Cloudflare Workers**, **Lambda@Edge**, **CloudFront Functions**—run **auth**, **A/B**, **geo routing**, **light** **transforms** at **edge** **latency**.

> ANALOGY: **Origin** is the **central kitchen**; **edge** **POPs** are **franchises** with **prepped** **meals**. Customers eat **local**; only **misses** **pull** from **HQ**.

> NUMBERS: Large providers operate **200–450+** **PoPs** globally (**Cloudflare** **310+** **cities** marketing figures; **CloudFront** **450+** **edge** locations—numbers **shift**). Aim for **90–99%** **cache hit** ratios on **static** **content**. **Egress** from **CDN** often **$0.02–0.12/GB** **bandwidth** class pricing—**far** cheaper than **origin** **spikes**. A good CDN can **offload** **80–95%** of **bytes** from **origin** for **read-mostly** **sites**.

> INTERVIEW TIP: Always add a **CDN** front for **global** **users**; cite **hit ratio**, **TTL**, **versioned assets**, **purge** plan.

## Operations

Monitor **hit ratio**, **origin** **error** **rate**, **5xx** at **edge**, **byte** **savings**. **TLS** **certs** at **edge**, **HTTP/2/3** **termination**, **DDoS** **absorption**—often **bundled**.

CDNs are **not** optional polish—they are **default** **infrastructure** for **fast**, **cheap-at-scale** **delivery**.

## Interview deep-dive prompts

Sketch **DNS → edge POP → origin** on the board. Discuss **TLS** at the edge, **HTTP/2/3** termination, **WAF** integration, **DDoS** absorption. Be ready for **cache poisoning** and **authorization** pitfalls—never cache **personalized** **HTML** without **Vary** **controls** or **signed URLs**. Mention **stale-while-revalidate** for **perceived** performance. If asked about **global APIs**, pair CDN with **regional** **origins** or **edge** **compute** for **auth** at the **edge**.
`,
    quizQuestions: [
      {
        id: '7-6-q1',
        question: 'A CDN primarily reduces latency by:',
        options: [
          'Increasing database locks',
          'Serving cached content physically closer to users',
          'Removing DNS',
          'Disabling compression',
        ],
        correctIndex: 1,
        explanation:
          'Edge caches shorten propagation distance and leverage local peering.',
      },
      {
        id: '7-6-q2',
        question: 'Pull CDN behavior means:',
        options: [
          'You must FTP every file manually before any request',
          'Edges fetch from origin on cache miss, then cache for subsequent hits',
          'No caching occurs',
          'Only HTML can be served',
        ],
        correctIndex: 1,
        explanation:
          'Lazy population on first miss is the common web asset pattern.',
      },
      {
        id: '7-6-q3',
        question: 'Good cache invalidation practice includes:',
        options: [
          'Infinite TTL for secrets',
          'Versioned asset URLs and targeted purges when needed',
          'Never setting Cache-Control',
          'Caching POST bodies by default',
        ],
        correctIndex: 1,
        explanation:
          'Immutable versioned filenames reduce emergency purge needs.',
      },
      {
        id: '7-6-q4',
        question: '`s-maxage` primarily targets:',
        options: [
          'GPU firmware',
          'Shared caches like CDNs/proxies',
          'SMTP relays',
          'Kernel schedulers',
        ],
        correctIndex: 1,
        explanation:
          's-maxage applies to shared caches distinct from browser-only max-age.',
      },
      {
        id: '7-6-q5',
        question: 'Edge compute enables:',
        options: [
          'Running small logic close to users for auth, routing, or transforms',
          'Replacing all databases',
          'Eliminating HTTPS',
          'Guaranteeing zero bugs',
        ],
        correctIndex: 0,
        explanation:
          'Workers/functions at the edge handle request/response manipulation with low latency.',
      },
      {
        id: '7-6-q6',
        question: 'Caching private account pages on a public CDN without controls risks:',
        options: [
          'Faster CPU',
          'Data leakage to other users',
          'Stronger passwords automatically',
          'Free GPUs',
        ],
        correctIndex: 1,
        explanation:
          'Shared caches must never store personalized responses without strict auth and cache rules.',
      },
    ],
  },
  {
    id: 'auto-scaling',
    title: 'Auto-Scaling',
    interviewTip:
      'Tie autoscaling to a metric (CPU 60–70% target), cool-down (5–10m), min instances ≥2 for HA, max cap for budget, and note scale-out delay—buffer with queues or graceful degradation.',
    readContent: `# Auto-scaling

**Auto-scaling** adjusts **instance count** (or **container** **replicas**) based on **signals**: **CPU**, **memory**, **request rate**, **queue depth**, **custom** **business** metrics, or **schedules**. **Scale out** when **load** rises; **scale in** when **idle**—**match** **capacity** to **traffic** and **save money**.

## Why it matters

Traffic is **spiky**: **news**, **product launches**, **Black Friday**, **viral** **videos**. **Fixed** **over-provisioning** wastes **money**; **under-provisioning** causes **outages**. **Elastic** fleets **track** **reality**.

## Signals

- **Average CPU** > **70%** for **5** minutes → add capacity.
- **Requests per instance** beyond **SLO** → add.
- **Queue depth** (**SQS**, **Kafka lag**) → add **workers**.
- **p99 latency** **custom** metric → scale **API** pods.
- **Cron** schedules for **known** peaks (**market open**, **nightly** **batch**).

## Policies

**Target tracking**: keep **CPU** near **60%**—simple, **managed**.

**Step scaling**: discrete rules—**60–70%** add **1**, **70–80%** add **3**, etc.

**Scheduled**: **pre-warm** before **events**.

## Guardrails

**Cool-down** (**5–10** minutes) prevents **flapping** (**thrash** add/remove). **Scale out** **aggressive**, **scale in** **conservative**—protect **sessions** and **avoid** **accidental** **overload**. **Min** size ≥ **2** in **HA** **contexts**; **max** caps **protect** **budget**.

## Challenges

**Cold starts**: **EC2** **1–3** minutes; **Kubernetes** pods **15–30** seconds often; **Lambda** **milliseconds** **invoke** but **cold** **100–500** ms possible; **Fargate** **30–60** s **tasks**. **Connection storms**: **10** new instances × **20** DB **connections** = **200** new **handshakes**—**pool** carefully. **Stateful** **sockets** complicate **draining**.

## Kubernetes extras

**HPA** scales **pods**; **Cluster Autoscaler** adds **nodes** when **unschedulable**. **Metrics Server** + **Prometheus** adapters feed **custom** signals.

> NUMBERS: **AWS ASG** boot **often** **1–3** minutes for **generic** AMIs. **K8s HPA** commonly **reacts** in **tens** of seconds. **Right-sized** **elastic** **fleets** often save **~30–40%** vs **always-on** **peak** **sizing**—highly **workload** dependent.

> IMPORTANT: **Autoscaling is not instant**. Plan **2–3** minutes of **grace** with **queues**, **caches**, **load shedding**, or **burst** **capacity**. **Spikes** arrive faster than **VMs** boot.

> INTERVIEW TIP: Always mention **metric**, **target**, **cool-down**, **min/max**, and **burst** **handling**.

## Testing

**Load test** **policies**, verify **scale-out** **time**, ensure **DB** **limits** and **quotas** allow growth. **Game days** **drill** **failures** during **scale** **events**.

Auto-scaling converts **capacity** from a **spreadsheet** guess into a **closed-loop** **system**—but only as good as **signals** and **downstream** **limits**.

## Interview deep-dive prompts

Walk through **target tracking** vs **step scaling** with **real** **numbers**—**CPU** **60%** target, **cool-down** **300s**, **min** **2** **instances**, **max** **50**. Mention **predictive** scaling for **known** events. Discuss **connection** **storms** to **databases** when **N** new instances appear—**pool** sizing, **RDS** **Proxy**, **caching**. Admit **cold** **starts**: **buffer** with **queues** or **over-provisioned** **minimum** **fleet** during **known** spikes.
`,
    quizQuestions: [
      {
        id: '7-7-q1',
        question: 'A cool-down period in auto-scaling mainly prevents:',
        options: [
          'TLS handshakes',
          'Oscillation from repeatedly adding and removing instances',
          'DNS resolution',
          'HTTP/2 multiplexing',
        ],
        correctIndex: 1,
        explanation:
          'Hysteresis avoids thrashing when metrics fluctuate near thresholds.',
      },
      {
        id: '7-7-q2',
        question: 'Target tracking scaling means:',
        options: [
          'Random instance counts',
          'Maintaining a metric near a setpoint (e.g., CPU ~60%)',
          'Never scaling in',
          'Disabling health checks',
        ],
        correctIndex: 1,
        explanation:
          'Controllers adjust capacity to keep the chosen signal near the target.',
      },
      {
        id: '7-7-q3',
        question: 'Why set a maximum instance count?',
        options: [
          'To ensure bugs',
          'To prevent runaway costs during attacks or misconfigured metrics',
          'To forbid load balancers',
          'To disable autoscaling entirely',
        ],
        correctIndex: 1,
        explanation:
          'Caps protect budgets from infinite scale loops.',
      },
      {
        id: '7-7-q4',
        question: 'Queue depth is a useful scaling signal because:',
        options: [
          'It measures CSS file size',
          'Growing backlog means consumers are falling behind incoming work',
          'It replaces databases',
          'It eliminates network partitions',
        ],
        correctIndex: 1,
        explanation:
          'Backlog indicates insufficient worker capacity.',
      },
      {
        id: '7-7-q5',
        question: 'Kubernetes HPA primarily scales:',
        options: [
          'DNS TTL',
          'Pod replicas based on metrics',
          'GPU driver versions',
          'Git branches',
        ],
        correctIndex: 1,
        explanation:
          'Horizontal Pod Autoscaler changes deployment replica counts.',
      },
      {
        id: '7-7-q6',
        question: 'Compared with VMs, containers often:',
        options: [
          'Scale slower always',
          'Start faster and reach useful capacity sooner for many workloads',
          'Cannot run behind load balancers',
          'Remove the need for observability',
        ],
        correctIndex: 1,
        explanation:
          'Smaller images and schedulers enable faster scale reactions than full VM boots.',
      },
    ],
  },
  {
    id: 'back-of-envelope-estimation',
    title: 'Back-of-the-Envelope Estimation',
    interviewTip:
      'Before boxes and arrows: state DAU, actions/user, average and peak QPS, storage/day, bandwidth—then sanity-check against rough server/redis/db limits. Round aggressively; defend assumptions.',
    readContent: `# Back-of-envelope estimation

System design **without numbers** is **fantasy**. **Order-of-magnitude** **estimates** tell you whether you need **one** **service** or **hundreds**, **GB** or **PB**, **single** **region** or **global** **mesh**. Interviewers reward **clear assumptions** more than **decimal** precision.

## Framework

1. **Daily active users (DAU)** or **MAU** + **engagement**.
2. **Actions per user per day** → **read**/**write** **QPS** (**divide** by **86,400** s/day, then **multiply** by **peak** factor often **3–10×**).
3. **Storage**: **objects/day** × **bytes/object**; **replication** **overhead** (**3×**).
4. **Bandwidth**: **QPS** × **response size** (watch **egress** **costs**).
5. **Servers**: compare **required RPS** to **~1k–10k RPS** **stateless** **HTTP** **rough** **bounds** (highly **app** **dependent**).

## Worked example — Twitter-like

Assume **200M DAU**, **10** **timeline** **reads**/user/day, **2** **tweets**, **5** **likes**.

**Read QPS (avg)**: **200M × 10 / 86,400 ≈ 23,000** reads/s.

**Peak**: **~5×** average → **~115,000** reads/s (illustrative).

**Write QPS**: **200M × 2 / 86,400 ≈ 4,600** tweets/s average.

**Storage/tweet**: **280** chars + metadata ≈ **500** bytes raw (illustrative).

**New tweets/day**: **200M × 2 = 400M** → **400M × 500 B ≈ 200 GB/day** text.

**Year**: **× 365 ≈ 73 TB/year** text-only **back-of-envelope**.

**Media**: if **10%** of tweets have **500 KB** images → **40M × 500 KB ≈ 20 TB/day**—this **dominates** storage.

**Bandwidth**: **23k reads/s × ~10 KB** response → **~230 MB/s** **outbound** class—**multi-Gbps** **edge** **need**.

## Handy constants

- **2¹⁰ ≈ 1k**, **2²⁰ ≈ 1M**, **2³⁰ ≈ 1B**.
- **86,400 s/day**—round to **100k** for **mental** math.
- **1M seconds ≈ 12 days**; **1B seconds ≈ 31 years** (party trick).

## Size anchors

**Tweet**-scale record **500 B**; **profile** **1–5 KB**; **web** **JSON** **1–10 KB**; **image** **200 KB–2 MB** compressed; **page** **5–50 KB**.

## Capacity anchors

**Stateless app**: **1k–10k RPS**/box **order of magnitude**; **OLTP DB**: **5k–20k** simple **queries**/s on **nice** hardware (varies **wildly**); **Redis**: **100k+** ops/s; **Kafka** **broker**: **1M+** msgs/s **aggregate** **possible**—always **measure**.

> NUMBERS: Memorize **86,400**; use **100k** for **quick** **QPS** **from** **daily** **actions**. **1 KB** ≈ **short** **paragraph**; **1 MB** ≈ **small** **photo**; **1 GB** ≈ **~1k** **photos** rough; **1 TB** ≈ **hundreds** of **hours** **compressed** **video** (bitrate **dependent**).

> IMPORTANT: **Estimates can be wrong by 2–5×** and still **win** the interview if **assumptions** are **explicit** and **math** is **clear**. Goal: **right** **order** of **magnitude**, not **fake** **precision**.

> INTERVIEW TIP: **Narrate**: “**10M DAU**, **20** **req**/user/day → **~2.3k** **avg QPS**, **~10k** **peak** → **multi-instance** **LB** **tier**.” Let the interviewer **correct** you.

## Sensitivity

If **storage** doubles, do **cost** and **compaction** still work? If **peak** is **20×** **average**, does **queue** **depth** **explode**? **Estimation** drives **risk** **questions**.

Estimation is **cheap** **insurance** against **building** **wrong**-scale architecture for **prototype**-scale **traffic**.

## Interview deep-dive prompts

Practice **live** **Fermi** problems: **DAU** → **requests/day** → **average QPS** → **peak** **(5×)** → **servers** needed given **~5k** **RPS**/box **assumption**. **Sanity-check** **storage** with **bytes/user** × **users**. **State** **assumptions** **out** **loud** so interviewers **can** **steer** you—**correct** **numbers** **matter** less than **structured** **method**. **Translate** **QPS** to **monthly** **cloud** **bill** **roughly** for **bonus** **business** **awareness**.
`,
    quizQuestions: [
      {
        id: '7-8-q1',
        question: 'If 1M users each generate 20 requests/day, average QPS is about:',
        options: [
          '20M QPS',
          '20M / 86,400 ≈ 231 QPS (average)',
          '1 QPS total',
          '86,400 QPS always',
        ],
        correctIndex: 1,
        explanation:
          'Divide total daily requests by seconds per day for average QPS.',
      },
      {
        id: '7-8-q2',
        question: 'Peak QPS is often modeled as:',
        options: [
          'Exactly equal to average always',
          'A multiple of average (commonly a few times to an order of magnitude)',
          'Zero',
          'Unrelated to user behavior',
        ],
        correctIndex: 1,
        explanation:
          'Traffic concentrates in busy hours; peak factors are common.',
      },
      {
        id: '7-8-q3',
        question: 'Why estimate storage per object before architecture?',
        options: [
          'To pick a font',
          'To know whether data fits one node, needs sharding, or major object storage',
          'To remove caching',
          'To disable HTTPS',
        ],
        correctIndex: 1,
        explanation:
          'Data volume drives database choice, retention, and cost.',
      },
      {
        id: '7-8-q4',
        question: '2^30 bytes is approximately:',
        options: [
          '1 thousand bytes',
          '1 billion bytes (gigabyte scale)',
          '1 trillion human heartbeats per second',
          '500 bytes',
        ],
        correctIndex: 1,
        explanation:
          '2^30 is ~1.07 GB—often approximated as a billion bytes in conversation.',
      },
      {
        id: '7-8-q5',
        question: 'Rough outbound bandwidth needs scale with:',
        options: [
          'Only CPU count',
          'QPS × response size (plus protocol overhead)',
          'Only database primary keys',
          'Number of Git branches',
        ],
        correctIndex: 1,
        explanation:
          'Egress bandwidth ties to how many responses and how large they are.',
      },
      {
        id: '7-8-q6',
        question: 'If estimates show 100× more load than a single node can handle, you should:',
        options: [
          'Ignore the gap',
          'Change the architecture toward horizontal scaling, partitioning, or specialized stores',
          'Delete monitoring',
          'Use only UDP',
        ],
        correctIndex: 1,
        explanation:
          'Orders of magnitude gaps require structural solutions.',
      },
    ],
  },
];
