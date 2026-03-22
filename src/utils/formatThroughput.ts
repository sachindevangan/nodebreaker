/** Formats an approximate request rate for edge labels (req/s). */
export function formatReqPerSecond(rate: number): string {
  const n = Math.max(0, rate);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M req/s`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k req/s`;
  if (n >= 1) return `${Math.round(n)} req/s`;
  return '<1 req/s';
}
