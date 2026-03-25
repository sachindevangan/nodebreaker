import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_11_TOPICS: Topic[] = [
  {
    id: 'authentication-vs-authorization',
    title: 'Authentication vs Authorization',
    interviewTip: 'State both auth steps in your design: who is user and what can they do.',
    readContent: `# Authentication vs Authorization
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Authentication proves identity. Authorization checks permissions.
- AuthN comes before AuthZ in request handling.
- Session, token, API key, and OAuth are common identity methods.
- RBAC, ABAC, and ACL model access control.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- User login and role-based access
- Admin panels and tenant boundaries
- Service API key checks
- Policy-driven enterprise controls

## Failure Modes and Trade-Offs
- Strong login with weak authorization causes data leaks
- Role explosion in naive RBAC
- Overly static ACLs become hard to manage
- Missing object-level permission checks

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: Hotel ID check is authentication; key card access by floor is authorization.
> INTERVIEW TIP: Say JWT for identity, RBAC/ABAC for permissions, enforced consistently at gateway and service layers.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'authentication-vs-authorization-q1',
        question: 'Authentication answers:',
        options: ['What can you access', 'Who are you', 'How much traffic', 'Which region'],
        correctIndex: 1,
        explanation: 'AuthN verifies identity.',
      },
      {
        id: 'authentication-vs-authorization-q2',
        question: 'Authorization answers:',
        options: ['Who issued token', 'What are you allowed to do', 'How many retries', 'How to scale'],
        correctIndex: 1,
        explanation: 'AuthZ governs permissions.',
      },
      {
        id: 'authentication-vs-authorization-q3',
        question: 'If auth exists but authorization missing:',
        options: ['No risk', "Users may access others' data", 'Only latency issues', 'Only logging issues'],
        correctIndex: 1,
        explanation: 'Identity without permission checks is insecure.',
      },
      {
        id: 'authentication-vs-authorization-q4',
        question: 'Session auth is:',
        options: ['Always stateless', 'Server-side session lookup via cookie ID', 'OAuth only', 'No cookies'],
        correctIndex: 1,
        explanation: 'Server stores state and maps cookie/session ID.',
      },
      {
        id: 'authentication-vs-authorization-q5',
        question: 'JWT auth is often:',
        options: ['Stateful by default', 'Stateless signature verification', 'Only for mobile', 'Never expires'],
        correctIndex: 1,
        explanation: 'Server can verify token without session store.',
      },
      {
        id: 'authentication-vs-authorization-q6',
        question: 'ABAC is best when:',
        options: ['Only three fixed roles', 'Policy needs attributes like department/time/location', 'No permissions needed', 'No users'],
        correctIndex: 1,
        explanation: 'Attribute-based control handles richer rules.',
      }
    ],
  },
  {
    id: 'oauth-and-jwt',
    title: 'OAuth 2.0 and JWT',
    interviewTip: 'Explain OAuth flow steps and distinguish protocol vs token format.',
    readContent: `# OAuth 2.0 and JWT
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- OAuth is delegated authorization for third-party access.
- Authorization Code flow is common for web apps.
- Access tokens are short-lived; refresh tokens renew access safely.
- JWT is a token format with header, payload, and signature.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Sign in with Google
- API access delegation
- Stateless service auth
- Cross-service token verification

## Failure Modes and Trade-Offs
- Putting secrets in JWT payload
- Long-lived tokens without rotation
- Refresh tokens exposed to browser JS
- No issuer/audience validation

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> IMPORTANT: JWT payload is encoded, not encrypted. Never place sensitive secrets in claims.
> INTERVIEW TIP: Mention short-lived access tokens around 15 minutes with refresh rotation and claim validation.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'oauth-and-jwt-q1',
        question: 'OAuth primarily solves:',
        options: ['Image resizing', 'Delegated authorization without sharing password', 'DNS balancing', 'Data compression'],
        correctIndex: 1,
        explanation: 'OAuth lets clients act on user behalf safely.',
      },
      {
        id: 'oauth-and-jwt-q2',
        question: 'Authorization Code flow includes:',
        options: ['Client receives password directly', 'Backend exchanges code for token', 'No redirect', 'No auth server'],
        correctIndex: 1,
        explanation: 'Server-side code exchange is core security step.',
      },
      {
        id: 'oauth-and-jwt-q3',
        question: 'Refresh token purpose:',
        options: ['Call APIs directly forever', 'Obtain new access tokens after expiry', 'Encrypt JWT payload', 'Replace TLS'],
        correctIndex: 1,
        explanation: 'Refresh tokens extend sessions safely.',
      },
      {
        id: 'oauth-and-jwt-q4',
        question: 'JWT structure is:',
        options: ['header.payload.signature', 'claims.signature.header', 'key.data.iv', 'id.secret.hash'],
        correctIndex: 0,
        explanation: 'Standard JWT has three dot-separated segments.',
      },
      {
        id: 'oauth-and-jwt-q5',
        question: 'JWT revocation challenge:',
        options: ['Always centrally revoked automatically', 'Valid until expiry unless additional revocation strategy exists', 'Cannot expire', 'No signature'],
        correctIndex: 1,
        explanation: 'Stateless tokens are hard to invalidate early.',
      },
      {
        id: 'oauth-and-jwt-q6',
        question: 'Best storage for browser auth tokens:',
        options: ['localStorage always', 'httpOnly secure cookies for sensitive tokens', 'URL query params', 'image metadata'],
        correctIndex: 1,
        explanation: 'httpOnly reduces XSS token theft risk.',
      }
    ],
  },
  {
    id: 'api-gateway-the-front-door',
    title: 'API Gateway: The Front Door',
    interviewTip: 'Draw gateway between LB and services and list exactly what it owns.',
    simulatorDemo: { description: 'Demonstrate request routing through a centralized API gateway before requests fan out to domain services.', instruction: 'The API Gateway routes requests to the correct service based on the path. All authentication, rate limiting, and logging happen at the gateway level. Each service only handles its own business logic.', simulationAutoStart: true, setupNodes: [{ type: 'loadBalancer', label: 'Load Balancer', position: { x: 0, y: 300 }, data: { throughput: 50000, latency: 2, capacity: 200000 } }, { type: 'apiGateway', label: 'API Gateway', position: { x: 300, y: 300 }, data: { throughput: 20000, latency: 10, capacity: 100000 } }, { type: 'service', label: 'User Service', position: { x: 600, y: 100 }, data: { throughput: 5000, latency: 20, capacity: 20000 } }, { type: 'service', label: 'Payment Service', position: { x: 600, y: 300 }, data: { throughput: 3000, latency: 50, capacity: 15000 } }, { type: 'service', label: 'Product Service', position: { x: 600, y: 500 }, data: { throughput: 8000, latency: 15, capacity: 30000 } }, { type: 'database', label: 'Users DB', position: { x: 900, y: 100 }, data: { throughput: 2000, latency: 10, capacity: 10000 } }, { type: 'database', label: 'Payments DB', position: { x: 900, y: 300 }, data: { throughput: 1000, latency: 15, capacity: 5000 } }, { type: 'database', label: 'Products DB', position: { x: 900, y: 500 }, data: { throughput: 5000, latency: 8, capacity: 20000 } }], setupEdges: [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 1, target: 3 }, { source: 1, target: 4 }, { source: 2, target: 5 }, { source: 3, target: 6 }, { source: 4, target: 7 }] },
    readContent: `# API Gateway: The Front Door
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Gateway is a single entry point handling cross-cutting concerns.
- Responsibilities include routing, auth, rate limits, and observability.
- Gateway differs from LB: route across services vs instances of one service.
- BFF pattern tailors APIs by client type.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Route users/payments/products
- Centralized auth and quotas
- Request transformation and aggregation
- Per-client API optimization

## Failure Modes and Trade-Offs
- Gateway SPOF without redundancy
- Gateway overload as bottleneck
- Too much business logic in gateway
- Unclear ownership boundaries

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> ANALOGY: Gateway is a receptionist that verifies identity and routes visitors to correct department.
> INTERVIEW TIP: Name concrete tech like Kong or AWS API Gateway and mention high availability setup.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'api-gateway-the-front-door-q1',
        question: 'Gateway core job:',
        options: ['Store all business data', 'Route and enforce cross-cutting policies', 'Render frontend', 'Replace databases'],
        correctIndex: 1,
        explanation: 'Gateway mediates ingress concerns.',
      },
      {
        id: 'api-gateway-the-front-door-q2',
        question: 'LB vs gateway:',
        options: ['Same thing always', 'LB spreads same-service instances; gateway routes across services', 'Gateway only for DNS', 'LB does auth only'],
        correctIndex: 1,
        explanation: 'Different abstraction layers.',
      },
      {
        id: 'api-gateway-the-front-door-q3',
        question: 'Why central auth at gateway helps:',
        options: ['Removes all service auth logic permanently', 'Consistent enforcement and reduced duplication', 'Increases client complexity', 'Disables JWT'],
        correctIndex: 1,
        explanation: 'Centralized checks improve consistency.',
      },
      {
        id: 'api-gateway-the-front-door-q4',
        question: 'BFF pattern means:',
        options: ['One API for all forever', 'Different backend APIs optimized per client type', 'No gateway', 'Only mobile apps'],
        correctIndex: 1,
        explanation: 'Client-specific backend aggregation is BFF principle.',
      },
      {
        id: 'api-gateway-the-front-door-q5',
        question: 'Gateway risk if misdesigned:',
        options: ['No latency impact', 'Bottleneck and SPOF', 'Infinite scaling for free', 'No logging'],
        correctIndex: 1,
        explanation: 'Must scale and replicate gateway layer.',
      },
      {
        id: 'api-gateway-the-front-door-q6',
        question: 'Popular gateway choice:',
        options: ['Kong', 'Photoshop', 'Redis', 'Jest'],
        correctIndex: 0,
        explanation: 'Kong is a common API gateway platform.',
      }
    ],
  },
  {
    id: 'rate-limiting-protection',
    title: 'Rate Limiting for Protection',
    interviewTip: 'Mention exact security limits and escalation actions, not only algorithm names.',
    readContent: `# Rate Limiting for Protection
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Security-oriented limits defend against brute force and abuse.
- Login and OTP endpoints need strict low thresholds.
- Distributed counters must be centralized to avoid limit bypass.
- Tiered limits combine fairness and monetization.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- Protect login endpoint
- Throttle signup abuse per IP
- Per-key developer API quotas
- DDoS pressure reduction

