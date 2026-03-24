export interface ChallengeRequirement {
  id: string;
  description: string;
  check:
    | { type: 'min_throughput'; value: number }
    | { type: 'max_latency'; value: number }
    | { type: 'max_drop_rate'; value: number }
    | { type: 'survive_chaos'; chaosType: string; targetType: string }
    | { type: 'has_component'; componentType: string; minCount?: number }
    | { type: 'has_redundancy'; componentType: string }
    | { type: 'max_utilization'; value: number }
    | { type: 'min_cache_hit_ratio'; value: number }
    | { type: 'no_single_point_of_failure' }
    | { type: 'max_component_count'; value: number };
  weight: number;
  hint: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedMinutes: number;
  icon: string;
  color: string;
  category: string;
  briefing: string;
  constraints: string[];
  requirements: ChallengeRequirement[];
  totalPoints: number;
  passingScore: number;
  starThresholds: {
    one: number;
    two: number;
    three: number;
  };
  hints: string[];
  interviewContext: string;
}

export const CHALLENGES: readonly Challenge[] = [
  {
    id: 'traffic-surge',
    title: 'The Traffic Surge',
    description: 'Scale a startup system from 100 req/s to 5,000 req/s.',
    difficulty: 'easy',
    estimatedMinutes: 8,
    icon: 'TrendingUp',
    color: '#22c55e',
    category: 'Scaling',
    briefing:
      "Your startup's landing page just got featured on Hacker News. Traffic has spiked from 100 req/s to 5,000 req/s. Your single server is melting. Design a system that survives the traffic spike without dropping requests.",
    constraints: ['Maximum 6 components', 'Budget: keep it minimal'],
    requirements: [
      {
        id: 'ts-lb',
        description: 'Include a Load Balancer',
        check: { type: 'has_component', componentType: 'loadBalancer' },
        weight: 10,
        hint: 'You need something to distribute traffic across servers',
      },
      {
        id: 'ts-service-red',
        description: 'Use at least 2 Service instances',
        check: { type: 'has_component', componentType: 'service', minCount: 2 },
        weight: 15,
        hint: "One server isn't enough. Add redundancy.",
      },
      {
        id: 'ts-throughput',
        description: 'System handles 5,000 req/s',
        check: { type: 'min_throughput', value: 5000 },
        weight: 20,
        hint: 'Your total system throughput must handle 5k req/s',
      },
      {
        id: 'ts-drop',
        description: 'Drop rate stays below 5%',
        check: { type: 'max_drop_rate', value: 0.05 },
        weight: 15,
        hint: 'Less than 5% of requests should be dropped',
      },
      {
        id: 'ts-lat',
        description: 'Average latency stays under 200ms',
        check: { type: 'max_latency', value: 200 },
        weight: 10,
        hint: 'Average response time should be under 200ms',
      },
    ],
    totalPoints: 70,
    passingScore: 40,
    starThresholds: { one: 40, two: 55, three: 65 },
    hints: [
      'Start with a Load Balancer',
      'Add multiple service instances behind it',
      'Make sure services connect to storage',
    ],
    interviewContext: 'This tests horizontal scaling - the most fundamental scaling pattern.',
  },
  {
    id: 'unbreakable-system',
    title: 'The Unbreakable System',
    description: 'Build a hospital-grade architecture with no SPOF.',
    difficulty: 'medium',
    estimatedMinutes: 10,
    icon: 'ShieldCheck',
    color: '#f59e0b',
    category: 'Reliability',
    briefing:
      "You're building infrastructure for a hospital records system. Downtime means doctors can't access patient data. Design a system with NO single points of failure that survives any single component crash.",
    constraints: ['Must survive any single node crash', 'Maximum 10 components'],
    requirements: [
      {
        id: 'ub-spof',
        description: 'No single point of failure in critical path',
        check: { type: 'no_single_point_of_failure' },
        weight: 25,
        hint: 'Every critical component needs a backup',
      },
      {
        id: 'ub-svc-red',
        description: 'Service layer has redundancy',
        check: { type: 'has_redundancy', componentType: 'service' },
        weight: 15,
        hint: 'Multiple service instances behind a load balancer',
      },
      {
        id: 'ub-db-red',
        description: 'Database layer has redundancy',
        check: { type: 'has_redundancy', componentType: 'database' },
        weight: 15,
        hint: 'Add a read replica or second database',
      },
      {
        id: 'ub-chaos-service',
        description: 'Survive service crash chaos',
        check: { type: 'survive_chaos', chaosType: 'node_crash', targetType: 'service' },
        weight: 20,
        hint: 'Crash one service - does the system keep running?',
      },
      {
        id: 'ub-chaos-db',
        description: 'Survive database crash chaos',
        check: { type: 'survive_chaos', chaosType: 'node_crash', targetType: 'database' },
        weight: 15,
        hint: 'Crash the primary DB - is there a fallback?',
      },
      {
        id: 'ub-drop',
        description: 'Drop rate below 1% during failures',
        check: { type: 'max_drop_rate', value: 0.01 },
        weight: 10,
        hint: 'Less than 1% drop rate even during failures',
      },
    ],
    totalPoints: 100,
    passingScore: 60,
    starThresholds: { one: 60, two: 80, three: 95 },
    hints: [
      'Redundancy means having 2+ of every critical component',
      'Load balancers route around failed servers automatically',
      'Database replication means a copy can take over',
    ],
    interviewContext:
      'Reliability and fault tolerance - critical for any system handling important data.',
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Bring search latency from 500ms to under 50ms.',
    difficulty: 'medium',
    estimatedMinutes: 9,
    icon: 'Zap',
    color: '#0ea5e9',
    category: 'Performance',
    briefing:
      "Your e-commerce search API is too slow. Users are leaving because results take 500ms. Your database has 10 million products. Design a system where search results return in under 50ms for 90% of queries.",
    constraints: ['Maximum 8 components', 'Database throughput capped at 2000 req/s'],
    requirements: [
      {
        id: 'sd-cache',
        description: 'Include a cache layer',
        check: { type: 'has_component', componentType: 'cache' },
        weight: 20,
        hint: 'Cache frequently searched queries in Redis',
      },
      {
        id: 'sd-search',
        description: 'Use a dedicated search component',
        check: { type: 'has_component', componentType: 'search' },
        weight: 15,
        hint: 'Consider a dedicated search engine like Elasticsearch',
      },
      {
        id: 'sd-lat',
        description: 'Average latency below 50ms',
        check: { type: 'max_latency', value: 50 },
        weight: 25,
        hint: 'Cache and search engine must serve most requests',
      },
      {
        id: 'sd-util',
        description: 'No component exceeds 70% utilization',
        check: { type: 'max_utilization', value: 0.7 },
        weight: 15,
        hint: 'No component should be over 70% utilized',
      },
      {
        id: 'sd-throughput',
        description: 'Handle 10k req/s throughput',
        check: { type: 'min_throughput', value: 10000 },
        weight: 15,
        hint: 'System should handle 10k search queries per second',
      },
      {
        id: 'sd-drop',
        description: 'Drop rate below 1%',
        check: { type: 'max_drop_rate', value: 0.01 },
        weight: 10,
        hint: 'Virtually no requests should be dropped',
      },
    ],
    totalPoints: 100,
    passingScore: 60,
    starThresholds: { one: 60, two: 80, three: 95 },
    hints: [],
    interviewContext:
      'Performance optimization - knowing when to cache, when to use specialized databases.',
  },
  {
    id: 'async-pipeline',
    title: 'The Async Pipeline',
    description: 'Design low-latency uploads with async image processing.',
    difficulty: 'medium',
    estimatedMinutes: 10,
    icon: 'Workflow',
    color: '#8b5cf6',
    category: 'Architecture',
    briefing:
      "You're building an image processing service. Users upload images that need resizing, watermarking, and thumbnail generation. Each image takes 3-5 seconds to process. Handle 1000 uploads per second without making users wait.",
    constraints: [
      'Users must get response in under 100ms',
      'Processing can happen in background',
      'Maximum 10 components',
    ],
    requirements: [
      {
        id: 'ap-queue',
        description: 'Use a queue for async jobs',
        check: { type: 'has_component', componentType: 'queue' },
        weight: 20,
        hint: "Users shouldn't wait for processing - queue the work",
      },
      {
        id: 'ap-worker',
        description: 'Use worker nodes',
        check: { type: 'has_component', componentType: 'worker' },
        weight: 15,
        hint: 'Workers pull from the queue and process async',
      },
      {
        id: 'ap-blob',
        description: 'Store files in blob storage',
        check: { type: 'has_component', componentType: 'blobStorage' },
        weight: 15,
        hint: 'Store processed images in blob/object storage',
      },
      {
        id: 'ap-lat',
        description: 'Latency under 100ms',
        check: { type: 'max_latency', value: 100 },
        weight: 20,
        hint: 'API response must be fast - just acknowledge receipt',
      },
      {
        id: 'ap-throughput',
        description: 'Handle 1,000 uploads per second',
        check: { type: 'min_throughput', value: 1000 },
        weight: 15,
        hint: 'Handle 1000 uploads per second at the API level',
      },
      {
        id: 'ap-lb',
        description: 'Use load balancer for ingress',
        check: { type: 'has_component', componentType: 'loadBalancer' },
        weight: 5,
        hint: 'Distribute upload traffic',
      },
      {
        id: 'ap-drop',
        description: 'Drop rate below 2%',
        check: { type: 'max_drop_rate', value: 0.02 },
        weight: 10,
        hint: "Don't lose uploaded images",
      },
    ],
    totalPoints: 100,
    passingScore: 60,
    starThresholds: { one: 60, two: 80, three: 95 },
    hints: [],
    interviewContext:
      'Async processing with queues - essential pattern for heavy computation workloads.',
  },
  {
    id: 'ten-million-users',
    title: '10 Million Users',
    description: 'Design a social feed backend for extreme read-heavy traffic.',
    difficulty: 'hard',
    estimatedMinutes: 12,
    icon: 'Users',
    color: '#f97316',
    category: 'Full Design',
    briefing:
      'Design the backend for a social media feed. 10 million daily active users. Each user sees a personalized feed of posts from people they follow. Handle 50k read requests/sec and 5k write requests/sec. Feed generation must be fast.',
    constraints: ['Maximum 15 components', 'Read:Write ratio is 10:1'],
    requirements: [
      { id: 'tm-cdn', description: 'Include CDN', check: { type: 'has_component', componentType: 'cdn' }, weight: 10, hint: 'Serve static assets from CDN' },
      { id: 'tm-lb', description: 'Include Load Balancer', check: { type: 'has_component', componentType: 'loadBalancer' }, weight: 10, hint: 'Distribute traffic at ingress' },
      { id: 'tm-gw', description: 'Include API Gateway', check: { type: 'has_component', componentType: 'apiGateway' }, weight: 10, hint: 'API Gateway for routing and rate limiting' },
      { id: 'tm-cache', description: 'Cache feeds', check: { type: 'has_component', componentType: 'cache' }, weight: 15, hint: 'Cache user feeds in Redis' },
      { id: 'tm-db', description: 'Include persistent database', check: { type: 'has_component', componentType: 'database' }, weight: 10, hint: 'Persist posts and feed metadata' },
      { id: 'tm-queue', description: 'Use queue for feed fan-out', check: { type: 'has_component', componentType: 'queue' }, weight: 10, hint: 'Fan-out new posts to follower feeds async' },
      { id: 'tm-worker', description: 'Use workers for async jobs', check: { type: 'has_component', componentType: 'worker' }, weight: 10, hint: 'Workers process feed updates from queue' },
      { id: 'tm-throughput', description: 'Handle 50k req/s', check: { type: 'min_throughput', value: 50000 }, weight: 10, hint: 'Increase parallel compute and cache hit rate' },
      { id: 'tm-lat', description: 'Latency under 100ms', check: { type: 'max_latency', value: 100 }, weight: 10, hint: 'Keep the read path short and cached' },
      { id: 'tm-drop', description: 'Drop rate below 1%', check: { type: 'max_drop_rate', value: 0.01 }, weight: 5, hint: 'Improve bottlenecks and queue buffering' },
    ],
    totalPoints: 100,
    passingScore: 65,
    starThresholds: { one: 65, two: 80, three: 95 },
    hints: [],
    interviewContext:
      'Classic fan-out-on-write vs fan-out-on-read tradeoff discussion in interviews.',
  },
  {
    id: 'chaos-survivor',
    title: 'Chaos Survivor',
    description: 'Build a payment architecture that survives stacked failures.',
    difficulty: 'expert',
    estimatedMinutes: 14,
    icon: 'ShieldAlert',
    color: '#ef4444',
    category: 'Resilience',
    briefing:
      'Design a payment processing system. It must handle 5000 transactions/sec and survive: a database crash, a service crash, a latency spike, AND a network partition - all at once. Zero data loss. Maximum 1% drop rate under chaos.',
    constraints: ['Must pass ALL chaos scenarios simultaneously', 'Maximum 12 components', 'Zero data loss'],
    requirements: [
      { id: 'cs-lb', description: 'Include Load Balancer', check: { type: 'has_component', componentType: 'loadBalancer' }, weight: 5, hint: 'Use a resilient ingress point' },
      { id: 'cs-svc-red', description: 'Service redundancy', check: { type: 'has_redundancy', componentType: 'service' }, weight: 10, hint: 'Use at least two service instances' },
      { id: 'cs-db-red', description: 'Database redundancy', check: { type: 'has_redundancy', componentType: 'database' }, weight: 10, hint: 'Use a backup or replica database path' },
      { id: 'cs-queue', description: 'Use queue for durability', check: { type: 'has_component', componentType: 'queue' }, weight: 10, hint: 'Queue ensures no transaction is lost' },
      { id: 'cs-cache', description: 'Use cache for read resilience', check: { type: 'has_component', componentType: 'cache' }, weight: 5, hint: 'Cache keeps reads responsive under failures' },
      { id: 'cs-chaos-svc', description: 'Survive service crash', check: { type: 'survive_chaos', chaosType: 'node_crash', targetType: 'service' }, weight: 15, hint: 'Make sure traffic reroutes to healthy services' },
      { id: 'cs-chaos-db', description: 'Survive database crash', check: { type: 'survive_chaos', chaosType: 'node_crash', targetType: 'database' }, weight: 15, hint: 'Protect writes with redundancy and queueing' },
      { id: 'cs-chaos-lat', description: 'Survive latency spike on service', check: { type: 'survive_chaos', chaosType: 'latency_spike', targetType: 'service' }, weight: 10, hint: 'Redundant services help absorb latency shocks' },
      { id: 'cs-drop', description: 'Drop rate below 1%', check: { type: 'max_drop_rate', value: 0.01 }, weight: 10, hint: 'Reduce overload under failure conditions' },
      { id: 'cs-throughput', description: 'Maintain 5k req/s', check: { type: 'min_throughput', value: 5000 }, weight: 10, hint: 'Scale compute and avoid downstream bottlenecks' },
    ],
    totalPoints: 100,
    passingScore: 70,
    starThresholds: { one: 70, two: 85, three: 95 },
    hints: [],
    interviewContext:
      'Resilience engineering - proving your design still works while multiple dependencies fail.',
  },
] as const;

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((challenge) => challenge.id === id);
}
