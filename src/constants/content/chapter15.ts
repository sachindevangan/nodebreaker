import type { Topic } from '@/constants/curriculumTypes';

export const CHAPTER_15_TOPICS: Topic[] = [
  {
    id: 'clarify-requirements',
    title: 'Clarify Requirements',
    interviewTip: 'Always begin with targeted requirement questions before drawing architecture.',
    readContent: `# Clarify Requirements

This chapter topic is a practical architecture concept that appears frequently in real systems and in interviews. The key to mastering it is understanding not only the definition, but also when to use it, when not to use it, and what operational consequences come with the choice.

## Core Concept

- Requirement clarification defines scope and prevents solving the wrong problem.
- Functional requirements describe capabilities; non-functional requirements define scale and quality targets.
- Small requirement changes can completely alter architecture choices.

## Why It Matters

At small scale, many architectural decisions look equivalent. At medium and large scale, these choices shape deployment speed, team autonomy, fault isolation, and operational burden. Interviewers usually test whether you can map design choices to requirements instead of copying a one-size-fits-all pattern.

## Practical Design Guidance

- Ask about user scale, read/write ratio, latency targets, consistency expectations, and geo constraints.
- Apply the 80/20 rule: focus deeply on core user journeys that dominate usage.
- Write requirements visibly and reference them while making architecture decisions.

A strong answer should include both happy path and failure path. Always describe what happens when dependencies are slow, unavailable, or return partial success. Mention observability signals you would watch such as latency percentiles, error rate, queue depth, retry rate, and saturation.

## Common Pitfalls

- Adopting complexity before there is a measurable need.
- Ignoring ownership boundaries and turning architecture into organizational friction.
- Forgetting migration and rollout safety when introducing new patterns.
- Treating infrastructure patterns as business logic containers.

## Real-World Tradeoffs

No architecture pattern is universally best. Mature teams optimize for current constraints and keep an explicit path to evolve later. It is better to start with a simple solution that can be safely extended than to start with a heavyweight solution that slows product iteration.

> ANALOGY: Before building a house, you confirm room count, location, and budget; otherwise blueprint is useless.
> IMPORTANT: Spending 3-5 minutes clarifying requirements is essential, not wasted time.
> INTERVIEW TIP: Say: before designing, let me clarify scope and constraints.

## Interview Structure

In interviews, present this topic using a short structure:
1) Problem statement and context.
2) Recommended baseline approach.
3) Alternative approach and why not chosen here.
4) Failure modes and mitigations.
5) Scale triggers that would change your design.

This makes your explanation concise, senior, and easy for interviewers to evaluate.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'clarify-requirements-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'clarify-requirements-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'clarify-requirements-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'clarify-requirements-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'clarify-requirements-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'clarify-requirements-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'back-of-envelope-estimation-framework',
    title: 'Back-of-the-Envelope Estimation Framework',
    interviewTip: 'Show rough math clearly: assumptions, QPS, storage, bandwidth, and server counts.',
    readContent: `# Back-of-Envelope Estimation Framework

This chapter topic is a practical architecture concept that appears frequently in real systems and in interviews. The key to mastering it is understanding not only the definition, but also when to use it, when not to use it, and what operational consequences come with the choice.

## Core Concept

- Estimation converts vague scale words into concrete architecture constraints.
- Start with DAU and activity assumptions, derive average and peak QPS.
- Estimate storage by record size times writes per period and retention duration.

## Why It Matters

At small scale, many architectural decisions look equivalent. At medium and large scale, these choices shape deployment speed, team autonomy, fault isolation, and operational burden. Interviewers usually test whether you can map design choices to requirements instead of copying a one-size-fits-all pattern.

## Practical Design Guidance

- Estimate network throughput from QPS and payload size for ingress and egress.
- Convert peak load into capacity needs per tier with safety margin.
- Prioritize order-of-magnitude correctness over false precision.

A strong answer should include both happy path and failure path. Always describe what happens when dependencies are slow, unavailable, or return partial success. Mention observability signals you would watch such as latency percentiles, error rate, queue depth, retry rate, and saturation.

## Common Pitfalls

- Adopting complexity before there is a measurable need.
- Ignoring ownership boundaries and turning architecture into organizational friction.
- Forgetting migration and rollout safety when introducing new patterns.
- Treating infrastructure patterns as business logic containers.

## Real-World Tradeoffs

No architecture pattern is universally best. Mature teams optimize for current constraints and keep an explicit path to evolve later. It is better to start with a simple solution that can be safely extended than to start with a heavyweight solution that slows product iteration.

> ANALOGY: You cannot size a highway without estimating number of cars and rush-hour peaks.
> IMPORTANT: Always include peak factor, not only average traffic.
> INTERVIEW TIP: Use rounded constants and transparent assumptions to keep interview math fast and readable.

## Interview Structure

In interviews, present this topic using a short structure:
1) Problem statement and context.
2) Recommended baseline approach.
3) Alternative approach and why not chosen here.
4) Failure modes and mitigations.
5) Scale triggers that would change your design.

