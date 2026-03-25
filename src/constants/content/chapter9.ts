import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_9_TOPICS: Topic[] = [
  {
    id: 'why-synchronous-is-slow',
    title: 'Why Synchronous Is Slow',
    interviewTip:
      'Flag any work over ~500ms or CPU-heavy (image/video, PDF, email) as async: accept fast, queue background workers, poll or WebSocket for completion.',
    simulatorDemo: {
      description:
        'Show how a queue decouples fast API acknowledgment from slower downstream processing.',
      instruction:
        'Without a **queue**, a **slow Worker/Database** path **blocks** the **API** **throughput**. **Add** a **Task Queue** between **API Service** and **Worker** so the **API** **enqueues** **instantly** while **workers** **drain** **at** **their** **pace**—that is **async** **decoupling**. **Tune** **demand** **vs** **capacity** **to** **see** **green** **paths**.',
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
          label: 'API Service',
          position: { x: 300, y: 250 },
          data: { throughput: 5000, latency: 10, capacity: 20000 },
        },
        {
          type: 'queue',
          label: 'Task Queue',
          position: { x: 600, y: 250 },
          data: { throughput: 50000, latency: 2, capacity: 1000000 },
        },
        {
          type: 'worker',
          label: 'Worker',
          position: { x: 900, y: 250 },
          data: { throughput: 500, latency: 200, capacity: 2000 },
        },
      ],
      setupEdges: [
        { source: 0, target: 1 },
        { source: 1, target: 2 },
        { source: 2, target: 3 },
      ],
    },
    readContent: `# Why synchronous is slow

In a **synchronous** request–response flow, the caller waits until **every downstream step** finishes before getting an answer. That is simple to reason about, but it hides a brutal truth: **user-perceived latency equals the sum of every slow hop on the critical path**, not the average. If image processing takes seven seconds end to end, the user watches a spinner for seven seconds—even if they only needed confirmation that the upload **landed durably** (often tens of milliseconds of work).

## A concrete pipeline: uploads

Imagine an upload path that saves the original (**~50 ms**), generates thumbnails (**~2 s**), applies ML filters (**~3 s**), runs moderation (**~1 s**), and fans out feed updates (**~500 ms**). The **total** is roughly **6.5 seconds** of server work. Doing all of that inside one HTTP request ties your **web tier’s threads** to CPU-heavy jobs, reduces **concurrency**, and makes tail latency explode under load. The fix is architectural: **acknowledge quickly**, **enqueue** the heavy graph, **process asynchronously**, and **notify** the user when results are ready (push notification, email, WebSocket, or polling a status endpoint).

## Sync vs async trade-offs

**Synchronous** shines when work is **short**, **deterministic**, and **fits in one transaction**—simple CRUD, cache hits, authentication checks. You keep **strong consistency** in a single round trip and avoid distributed state machines.

**Asynchronous** shines when work is **long**, **bursty**, or **parallelizable** across workers. You pay complexity: **message durability**, **retries**, **idempotency**, **dead-letter queues**, **observable backlog**, and **user-facing state** (“processing”, “failed”, “ready”). That complexity buys **resilience** and **scale**: API servers stay thin and I/O bound while **worker fleets** scale on CPU.

## When to default to async

Favor async when operations routinely exceed **~500 ms**, touch **multiple services**, involve **third-party APIs** with variable latency, or require **heavy CPU** (video, PDF, ML inference). Also favor async when **spiky** traffic would otherwise **saturate** a monolithic request path—queues absorb bursts while workers catch up.

## Decoupling teams and tech

Queues let the **API** team ship Node services optimized for concurrency while **workers** run Python or Rust for numeric workloads. Each tier scales independently against its bottleneck. That separation is a **socio-technical** win, not just a performance trick.

> ANALOGY: Synchronous is staying on hold while the pharmacy fills your prescription. Async is dropping the script off and getting a text when it is ready—you get your time back immediately.

> INTERVIEW TIP: Whenever you spot slow work in a design, say: “We should **enqueue** this to **SQS/Rabbit**, return **202 Accepted** with a **job id**, and surface status in the UI.” Name the **notification** channel.

## Failure handling is part of the design

Async systems fail differently: workers crash, messages duplicate, poison payloads appear. You need **DLQs**, **retry policies**, **idempotency keys**, **metrics on queue age**, and **runbooks** for replay. None of that is optional—async is not “fire and forget,” it is **reliable background execution**.

Synchronous code is not bad—it is the wrong default for **long work disguised as a web request**. Separate **acceptance** from **execution** and your users (and your on-call rotation) will thank you.

## Interview scenarios to rehearse

**“How** **does** **the** **user** **know** **the** **job** **finished?”** **WebSockets**, **polling**, **email**, **push** **notifications**. **“What** **if** **the** **worker** **crashes** **mid-job?”** **Idempotency**, **checkpointing**, **visibility timeout > processing time**. **“How** **do** **you** **prevent** **queue** **floods?”** **Rate** **limits** **on** **enqueue**, **per-user** **quotas**, **priority** **queues**.
`,
    quizQuestions: [
      {
        id: '9-1-q1',
        question: 'Synchronous request handling means:',
        options: [
          'The client waits for the full pipeline before returning',
          'The client always gets immediate final results',
          'No server is involved',
          'Queues are mandatory',
        ],
        correctIndex: 0,
        explanation:
          'The caller blocks until the server completes the synchronous work.',
      },
      {
        id: '9-1-q2',
        question: 'Async processing helps UX when:',
        options: [
          'Work takes long but users only need acknowledgment quickly',
          'Work is always 1ms',
          'You want to delete all data',
          'You want to remove TLS',
        ],
        correctIndex: 0,
        explanation:
          'Split acceptance from processing to shorten perceived latency.',
      },
      {
        id: '9-1-q3',
        question: 'Decoupling API from workers allows:',
        options: [
          'Independent scaling and technology choices per tier',
          'Removing databases entirely',
          'Guaranteeing synchronous global consensus',
          'Disabling monitoring',
        ],
        correctIndex: 0,
        explanation:
          'Each tier scales against its bottleneck—I/O vs CPU.',
      },
      {
        id: '9-1-q4',
        question: 'Simple CRUD under 200ms is often:',
        options: [
          'Always async',
          'Reasonable to handle synchronously',
          'Illegal in HTTP',
          'Requires Kafka',
        ],
        correctIndex: 1,
        explanation:
          'Low-latency operations do not need background complexity.',
      },
      {
        id: '9-1-q5',
        question: 'A risk of moving to async pipelines is:',
        options: [
          'Increased complexity: retries, idempotency, and user-visible state tracking',
          'Zero complexity change',
          'Impossibility of scaling',
          'Removal of load balancers',
        ],
        correctIndex: 0,
        explanation:
          'Async systems must handle partial failure and duplicate delivery.',
      },
      {
        id: '9-1-q6',
        question: 'Background workers typically process:',
        options: [
          'Only DNS packets',
          'CPU-heavy or slow tasks off the critical HTTP path',
          'TLS certificates only',
          'Nothing',
        ],
        correctIndex: 1,
        explanation:
          'Workers drain queues for heavy work asynchronously.',
      },
    ],
  },
  {
    id: 'message-queues',
    title: 'Message Queues',
    interviewTip:
      'Queues answer burst absorption and decoupling: name SQS vs RabbitMQ tradeoffs (managed vs routing flexibility), visibility timeout, and DLQ (preview next topic).',
    readContent: `# Message queues

A **message queue** sits between **producers** (anything enqueueing work—API servers, cron jobs, other services) and **consumers** (workers processing jobs). Producers publish **messages** (JSON payloads, protobuf blobs, pointers to S3 objects) to a **broker** that persists them durably. Consumers fetch messages, do work, and **acknowledge** success—only then is the message removed or advanced. That simple loop is the backbone of async systems.

## Core vocabulary

- **Message**: unit of work plus metadata (id, timestamps, trace ids).
- **Queue**: ordered buffer—ordering guarantees vary (strict FIFO vs best-effort).
- **Broker**: the server cluster managing persistence and replication (RabbitMQ nodes, SQS control plane, Kafka brokers).

## Happy path walkthrough

The producer sends to the broker, which writes to disk (replicated for safety). A consumer receives via **long polling**, **push**, or **pub/sub** subscription depending on the system. It processes business logic—resize image, charge card, send email—and sends **ACK**. If the consumer crashes before ACK, the message becomes available again: **at-least-once** delivery is the default reality.

## Visibility timeout (SQS mental model)

When a consumer receives a message, many cloud queues **hide** it from other consumers for a **visibility timeout**—often **30 seconds** to minutes, configurable. If processing exceeds that window, another consumer might duplicate work—tune timeout to **p99 processing time** with buffer. This mechanism prevents two workers from processing the same message simultaneously while still allowing retries after crashes.

## FIFO vs standard queues

**FIFO** queues offer strict ordering and deduplication hooks but cap throughput (on the order of **thousands of messages per second** per queue before batching tricks). **Standard** queues prioritize availability and throughput with **best-effort** ordering—great for fan-out workloads where order is irrelevant.

## Popular systems

**AWS SQS** is fully managed, scales to massive throughput in standard mode, and integrates with IAM, Lambda, and DLQs. **RabbitMQ** shines when you need **exchanges, bindings, routing keys**, priorities, and on-prem control—expect **tens of thousands of messages per second** in strong clusters, workload dependent. **Redis Streams** offers lightweight queuing next to caching but is not a replacement for durable multi-tenant brokers when persistence guarantees matter most.

## Monitoring that matters

Watch **queue depth**, **age of oldest message**, **consumer lag**, and **error rates**. Rising depth means producers outpace consumers—scale workers, optimize handlers, or shed load. Depth is your early warning chart for incidents.

> ANALOGY: The waiter clips tickets to the rail; cooks pull them one by one. The dining room stays responsive even if the kitchen falls behind—the **queue** absorbs mismatch.

> NUMBERS: **SQS Standard** targets effectively unlimited throughput for typical apps; **FIFO** around **3,000 messages/sec** per queue (batch modes raise effective TPS). **Message size limit 256 KB**—store large binaries in **S3** and pass pointers. **Retention up to 14 days**.

> INTERVIEW TIP: “**Burst traffic → SQS absorbs spike**; **consumers scale on ApproximateNumberOfMessagesVisible**; **DLQ for poison pills**.”

Queues turn flaky networks and uneven processing speeds into **predictable backlogs**—if you pair them with explicit **delivery semantics**, **idempotent consumers**, and **alerting**.

## Interview scenarios to rehearse

**Compare** **SQS** **vs** **Rabbit** **vs** **Kafka** **in** **one** **minute**: **managed** **vs** **self-hosted**, **routing** **flexibility**, **throughput**, **ops** **burden**. **“How** **do** **you** **handle** **poison** **messages?”** **DLQ** **after** **maxReceiveCount**. **“Priority** **queues?”** **Rabbit** **priority**, **separate** **queues** **per** **tier**, **weighted** **consumers**.
`,
    quizQuestions: [
      {
        id: '9-2-q1',
        question: 'A producer in messaging is:',
        options: [
          'Always the database',
          'The component that sends messages to the broker',
          'The log file',
          'The CDN',
        ],
        correctIndex: 1,
        explanation:
          'Producers enqueue work; consumers process it.',
      },
      {
        id: '9-2-q2',
        question: 'Visibility timeout primarily:',
        options: [
          'Deletes messages instantly',
          'Hides an in-flight message from other consumers until ACK or timeout for retry',
          'Encrypts TLS',
          'Replaces DNS',
        ],
        correctIndex: 1,
        explanation:
          'It gives one consumer exclusive temporary ownership.',
      },
      {
        id: '9-2-q3',
        question: 'FIFO queues trade:',
        options: [
          'Nothing',
          'Ordering guarantees for typically lower throughput than high-throughput standard queues',
          'Durability for speed always',
          'HTTP for FTP',
        ],
        correctIndex: 1,
        explanation:
          'Strict ordering costs throughput compared to best-effort standard queues.',
      },
      {
        id: '9-2-q4',
        question: 'Growing queue depth usually signals:',
        options: [
          'Consumers are healthy and keeping up',
          'Producers outpace consumers or downstream work slowed',
          'Perfect load balance',
          'TLS failure',
        ],
        correctIndex: 1,
        explanation:
          'Backlog indicates insufficient processing capacity or poison messages.',
      },
      {
        id: '9-2-q5',
        question: 'Why might you pick RabbitMQ over SQS?',
        options: [
          'Rabbit is never self-hosted',
          'Complex routing needs (exchanges, bindings), on-prem requirements, or existing ops expertise',
          'SQS cannot persist messages',
          'Rabbit cannot do retries',
        ],
        correctIndex: 1,
        explanation:
          'Routing flexibility and deployment model drive choice.',
      },
      {
        id: '9-2-q6',
        question: 'Large payloads with SQS often:',
        options: [
          'Store data directly up to 1GB in SQS',
          'Store a pointer in S3 and pass object key in the message',
          'Require fax machines',
          'Disable consumers',
        ],
        correctIndex: 1,
        explanation:
          'Messages stay small; blobs live in object storage.',
      },
    ],
  },
  {
    id: 'delivery-guarantees',
    title: 'Delivery Guarantees',
    interviewTip:
      'State at-least-once + idempotent consumers as default; explain exactly-once difficulty; use idempotency keys for payments. Mention Kafka EOS scope (within Kafka + app dedup).',
    readContent: `# Delivery guarantees

Distributed messaging forces you to pick **delivery semantics**—what happens when networks flap, brokers restart, and ACKs disappear. Interviewers expect you to name three guarantees and explain trade-offs without hand-waving.

## At-most-once

The producer sends once and does not wait for durable confirmation—or the broker drops duplicates aggressively. **Loss is possible**, but you avoid duplicate side effects. Use for **telemetry** or **metrics** where dropping 0.1% of points is acceptable. It is the fastest path and the least comforting for money movement.

## At-least-once

The broker retries until the consumer acknowledges processing. If the consumer processes successfully but the ACK is lost, the broker redelivers—**duplicates happen**. This is the **default** for **SQS**, **Rabbit**, and most production queues because **lost work** is usually worse than **duplicate work** when you know how to handle duplicates.

## Exactly-once (end-to-end)

True exactly-once delivery across heterogeneous systems is **not** generally achievable—network failures create ambiguity: did the message arrive, or did only the ACK fail? Systems approximate exactly-once by combining **atomic transactions**, **idempotent brokers**, and **deduplication**—expensive and operationally heavy.

**Practical “effectively exactly-once”** means **at-least-once transport** plus **idempotent consumers** with **dedup keys** (database unique constraints, Redis SETNX, or a processed-messages table) and sometimes the **outbox pattern** for cross-service writes.

## Kafka’s exactly-once semantics (scoped)

Kafka provides idempotent producers and transactional APIs **within the Kafka ecosystem**—great for stream processing pipelines. The moment you **write to Postgres** or **charge a card**, you still need **application-level idempotency**—Kafka cannot magically dedupe your side effects.

> ANALOGY: At-most-once is a postcard—you hope it arrives. At-least-once is certified mail with a receipt that might be printed twice. Exactly-once is a notarized contract—possible, but heavy process.

> IMPORTANT: Default to **at-least-once + idempotent consumers**. Do not build homegrown exactly-once pipelines until you have measured the simpler pattern failing.

> INTERVIEW TIP: “We use **at-least-once SQS**; consumers store **idempotency keys**; duplicates noop.”

## The ACK ambiguity dilemma

If you are unsure whether work succeeded, **retrying risks duplicates**; **not retrying risks loss**. Engineering idempotency resolves the dilemma. Delivery semantics are **contracts** with your users’ money—choose them explicitly and test duplicate injection.

## Interview scenarios to rehearse

**Trace** **a** **lost** **ACK** **on** **the** **whiteboard**—**show** **why** **duplicates** **happen**. **Kafka** **EOS** **scope**: **what** **is** **guaranteed** **inside** **Kafka** **vs** **outside**. **Outbox** **pattern**: **same** **transaction** **writes** **business** **row** **+** **event** **row**—**reliable** **publication**.
`,
    quizQuestions: [
      {
        id: '9-3-q1',
        question: 'At-least-once delivery means:',
        options: [
          'Each message is delivered at most one time',
          'Messages may be processed more than once if duplicates occur',
          'Guaranteed exactly one end-to-end without any work',
          'No persistence',
        ],
        correctIndex: 1,
        explanation:
          'Retries and duplicate deliveries are possible.',
      },
      {
        id: '9-3-q2',
        question: 'Exactly-once is hard across distributed systems because:',
        options: [
          'TCP guarantees it',
          'You cannot always distinguish lost ACKs from duplicate processing without coordination',
          'HTTP forbids it',
          'Queues cannot persist',
        ],
        correctIndex: 1,
        explanation:
          'Fundamental uncertainty in distributed messaging.',
      },
      {
        id: '9-3-q3',
        question: 'Practical “effectively exactly-once” often combines:',
        options: [
          'At-most-once and no storage',
          'At-least-once delivery with idempotent consumers and deduplication',
          'Only UDP',
          'Deleting logs',
        ],
        correctIndex: 1,
        explanation:
          'Dedup makes duplicates safe.',
      },
      {
        id: '9-3-q4',
        question: 'At-most-once fits when:',
        options: [
          'Financial ledger updates',
          'Loss of some telemetry is acceptable',
          'You must never drop a message',
          'You need idempotency',
        ],
        correctIndex: 1,
        explanation:
          'Fire-and-forget trades durability for simplicity.',
      },
      {
        id: '9-3-q5',
        question: 'If a consumer processes a message but the ACK is lost:',
        options: [
          'The message is definitely deleted',
          'The broker may redeliver, causing duplicate processing',
          'TCP prevents redelivery',
          'The database rolls back automatically',
        ],
        correctIndex: 1,
        explanation:
          'At-least-once systems retry when ACK is uncertain.',
      },
      {
        id: '9-3-q6',
        question: 'Kafka exactly-once semantics:',
        options: [
          'Automatically guarantee end-to-end exactly-once across all systems without app code',
          'Help within Kafka with transactional producers/consumers; external side effects still need app dedup',
          'Disable retries',
          'Remove partitions',
        ],
        correctIndex: 1,
        explanation:
          'EOS is scoped; external systems need their own guarantees.',
      },
    ],
  },
  {
    id: 'idempotency',
    title: 'Idempotency',
    interviewTip:
      'Cite Stripe idempotency keys: same key returns same result. Pair with unique constraints and outbox pattern. Mention safe retries for GET/PUT vs POST.',
    readContent: `# Idempotency

An operation is **idempotent** if executing it multiple times has the same effect as executing it once. In distributed systems, **retries** and **queues** mean duplicates are not rare—they are **normal**. Without idempotency, you double-charge customers, duplicate shipments, inflate inventory counts, or create inconsistent ledger entries.

## Naturally idempotent examples

HTTP **GET** and **DELETE** are idempotent in the REST sense. **UPDATE SET balance = 100** is idempotent. **DELETE FROM carts WHERE id = ?** succeeds twice with the same end state—empty row.

## Non-idempotent traps

**INSERT** without natural keys **creates duplicate rows** on retries. **POST /payments** without keys may charge twice. **counter += 1** increments twice. **Append-only** event logs grow with every duplicate.

## Implementation patterns

1. **Client idempotency keys** (UUID) stored server-side with the **cached response** for 24 hours—Stripe’s model.
2. **Database UNIQUE constraints** on business keys (order_id, payment_id).
3. **Optimistic concurrency** with version columns: **UPDATE … WHERE version = 5**.
4. **Deduplication tables** keyed by message id for consumers.

## Stripe’s pattern in detail

Clients send an **Idempotency-Key** header (client-generated UUID) on **POST** requests. The first request creates the charge and stores **(key → response)**. Retries with the same key return the **stored response** without re-executing side effects—**no double charge**.

> ANALOGY: Pressing an elevator button five times still summons **one** car. Pressing a vending machine button five times can dispense **five** sodas—build elevator semantics for payments.

> IMPORTANT: Any mutation that touches money, inventory, or compliance must be idempotent or keyed. This is non-negotiable at scale.

> INTERVIEW TIP: “We require **Idempotency-Key** on POSTs; Postgres **UNIQUE** constraint on **(tenant_id, provider_id)**; consumers check **processed_messages** before side effects.”

## Testing

Replay your **message log twice** in staging; assert **single** side effects. Idempotency turns chaos into harmless replays—design for duplicates **from day one**.

## Interview scenarios to rehearse

**Implement** **Stripe-style** **keys** **verbally**: **header**, **storage** **table**, **TTL**, **collision** **handling**. **Discuss** **clock** **skew** **and** **duplicate** **submission** **from** **mobile** **apps** **with** **unreliable** **networks**. **Link** **to** **ledger** **systems**: **append-only** **entries**, **net** **zero** **reversal** **transactions** **instead** **of** **DELETE**.
`,
    quizQuestions: [
      {
        id: '9-4-q1',
        question: 'Idempotent operations:',
        options: [
          'Always return different results',
          'Produce the same effect when applied multiple times',
          'Cannot be retried',
          'Require DELETE only',
        ],
        correctIndex: 1,
        explanation:
          'Duplicates do not change final state.',
      },
      {
        id: '9-4-q2',
        question: 'Why are POST creates risky to retry without keys?',
        options: [
          'HTTP forbids POST',
          'Each retry may create another row',
          'POST is always idempotent',
          'TLS breaks POST',
        ],
        correctIndex: 1,
        explanation:
          'POST is not assumed idempotent without design.',
      },
      {
        id: '9-4-q3',
        question: 'Stripe-style idempotency keys:',
        options: [
          'Disable encryption',
          'Return the same response for duplicate submission attempts with the same key',
          'Replace databases',
          'Guarantee UDP delivery',
        ],
        correctIndex: 1,
        explanation:
          'Server stores outcome keyed by client token.',
      },
      {
        id: '9-4-q4',
        question: 'A UNIQUE constraint on a natural business key helps idempotency by:',
        options: [
          'Allowing unlimited duplicates',
          'Making duplicate inserts fail safely on replay',
          'Removing indexes',
          'Deleting logs',
        ],
        correctIndex: 1,
        explanation:
          'Database rejects duplicate rows with same key.',
      },
      {
        id: '9-4-q5',
        question: 'Message consumers should be idempotent because:',
        options: [
          'TCP never duplicates',
          'At-least-once delivery can duplicate messages',
          'Queues are always single-threaded',
          'DNS requires it',
        ],
        correctIndex: 1,
        explanation:
          'Retries and redelivery are normal.',
      },
      {
        id: '9-4-q6',
        question: 'DELETE /resource/:id is often idempotent because:',
        options: [
          'Second delete still results in resource absent',
          'DELETE cannot be sent twice',
          'HTTP caches DELETE',
          'It increments inventory',
        ],
        correctIndex: 0,
        explanation:
          'Deleting twice leaves the system in the same end state.',
      },
    ],
  },
  {
    id: 'backpressure',
    title: 'Backpressure',
    interviewTip:
      'Answer “what if consumers lag?” with: autoscale on queue depth, rate limit producers (429), shed low-priority work, monitor oldest age and lag. Queues buffer spikes but cannot fix permanent overload.',
    readContent: `# Backpressure

If producers enqueue messages faster than consumers can process them, **queue depth grows** until memory, disk, or operational budgets break. **Backpressure** is any mechanism that signals **upstream** to slow down—flow control, rate limits, or rejections—so the system fails **gracefully** instead of **catastrophically**.

## Why backpressure happens

Traffic spikes, **slow downstream dependencies**, **poison messages**, **consumer crashes**, or **seasonal events** (Black Friday) can all widen the producer–consumer gap. A queue **absorbs temporary spikes**; it does **not** create capacity out of thin air.

## Strategies

1. **Bounded queues** with **reject** when full—producers must handle retries or surface errors to users.
2. **Rate** **limit** APIs with **429 Too Many Requests** when backlog crosses thresholds.
3. **Autoscale** consumers on **queue depth** (SQS metrics → Auto Scaling groups, Kubernetes HPA on custom metrics).
4. **Shed** low-priority traffic first (analytics, enrichment) to protect checkout paths.
5. **Prefetch limits** in AMQP/RabbitMQ so brokers do not flood slow workers.

## The hard truth

Queues **delay** overload; they do not **solve** permanent overload. If producers permanently outpace consumers, you must **add workers**, **optimize** processing, **reduce** producer rate, or **drop** work—**pick** deliberately.

## Monitoring

**Queue depth trend**, **consumer lag**, **oldest message age**, **DLQ rate**, **429** rate. These metrics tell you whether you have a **capacity** problem or a **bug** (poison).

> ANALOGY: Highway on-ramp meters **throttle** entry when the road is full—better to wait at the ramp than gridlock the entire highway.

> NUMBERS: **SQS** retains messages up to **14 days**—depth can grow large but not forever. **RabbitMQ** queues are bounded by **RAM/disk** policies—**100k–1M** messages may already hurt latency depending on payload size. **Kafka** uses **time/size retention** per partition—defaults often **7 days**.

> INTERVIEW TIP: “**Autoscale workers on queue depth**; **rate limit** producers when backlog > **N**; **alert** on **oldest age**.”

Backpressure is **honesty about capacity**—slowing entry beats failing everyone at once.

## Interview scenarios to rehearse

**Design** **a** **429** **storm** **response**: **Retry-After**, **client** **backoff**, **UX** **copy**. **Autoscaling** **lag**: **what** **if** **scale-out** **takes** **3** **minutes** **but** **spike** **lasts** **30** **seconds**? **Discuss** **Kafka** **consumer** **lag** **vs** **SQS** **depth**—**different** **metrics**, **same** **meaning**: **processors** **behind** **producers**.
`,
    quizQuestions: [
      {
        id: '9-5-q1',
        question: 'Backpressure is:',
        options: [
          'Always disabling TLS',
          'A mechanism to signal producers to slow when consumers cannot keep up',
          'A DNS record type',
          'A GPU rendering mode',
        ],
        correctIndex: 1,
        explanation:
          'Flow control prevents unbounded queue growth.',
      },
      {
        id: '9-5-q2',
        question: 'If producers permanently exceed consumer capacity:',
        options: [
          'Any queue fixes it forever',
          'You must add consumers, reduce producer rate, or shed work—queues only delay',
          'Latency goes to zero',
          'Kafka deletes itself',
        ],
        correctIndex: 1,
        explanation:
          'Queues buffer transient spikes, not permanent overload.',
      },
      {
        id: '9-5-q3',
        question: 'Auto-scaling workers on queue depth addresses:',
        options: [
          'DNS TTL',
          'Insufficient processing capacity when backlog grows',
          'CSS minification',
          'Git merges',
        ],
        correctIndex: 1,
        explanation:
          'Scale consumers to match offered load.',
      },
      {
        id: '9-5-q4',
        question: 'Rate limiting producers when queues are full:',
        options: [
          'Is impossible in HTTP',
          'Applies backpressure by rejecting or slowing upstream submission',
          'Removes all queues',
          'Guarantees exactly-once delivery',
        ],
        correctIndex: 1,
        explanation:
          '429 or similar tells clients to back off.',
      },
      {
        id: '9-5-q5',
        question: 'Oldest message age growing indicates:',
        options: [
          'Consumers are ahead of producers',
          'Consumers are falling behind or processing is stuck',
          'Perfect health',
          'TLS success',
        ],
        correctIndex: 1,
        explanation:
          'Staleness metrics expose pipeline lag.',
      },
      {
        id: '9-5-q6',
        question: 'Prefetch limits in AMQP/RabbitMQ help:',
        options: [
          'Increase unbounded memory use forever',
          'Limit in-flight messages per consumer to avoid overwhelming slow workers',
          'Remove brokers',
          'Disable acknowledgments',
        ],
        correctIndex: 1,
        explanation:
          'Flow control matches delivery to consumer readiness.',
      },
    ],
  },
  {
    id: 'dead-letter-queues',
    title: 'Dead Letter Queues',
    interviewTip:
      'Every production queue needs a DLQ: maxReceiveCount 3–5, alert on depth, redrive after fix, retain metadata for debugging.',
    readContent: `# Dead letter queues (DLQ)

Some messages will **never** process successfully—corrupt payloads, references to deleted users, schema mismatches after a deploy, or invalid payment methods. **Infinite retries** waste CPU, clog the queue, and block **head-of-line** messages behind poison pills. **Silent drops** lose audit evidence. **Dead letter queues** solve this by **quarantining** messages after **N failed attempts** so engineers can inspect, fix, and replay.

## Typical lifecycle

1. Consumer attempts processing and throws.
2. Message returns after **visibility timeout** for another worker to try.
3. After **maxReceiveCount** (often **3–5**), the broker moves the message to the **DLQ** automatically.
4. **Alerts** fire on DLQ depth.
5. Engineers triage—fix code, patch data, or discard with **documented** rationale.

## Why DLQs are non-negotiable

They **isolate** poison messages, **preserve** payloads for debugging, **trigger** paging, and **enable** **redrive** after fixes. Without DLQs you either retry forever or drop silently—both are unacceptable in production.

## Operational practices

- **Alert** when DLQ depth > 0.
- **Annotate** messages with failure reason, attempt count, original queue name.
- **Automate redrive** after safe deploys; **replay** to main queue with monitoring.
- **Retention** ~**14 days** aligns with SQS defaults—tune per compliance needs.

**AWS SQS** uses a **RedrivePolicy** JSON linking the **source queue** to a **DLQ ARN** and **maxReceiveCount**.

> ANALOGY: A hospital moves nonresponsive patients to **specialized care** instead of blocking the entire emergency ward—DLQs are the **quarantine bay** for bad messages.

> IMPORTANT: Every production queue feeding critical work needs a DLQ—**no exceptions**.

> INTERVIEW TIP: “**DLQ** with **maxReceiveCount=3**, **CloudWatch alarm on ApproximateNumberOfMessagesVisible**, **runbook for redrive**.”

Poison messages are inevitable—**DLQs make them boring** instead of catastrophic.

## Interview scenarios to rehearse

**DLQ** **triage** **runbook**: **who** **owns** **the** **queue**, **SLA** **to** **clear** **messages**, **PII** **handling** **in** **failed** **payloads**. **Redrive** **safety**: **ensure** **bug** **fixed**, **replay** **in** **small** **batches**, **watch** **for** **retry** **storms**. **Compliance**: **never** **log** **full** **PAN** **in** **DLQ** **messages**.
`,
    quizQuestions: [
      {
        id: '9-6-q1',
        question: 'A dead letter queue is used when:',
        options: [
          'Messages are processed successfully',
          'A message fails repeatedly beyond max retries and must be quarantined',
          'TLS is enabled',
          'Consumers are infinitely fast',
        ],
        correctIndex: 1,
        explanation:
          'DLQs isolate poison messages after retry exhaustion.',
      },
      {
        id: '9-6-q2',
        question: 'Poison messages are problematic because:',
        options: [
          'They improve throughput',
          'They can block processing or infinite-retry loops without a DLQ',
          'They are always duplicates',
          'They only exist in Kafka',
        ],
        correctIndex: 1,
        explanation:
          'Bad messages waste retries and head-of-line blocking.',
      },
      {
        id: '9-6-q3',
        question: 'SQS redrive policy connects:',
        options: [
          'DNS to SMTP',
          'A source queue to a DLQ after maxReceiveCount',
          'Lambda to GPU',
          'Git to FTP',
        ],
        correctIndex: 1,
        explanation:
          'AWS moves failed messages after configured receives.',
      },
      {
        id: '9-6-q4',
        question: 'After fixing a bug, teams often:',
        options: [
          'Delete DLQ messages forever',
          'Redrive messages back to the main queue for reprocessing',
          'Disable monitoring',
          'Remove idempotency',
        ],
        correctIndex: 1,
        explanation:
          'Replay after fixes recovers legitimate work.',
      },
      {
        id: '9-6-q5',
        question: 'Alerting on DLQ depth helps because:',
        options: [
          'DLQ messages indicate systematic failures or bad data',
          'DLQs should always be empty of alerts',
          'It speeds up DNS',
          'It removes queues',
        ],
        correctIndex: 0,
        explanation:
          'Non-zero DLQ often means bugs or upstream issues.',
      },
    ],
  },
  {
    id: 'event-streaming-kafka',
    title: 'Event Streaming & Kafka',
    interviewTip:
      'Position Kafka as durable log + fan-out: topics/partitions, consumer groups, offsets, replication factor 3. Contrast with SQS task queues. Mention when Kafka is overkill (simple email job).',
    readContent: `# Event streaming with Kafka

Traditional message queues (SQS, Rabbit) **delete** or **ack-advance** messages after consumption. **Kafka** is different: it is an **append-only log**. Producers append **records** to **topics**; brokers persist them; **multiple consumer groups** can read the **same** data independently at their own pace. **Retention** is time- or size-based—**replay** is a first-class feature.

## Core concepts you must memorize

- **Topic**: logical stream name (e.g., **user-events**).
- **Partition**: ordered, immutable log shard. **Ordering is per-partition**, not global across partitions.
- **Producer**: chooses partition via **key hashing** or round-robin.
- **Consumer group**: cooperative consumers; **each partition assigned to exactly one consumer** in the group for a generation.
- **Offset**: per-partition cursor tracking read progress—committed to **__consumer_offsets** or external stores.
- **Replication**: replication factor **3** is common—**leader** handles writes/reads, **followers** replicate for fault tolerance.

## Kafka vs classic task queues

Use **Kafka** when you need **durable fan-out**, **replay**, **stream processing**, or **very high throughput** (clickstream, CDC, audit logs). Use **SQS** when you need **simple job queues**, **per-message ack**, and **managed operations** without running a Kafka cluster.

## Use cases

**Real-time analytics**, **event sourcing**, **log aggregation**, **cross-service audit trails**, **Flink/ksqlDB** pipelines. Kafka becomes the **organizational memory** of what happened—**treat** it like a **database** with **SLAs**.

## Performance intuition

Single brokers can reach **hundreds of thousands of messages per second** class depending on payload; clusters scale horizontally with **brokers** and **partitions**. End-to-end latency is often **milliseconds to tens of milliseconds**—**but** **tuning** matters.

> NUMBERS: Industry marketing cites **trillions of messages/day** through Kafka at large adopters. **Rough planning**: **~10 MB/s** write throughput per partition before you need more partitions. **Replication factor 3** for production. **Partition count** typically **tens**, not thousands without justification.

> ANALOGY: A task queue is a to-do list you erase items from. Kafka is a **journal**—multiple readers can revisit history until retention expires.

> INTERVIEW TIP: “**Topic** partitioned for **parallelism**; **separate consumer groups** for **analytics**, **notifications**, **warehouse**—each **commits offsets** independently.”

## When Kafka is overkill

Low throughput, no replay requirement, **no multi-subscriber** needs—**SQS/Rabbit** wins on operational simplicity. Kafka is **infrastructure**, not a fancy cron—**staff** it accordingly.

## Interview scenarios to rehearse

**Partition** **key** **choice** **case** **study**: **user_id** **for** **per-user** **ordering**, **round-robin** **if** **order** **irrelevant**. **Rebalancing** **pain**: **adding** **partitions** **without** **stopping** **the** **world**—**double** **write** **periods**, **consumer** **reassignment**. **Exactly-once** **stream** **processing**: **idempotent** **sink**, **dedup** **store**.
`,
    quizQuestions: [
      {
        id: '9-7-q1',
        question: 'Kafka consumer groups allow:',
        options: [
          'Only one consumer globally',
          'Parallel processing of partitions with each partition assigned to one consumer in the group',
          'Deleting the log',
          'Removing replication',
        ],
        correctIndex: 1,
        explanation:
          'Group members split partitions for scale.',
      },
      {
        id: '9-7-q2',
        question: 'Ordering in Kafka is guaranteed:',
        options: [
          'Across all partitions globally',
          'Within a single partition',
          'Never',
          'Only without brokers',
        ],
        correctIndex: 1,
        explanation:
          'Partition is the serialization unit.',
      },
      {
        id: '9-7-q3',
        question: 'Offsets represent:',
        options: [
          'TLS cipher suites',
          'Consumer progress per partition',
          'CPU temperature',
          'DNS TTL',
        ],
        correctIndex: 1,
        explanation:
          'Commits track what was processed.',
      },
      {
        id: '9-7-q4',
        question: 'Replication factor 3 primarily:',
        options: [
          'Removes need for disks',
          'Stores partition copies on multiple brokers for fault tolerance',
          'Disables producers',
          'Guarantees global ACID',
        ],
        correctIndex: 1,
        explanation:
          'Copies survive broker loss.',
      },
      {
        id: '9-7-q5',
        question: 'Kafka is often overkill when:',
        options: [
          'You need high-throughput fan-out and replay',
          'You only need a low-volume job queue with simple semantics',
          'You need retention',
          'You want partitions',
        ],
        correctIndex: 1,
        explanation:
          'Operational cost must match problem size.',
      },
      {
        id: '9-7-q6',
        question: 'Multiple consumer groups on same topic:',
        options: [
          'Share one offset and steal messages',
          'Independently consume the stream with separate offsets',
          'Are forbidden',
          'Merge into one group automatically',
        ],
        correctIndex: 1,
        explanation:
          'Fan-out is a core Kafka strength.',
      },
    ],
  },
  {
    id: 'pub-sub-pattern',
    title: 'Pub/Sub Pattern',
    interviewTip:
      'Use Pub/Sub when one event fans out to many services. Draw SNS→SQS fan-out: durable per-consumer queues, independent scaling. Contrast Redis Pub/Sub (no persistence) vs Kafka.',
    readContent: `# Pub/Sub pattern

**Publish/Subscribe** is a messaging style where **publishers** emit events to **topics** (or **channels**) without knowing who consumes them. **Subscribers** register interest and receive **their own copy** of each message—**broadcast** semantics, not work distribution.

## Point-to-point vs pub/sub

In a **queue**, each message is consumed by **one** worker—**competing consumers** split load. In **pub/sub**, each message is delivered to **every** subscriber—**fan-out**. Choose pub/sub when **one business event** needs to trigger **multiple independent** workflows (inventory, email, analytics, fraud).

## AWS SNS + SQS fan-out (canonical pattern)

Publish once to an **SNS topic**; **each** SQS queue subscribes as an endpoint. SNS delivers the message to **all** queues; **each** service consumes its queue **at its own pace** with **retries**, **DLQs**, and **independent scaling**. Adding a **new** service means **subscribing a new queue**—**publishers stay untouched**.

## Other implementations

**Google Cloud Pub/Sub** offers global, managed topics with push/pull subscriptions. **Redis Pub/Sub** is **fast but ephemeral**—if a subscriber is offline, messages are **gone**. **Kafka** achieves pub/sub semantics via **multiple consumer groups** reading the same topic with **durable retention** and **replay**.

## When to use pub/sub

**Domain events**, **configuration pushes**, **fan-out notifications**, **decoupling microservices** so teams ship independently.

## Challenges

**Ordering** is not global across subscribers—design per-partition or per-entity ordering if needed. **Debugging** requires **correlation IDs** across fan-out paths. **Backpressure** differs: **Redis** can overwhelm slow subscribers; **Kafka + SQS** give **per-consumer** buffering.

> ANALOGY: A radio station broadcasts; listeners tune in independently. The station does not know who hears—**decoupling** in action.

> INTERVIEW TIP: “**SNS** **topic** **→** **per-domain SQS queues**; **new consumer = new subscription** without changing publisher code.”

Pub/Sub scales **organizational parallelism**—new consumers join without forking the producer service.

## Interview scenarios to rehearse

**Draw** **SNS** **→** **SQS** **×** **N** **with** **DLQ** **per** **queue**. **Contrast** **Redis** **Pub/Sub** **(no** **durability)** **vs** **Kafka** **consumer** **groups** **(durable** **replay)**. **Ordering**: **if** **all** **subscribers** **must** **see** **events** **in** **order**, **what** **breaks**? **Discuss** **per-partition** **ordering** **or** **sequence** **numbers** **in** **payloads**.
`,
    quizQuestions: [
      {
        id: '9-8-q1',
        question: 'Pub/Sub differs from a work queue because:',
        options: [
          'Messages are processed by every subscriber rather than one worker',
          'It never delivers messages',
          'It forbids JSON',
          'It removes TLS',
        ],
        correctIndex: 0,
        explanation:
          'Broadcast delivers to all interested subscribers.',
      },
      {
        id: '9-8-q2',
        question: 'Fan-out means:',
        options: [
          'One event triggers multiple independent downstream actions',
          'Only one service ever receives an event',
          'Deleting the database',
          'Disabling caching',
        ],
        correctIndex: 0,
        explanation:
          'Multiple subscribers react to the same publication.',
      },
      {
        id: '9-8-q3',
        question: 'SNS + SQS fan-out gives:',
        options: [
          'No durability',
          'Broadcast to many queues with per-consumer pacing and retries',
          'Exactly-once across the universe automatically',
          'A single global mutex',
        ],
        correctIndex: 1,
        explanation:
          'Each SQS queue isolates consumer speed and failure domains.',
      },
      {
        id: '9-8-q4',
        question: 'Redis Pub/Sub limitation:',
        options: [
          'It always persists messages forever',
          'Subscribers offline miss messages—no durable log by default',
          'It cannot be fast',
          'It requires Kafka',
        ],
        correctIndex: 1,
        explanation:
          'Fire-and-forget ephemeral broadcast.',
      },
      {
        id: '9-8-q5',
        question: 'Adding a new subscriber without changing publisher is a benefit of:',
        options: [
          'Tight coupling',
          'Pub/Sub indirection via topics/buses',
          'Raw TCP only',
          'Monolithic deployments only',
        ],
        correctIndex: 1,
        explanation:
          'Decouples producers from the growing set of consumers.',
      },
      {
        id: '9-8-q6',
        question: 'Ordering guarantees in broad pub/sub systems:',
        options: [
          'Are always global across all subscribers',
          'May be limited per channel/partition; cross-subscriber ordering is not automatic',
          'Are impossible to achieve',
          'Are provided by DNS',
        ],
        correctIndex: 1,
        explanation:
          'Design for per-partition ordering where needed.',
      },
    ],
  },
];
