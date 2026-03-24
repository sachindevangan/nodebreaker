import { createDefaultNodeData } from '@/constants/defaults';
import type { FlowEdge, FlowNode } from '@/types';
import type { NodeBreakerNodeType } from '@/types';

export type TemplateDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface ArchitectureTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: TemplateDifficulty;
  previewHint: string;
  nodeCount: number;
  edgeCount: number;
  build: () => { nodes: FlowNode[]; edges: FlowEdge[] };
}

function node(
  id: string,
  type: NodeBreakerNodeType,
  position: { x: number; y: number },
  label: string,
  throughput: number,
  latency: number,
  capacity: number
): FlowNode {
  return {
    id,
    type,
    position,
    selected: false,
    data: createDefaultNodeData(type, label, {
      throughput,
      latency,
      capacity,
      status: 'healthy',
    }),
  };
}

function edge(source: string, target: string): FlowEdge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    type: 'animated',
  };
}

const urlShortener: ArchitectureTemplate = {
  id: 'url-shortener',
  name: 'URL Shortener',
  description:
    'DNS, CDN, load balancer, API gateway, resolver service, Redis, and PostgreSQL — cache absorbs most reads; DB is the weak link.',
  difficulty: 'Easy',
  previewHint: '7 nodes · 6 links',
  nodeCount: 7,
  edgeCount: 6,
  build: () => {
    const nodes: FlowNode[] = [
      node('t-dns', 'dns', { x: -160, y: 220 }, 'DNS', 100_000, 2, 500_000),
      node('t-cdn', 'cdn', { x: 40, y: 220 }, 'CDN', 500_000, 12, 1_000_000),
      node('t-lb', 'loadBalancer', { x: 220, y: 220 }, 'Load Balancer', 50_000, 5, 80_000),
      node('t-gw', 'apiGateway', { x: 400, y: 220 }, 'API Gateway', 20_000, 10, 100_000),
      node('t-svc', 'service', { x: 580, y: 220 }, 'URL Resolver', 10_000, 20, 25_000),
      node('t-cache', 'cache', { x: 840, y: 120 }, 'Redis', 100_000, 1, 400_000),
      node('t-db', 'database', { x: 840, y: 320 }, 'PostgreSQL', 2_000, 8, 120_000),
    ];
    const edges: FlowEdge[] = [
      edge('t-dns', 't-cdn'),
      edge('t-cdn', 't-lb'),
      edge('t-lb', 't-gw'),
      edge('t-gw', 't-svc'),
      edge('t-svc', 't-cache'),
      edge('t-svc', 't-db'),
    ];
    return { nodes, edges };
  },
};

const chatApp: ArchitectureTemplate = {
  id: 'chat-app',
  name: 'Chat Application',
  description:
    'API and WebSocket paths from an LB, message broker, session cache, and messages database — fan-out and async flow.',
  difficulty: 'Medium',
  previewHint: '7 nodes · 7 links',
  nodeCount: 7,
  edgeCount: 7,
  build: () => {
    const nodes: FlowNode[] = [
      node('c-lb', 'loadBalancer', { x: 40, y: 280 }, 'Load Balancer', 40_000, 4, 100_000),
      node('c-api', 'service', { x: 280, y: 200 }, 'API Service', 15_000, 18, 40_000),
      node('c-q', 'queue', { x: 520, y: 120 }, 'Message Broker', 25_000, 3, 500_000),
      node('c-cache', 'cache', { x: 520, y: 280 }, 'Session Store', 80_000, 1, 300_000),
      node('c-ws', 'service', { x: 280, y: 400 }, 'WebSocket Service', 12_000, 8, 35_000),
      node('c-db', 'database', { x: 520, y: 400 }, 'Messages DB', 4_000, 6, 200_000),
      node('c-cdn', 'cdn', { x: -140, y: 280 }, 'CDN', 400_000, 10, 800_000),
    ];
    const edges: FlowEdge[] = [
      edge('c-cdn', 'c-lb'),
      edge('c-lb', 'c-api'),
      edge('c-lb', 'c-ws'),
      edge('c-api', 'c-q'),
      edge('c-api', 'c-cache'),
      edge('c-ws', 'c-db'),
      edge('c-q', 'c-db'),
    ];
    return { nodes, edges };
  },
};

const ecommerce: ArchitectureTemplate = {
  id: 'ecommerce-checkout',
  name: 'E-Commerce Checkout',
  description:
    'CDN to gateway, payment and inventory services, order queue, and primary database — mixed capacities.',
  difficulty: 'Medium',
  previewHint: '8 nodes · 9 links',
  nodeCount: 8,
  edgeCount: 9,
  build: () => {
    const nodes: FlowNode[] = [
      node('e-cdn', 'cdn', { x: 20, y: 260 }, 'CDN', 600_000, 11, 900_000),
      node('e-lb', 'loadBalancer', { x: 220, y: 260 }, 'Load Balancer', 45_000, 5, 90_000),
      node('e-gw', 'apiGateway', { x: 440, y: 260 }, 'API Gateway', 20_000, 12, 50_000),
      node('e-pay', 'service', { x: 680, y: 140 }, 'Payment', 8_000, 35, 20_000),
      node('e-inv', 'service', { x: 680, y: 260 }, 'Inventory', 12_000, 22, 30_000),
      node('e-db', 'database', { x: 920, y: 260 }, 'Orders DB', 3_500, 10, 150_000),
      node('e-q', 'queue', { x: 680, y: 400 }, 'Order Events', 18_000, 4, 400_000),
      node('e-cache', 'cache', { x: 440, y: 120 }, 'Promo Cache', 90_000, 1, 250_000),
    ];
    const edges: FlowEdge[] = [
      edge('e-cdn', 'e-lb'),
      edge('e-lb', 'e-gw'),
      edge('e-gw', 'e-cache'),
      edge('e-gw', 'e-pay'),
      edge('e-gw', 'e-inv'),
      edge('e-inv', 'e-db'),
      edge('e-pay', 'e-db'),
      edge('e-gw', 'e-q'),
      edge('e-q', 'e-db'),
    ];
    return { nodes, edges };
  },
};

const microBottleneck: ArchitectureTemplate = {
  id: 'micro-bottleneck',
  name: 'Microservices Bottleneck',
  description:
    'Deliberately tiered throughput so Service B and the database become hot spots as soon as you start the sim.',
  difficulty: 'Hard',
  previewHint: '4 nodes · 3 links',
  nodeCount: 4,
  edgeCount: 3,
  build: () => {
    const nodes: FlowNode[] = [
      node('m-lb', 'loadBalancer', { x: 120, y: 260 }, 'Load Balancer', 10_000, 4, 60_000),
      node('m-a', 'service', { x: 380, y: 260 }, 'Service A', 5_000, 15, 25_000),
      node('m-b', 'service', { x: 640, y: 260 }, 'Service B', 500, 40, 8_000),
      node('m-db', 'database', { x: 900, y: 260 }, 'Database', 100, 12, 50_000),
    ];
    const edges: FlowEdge[] = [edge('m-lb', 'm-a'), edge('m-a', 'm-b'), edge('m-b', 'm-db')];
    return { nodes, edges };
  },
};

export const ARCHITECTURE_TEMPLATES: readonly ArchitectureTemplate[] = [
  urlShortener,
  chatApp,
  ecommerce,
  microBottleneck,
] as const;

export function getTemplateById(id: string): ArchitectureTemplate | undefined {
  return ARCHITECTURE_TEMPLATES.find((t) => t.id === id);
}
