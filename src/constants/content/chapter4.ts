import type { Topic } from '@/constants/curriculumTypes';

const demoDbBottleneck: Topic['simulatorDemo'] = {
  description:
    'The database is often the slowest hop in a request chain. This graph shows traffic piling up when the DB cannot keep up.',
  instruction:
    'Watch the database turn red. It can only handle 500 req/s but upstream sends far more. This is why databases are almost always the bottleneck in system design — mitigate with caching, replicas, query tuning, and scaling.',
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

const demoIndexesThroughput: Topic['simulatorDemo'] = {
  description:
    'Indexes shrink how much work the database does per query. In the simulator, raising effective DB throughput models the jump after adding the right index.',
  instruction:
    'Click the Database and increase throughput toward 5000 req/s. That models the effect of a proper index: queries become far cheaper, so the same hardware behaves as if throughput jumped by an order of magnitude.',
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
      label: 'Database (before index)',
      position: { x: 500, y: 80 },
      data: { throughput: 500, latency: 80, capacity: 5000 },
    },
  ],
  setupEdges: [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
  ],
};

export const CHAPTER_4_TOPICS: Topic[] = [
  {
    id: 'what-is-a-database',
    title: 'What Is a Database?',
    interviewTip:
      'Treat the database as the default bottleneck: name it, quote rough QPS, then list mitigations — indexes, connection pooling, caching, read replicas, sharding, and async writes where safe.',
    simulatorDemo: demoDbBottleneck,
    readContent: `# What a database actually does

A **database** is software (and hardware underneath) whose job is to **persist** data reliably, let many clients **query** and **update** it concurrently, and enforce rules about what valid data looks like. When your API says "save this order" or "fetch this user," the database is usually the **source of truth** — the place you trust after a crash, after deploys, and across replicas.

That responsibility is heavy: bytes must leave RAM and land on **durable storage**, queries must be **parsed**, **planned**, and **executed**, and concurrent writers must coordinate with **locks** or **multi-version concurrency**. Every step costs time. Application servers, by contrast, mostly juggle already-hot data in memory and issue short RPCs. That asymmetry is why, in interview after interview, the database ends up in the hot seat.

# Why databases are almost always the bottleneck

First, **disks are slow compared to RAM and CPU caches**. A modern server can execute millions of instructions in the time it takes one SSD read. Spinning disks are worse by orders of magnitude. Even with buffering and page cache, sustained random I/O or large scans will stall workers waiting on storage.

Second, **work per request multiplies**. Parsing SQL, choosing a plan, acquiring row locks, waiting on replication, and shipping results over the network all add latency. Third, **fan-out**: a single HTTP request often triggers **2–5 database round trips** (auth, read profile, read settings, write audit). At **10k HTTP req/s**, you might be asking for **20k–50k queries/s** — a totally different scale than "we have 10k users."

Fourth, **contention**: two transactions updating the same hot row serialize. Your throughput collapses to "how fast can we update this one counter," not how fast the CPU is.

# The speed hierarchy you should memorize

| Layer | Order of magnitude |
| --- | --- |
| **L1 cache** | ~**0.5 ns** |
| **RAM** | ~**100 ns** |
| **SSD** | ~**50–100 µs** per read (varies wildly) |
| **HDD seek** | ~**5–10 ms** |
| **Same-region network** | ~**0.5–2 ms** RTT |
| **Cross-region** | ~**100–200+ ms** RTT |

Your app tier does a lot of work in the **RAM / cache** zone. Your database ultimately anchors on **disk + protocol + locking**. That gap is why "just add more app servers" stops working: the DB becomes the **narrow pipe** everyone queues behind.

# Read-heavy vs write-heavy

**Read-heavy** workloads (feeds, catalogs, analytics dashboards) stress **indexes**, **buffer cache hit ratio**, and **replica** capacity. **Write-heavy** workloads (event ingestion, counters, logging) stress **WAL**, **flush** rates, **partitioning**, and **lock** granularity. The same engine behaves differently depending on whether you are scanning or appending.

# The database as source of truth

Caches, CDNs, and client state can lie briefly or lose data. The database (with backups and replication) is what you cite in audits and what you restore after disaster. That is why **correctness** features — **ACID**, constraints, migrations — cluster here.

> ANALOGY: The database is a **library**. Books are organized, cataloged, and indexed — but walking to the shelf and pulling a volume takes time. Keeping the three books you are actively citing on your **desk** is like **cache**: instant access for hot items, but the library remains authoritative.

> NUMBERS: Rough single-node **order-of-magnitude** throughputs (workload-dependent): **PostgreSQL** often **5k–20k** simple queries/s; **MySQL/InnoDB** **10k–30k** in many benchmarks; **MongoDB** **25k–100k** ops/s for simple document gets; **DynamoDB** **~25k+** read/write capacity **per partition** (scale horizontally with more partitions); **Redis** **100k+** ops/s for in-memory key access. **Always validate with load tests** — these are anchors, not guarantees.

> INTERVIEW TIP: When you draw boxes, say explicitly: "I expect the **database** to be the first bottleneck; here is how I would **measure** it (QPS, slow queries, lock wait) and **mitigate** it (indexes, pool sizing, cache, replicas)."

## Mental checklist

If your design has **one** primary relational store serving synchronous reads for every request, say how you avoid **N+1 queries**, how you **pool** connections, and what **cache** sits in front for hot keys.

# How this shows up on the job

Engineering teams rarely debate theory in a vacuum — they debate **latency graphs** at 02:00. When you own a service backed by a database, you open dashboards for **CPU**, **I/O wait**, **replication lag**, **buffer hit ratio**, and **p99 query time**. You read **EXPLAIN** plans, argue about **composite index column order**, and decide whether a **partial index** is worth planner surprises. You pair with **SREs** to tune **connection pools** after **max_connections** incidents. The mental models here are what you use in those meetings: find the **critical path**, quantify it, shrink work on that path. In interviews, narrate the same **metrics** — specificity beats buzzwords.

# What to practice next

List **every** query your **happy path** issues. Count round trips. For each, ask: **indexable**? **N+1**? **Cacheable**? Re-run after adding **Redis** or a **read replica**. The loop **measure → change one variable → re-measure** is how databases actually get faster in production.
`,
    quizQuestions: [
      {
        id: '4-1-q1',
        question: 'Why do databases often bottleneck before application CPU?',
        options: [
          'They always use faster CPUs',
          'Durable storage, locking, and query execution are slower than in-memory app work',
          'HTTP cannot talk to databases',
          'They never use indexes',
        ],
        correctIndex: 1,
        explanation:
          'Disk I/O, concurrency control, and parsing/planning dominate compared to typical app logic in RAM.',
      },
      {
        id: '4-1-q2',
        question: 'At 10k HTTP req/s with ~3 DB queries per request, about how many queries hit the database per second?',
        options: ['3k', '10k', '30k', '300'],
        correctIndex: 2,
        explanation:
          'Multiply request rate by queries per request: 10k × 3 ≈ 30k QPS — a different capacity plan than the web tier alone.',
      },
      {
        id: '4-1-q3',
        question: 'Which ordering is correct from fastest to slowest typical access?',
        options: ['SSD → RAM → L1 cache', 'L1 cache → RAM → SSD', 'HDD → RAM → SSD', 'Network → L1 → RAM'],
        correctIndex: 1,
        explanation:
          'CPU caches and RAM beat SSD and spinning disks by large factors.',
      },
      {
        id: '4-1-q4',
        question: 'A read-heavy product catalog is most likely to need which focus first?',
        options: [
          'Dropping all indexes',
          'Caching, read replicas, and index tuning for hot queries',
          'Disabling replication',
          'Single-threaded writes only',
        ],
        correctIndex: 1,
        explanation:
          'Reads dominate — reduce duplicate work with cache/replicas and make queries cheap with indexes.',
      },
      {
        id: '4-1-q5',
        question: 'What does "source of truth" mean in system design?',
        options: [
          'The CDN is always right',
          'The authoritative store whose data wins after conflicts and restores',
          'The browser cache',
          'The load balancer config',
        ],
        correctIndex: 1,
        explanation:
          'Downstream caches may be stale; the database (or equivalent durable store) defines canonical state.',
      },
      {
        id: '4-1-q6',
        question: 'Which is a sign the database is the bottleneck under load?',
        options: [
          'App CPU near 0% while DB CPU or disk queue depth is pegged',
          'DNS TTL is high',
          'All HTTP status codes are 301',
          'TLS is disabled',
        ],
        correctIndex: 0,
        explanation:
          'Saturation shows up on DB metrics: CPU, I/O wait, lock waits, connection pool exhaustion.',
      },
    ],
  },
  {
    id: 'sql-databases',
    title: 'SQL Databases',
    interviewTip:
      'Choose SQL when the model is relational, you need JOINs and constraints, and ACID matters. Name a concrete engine (PostgreSQL vs MySQL) and why for extensions, JSON, or ops familiarity.',
    readContent: `# Relational SQL in one breath

**SQL databases** store data in **tables**: rows (**records**) and columns (**fields**) with a declared **schema**. Relationships link tables: a **primary key** uniquely identifies a row; a **foreign key** points to another table so the database can enforce "every order_line has a valid order_id."

The query language **SQL** lets you **SELECT** projections, **INSERT** rows, **UPDATE** them, **DELETE** them, and **JOIN** tables to assemble views that would be painful to stitch in application code. For system design interviews, you do not need to be a DBA — you need to know **when SQL wins**, how **JOINs** affect performance, and what **constraints** buy you.

# Core concepts

- **Table** — logical collection of similar rows.
- **Primary key** — unique row identity (often surrogate bigint UUID).
- **Foreign key** — referential integrity to parent rows.
- **Index** — structure to avoid full scans (covered in a dedicated topic).
- **Transaction** — atomic unit of work (see ACID topic).

# SQL you will actually mention in interviews

- **SELECT … WHERE** — filter with predicates (needs indexes on hot columns).
- **JOIN** — combine **users** and **orders**; each join multiplies planner work and I/O if indexes are wrong.
- **GROUP BY / aggregates** — analytics patterns; can be heavy without pre-aggregation.

# Popular engines (high level)

| Engine | Notes |
| --- | --- |
| **PostgreSQL** | Rich SQL, extensions, **JSONB**, strong correctness story; common default for greenfield services. |
| **MySQL / MariaDB** | Ubiquitous hosting, **InnoDB** with MVCC; huge ecosystem. |
| **Oracle / SQL Server** | Enterprise features, licensing, tooling; common in regulated incumbents. |

# Schema design

**Normalization** reduces duplication: user name lives in **users**, not copy-pasted into every row of **posts**. **Relationships**: one-to-one (rare), one-to-many (user → posts), many-to-many (students ↔ courses via junction table). Normalized schemas make **writes** consistent (one update) but can require **JOINs** for reads.

# Constraints

**NOT NULL**, **UNIQUE**, **CHECK**, and **FOREIGN KEY** push invariants into the database so a buggy deploy cannot insert impossible states. That is invaluable for money and inventory.

# Stored procedures and triggers

They run **inside** the database. Useful for tight invariants or batch jobs; in many modern microservice stacks, teams prefer **application-level** logic for testability and deploy independence — but interviewers may still expect you to know they exist.

> ANALOGY: A SQL schema is a **spreadsheet with strict column types and validation rules**. Every row in **orders** must have a numeric **total** and a real **customer_id** — the database rejects garbage instead of letting it spread to downstream services.

> NUMBERS: **PostgreSQL** commonly **5k–20k** simple queries/s per instance (varies). Single instances can hold **terabytes** with tuning. **max_connections** defaults around **100** — production almost always uses **pooling** (10–20 connections per app instance × many instances still caps out). Throughput **scales better vertically** than sharded NoSQL until you architect sharding.

> INTERVIEW TIP: Say **SQL** when the data is **relational**, you need **transactions across rows**, or **ad hoc reporting**. Mention **JOIN + index** plan risk for hot endpoints.

# How this shows up on the job

Engineering teams rarely debate theory in a vacuum — they debate **latency graphs** at 02:00. When you own a service backed by a database, you open dashboards for **CPU**, **I/O wait**, **replication lag**, **buffer hit ratio**, and **p99 query time**. You read **EXPLAIN** plans, argue about **composite index column order**, and decide whether a **partial index** is worth planner surprises. You pair with **SREs** to tune **connection pools** after **max_connections** incidents. The mental models here are what you use in those meetings: find the **critical path**, quantify it, shrink work on that path. In interviews, narrate the same **metrics** — specificity beats buzzwords.

# What to practice next

List **every** query your **happy path** issues. Count round trips. For each, ask: **indexable**? **N+1**? **Cacheable**? Re-run after adding **Redis** or a **read replica**. The loop **measure → change one variable → re-measure** is how databases actually get faster in production.
`,
    quizQuestions: [
      {
        id: '4-2-q1',
        question: 'What is a foreign key?',
        options: [
          'A backup DNS record',
          'A column that references a primary key in another table, enforcing referential integrity',
          'An HTTPS certificate',
          'A Redis TTL',
        ],
        correctIndex: 1,
        explanation:
          'FKs tie child rows to valid parents so orphaned rows cannot be inserted.',
      },
      {
        id: '4-2-q2',
        question: 'Why do JOINs matter for performance?',
        options: [
          'They are always free',
          'They combine tables and can explode work without proper indexes and selective predicates',
          'They remove the need for primary keys',
          'They only run on GPUs',
        ],
        correctIndex: 1,
        explanation:
          'Joins drive nested loops, hash joins, or merges — each sensitive to cardinality and indexes.',
      },
      {
        id: '4-2-q3',
        question: 'When is PostgreSQL often preferred in greenfield backends?',
        options: [
          'When you need zero persistence',
          'When you want rich SQL, extensions, and JSONB with strong correctness culture',
          'When you cannot use TCP',
          'Only for mobile clients',
        ],
        correctIndex: 1,
        explanation:
          'Postgres balances features and rigor; teams pick MySQL for legacy or hosting fit.',
      },
      {
        id: '4-2-q4',
        question: 'A primary key should?',
        options: [
          'Duplicate across many rows',
          'Uniquely identify each row in a table',
          'Always be a string URL',
          'Be optional',
        ],
        correctIndex: 1,
        explanation:
          'PKs anchor relationships and clustering in many engines.',
      },
      {
        id: '4-2-q5',
        question: 'Normalization primarily helps with?',
        options: [
          'Making every query a single row with no joins',
          'Reducing redundancy and keeping updates consistent',
          'Eliminating indexes',
          'Removing transactions',
        ],
        correctIndex: 1,
        explanation:
          'Store each fact once; join when assembling views.',
      },
      {
        id: '4-2-q6',
        question: 'Which workload screams SQL first?',
        options: [
          'Append-only sensor firehose with no relationships',
          'E-commerce orders, payments, inventory with ACID invariants',
          'Ephemeral session blobs only',
          'Static JPEG hosting only',
        ],
        correctIndex: 1,
        explanation:
          'Relational money/inventory paths need constraints and multi-row transactions.',
      },
    ],
  },
  {
    id: 'acid-transactions',
    title: 'ACID Transactions',
    interviewTip:
      'Say ACID whenever money, inventory, or double-spend risk appears. Tie isolation level to the story: Read Committed for most OLTP, Serializable for rare critical sections.',
    readContent: `# What a transaction is

A **transaction** groups several database operations into one logical unit: **either all of them commit together or none of them do**. The classic story is a **transfer**: debit account A, credit account B. If the server crashes after the debit but before the credit, you must **not** leave money in limbo — the whole transfer **rolls back**.

That guarantee is what lets distributed systems still reason about **invariants** ("balance never negative") even when failures and concurrency are everywhere.

# Atomicity

**Atomicity** means **no partial writes visible**: either every statement in the transaction succeeds or the database rewinds to the pre-transaction state. Implementations use **undo logs** or similar so half-finished work never becomes canonical.

# Consistency

**Consistency** (in the ACID sense) means every transaction moves the database from one **valid** state to another **valid** state: constraints, triggers, and rules still hold. It is not the same word as in CAP — context matters in interviews.

# Isolation

**Isolation** means concurrent transactions should not **observe each other's in-flight work** in ways that break your mental model. Real engines offer **isolation levels** that trade **correctness vs throughput**:

- **Read Uncommitted** — dirty reads possible; rare in production APIs.
- **Read Committed** — no dirty reads; default in **PostgreSQL**.
- **Repeatable Read** — stable reads within a transaction; **MySQL InnoDB** default (with engine-specific nuances).
- **Serializable** — strongest; most locking / aborts; use for **critical financial** slices.

Higher isolation → more **locking** or **retries** → lower throughput.

# Durability

**Durability**: after **COMMIT**, data survives **crash** and **power loss**. The standard mechanism is a **write-ahead log (WAL)**: changes are appended to a durable log **before** the main data pages are considered committed, so recovery can **replay** after restart.

> ANALOGY: A transaction is a **bank teller closing out a shift**. They count both drawers, prepare both entries, and **only stamp "done" when both sides balance**. If the fire alarm rings mid-way, they **void the whole bundle** — never leave one account debited without the paired credit.

> IMPORTANT: **Write-Ahead Logging** is how durability is implemented in practice. The log record hits disk (or equivalent quorum) **before** the transaction is acknowledged. On crash, the database **replays** committed log entries and **rolls back** incomplete ones.

> INTERVIEW TIP: Whenever the prompt mentions **payments**, **ledger**, **inventory**, or **seat booking**, explicitly say **ACID**, **isolation level**, and how you detect **double-submit** (idempotency keys plus DB constraints).

## Where people get burned

Assuming **Serializable** when the database defaults to **Read Committed** causes subtle race bugs. Always know your **defaults** and annotate hot transactions when you need stronger guarantees.

# How this shows up on the job

Engineering teams rarely debate theory in a vacuum — they debate **latency graphs** at 02:00. When you own a service backed by a database, you open dashboards for **CPU**, **I/O wait**, **replication lag**, **buffer hit ratio**, and **p99 query time**. You read **EXPLAIN** plans, argue about **composite index column order**, and decide whether a **partial index** is worth planner surprises. You pair with **SREs** to tune **connection pools** after **max_connections** incidents. The mental models here are what you use in those meetings: find the **critical path**, quantify it, shrink work on that path. In interviews, narrate the same **metrics** — specificity beats buzzwords.

# What to practice next

List **every** query your **happy path** issues. Count round trips. For each, ask: **indexable**? **N+1**? **Cacheable**? Re-run after adding **Redis** or a **read replica**. The loop **measure → change one variable → re-measure** is how databases actually get faster in production.
`,
    quizQuestions: [
      {
        id: '4-3-q1',
        question: 'Which ACID property ensures all steps commit or none do?',
        options: ['Consistency', 'Atomicity', 'Durability', 'Partition tolerance'],
        correctIndex: 1,
        explanation:
          'Atomicity is all-or-nothing visibility of a transaction’s effects.',
      },
      {
        id: '4-3-q2',
        question: 'Dirty reads are possible at which isolation level?',
        options: ['Serializable', 'Read Uncommitted', 'Repeatable Read', 'Snapshot isolation always'],
        correctIndex: 1,
        explanation:
          'Read Uncommitted allows reading uncommitted writes from other transactions.',
      },
      {
        id: '4-3-q3',
        question: 'Why is WAL central to durability?',
        options: [
          'It speeds up DNS',
          'Committed changes are logged durably before being fully applied so recovery can replay after crash',
          'It replaces TCP',
          'It removes indexes',
        ],
        correctIndex: 1,
        explanation:
          'WAL ordering lets the engine reconstruct a consistent state after failure.',
      },
      {
        id: '4-3-q4',
        question: 'A social "like" counter might tolerate which weaker isolation compared to a bank transfer?',
        options: [
          'Serializable for likes; Read Committed for transfers',
          'Read Committed for likes; Serializable for transfers',
          'Read Uncommitted for transfers only',
          'No isolation for either',
        ],
        correctIndex: 1,
        explanation:
          'Likes can tolerate brief anomalies; ledger movements need the strongest guarantees.',
      },
      {
        id: '4-3-q5',
        question: 'Higher isolation levels generally imply?',
        options: [
          'Always faster writes',
          'More correctness guarantees but more locking/contention or retries',
          'No need for primary keys',
          'Automatic sharding',
        ],
        correctIndex: 1,
        explanation:
          'Stronger isolation reduces anomalies at the cost of throughput.',
      },
      {
        id: '4-3-q6',
        question: 'Consistency in ACID means?',
        options: [
          'Every read sees the latest write globally',
          'Transactions take the database from one valid state to another obeying constraints',
          'The database is always partitioned',
          'HTTP is stateless',
        ],
        correctIndex: 1,
        explanation:
          'ACID consistency is about invariants, not CAP linearizability.',
      },
    ],
  },
  {
    id: 'nosql-databases',
    title: 'NoSQL Databases',
    interviewTip:
      'Never stop at "NoSQL." Name the category: document, key-value, wide-column, or graph — then pick a product and access pattern (partition key, GSI, etc.).',
    readContent: `# Not Only SQL

**NoSQL** is an umbrella for storage systems that **do not center on relational tables + SQL** (though some now offer SQL-like layers). They emerged as teams needed **massive scale-out**, **flexible schemas**, and **operation models** that matched access paths instead of forcing every query through JOINs.

# Four families

## 1. Document stores (MongoDB, CouchDB)

Store **JSON-like documents** with nested fields. **Flexible schema**: two products can have different attributes. Great for **catalogs**, **user profiles**, **content trees** where shape evolves. Query by document fields with indexes; JOIN-like operations are possible but not the sweet spot.

## 2. Key-value (Redis, DynamoDB, Memcached)

**O(1)** get/put by key. Minimal model, maximum speed. Perfect for **sessions**, **rate limits**, **feature flags**, **caches**, **simple entities** keyed by ID. DynamoDB adds **partition + sort key** modeling and secondary indexes at scale.

## 3. Wide-column (Cassandra, ScyllaDB, HBase)

**Rows** with **dynamic columns**, partitioned for **write throughput** and **time-series** patterns. Excellent for **IoT ingestion**, **metrics**, **write-heavy** logs where you design around **partition keys** to avoid hotspots.

## 4. Graph (Neo4j, Neptune)

**Nodes and edges** with traversals. Shine for **social graphs**, **fraud rings**, **recommendations** where relationship queries would explode in SQL JOINs.

# Why denormalize?

Many NoSQL systems **penalize JOINs**. Teams **duplicate** data into **query-shaped documents** or **materialized views** so reads are single-partition lookups. You trade **storage and update complexity** for **predictable latency**.

# Eventual consistency

Distributed NoSQL often opts for **availability + partition tolerance**, offering **eventual consistency** across replicas: reads may lag writes for milliseconds to seconds unless you pay for stronger read models.

> ANALOGY: A **document store** is a **filing cabinet** where **each folder can be a different form** — one holds a lease, another a medical record. SQL is the office where **every row must use the same template**.

> NUMBERS: **MongoDB** often quoted **25k–100k+** simple ops/s per node depending on workload. **DynamoDB** scales by adding partitions (**~25k RCU/WCU per partition** classically cited). **Cassandra-class** nodes often **50k–100k+** writes/s in benchmarks. **Redis** **100k+** ops/s in-memory.

> INTERVIEW TIP: Replace vague "we use NoSQL" with "**DynamoDB partition key per user** for chat metadata" or "**MongoDB documents for product catalog** with secondary indexes on SKU."

# How this shows up on the job

Engineering teams rarely debate theory in a vacuum — they debate **latency graphs** at 02:00. When you own a service backed by a database, you open dashboards for **CPU**, **I/O wait**, **replication lag**, **buffer hit ratio**, and **p99 query time**. You read **EXPLAIN** plans, argue about **composite index column order**, and decide whether a **partial index** is worth planner surprises. You pair with **SREs** to tune **connection pools** after **max_connections** incidents. The mental models here are what you use in those meetings: find the **critical path**, quantify it, shrink work on that path. In interviews, narrate the same **metrics** — specificity beats buzzwords.

# What to practice next

List **every** query your **happy path** issues. Count round trips. For each, ask: **indexable**? **N+1**? **Cacheable**? Re-run after adding **Redis** or a **read replica**. The loop **measure → change one variable → re-measure** is how databases actually get faster in production.
`,
    quizQuestions: [
      {
        id: '4-4-q1',
        question: 'Best fit: session tokens with TTL and sub-millisecond reads?',
        options: ['Graph database', 'Key-value cache/store (e.g. Redis)', 'Wide-column only', 'FTP server'],
        correctIndex: 1,
        explanation:
          'Key-value systems optimize simple get/set with TTL.',
      },
      {
        id: '4-4-q2',
        question: 'You need traversals like "friends of friends who bought X." Which family?',
        options: ['Pure key-value only', 'Graph database', 'Memcached only', 'SMTP'],
        correctIndex: 1,
        explanation:
          'Graph stores optimize multi-hop relationship queries.',
      },
      {
        id: '4-4-q3',
        question: 'Why do NoSQL designs often denormalize?',
        options: [
          'To use more JOINs',
          'To avoid expensive cross-partition joins and match access patterns',
          'Because disks are infinite',
          'To remove primary keys',
        ],
        correctIndex: 1,
        explanation:
          'Scale-out stores favor partition-local reads; duplication buys speed.',
      },
      {
        id: '4-4-q4',
        question: 'Wide-column stores excel at?',
        options: [
          'Arbitrary graph traversals only',
          'High-volume time-series / write-heavy partitioned workloads',
          'Storing only one row globally',
          'Replacing DNS',
        ],
        correctIndex: 1,
        explanation:
          'Cassandra-class systems optimize append-heavy, partition-scoped writes.',
      },
      {
        id: '4-4-q5',
        question: 'Eventual consistency means?',
        options: [
          'Writes never complete',
          'Replicas converge to the same state after a delay; brief staleness possible',
          'Strong serializability always',
          'No need for keys',
        ],
        correctIndex: 1,
        explanation:
          'AP-leaning systems prioritize availability during partitions; convergence follows.',
      },
      {
        id: '4-4-q6',
        question: 'Flexible evolving attributes per record suggests?',
        options: ['Rigid star schema only', 'Document or schemaless-friendly store', 'Only CSV files', 'BGP routing'],
        correctIndex: 1,
        explanation:
          'Document databases accommodate heterogeneous shapes per record.',
      },
    ],
  },
  {
    id: 'sql-vs-nosql-decision-framework',
    title: 'SQL vs NoSQL Decision Framework',
    interviewTip:
      'Answer with requirements: shape of data, query patterns, consistency, team skills, and growth path. Mention hybrid stacks without apologizing — that is normal.',
    readContent: `# Start from access patterns

Choosing storage is choosing **which questions are cheap**. SQL shines when you need **ad hoc JOINs**, **constraints**, and **multi-row transactions**. NoSQL shines when you have a **narrow set of fast paths** (get by key, query within partition), need **elastic scale-out**, or schemas **change weekly**.

# Choose SQL when

- Entities have **clear relationships** (customers, orders, line items).
- You need **ACID** across rows (payments, inventory).
- **Reporting** and **analytics** need flexible SQL.
- **Integrity** beats raw write scalability.

Examples: **banks**, **ERPs**, **booking**, **subscription billing**.

# Choose NoSQL when

- **Volume** or **write rate** pushes past comfortable vertical scale.
- **Access pattern** is key-based or partition-scoped.
- **Schema** evolves fast (mobile app flags, experiments).
- You can accept **eventual** or **tunable** consistency.

Examples: **feeds**, **sensor firehose**, **sessions**, **globally distributed catalogs** with careful key design.

# Hybrid reality

Production systems routinely combine **PostgreSQL** (money), **Redis** (cache/sessions), **Elasticsearch** (search), **S3** (blobs), and **Kafka** (events). The art is **clear ownership**: which store is authoritative for which fact.

# Common mistakes

- Picking **NoSQL for hype** then implementing **JOINs in app code** poorly.
- Picking **SQL** for **write fan-out** that needs **partitioned append logs** without a plan.
- Ignoring **operational** cost (backups, migrations, on-call).

# CAP intuition (hand-wavy but interview-useful)

Many **relational** clusters bias **CP**: during partitions, prefer **failing** requests over wrong answers. Many **NoSQL** systems bias **AP**: stay **available** with possible **stale reads**. Real products expose **knobs** — do not treat CAP as religion.

| Dimension | SQL | NoSQL (typical) |
| --- | --- | --- |
| Schema | Fixed, migrated | Flexible / per-document |
| Scale-up | Strong vertical + read replicas | Horizontal partition scale |
| Joins | Native | Costly / avoided |
| Transactions | Mature | Varies by system |
| Examples | Postgres, MySQL | Dynamo, Cassandra, Mongo |

> INTERVIEW TIP: Never end at "I'd pick SQL." Say: "**Postgres** for ledger + **DynamoDB** for session state because …" Tie every sentence to a **requirement**.

# How this shows up on the job

Engineering teams rarely debate theory in a vacuum — they debate **latency graphs** at 02:00. When you own a service backed by a database, you open dashboards for **CPU**, **I/O wait**, **replication lag**, **buffer hit ratio**, and **p99 query time**. You read **EXPLAIN** plans, argue about **composite index column order**, and decide whether a **partial index** is worth planner surprises. You pair with **SREs** to tune **connection pools** after **max_connections** incidents. The mental models here are what you use in those meetings: find the **critical path**, quantify it, shrink work on that path. In interviews, narrate the same **metrics** — specificity beats buzzwords.

# What to practice next

List **every** query your **happy path** issues. Count round trips. For each, ask: **indexable**? **N+1**? **Cacheable**? Re-run after adding **Redis** or a **read replica**. The loop **measure → change one variable → re-measure** is how databases actually get faster in production.
`,
    quizQuestions: [
      {
        id: '4-5-q1',
        question: 'You need multi-row transfers with foreign keys. First instinct?',
        options: ['MongoDB only', 'SQL with ACID transactions', 'Memcached', 'DNS TXT records'],
        correctIndex: 1,
        explanation:
          'Relational constraints and transactions fit ledger-like updates.',
      },
      {
        id: '4-5-q2',
        question: 'Billions of append-only sensor events per day?',
        options: [
          'Single SQLite file only',
          'Partitioned wide-column or streaming + warehouse; not naive single-node SQL',
          'Browser localStorage',
          'FTP',
        ],
        correctIndex: 1,
        explanation:
          'Ingestion at scale usually partitions writes or streams to analytics stores.',
      },
      {
        id: '4-5-q3',
        question: 'Hybrid stacks are?',
        options: [
          'An anti-pattern',
          'Normal — different stores for different access paths',
          'Illegal under GDPR',
          'Only for startups',
        ],
        correctIndex: 1,
        explanation:
          'Polyglot persistence matches each workload to the right tool.',
      },
      {
        id: '4-5-q4',
        question: 'Choosing NoSQL only because it is trendy is wrong because?',
        options: [
          'NoSQL cannot store JSON',
          'You might miss transactions, constraints, or force awkward joins in app code',
          'SQL is always faster',
          'NoSQL has no indexes',
        ],
        correctIndex: 1,
        explanation:
          'Engineering fit beats fashion; measure access patterns first.',
      },
      {
        id: '4-5-q5',
        question: 'Read-heavy dashboard with complex filters across many dimensions?',
        options: [
          'Key-value only without secondary indexes',
          'Often SQL or OLAP-friendly store + indexes/materialized views',
          'Graph only',
          'CPU cache',
        ],
        correctIndex: 1,
        explanation:
          'Ad hoc analytics usually wants SQL or columnar engines.',
      },
      {
        id: '4-5-q6',
        question: 'CAP during a partition often forces?',
        options: [
          'Infinite throughput',
          'Tradeoff between strong consistency and availability for some requests',
          'TLS removal',
          'Automatic sharding without keys',
        ],
        correctIndex: 1,
        explanation:
          'Partition tolerance is assumed; many systems choose CP or AP behaviors.',
      },
    ],
  },
  {
    id: 'indexes',
    title: 'Indexes',
    interviewTip:
      'Always propose an indexing strategy: which columns, composite order, covering indexes for hot queries — and acknowledge write amplification.',
    simulatorDemo: demoIndexesThroughput,
    readContent: `# Why indexes exist

Without an **index**, finding rows matching **WHERE email = ?** can mean **scanning every row** — **O(n)** I/O. With a **B-tree** index, the engine walks a balanced tree to a narrow range — **O(log n)** page accesses. On **10 million** rows, that is the difference between **seconds** and **milliseconds**.

# B-tree (the default mental model)

Think **sorted map** on disk: supports **equality** and **range** scans, backs **ORDER BY** when aligned, and plays nicely with composite keys.

# Hash indexes

**O(1)** equality on a **single** key, but **no range** scans. Common inside **key-value** engines; less often your whole SQL strategy.

# Composite indexes

Index **(user_id, created_at)** helps queries filtering on **user_id** and sorting by **created_at**. **Leftmost prefix rule**: if the query does not constrain **user_id**, the index may not help.

# Covering indexes

If the index leaf contains **all columns** the **SELECT** needs, the planner can **skip the heap** entirely — huge win for read-heavy dashboards.

# Costs

Every **INSERT/UPDATE/DELETE** must **maintain** indexes — extra writes, extra WAL, more **vacuum** work. Too many indexes **slow writes** and confuse optimizers. Choose indexes for **predicates** you actually filter on in production.

# When to skip

Tiny tables (planner scans anyway), **low-cardinality** flags (unless selective combo), write-bound tables where read savings do not pay.

> ANALOGY: An index is the **back-of-book index**: without it you read every page for "B-tree"; with it you jump to **page 247**.

> NUMBERS: **Full table scan** on **10M** rows might take **1–10+ seconds** depending on row width and disk; **indexed point lookup** often **1–10 ms**. That is commonly **~1000×** — enough to save a product.

> IMPORTANT: The **most common** production DB perf issue is **missing or wrong indexes** on **WHERE/JOIN** columns. **EXPLAIN ANALYZE** is your friend.

> INTERVIEW TIP: Pair every hot endpoint with "**index on (…)**" and mention **write amplification** tradeoff.

# How this shows up on the job

Engineering teams rarely debate theory in a vacuum — they debate **latency graphs** at 02:00. When you own a service backed by a database, you open dashboards for **CPU**, **I/O wait**, **replication lag**, **buffer hit ratio**, and **p99 query time**. You read **EXPLAIN** plans, argue about **composite index column order**, and decide whether a **partial index** is worth planner surprises. You pair with **SREs** to tune **connection pools** after **max_connections** incidents. The mental models here are what you use in those meetings: find the **critical path**, quantify it, shrink work on that path. In interviews, narrate the same **metrics** — specificity beats buzzwords.

# What to practice next

List **every** query your **happy path** issues. Count round trips. For each, ask: **indexable**? **N+1**? **Cacheable**? Re-run after adding **Redis** or a **read replica**. The loop **measure → change one variable → re-measure** is how databases actually get faster in production.
`,
    quizQuestions: [
      {
        id: '4-6-q1',
        question: 'Why are full table scans expensive at scale?',
        options: [
          'They skip disk',
          'They touch many rows/pages — O(n) growth',
          'They only run on SSD',
          'They require UDP',
        ],
        correctIndex: 1,
        explanation:
          'Scans read broadly; indexes narrow the touched set.',
      },
      {
        id: '4-6-q2',
        question: 'Composite index (user_id, created_at) helps which query best?',
        options: [
          'WHERE created_at only',
          'WHERE user_id = ? ORDER BY created_at',
          'WHERE LENGTH(email) > 5',
          'SELECT * with no filters',
        ],
        correctIndex: 1,
        explanation:
          'Leftmost prefix: user_id filter unlocks the index; created_at sort aligns.',
      },
      {
        id: '4-6-q3',
        question: 'Indexes slow writes because?',
        options: [
          'They remove WAL',
          'Each write must update index structures too',
          'They disable primary keys',
          'They only help DELETE',
        ],
        correctIndex: 1,
        explanation:
          'Maintaining trees adds work on every mutating statement.',
      },
      {
        id: '4-6-q4',
        question: 'Hash indexes are weak for?',
        options: ['Equality lookups', 'Range queries like BETWEEN dates', 'Storing pointers', 'Memory'],
        correctIndex: 1,
        explanation:
          'Hash maps partition by exact key; ranges need ordering B-trees provide.',
      },
      {
        id: '4-6-q5',
        question: 'A covering index means?',
        options: [
          'The table has no rows',
          'The index alone satisfies the query without heap fetches',
          'Only DELETE is allowed',
          'The index is stored on CDN',
        ],
        correctIndex: 1,
        explanation:
          'Include columns reads need so the planner stays index-only.',
      },
      {
        id: '4-6-q6',
        question: 'First step when a query is slow?',
        options: [
          'Drop all indexes',
          'Inspect execution plan and verify predicates hit indexes',
          'Disable replication',
          'Raise DNS TTL',
        ],
        correctIndex: 1,
        explanation:
          'Measure, then index or rewrite — do not guess.',
      },
    ],
  },
  {
    id: 'connection-pooling',
    title: 'Connection Pooling',
    interviewTip:
      'Mention pool size per instance, total connections vs Postgres max_connections, and PgBouncer for multiplexing thousands of app sockets to dozens of DB connections.',
    readContent: `# The cost of a fresh connection

Opening a **database connection** is surprisingly expensive: **TCP handshake**, optional **TLS**, **authentication**, session **memory**, and sometimes **parameter** negotiation. Real-world timings often land **~20–50 ms** — an eternity compared to a **1 ms** query. At **5k req/s**, trying to open **5k new connections per second** is physically impossible; you would spend all time handshaking.

# Pooling

A **pool** keeps **N** idle connections open. A worker **checks out** a connection, runs queries, **returns** it. Amortizes setup cost and caps **concurrency** into the database.

# Sizing

Too **small** → threads wait, **latency** spikes. Too **large** → the database spends cycles **context switching** and **lock** contention explodes. **Rule of thumb**: start **10–20** connections per app instance, then tune with metrics. Total clients × pool size must fit **max_connections** (Postgres default **100** is easy to exhaust with microservices).

# PgBouncer

**PgBouncer** sits between apps and Postgres, **multiplexing** many client connections onto fewer server connections (**transaction** or **session** pooling modes). Essential at scale.

# Libraries

**HikariCP** (Java), **pg-pool** / **Prisma** pools (Node), **SQLAlchemy** pool (Python) — all implement the same idea.

> ANALOGY: Pooling is a **car rental fleet**. Manufacturing a new car per customer is absurd; you **maintain a fleet**, hand keys out, and take cars back when trips end. If the lot is empty, customers **queue**.

> NUMBERS: **Connection setup** **20–50 ms** typical; **checkout** from pool **<1 ms** when warm. **Pool sizes** commonly **10–20**/instance. **max_connections** often **100–500** depending on RAM and tuning.

> INTERVIEW TIP: Whenever you say "service talks to Postgres," append "**with a pool of ~20 connections and PgBouncer if many services**."

## Failure mode

**Pool exhaustion** surfaces as **timeouts** and **503**s even when CPU looks fine — watch **waiting threads**.

# How this shows up on the job

Engineering teams rarely debate theory in a vacuum — they debate **latency graphs** at 02:00. When you own a service backed by a database, you open dashboards for **CPU**, **I/O wait**, **replication lag**, **buffer hit ratio**, and **p99 query time**. You read **EXPLAIN** plans, argue about **composite index column order**, and decide whether a **partial index** is worth planner surprises. You pair with **SREs** to tune **connection pools** after **max_connections** incidents. The mental models here are what you use in those meetings: find the **critical path**, quantify it, shrink work on that path. In interviews, narrate the same **metrics** — specificity beats buzzwords.

# What to practice next

List **every** query your **happy path** issues. Count round trips. For each, ask: **indexable**? **N+1**? **Cacheable**? Re-run after adding **Redis** or a **read replica**. The loop **measure → change one variable → re-measure** is how databases actually get faster in production.
`,
    quizQuestions: [
      {
        id: '4-7-q1',
        question: 'Why is opening a new DB connection per HTTP request usually bad?',
        options: [
          'It is always faster',
          'Handshake + auth overhead dominates compared to query time at scale',
          'HTTP forbids pooling',
          'Pools disable TLS',
        ],
        correctIndex: 1,
        explanation:
          'Reuse amortizes setup; per-request connect storms melt the DB.',
      },
      {
        id: '4-7-q2',
        question: 'Pool too small causes?',
        options: [
          'Automatic infinite throughput',
          'Requests waiting for a free connection — higher latency',
          'Stronger ACID',
          'Fewer indexes',
        ],
        correctIndex: 1,
        explanation:
          'Workers block on checkout when the pool is starved.',
      },
      {
        id: '4-7-q3',
        question: 'PgBouncer primarily helps by?',
        options: [
          'Replacing SQL',
          'Multiplexing many client connections to fewer real DB connections',
          'Storing data on CDN',
          'Removing primary keys',
        ],
        correctIndex: 1,
        explanation:
          'It cuts connection churn and keeps server-side session count sane.',
      },
      {
        id: '4-7-q4',
        question: 'Five services × 30 pool size each implies?',
        options: [
          '15 connections total',
          'Up to 150 concurrent DB connections if all pools saturate',
          'Zero connections',
          'Only reads',
        ],
        correctIndex: 1,
        explanation:
          'Multiply instances by pool size to stay under max_connections.',
      },
      {
        id: '4-7-q5',
        question: 'Pool exhausted symptom?',
        options: [
          'Instant 200 OK for all',
          'Timeouts waiting for connections despite healthy queries',
          'DNS failures',
          'TLS version mismatch only',
        ],
        correctIndex: 1,
        explanation:
          'Apps stall waiting for pool slots; errors look like downstream slowness.',
      },
    ],
  },
  {
    id: 'transactions-and-isolation-levels',
    title: 'Transactions & Isolation Levels',
    interviewTip:
      'Map symptoms to anomalies: double spend → lost update; inconsistent read set → phantom. Mention MVCC as how Postgres/InnoDB avoid read locks for many workloads.',
    readContent: `# Concurrency bugs isolation fixes

When transactions overlap, bad interleavings cause:

1. **Dirty read** — see uncommitted data from another txn.
2. **Non-repeatable read** — same row read twice yields different values after someone committed in between.
3. **Phantom read** — repeated range query returns different **rows** because inserts/deletes happened.
4. **Lost update** — two txns read value 10, both add 1, both write 11 instead of 12.

Isolation levels define **which** anomalies can still happen.

# Level cheat sheet

| Level | Dirty | Non-repeat | Phantom (ANSI view) |
| --- | --- | --- | --- |
| Read Uncommitted | Maybe | Maybe | Maybe |
| Read Committed | No | Maybe | Maybe |
| Repeatable Read | No | No | Engine-dependent |
| Serializable | No | No | No |

**PostgreSQL default**: **Read Committed**. **MySQL InnoDB default**: **Repeatable Read** (with MVCC semantics that differ slightly from Postgres).

# Implementation sketch

**Locks** (pessimistic) block readers/writers. **MVCC** keeps **row versions** so readers see a **snapshot** without blocking writers; writers create new versions. **Serializable** may **abort** transactions when serialization fails.

# Practical guidance

Default to **Read Committed** for most OLTP. Escalate to **Serializable** or **SELECT … FOR UPDATE** only on **critical** sections (wallet balance). Test under load — retries may spike.

> IMPORTANT: **Know your database defaults.** Many bugs come from assuming **Repeatable Read** semantics on Postgres or **Serializable** everywhere.

> INTERVIEW TIP: Say **MVCC** when explaining how modern engines keep read throughput high while writes proceed.

## Debugging tip

Reproduce with **concurrent integration tests** that hammer the same row — surprises appear quickly.

# How this shows up on the job

Engineering teams rarely debate theory in a vacuum — they debate **latency graphs** at 02:00. When you own a service backed by a database, you open dashboards for **CPU**, **I/O wait**, **replication lag**, **buffer hit ratio**, and **p99 query time**. You read **EXPLAIN** plans, argue about **composite index column order**, and decide whether a **partial index** is worth planner surprises. You pair with **SREs** to tune **connection pools** after **max_connections** incidents. The mental models here are what you use in those meetings: find the **critical path**, quantify it, shrink work on that path. In interviews, narrate the same **metrics** — specificity beats buzzwords.

# What to practice next

List **every** query your **happy path** issues. Count round trips. For each, ask: **indexable**? **N+1**? **Cacheable**? Re-run after adding **Redis** or a **read replica**. The loop **measure → change one variable → re-measure** is how databases actually get faster in production.
`,
    quizQuestions: [
      {
        id: '4-8-q1',
        question: 'Dirty read means?',
        options: [
          'Reading committed data twice',
          'Reading another transaction’s uncommitted changes',
          'Reading from cache only',
          'Using HTTPS',
        ],
        correctIndex: 1,
        explanation:
          'Dirty reads observe data that might roll back.',
      },
      {
        id: '4-8-q2',
        question: 'Phantom read refers to?',
        options: [
          'Same row same value twice',
          'Range query returning different rows because of inserts/deletes',
          'TLS handshake',
          'Index corruption only',
        ],
        correctIndex: 1,
        explanation:
          'Phantoms are about changing membership of a result set.',
      },
      {
        id: '4-8-q3',
        question: 'MVCC primarily helps by?',
        options: [
          'Removing disks',
          'Letting readers use snapshots while writers create new row versions',
          'Disabling indexes',
          'Guaranteeing zero latency',
        ],
        correctIndex: 1,
        explanation:
          'Versioning reduces blocking between readers and writers.',
      },
      {
        id: '4-8-q4',
        question: 'Strongest standard isolation level listed?',
        options: ['Read Uncommitted', 'Serializable', 'Read Committed', 'UDP'],
        correctIndex: 1,
        explanation:
          'Serializable aims to prevent all interleaving anomalies (often with cost).',
      },
      {
        id: '4-8-q5',
        question: 'Lost update classic fix?',
        options: [
          'Ignore conflicts',
          'Optimistic versioning or explicit row locks / atomic SQL updates',
          'Disable WAL',
          'Use only SELECT *',
        ],
        correctIndex: 1,
        explanation:
          'You need atomic read-modify-write or locking to combine increments.',
      },
      {
        id: '4-8-q6',
        question: 'PostgreSQL default isolation?',
        options: ['Serializable', 'Read Committed', 'Read Uncommitted', 'None'],
        correctIndex: 1,
        explanation:
          'Postgres defaults to Read Committed for new transactions.',
      },
    ],
  },
  {
    id: 'normalization-vs-denormalization',
    title: 'Normalization vs Denormalization',
    interviewTip:
      'Start normalized in interviews, then denormalize hot read paths with a story: feed fan-out, counter caches, or search indexes — and how you keep them consistent.',
    readContent: `# Normalization

**Normalization** splits facts so each piece lives **once**, linked by keys. **1NF** — atomic columns; **2NF** — no partial key dependencies; **3NF** — no transitive dependencies across non-keys. You do not need to recite definitions; you need to know **why**: **updates** touch one row, **integrity** is easy, **storage** shrinks.

# Denormalization

**Denormalization** **duplicates** data on purpose: store **user_display_name** on every **comment** row to avoid a **JOIN** on read. Reads become **blazing**; updates become **pain** — rename user → **fan-out** updates or accept staleness.

# Tradeoff

| Style | Reads | Writes | Integrity |
| --- | --- | --- | --- |
| Normalized | More joins | Cheaper | Strong |
| Denormalized | Cheaper | Expensive / async fixup | Riskier |

# When to normalize

**Write-heavy** truth tables (ledgers), **frequently changing** attributes, **strong consistency** requirements.

# When to denormalize

**Read-heavy** (90%+), **latency SLOs** in milliseconds, **NoSQL** access patterns, **materialized** projections fed by events.

> ANALOGY: Normalization is a **single Google Doc contact list** everyone links to. Denormalization is **printing that list for every teammate** — faster to read your copy, nightmare to update every printout when someone moves.

> INTERVIEW TIP: Show maturity: "**3NF online store schema**, plus **denormalized search doc in Elasticsearch** fed by CDC."

## Eventual consistency of copies

If you duplicate, define **how** replicas catch up — **outbox**, **CDC**, **periodic rebuild**.

# How this shows up on the job

Engineering teams rarely debate theory in a vacuum — they debate **latency graphs** at 02:00. When you own a service backed by a database, you open dashboards for **CPU**, **I/O wait**, **replication lag**, **buffer hit ratio**, and **p99 query time**. You read **EXPLAIN** plans, argue about **composite index column order**, and decide whether a **partial index** is worth planner surprises. You pair with **SREs** to tune **connection pools** after **max_connections** incidents. The mental models here are what you use in those meetings: find the **critical path**, quantify it, shrink work on that path. In interviews, narrate the same **metrics** — specificity beats buzzwords.

# What to practice next

List **every** query your **happy path** issues. Count round trips. For each, ask: **indexable**? **N+1**? **Cacheable**? Re-run after adding **Redis** or a **read replica**. The loop **measure → change one variable → re-measure** is how databases actually get faster in production.
`,
    quizQuestions: [
      {
        id: '4-9-q1',
        question: 'Normalization mainly reduces?',
        options: ['Read speed always', 'Data duplication and update anomalies', 'Need for primary keys', 'Network latency'],
        correctIndex: 1,
        explanation:
          'Single source of truth per fact simplifies updates.',
      },
      {
        id: '4-9-q2',
        question: 'Denormalization helps most when?',
        options: [
          'Writes dominate and change often',
          'Reads dominate and JOINs are costly hot path',
          'You hate indexes',
          'You need zero storage',
        ],
        correctIndex: 1,
        explanation:
          'Duplication trades write complexity for read speed.',
      },
      {
        id: '4-9-q3',
        question: 'Duplicating username on every comment row makes renaming?',
        options: [
          'Free',
          'Require updating many rows or accepting stale reads',
          'Impossible',
          'Automatic via DNS',
        ],
        correctIndex: 1,
        explanation:
          'Denormalized fields need fan-out writes or async repair.',
      },
      {
        id: '4-9-q4',
        question: 'Third normal form roughly means?',
        options: [
          'Only one row per database',
          'Non-key columns depend on the key, not on other non-key columns',
          'No indexes allowed',
          'All tables merged',
        ],
        correctIndex: 1,
        explanation:
          'Eliminates transitive dependency chains off the key.',
      },
      {
        id: '4-9-q5',
        question: 'Interview-ready approach?',
        options: [
          'Always fully denormalized blobs',
          'Normalize core OLTP, denormalize projections for specific read models',
          'Never use SQL',
          'One table for everything',
        ],
        correctIndex: 1,
        explanation:
          'Hybrid designs match each access path.',
      },
    ],
  },
  {
    id: 'cap-theorem',
    title: 'CAP Theorem',
    interviewTip:
      'CAP applies during partitions. Say: "Payments need CP — fail rather than double-spend; social feed can be AP with eventual convergence."',
    readContent: `# What CAP says

**CAP** states that when a **network partition** splits your distributed system, you cannot simultaneously guarantee **both**:

- **C** — every read reflects the latest successful write (linearizable / strong consistency story)
- **A** — every request receives a **non-error** response from the non-failing nodes
- while also claiming **P** — **partition tolerance** (the system keeps operating despite dropped messages between nodes)

Since **partitions happen in real WANs**, **P** is non-negotiable for distributed systems — the practical trade is **CP vs AP behavior during that partition**.

# CP systems

Prefer **refusing** requests or **failing** rather than serving **stale** answers. Examples often cited: **ZooKeeper**, strongly consistent **Mongo** writes with **majority**, **HBase**. Good when **wrong data** is worse than **downtime** — **bank balances**.

# AP systems

Stay **available** with **best-effort** possibly **stale** reads/writes, **reconciling** later. **Cassandra**, **Dynamo-style** stores, **CouchDB**, even **DNS** behave this way under partition. Good when **availability** beats **perfect freshness** — **feeds**, **likes**, **shopping cart UX**.

# CA label

**CA** (no partition) only makes sense for **single-node** systems. Distributed marketing using "CA" is usually hand-waving.

# PACELC extension

When **E**lse (no partition), still trade **L**atency vs **C**onsistency: **quorum reads** are slower but fresher; **local reads** are fast but may lag.

# Eventual consistency

Replicas **converge** after connectivity returns; divergence window often **ms–s** depending on design.

> ANALOGY: Two **bank branches** lose the phone line. **CP**: both stop complex transfers until reconciled. **AP**: both keep taking paper slips, then **merge** later — faster service, **conflict resolution** needed.

> IMPORTANT: CAP describes **partition behavior**, not normal operation. In the happy path, many systems deliver **both** good availability and strong consistency until the network splits.

> INTERVIEW TIP: Tie CAP to product: "**CP for wallet service; AP for notification fan-out with reconciliation.**"

## Nuance

Real databases expose **tunable** consistency — CAP is a **lens**, not a spec sheet.

# How this shows up on the job

Engineering teams rarely debate theory in a vacuum — they debate **latency graphs** at 02:00. When you own a service backed by a database, you open dashboards for **CPU**, **I/O wait**, **replication lag**, **buffer hit ratio**, and **p99 query time**. You read **EXPLAIN** plans, argue about **composite index column order**, and decide whether a **partial index** is worth planner surprises. You pair with **SREs** to tune **connection pools** after **max_connections** incidents. The mental models here are what you use in those meetings: find the **critical path**, quantify it, shrink work on that path. In interviews, narrate the same **metrics** — specificity beats buzzwords.

# What to practice next

List **every** query your **happy path** issues. Count round trips. For each, ask: **indexable**? **N+1**? **Cacheable**? Re-run after adding **Redis** or a **read replica**. The loop **measure → change one variable → re-measure** is how databases actually get faster in production.
`,
    quizQuestions: [
      {
        id: '4-10-q1',
        question: 'During a partition, why must distributed systems choose between C and A?',
        options: [
          'They never partition',
          'Cannot both answer every request immediately and guarantee latest global write',
          'TCP forbids it',
          'DNS requires it',
        ],
        correctIndex: 1,
        explanation:
          'Split brain makes simultaneous strong consistency and total availability impossible.',
      },
      {
        id: '4-10-q2',
        question: 'Which workload leans CP?',
        options: ['Social like counts', 'Authoritative balance transfers', 'CDN cache', 'Client CPU'],
        correctIndex: 1,
        explanation:
          'Financial correctness usually prefers failing over wrong balances.',
      },
      {
        id: '4-10-q3',
        question: 'AP systems during partition may?',
        options: [
          'Never respond',
          'Serve responses that are temporarily inconsistent across clients',
          'Disable TLS',
          'Remove disks',
        ],
        correctIndex: 1,
        explanation:
          'Availability often trades off strict freshness until merge.',
      },
      {
        id: '4-10-q4',
        question: 'Eventual consistency means?',
        options: [
          'Writes never propagate',
          'Replicas converge after delays if the system quiesces',
          'Strong serializability always',
          'No databases',
        ],
        correctIndex: 1,
        explanation:
          'Temporary divergence is allowed; convergence is the promise.',
      },
      {
        id: '4-10-q5',
        question: 'PACELC adds which idea?',
        options: [
          'Partitions never happen',
          'Even without partitions, trade latency vs consistency',
          'TLS is optional',
          'RAM is slower than HDD',
        ],
        correctIndex: 1,
        explanation:
          'ELC captures normal-path latency/consistency knobs.',
      },
      {
        id: '4-10-q6',
        question: '"CA" in CAP marketing usually means?',
        options: [
          'Multi-region partition proof',
          'Single-site system ignoring partition reality',
          'Always better than CP',
          'Certificate Authority',
        ],
        correctIndex: 1,
        explanation:
          'True CA without P is basically non-distributed.',
      },
    ],
  },
];
