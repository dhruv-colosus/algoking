import type { CourseModule } from "./types";

export const machineReality: CourseModule = {
  number: 1,
  slug: "machine-reality",
  title: "Machine reality",
  shortTitle: "Machine reality",
  tagline: "Big-O counts operations. Real speed depends on how far the data is from the CPU.",
  intuition: "Two O(n) loops can differ by 10x or more because one stays in cache and the other chases pointers. Scale the numbers until 1 ns feels like 1 second, and it becomes obvious why a harness should spend its effort on round trips first and CPU second.",
  harness: "Every byte limit, token budget and truncation in an agent harness sits on top of this module. A harness that counts characters when it means bytes, or bytes when it means tokens, ships broken text to the model.",
  levels: {
    Basics: ["Binary and two's complement", "IEEE 754 floats", "Endianness", "ASCII, UTF-8 and UTF-16", "Stack and heap", "Pointers and alignment"],
    Depth: ["64-byte cache lines", "Locality and prefetching", "False sharing", "The TLB", "Branch prediction", "SIMD", "Memory ordering on x86 and Arm", "Generational garbage collection"],
    Current: ["SIMD parsing as in simdjson", "Arm servers", "NUMA on large hosts", "GPU memory as the limit for inference"],
  },
  timeline: [
    ["1945", "Stored programs", "The EDVAC report puts code and data in one memory. Moving data to the processor is the bottleneck from day one."],
    ["1963", "ASCII", "Seven bits per character. Enough for English, not for everyone else."],
    ["1985", "IEEE 754", "One shared format for floating point, which is why 0.1 + 0.2 is wrong the same way everywhere."],
    ["1992", "UTF-8", "Ken Thompson and Rob Pike design a variable-width encoding that keeps ASCII unchanged."],
    ["1995", "The memory wall", "CPU speed has been outrunning DRAM for years. Caches become the main performance story."],
    ["2019", "simdjson", "Parsing gigabytes of JSON per second by classifying 64 bytes per instruction batch."],
    ["2026", "GPU memory is the limit", "Inference speed is set by how fast weights and KV cache stream out of high-bandwidth memory."],
  ],
  lessons: [
    {
      slug: "bits-and-numbers",
      title: "Bits, integers and floats",
      summary: "Every value is a bit pattern plus a rule for reading it. Learn the three rules that matter: unsigned, two's complement and IEEE 754.",
      level: "Basics",
      minutes: 14,
      blocks: [
        { kind: "p", text: "A byte is eight bits. The bits mean nothing until something agrees how to read them. The pattern `11111011` is 251 as an unsigned byte, −5 as a signed byte, and part of a UTF-8 sequence in a string. The hardware does not care. Your code decides." },
        { kind: "h", text: "Two's complement: why −1 is all ones" },
        { kind: "p", text: "Signed integers use **two's complement**. The top bit carries a negative weight: in an 8-bit value it is worth −128 instead of +128. To negate a number, flip every bit and add one. The payoff is that addition works the same way for signed and unsigned values, so the CPU needs only one adder." },
        { kind: "figure", figure: "bit-explorer", title: "Flip bits, read the same byte three ways", caption: "Toggle bits or pick a preset. The top bit is worth −128 when read as signed. Add 1 to 127 and watch it wrap to −128: that is integer overflow." },
        { kind: "p", text: "Overflow is not an error in most languages. In C, signed overflow is undefined behaviour, which lets the compiler assume it never happens. In Rust, debug builds panic and release builds wrap. In JavaScript, bitwise operators silently convert to 32-bit integers: `2 ** 31 | 0` is `-2147483648`." },
        { kind: "h", text: "IEEE 754: floats are fractions in base 2" },
        { kind: "p", text: "A 64-bit double stores one sign bit, 11 exponent bits and 52 fraction bits. It can represent 0.5, 0.25 and 0.125 exactly, but not 0.1, for the same reason 1/3 has no finite decimal form. Every decimal you type is rounded to the nearest representable binary fraction." },
        { kind: "figure", figure: "float-anatomy", title: "Inside the double that stores 0.1", caption: "Sign, exponent and fraction fields of 0.1. The fraction repeats 1001 forever and is rounded at bit 52, so the stored value is slightly more than 0.1." },
        { kind: "code", lang: "js", file: "float-surprises.js", code: `0.1 + 0.2                  // 0.30000000000000004
0.1 + 0.2 === 0.3          // false
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON  // true

// Integers are exact only up to 2^53
Number.MAX_SAFE_INTEGER    // 9007199254740991
2 ** 53 + 1 === 2 ** 53    // true: the +1 was rounded away

// A 64-bit ID from an API, parsed as JSON
JSON.parse('{"id": 1234567890123456789}').id
// 1234567890123456800  (wrong last digits)
`, note: "Many APIs send 64-bit IDs as strings for exactly this reason." },
        { kind: "h", text: "Endianness: which byte comes first" },
        { kind: "p", text: "A 32-bit integer such as `0x12345678` occupies four bytes. **Big-endian** stores `12 34 56 78`, most significant byte first. **Little-endian** stores `78 56 34 12`. x86 and almost all Arm systems run little-endian, while network protocols traditionally use big-endian, called network byte order. You meet this the moment you parse a binary header or write bytes to a socket." },
        { kind: "table", head: ["Value", "Big-endian bytes", "Little-endian bytes"], rows: [["0x12345678", "12 34 56 78", "78 56 34 12"], ["1 (uint16)", "00 01", "01 00"], ["−2 (int16)", "FF FE", "FE FF"]] },
        { kind: "callout", tone: "harness", title: "In a harness", text: "Token counts, byte limits and costs are integers. Keep money in integer cents or micro-dollars, not floats. Keep 64-bit IDs as strings when they cross a JSON boundary." },
      ],
      practice: [
        ["Snowflake IDs", "X (formerly Twitter) and Discord IDs exceed 2^53, so their APIs return them as strings. Parsing them as numbers corrupts the last digits."],
        ["Billing", "Payment systems such as Stripe represent amounts in the smallest currency unit, as integers, so rounding never creates or destroys money."],
        ["Binary protocols", "TCP headers, Protobuf fixed-width fields and image formats all specify byte order. Reading them with the wrong order gives plausible but wrong numbers."],
      ],
      check: [
        ["What is −1 as an 8-bit two's complement byte?", "`11111111`, which is 255 unsigned. Flip 00000001 to 11111110, then add one."],
        ["Why does 0.1 + 0.2 not equal 0.3?", "Neither 0.1 nor 0.2 has an exact binary form. Each is rounded, and the rounding errors add up to a value one unit above the double nearest 0.3."],
        ["What is the largest integer a JavaScript number holds exactly, and why?", "2^53 − 1. A double has 52 stored fraction bits plus an implicit leading 1, so 53 bits of precision."],
      ],
      tryIt: "In your browser console, run `new DataView(new Uint32Array([0x12345678]).buffer).getUint8(0).toString(16)`. A result of `78` means your machine is little-endian.",
    },
    {
      slug: "text-is-bytes",
      title: "Text is bytes: ASCII, UTF-8 and UTF-16",
      summary: "A string has at least four different lengths. Learn which one each limit means, and how a careless slice ships broken text to a model.",
      level: "Basics",
      minutes: 16,
      blocks: [
        { kind: "p", text: "Unicode assigns every character a number called a **code point**, written like `U+1F642`. An **encoding** turns code points into bytes. The two you meet every day are UTF-8, used by files, HTTP and most APIs, and UTF-16, used inside JavaScript, Java and Windows strings." },
        { kind: "table", head: ["Code point range", "UTF-8 bytes", "UTF-16 code units", "Example"], rows: [["U+0000 to U+007F", "1", "1", "A, {, 7"], ["U+0080 to U+07FF", "2", "1", "é, ñ, ß"], ["U+0800 to U+FFFF", "3", "1", "日, €, ✓"], ["U+10000 and above", "4", "2 (surrogate pair)", "🙂, 𝄞"]] },
        { kind: "p", text: "UTF-8 is backward-compatible with ASCII: every ASCII byte means the same thing. Bytes of a multi-byte character always start with `10`, so a decoder can tell a continuation byte from the start of a character. That property makes UTF-8 self-synchronising, which matters when a stream is cut in the middle." },
        { kind: "figure", figure: "text-bytes", title: "One string, four lengths", caption: "Each column is one user-perceived character, a grapheme. Below it are its code points, UTF-8 bytes and UTF-16 code units. Drag the slice to see where `.slice(0, n)` cuts a surrogate pair in half." },
        { kind: "h", text: "The four lengths" },
        { kind: "list", items: [
          "**UTF-16 code units**: what JavaScript's `.length` counts. `\"🙂\".length` is 2.",
          "**Bytes**: what a network or storage limit counts. `new TextEncoder().encode(\"🙂\").length` is 4.",
          "**Code points**: what `[...str].length` counts. `[...\"🙂\"].length` is 1.",
          "**Graphemes**: what a person counts as one character. A family emoji such as 👨‍👩‍👧 is 1 grapheme, 5 code points, 8 UTF-16 units and 18 UTF-8 bytes.",
        ] },
        { kind: "p", text: "A fifth length matters in agent work: **tokens**. A tokenizer splits text into pieces from a learned vocabulary. Common English words are often one token, while rare words, code identifiers and emoji may take several. You cannot convert between bytes and tokens with a constant." },
        { kind: "h", text: "Worked example: truncating tool output" },
        { kind: "p", text: "A tool returns 2 MB of logs and the harness keeps the first 4,000 characters. `.slice(0, 4000)` can end between the two halves of a surrogate pair. The result contains a lone surrogate, which is not valid Unicode. Encoding it to UTF-8 produces the replacement character `�`, and some JSON encoders reject it outright." },
        { kind: "code", lang: "ts", file: "truncate.ts", code: `const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: false });

/** Truncate to at most maxBytes of UTF-8 without splitting a character. */
export function truncateUtf8(text: string, maxBytes: number) {
  const bytes = encoder.encode(text);
  if (bytes.length <= maxBytes) return { text, truncated: false };

  let end = maxBytes;
  // Step back past continuation bytes (10xxxxxx) to a character boundary.
  while (end > 0 && (bytes[end] & 0b1100_0000) === 0b1000_0000) end--;

  return {
    text: decoder.decode(bytes.subarray(0, end)),
    truncated: true,
    omittedBytes: bytes.length - end,
  };
}

// Graphemes: do not split 👨‍👩‍👧 or é written as e + U+0301
const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
export const graphemeCount = (s: string) => [...segmenter.segment(s)].length;
`, note: "Report what was cut. A note like “truncated 1.8 MB, full output saved to /tmp/run-42.log” lets the model ask for more." },
        { kind: "callout", tone: "trap", title: "Streams split characters too", text: "A network read can end in the middle of a 4-byte UTF-8 character. Decode streamed bytes with `new TextDecoder().decode(chunk, { stream: true })`, which keeps the partial bytes until the next chunk arrives. Module 6 returns to this for SSE parsers." },
      ],
      practice: [
        ["Tool output limits", "Production harnesses cap tool results by bytes or tokens, never by `.length`, and save the overflow to a file the model can read later."],
        ["Database columns", "MySQL's legacy `utf8` charset stores at most 3 bytes per character, so emoji fail to insert. `utf8mb4` fixes it. Postgres limits are in bytes too."],
        ["Prompt budgets", "Model context windows are measured in tokens. Use the provider's token-counting endpoint or tokenizer to budget, then keep a safety margin."],
      ],
      check: [
        ["What does `\"🙂\".length` return in JavaScript, and why?", "2. JavaScript strings are UTF-16, and 🙂 (U+1F642) is above U+FFFF, so it needs a surrogate pair."],
        ["How many UTF-8 bytes does `é` take? And `日`?", "é (U+00E9) takes 2 bytes. 日 (U+65E5) takes 3."],
        ["Why is `str.length` wrong for a byte limit or a token budget?", "It counts UTF-16 code units. Bytes depend on the encoding, and tokens depend on the tokenizer's vocabulary. All three diverge on non-ASCII text."],
      ],
      tryIt: "Take a 10 KB sample of real tool output with some emoji and accented names. Print its `.length`, UTF-8 byte length, code point count and grapheme count, then count its tokens with your model provider's tokenizer. Note the ratios.",
    },
    {
      slug: "memory-layout",
      title: "Stack, heap, pointers and alignment",
      summary: "Where values live decides how fast you can reach them and how long they survive. Learn the two regions, and why struct field order changes its size.",
      level: "Basics",
      minutes: 13,
      blocks: [
        { kind: "p", text: "A running program has two main places for data. The **stack** holds function frames: local variables, arguments and the return address. It grows and shrinks with calls, so allocation is just moving a pointer, and memory is freed the instant a function returns. The **heap** holds data whose size or lifetime is not known in advance. It needs an allocator, and in managed languages a garbage collector." },
        { kind: "figure", figure: "memory-layout", title: "Frames on the stack, objects on the heap", caption: "Each call pushes a frame. Locals that hold objects are pointers into the heap. When `parseToolResult` returns, its frame is gone, but the heap object it built stays alive as long as something still points to it." },
        { kind: "h", text: "Pointers are addresses" },
        { kind: "p", text: "A pointer is a number: the address of another value. Following one is called **dereferencing**. Every dereference may jump to a distant part of memory. A linked list, a tree or a JavaScript object graph is a chain of these jumps, which is why they can be much slower to walk than an array of the same size. The next lessons explain the cost." },
        { kind: "p", text: "In JavaScript, Python and Java, almost every object is a heap allocation reached through a pointer. An array of numbers in V8 may be stored unboxed and contiguous, while an array of objects is an array of pointers to objects scattered around the heap." },
        { kind: "h", text: "Alignment and padding" },
        { kind: "p", text: "CPUs read memory fastest when a value of size n sits at an address divisible by n. Compilers insert **padding** to make that true. Field order therefore changes the size of a struct." },
        { kind: "code", lang: "c", file: "padding.c", code: `#include <stdio.h>
#include <stdint.h>

struct Wasteful { char kind; int32_t tokens; char done; };   // 1 + 3 pad + 4 + 1 + 3 pad
struct Compact  { int32_t tokens; char kind; char done; };   // 4 + 1 + 1 + 2 pad

int main(void) {
  printf("%zu %zu\\n", sizeof(struct Wasteful), sizeof(struct Compact)); // 12 8
}
`, note: "A million of these is 12 MB versus 8 MB, and 50% more cache lines to read." },
        { kind: "callout", tone: "harness", title: "In a harness", text: "Long agent runs accumulate millions of small objects: messages, tool events, trace spans. Storing them as compact arrays or typed buffers instead of nested objects can cut both memory and GC pause time." },
      ],
      practice: [
        ["Stack overflow", "Deep recursion on a large tree, or a recursive JSON walker on hostile input, can exhaust a thread's stack. Production parsers use explicit stacks on the heap."],
        ["Columnar data", "Arrow and Parquet store each field in its own contiguous array. Scanning one column then touches only the bytes it needs (Module 7)."],
        ["Game engines", "Entity-component systems keep components in packed arrays rather than object graphs, purely for cache behaviour."],
      ],
      check: [
        ["What happens to a local variable's stack memory when its function returns?", "The frame is popped. The memory is reused by the next call, so pointers to it become dangling."],
        ["Why might `struct { char a; int b; char c; }` take 12 bytes?", "`b` must start at a multiple of 4, so 3 padding bytes follow `a`. The struct's size rounds up to a multiple of 4, adding 3 more after `c`."],
        ["Why is an array of objects slower to scan than an array of numbers?", "Each element is a pointer to a separate heap object, so every access may land on a different, uncached part of memory."],
      ],
      tryIt: "In Node, compare `process.memoryUsage().heapUsed` after creating 1,000,000 `{ a: i, b: i }` objects against one `Float64Array` of 2,000,000 values. Explain the gap.",
    },
    {
      slug: "latency-ladder",
      title: "The latency ladder",
      summary: "Every operation has a distance. Put them on one scale and you will know where to spend optimisation effort before you profile anything.",
      level: "Depth",
      minutes: 10,
      blocks: [
        { kind: "p", text: "The numbers below span nine orders of magnitude. They are rough and vary by hardware, but their ratios are stable enough to reason with. Multiply them by a billion so that 1 ns feels like 1 second, and the distances become something you can feel." },
        { kind: "figure", figure: "latency-ladder", title: "From an L1 hit to the first token", caption: "Bars use a logarithmic scale, so each grid step is 10 times longer. Switch to human time to see the same numbers as if 1 ns lasted 1 second." },
        { kind: "p", text: "An agent harness lives at the bottom of this ladder. A single model turn costs about a second before the first token, and a tool call to a remote API costs tens to hundreds of milliseconds. Shaving microseconds of CPU from a JSON transform rarely matters next to one avoided round trip." },
        { kind: "h", text: "Rules that follow from the ladder" },
        { kind: "steps", items: [
          ["Count round trips first", "A request that needs three sequential calls to another continent costs half a second before any server does any work. Batch, pipeline or move closer."],
          ["Reuse connections", "A new HTTPS connection costs extra round trips for TCP and TLS. Keep-alive pools turn those into zero for every request after the first (Module 4)."],
          ["Then cut bytes", "Bandwidth is the next cost. Compress large payloads and do not send what the reader will not use (Module 8)."],
          ["Only then optimise CPU", "Profile first. When CPU does matter, memory access patterns usually matter more than instruction counts."],
        ] },
        { kind: "callout", tone: "trap", title: "Measure on your hardware", text: "These figures are for intuition. Cloud VMs, laptops and phones differ by large factors, and network round trips vary by route and time of day. Measure before you rely on a number." },
      ],
      practice: [
        ["Parallel tool calls", "If a model asks for three independent reads, running them concurrently turns three round trips into one. Most agent APIs let one assistant turn contain several tool calls for this reason."],
        ["Regional placement", "Putting the harness in the same region as the model API and the database removes cross-region hops from every step of a long run."],
        ["N+1 queries", "Loading 100 rows and then one query per row is 101 round trips. A join or `IN` query is one."],
      ],
      check: [
        ["Roughly how many main-memory reads fit in one same-region round trip?", "About 5,000: 0.5 ms divided by 100 ns."],
        ["A step makes 4 sequential calls across a continent at 150 ms each. What is the floor?", "600 ms of pure network time, before any server processing."],
        ["Why optimise round trips before CPU in an agent harness?", "Model and network latency are millions of times larger than most CPU work the harness does per step."],
      ],
      tryIt: "Time `fetch` to an API in your region and one on another continent, 20 times each with a reused connection. Then time an in-memory `JSON.parse` of a typical tool result. Put all three on the ladder.",
    },
    {
      slug: "caches-and-locality",
      title: "Caches, locality and false sharing",
      summary: "Memory moves in 64-byte lines. Code that uses every byte of each line runs fast; code that jumps around pays the full trip to DRAM again and again.",
      level: "Depth",
      minutes: 18,
      blocks: [
        { kind: "p", text: "The CPU never reads a single byte from DRAM. It reads a **cache line**, usually 64 bytes, and keeps it in a small, fast cache. Modern cores have three levels: L1 of tens of KB per core at about 1 ns, L2 around 1 MB, and L3 shared across cores with tens of MB. A miss in all three costs about 100 ns." },
        { kind: "p", text: "Two kinds of **locality** decide your hit rate. Spatial locality: if you touched byte n, you will probably touch n+1 soon, so the rest of the line is already loaded. Temporal locality: if you touched it recently, you will probably touch it again. Hardware **prefetchers** watch for sequential patterns and fetch the next lines before you ask." },
        { kind: "figure", figure: "cache-walk", title: "Sum an array versus walk a shuffled list", caption: "64 values span 8 cache lines, and this tiny cache holds 2 lines. A sequential scan misses once per line. A shuffled linked list visits the same values in random order and misses on most steps. Both are O(n)." },
        { kind: "p", text: "The same effect shows up at every size. When the working set fits in L1, L2 or L3, time per element stays flat; when it spills to the next level, time steps up. The module lab plots exactly this staircase." },
        { kind: "h", text: "The TLB and branch prediction" },
        { kind: "p", text: "Addresses are virtual. Translating one to a physical page goes through the **TLB**, a small cache of page-table entries. Random access across a large heap misses the TLB as well as the data cache, and each TLB miss walks the page tables. Huge pages of 2 MB reduce this. Separately, CPUs guess which way a branch will go. A wrong guess flushes the pipeline and costs 10 to 20 cycles, so unpredictable branches in hot loops are slow." },
        { kind: "h", text: "False sharing" },
        { kind: "p", text: "Caches keep lines coherent across cores. When one core writes to a line, every other core's copy is invalidated. If two threads update **different** variables that happen to sit in the **same** line, they keep stealing the line from each other. Neither thread shares data, yet they run as if they did." },
        { kind: "figure", figure: "false-sharing", title: "Two counters, one cache line", caption: "Thread A writes `hits`, thread B writes `misses`. Because both live in one 64-byte line, every write forces the other core to reload it. Padding each counter onto its own line removes the ping-pong." },
        { kind: "code", lang: "c", file: "false_sharing.c", code: `// Before: both counters share one 64-byte line
struct Stats { _Atomic long hits; _Atomic long misses; };

// After: each counter owns a full line
struct PaddedStats {
  _Alignas(64) _Atomic long hits;
  _Alignas(64) _Atomic long misses;
};
`, note: "Find it with `perf c2c` on Linux, which reports cache lines contended across cores." },
      ],
      practice: [
        ["Columnar analytics", "DuckDB and ClickHouse scan contiguous column arrays, using every byte of every line, which is a large part of why they are fast."],
        ["Hash tables", "Open-addressing tables such as Swiss tables keep probes within a cache line. Chained tables follow pointers and miss more."],
        ["Per-core counters", "Metrics libraries keep a padded counter per thread or core and sum them on read, avoiding false sharing on hot counters."],
      ],
      check: [
        ["Why can two O(n) loops differ by 10x?", "One reads memory sequentially and gets cache and prefetch hits. The other chases pointers to random addresses and waits about 100 ns on most steps."],
        ["What is false sharing, and how would you find it?", "Two threads write different variables on one cache line, so the line bounces between cores. `perf c2c` or a cache-miss counter on the hot loop reveals it."],
        ["Why do huge pages help random access over a big heap?", "Each TLB entry covers 2 MB instead of 4 KB, so far fewer translations miss."],
      ],
      tryIt: "Sum a `Float64Array` of n values, then walk the same values through a shuffled `next` index array. Time both for n from 1,000 to 50,000,000 and plot nanoseconds per element. On Linux, confirm the cause with `perf stat -e cache-misses`.",
    },
    {
      slug: "modern-hardware",
      title: "SIMD, memory ordering, GC and GPU memory",
      summary: "Where hardware is in late 2026: wide vector instructions, weaker memory models on Arm, garbage collectors that trade pauses for throughput, and GPUs limited by memory bandwidth.",
      level: "Current",
      minutes: 16,
      blocks: [
        { kind: "h", text: "SIMD: one instruction, many values" },
        { kind: "p", text: "SIMD registers hold several values at once: 128 bits on Arm NEON, 256 bits on AVX2 and 512 bits on AVX-512 and some Arm SVE parts. One instruction adds, compares or shuffles every lane together. Compilers auto-vectorise simple loops; libraries such as simdjson hand-write vector code for parsing." },
        { kind: "figure", figure: "simd-lanes", title: "Scalar versus eight-lane SIMD", caption: "A scalar loop adds one pair per instruction. A 256-bit register holds eight 32-bit lanes, so one instruction adds eight pairs. simdjson uses the same idea to classify 64 input bytes at a time as quotes, backslashes or structural characters." },
        { kind: "p", text: "simdjson parses JSON at gigabytes per second by finding every quote and bracket in a block with a few vector instructions and bit tricks, instead of a byte-at-a-time state machine. That changes which side of the latency ladder parsing sits on." },
        { kind: "h", text: "Memory ordering: x86 versus Arm" },
        { kind: "p", text: "CPUs and compilers reorder memory operations for speed. x86 uses a fairly strong model: stores become visible in order. Arm uses a weaker one and may make two stores visible to another core in either order. Code that worked by accident on x86 can break on Arm servers such as Graviton or on Apple silicon. The fix is never to rely on luck: use atomics with explicit ordering, or a mutex." },
        { kind: "code", lang: "c", file: "publish.c", code: `// Writer: fill the buffer, then publish a flag
data = compute();
atomic_store_explicit(&ready, 1, memory_order_release);

// Reader: see the flag, then read the data
if (atomic_load_explicit(&ready, memory_order_acquire))
  use(data);   // guaranteed to see compute()'s result
`, note: "Release/acquire pairs say “everything before this store is visible after that load”. Plain variables promise nothing across cores." },
        { kind: "h", text: "Garbage collection" },
        { kind: "p", text: "Most objects die young. **Generational** collectors exploit this: a small young generation is collected often and cheaply, and survivors are promoted to an old generation collected rarely. V8, the JVM and .NET all work this way. Allocation-heavy code, such as rebuilding a large message array every turn, keeps the young collector busy and causes pauses that show up as jitter in token streams." },
        { kind: "h", text: "NUMA and GPU memory" },
        { kind: "p", text: "Large servers have several CPU sockets, each with its own memory. Reading another socket's memory is slower: this is **NUMA**. Databases and inference servers pin threads and memory to the same node." },
        { kind: "p", text: "For LLM inference, the binding limit is usually GPU memory. Decoding one token for one sequence must read every model weight from high-bandwidth memory, plus that sequence's KV cache. Token rate is therefore bounded by memory bandwidth divided by bytes read per token, and batch size is bounded by how many KV caches fit. Module 13 builds on this." },
        { kind: "table", head: ["Resource", "What limits it", "What engineers do"], rows: [["CPU core", "Cache misses, branch mispredicts", "Contiguous data, fewer branches, SIMD"], ["Socket memory", "NUMA distance", "Pin threads and memory together"], ["GPU", "HBM bandwidth and capacity", "Batching, quantisation, KV cache paging"]] },
        { kind: "callout", tone: "now", title: "Where things stand in late 2026", text: "Arm servers are common across the major clouds, so memory-ordering bugs that hid on x86 now surface in production. Inference capacity is planned in GPU memory: model weights plus KV cache per concurrent sequence." },
      ],
      practice: [
        ["Fast parsers", "simdjson, simdutf and Rust's `memchr` crate use SIMD to scan text. Node's UTF-8 validation uses simdutf."],
        ["Arm migrations", "Teams moving services to Arm instances run tests under thread sanitizers to catch missing atomics that x86 forgave."],
        ["Inference serving", "vLLM and SGLang manage KV cache as pages in GPU memory, because GPU memory, not compute, decides how many requests run at once."],
      ],
      check: [
        ["Why can code with a data race work on x86 but fail on Arm?", "x86 keeps stores in order; Arm may reorder them. Code that relied on ordering without atomics loses that guarantee."],
        ["Why does decode speed depend on memory bandwidth?", "Each new token requires reading all weights and the KV cache. Very little arithmetic is done per byte read, so the memory bus is the bottleneck."],
        ["What does a generational GC assume?", "Most objects die young, so collecting a small young region often is cheap and frees most garbage."],
      ],
      tryIt: "Run Node with `--trace-gc` while an agent loop appends 5,000 messages and rebuilds the prompt array each turn. Count scavenges per turn, then switch to appending in place and compare.",
    },
  ],
  lab: [
    "Sum an array, then walk a shuffled linked list, at sizes from 1 KB to 1 GB.",
    "Plot nanoseconds per element and find the steps at each cache size.",
    "Confirm the cause with `perf stat -e cache-misses`.",
    "Write a truncation helper that respects UTF-8 boundaries and graphemes, and fuzz it with random emoji.",
  ],
  interview: [
    ["Why can two O(n) loops differ by 10x?", "Locality and pointer chasing. Sequential access uses whole cache lines and the prefetcher; pointer chasing waits on DRAM for most elements."],
    ["Why is `str.length` wrong for byte limits and token budgets?", "It counts UTF-16 code units. Bytes depend on encoding, tokens on the tokenizer. Separate the three explicitly."],
    ["What is false sharing, and how would you find it?", "Two threads write different variables on one cache line. Use `perf c2c`, or pad hot per-thread fields to 64 bytes and measure."],
  ],
  reading: [
    "Computer Systems: A Programmer's Perspective, Bryant and O'Hallaron",
    "What Every Programmer Should Know About Memory, Ulrich Drepper",
    "Algorithms for Modern Hardware, Sergey Slotin",
  ],
};
