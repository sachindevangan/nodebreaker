import { useEffect, useRef } from 'react';
import { useSimStore } from '@/store/useSimStore';

const BASE_INTERVAL_MS = 100;

/**
 * Drives the simulation interval; reads the live graph from the flow store inside each tick.
 */
export function useSimulation(): void {
  const isRunning = useSimStore((s) => s.isRunning);
  const speed = useSimStore((s) => s.speed);
  const tick = useSimStore((s) => s.tick);
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const ms = Math.max(16, BASE_INTERVAL_MS / speed);
    const id = window.setInterval(() => {
      tickRef.current();
    }, ms);
    return () => window.clearInterval(id);
  }, [isRunning, speed]);
}
