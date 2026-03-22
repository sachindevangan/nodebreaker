import type { LucideIcon } from 'lucide-react';
import { Database, GitBranch, Globe, Layers, Server, Zap } from 'lucide-react';
import type { ComponentIconName } from '@/constants/components';

const iconMap: Record<ComponentIconName, LucideIcon> = {
  GitBranch,
  Server,
  Database,
  Zap,
  Layers,
  Globe,
};

export function getNodeIcon(name: ComponentIconName): LucideIcon {
  return iconMap[name];
}
