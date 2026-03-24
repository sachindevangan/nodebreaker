import type { Topic } from '@/constants/curriculumTypes';

const demoWhyCache: Topic['simulatorDemo'] = {
  description:
    'Without a cache, every read hits the database. Under load the database saturates first.',
  instruction:
    'Run the simulation: the database turns red at 500 req/s while upstream wants more. Stop, drag a **Cache** from the palette between Service and Database, wire Service → Cache → Database (or Service → Cache and Cache → DB). Run again: most reads can be absorbed by the fast cache tier so the database stays healthier — modeling a high cache hit ratio.',
  simulationAutoStart: true,
  setupNodes: [
    {
      type: 'loadBalancer',
      label: 'Load Balancer',
      position: { x: 0, y: 80 },
      data: { throughput: 20000, latency: 2, capacity: 60000 },
    },
    {
      type: 'service',
      label: 'Service',
      position: { x: 250, y: 80 },
      data: { throughput: 8000, latency: 5, capacity: 25000 },
    },
    {
      type: 'database',
      label: 'Database',
      position: { x: 500, y: 80 },
      data: { throughput: 500, latency: 40, capacity: 5000 },
    },
  ],
  setupEdges: [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
  ],
};

export const CHAPTER_5_TOPICS: Topic[] = [
  {
    id: 'why-caching-matters',
    title: 'Why Caching Matters',
    interviewTip:
      'When the prompt mentions high read QPS or slow p95, your first lever is a cache tier with hit ratio, TTL, and invalidation — before sharding the database.',
    simulatorDemo: demoWhyCache,
    readContent: `# RAM vs disk: the gap that defines careers

**DRAM** reads land near **~100 ns** when hot. A single random **SSD** read is often **~50–100 µs** — already **500×–1000×** slower than RAM at the same order-of-magnitude napkin math. Spinning **HDD** seeks stretch to **milliseconds**. A **database query** that touches disk routinely costs **~5–50 ms** end-to-end once you include planning, locks, and network. A **Redis GET** is often **~0.1–1 ms** same datacenter.

That is not a rounding error — it is why **caching** is the highest ROI change in most read-heavy systems.

# Cache hit ratio

**Hit ratio** = fraction of reads satisfied from the fast tier. If **90%** of reads hit cache, the database only sees **10%** of logical read load. At **10k req/s** with one read each, **90% hits** ⇒ **1k** database queries/s instead of **10k** — a **10×** reduction in pressure on your bottleneck tier.

# What to cache

**Good candidates**: user profiles, product metadata, feature flags, config blobs, computed aggregates that change slowly, permission lists, home feed **skeletons** when combined with freshness strategy.

**Poor candidates**: unique per-request payloads, secrets without encryption, stock ticks that change every millisecond (unless you embrace staleness deliberately), giant payloads that blow memory.

# Hit vs miss

**Hit** — key present and fresh ⇒ return immediately. **Miss** — fetch from source of truth, **populate** cache (often with **TTL**), return. Miss path pays full latency; repeated misses on same key under load cause **stampedes** (later topic).

# Where caches live

**Browser** (HTTP headers), **CDN** (edge), **reverse proxy**, **application Redis**, **database buffer pool** (still disk-backed eventually), **CPU caches** (L1/L2). Each layer removes work from the layer below.

# Impact story

Teams routinely see **5–10×** average latency improvement on hot endpoints after a well-placed cache with **85–95%** hit ratio. Throughput ceiling rises because cheap RAM ops replace expensive SQL.

> ANALOGY: **Cache** is your **desk**; the **database** is the **filing cabinet** across the building. Keep the **10% of papers** you touch hourly on your desk — **90% of requests** never leave your arms reach. Occasionally you walk to the cabinet (miss) and photocopy a sheet back to the desk.

> NUMBERS: **~100 ns** RAM vs **~100 µs** SSD vs **~10 ms** HDD seek classically cited. **Redis** often **100k+ ops/s** per node for simple commands. Target **85–95%** hit ratio on hot keys when data allows. Effective speedups **5–10×** on median latency are common when DB was the drag.

> INTERVIEW TIP: Lead with "**cache-aside Redis with TTL + stampede protection**" whenever read amplification or DB saturation appears.

## Failure thinking

Caches are **optimizations**, not sources of truth — design **degraded** mode when Redis disappears: slower, but **correct** via database.

# How this shows up on the job

Caching is where **product** meets **distributed systems**. Product wants **instant** UX; finance wants **correct** balances — you reconcile with **TTL**, **invalidation**, and **flags**. On call you watch **Redis memory**, **eviction** rate, and **hit ratio** after a deploy that renamed keys. You distinguish **stampede**, **hot key**, and **undersized** memory. In interviews, add **dashboards**: what you chart, what pages you, how you **rollback** a bad rollout.

# What to practice next

Draw **cache-aside** timelines for **read**, **update**, and **Redis down**. Mark **race** windows. Add **locks**, **versions**, **TTL backstop**, or **CDC** invalidation. Timelines expose gaps talk-alouds hide.
`,
    quizQuestions: [
      {
        id: '5-1-q1',
        question: '10k req/s, 1 DB read each, 90% cache hit ratio — about how many DB reads per second?',
        options: ['10k', '1k', '100k', '0'],
        correctIndex: 1,
        explanation:
          'Miss rate 10% × 10k = 1k database queries/s.',
      },
      {
        id: '5-1-q2',
        question: 'Which is a poor primary cache candidate?',
        options: [
          'Product catalog by SKU',
          'Unique nonce generated per request',
          'Session token metadata',
          'Read-only country list',
        ],
        correctIndex: 1,
        explanation:
          'Per-request unique keys never hit; they waste memory.',
      },
      {
        id: '5-1-q3',
        question: 'Why is RAM caching faster than hitting PostgreSQL for the same bytes?',
        options: [
          'PostgreSQL forbids reads',
          'RAM avoids disk/network-heavy query paths for hot data',
          'TCP is slower than UDP always',
          'Indexes remove RAM',
        ],
        correctIndex: 1,
        explanation:
          'In-memory stores skip much of the storage engine path on hits.',
      },
      {
        id: '5-1-q4',
        question: 'Cache hit means?',
        options: [
          'Data not found',
          'Served from the cache tier without full source load',
          'Database crashed',
          'TTL expired',
        ],
        correctIndex: 1,
        explanation:
          'Hits take the fast path; misses fall through to the origin.',
      },
      {
        id: '5-1-q5',
        question: 'High hit ratio primarily reduces?',
        options: [
          'DNS lookups only',
          'Load on the origin database or service',
          'Need for TLS',
          'HTTP methods',
        ],
        correctIndex: 1,
        explanation:
          'Most repeated work is skipped at the fast tier.',
      },
      {
        id: '5-1-q6',
        question: 'A realistic target hit ratio for hot stable keys?',
        options: ['5%', '30%', '85–95%', '0%'],
        correctIndex: 2,
        explanation:
          'Well-designed caches on warm keys often land north of 85%.',
      },
    ],
  },
  {
    id: 'cache-aside-pattern',
    title: 'Cache-Aside Pattern',
    interviewTip:
      'Default answer for "how do you cache?" — app checks Redis, on miss loads DB, sets TTL, returns. Mention warming for launches.',
    readContent: `# Cache-aside (lazy loading)

**Cache-aside** is the pattern your team probably already uses: **application code** owns the logic. On a read:

1. **Look up** key in Redis/Memcached.
2. **Hit** — deserialize and return.
3. **Miss** — query **database**, compute value, **SET** with **TTL**, return.

Writes usually **update database first** (or in tandem with invalidation — see invalidation topic). The cache is not authoritative; it is a **hint**.

# Why it dominates

**Pros**: only **hot** keys occupy RAM; **cache down** ⇒ still works (slower); straightforward to reason about in code reviews; works with any data store.

**Cons**: first request after expiry always **misses** (latency spike); **stale** unless you invalidate; you must write **disciplined** glue code everywhere.

# Pseudocode mental model

On **getUser(id)**: try cache key **user:{id}**; miss ⇒ **SELECT** user row; **SETEX** 300s; return DTO. On **updateUser** ⇒ **UPDATE** SQL; **DEL** cache key or **SET** fresh JSON.

# Cache warming

Before a **product launch** or **viral event**, pre-fill hot keys from a batch job so the first real user does not pay **thundering herd** costs.

# Contrast with read-through

In **read-through**, the **cache library** calls a loader callback on miss — still lazy, but logic centralized in the cache client. Cache-aside keeps **explicit** control in service code.

> INTERVIEW TIP: Unless the prompt screams otherwise, describe **cache-aside** first, then mention alternatives.

## Observability

Track **hit ratio**, **latency**, **eviction** rate, and **memory** usage per key prefix — alarms when hit ratio collapses.

# How this shows up on the job

Caching is where **product** meets **distributed systems**. Product wants **instant** UX; finance wants **correct** balances — you reconcile with **TTL**, **invalidation**, and **flags**. On call you watch **Redis memory**, **eviction** rate, and **hit ratio** after a deploy that renamed keys. You distinguish **stampede**, **hot key**, and **undersized** memory. In interviews, add **dashboards**: what you chart, what pages you, how you **rollback** a bad rollout.

# What to practice next

Draw **cache-aside** timelines for **read**, **update**, and **Redis down**. Mark **race** windows. Add **locks**, **versions**, **TTL backstop**, or **CDC** invalidation. Timelines expose gaps talk-alouds hide.
`,
    quizQuestions: [
      {
        id: '5-2-q1',
        question: 'In cache-aside, who is responsible for populating the cache on miss?',
        options: [
          'Only the database triggers',
          'The application code after reading the source of truth',
          'The browser automatically',
          'DNS resolver',
        ],
        correctIndex: 1,
        explanation:
          'App loads origin and writes the cache entry.',
      },
      {
        id: '5-2-q2',
        question: 'First request after a cold start typically?',
        options: [
          'Always hits cache',
          'Misses then populates cache for later requests',
          'Deletes the database',
          'Uses UDP',
        ],
        correctIndex: 1,
        explanation:
          'Cold keys pay full origin cost once.',
      },
      {
        id: '5-2-q3',
        question: 'Advantage of cache-aside when Redis fails?',
        options: [
          'Data loss acceptable',
          'Service can still read directly from database, degraded latency',
          'App must crash',
          'Writes stop forever',
        ],
        correctIndex: 1,
        explanation:
          'Origin remains; cache is optional fast path.',
      },
      {
        id: '5-2-q4',
        question: 'Disadvantage vs write-through?',
        options: [
          'Cannot use TTL',
          'Possible staleness until invalidation or TTL expiry',
          'No misses possible',
          'Requires graph DB',
        ],
        correctIndex: 1,
        explanation:
          'Cache-aside tolerates lag between DB update and cache refresh.',
      },
      {
        id: '5-2-q5',
        question: 'Cache warming helps with?',
        options: [
          'Removing TTL',
          'Avoiding mass misses right after deploy or before traffic spikes',
          'Disabling HTTPS',
          'Sharding Redis automatically',
        ],
        correctIndex: 1,
        explanation:
          'Preload hot keys so early traffic sees hits.',
      },
    ],
  },
  {
    id: 'write-through-write-behind',
    title: 'Write-Through & Write-Behind',
    interviewTip:
      'Name all four: cache-aside, read-through, write-through, write-behind. Tie write-behind to risk (durability) and write-through to consistency.',
    readContent: `# Write-through

**Write-through** updates **cache and database together** (conceptually synchronously). After the write completes, **reads** can trust the cache. **Pros**: cache always fresh for those keys. **Cons**: writes pay **both** costs; still need invalidation discipline for other keys.

# Write-behind (write-back)

**Write-behind** acknowledges the write after updating **cache**, then **asynchronously** batches/flushes to the database. **Pros**: jaw-dropping **write throughput** and smooth spikes. **Cons**: if the process dies before flush, **data loss**; reconciliation complexity; ordering challenges.

# Read-through

Application talks **only** to cache API; cache **loads** from DB on miss internally. Simplifies call sites but couples you to client features.

# Comparison

| Pattern | Read speed | Write speed | Consistency | Risk |
| --- | --- | --- | --- | --- |
| Cache-aside | Fast after warm | Medium | TTL/invalidation | Low |
| Read-through | Fast | Medium | Same | Low |
| Write-through | Fast reads | Slower | Strong for cached keys | Medium |
| Write-behind | Fast reads | Fastest | Eventual | Data loss if mishandled |

# When to pick

- **Money** — avoid write-behind unless you have **durable queues** and audits.
- **Analytics / logs** — write-behind or **queue** to warehouse.
- **Read-heavy dashboards** after write — **write-through** or **invalidate**.

> ANALOGY: **Write-through** is filing paperwork **in both** your desk folder **and** the central archive **before** you say "done." **Write-behind** is scribbling on sticky notes all day and batch-scanning at 5 PM — fast until the building loses power at 4:55.

> INTERVIEW TIP: Mention **write-through** for **inventory locks** and **write-behind** only with **Kafka/outbox** durability story.

## Read-your-writes

Pair caches with **session stickiness** or **version tokens** if users must not see regressions after updating profile data.

# How this shows up on the job

Caching is where **product** meets **distributed systems**. Product wants **instant** UX; finance wants **correct** balances — you reconcile with **TTL**, **invalidation**, and **flags**. On call you watch **Redis memory**, **eviction** rate, and **hit ratio** after a deploy that renamed keys. You distinguish **stampede**, **hot key**, and **undersized** memory. In interviews, add **dashboards**: what you chart, what pages you, how you **rollback** a bad rollout.

# What to practice next

Draw **cache-aside** timelines for **read**, **update**, and **Redis down**. Mark **race** windows. Add **locks**, **versions**, **TTL backstop**, or **CDC** invalidation. Timelines expose gaps talk-alouds hide.
`,
    quizQuestions: [
      {
        id: '5-3-q1',
        question: 'Write-through primarily trades?',
        options: [
          'Stronger write latency for simpler fresh reads from cache',
          'Infinite write speed with zero cost',
          'Removal of databases',
          'TLS overhead',
        ],
        correctIndex: 0,
        explanation:
          'Both cache and DB update on the write path.',
      },
      {
        id: '5-3-q2',
        question: 'Main risk of write-behind?',
        options: [
          'Always faster reads with no downside',
          'Data loss if cache dies before flush to durable store',
          'It cannot batch',
          'It disables indexes',
        ],
        correctIndex: 1,
        explanation:
          'Async flush windows create durability exposure.',
      },
      {
        id: '5-3-q3',
        question: 'Read-through means?',
        options: [
          'App never uses cache',
          'App asks cache; cache loads origin on miss transparently',
          'Only writes allowed',
          'DNS based reads',
        ],
        correctIndex: 1,
        explanation:
          'Loader logic lives in the cache client layer.',
      },
      {
        id: '5-3-q4',
        question: 'High-consistency financial ledger update path?',
        options: [
          'Pure write-behind to RAM only',
          'Synchronous durable DB commit; cache updated or invalidated after',
          'Delete all indexes',
          'Client-side only storage',
        ],
        correctIndex: 1,
        explanation:
          'Durability beats microsecond cache tricks for money.',
      },
      {
        id: '5-3-q5',
        question: 'Write-behind suits?',
        options: [
          'Authoritative bank balance without log',
          'High-volume metrics where loss of a slice is tolerable or replayable from queue',
          'TLS certificates',
          'DNS roots',
        ],
        correctIndex: 1,
        explanation:
          'Pair with durable buffering if you need both speed and safety.',
      },
      {
        id: '5-3-q6',
        question: 'Compared to cache-aside reads, write-through writes are?',
        options: ['Free', 'Heavier because two systems update', 'Impossible', 'Only for UDP'],
        correctIndex: 1,
        explanation:
          'You pay cache + database latency on write.',
      },
    ],
  },
  {
    id: 'ttl-and-eviction-policies',
    title: 'TTL & Eviction Policies',
    interviewTip:
      'State TTL with a reason: "product prices TTL 5m — stale OK for catalog; sessions 30m aligned with idle timeout." Name eviction: allkeys-lru vs volatile-lru.',
    readContent: `# TTL

**TTL** (time to live) is how long a cached entry may survive before **automatic deletion**. It bounds **staleness** and prevents infinite growth of garbage keys.

**Short TTL** (**30s–5m**) for volatile commerce data. **Medium** (**15–60m**) for semi-static config. **Long** (**24h**) for reference tables. **No TTL** only with explicit invalidation or truly static blobs (still risky).

# Eviction when memory is full

Policies decide **which victim** key to drop:

- **LRU** — evict **least recently used**. Default sweet spot for general workloads.
- **LFU** — evict **least frequently used**. Protects hot keys from one-off scans.
- **FIFO** — oldest inserted. Simple, often suboptimal.
- **Random** — cheap, surprisingly OK at scale.
- **TTL proximity** — evict keys **closest to expiry** first (**volatile-ttl**).

**Redis maxmemory** modes: **noeviction** (errors on write), **allkeys-lru**, **volatile-lru** (only keys with TTL), **allkeys-lfu**, etc.

# Choosing TTL + policy together

High churn data with tight memory ⇒ **volatile-lru** + sensible TTL. Unknown workload ⇒ **allkeys-lru** cap.

> NUMBERS: Common Redis instances **1–5 GB** (small), **10–50 GB** (medium). **~25 GB** per instance is often cited as a practical soft ceiling before cluster sharding — verify for your version/workload. **Memcached** can be **slightly more memory-efficient** for plain strings.

> INTERVIEW TIP: Always pair **TTL** with **eviction** policy reasoning.

## Monitoring

Alert on **evicted_keys** spikes — means working set exceeds RAM.

# How this shows up on the job

Caching is where **product** meets **distributed systems**. Product wants **instant** UX; finance wants **correct** balances — you reconcile with **TTL**, **invalidation**, and **flags**. On call you watch **Redis memory**, **eviction** rate, and **hit ratio** after a deploy that renamed keys. You distinguish **stampede**, **hot key**, and **undersized** memory. In interviews, add **dashboards**: what you chart, what pages you, how you **rollback** a bad rollout.

# What to practice next

Draw **cache-aside** timelines for **read**, **update**, and **Redis down**. Mark **race** windows. Add **locks**, **versions**, **TTL backstop**, or **CDC** invalidation. Timelines expose gaps talk-alouds hide.
`,
    quizQuestions: [
      {
        id: '5-4-q1',
        question: 'TTL primarily bounds?',
        options: [
          'CPU GHz',
          'How stale a cached value may be and recycles memory',
          'TLS version',
          'Number of tables',
        ],
        correctIndex: 1,
        explanation:
          'Expiry refreshes data and caps lifetime.',
      },
      {
        id: '5-4-q2',
        question: 'LRU evicts?',
        options: [
          'Newest key always',
          'Key unused for the longest time',
          'Random infinite keys',
          'Only permanent keys',
        ],
        correctIndex: 1,
        explanation:
          'Recency approximates future usefulness.',
      },
      {
        id: '5-4-q3',
        question: 'LFU can outperform LRU when?',
        options: [
          'Never',
          'Some keys are consistently hot vs one-off large scans',
          'Only with HDD',
          'Only without TTL',
        ],
        correctIndex: 1,
        explanation:
          'Frequency protects core hot set from scan pollution.',
      },
      {
        id: '5-4-q4',
        question: 'Redis noeviction means?',
        options: [
          'Never store data',
          'Writes error when memory full instead of evicting',
          'Automatic infinite RAM',
          'Deletes primary keys',
        ],
        correctIndex: 1,
        explanation:
          'Ops pick this when losing writes is worse than failing fast.',
      },
      {
        id: '5-4-q5',
        question: 'Session cookie server-side cache TTL often aligns with?',
        options: [
          'DNS root TTL',
          'Idle/session timeout policy (e.g. 30 minutes)',
          'HDD seek time',
          'CPU L1 size',
        ],
        correctIndex: 1,
        explanation:
          'Match business logout semantics.',
      },
      {
        id: '5-4-q6',
        question: 'volatile-lru evicts?',
        options: [
          'Keys without TTL only',
          'Only among keys that have a TTL set',
          'Graph edges',
          'Database rows',
        ],
        correctIndex: 1,
        explanation:
          'Permanent keys stay unless other policies apply.',
      },
    ],
  },
  {
    id: 'cache-stampede',
    title: 'Cache Stampede',
    interviewTip:
      'After proposing caching, say how you prevent stampedes: singleflight lock, jittered TTL, stale-while-revalidate, or precompute.',
    readContent: `# Thundering herd on expiry

A **cache stampede** happens when a **hot key expires** and **thousands** of concurrent requests **miss** together, each hammering the **database** for the same payload. A DB cruising at **100 QPS** suddenly sees **10k** identical queries — latency explodes, pools exhaust, incidents page.

# Why TTL triggers it

Uniform **TTL** aligns expiries. Viral content magnifies pain: everyone reads the same key; when it drops, the herd is maximal.

# Mitigations

1. **Request coalescing / mutex** — first miss acquires lock; others wait or read **stale** while refresh completes.
2. **Jitter** — TTL = base + random **0–60s** spreads expiries across time.
3. **Proactive refresh** — background job refreshes before expiry; users never observe empty slot.
4. **Stale-while-revalidate** — serve **slightly old** value immediately, async refresh; **CDN** pattern too.

> ANALOGY: One **parking spot** frees at **6:00 PM** sharp; **50 cars** circle. **Fix**: stagger departures or **valet** dispatches one car at a time (lock) while others temporarily use **overflow lot** (stale).

> IMPORTANT: Stampedes cause **surprise** outages — always design hot-key paths assuming **simultaneous** expiry.

> INTERVIEW TIP: Mention **singleflight**/**per-key lock** + **TTL jitter** as default toolkit.

# How this shows up on the job

Caching is where **product** meets **distributed systems**. Product wants **instant** UX; finance wants **correct** balances — you reconcile with **TTL**, **invalidation**, and **flags**. On call you watch **Redis memory**, **eviction** rate, and **hit ratio** after a deploy that renamed keys. You distinguish **stampede**, **hot key**, and **undersized** memory. In interviews, add **dashboards**: what you chart, what pages you, how you **rollback** a bad rollout.

# What to practice next

Draw **cache-aside** timelines for **read**, **update**, and **Redis down**. Mark **race** windows. Add **locks**, **versions**, **TTL backstop**, or **CDC** invalidation. Timelines expose gaps talk-alouds hide.
`,
    quizQuestions: [
      {
        id: '5-5-q1',
        question: 'Cache stampede describes?',
        options: [
          'Too many cache hits',
          'Many concurrent misses on the same key overwhelming the origin',
          'TLS errors',
          'Happy path only',
        ],
        correctIndex: 1,
        explanation:
          'Coordinated expiry + popularity = thundering herd.',
      },
      {
        id: '5-5-q2',
        question: 'TTL jitter helps by?',
        options: [
          'Aligning all expiries to the same second',
          'Spreading expirations so misses do not synchronize',
          'Removing TTL',
          'Disabling Redis',
        ],
        correctIndex: 1,
        explanation:
          'Randomness desynchronizes refresh storms.',
      },
      {
        id: '5-5-q3',
        question: 'Per-key mutex / singleflight reduces?',
        options: [
          'Cache hits',
          'Duplicate in-flight origin fetches for the same key',
          'Database size',
          'HTTP version',
        ],
        correctIndex: 1,
        explanation:
          'Only one refresher does work; others wait or use stale.',
      },
      {
        id: '5-5-q4',
        question: 'Stale-while-revalidate gives users?',
        options: [
          'Always blocking 503',
          'Fast slightly stale data while refresh happens async',
          'No cache',
          'Only writes',
        ],
        correctIndex: 1,
        explanation:
          'UX stays smooth; freshness catches up in background.',
      },
      {
        id: '5-5-q5',
        question: 'High-traffic celebrity profile without protection risks?',
        options: [
          'Lower DB load',
          'Sudden DB spike at key expiry',
          'Infinite RAM',
          'DNS failure',
        ],
        correctIndex: 1,
        explanation:
          'Hot keys need stampede-aware patterns.',
      },
    ],
  },
  {
    id: 'cache-invalidation',
    title: 'Cache Invalidation',
    interviewTip:
      'Quote Karlton, then give your playbook: delete-on-write + short TTL safety net, or CDC consumer, plus versioned keys for hard cases.',
    readContent: `# The hard problem

"There are only two hard things in Computer Science: **cache invalidation** and naming things." — Phil Karlton (often misattributed, always remembered). Stale cache means **users see lies**: wrong price, reactivated banned user, rolled-back feature flag.

# Strategies

**TTL only** — simplest; accept staleness up to TTL. Great when business tolerates lag (**feeds**, **CDN**).

**Delete on write** — after successful DB update, **DEL** cache key. Next read repopulates fresh value. Watch **ordering** bugs.

**Update on write** — write new JSON directly; avoids immediate miss but couples serialization logic.

# Race conditions

If you **delete** before DB commit completes, a reader might **cache old data** that just got re-read — now stale until TTL. Safer pattern: **update DB**, **commit**, **then delete** or **publish version**.

# CDC / events

**Change Data Capture** streams mutations; a worker **invalidates** keys. Survives **multiple writers** and **cron** jobs that bypass app layer.

> IMPORTANT: Keep a **TTL safety net** even with perfect invalidation code — bugs happen; TTL heals eventually.

> INTERVIEW TIP: Say "**delete after commit + 5m TTL backstop**" for a crisp answer.

## Versioned keys

Key includes **schema_version** or **etag** so incompatible blobs die naturally.

# How this shows up on the job

Caching is where **product** meets **distributed systems**. Product wants **instant** UX; finance wants **correct** balances — you reconcile with **TTL**, **invalidation**, and **flags**. On call you watch **Redis memory**, **eviction** rate, and **hit ratio** after a deploy that renamed keys. You distinguish **stampede**, **hot key**, and **undersized** memory. In interviews, add **dashboards**: what you chart, what pages you, how you **rollback** a bad rollout.

# What to practice next

Draw **cache-aside** timelines for **read**, **update**, and **Redis down**. Mark **race** windows. Add **locks**, **versions**, **TTL backstop**, or **CDC** invalidation. Timelines expose gaps talk-alouds hide.
`,
    quizQuestions: [
      {
        id: '5-6-q1',
        question: 'TTL-only invalidation is acceptable when?',
        options: [
          'Stock tick with legal SLA on freshness',
          'Slight staleness is business-tolerable',
          'Bank ledger',
          'Never',
        ],
        correctIndex: 1,
        explanation:
          'Bounded staleness must be OK by product rules.',
      },
      {
        id: '5-6-q2',
        question: 'Delete-on-write risk if delete happens before commit?',
        options: [
          'Always safe',
          'Another request may read uncommitted/old data and repopulate stale cache',
          'TLS breaks',
          'Redis deletes itself',
        ],
        correctIndex: 1,
        explanation:
          'Ordering relative to transaction visibility matters.',
      },
      {
        id: '5-6-q3',
        question: 'CDC-driven invalidation helps when?',
        options: [
          'Only one service writes data',
          'Many writers or jobs touch DB outside the main app',
          'No database exists',
          'DNS changes',
        ],
        correctIndex: 1,
        explanation:
          'Central stream catches all mutators.',
      },
      {
        id: '5-6-q4',
        question: 'Why keep TTL even with active invalidation?',
        options: [
          'TTL is illegal',
          'Safety net if invalidation code misses a path',
          'It removes RAM',
          'It deletes primary keys',
        ],
        correctIndex: 1,
        explanation:
          'Eventual healing beats permanent lies.',
      },
      {
        id: '5-6-q5',
        question: 'Update-on-write avoids?',
        options: [
          'All serialization',
          'Immediate post-invalidation miss latency on hot keys',
          'Databases',
          'HTTP',
        ],
        correctIndex: 1,
        explanation:
          'Cache stays warm but logic is trickier.',
      },
      {
        id: '5-6-q6',
        question: 'Karlton quote highlights?',
        options: [
          'Caching is trivially easy forever',
          'Keeping cache coherent is subtly hard',
          'Naming is solved',
          'TCP is hardest',
        ],
        correctIndex: 1,
        explanation:
          'Invalidation discipline separates junior from senior designs.',
      },
    ],
  },
  {
    id: 'hot-key-problem',
    title: 'Hot Key Problem',
    interviewTip:
      'For viral content or flash sales, discuss hot shards, local L1 cache, replicated logical keys, and monitoring Redis hotkey stats.',
    readContent: `# Skewed traffic

A **hot key** is one cache entry pounded far harder than neighbors — viral tweet, **SKU** on lightning deal, **global config** flag. Even Redis is **single-threaded per core** / per slot; one key on one node can max **CPU** or **network** while siblings idle.

# Why it hurts in cluster

Sharding places key **K** on **node N**. If **K** draws **500k req/s** but **N** tops out at **100k**, you lose — **horizontal scale** does not help because skew violates assumptions.

# Mitigations

**Local in-process cache** (seconds TTL) in front of Redis — reduces cross-network QPS but adds **per-pod** inconsistency.

**Logical replication** — store **hot:1..hot:8** identical payloads; client **random** shard; combine with **probabilistic** refresh.

**Read throttling / coalescing** — micro-batch refresh from origin.

**Detection** — Redis **HOTKEYS**, **MONITOR** (careful in prod), proxy metrics, **key-level** dashboards.

> ANALOGY: One **cashier** with every customer while others nap — open **express lanes** (replicas) or let people grab **pre-bagged** items from a shelf (**local cache**).

> INTERVIEW TIP: Pair hot-key talk with **single writer** origin + **fan-out** caches.

## Product fixes

Sometimes you **precompute** a **read model** in object storage and serve via **CDN** instead of dynamic cache.

# How this shows up on the job

Caching is where **product** meets **distributed systems**. Product wants **instant** UX; finance wants **correct** balances — you reconcile with **TTL**, **invalidation**, and **flags**. On call you watch **Redis memory**, **eviction** rate, and **hit ratio** after a deploy that renamed keys. You distinguish **stampede**, **hot key**, and **undersized** memory. In interviews, add **dashboards**: what you chart, what pages you, how you **rollback** a bad rollout.

# What to practice next

Draw **cache-aside** timelines for **read**, **update**, and **Redis down**. Mark **race** windows. Add **locks**, **versions**, **TTL backstop**, or **CDC** invalidation. Timelines expose gaps talk-alouds hide.
`,
    quizQuestions: [
      {
        id: '5-7-q1',
        question: 'Hot key means?',
        options: [
          'Key never accessed',
          'Disproportionate traffic to one cache entry/shard',
          'Cold storage only',
          'Deleted TTL',
        ],
        correctIndex: 1,
        explanation:
          'Skew breaks uniform sharding assumptions.',
      },
      {
        id: '5-7-q2',
        question: 'Local L1 cache tradeoff?',
        options: [
          'Perfect global consistency always',
          'Lower shared cache load but possible per-instance staleness',
          'Removes need for TLS',
          'Deletes database',
        ],
        correctIndex: 1,
        explanation:
          'Each pod may diverge briefly.',
      },
      {
        id: '5-7-q3',
        question: 'Key replication with random pick aims to?',
        options: [
          'Reduce total reads',
          'Spread load across multiple Redis entries/nodes',
          'Remove TTL',
          'Disable eviction',
        ],
        correctIndex: 1,
        explanation:
          'Many physical keys carry the same logical payload.',
      },
      {
        id: '5-7-q4',
        question: 'Detection relies on?',
        options: [
          'Guessing',
          'Key frequency metrics / HOTKEYS / proxy stats',
          'DNS only',
          'CPU vendor',
        ],
        correctIndex: 1,
        explanation:
          'Measure skew before designing mitigations.',
      },
      {
        id: '5-7-q5',
        question: 'Flash sale SKU is classic?',
        options: ['Cold key', 'Hot key', 'Immutable DNS', 'Graph traversal'],
        correctIndex: 1,
        explanation:
          'Everyone hits one identifier.',
      },
    ],
  },
  {
    id: 'redis-vs-memcached',
    title: 'Redis vs Memcached',
    interviewTip:
      'Default Redis for structures, persistence options, pub/sub, Lua. Mention Memcached for pure multi-threaded simple KV at huge scale (Facebook-style).',
    readContent: `# Redis

**Redis** is an **in-memory data structure server**: strings, **hashes**, **lists**, **sets**, **sorted sets**, **streams**, **HyperLogLog**, **bitmap**, **JSON** modules, etc. Features **pub/sub**, **Lua**, **transactions**, optional **RDB/AOF** persistence, **sentinel**, **cluster**. Mostly **single-threaded** command execution (per shard) — simple atomicity.

# Memcached

**Memcached** is a minimalist **multi-threaded** **string** cache. No **persistence** (pure volatile), no built-in replication (client-side sharding). Extremely **simple** and **memory-efficient** for small blobs.

# Comparison

| Feature | Redis | Memcached |
| --- | --- | --- |
| Data types | Rich | String blobs |
| Persistence | Optional | No |
| Threading | Mostly single-threaded | Multi-threaded |
| Pub/sub | Yes | No |
| Replication | Built-in story | External |

# When Memcached wins

Pure **GET/SET** at **multi-million** QPS on **fat CPUs**, **simple** semantics, teams already **expert**.

# When Redis wins

**Sorted sets** for leaderboards, **atomic counters** + **TTL** for rate limits, **streams**/**lists** for lightweight queues, **pub/sub** for fan-out.

> NUMBERS: **Redis** commonly **100k+ ops/s** per node; **Memcached** sometimes **200k+** simple ops/s on multi-core. **~90 bytes**/Redis key overhead vs **~48 bytes** Memcached often cited — measure with your payload.

> INTERVIEW TIP: Cite **specific Redis structures** for the feature (e.g., **ZSET** leaderboard).

## Ops note

Run both behind **TLS** and **AUTH** in cloud networks; enforce **maxmemory** + **eviction**.

# How this shows up on the job

Caching is where **product** meets **distributed systems**. Product wants **instant** UX; finance wants **correct** balances — you reconcile with **TTL**, **invalidation**, and **flags**. On call you watch **Redis memory**, **eviction** rate, and **hit ratio** after a deploy that renamed keys. You distinguish **stampede**, **hot key**, and **undersized** memory. In interviews, add **dashboards**: what you chart, what pages you, how you **rollback** a bad rollout.

# What to practice next

Draw **cache-aside** timelines for **read**, **update**, and **Redis down**. Mark **race** windows. Add **locks**, **versions**, **TTL backstop**, or **CDC** invalidation. Timelines expose gaps talk-alouds hide.
`,
    quizQuestions: [
      {
        id: '5-8-q1',
        question: 'Redis sorted sets suit?',
        options: ['DNS routing', 'Leaderboards with rank queries', 'SMTP', 'BGP'],
        correctIndex: 1,
        explanation:
          'ZSET combines score + lex ordering for ranges.',
      },
      {
        id: '5-8-q2',
        question: 'Memcached lacks?',
        options: ['Network', 'Built-in rich persistence/replication story', 'Memory', 'TCP'],
        correctIndex: 1,
        explanation:
          'Designed as volatile plain cache.',
      },
      {
        id: '5-8-q3',
        question: 'Multi-threaded advantage of Memcached?',
        options: [
          'Automatic SQL',
          'Uses multiple CPU cores for simple parallel GET/SET',
          'Removes eviction',
          'Adds JOINs',
        ],
        correctIndex: 1,
        explanation:
          'Throughput scales with cores for embarrassingly parallel cache ops.',
      },
      {
        id: '5-8-q4',
        question: 'Choose Redis when you need?',
        options: [
          'Only FTP',
          'Pub/sub, complex types, optional durability',
          'No memory limit',
          'Disk seeks',
        ],
        correctIndex: 1,
        explanation:
          'Feature richness wins most modern stacks.',
      },
      {
        id: '5-8-q5',
        question: 'Memory efficiency for tiny string values might favor?',
        options: ['Always Redis', 'Memcached in some deployments', 'HDD', 'SMTP'],
        correctIndex: 1,
        explanation:
          'Lower per-key overhead can matter at billions of keys.',
      },
      {
        id: '5-8-q6',
        question: 'Rate limiting with atomic INCR + TTL is natural in?',
        options: ['Memcached still impossible', 'Redis', 'DNS', 'FTP'],
        correctIndex: 1,
        explanation:
          'Atomic counters with expiry are idiomatic Redis.',
      },
    ],
  },
];