This makes your explanation concise, senior, and easy for interviewers to evaluate.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'back-of-envelope-estimation-framework-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'back-of-envelope-estimation-framework-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'back-of-envelope-estimation-framework-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'back-of-envelope-estimation-framework-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'back-of-envelope-estimation-framework-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'back-of-envelope-estimation-framework-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'high-level-design',
    title: 'High-Level Design',
    interviewTip: 'Draw left-to-right flow and narrate each component’s purpose as you add it.',
    readContent: `# High-Level Design

This chapter topic is a practical architecture concept that appears frequently in real systems and in interviews. The key to mastering it is understanding not only the definition, but also when to use it, when not to use it, and what operational consequences come with the choice.

## Core Concept

- High-level design should map requirements to a clean end-to-end architecture.
- Start at entry path then API/services then storage/cache then async processing.
- Label data flow arrows by protocol and major payload type.

## Why It Matters

At small scale, many architectural decisions look equivalent. At medium and large scale, these choices shape deployment speed, team autonomy, fault isolation, and operational burden. Interviewers usually test whether you can map design choices to requirements instead of copying a one-size-fits-all pattern.

## Practical Design Guidance

- Keep diagram readable: enough detail to reason, not every implementation edge case.
- Trace a core user flow to prove architecture supports target behavior.
- Identify one likely bottleneck and one reliability safeguard in the first pass.

A strong answer should include both happy path and failure path. Always describe what happens when dependencies are slow, unavailable, or return partial success. Mention observability signals you would watch such as latency percentiles, error rate, queue depth, retry rate, and saturation.

## Common Pitfalls

- Adopting complexity before there is a measurable need.
- Ignoring ownership boundaries and turning architecture into organizational friction.
- Forgetting migration and rollout safety when introducing new patterns.
- Treating infrastructure patterns as business logic containers.

## Real-World Tradeoffs

No architecture pattern is universally best. Mature teams optimize for current constraints and keep an explicit path to evolve later. It is better to start with a simple solution that can be safely extended than to start with a heavyweight solution that slows product iteration.

> ANALOGY: A subway map abstracts complexity while preserving key routes and transfer points.
> IMPORTANT: Silent drawing hurts evaluation; interviewers need your reasoning in real time.
> INTERVIEW TIP: Narrate each box: why it exists, what it stores/does, and how it fails.

## Interview Structure

In interviews, present this topic using a short structure:
1) Problem statement and context.
2) Recommended baseline approach.
3) Alternative approach and why not chosen here.
4) Failure modes and mitigations.
5) Scale triggers that would change your design.

This makes your explanation concise, senior, and easy for interviewers to evaluate.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'high-level-design-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'high-level-design-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'high-level-design-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'high-level-design-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'high-level-design-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'high-level-design-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'deep-dive',
    title: 'Deep Dive',
    interviewTip: 'Treat deep dive as opportunity: show internals, assumptions, and tradeoffs under pressure.',
    readContent: `# Deep Dive

This chapter topic is a practical architecture concept that appears frequently in real systems and in interviews. The key to mastering it is understanding not only the definition, but also when to use it, when not to use it, and what operational consequences come with the choice.

## Core Concept

- Deep dive validates whether your high-level choices hold up under implementation detail.
- Typical areas include schema/index design, API contracts, scaling strategy, and failure handling.
- Use sub-diagrams or sequence flows to explain one complex subsystem clearly.

## Why It Matters

At small scale, many architectural decisions look equivalent. At medium and large scale, these choices shape deployment speed, team autonomy, fault isolation, and operational burden. Interviewers usually test whether you can map design choices to requirements instead of copying a one-size-fits-all pattern.

## Practical Design Guidance

- If uncertain, state assumptions and reason from first principles instead of guessing confidently.
- Tie indexing, partitioning, and caching directly to expected query patterns.
- Close deep dive by highlighting constraints and fallback strategies.

