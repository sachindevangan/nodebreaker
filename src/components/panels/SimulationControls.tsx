import { Pause, Play, Square } from 'lucide-react';
import { useSimStore } from '@/store/useSimStore';

export function SimulationControls() {
  const simulationSessionActive = useSimStore((s) => s.simulationSessionActive);
  const isPlaying = useSimStore((s) => s.isPlaying);
  const speed = useSimStore((s) => s.speed);
  const speedOptions = useSimStore((s) => s.speedOptions);
  const trafficVolume = useSimStore((s) => s.trafficVolume);
  const tickCount = useSimStore((s) => s.tickCount);
  const togglePlayPause = useSimStore((s) => s.togglePlayPause);
  const resetSimulation = useSimStore((s) => s.resetSimulation);
  const setSpeed = useSimStore((s) => s.setSpeed);
  const setTrafficVolume = useSimStore((s) => s.setTrafficVolume);

  if (!simulationSessionActive) return null;

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex justify-center px-3 pt-2">
      <div
        className="pointer-events-auto flex w-full max-w-6xl flex-wrap items-center gap-3 rounded-lg border border-zinc-700/80 bg-gray-900/90 px-3 py-2 shadow-xl backdrop-blur-md"
        role="toolbar"
        aria-label="Simulation controls"
      >
        <button
          type="button"
          onClick={() => togglePlayPause()}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors ${
            isPlaying
              ? 'border-emerald-600/50 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-950/70'
              : 'border-zinc-600 bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
          }`}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-pressed={isPlaying}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" strokeWidth={2} />
          ) : (
            <Play className="h-4 w-4 translate-x-0.5" strokeWidth={2} />
          )}
        </button>

        <button
          type="button"
          onClick={() => resetSimulation()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/80 text-zinc-300 transition-colors hover:bg-zinc-800"
          title="Reset simulation"
        >
          <Square className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        <div className="flex items-center gap-1 border-l border-zinc-700/80 pl-3">
          <span className="sr-only">Simulation speed</span>
          {speedOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`rounded-md px-2 py-1 text-xs font-semibold tabular-nums transition-colors ${
                speed === s
                  ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="flex min-w-[180px] max-w-xs flex-1 flex-col gap-1 border-l border-zinc-700/80 pl-3">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="nb-traffic" className="text-[11px] font-medium text-zinc-400">
              Traffic
            </label>
            <span className="font-mono text-[11px] tabular-nums text-zinc-300">
              {trafficVolume} / tick
            </span>
          </div>
          <input
            id="nb-traffic"
            type="range"
            min={10}
            max={2000}
            step={10}
            value={trafficVolume}
            onChange={(e) => setTrafficVolume(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-cyan-400 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
            aria-valuemin={10}
            aria-valuemax={2000}
            aria-valuenow={trafficVolume}
          />
        </div>

        <div className="ml-auto border-l border-zinc-700/80 pl-3 font-mono text-[11px] tabular-nums text-zinc-400">
          Tick: {tickCount.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
