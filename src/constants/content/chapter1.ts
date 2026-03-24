import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_1_TOPICS: Topic[] = [
  {
    id: 'what-happens-when-you-type-a-url',
    title: 'What Happens When You Type a URL?',
    interviewTip:
      'Walk through the full journey: DNS → TCP → TLS → HTTP request → server processing → response → rendering. The more layers you mention (caching at each level, CDN, load balancer), the more senior you sound.',
    readContent: `# From keystroke to pixels

When you type **google.com** into the address bar and press Enter, you are not connecting to a "name." You are starting a carefully choreographed sequence that turns a human-friendly string into **IP addresses**, **reliable byte streams**, **encrypted channels**, **HTTP messages**, and finally **pixels on screen**. Nothing about this is magic — it is layers of protocols, each solving one problem.

# Step 1 — Does anyone already know this address?

The **first** thing your browser does is ask: "Do I already know the IP for this hostname?" It checks the **browser DNS cache**, then often the **operating system cache**, then sometimes your **router** or **ISP resolver** cache. If any layer has a fresh answer, you skip a full DNS lookup. That is why repeat visits to the same site can feel snappier: you may avoid extra network round trips entirely.

# Step 2 — DNS: name to number

If nothing cached has the answer, the browser triggers **DNS resolution**. A **recursive resolver** (often your ISP's or a public resolver like 1.1.1.1) walks the **DNS hierarchy**: it may query **root** hints, then the **TLD** servers for \`.com\`, then the **authoritative** nameservers for \`google.com\`, until it receives an **A** or **AAAA** record with an IP address. The result is cached at multiple levels with a **TTL** so the next lookup is cheaper.

# Step 3 — TCP: a reliable pipe

With an IP address in hand, your machine opens a **TCP connection** to the server's port (443 for HTTPS). TCP uses a **three-way handshake**: **SYN** from client, **SYN-ACK** from server, **ACK** from client. That establishes a **reliable, ordered** bidirectional channel: bytes arrive in order, lost packets are retransmitted. Until this completes, no application data (HTTP) is sent.

# Step 4 — TLS: trust and secrecy (HTTPS)

For **HTTPS**, the client and server perform a **TLS handshake** before HTTP: they agree on cipher suites, the server presents a **certificate** chain to prove identity, and they derive **session keys** for symmetric encryption. That adds **1–2 extra round trips** compared to raw HTTP on top of TCP, which is why **connection reuse** (keep-alive, HTTP/2) matters so much in production.

# Step 5 — HTTP request

Only now does the browser send an **HTTP GET** (for a typical page load) with headers such as **Host**, **User-Agent**, **Accept**, **Accept-Language**, and **Cookie** if you have session cookies. The request line includes the path (\`/\`) and HTTP version. This message rides inside the encrypted TLS tunnel.

# Step 6 — Across the internet

The packets traverse **routers** and **switches** on many networks. Your request might hit a **CDN edge** if the hostname resolves to a CDN (DNS often steers you there). It might pass a **load balancer** that picks a healthy backend. Each hop adds a little **latency**, and congestion can cause **queueing**.

# Step 7 — The server responds

The **origin server** (or edge) accepts the connection, terminates TLS, parses HTTP, runs **routing**, **authentication**, **business logic**, and often **database queries**. Work might be split across services. The server then returns an **HTTP response**: **status code**, **headers** (\`Content-Type\`, \`Set-Cookie\`, \`Cache-Control\`), and a **body** (often HTML for the first response).

# Step 8 — More requests

The browser **parses HTML**, builds a **DOM**, and discovers linked **CSS**, **JavaScript**, **images**, and **fonts**. Each is fetched with additional HTTP requests (often in parallel on HTTP/2). JavaScript may trigger even more requests (API calls, lazy-loaded assets).

# Step 9 — Rendering

The browser combines **DOM** and **CSSOM**, runs **layout**, **paint**, and **compositing** to turn the document into what you see. Interactive scripts attach event handlers; subsequent updates can change the DOM without a full navigation.

> ANALOGY: Think of mailing a letter. You need the **correct address** (DNS turns a name into coordinates). You need a **tracked delivery route** (TCP — reliable delivery). For sensitive mail you use a **sealed, authenticated envelope** (TLS). The **letter itself** is the HTTP request and response. The reply letter is the server's HTML/JSON. Routing through sorting facilities is like packets traversing routers, CDNs, and load balancers.

> INTERVIEW TIP: This is one of the most common opening questions. The depth you go into signals your experience level. Junior: DNS then server responds. Senior: mention TCP handshake, TLS, CDN, load balancer, database query, caching at every layer.

> NUMBERS: Typical **DNS lookup** when not cached: **20–120 ms**. **TCP handshake**: about **1 RTT** to the server. **TLS** often adds **1–2 RTTs**. **Server-side processing** might be **10–500 ms** depending on work. **End-to-end first paint** for a real page is often **1–3 seconds** once you include assets and rendering — faster on repeat visits thanks to caching.

## Quick recap

| Layer | You remember… |
| --- | --- |
| DNS | Name → IP, cached at many levels |
| TCP | Reliable connection (SYN / SYN-ACK / ACK) |
| TLS | Encryption + identity (HTTPS) |
| HTTP | Request/response for resources |
| Browser | Parse, fetch more, render |`,
    quizQuestions: [
      {
        id: '1-1-q1',
        question: 'What is the FIRST thing the browser does when you type a URL?',
        options: [
          'Sends an HTTP request to the server',
          'Checks local DNS cache for the IP address',
          'Establishes a TCP connection',
          'Renders the HTML page',
        ],
        correctIndex: 1,
        explanation:
          'Before anything can happen, the browser needs the IP address of the server. It first checks its local cache, then the OS cache, then the router cache, before making a DNS query.',
      },
      {
        id: '1-1-q2',
        question: 'What does the TCP three-way handshake accomplish?',
        options: [
          'Encrypts the connection',
          'Resolves the domain name',
          'Establishes a reliable connection between client and server',
          'Sends the HTTP request',
        ],
        correctIndex: 2,
        explanation:
          'The TCP handshake (SYN → SYN-ACK → ACK) establishes a reliable bidirectional connection. Encryption comes later with TLS. DNS resolves before TCP.',
      },
      {
        id: '1-1-q3',
        question: 'Why does HTTPS require additional round trips compared to HTTP?',
        options: [
          'HTTPS servers are slower',
          'TLS handshake needs certificate exchange and key agreement',
          'HTTPS uses a different DNS system',
          'The browser needs to download a security plugin',
        ],
        correctIndex: 1,
        explanation:
          'TLS adds 1–2 round trips for certificate verification and symmetric key negotiation. Connection reuse (keep-alive, HTTP/2) reduces the amortized cost.',
      },
      {
        id: '1-1-q4',
        question: 'A CDN is involved in this process. At which step does it help?',
        options: [
          'DNS resolution',
          'TCP handshake',
          'Serving cached content closer to the user',
          'Rendering the page',
        ],
        correctIndex: 2,
        explanation:
          'CDNs cache content at edge servers worldwide. After DNS routes you to the CDN, the edge can serve cached responses without hitting your origin.',
      },
      {
        id: '1-1-q5',
        question: 'What HTTP status code means "everything worked fine"?',
        options: ['301', '404', '200', '500'],
        correctIndex: 2,
        explanation:
          '200 OK means success. 301 is redirect, 404 is not found, 500 is server error. Memorize: 2xx = success, 3xx = redirect, 4xx = client error, 5xx = server error.',
      },
      {
        id: '1-1-q6',
        question: 'The typical total time from typing a URL to seeing a page is?',
        options: ['10–50 ms', '100–500 ms', '1–3 seconds', '10–30 seconds'],
        correctIndex: 2,
        explanation:
          'A typical page load takes 1–3 seconds including DNS (20–120 ms), TCP+TLS (often tens of ms to ~150 ms depending on RTT), server processing, download, and rendering. Repeat visits can be faster due to caching.',
      },
    ],
  },
  {
    id: 'http-https-request-response',
    title: 'HTTP, HTTPS & Request/Response',
    interviewTip:
      'Know the difference between PUT and PATCH (full replace vs partial update). Know when to use POST vs PUT (create vs update). These come up constantly in API design discussions.',
    readContent: `# What HTTP actually is

**HTTP** (Hypertext Transfer Protocol) is a **stateless**, **text-based** protocol: the client sends a request, the server sends a response, and by default the server does not remember past requests. That design is intentional — it makes the web easy to scale — and it is why we add **cookies**, **tokens**, and **sessions** when we need continuity.

# Methods tell the intent

| Method | Typical use |
| --- | --- |
| **GET** | Read a resource |
| **POST** | Create a resource or submit data |
| **PUT** | Replace a resource (full document) |
| **PATCH** | Partial update |
| **DELETE** | Remove a resource |

The **URL** identifies the resource (\`/users/42\`). The **method** says what you want to do. Good APIs use **nouns** in paths, not verbs.

# Anatomy of a request

A request has: **method**, **URL**, **headers**, and optionally a **body**. Important headers include **Host** (which site on a shared IP), **Content-Type** (e.g. \`application/json\`), **Authorization** (who you are), **User-Agent**, and **Accept** (what formats you can handle).

# Anatomy of a response

A response has: **status code**, **headers**, and **body**. Headers like **Content-Type** describe the payload; **Set-Cookie** establishes cookies; **Cache-Control** and **ETag** control caching; rate-limit headers may expose quotas.

# Status code families

- **1xx** — Informational (rare in APIs you build day to day)
- **2xx** — Success (**200**, **201**, **204**…)
- **3xx** — Redirection (**301** permanent, **302** temporary)
- **4xx** — Client errors (**400** bad request, **401** unauthorized, **403** forbidden, **404** not found, **429** too many requests)
- **5xx** — Server errors (**500** generic, **502** bad gateway, **503** unavailable)

Memorize: **200**, **201**, **301**, **302**, **400**, **401**, **403**, **404**, **429**, **500**, **502**, **503**.

# HTTP versions in one minute

- **HTTP/1.1** — Widely deployed; one request at a time per connection in the common mental model (pipelining existed but was limited).
- **HTTP/2** — **Multiplexing** many streams on one connection, **header compression**, optional server push.
- **HTTP/3** — Runs over **QUIC** (UDP-based), better loss recovery on unreliable networks.

# HTTPS: HTTP inside a tunnel of trust

**HTTPS** is HTTP over **TLS**. It gives you **confidentiality** (others cannot read the bytes), **integrity** (bytes cannot be silently changed), and **authentication** (you are talking to the real server, assuming certificate validation succeeds).

# Cookies and sessions

Because HTTP is stateless, **cookies** carry a session identifier; the server looks up session data in a database or cache. Alternatively, **JWTs** embed signed claims so the server can validate identity without server-side session storage (with tradeoffs).

> ANALOGY: HTTP is a conversation at a restaurant. **GET** = "May I see the menu?" **POST** = "I'd like to order this." **PUT** = "Replace my entire order with this new set of dishes." **PATCH** = "Just swap the side salad for soup." **DELETE** = "Cancel my order." The waiter always answers with a **status**: "Here you go" (**200**), "We don't have that" (**404**), "Kitchen issue" (**500**).

> IMPORTANT: HTTP is stateless — each request is independent unless you attach identity or state via cookies/tokens. Stateless application servers are easier to scale horizontally because any instance can handle any request.

## Headers that show up in system design

| Header | Why it matters |
| --- | --- |
| **Cache-Control** | Tells browsers/CDNs how long to cache |
| **ETag** | Enables conditional GETs (304 Not Modified) |
| **Authorization** | Carries API keys or bearer tokens |
| **Content-Type** | Lets servers parse JSON vs HTML vs protobuf |
| **Rate-Limit-*** (common patterns) | Communicates quotas to clients |`,
    quizQuestions: [
      {
        id: '1-2-q1',
        question: 'HTTP is stateless. What does that mean?',
        options: [
          "It can't handle multiple requests",
          "Each request is independent; the server doesn't remember previous ones",
          "It doesn't use encryption",
          'It only works with static content',
        ],
        correctIndex: 1,
        explanation:
          'Stateless means each request contains all the information needed to process it. The server does not store client state between requests, which helps horizontal scaling.',
      },
      {
        id: '1-2-q2',
        question:
          "You're building an API. A client wants to update just the email field on a user profile. Which method?",
        options: ['GET', 'POST', 'PUT', 'PATCH'],
        correctIndex: 3,
        explanation:
          'PATCH is for partial updates. PUT replaces the entire resource — you would need to send all fields, not just email.',
      },
      {
        id: '1-2-q3',
        question: 'Status code 429 means?',
        options: [
          'Server error',
          'Not found',
          'Too many requests (rate limited)',
          'Unauthorized',
        ],
        correctIndex: 2,
        explanation:
          '429 Too Many Requests means the client has been rate limited — common when API gateways or rate limiters enforce quotas.',
      },
      {
        id: '1-2-q4',
        question: 'What does HTTP/2 multiplexing solve?',
        options: [
          'DNS resolution speed',
          'Head-of-line blocking in HTTP/1.1',
          'Database connection pooling',
          'SSL certificate validation',
        ],
        correctIndex: 1,
        explanation:
          'HTTP/2 allows many requests and responses in parallel on one connection, avoiding queues that hurt HTTP/1.1.',
      },
      {
        id: '1-2-q5',
        question: 'Why is HTTPS important even for non-sensitive data?',
        options: [
          "It's faster than HTTP",
          'It prevents man-in-the-middle attacks and data tampering',
          'It reduces server load',
          'It improves SEO only',
        ],
        correctIndex: 1,
        explanation:
          'HTTPS provides integrity and privacy for all bytes, not just secrets. Attackers on untrusted networks can tamper with or inject content into plain HTTP.',
      },
      {
        id: '1-2-q6',
        question: 'The Cache-Control header is used for?',
        options: [
          'User authentication',
          'Telling browsers and CDNs how long to cache a response',
          'Controlling which HTTP methods are allowed',
          'Managing database connections',
        ],
        correctIndex: 1,
        explanation:
          'Cache-Control directs caching behavior (e.g. max-age). It is central to CDN and browser performance tuning.',
      },
    ],
  },
  {
    id: 'dns-the-internets-phone-book',
    title: "DNS: The Internet's Phone Book",
    interviewTip:
      "DNS is often the entry point of a system design. When asked 'how does the user reach your system?' — start with DNS. Mention TTL tradeoffs and how DNS-based load balancing works for multi-region deployments.",
    readContent: `# Why DNS exists

Humans remember **google.com**. Routers move **packets** using **IP addresses** like **142.250.80.46**. **DNS** (Domain Name System) is the distributed directory that maps **names to records** — mostly **A**/**AAAA** addresses, but also mail routes, aliases, and verification text.

# The hierarchy: from root to your zone

DNS is a tree:

1. **Root** (the invisible dot at the end of fully qualified names)
2. **TLD** servers for \`.com\`, \`.org\`, \`.io\`, …
3. **Authoritative nameservers** for your domain (often run by your DNS host or registrar)

When a resolver learns which nameserver is authoritative for \`example.com\`, it asks that server for the exact records you configured.

# Record types you will actually use

| Type | Meaning |
| --- | --- |
| **A** | Hostname → **IPv4** |
| **AAAA** | Hostname → **IPv6** |
| **CNAME** | Alias → another hostname (another lookup follows) |
| **MX** | Mail exchangers for email |
| **NS** | Which servers are authoritative |
| **TXT** | Arbitrary text (SPF, DKIM, domain verification) |

# Resolution path (simplified)

1. Browser cache → 2. OS stub resolver cache → 3. Recursive resolver (ISP or public) → iterative queries to root/TLD/auth as needed → answer returned and **cached at each layer** with a **TTL**.

Most lookups never hit root in practice because **TLD and popular domains** are cached aggressively.

# TTL: freshness vs traffic

**TTL** (Time To Live) says how long a record may be cached.

- **Low TTL (e.g. 60 s)** — changes propagate quickly (great for failover), but clients re-query often → **more DNS traffic** and slightly more first-byte latency after expiry.
- **High TTL (e.g. 86400 s = 24 h)** — fewer queries and stable performance, but **slow** propagation when you change IPs.

# DNS in system design

- **Multiple A records** — crude **round-robin** load spread (clients pick randomly; not health-aware by itself).
- **GeoDNS** — return different IPs based on resolver location to send users to the **nearest region**.
- **Health-checked DNS** — some providers flip DNS when endpoints fail (propagation still bound by TTL).

> ANALOGY: DNS is a phone book with a hierarchy: country code (root/TLD) and local number (your authoritative zone). You also keep **frequently dialed numbers in your contacts** — that is every **cache** along the way.

> INTERVIEW TIP: DNS is often the entry point of a system design. When asked how users reach your service, start with DNS, then CDN, then load balancers, then app tier.

> NUMBERS: There are **13 logical root server clusters** (many anycast instances worldwide). A cold DNS lookup often lands in **20–120 ms**; cached answers frequently complete in **under 5 ms** locally. Managed DNS pricing is on the order of **cents per million queries** plus a small monthly per-zone fee (e.g. Route 53 is commonly cited around **$0.50/hosted zone/month** and **~$0.40 per million queries** — verify current pricing for your provider).

## Operational takeaway

DNS is **eventually consistent** from the client's perspective: plan cutovers with **TTL lowering** ahead of time and **dual publishing** when possible.`,
    quizQuestions: [
      {
        id: '1-3-q1',
        question: 'What type of DNS record maps a domain name to an IPv4 address?',
        options: ['CNAME', 'MX', 'A', 'NS'],
        correctIndex: 2,
        explanation:
          'A records map hostnames to IPv4. AAAA is for IPv6. CNAME aliases to another name. MX is for mail.',
      },
      {
        id: '1-3-q2',
        question: 'Your DNS TTL is set to 60 seconds. What is the tradeoff?',
        options: [
          'Faster updates but more DNS query traffic',
          'Slower updates but less traffic',
          'Better security',
          'Faster page load times always',
        ],
        correctIndex: 0,
        explanation:
          'Low TTL means caches expire quickly — good for fast failover, but clients re-query more often.',
      },
      {
        id: '1-3-q3',
        question: 'In a multi-region deployment, which DNS feature routes users to the nearest data center?',
        options: ['Round-robin DNS', 'GeoDNS', 'CNAME records', 'DNS over HTTPS'],
        correctIndex: 1,
        explanation:
          'GeoDNS returns IPs based on client/resolver geography so traffic lands in a nearby region.',
      },
      {
        id: '1-3-q4',
        question: 'Which DNS query goes to the root server first?',
        options: [
          'Every DNS query',
          'Only the very first query ever on Earth',
          'Only when no cache along the path has a usable answer',
          'Only HTTPS queries',
        ],
        correctIndex: 2,
        explanation:
          'Resolvers hit root only when they cannot use cached NS/glue information to continue resolution.',
      },
      {
        id: '1-3-q5',
        question: 'You want to use a CDN like CloudFront. Which DNS record type do you use to point your domain to the CDN?',
        options: [
          'A record directly to a CDN IP you hardcode',
          'CNAME record to the CDN hostname',
          'MX record',
          'TXT record',
        ],
        correctIndex: 1,
        explanation:
          'CNAME (or provider-specific ALIAS/ANAME at apex) points your name to the CDN hostname, which then resolves to edge IPs.',
      },
    ],
  },
  {
    id: 'tcp-ip-and-udp',
    title: 'TCP/IP and UDP',
    interviewTip:
      'When designing real-time systems (chat, video, gaming), mention UDP for media streams and TCP for control messages. WebRTC uses both.',
    readContent: `# A simple mental model of the stack

When your browser sends HTTPS traffic, the **application** layer speaks HTTP. Below that, **TCP** provides **reliable transport**. Below that, **IP** routes **packets** across networks. Lower still, **link** layers (Ethernet, Wi‑Fi) move frames on a single hop. You do not need to memorize every OSI layer — just know **where reliability lives** (TCP) vs **where addressing and routing live** (IP).

# IP: getting packets across the internet

**IP** gives each host an address and forwards **datagrams** hop by hop. **IPv4** uses **32-bit** addresses (exhaustion drove **NAT** everywhere). **IPv6** uses **128-bit** addresses and restores end-to-end addressing ideas at scale.

# TCP: reliability and order

**TCP** is **connection-oriented**: **three-way handshake** (SYN, SYN-ACK, ACK), then a bidirectional byte stream. It **reorders** segments, **acknowledges** receipt, **retransmits** on loss, and performs **flow control** (receiver window) and **congestion control** (back off when the network is full). That is why TCP is the default choice for **HTTP**, **databases**, and anything that must not corrupt bytes.

# UDP: speed without promises

**UDP** is **connectionless**: no handshake, no ordering guarantee, no retransmission. Datagrams may be **dropped**, **duplicated**, or **reordered**. You gain **lower latency** and **less overhead** — perfect when the application can tolerate loss (**live video**, **VoIP**, **games**) or when queries are tiny and retried at the app layer (**DNS** queries).

# TCP vs UDP — how to choose

| Need | Prefer |
| --- | --- |
| Correct bytes, web, APIs, SQL | **TCP** |
| Minimum latency, occasional loss OK | **UDP** |

# Loss and retransmission

If a TCP segment is lost, the sender **waits for ACK timeout** (or sees duplicate ACKs in fast retransmit) and **resends**. That protects correctness at the cost of **latency spikes** on lossy paths.

# Connections in production

**Keep-alive** and **connection pooling** reuse TCP/TLS sessions to avoid repeated handshakes. Servers eventually close idle connections; clients must handle **TIME_WAIT** and port exhaustion at extreme scale.

> ANALOGY: **TCP** is registered mail — delivery is tracked and lost pieces are resent. **UDP** is shouting across a room — fast, but words can be missed with no automatic retry.

> NUMBERS: Typical **TCP header** ~**20 bytes** (more with options); **UDP header** **8 bytes**. **RTT** same datacenter often **<1–5 ms**, same continent **~30–80 ms**, cross-continent **~100–300 ms** — these dominate perceived speed more than raw bandwidth for small requests.

## DNS and UDP

Most **DNS queries** use **UDP port 53** for small responses; large responses or **zone transfers** move to **TCP**.`,
    quizQuestions: [
      {
        id: '1-4-q1',
        question: 'Which protocol pattern fits a live video streaming service best?',
        options: [
          'TCP for everything',
          'UDP for the media stream, TCP for control signals',
          'UDP for everything including billing',
          'Neither — use HTTP only',
        ],
        correctIndex: 1,
        explanation:
          'Video tolerates occasional loss; UDP keeps latency low. Control messages (pause, auth) still need reliability — TCP or secure signaling channels.',
      },
      {
        id: '1-4-q2',
        question: 'TCP guarantees ordered delivery. Why does this matter for web pages?',
        options: [
          "It doesn't matter for HTTPS",
          'Byte streams must be reassembled in order or application data is corrupted',
          'Images always load faster',
          'CSS requires UDP',
        ],
        correctIndex: 1,
        explanation:
          'HTTP bodies are byte streams; TCP presents an ordered stream to the application.',
      },
      {
        id: '1-4-q3',
        question: 'What happens when a TCP packet is lost?',
        options: [
          'The connection always closes',
          'Nothing — TCP accepts data loss',
          'The sender retransmits after detecting missing ACKs / timeout',
          'The receiver opens a brand-new TCP connection automatically',
        ],
        correctIndex: 2,
        explanation:
          'TCP uses ACKs and retransmissions to recover from loss — reliability with potential extra latency.',
      },
      {
        id: '1-4-q4',
        question: 'Why is UDP often lower latency than TCP for the same payload?',
        options: [
          'UDP uses stronger compression',
          'UDP skips connection setup and does not ACK every datagram',
          'UDP uses a different link layer',
          'UDP packets always carry more application bytes',
        ],
        correctIndex: 1,
        explanation:
          'No handshake and no per-segment reliability logic means less waiting — at the cost of no delivery guarantee.',
      },
      {
        id: '1-4-q5',
        question: 'DNS queries typically use?',
        options: [
          'TCP only',
          'UDP for typical queries; TCP for large responses or zone transfers',
          'HTTP only',
          'Neither — DNS does not use the network stack',
        ],
        correctIndex: 1,
        explanation:
          'Small DNS queries are usually UDP for speed; TCP appears when responses are too large or for zone transfers.',
      },
    ],
  },
  {
    id: 'rest-apis',
    title: 'REST APIs',
    interviewTip:
      'In system design, define API endpoints early: resources, pagination, auth, rate limits, errors, and idempotency for payments.',
    readContent: `# What an API is

An **API** is a **contract**: inputs, outputs, errors, and semantics that two systems agree on. **REST** is an **architectural style** for HTTP APIs: **resources** identified by URLs, manipulated with **standard methods**, usually returning **JSON**.

# REST principles (practical version)

- **Client–server** separation
- **Stateless servers** — identity travels in tokens/headers
- **Uniform interface** — standard methods and status codes
- **Resource-oriented paths** — nouns, not verbs in the path

# Resource design

Prefer:

- \`/users\` — collection
- \`/users/123\` — single user
- \`/users/123/posts\` — nested collection

Avoid \`/getUser\` — **GET** already means read.

# CRUD mapping (typical)

| Intent | HTTP |
| --- | --- |
| Create | **POST /collection** |
| Read | **GET /resource** |
| Replace | **PUT /resource** |
| Partial update | **PATCH /resource** |
| Delete | **DELETE /resource** |

# Payloads and headers

Use **JSON** with **Content-Type: application/json**. Validate input. Return consistent error bodies (\`{ "error": "...", "code": "..." }\`).

# Authentication patterns

- **API keys** in headers or query (simple, but guard leakage)
- **Bearer tokens** — \`Authorization: Bearer <token>\`
- **OAuth 2.0** for delegated access (login with Google, etc.)

# Pagination

- **Offset** — \`?page=2&limit=20\` — simple but **slow for deep pages** (large OFFSET scans).
- **Cursor** — \`?cursor=abc&limit=20\` — stable and fast at scale; **preferred** for huge feeds.

# Versioning

Common patterns: **path** (\`/v1/users\`), **header** (\`Accept\` vendor types), **query** (\`?version=1\`). Path versioning is explicit and easy to grep in logs.

# Rate limiting

Return **429 Too Many Requests**; include **Retry-After** when possible so clients back off politely.

# Idempotency

**GET**, **PUT**, **DELETE** should be **idempotent** — repeating the same call does not compound side effects. **POST** creates new resources; retries can duplicate unless you use **idempotency keys** (Stripe-style) for payments and writes.

> ANALOGY: A REST API is a restaurant menu. The menu lists **resources** (dishes). You **request** with a standard **method** (order, cancel). The kitchen does not need you to explain *how* to cook — only **what** resource you want.

## Design checklist

Explicit **errors**, **pagination**, **auth**, **rate limits**, and **idempotency** for money — interviewers notice all five.`,
    quizQuestions: [
      {
        id: '1-5-q1',
        question: 'Which REST endpoint design is most appropriate?',
        options: ['GET /getUser?id=123', 'GET /users/123', 'POST /users/123/fetch', 'GET /user/read/123'],
        correctIndex: 1,
        explanation:
          'Use nouns for resources; HTTP methods carry the verb. GET /users/123 is idiomatic REST.',
      },
      {
        id: '1-5-q2',
        question: "You're designing a payment API. Why is idempotency critical?",
        options: [
          'It makes the API faster',
          'It prevents duplicate charges if a request is retried',
          'It improves security by itself',
          'It reduces database size',
        ],
        correctIndex: 1,
        explanation:
          'Networks fail; clients retry. Idempotency keys let the server recognize duplicates and apply the charge once.',
      },
      {
        id: '1-5-q3',
        question: 'You have 10 million records. Which pagination is usually better at depth?',
        options: [
          'Offset-based (?page=500&limit=20)',
          'Cursor-based (?cursor=abc123&limit=20)',
          'Return all rows',
          'Random sampling per request',
        ],
        correctIndex: 1,
        explanation:
          'Deep offsets get expensive. Cursor pagination seeks using an indexed column.',
      },
      {
        id: '1-5-q4',
        question: 'A REST API should be stateless. What does that mean?',
        options: [
          'The server has no database',
          'Each request contains the context needed to process it without server-stored session',
          'The API returns only static JSON',
          'You must not use cookies ever',
        ],
        correctIndex: 1,
        explanation:
          'Stateless here means application servers do not pin per-client state in memory between requests.',
      },
      {
        id: '1-5-q5',
        question: 'What status code fits "resource created successfully" after a POST?',
        options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
        correctIndex: 1,
        explanation:
          '201 Created is conventional after creating a resource; Location header may point to it.',
      },
      {
        id: '1-5-q6',
        question: 'How should you version a public HTTP API?',
        options: [
          'Never version — ship breaking changes silently',
          'URL path versioning like /v1/users alongside /v2/users',
          'Only version internal databases',
          'Hide versions from clients',
        ],
        correctIndex: 1,
        explanation:
          'Explicit versioning (often in the path) lets clients migrate without surprise outages.',
      },
    ],
  },
  {
    id: 'websockets-real-time-communication',
    title: 'WebSockets & Real-Time Communication',
    interviewTip:
      'For real-time features, propose WebSockets plus a scaling story: many nodes behind a load balancer, sticky sessions or shared connection registries, and Redis Pub/Sub (or Kafka) to fan out across servers.',
    readContent: `# Why HTTP alone feels wrong for chat

Classic **HTTP/1.1** is **request–response**: the client asks, the server answers. To fake "live" updates you **poll** — repeatedly asking "anything new?" That wastes requests, adds **latency**, and still misses instant delivery unless you poll constantly.

# What WebSockets fix

A **WebSocket** is a **persistent, bidirectional** channel over a single TCP connection. After upgrade, **either side** can send frames anytime — ideal for **chat**, **live dashboards**, **collaborative editing**, **tickers**, and **multiplayer** sync signals.

# How the connection starts

The client begins with a normal HTTP request carrying **Upgrade: websocket** and **Sec-WebSocket-Key**. The server returns **101 Switching Protocols**. After that, the connection speaks the **WebSocket framing** protocol instead of HTTP request/response cycles.

# Compared to other patterns

| Approach | Pros | Cons |
| --- | --- | --- |
| **Short polling** | Simple | High overhead, poor latency |
| **Long polling** | Better than naive polling | Still awkward; server holds requests |
| **SSE** | One-way server push over HTTP | Not bidirectional |
| **WebSocket** | Full duplex, low framing overhead | Stateful connections, harder to scale |

# Scaling WebSockets

Each connection consumes **memory** and a **file descriptor**. At scale you run **many WebSocket servers** behind a **load balancer**. Challenges:

- **Sticky sessions** — route the same user to the same node (simple but uneven).
- **Shared pub/sub** — **Redis Pub/Sub**, **NATS**, or **Kafka** so a message produced on node A reaches a client connected to node B.

# Capacity intuition

Well-tuned servers often handle **tens of thousands to hundreds of thousands** of mostly idle connections; **CPU** matters when every message is processed or transformed.

> ANALOGY: **HTTP** is walkie-talkie etiquette — press, speak, release, wait for reply. **WebSocket** is a **phone call** — either party can talk once the line is up.

> NUMBERS: WebSocket **frames** add on the order of **2–14 bytes** of overhead; HTTP requests often carry **hundreds of bytes** of headers. A chat message might arrive in **milliseconds** over WebSocket vs up to the **poll interval** with naive polling.

## When not to use WebSockets

If you only need **server → client** updates (sports scores), **SSE** can be simpler. If updates are rare, **polling** with caching headers might suffice.`,
    quizQuestions: [
      {
        id: '1-6-q1',
        question: "Why can't regular HTTP alone handle real-time chat efficiently?",
        options: [
          'HTTP is too slow for text',
          'HTTP is request-response — the server cannot push without a client request unless you add streaming/WebSockets',
          'HTTP cannot transmit UTF-8',
          'HTTP connections cannot be encrypted',
        ],
        correctIndex: 1,
        explanation:
          'Without WebSockets or SSE, the client must poll for new messages, which wastes work and adds delay.',
      },
      {
        id: '1-6-q2',
        question:
          '500,000 chat users are spread across 10 servers. User A on Server 1 sends a message to User B on Server 5. How should delivery work?',
        options: [
          'Server 1 makes a direct HTTP call to Server 5 for every message',
          'Both users poll the same relational row',
          'Publish to a shared broker/channel (e.g. Redis Pub/Sub); Server 5 pushes on User B socket',
          'User B polls all 10 servers continuously',
        ],
        correctIndex: 2,
        explanation:
          'Brokers fan out events so every node learns about messages for channels it hosts.',
      },
      {
        id: '1-6-q3',
        question: 'What is the main advantage of Server-Sent Events (SSE) over WebSockets for some apps?',
        options: [
          'SSE is always bidirectional',
          'SSE is simpler for one-way server→client push over standard HTTP semantics',
          'SSE is better for binary game protocols',
          'SSE always has lower latency than WebSockets',
        ],
        correctIndex: 1,
        explanation:
          'SSE is HTTP-friendly and great for streaming updates to the browser when you do not need upstream messages on the same channel.',
      },
      {
        id: '1-6-q4',
        question: 'A WebSocket connection starts as?',
        options: [
          'A raw UDP flow',
          'A DNS ANY query',
          'An HTTP request that upgrades the protocol',
          'A TLS session resumption only',
        ],
        correctIndex: 2,
        explanation:
          'The Upgrade handshake piggybacks on HTTP port 443/80 then switches to WebSocket frames.',
      },
      {
        id: '1-6-q5',
        question: 'How many concurrent WebSocket connections can a single well-configured server often handle?',
        options: [
          'About 100',
          'About 1,000',
          'On the order of 10,000 to 100,000+ depending on workload',
          'Unlimited without cost',
        ],
        correctIndex: 2,
        explanation:
          'OS limits, memory, and per-message CPU determine the ceiling; six-figure idle connections are possible with tuning.',
      },
    ],
  },
];
