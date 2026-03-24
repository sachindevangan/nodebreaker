import type { NodeBreakerNodeType } from '@/types';

export type CostTier = 'small' | 'medium' | 'large';

export interface ComponentCost {
  type: NodeBreakerNodeType;
  baseMonthlyCost: number;
  costPerInstance: number;
  costDescription: string;
  awsService: string;
  pricingModel: string;
  tiers: {
    small: { cost: number; description: string };
    medium: { cost: number; description: string };
    large: { cost: number; description: string };
  };
}

const c = (
  type: NodeBreakerNodeType,
  awsService: string,
  pricingModel: string,
  costDescription: string,
  small: number,
  medium: number,
  large: number,
  baseMonthlyCost = medium,
  costPerInstance = medium
): ComponentCost => ({
  type,
  awsService,
  pricingModel,
  costDescription,
  baseMonthlyCost,
  costPerInstance,
  tiers: {
    small: { cost: small, description: 'Startup footprint' },
    medium: { cost: medium, description: 'Growing team footprint' },
    large: { cost: large, description: 'Enterprise footprint' },
  },
});

export const COMPONENT_COST_ESTIMATES: Record<NodeBreakerNodeType, ComponentCost> = {
  loadBalancer: c('loadBalancer', 'AWS Application Load Balancer', 'per hour + LCU', 'ALB base + usage', 25, 50, 200, 25, 50),
  service: c('service', 'AWS EC2 / ECS Fargate', 'per hour', 'Compute instances', 15, 30, 120, 30, 30),
  database: c('database', 'AWS RDS PostgreSQL', 'per hour + storage', 'Managed database', 25, 100, 500, 50, 100),
  cache: c('cache', 'AWS ElastiCache Redis', 'per hour', 'In-memory cache nodes', 15, 50, 200, 25, 50),
  queue: c('queue', 'AWS SQS', 'per request', 'Queue requests + polling', 5, 25, 100, 5, 25),
  cdn: c('cdn', 'AWS CloudFront', 'per GB + requests', 'Edge delivery transfer', 10, 50, 500, 10, 50),
  dns: c('dns', 'AWS Route 53', 'per hosted zone', 'Hosted zone + queries', 1, 2, 10, 0.5, 2),
  apiGateway: c('apiGateway', 'AWS API Gateway', 'per million requests', 'API request volume', 15, 50, 200, 15, 50),
  kafka: c('kafka', 'AWS MSK', 'per broker hour', 'Managed Kafka cluster', 150, 400, 1500, 150, 400),
  lambda: c('lambda', 'AWS Lambda', 'per invocation + GB-s', 'Serverless invocations', 5, 20, 100, 5, 20),
  worker: c('worker', 'AWS EC2 / ECS', 'per hour', 'Background workers', 15, 30, 120, 30, 30),
  blobStorage: c('blobStorage', 'AWS S3', 'per GB-month + requests', 'Object storage', 3, 25, 200, 3, 25),
  dataWarehouse: c('dataWarehouse', 'AWS Redshift', 'per node hour', 'Analytical warehouse', 250, 1000, 5000, 250, 1000),
  search: c('search', 'AWS OpenSearch', 'per node hour', 'Search cluster', 100, 300, 1000, 100, 300),
  authService: c('authService', 'AWS Cognito', 'MAU based', 'Authentication flows', 0, 20, 50, 0, 20),
  rateLimiter: c('rateLimiter', 'AWS WAF / API Gateway', 'per request', 'Rate limiting rules', 0, 10, 50, 0, 10),
  firewall: c('firewall', 'AWS WAF', 'per ACL + rule + request', 'Firewall filtering', 20, 60, 200, 20, 60),
  logger: c('logger', 'AWS CloudWatch Logs', 'ingestion + retention', 'Centralized logs', 10, 30, 120, 10, 30),
  healthCheck: c('healthCheck', 'Route 53 Health Checks', 'per check', 'Endpoint health probing', 1, 5, 20, 1, 5),
  metricsCollector: c('metricsCollector', 'CloudWatch Metrics', 'per metric', 'Metrics ingestion', 10, 30, 120, 10, 30),
  waf: c('waf', 'AWS WAF', 'per ACL + request', 'Web ACL and filtering', 20, 60, 200, 20, 60),
  ingress: c('ingress', 'AWS ALB + Ingress Controller', 'per hour', 'K8s ingress control', 20, 60, 220, 20, 60),
  reverseProxy: c('reverseProxy', 'EC2 Nginx', 'per hour', 'Reverse proxy compute', 10, 25, 100, 10, 25),
  edgeRouter: c('edgeRouter', 'AWS Global Accelerator', 'per endpoint hour', 'Global edge routing', 30, 120, 500, 30, 120),
  loadBalancerL4: c('loadBalancerL4', 'AWS Network Load Balancer', 'per hour + LCU', 'L4 traffic balancing', 25, 70, 260, 25, 70),
  loadBalancerL7: c('loadBalancerL7', 'AWS Application Load Balancer', 'per hour + LCU', 'L7 traffic balancing', 25, 70, 260, 25, 70),
  container: c('container', 'AWS ECS/EKS Nodes', 'per hour', 'Container hosts', 20, 60, 200, 20, 60),
  cronJob: c('cronJob', 'AWS EventBridge + Lambda', 'per trigger + compute', 'Scheduled jobs', 1, 10, 40, 1, 10),
  objectStore: c('objectStore', 'AWS S3', 'per GB-month', 'Durable object storage', 3, 25, 200, 3, 25),
  eventBus: c('eventBus', 'AWS EventBridge', 'per event', 'Event routing', 5, 30, 150, 5, 30),
  pubSub: c('pubSub', 'AWS SNS', 'per publish + delivery', 'Publish-subscribe messaging', 5, 25, 100, 5, 25),
};