## Failure Modes and Trade-Offs
- Per-instance counters allow bypass
- Global wildcard rules hurt legitimate traffic
- No CAPTCHA escalation path
- No audit trail for blocked traffic

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> NUMBERS: Common security limits include login 5 attempts per 15 minutes and OTP around 3 attempts per 10 minutes.
> INTERVIEW TIP: Use Redis INCR+EXPIRE for distributed counters and tie lockouts to account and IP dimensions.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'rate-limiting-protection-q1',
        question: 'Security rate limiting primarily reduces:',
        options: ['Code quality issues', 'Brute force and abuse', 'Schema drift', 'DNS latency'],
        correctIndex: 1,
        explanation: 'It constrains attack attempts and abusive clients.',
      },
      {
        id: 'rate-limiting-protection-q2',
        question: 'Strong login protection limit example:',
        options: ['500 per minute', '5 failed attempts per 15 minutes', 'No limit', '1 million per day'],
        correctIndex: 1,
        explanation: 'Tight login controls reduce brute force success.',
      },
      {
        id: 'rate-limiting-protection-q3',
        question: 'Distributed API tier with local counters causes:',
        options: ['Perfect enforcement', 'Per-instance bypass and effective over-limit traffic', 'No scaling', 'No retries'],
        correctIndex: 1,
        explanation: 'Clients can hit different nodes to evade local limits.',
      },
      {
        id: 'rate-limiting-protection-q4',
        question: 'Redis helps by:',
        options: ['Rendering UI', 'Atomic shared counters across fleet', 'Encrypting TLS handshake', 'Serving static images'],
        correctIndex: 1,
        explanation: 'Atomic increment/expiry supports consistent limits.',
      },
      {
        id: 'rate-limiting-protection-q5',
        question: 'Tiered limits support:',
        options: ['Only security', 'Fair use plus monetization plans', 'No auth', 'No visibility'],
        correctIndex: 1,
        explanation: 'Different customer tiers map to different quotas.',
      },
      {
        id: 'rate-limiting-protection-q6',
        question: 'Endpoint-specific limits are needed because:',
        options: ['All endpoints same cost', 'Expensive operations need tighter caps', 'Breaks API keys', 'Remove WAF'],
        correctIndex: 1,
        explanation: 'Cost and abuse profiles vary by endpoint.',
      }
    ],
  },
  {
    id: 'waf-and-ddos-protection',
    title: 'WAF & DDoS Protection',
    interviewTip: 'Say mitigation not prevention; emphasize edge network and origin shielding.',
    readContent: `# WAF & DDoS Protection
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- WAF inspects HTTP traffic and blocks malicious patterns.
- DDoS mitigation is layered: edge absorption, rate limits, reputation, CAPTCHA.
- Application-layer attacks can look like valid traffic.
- Keep origin IP hidden behind edge protection.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- SQLi/XSS filtering
- Geo/IP blocking policies
- Volumetric attack absorption
- Bot challenge flows

## Failure Modes and Trade-Offs
- Overblocking legitimate traffic
- No managed rule updates
- Origin exposed directly
- No incident playbooks

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> IMPORTANT: You cannot fully prevent DDoS, only mitigate. Keep origin private behind CDN/WAF.
> NUMBERS: Very large DDoS events have exceeded multiple terabits per second; edge networks absorb this far better than single origins.
> INTERVIEW TIP: Mention Cloudflare or AWS Shield plus WAF custom and managed rules.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'waf-and-ddos-protection-q1',
        question: 'WAF is mainly for:',
        options: ['Block HTTP-layer attacks via rules', 'Store backups', 'Compile code', 'DNS only'],
        correctIndex: 0,
        explanation: 'WAF filters malicious web requests.',
      },
      {
        id: 'waf-and-ddos-protection-q2',
        question: 'DDoS goal is:',
        options: ['Improve cache hit ratio', 'Exhaust resources and deny service', 'Encrypt traffic', 'Rotate secrets'],
        correctIndex: 1,
        explanation: 'Attack floods degrade availability.',
      },
      {
        id: 'waf-and-ddos-protection-q3',
        question: 'Why CDN helps DDoS defense:',
        options: ['Makes DB faster', 'Absorbs traffic at distributed edge before origin', 'Eliminates auth', 'Stops coding bugs'],
        correctIndex: 1,
        explanation: 'Edge capacity and anycast dilute attacks.',
      },
      {
        id: 'waf-and-ddos-protection-q4',
        question: 'Managed WAF rules are useful because:',
        options: ['Never updated', 'Vendors continuously tune signatures', 'Only for images', 'No false positives'],
        correctIndex: 1,
        explanation: 'Managed updates track evolving threats.',
      },
      {
        id: 'waf-and-ddos-protection-q5',
        question: 'Origin exposure risk:',
        options: ['Lower latency only', 'Attackers can bypass edge protections', 'Better security', 'No impact'],
        correctIndex: 1,
        explanation: 'Direct origin access undermines mitigation architecture.',
      },
      {
        id: 'waf-and-ddos-protection-q6',
        question: 'Best statement:',
        options: ['DDoS can be prevented entirely', 'DDoS is mitigated through layered controls', 'WAF replaces rate limiting', 'CAPTCHA stops all attacks'],
        correctIndex: 1,
        explanation: 'Defense is layered and probabilistic, not absolute.',
      }
    ],
  },
  {
    id: 'cors-and-https-tls',
    title: 'CORS & HTTPS/TLS',
    interviewTip: 'Call out specific allowed origins and TLS posture in production.',
    readContent: `# CORS & HTTPS/TLS
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- CORS is a browser-enforced policy for cross-origin requests.
- Preflight OPTIONS checks allowed methods/headers for non-simple requests.
- HTTPS with TLS provides confidentiality, integrity, and server authentication.
- HSTS forces browsers to use HTTPS only.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- SPA calling API on different domain
- Token-authenticated API calls with Authorization header
- TLS termination at LB
- Secure cookies and strict transport policies

## Failure Modes and Trade-Offs
- Wildcard CORS with credentials is dangerous
- Missing OPTIONS handler breaks frontend
- Outdated TLS config weakens security
- No HSTS allows downgrade risk

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> IMPORTANT: Always use HTTPS in production and avoid Allow-Origin wildcard for authenticated APIs.
> INTERVIEW TIP: Mention TLS 1.3 preference, HSTS, and explicit CORS origin allowlist.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'cors-and-https-tls-q1',
        question: 'CORS exists to:',
        options: ['Speed up SQL', 'Protect browsers from unauthorized cross-origin requests', 'Encrypt payload', 'Replace OAuth'],
        correctIndex: 1,
        explanation: 'Browser enforces origin policies for safety.',
      },
      {
        id: 'cors-and-https-tls-q2',
        question: 'Preflight request is typically:',
        options: ['HEAD', 'OPTIONS', 'PATCH', 'TRACE'],
        correctIndex: 1,
        explanation: 'Browser sends OPTIONS before non-simple request.',
      },
      {
        id: 'cors-and-https-tls-q3',
        question: "Allow-Origin '*' with credentials is risky because:",
        options: ['Faster', 'Any origin can attempt authenticated browser calls', 'Breaks DNS', 'No risk'],
        correctIndex: 1,
        explanation: 'Wildcard plus auth expands attack surface.',
      },
      {
        id: 'cors-and-https-tls-q4',
        question: 'TLS provides:',
        options: ['Only compression', 'Encryption, integrity, and server identity', 'Only auth', 'Only caching'],
        correctIndex: 1,
        explanation: 'TLS secures data in transit comprehensively.',
      },
      {
        id: 'cors-and-https-tls-q5',
        question: 'HSTS purpose:',
        options: ['Enable HTTP fallback', 'Force HTTPS-only for domain', 'Rotate API keys', 'Cache JSON'],
        correctIndex: 1,
        explanation: 'It prevents insecure downgrade attempts.',
      },
      {
        id: 'cors-and-https-tls-q6',
        question: 'Best production TLS choice:',
        options: ['TLS 1.0', 'TLS 1.3 where possible', 'SSLv3', 'No certificate'],
        correctIndex: 1,
        explanation: 'TLS 1.3 improves security and handshake performance.',
      }
    ],
  },
  {
    id: 'secrets-management-encryption',
    title: 'Secrets Management & Encryption',
    interviewTip: 'Mention rotation frequency, manager choice, and leak response protocol.',
    readContent: `# Secrets Management & Encryption
Distributed systems become real when services exchange information under load, failure, and evolving requirements. This topic matters because interviewers are not looking for buzzwords; they want proof that you can make practical trade-offs. A strong answer explains what the concept is, where it helps, where it hurts, how to operate it safely, and how you would defend your choice in production.
## Core Ideas
- Secrets must never live in source control or client apps.
- Use secret managers with rotation, access policy, and audit logs.
- Encrypt data at rest and in transit with managed keys.
- Envelope encryption separates data keys from master key management.

## Real-World Walkthrough
Start with a realistic user journey and map each technical decision to customer impact. If the request path is latency sensitive, optimize for predictable tail latency and graceful failure. If the workflow is background-heavy, optimize for decoupling, retries, and visibility into work-in-progress. For every design, define timeouts, retries, ownership boundaries, and an observable signal that tells you when the system is unhealthy.
## Common Use Cases
- DB credentials in secrets manager
- Automated key rotation
- KMS-managed envelope encryption
- Leak detection in CI pipelines

## Failure Modes and Trade-Offs
- Leaked secrets in git history
- Long-lived static keys
- Plaintext env sprawl
- No incident rotation playbook

A mature system design explicitly handles ambiguity. In interviews, mention what happens during dependency outages, partial success, duplicate processing, stale reads, and deploy rollbacks. Then explain your mitigation plan: circuit breaker or timeout at call boundaries, idempotency for retried writes, and dashboards that show latency, error rate, and saturation. This demonstrates production judgment rather than classroom theory.
## Architecture Checklist
- Define request budget: user-facing SLA, service-level timeout, and retry envelope.
- Define ownership: which service owns the source of truth and which components derive read models.
- Define resilience: backoff strategy, dead-letter handling, and fallback behavior when dependencies fail.
- Define observability: metrics, logs with correlation IDs, and traces that expose critical path latency.
- Define migration plan: backward compatibility, deprecation window, and rollout/rollback strategy.
> IMPORTANT: Never commit credentials. If leaked, rotate immediately even if history is rewritten.
> INTERVIEW TIP: State Secrets Manager/Vault, 30-90 day rotation, and AES-256 at rest plus TLS in transit.

## Interview Framing
When you present this concept, first state the problem in one sentence. Second, list two viable approaches and one reason to reject each in this context. Third, pick your final design and defend it with measurable targets such as latency SLO, failure budget, or throughput objective. Finally, call out one scaling path and one reliability safeguard. That structure sounds senior, keeps the conversation organized, and makes follow-up questions easier to answer.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.

In practice, teams succeed by documenting assumptions and testing them early. Run load tests to validate throughput, run failure drills to validate recovery, and run compatibility tests before changing interfaces. If a design choice increases complexity, justify it with a clear business or reliability payoff. If a simpler option is good enough, say so explicitly. Interviewers value balanced judgment: not over-engineering by default, but not ignoring known failure modes either.
`,
    quizQuestions: [
      {
        id: 'secrets-management-encryption-q1',
        question: 'Best place for production DB password:',
        options: ['Git repo', 'Secrets manager service', 'Mobile app bundle', 'Public wiki'],
        correctIndex: 1,
        explanation: 'Managed secret stores support audit and rotation.',
      },
      {
        id: 'secrets-management-encryption-q2',
        question: 'Encryption at rest protects against:',
        options: ['Browser CORS issues', 'Disk theft or unauthorized storage access', 'DNS outages', 'Rate limits'],
        correctIndex: 1,
        explanation: 'Stored ciphertext reduces impact of storage compromise.',
      },
      {
        id: 'secrets-management-encryption-q3',
        question: 'Envelope encryption means:',
        options: ['Single static key in code', 'Data encrypted with DEK, DEK encrypted with KEK', 'No key management', 'Only TLS'],
        correctIndex: 1,
        explanation: 'Layered key hierarchy improves rotation and control.',
      },
      {
        id: 'secrets-management-encryption-q4',
        question: 'Why env vars alone are limited at scale:',
        options: ['Cannot store strings', 'Weak rotation/audit/governance patterns', 'No runtime access', 'Always encrypted by default'],
        correctIndex: 1,
        explanation: 'Managers provide lifecycle controls missing in plain env vars.',
      },
      {
        id: 'secrets-management-encryption-q5',
        question: 'If secret leaked, correct action:',
        options: ['Ignore if private repo', 'Immediately rotate and audit access', 'Rename variable', 'Delete logs only'],
        correctIndex: 1,
        explanation: 'Assume compromise and rotate promptly.',
      },
      {
        id: 'secrets-management-encryption-q6',
        question: 'Useful CI secret scanners include:',
        options: ['Gitleaks and TruffleHog', 'Webpack only', 'Jest only', 'Docker compose'],
        correctIndex: 0,
        explanation: 'Scanner tooling helps prevent accidental credential commits.',
      }
    ],
  }
];
