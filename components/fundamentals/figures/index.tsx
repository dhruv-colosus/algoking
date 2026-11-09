import type { ComponentType } from "react";
import type { FigureId } from "@/lib/fundamentals/types";
import { BitExplorer, CacheWalk, LatencyLadder, TextBytes } from "./machine-interactive";
import { FalseSharing, FloatAnatomy, MemoryLayout, SimdLanes } from "./machine-static";
import { PipeBuffer, ProcessTreeKill } from "./os-interactive";
import { ForkExec, PipeVsPty, ProcessAnatomy, VirtualMemory } from "./os-static";
import { BlockedLoop, EventLoop, LittlesLaw, RaceInterleaving } from "./async-interactive";
import { IoModels, ThreadPool } from "./async-static";

export const figures: Record<FigureId, ComponentType> = {
  "bit-explorer": BitExplorer,
  "float-anatomy": FloatAnatomy,
  "text-bytes": TextBytes,
  "memory-layout": MemoryLayout,
  "latency-ladder": LatencyLadder,
  "cache-walk": CacheWalk,
  "false-sharing": FalseSharing,
  "simd-lanes": SimdLanes,
  "process-anatomy": ProcessAnatomy,
  "fork-exec": ForkExec,
  "pipe-buffer": PipeBuffer,
  "process-tree-kill": ProcessTreeKill,
  "pipe-vs-pty": PipeVsPty,
  "virtual-memory": VirtualMemory,
  "race-interleaving": RaceInterleaving,
  "event-loop": EventLoop,
  "blocked-loop": BlockedLoop,
  "thread-pool": ThreadPool,
  "io-models": IoModels,
  "littles-law": LittlesLaw,
};