A strong answer should include both happy path and failure path. Always describe what happens when dependencies are slow, unavailable, or return partial success. Mention observability signals you would watch such as latency percentiles, error rate, queue depth, retry rate, and saturation.

## Common Pitfalls

- Adopting complexity before there is a measurable need.
- Ignoring ownership boundaries and turning architecture into organizational friction.
- Forgetting migration and rollout safety when introducing new patterns.
- Treating infrastructure patterns as business logic containers.

## Real-World Tradeoffs

No architecture pattern is universally best. Mature teams optimize for current constraints and keep an explicit path to evolve later. It is better to start with a simple solution that can be safely extended than to start with a heavyweight solution that slows product iteration.

> ANALOGY: High-level map gets you to the city; deep dive is navigating specific streets during traffic.
> IMPORTANT: Do not bluff technologies you cannot explain when interviewer probes details.
> INTERVIEW TIP: When asked to go deeper, structure your answer with schema, API, failure, and scale.

## Interview Structure

In interviews, present this topic using a short structure:
1) Problem statement and context.
2) Recommended baseline approach.
3) Alternative approach and why not chosen here.
4) Failure modes and mitigations.
5) Scale triggers that would change your design.

This makes your explanation concise, senior, and easy for interviewers to evaluate.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'deep-dive-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'deep-dive-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'deep-dive-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'deep-dive-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'deep-dive-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'deep-dive-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'trade-offs-and-bottlenecks',
    title: 'Trade-offs & Bottlenecks',
    interviewTip: 'Explicitly state the main tradeoff, chosen side, and why requirements justify it.',
    readContent: `# Trade-offs and Bottlenecks

This chapter topic is a practical architecture concept that appears frequently in real systems and in interviews. The key to mastering it is understanding not only the definition, but also when to use it, when not to use it, and what operational consequences come with the choice.

## Core Concept

- System design quality is measured by tradeoff awareness, not by pretending there is one perfect architecture.
- Common tradeoffs include consistency vs availability, latency vs throughput, cost vs performance, and simplicity vs scalability.
- Bottlenecks are found on critical paths by checking tier capacity against estimated peak demand.

## Why It Matters

At small scale, many architectural decisions look equivalent. At medium and large scale, these choices shape deployment speed, team autonomy, fault isolation, and operational burden. Interviewers usually test whether you can map design choices to requirements instead of copying a one-size-fits-all pattern.

## Practical Design Guidance

- Typical first bottlenecks are primary database, cache miss storms, and synchronous downstream dependencies.
- Discuss mitigations with measurable impact such as cache hit targets or async offloading.
- End with next-scaling steps if demand grows beyond current architecture assumptions.

A strong answer should include both happy path and failure path. Always describe what happens when dependencies are slow, unavailable, or return partial success. Mention observability signals you would watch such as latency percentiles, error rate, queue depth, retry rate, and saturation.

## Common Pitfalls

- Adopting complexity before there is a measurable need.
- Ignoring ownership boundaries and turning architecture into organizational friction.
- Forgetting migration and rollout safety when introducing new patterns.
- Treating infrastructure patterns as business logic containers.

## Real-World Tradeoffs

No architecture pattern is universally best. Mature teams optimize for current constraints and keep an explicit path to evolve later. It is better to start with a simple solution that can be safely extended than to start with a heavyweight solution that slows product iteration.

> ANALOGY: A chain is limited by its weakest link; optimize the tightest constraint first.
> IMPORTANT: Never present architecture as perfect; always discuss limitations and evolution path.
> INTERVIEW TIP: Conclude with main bottleneck, mitigation, and what changes at 10x traffic.

## Interview Structure

In interviews, present this topic using a short structure:
1) Problem statement and context.
2) Recommended baseline approach.
3) Alternative approach and why not chosen here.
4) Failure modes and mitigations.
5) Scale triggers that would change your design.

This makes your explanation concise, senior, and easy for interviewers to evaluate.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'trade-offs-and-bottlenecks-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'trade-offs-and-bottlenecks-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'trade-offs-and-bottlenecks-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'trade-offs-and-bottlenecks-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'trade-offs-and-bottlenecks-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'trade-offs-and-bottlenecks-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  },
  {
    id: 'common-mistakes',
    title: 'Common Mistakes',
    interviewTip: 'Communication and structure often matter more than adding extra technologies.',
    readContent: `# Common Mistakes That Fail Candidates

This chapter topic is a practical architecture concept that appears frequently in real systems and in interviews. The key to mastering it is understanding not only the definition, but also when to use it, when not to use it, and what operational consequences come with the choice.

