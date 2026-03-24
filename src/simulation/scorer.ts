import type { FlowEdge, FlowNode } from '@/types';
import type { NodeMetrics } from './models';

type CategoryScore = { score: number; grade: string; feedback: string };

export interface ArchitectureScore {
  overall: string;
  overallScore: number;
  categories: {
    reliability: CategoryScore;
    performance: CategoryScore;
    scalability: CategoryScore;
    costEfficiency: CategoryScore;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

function gradeFor(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 40) return 'D';
  return 'F';
}

function categoryFeedback(score: number, name: string): string {
  if (score >= 20) return `${name} is strong and interview-ready.`;
  if (score >= 14) return `${name} is decent but has notable gaps.`;
  return `${name} needs major improvements.`;
}

function count(nodes: FlowNode[], type: FlowNode['type']): number {
  return nodes.filter((n) => n.type === type).length;
}

function hasEdge(edges: FlowEdge[], source: string, target: string): boolean {
  return edges.some((e) => e.source === source && e.target === target);
}

export function scoreArchitecture(
  nodes: FlowNode[],
  edges: FlowEdge[],
  nodeMetrics?: Map<string, NodeMetrics>
): ArchitectureScore {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  const lbCount = count(nodes, 'loadBalancer') + count(nodes, 'loadBalancerL4') + count(nodes, 'loadBalancerL7');
  const serviceCount = count(nodes, 'service');
  const dbCount = count(nodes, 'database');
  const queueCount = count(nodes, 'queue') + count(nodes, 'kafka') + count(nodes, 'eventBus') + count(nodes, 'pubSub');
  const cacheCount = count(nodes, 'cache');
  const cdnCount = count(nodes, 'cdn');
  const hcCount = count(nodes, 'healthCheck');
  const rlCount = count(nodes, 'rateLimiter');
  const searchCount = count(nodes, 'search');

  const utilizationValues = nodeMetrics ? [...nodeMetrics.values()].map((m) => m.utilization) : [];
  const hasMetrics = utilizationValues.length > 0;
  const maxUtilization = hasMetrics ? Math.max(...utilizationValues) : 0;
  const minUtilization = hasMetrics ? Math.min(...utilizationValues) : 0;

  let reliability = 0;
  if (lbCount > 0) reliability += 5;
  if (serviceCount >= 2) reliability += 5;
  if (hcCount > 0) reliability += 3;
  if (dbCount >= 2) reliability += 5;
  if (rlCount > 0) reliability += 3;
  if (queueCount > 0) reliability += 4;

  let performance = 0;
  if (cacheCount > 0) performance += 5;
  if (cdnCount > 0) performance += 5;
  if (cacheCount > 0 && dbCount > 0) {
    const cacheIds = nodes.filter((n) => n.type === 'cache').map((n) => n.id);
    const dbIds = nodes.filter((n) => n.type === 'database').map((n) => n.id);
    const serviceIds = nodes.filter((n) => n.type === 'service').map((n) => n.id);
    if (serviceIds.some((s) => cacheIds.some((c) => hasEdge(edges, s, c)) && dbIds.some((d) => hasEdge(edges, s, d)))) {
      performance += 3;
    }
  }
  const avgPathLatency =
    nodes.length > 0 ? nodes.reduce((sum, n) => sum + Number(n.data.latency || 0), 0) / Math.max(1, nodes.length) : 0;
  if (avgPathLatency < 100) performance += 5;
  if (hasMetrics ? maxUtilization < 0.8 : true) performance += 4;
  if (searchCount > 0) performance += 3;

  let scalability = 0;
  if (serviceCount >= 2) scalability += 5;
  if (lbCount > 0) scalability += 3;
  const clientToDbDirect = nodes
    .filter((n) => n.type !== 'database')
    .some((src) =>
      nodes.filter((d) => d.type === 'database').some((db) => hasEdge(edges, src.id, db.id) && src.type === 'dns')
    );
  if (!clientToDbDirect) scalability += 5;
  if (queueCount > 0) scalability += 4;
  if (dbCount >= 2) scalability += 4;
  if (cdnCount > 0) scalability += 4;

  let costEfficiency = 0;
  if (hasMetrics ? minUtilization >= 0.05 : true) costEfficiency += 5;
  if (nodes.length <= 12) costEfficiency += 5;
  if (cacheCount > 0) costEfficiency += 5;
  if (queueCount > 0) costEfficiency += 5;
  if (nodes.length <= 6 ? lbCount <= 1 : true) costEfficiency += 5;

  const overallScore = reliability + performance + scalability + costEfficiency;
  const overall = gradeFor(overallScore);

  if (cacheCount > 0) strengths.push('Good use of caching to reduce database load.');
  if (lbCount > 0) strengths.push('Load balancing supports traffic distribution and resilience.');
  if (serviceCount >= 2) strengths.push('Service redundancy improves availability.');

  if (dbCount < 2) weaknesses.push('Database is a single point of failure.');
  if (cdnCount === 0) weaknesses.push('No CDN for edge delivery of static assets.');
  if (queueCount === 0) weaknesses.push('No queue layer for async buffering and spike smoothing.');
  if (hasMetrics && maxUtilization >= 0.8) weaknesses.push('Some components are over 80% utilization.');

  if (dbCount < 2) suggestions.push('Add a database replica for read redundancy and failover.');
  if (cdnCount === 0) suggestions.push('Add a CDN for static and cacheable responses.');
  if (rlCount === 0) suggestions.push('Add a rate limiter/circuit-breaker style protection layer.');
  if (queueCount === 0) suggestions.push('Introduce queue + workers for heavy asynchronous processing.');
  if (hasMetrics && maxUtilization >= 0.8) suggestions.push('Scale bottlenecked components horizontally or cache more aggressively.');

  return {
    overall,
    overallScore,
    categories: {
      reliability: { score: reliability * 4, grade: gradeFor(reliability * 4), feedback: categoryFeedback(reliability, 'Reliability') },
      performance: { score: performance * 4, grade: gradeFor(performance * 4), feedback: categoryFeedback(performance, 'Performance') },
      scalability: { score: scalability * 4, grade: gradeFor(scalability * 4), feedback: categoryFeedback(scalability, 'Scalability') },
      costEfficiency: { score: costEfficiency * 4, grade: gradeFor(costEfficiency * 4), feedback: categoryFeedback(costEfficiency, 'Cost efficiency') },
    },
    strengths,
    weaknesses,
    suggestions,
  };
}

