import type { Challenge, ChallengeRequirement } from '@/constants/challenges';
import type { ChaosEventType } from '@/simulation/chaos';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useSimStore } from '@/store/useSimStore';
import type { FlowNode } from '@/types';

export interface ChallengeResult {
  challengeId: string;
  totalScore: number;
  maxScore: number;
  stars: number;
  passed: boolean;
  requirementResults: {
    requirementId: string;
    passed: boolean;
    score: number;
    message: string;
  }[];
  suggestions: string[];
}

function countByType(nodes: FlowNode[], type: string): number {
  return nodes.filter((node) => node.type === type).length;
}

function isStaticRequirement(req: ChallengeRequirement): boolean {
  return (
    req.check.type === 'has_component' ||
    req.check.type === 'has_redundancy' ||
    req.check.type === 'no_single_point_of_failure' ||
    req.check.type === 'max_component_count'
  );
}

function calcDropRate(): number {
  const { totalGenerated, totalDropped } = useSimStore.getState().globalMetrics;
  return totalGenerated > 0 ? totalDropped / totalGenerated : 0;
}

function calcThroughputRps(ticks: number, completedDelta: number): number {
  const seconds = ticks * 0.1;
  return seconds > 0 ? completedDelta / seconds : 0;
}

function checkNoSpof(nodes: FlowNode[]): boolean {
  const { edges } = useFlowStore.getState();
  const incomingCount = new Map<string, number>();
  const outgoingCount = new Map<string, number>();
  for (const edge of edges) {
    incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1);
    outgoingCount.set(edge.source, (outgoingCount.get(edge.source) ?? 0) + 1);
  }
  for (const node of nodes) {
    const incoming = incomingCount.get(node.id) ?? 0;
    const outgoing = outgoingCount.get(node.id) ?? 0;
    const sameTypeCount = countByType(nodes, node.type);
    if (incoming > 0 && outgoing > 0 && sameTypeCount < 2) {
      return false;
    }
  }
  return true;
}

function evaluateStaticRequirement(req: ChallengeRequirement, nodes: FlowNode[]): { passed: boolean; message: string } {
  switch (req.check.type) {
    case 'has_component': {
      const count = countByType(nodes, req.check.componentType);
      const needed = req.check.minCount ?? 1;
      const passed = count >= needed;
      return {
        passed,
        message: `${req.check.componentType}: ${count}/${needed} ${passed ? '✓' : '✗'}`,
      };
    }
    case 'has_redundancy': {
      const count = countByType(nodes, req.check.componentType);
      const passed = count >= 2;
      return {
        passed,
        message: `${req.check.componentType} redundancy: ${count} instance(s) ${passed ? '✓' : '✗'}`,
      };
    }
    case 'max_component_count': {
      const count = nodes.length;
      const passed = count <= req.check.value;
      return {
        passed,
        message: `Component count ${count}/${req.check.value} ${passed ? '✓' : '✗'}`,
      };
    }
    case 'no_single_point_of_failure': {
      const passed = checkNoSpof(nodes);
      return {
        passed,
        message: passed ? 'No obvious single point of failure detected ✓' : 'Single point of failure detected ✗',
      };
    }
    default:
      return { passed: true, message: 'Deferred to simulation phase' };
  }
}

