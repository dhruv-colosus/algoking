import type { ComponentType } from "react";
import type { FigureId } from "@/lib/fundamentals/types";
import { BitExplorer, CacheWalk, LatencyLadder, TextBytes } from "./machine-interactive";
import { FalseSharing, FloatAnatomy, MemoryLayout, SimdLanes } from "./machine-static";
import { PipeBuffer, ProcessTreeKill } from "./os-interactive";
import { ForkExec, PipeVsPty, ProcessAnatomy, VirtualMemory } from "./os-static";
import { BlockedLoop, EventLoop, LittlesLaw, RaceInterleaving } from "./async-interactive";
import { IoModels, ThreadPool } from "./async-static";
import { BdpCalculator, ByteStreamFraming, CongestionWindow, PacketLayers, TcpHandshake } from "./network-interactive";
import { DnsResolution, NatTimeout } from "./network-static";
import { HolBlocking, HttpAnatomy, RttWaterfall, Tls13Handshake } from "./http-interactive";
import { ClientHelloSize, ConnectionMigration } from "./http-static";
import { ResumableStream, SseParser, StreamFailures } from "./stream-interactive";
import { LbPinning, StreamDirections, WebsocketFrame } from "./stream-static";
import { Base64Bits, PromptCacheOrder, ProtobufEncoder, RowVsColumn } from "./serial-interactive";
import { SchemaEvolution } from "./serial-static";
import { CodecDecision, CrimeOracle, EntropyMeter, HuffmanTree, Lz77Demo } from "./compress-interactive";
import { DictionaryEffect } from "./compress-static";

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
  "packet-layers": PacketLayers,
  "nat-timeout": NatTimeout,
  "dns-resolution": DnsResolution,
  "byte-stream-framing": ByteStreamFraming,
  "tcp-handshake": TcpHandshake,
  "bdp-calculator": BdpCalculator,
  "congestion-window": CongestionWindow,
  "http-anatomy": HttpAnatomy,
  "tls13-handshake": Tls13Handshake,
  "rtt-waterfall": RttWaterfall,
  "hol-blocking": HolBlocking,
  "connection-migration": ConnectionMigration,
  "clienthello-size": ClientHelloSize,
  "stream-directions": StreamDirections,
  "sse-parser": SseParser,
  "websocket-frame": WebsocketFrame,
  "lb-pinning": LbPinning,
  "stream-failures": StreamFailures,
  "resumable-stream": ResumableStream,
  "base64-bits": Base64Bits,
  "protobuf-encoder": ProtobufEncoder,
  "schema-evolution": SchemaEvolution,
  "row-vs-column": RowVsColumn,
  "prompt-cache-order": PromptCacheOrder,
  "entropy-meter": EntropyMeter,
  "huffman-tree": HuffmanTree,
  "lz77-demo": Lz77Demo,
  "codec-decision": CodecDecision,
  "dictionary-effect": DictionaryEffect,
  "crime-oracle": CrimeOracle,
};
