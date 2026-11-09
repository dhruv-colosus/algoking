import type { CourseModule } from "./types";

export const concurrencyAndAsync: CourseModule = {
  number: 3,
  slug: "concurrency-and-async",
  title: "Concurrency and async runtimes",
  shortTitle: "Concurrency & async",
  tagline: "Async does not make work faster. It lets one thread wait on thousands of things.",
  intuition: "The real design questions are what limits concurrency and what happens when producers outrun consumers. Little's Law sizes the system: at 20 agent runs per second and 30 seconds per run, you hold 600 runs open. That one multiplication sizes connection pools, memory and rate limits.",
  harness: "An agent server streams tokens to many users while running tools, parsing large results and calling model APIs. One blocked event loop freezes every stream at once, and one unbounded queue turns a traffic spike into an out-of-memory crash.",
  levels: {
    Basics: ["Blocking and non-blocking I/O", "Threads and mutexes", "Races and deadlock", "Promises and microtasks", "Event-loop phases"],
    Depth: ["select, poll, epoll and kqueue", "Edge and level triggering", "Readiness versus completion", "libuv internals and worker threads", "SharedArrayBuffer and Atomics", "Go's M:N scheduler and Tokio work stealing", "AbortController and backpressure", "Structured concurrency and Amdahl's Law"],
    Current: ["io_uring", "Why io_uring is often switched off in production"],
  },
  timeline: [
    ["1983", "select()", "4.2BSD lets one process wait on many descriptors, scanning all of them on every call."],
    ["2000", "kqueue", "FreeBSD 4.1 adds an event queue that reports only descriptors that changed."],
    ["2002", "epoll", "Linux 2.5.44 gets the same idea, and the C10K problem becomes solvable on one machine."],
    ["2009", "Node.js", "A single-threaded event loop on V8 makes non-blocking I/O the default for JavaScript servers. libuv follows in 2011."],
    ["2017", "async/await", "ES2017 makes asynchronous code read like sequential code, on top of promises."],
    ["2019", "io_uring", "Linux 5.1 introduces shared submission and completion rings: completion-based I/O with few system calls."],
    ["2023", "io_uring restricted", "After a run of kernel exploits, Google turns it off on production servers and container runtimes drop it from default seccomp profiles."],
  ],
  lessons: [
    {
      slug: "threads-races-deadlock",
      title: "Threads, races and deadlock",
      summary: "Two threads touching the same memory can interleave in ways that lose updates. Learn why `count++` is three steps, how a mutex fixes it, and how two mutexes can freeze a program.",
      level: "Basics",
      minutes: 15,
      blocks: [
        { kind: "p", text: "A **thread** is an independent sequence of execution inside a process. Threads share memory, which makes communication cheap and correctness hard. The scheduler can pause a thread between any two machine instructions and run another one." },
        { kind: "h", text: "A race in three instructions" },
        { kind: "p", text: "`count++` looks atomic but compiles to three steps: load the value into a register, add one, store it back. If two threads interleave those steps, both load the same old value and one increment disappears. This is a **data race**, and it is invisible in testing until load arrives." },
        { kind: "figure", figure: "race-interleaving", title: "Lose an update, then prevent it", caption: "Step through two threads incrementing one counter. Without a lock, both load 0 and both store 1. With a mutex, thread B waits until thread A has stored, so the final value is 2." },
        { kind: "h", text: "Mutexes and atomics" },
        { kind: "p", text: "A **mutex** lets only one thread into a critical section at a time. An **atomic** operation such as fetch-and-add does the whole read-modify-write as one indivisible hardware instruction, which is faster for a single counter. Use atomics for single values and a mutex when several values must change together." },
        { kind: "h", text: "Deadlock" },
        { kind: "p", text: "Thread A holds lock 1 and waits for lock 2. Thread B holds lock 2 and waits for lock 1. Neither can continue. Deadlock needs four conditions at once: mutual exclusion, hold and wait, no preemption, and a circular wait. Break any one. The usual fix is a global lock order: always take lock 1 before lock 2." },
        { kind: "code", lang: "ts", file: "async-race.ts", code: `// Single-threaded JavaScript still races across await points.
let balance = 100;

async function withdraw(amount: number) {
  const current = balance;          // read
  await audit(amount);              // another call runs here
  balance = current - amount;       // write based on a stale read
}

await Promise.all([withdraw(30), withdraw(50)]);
console.log(balance);               // 50, not 20

// Fix: serialise access to the shared state
let queue = Promise.resolve();
const withLock = <T>(fn: () => Promise<T>) => (queue = queue.then(fn, fn)) as Promise<T>;
`, note: "Every `await` is a point where other code can run, so read-await-write is a race even without threads." },
        { kind: "callout", tone: "harness", title: "In a harness", text: "When a model issues several tool calls in one turn, run reads in parallel but serialise writes to the same file or resource. Two concurrent edits to one file are the agent version of a lost update." },
      ],
      practice: [
        ["Parallel tool calls", "Harnesses classify tools as read-only or mutating, run reads concurrently and queue writes per resource."],
        ["Database counters", "`UPDATE t SET n = n + 1` is atomic in the database. Reading `n`, adding one in the app and writing it back is a lost update under load."],
        ["Rate limit state", "A token bucket shared across async handlers needs atomic updates, or concurrent requests all see a full bucket."],
      ],
      check: [
        ["Why can `count++` lose updates across threads?", "It is a load, an add and a store. Two threads can both load the old value before either stores."],
        ["Can single-threaded JavaScript have a race condition?", "Yes. Other code runs at every `await`, so a read before an await and a write after it can use stale data."],
        ["Name the usual way to prevent deadlock.", "Acquire locks in one global order, which breaks the circular wait."],
      ],
      tryIt: "Run two Node `worker_threads` that each add 1,000,000 to a plain `Int32Array` slot of a `SharedArrayBuffer`. Print the result, then switch to `Atomics.add` and compare.",
    },
    {
      slug: "the-event-loop",
      title: "The event loop, tasks and microtasks",
      summary: "JavaScript runs one piece of code at a time and picks the next piece from queues. Learn the order: synchronous code, then every microtask, then the next task.",
      level: "Basics",
      minutes: 14,
      blocks: [
        { kind: "p", text: "Node and browsers run JavaScript on one thread with an **event loop**. The loop takes one task from a queue, runs it to completion, then drains the **microtask** queue completely, then takes the next task. Nothing interrupts running code. Concurrency comes from interleaving many short tasks, not from running them at the same moment." },
        { kind: "list", items: [
          "**Tasks** (macrotasks): timer callbacks, I/O callbacks, `setImmediate`, and in browsers, events and messages.",
          "**Microtasks**: promise reactions (`.then`, the code after an `await`) and `queueMicrotask`. In Node, `process.nextTick` callbacks run even before promise microtasks.",
        ] },
        { kind: "figure", figure: "event-loop", title: "Run five lines and predict the output", caption: "Step through the code. Synchronous lines run first. Promise and queueMicrotask callbacks wait in the microtask queue and run as soon as the stack empties. The timer callback is a task, so it runs last even with a 0 ms delay." },
        { kind: "h", text: "Node's loop phases" },
        { kind: "p", text: "libuv runs Node's loop in phases: **timers** (expired `setTimeout`), **pending callbacks**, **poll** (wait for I/O and run its callbacks), **check** (`setImmediate`) and **close callbacks**. Microtasks drain between every callback. The poll phase is where the process sleeps in `epoll_wait` or `kqueue` when there is nothing to do." },
        { kind: "callout", tone: "trap", title: "Microtasks can starve the loop", text: "A promise chain that keeps scheduling more microtasks never lets the loop reach the next task. Timers stop firing and I/O stops being read. In browsers, the page cannot paint either, because rendering happens between tasks." },
        { kind: "code", lang: "ts", file: "yield.ts", code: `// Process 100,000 items without freezing other requests
async function processAll(items: Item[]) {
  for (let i = 0; i < items.length; i++) {
    handle(items[i]);
    if (i % 1000 === 0) {
      // Yield to the event loop: a real task boundary, not a microtask
      await new Promise((resolve) => setImmediate(resolve));
    }
  }
}
// Note: \`await Promise.resolve()\` would NOT yield to I/O.
// It only queues a microtask, which runs before any task.
`, note: "In browsers, `scheduler.yield()` serves the same purpose and keeps the task's priority." },
      ],
      practice: [
        ["Streaming UIs", "React batches state updates and the browser paints between tasks. A chat UI that processes tokens in one long microtask chain cannot paint until it finishes (Module 11)."],
        ["Health checks", "A Node server whose loop is blocked cannot answer its health check, so the orchestrator restarts it while it is merely busy."],
        ["Measuring lag", "`perf_hooks.monitorEventLoopDelay()` reports how late the loop runs callbacks. Alert on its p99, not CPU."],
      ],
      check: [
        ["What does `await` do relative to the event loop?", "It suspends the async function and resumes it in a microtask once the awaited promise settles."],
        ["Why does `setTimeout(fn, 0)` run after a resolved promise's `.then`?", "The timer callback is a task. All microtasks drain before the loop takes the next task."],
        ["How do you yield to I/O in the middle of a long loop in Node?", "Await a task boundary such as `setImmediate`, not a resolved promise."],
      ],
      tryIt: "Add `process.nextTick`, `setImmediate` and `setTimeout(..., 0)` to the example, run it in Node, and explain the order. Then run it inside an I/O callback and see `setImmediate` beat the timer.",
    },
    {
      slug: "blocking-the-loop",
      title: "Blocking the loop and the thread pool",
      summary: "One slow synchronous call freezes every user on the process. Learn to spot event-loop blockers and the hidden four-thread pool behind fs, DNS and zlib.",
      level: "Depth",
      minutes: 15,
      blocks: [
        { kind: "p", text: "Because one thread runs all JavaScript, any synchronous work holds up everyone. A 200 ms `JSON.parse` of a 50 MB tool result stops the loop for 200 ms. Every other user's token stream freezes for exactly that long, and every pending timer and socket read waits." },
        { kind: "figure", figure: "blocked-loop", title: "Three streams and one big parse", caption: "Three users receive tokens every 20 ms. A synchronous parse on the main thread stops all three for 200 ms. Move the parse to a worker thread and the streams keep flowing while the worker parses." },
        { kind: "h", text: "Fixes, in order of preference" },
        { kind: "steps", items: [
          ["Do less", "Do not parse what you will not read. Cap tool output by bytes before parsing, or keep it as text."],
          ["Stream it", "Parse incrementally as bytes arrive, so no single step is long."],
          ["Chunk it", "Break the work into pieces and yield between them with `setImmediate`."],
          ["Move it", "Run it in a `worker_thread` or a separate process. Workers have their own event loop and heap, and communicate by message passing or SharedArrayBuffer."],
        ] },
        { kind: "h", text: "The libuv thread pool" },
        { kind: "p", text: "Not all I/O in Node is non-blocking in the kernel. File system calls, `dns.lookup`, zlib compression and some crypto functions run on libuv's **thread pool**, which has **4 threads by default**. If four slow DNS lookups occupy the pool, an unrelated `fs.readFile` waits in line behind them." },
        { kind: "figure", figure: "thread-pool", title: "Four threads, one queue", caption: "Three slow DNS lookups and a gzip job hold all four threads, so `fs.readFile` waits in the queue though the disk is idle. Network sockets do not use the pool; they go through epoll on the main loop." },
        { kind: "code", lang: "bash", file: "threadpool.sh", code: `# Raise the pool size before Node starts (read once at startup)
UV_THREADPOOL_SIZE=16 node server.js

# Find event-loop blockers with a CPU profile
node --cpu-prof server.js        # writes a .cpuprofile; open it in Chrome DevTools

# Or warn on blocking sync calls during development
node --trace-sync-io server.js
`, note: "`dns.resolve*` uses c-ares on the network instead of the thread pool. `dns.lookup` uses the system resolver through the pool." },
      ],
      practice: [
        ["Large tool results", "Agent servers cap and stream tool output, and parse big JSON in workers, so one heavy run does not stall others on the same instance."],
        ["Slow DNS incidents", "Services have stalled file I/O because a resolver became slow and `dns.lookup` calls filled the thread pool."],
        ["CPU-heavy endpoints", "Image resizing and PDF parsing are usually moved to worker pools or separate services, keeping the request loop free."],
      ],
      check: [
        ["Why can one `JSON.parse` hurt every user?", "It runs synchronously on the single event-loop thread, so nothing else runs until it finishes."],
        ["Which Node operations use the libuv thread pool?", "File system calls, `dns.lookup`, zlib and some crypto such as `pbkdf2` and `scrypt`."],
        ["How would you find what is blocking the loop?", "Measure loop delay, then take a CPU profile or flame graph during the stall and look for long synchronous frames."],
      ],
      tryIt: "Start a Node HTTP server with a `/stream` endpoint that writes a line every 20 ms and a `/parse` endpoint that parses a 50 MB JSON string. Hit `/stream` with curl, then call `/parse` and watch the stream pause. Move the parse into a worker and repeat.",
    },
    {
      slug: "io-models",
      title: "Readiness, completion and io_uring",
      summary: "How one thread waits on 10,000 sockets. Learn thread-per-connection, epoll's readiness model and io_uring's completion model, and why io_uring is often disabled.",
      level: "Depth",
      minutes: 17,
      blocks: [
        { kind: "p", text: "The oldest server design gives each connection its own thread that blocks in `read`. It is simple and works well for hundreds of connections. At 10,000 mostly idle connections, it means 10,000 stacks and a scheduler juggling 10,000 threads that are almost all asleep." },
        { kind: "figure", figure: "io-models", title: "Three ways to wait for I/O", caption: "Thread-per-connection blocks a thread per socket. Readiness APIs such as epoll tell one thread which sockets can be read now; the thread then reads them. Completion APIs such as io_uring take the read request and report when the data is already in your buffer." },
        { kind: "h", text: "Readiness: select, poll, epoll, kqueue" },
        { kind: "p", text: "`select` and `poll` take the full list of descriptors on every call and scan it, which is O(n) per wait. `epoll` on Linux and `kqueue` on BSD and macOS keep the interest list in the kernel and return only descriptors that are ready. The program then calls `read` itself. libuv, Go's netpoller, Tokio and nginx all sit on these." },
        { kind: "p", text: "**Level-triggered** notification repeats as long as data remains. **Edge-triggered** notification fires once when the state changes, so you must read until `EAGAIN` or you will never hear about the leftover bytes." },
        { kind: "h", text: "Completion: io_uring" },
        { kind: "p", text: "io_uring shares two ring buffers between your process and the kernel. You place requests such as read this socket into this buffer in the **submission queue**. The kernel performs them and posts results in the **completion queue**. Many operations can go in with one system call or none, and it works for files as well as sockets, which epoll never handled well." },
        { kind: "table", head: ["Model", "Answer to “what now?”", "Who does the read", "Examples"], rows: [["Blocking", "Block until done", "Your thread, sleeping", "Thread-per-connection servers"], ["Readiness", "This descriptor can be read now", "You, after the notification", "epoll, kqueue, libuv, Tokio"], ["Completion", "This read is done; here is the result", "The kernel", "io_uring, Windows IOCP"]] },
        { kind: "callout", tone: "now", title: "Where things stand: io_uring is fast, and often off", text: "seccomp filters inspect system calls, but operations inside a ring are not system calls, so allowing io_uring can bypass a sandbox. Google turned it off on production servers after a run of exploits; Docker removed it from the default seccomp allowlist; Node.js keeps it disabled by default. Task-level restrictions were in review for Linux 7.0 in January 2026." },
        { kind: "code", lang: "c", file: "epoll_loop.c", code: `int ep = epoll_create1(0);
struct epoll_event ev = { .events = EPOLLIN, .data.fd = listen_fd };
epoll_ctl(ep, EPOLL_CTL_ADD, listen_fd, &ev);

for (;;) {
  struct epoll_event ready[64];
  int n = epoll_wait(ep, ready, 64, -1);        // sleep until something is ready
  for (int i = 0; i < n; i++) {
    int fd = ready[i].data.fd;
    if (fd == listen_fd) add_client(ep, accept4(listen_fd, NULL, NULL, SOCK_NONBLOCK));
    else handle_readable(fd);                   // read until EAGAIN
  }
}
`, note: "This is the heart of every event loop. libuv wraps it with timers, a thread pool and cross-platform backends." },
      ],
      practice: [
        ["nginx and HAProxy", "A few worker processes, each with an epoll loop, serve hundreds of thousands of connections."],
        ["Long-lived streams", "SSE and WebSocket connections are mostly idle, so readiness-based servers hold them for kilobytes each instead of a thread each."],
        ["Storage engines", "Databases such as TigerBeetle and ScyllaDB can use io_uring for disk I/O on hosts they control, where the sandbox concern does not apply."],
      ],
      check: [
        ["What is the difference between readiness and completion I/O?", "epoll says you can act now and you do the read. io_uring says the read is done and the data is in your buffer."],
        ["Why does edge-triggered epoll require reading until EAGAIN?", "It notifies only on a change. Leftover data does not cause a new notification."],
        ["Why might a sandbox block io_uring?", "seccomp cannot inspect operations submitted through the rings, so io_uring can perform actions the filter meant to forbid."],
      ],
      tryIt: "Build a TCP echo server three ways: thread per connection, epoll, and io_uring with liburing. Hold 10,000 idle connections against each and compare resident memory.",
    },
    {
      slug: "littles-law-and-backpressure",
      title: "Little's Law and backpressure",
      summary: "One multiplication tells you how much the system holds open. Learn to size pools and queues with it, and what happens when producers outrun consumers.",
      level: "Depth",
      minutes: 15,
      blocks: [
        { kind: "p", text: "**Little's Law**: the average number of items in a system, L, equals the arrival rate, λ, times the average time each item spends inside, W. It holds for any stable system, whatever the distribution. It turns vague capacity questions into arithmetic." },
        { kind: "figure", figure: "littles-law", title: "Size an agent service", caption: "Set the arrival rate and run time. L = λ × W gives the runs held open. If that exceeds your concurrency limit, the excess queues and the queue grows every second until something fails. Memory per run turns L into a capacity plan." },
        { kind: "h", text: "Backpressure" },
        { kind: "p", text: "When a producer is faster than a consumer, the difference has to go somewhere. Without **backpressure**, it goes into a buffer that grows until memory runs out. With backpressure, the slow consumer's state propagates upstream and slows the producer down. TCP does this with its receive window; Node streams do it with the return value of `write`." },
        { kind: "code", lang: "ts", file: "backpressure.ts", code: `import { once } from "node:events";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

// Wrong: ignores backpressure. A slow client makes the buffer grow without limit.
for await (const token of modelStream) res.write(token);

// Right: wait for the socket to drain when write() returns false.
for await (const token of modelStream) {
  if (!res.write(token)) await once(res, "drain");
}

// Simplest: let pipeline() handle it, including errors and cleanup.
await pipeline(Readable.from(modelStream), res);
`, note: "`write` returning false means the internal buffer passed its highWaterMark. The data is still queued; you are being asked to pause." },
        { kind: "h", text: "Choose a policy for a full queue" },
        { kind: "table", head: ["Policy", "What happens", "Good for"], rows: [["Block the producer", "The caller waits for room", "Internal pipelines with a natural slow-down"], ["Reject new work", "Return 429 or 503 at once", "Public APIs; the client can retry elsewhere"], ["Drop oldest", "Discard stale items", "Live telemetry, progress updates"], ["Grow unbounded", "Memory rises until a crash", "Nothing. This is the default you must replace."]] },
        { kind: "callout", tone: "harness", title: "In a harness", text: "Model providers return 429 when you exceed rate limits. A harness that queues every retry in memory recreates the unbounded-buffer failure one layer up. Bound the queue and tell callers when you are full." },
      ],
      practice: [
        ["Connection pools", "If database queries take 20 ms and you serve 2,000 queries per second, L = 40 connections are busy on average. Size the pool above that, with headroom for variance."],
        ["Rate limits", "At 600 open runs each making one model call every 5 seconds, you send 120 calls per second. Compare that to your provider tier before launch."],
        ["Kafka consumers", "Consumer lag is the queue in Little's Law. If it grows steadily, arrival exceeds processing and no buffer size will save you."],
      ],
      check: [
        ["At 20 runs per second and 30 seconds per run, how many runs are open?", "600, from L = λW = 20 × 30."],
        ["What happens when you ignore `res.write()` returning false?", "Data keeps queuing in memory for the slow client until the process runs out of memory."],
        ["Why is an unbounded queue never a real policy?", "When arrival exceeds service rate, it grows without limit and eventually crashes, just later and with more lost work."],
      ],
      tryIt: "Stream 10 MB of tokens to a client that reads 1 KB per second, with and without honouring `drain`. Watch `process.memoryUsage().external` in each case.",
    },
    {
      slug: "cancellation-and-structured-concurrency",
      title: "Cancellation, bounded parallelism and structured concurrency",
      summary: "Start work so that it can always be stopped and never outlives its owner. Then see how Go and Tokio schedule millions of tasks, and what Amdahl's Law says about speedups.",
      level: "Current",
      minutes: 18,
      blocks: [
        { kind: "p", text: "When a user closes a chat tab, the model call, the tools it started and their child processes should all stop. In JavaScript, **AbortController** carries that intent: pass its `signal` down to `fetch`, to streams, to your own functions and to `run_command`, and abort it once." },
        { kind: "h", text: "Structured concurrency" },
        { kind: "p", text: "Nathaniel Smith's 2018 essay argued that spawning a task should look like calling a function: the parent waits for every child, and errors and cancellation flow along that tree. Nothing outlives the scope that started it. Python's `TaskGroup`, Kotlin's coroutine scopes, Java's structured task scopes and Swift's task groups all follow this idea. In JavaScript you build it from AbortSignal plus `Promise.all`." },
        { kind: "code", lang: "ts", file: "bounded-pool.ts", code: `/** Run tool calls with at most \`limit\` in flight. One failure or abort cancels the rest. */
export async function runBounded<T>(
  jobs: ((signal: AbortSignal) => Promise<T>)[],
  limit: number,
  parent: AbortSignal,
): Promise<T[]> {
  const controller = new AbortController();
  const signal = AbortSignal.any([parent, controller.signal]);
  const results = new Array<T>(jobs.length);
  let next = 0;

  async function worker() {
    while (next < jobs.length && !signal.aborted) {
      const index = next++;
      try { results[index] = await jobs[index](signal); }
      catch (error) { controller.abort(error); throw error; }   // cancel siblings
    }
  }

  // The scope waits for every worker; nothing outlives this call.
  await Promise.all(Array.from({ length: Math.min(limit, jobs.length) }, worker));
  signal.throwIfAborted();
  return results;
}

// Usage: per-call timeout plus user cancellation
const signal = AbortSignal.any([userAbort.signal, AbortSignal.timeout(60_000)]);
`, note: "`AbortSignal.any` and `AbortSignal.timeout` are built into Node 20+ and modern browsers." },
        { kind: "h", text: "How other runtimes schedule tasks" },
        { kind: "table", head: ["Runtime", "Model", "What it means for you"], rows: [["Node.js", "One JS thread, event loop, thread pool for some I/O", "Never block; move CPU work to workers"], ["Go", "M:N: many goroutines on few OS threads, with work stealing", "Blocking calls are fine; the runtime parks the goroutine"], ["Rust Tokio", "Work-stealing thread pool running futures", "Never block inside async; use `spawn_blocking`"], ["Python asyncio", "One thread, event loop; the GIL limits CPU parallelism", "Use processes or free-threaded builds for CPU work"]] },
        { kind: "h", text: "Amdahl's Law" },
        { kind: "p", text: "If a fraction p of the work can run in parallel on n workers, the best speedup is 1 / ((1 − p) + p / n). With p = 0.9, eight workers give at most 4.7x, and infinite workers give at most 10x. The serial part sets the ceiling. In an agent turn, the model call is the serial part; parallel tools only shrink the rest." },
        { kind: "callout", tone: "now", title: "Where things stand in late 2026", text: "Cancellation is a first-class protocol concern. Closing a provider stream promptly usually stops generation, saving output tokens as well as time, and long agent work increasingly runs as tasks with handles that can be polled or cancelled, rather than as one open connection." },
      ],
      practice: [
        ["Stop buttons", "When a user presses stop in a chat UI, the server aborts the provider stream, cancels pending tool calls and kills their process groups."],
        ["Fan-out search", "Agents that query many sources limit parallelism to stay under rate limits and cancel the stragglers once enough results arrive."],
        ["Hedged requests", "Send a second request if the first is slow, take whichever returns first, and cancel the other (Module 10)."],
      ],
      check: [
        ["What does structured concurrency guarantee?", "No task outlives the scope that started it. Errors and cancellation propagate through the tree of tasks."],
        ["With 90% parallel work, what is the maximum speedup from 8 workers?", "1 / (0.1 + 0.9 / 8) ≈ 4.7x."],
        ["Why bound tool-call parallelism?", "Rate limits, memory and downstream capacity are finite. An unbounded fan-out turns one request into a spike."],
      ],
      tryIt: "Use `runBounded` to fetch 50 URLs with a limit of 5. Abort the parent after 2 seconds and verify, with logs, that no request starts afterwards and every in-flight fetch rejects with an AbortError.",
    },
  ],
  lab: [
    "Build a TCP echo server three ways: one thread per connection, epoll, and io_uring.",
    "Hold 10,000 idle connections and compare memory.",
    "Write a bounded-concurrency queue for tool calls, with cancellation and a full-queue policy.",
  ],
  interview: [
    ["Why can one `JSON.parse` hurt every user?", "Show the single-threaded event loop: nothing else runs until it returns."],
    ["What is the difference between readiness and completion I/O?", "epoll says you can act now; io_uring says it is done."],
    ["What happens when you ignore `res.write()` returning false?", "Buffers grow until memory runs out."],
  ],
  reading: [
    "The libuv design overview",
    "Node.js guide: the event loop, timers and process.nextTick",
    "Efficient IO with io_uring, Jens Axboe",
    "Notes on structured concurrency, Nathaniel Smith",
  ],
};
