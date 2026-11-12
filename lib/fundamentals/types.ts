// Course content for the Agentic fundamentals track.
// Inline text supports `code` and **bold** markers, rendered by components/fundamentals/rich-text.

export type FigureId =
  | "bit-explorer" | "float-anatomy" | "text-bytes" | "memory-layout" | "latency-ladder"
  | "cache-walk" | "false-sharing" | "simd-lanes"
  | "process-anatomy" | "fork-exec" | "pipe-buffer" | "process-tree-kill" | "pipe-vs-pty" | "virtual-memory"
  | "race-interleaving" | "event-loop" | "blocked-loop" | "thread-pool" | "io-models" | "littles-law"
  | "packet-layers" | "nat-timeout" | "dns-resolution" | "byte-stream-framing" | "tcp-handshake" | "bdp-calculator" | "congestion-window"
  | "http-anatomy" | "tls13-handshake" | "rtt-waterfall" | "hol-blocking" | "connection-migration" | "clienthello-size"
  | "stream-directions" | "sse-parser" | "websocket-frame" | "lb-pinning" | "stream-failures" | "resumable-stream"
  | "base64-bits" | "protobuf-encoder" | "schema-evolution" | "row-vs-column" | "prompt-cache-order"
  | "entropy-meter" | "huffman-tree" | "lz77-demo" | "codec-decision" | "dictionary-effect" | "crime-oracle";

export type CodeLanguage = "ts" | "js" | "c" | "bash" | "json" | "text";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "figure"; figure: FigureId; title: string; caption: string }
  | { kind: "code"; lang: CodeLanguage; file: string; code: string; note?: string }
  | { kind: "callout"; tone: CalloutTone; title: string; text: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "steps"; items: [string, string][] }
  /** A worked calculation: labelled lines, then the result. */
  | { kind: "example"; title: string; lines: [string, string][]; result: string }
  /** An expandable section for readers who want the mechanism in full. */
  | { kind: "deep"; title: string; blocks: Block[] };

export type CalloutTone = "harness" | "trap" | "now" | "analogy";

export type Level = "Basics" | "Depth" | "Current";

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  level: Level;
  minutes: number;
  blocks: Block[];
  /** Where this shows up in real systems: [title, explanation]. */
  practice: [string, string][];
  /** Self-check questions: [question, answer]. */
  check: [string, string][];
  /** A small hands-on exercise. */
  tryIt: string;
  /** Words to know: [term, definition]. */
  terms?: [string, string][];
};

export type CourseModule = {
  number: number;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  intuition: string;
  harness: string;
  levels: Record<Level, string[]>;
  timeline: [string, string, string][];
  lessons: Lesson[];
  lab: string[];
  interview: [string, string][];
  reading: string[];
};

export type PlannedModule = { number: number; title: string; summary: string };

export type Phase = {
  number: number;
  title: string;
  weeks: number;
  outcome: string;
  modules: (CourseModule | PlannedModule)[];
};