## Core Concept

- The most frequent failures come from process gaps: no requirement clarification, no estimation, weak narration.
- Over-engineering and under-engineering both signal weak scale judgment.
- Naming technologies without understanding internals is quickly exposed in deep dive.

## Why It Matters

At small scale, many architectural decisions look equivalent. At medium and large scale, these choices shape deployment speed, team autonomy, fault isolation, and operational burden. Interviewers usually test whether you can map design choices to requirements instead of copying a one-size-fits-all pattern.

## Practical Design Guidance

- Ignoring failure scenarios and recovery makes architecture appear non-production ready.
- Poor time allocation can block high-level design or tradeoff discussion entirely.
- Strong candidates show structured thinking, transparent assumptions, and concise communication.

A strong answer should include both happy path and failure path. Always describe what happens when dependencies are slow, unavailable, or return partial success. Mention observability signals you would watch such as latency percentiles, error rate, queue depth, retry rate, and saturation.

## Common Pitfalls

- Adopting complexity before there is a measurable need.
- Ignoring ownership boundaries and turning architecture into organizational friction.
- Forgetting migration and rollout safety when introducing new patterns.
- Treating infrastructure patterns as business logic containers.

## Real-World Tradeoffs

No architecture pattern is universally best. Mature teams optimize for current constraints and keep an explicit path to evolve later. It is better to start with a simple solution that can be safely extended than to start with a heavyweight solution that slows product iteration.

> ANALOGY: A clear route with a modest car beats a race car driver with no map.
> IMPORTANT: Communication is a core evaluation axis; silent design loses signal even if technically sound.
> INTERVIEW TIP: Use a consistent interview cadence: clarify, estimate, design, deep dive, tradeoffs.

## Interview Structure

In interviews, present this topic using a short structure:
1) Problem statement and context.
2) Recommended baseline approach.
3) Alternative approach and why not chosen here.
4) Failure modes and mitigations.
5) Scale triggers that would change your design.

This makes your explanation concise, senior, and easy for interviewers to evaluate.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.

In a real production environment, this decision should always be validated with metrics, failure drills, and staged rollouts. A design that looks elegant on a whiteboard can still fail under uneven traffic patterns, bad client behavior, or dependency outages. That is why senior engineers pair architecture with operational guardrails: clear SLOs, dashboards, alerts, runbooks, and rollback plans. When you explain this in interviews, you show that your design is not only theoretically correct, but also maintainable by real teams.
`,
    quizQuestions: [
      {
        id: 'common-mistakes-q1',
        question: 'Most important first step in design interviews:',
        options: ['Pick database vendor', 'Clarify requirements and scope', 'Draw all services immediately', 'Start coding'],
        correctIndex: 1,
        explanation: 'Requirement clarity prevents designing the wrong system.',
      },
      {
        id: 'common-mistakes-q2',
        question: 'Back-of-envelope math is used to:',
        options: ['Show exact precision', 'Determine order-of-magnitude architecture needs', 'Avoid assumptions', 'Replace design'],
        correctIndex: 1,
        explanation: 'Sizing decisions depend on rough throughput and storage estimates.',
      },
      {
        id: 'common-mistakes-q3',
        question: 'A high-level diagram should:',
        options: ['Contain every edge case', 'Show clear data flow and major components', 'Avoid narration', 'Skip storage'],
        correctIndex: 1,
        explanation: 'Interviewers evaluate clarity and flow correctness.',
      },
      {
        id: 'common-mistakes-q4',
        question: 'Deep dive phase tests:',
        options: ['Only memorization', 'Whether you understand internals of your choices', 'Your typing speed', 'Frontend design only'],
        correctIndex: 1,
        explanation: 'Deep dive validates practical understanding.',
      },
      {
        id: 'common-mistakes-q5',
        question: 'Best way to discuss architecture choices:',
        options: ['Claim one perfect answer', 'Present tradeoffs and rationale by requirements', 'Avoid alternatives', 'Ignore bottlenecks'],
        correctIndex: 1,
        explanation: 'Tradeoff framing demonstrates engineering judgment.',
      },
      {
        id: 'common-mistakes-q6',
        question: 'A common failure pattern is:',
        options: ['Asking focused questions', 'Designing silently without communication', 'Stating assumptions', 'Addressing failure modes'],
        correctIndex: 1,
        explanation: 'Clear communication is critical to interview success.',
      }
    ],
  }
];
