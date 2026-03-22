/**
 * Calculation utilities.
 */

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  if (full.length !== 6) return `rgba(148, 163, 184, ${alpha})`;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatThroughput(reqPerSec: number): string {
  if (reqPerSec >= 1_000_000) return `${(reqPerSec / 1_000_000).toFixed(1)}M req/s`;
  if (reqPerSec >= 1000) return `${Math.round(reqPerSec / 1000)}k req/s`;
  return `${reqPerSec} req/s`;
}

export function formatLatencyMs(ms: number): string {
  return `${ms}ms`;
}