export async function evaluateChallenge(challenge: Challenge): Promise<ChallengeResult> {
  const { nodes } = useFlowStore.getState();
  const resultRows: ChallengeResult['requirementResults'] = [];
  const suggestions: string[] = [];

  for (const req of challenge.requirements.filter((requirement) => isStaticRequirement(requirement))) {
    const staticResult = evaluateStaticRequirement(req, nodes);
    if (!staticResult.passed) suggestions.push(req.hint);
    resultRows.push({
      requirementId: req.id,
      passed: staticResult.passed,
      score: staticResult.passed ? req.weight : 0,
      message: staticResult.message,
    });
  }

  const sim = useSimStore.getState();
  if (!sim.simulationSessionActive) sim.startSession();
  if (!useSimStore.getState().simulationSessionActive) {
    return {
      challengeId: challenge.id,
      totalScore: resultRows.reduce((sum, row) => sum + row.score, 0),
      maxScore: challenge.totalPoints,
      stars: 0,
      passed: false,
      requirementResults: [
        ...resultRows,
        { requirementId: 'sim-start', passed: false, score: 0, message: 'Simulation could not start (missing entry node).' },
      ],
      suggestions: [...new Set([...suggestions, 'Ensure your design has an entry node with no incoming connections'])],
    };
  }

  if (useSimStore.getState().isPlaying) useSimStore.getState().togglePlayPause();
  const beforeCompleted = useSimStore.getState().globalMetrics.totalCompleted;
  for (let i = 0; i < 100; i++) {
    useSimStore.getState().tick();
  }
  const afterBase = useSimStore.getState();
  const throughput = calcThroughputRps(100, afterBase.globalMetrics.totalCompleted - beforeCompleted);
  const dropRate = calcDropRate();
  const maxUtil = [...afterBase.nodeMetrics.values()].reduce((max, m) => Math.max(max, m.utilization), 0);
  const avgLatency = afterBase.globalMetrics.avgEndToEndLatency;

  for (const req of challenge.requirements.filter((requirement) => !isStaticRequirement(requirement) && requirement.check.type !== 'survive_chaos')) {
    let passed = false;
    let message = '';
    switch (req.check.type) {
      case 'min_throughput':
        passed = throughput >= req.check.value;
        message = `Throughput ${Math.round(throughput)} req/s (need ${req.check.value}) ${passed ? '✓' : '✗'}`;
        break;
      case 'max_latency':
        passed = avgLatency <= req.check.value;
        message = `Avg latency ${avgLatency.toFixed(1)}ms (max ${req.check.value}) ${passed ? '✓' : '✗'}`;
        break;
      case 'max_drop_rate':
        passed = dropRate <= req.check.value;
        message = `Drop rate ${(dropRate * 100).toFixed(2)}% (max ${(req.check.value * 100).toFixed(2)}%) ${passed ? '✓' : '✗'}`;
        break;
      case 'max_utilization':
        passed = maxUtil <= req.check.value;
        message = `Max utilization ${(maxUtil * 100).toFixed(1)}% (max ${(req.check.value * 100).toFixed(1)}%) ${passed ? '✓' : '✗'}`;
        break;
      case 'min_cache_hit_ratio': {
        const cacheLoad = [...afterBase.nodeMetrics.values()]
          .filter((m) => nodes.find((node) => node.id === m.nodeId)?.type === 'cache')
          .reduce((sum, m) => sum + m.currentLoad, 0);
        const dbLoad = [...afterBase.nodeMetrics.values()]
          .filter((m) => nodes.find((node) => node.id === m.nodeId)?.type === 'database')
          .reduce((sum, m) => sum + m.currentLoad, 0);
        const ratio = cacheLoad + dbLoad > 0 ? cacheLoad / (cacheLoad + dbLoad) : 0;
        passed = ratio >= req.check.value;
        message = `Estimated cache hit ratio ${(ratio * 100).toFixed(1)}% (need ${(req.check.value * 100).toFixed(1)}%) ${passed ? '✓' : '✗'}`;
        break;
      }
      default:
        continue;
    }
    if (!passed) suggestions.push(req.hint);
    resultRows.push({ requirementId: req.id, passed, score: passed ? req.weight : 0, message });
  }

  for (const req of challenge.requirements) {
    if (req.check.type !== 'survive_chaos') continue;
    const chaosCheck = req.check;
    const target = useFlowStore
      .getState()
      .nodes.find((node) => node.type === chaosCheck.targetType);
    if (!target) {
      suggestions.push(req.hint);
      resultRows.push({
        requirementId: req.id,
        passed: false,
        score: 0,
        message: `No ${chaosCheck.targetType} found for chaos test ✗`,
      });
      continue;
    }

    const before = useSimStore.getState().globalMetrics;
    const chaosType = chaosCheck.chaosType as ChaosEventType;
    useChaosStore.getState().injectChaos(chaosType, target.id, { startTick: useSimStore.getState().tickCount });
    for (let i = 0; i < 50; i++) {
      useSimStore.getState().tick();
    }
    const after = useSimStore.getState().globalMetrics;
    const generatedDelta = after.totalGenerated - before.totalGenerated;
    const droppedDelta = after.totalDropped - before.totalDropped;
    const chaosDropRate = generatedDelta > 0 ? droppedDelta / generatedDelta : 0;
    const passed = chaosDropRate < 0.1;
    if (!passed) suggestions.push(req.hint);
    resultRows.push({
      requirementId: req.id,
      passed,
      score: passed ? req.weight : 0,
      message: `${chaosCheck.chaosType} on ${chaosCheck.targetType}: drop ${(chaosDropRate * 100).toFixed(2)}% ${passed ? '✓' : '✗'}`,
    });
    useChaosStore.getState().clearAllChaos();
  }

  useSimStore.getState().stopSession();
  const totalScore = resultRows.reduce((sum, row) => sum + row.score, 0);
  const stars =
    totalScore >= challenge.starThresholds.three
      ? 3
      : totalScore >= challenge.starThresholds.two
        ? 2
        : totalScore >= challenge.starThresholds.one
          ? 1
          : 0;

  return {
    challengeId: challenge.id,
    totalScore,
    maxScore: challenge.totalPoints,
    stars,
    passed: totalScore >= challenge.passingScore,
    requirementResults: resultRows,
    suggestions: [...new Set(suggestions)],
  };
}
