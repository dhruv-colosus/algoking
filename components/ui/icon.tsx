import {
  ArrowRight, ArrowUpRight, Search, Bookmark, Check, Circle, ChevronRight,
  Code2, BookOpen, Route, ChartNoAxesCombined, Settings2, LayoutGrid, Layers,
  Clock3, Play, CircleCheck, ExternalLink, X, ChevronDown, PanelLeft, Bell,
  Flame, HelpCircle, Sparkles, ListChecks, GitBranch, Command, Braces, Target,
  Ellipsis, Shuffle,
} from "lucide-react";
import type { ComponentProps } from "react";

const icons = {
  "arrow-right": ArrowRight, "arrow-up-right": ArrowUpRight, search: Search,
  bookmark: Bookmark, check: Check, circle: Circle, "chevron-right": ChevronRight,
  code: Code2, book: BookOpen, route: Route, chart: ChartNoAxesCombined,
  settings: Settings2, grid: LayoutGrid, layers: Layers, clock: Clock3, play: Play,
  "check-circle": CircleCheck, external: ExternalLink, x: X, "chevron-down": ChevronDown,
  menu: PanelLeft, bell: Bell, flame: Flame, help: HelpCircle, sparkles: Sparkles,
  list: ListChecks, branch: GitBranch, command: Command, braces: Braces, target: Target,
  more: Ellipsis, shuffle: Shuffle,
};

export type IconName = keyof typeof icons;
export function Icon({ name, size = 16, ...props }: ComponentProps<typeof ArrowRight> & { name: IconName }) {
  const Component = icons[name];
  return <Component size={size} strokeWidth={1.65} aria-hidden="true" {...props} />;
}
