import type { LucideIcon } from 'lucide-react';
import {
  Clock,
  Cpu,
  Flame,
  HardDrive,
  Skull,
  TrendingDown,
  Unplug,
  WifiOff,
} from 'lucide-react';
import type { ChaosPaletteIconName } from '@/constants/chaosEvents';

const MAP: Record<ChaosPaletteIconName, LucideIcon> = {
  Skull,
  Clock,
  TrendingDown,
  WifiOff,
  HardDrive,
  Unplug,
  Flame,
  Cpu,
};

export function getChaosPaletteIcon(name: ChaosPaletteIconName): LucideIcon {
  return MAP[name];
}
