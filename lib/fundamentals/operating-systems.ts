import type { CourseModule } from "./types";

export const operatingSystems: CourseModule = {
  number: 2,
  slug: "operating-systems",
  title: "Operating systems",
  shortTitle: "Operating systems",
  tagline: "Every agent harness is a process supervisor. Most flaky shell tools come from misunderstanding pipes, process groups and terminals.",
  intuition: "A process is a private address space plus a table of file descriptors. The kernel is the only way to touch anything outside it, and each crossing is a system call. Once you can see the system calls, most mysterious behaviour stops being mysterious.",
  harness: "When a model runs `npm test` through your shell tool, your harness becomes the parent process. Whether the tool returns, hangs or leaves stray servers running depends entirely on how it creates, reads from and kills children.",
  levels: {
    Basics: ["Processes and threads", "fork and exec", "System calls", "File descriptors", "Pipes", "Signals", "Exit codes", "Environment variables"],
    Depth: ["Virtual memory and page faults", "mmap and the page cache", "Copy-on-write", "Scheduling", "PTYs", "Sessions and process groups", "Zombies and orphans", "PID 1 in containers", "The OOM killer"],
    Current: ["EEVDF scheduler (Linux 6.6+)", "sched_ext (Linux 6.12+)", "pidfd against PID reuse", "Landlock for unprivileged sandboxing"],
  },
  timeline: [
    ["1969", "Unix", "Ken Thompson and Dennis Ritchie build a small OS around processes, files and a shell."],
    ["1973", "Pipes", "Doug McIlroy's pipes arrive in Unix, and small tools start composing with `|`."],
    ["1988", "POSIX.1", "Process groups, sessions and signals get one portable specification."],
    ["2008", "cgroups", "Linux can account and limit CPU and memory per group of processes. Containers follow."],
    ["2019", "pidfd", "A file descriptor that refers to one process, closing the PID reuse race."],
    ["2021", "Landlock", "Unprivileged processes can sandbox their own file access (Linux 5.13)."],
    ["2024", "sched_ext", "Schedulers written as BPF programs load at runtime (Linux 6.12), after EEVDF replaced CFS in 6.6."],
  ],
  lessons: [
    {
      slug: "processes-and-syscalls",
      title: "Processes and system calls",
      summary: "A process is an address space, a set of open files and a thread or more of execution. The kernel boundary is where every outside effect happens.",
      level: "Basics",
      minutes: 14,
      blocks: [
        { kind: "p", text: "When you run a program, the kernel creates a **process**: a private virtual address space holding code, data, heap and stack; a table of **file descriptors**; credentials such as user ID; and one or more **threads** that execute instructions. Threads in one process share memory and descriptors. Separate processes share nothing unless they set it up explicitly." },
        { kind: "figure", figure: "process-anatomy", title: "What a process owns", caption: "The address space is private memory. File descriptors are small integers that index into kernel objects: terminals, pipes, files and sockets. Every arrow that crosses the dashed kernel boundary is a system call." },
        { kind: "h", text: "File descriptors: everything is a number" },
        { kind: "p", text: "Descriptors 0, 1 and 2 are stdin, stdout and stderr by convention. `open`, `socket` and `pipe` hand out the lowest free number. A descriptor is a reference to a kernel object, and several descriptors in several processes can refer to the same object. That sharing is how pipes connect programs, and, as you will see, how pipes fail to close." },
        { kind: "h", text: "System calls" },
        { kind: "p", text: "User code cannot touch hardware. To read a file, it calls `read(fd, buf, n)`, which switches the CPU into kernel mode, does the work, and returns. A system call costs from about a hundred nanoseconds to microseconds, which is why buffered I/O exists: one `write` of 64 KB beats 65,536 writes of one byte." },
        { kind: "code", lang: "bash", file: "watch-syscalls.sh", code: `# Every system call 'cat' makes, with arguments and results
strace -f -e trace=openat,read,write,close cat /etc/hostname

# On macOS, the closest equivalent needs SIP adjustments:
# sudo dtruss -f cat /etc/hostname

# List a running process's open descriptors
ls -l /proc/$PID/fd        # Linux
lsof -p $PID               # Linux and macOS
`, note: "`strace -f` follows children too, which is what you want when debugging a shell tool." },
        { kind: "callout", tone: "harness", title: "In a harness", text: "The harness's process boundary is its safety boundary. A tool that runs in-process can corrupt the harness's memory or block its event loop. A tool that runs as a child process can only affect the harness through descriptors and signals you chose to share." },
      ],
      practice: [
        ["Coding agents", "Claude Code, Codex and similar tools run shell commands as child processes and stream their stdout and stderr back to the model."],
        ["Descriptor leaks", "A server that opens files or sockets without closing them hits `EMFILE: too many open files` at the `ulimit -n` limit, often 1,024 by default."],
        ["Debugging hangs", "`strace -p PID` on a stuck process shows the exact system call it is blocked in, usually `read`, `write`, `wait4` or `futex`."],
      ],
      check: [
        ["What do threads in one process share that separate processes do not?", "The address space and the file descriptor table."],
        ["Why is writing one byte at a time slow?", "Each `write` is a system call with fixed overhead. Buffering amortises it over many bytes."],
        ["What is file descriptor 2?", "stderr, by convention."],
      ],
      tryIt: "Run `strace -f -c node -e 'require(\"fs\").readFileSync(\"/etc/hosts\")'` on Linux. The `-c` summary counts every system call Node makes just to start and read one file.",
    },
    {
      slug: "fork-exec-exit",
      title: "fork, exec, exit codes and environment",
      summary: "Unix creates a process in two steps: copy yourself, then replace the copy with a new program. Learn the steps, and what the exit status really carries.",
      level: "Basics",
      minutes: 13,
      blocks: [
        { kind: "p", text: "`fork()` creates a child that is a near-copy of the parent: same memory contents, same open descriptors, same environment. It returns twice, once in each process. `execve()` then replaces the child's program with a new one while **keeping its open descriptors**. Between the two, the child can rearrange descriptors, change directory or drop privileges. That gap is how a shell sets up redirections and pipes." },
        { kind: "figure", figure: "fork-exec", title: "From one process to a running command", caption: "The harness forks, the child sets up stdout as a pipe and execs bash, and bash eventually exits. The parent collects the exit status with `waitpid`. Until it does, the dead child lingers as a zombie." },
        { kind: "h", text: "Exit codes" },
        { kind: "p", text: "A process exits with a status from 0 to 255. Zero means success; anything else is failure by convention. If a signal kills the process, there is no exit code. The parent sees the signal number instead, and shells report it as 128 plus the signal: 137 is SIGKILL, often from the OOM killer, and 143 is SIGTERM." },
        { kind: "table", head: ["Status", "Usually means"], rows: [["0", "Success"], ["1", "General failure"], ["2", "Misuse of a shell builtin or bad arguments"], ["126", "Found but not executable"], ["127", "Command not found"], ["130", "Interrupted by SIGINT (Ctrl-C)"], ["137", "Killed by SIGKILL, often out of memory"], ["143", "Terminated by SIGTERM"]] },
        { kind: "h", text: "Environment variables" },
        { kind: "p", text: "The environment is a list of `KEY=value` strings copied into each child at exec time. Changing it later in the parent does not affect running children. Children inherit secrets too: if the harness has `GITHUB_TOKEN` in its environment, every command the model runs can read it unless you pass an explicit, filtered environment." },
        { kind: "code", lang: "ts", file: "spawn.ts", code: `import { spawn } from "node:child_process";

const SAFE_ENV = ["PATH", "HOME", "LANG", "TERM"];

const child = spawn("bash", ["-lc", command], {
  cwd: workspace,
  // Pass an allowlist, never process.env wholesale
  env: Object.fromEntries(SAFE_ENV.map((k) => [k, process.env[k] ?? ""])),
  stdio: ["ignore", "pipe", "pipe"],
});

child.on("exit", (code, signal) => {
  // Exactly one of these is non-null
  report(signal ? \`killed by \${signal}\` : \`exited with \${code}\`);
});
`, note: "Node's `exit` event gives `code` or `signal`. Report both, and the model can tell a test failure from an OOM kill." },
      ],
      practice: [
        ["OOM kills in CI", "A job that ends with status 137 and no error message was usually killed by the kernel or the container runtime for exceeding its memory limit."],
        ["Secret leakage", "Agent harnesses strip tokens from child environments and inject credentials through a proxy instead (Module 12)."],
        ["posix_spawn", "Modern runtimes often use `posix_spawn` or `vfork` instead of `fork` so a large parent does not pay to copy its page tables."],
      ],
      check: [
        ["What survives an `execve` call?", "The PID, open descriptors not marked close-on-exec, the working directory and credentials. Memory and code are replaced."],
        ["A command exits with 137. What happened?", "It received SIGKILL (128 + 9), commonly from the OOM killer or a hard timeout."],
        ["Why pass an explicit environment to model-run commands?", "Children inherit the whole environment, including any secrets the harness holds."],
      ],
      tryIt: "Run `bash -c 'sleep 30' & sleep 1; kill -TERM $!; wait $!; echo $?`. Then repeat with `kill -KILL`. Explain both numbers.",
    },
    {
      slug: "pipes-and-buffers",
      title: "Pipes, buffers and EOF",
      summary: "A pipe is a small kernel buffer with a reader and a writer. When nobody reads, the writer blocks. When anybody still holds the write end, the reader never sees EOF.",
      level: "Basics",
      minutes: 15,
      blocks: [
        { kind: "p", text: "`pipe()` returns two descriptors: a read end and a write end. Bytes written to one come out of the other, in order. Between them sits a kernel buffer, **64 KiB by default on Linux**. When it fills, `write` blocks until a reader makes room. When it is empty, `read` blocks until a writer adds bytes or every write end is closed, which the reader sees as **EOF**, a read that returns 0." },
        { kind: "figure", figure: "pipe-buffer", title: "Fill a pipe until the writer blocks", caption: "The child has 160 KiB of output. With the harness reading, the buffer stays nearly empty. Stop reading and the buffer fills at 64 KiB; the child then blocks inside `write` and never exits, while a harness that is waiting for exit waits forever." },
        { kind: "h", text: "Hang 1: the full pipe" },
        { kind: "p", text: "A classic deadlock: the harness waits for the child to exit and only then reads its output. The child produces more than 64 KiB, blocks in `write`, and never exits. Neither side moves. The fix is to read stdout and stderr **continuously** while the child runs, even if you only keep the first part." },
        { kind: "h", text: "Hang 2: EOF never arrives" },
        { kind: "p", text: "EOF arrives only when **every** descriptor for the write end is closed. Suppose the model runs `npm run dev &` and the main command exits. The background server inherited stdout, so it still holds the write end. The harness reads forever, waiting for an EOF that comes only when the server dies. Listen for process exit as well as stream end, and decide what to do with descendants that outlive their parent." },
        { kind: "code", lang: "ts", file: "collect.ts", code: `const MAX = 256 * 1024;                     // keep at most 256 KiB
let kept: Buffer[] = [], keptBytes = 0, totalBytes = 0;

child.stdout.on("data", (chunk: Buffer) => {
  totalBytes += chunk.length;              // always drain the pipe
  if (keptBytes < MAX) {
    const slice = chunk.subarray(0, MAX - keptBytes);
    kept.push(slice); keptBytes += slice.length;
  }
});

// 'exit' fires when the process ends; 'close' waits for all stdio to end.
// A background grandchild can delay 'close' forever.
child.on("exit", () => setTimeout(() => child.stdout.destroy(), 500));
`, note: "Draining and keeping are separate decisions. Always drain; keep only what you will use." },
        { kind: "callout", tone: "trap", title: "stderr fills too", text: "If you read stdout but ignore stderr, a noisy compiler can fill the stderr pipe and block just the same. Drain both, or merge them into one pipe when order matters more than separation." },
      ],
      practice: [
        ["Python's `subprocess`", "The documentation warns that `wait()` with `stdout=PIPE` can deadlock on large output, and recommends `communicate()`, which reads both pipes while waiting."],
        ["Shell pipelines", "In `producer | head -1`, `head` exits after one line. The producer's next write fails with SIGPIPE, which is how pipelines stop early."],
        ["Agent shell tools", "Production tools stream output to the model in chunks and cap what they keep, while draining everything so the child can finish."],
      ],
      check: [
        ["Why does a child hang when the harness reads only after exit?", "Its output fills the 64 KiB pipe buffer, `write` blocks, and the child cannot exit."],
        ["The main command exited but the read never ends. Why?", "A background descendant inherited the write end of the pipe and still holds it open, so EOF never arrives."],
        ["What happens when a process writes to a pipe whose readers have all closed?", "It receives SIGPIPE, which terminates it by default, or `write` fails with EPIPE if the signal is ignored."],
      ],
      tryIt: "Write a tiny harness that spawns `yes | head -c 200000` and calls `waitpid` before reading. Watch it hang with `strace -p`. Then fix it by reading while waiting.",
    },
    {
      slug: "signals-and-process-groups",
      title: "Signals, process groups and orphans",
      summary: "Killing a command means killing its whole tree. Learn process groups and sessions, why zombies appear, and what changes when your harness is PID 1.",
      level: "Depth",
      minutes: 17,
      blocks: [
        { kind: "p", text: "A **signal** is an asynchronous notification from the kernel. SIGTERM politely asks a process to exit and can be caught. SIGKILL cannot be caught or ignored. SIGINT is Ctrl-C. SIGCHLD tells a parent that a child changed state. SIGPIPE means the reader went away." },
        { kind: "h", text: "Process groups and sessions" },
        { kind: "p", text: "Every process belongs to a **process group**, and every group belongs to a **session**. A shell puts each pipeline in its own group so Ctrl-C reaches every process in it. `kill(-pgid, SIGTERM)`, with a negative number, signals a whole group. A child started normally stays in its parent's group. A child started with `setsid()` leads a brand-new session and group." },
        { kind: "figure", figure: "process-tree-kill", title: "Kill the child, or kill the tree", caption: "`npm test` starts node, which starts a watcher in the background. Signalling only the bash PID leaves the rest running and the pipe open. Start the child in its own session, then signal the negative group ID." },
        { kind: "h", text: "Zombies and orphans" },
        { kind: "p", text: "When a process exits, the kernel keeps a small record holding its exit status until the parent calls `wait`. A dead process waiting to be reaped is a **zombie**. If the parent dies first, the children become **orphans** and are re-parented to PID 1 or a designated subreaper, which is expected to reap them." },
        { kind: "h", text: "PID 1 in containers" },
        { kind: "p", text: "Inside a container, your app may run as PID 1, and PID 1 is special. The kernel does not apply default signal actions to it, so SIGTERM does nothing unless the program installs a handler, and `docker stop` waits ten seconds and then sends SIGKILL. PID 1 must also reap orphans, or zombies pile up. Use a tiny init such as `tini` or `docker run --init`." },
        { kind: "code", lang: "ts", file: "kill-tree.ts", code: `import { spawn } from "node:child_process";

const child = spawn("bash", ["-lc", command], {
  detached: true,                  // setsid(): new session and process group
  stdio: ["ignore", "pipe", "pipe"],
});

function killTree(signal: NodeJS.Signals) {
  try { process.kill(-child.pid!, signal); }   // negative PID = whole group
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error; }
}

const timer = setTimeout(() => {
  killTree("SIGTERM");                         // ask nicely
  setTimeout(() => killTree("SIGKILL"), 2000); // then insist
}, timeoutMs);
child.on("exit", () => clearTimeout(timer));
`, note: "A process can still escape with its own `setsid`. Linux cgroups catch everything: `cgroup.kill` ends every process in a cgroup at once." },
      ],
      practice: [
        ["Test runners", "Jest, Vitest and Playwright spawn worker processes. A timeout that kills only the runner leaves workers holding ports and files."],
        ["systemd", "systemd places each service in its own cgroup and stops the cgroup, which is why stray children of a service do not survive a restart."],
        ["Container init", "Kubernetes sends SIGTERM to PID 1, waits for the grace period, then sends SIGKILL. Apps that ignore SIGTERM lose in-flight work every deploy."],
      ],
      check: [
        ["Your timeout sends SIGTERM to the child, yet its children keep running. Why?", "The signal went to one PID. Start the child in a new session and signal the negative process group ID."],
        ["What is a zombie?", "A process that has exited but whose parent has not yet collected its status with `wait`."],
        ["What goes wrong when your app runs as PID 1 in a container?", "Default signal actions do not apply, so SIGTERM is ignored without a handler, and orphaned zombies are not reaped."],
      ],
      tryIt: "Run `bash -c 'sleep 300 & sleep 300'` from a Node script, kill only its PID, then run `ps -o pid,ppid,pgid,cmd -e | grep sleep`. Repeat with `detached: true` and a negative-PID kill.",
    },
    {
      slug: "terminals-and-ptys",
      title: "Terminals, PTYs and isatty",
      summary: "Programs behave differently when they think a person is watching. Learn what a pseudo-terminal is, and why `git log` hangs in one harness and not another.",
      level: "Depth",
      minutes: 13,
      blocks: [
        { kind: "p", text: "Programs ask `isatty(fd)` to learn whether a descriptor is a terminal. If stdout is a terminal, they assume a person is reading: they add colour codes, line-buffer output, show progress bars and open a pager for long output. If stdout is a pipe, they assume another program is reading: plain text, block buffering, no prompts." },
        { kind: "figure", figure: "pipe-vs-pty", title: "Same command, two kinds of stdout", caption: "Through a pipe, `git log` writes plain text and exits. Through a PTY, it sees a terminal, adds colour and opens `less`, which waits for a keypress that never comes." },
        { kind: "h", text: "What a PTY is" },
        { kind: "p", text: "A **pseudo-terminal** is a pair of devices. The program sees the follower side, which behaves like a real terminal. The harness holds the leader side and plays the role of the keyboard and screen. Line discipline in the kernel handles echo, Ctrl-C and window size between them. Terminal emulators, SSH and tmux are all built on PTYs." },
        { kind: "h", text: "Pipe or PTY for an agent tool?" },
        { kind: "table", head: ["", "Pipe", "PTY"], rows: [["Output", "Plain text, easier to parse", "ANSI escape codes to strip"], ["Pagers and prompts", "Usually off", "On: may wait for input forever"], ["Buffering", "Block-buffered, arrives in bursts", "Line-buffered, arrives live"], ["stdout and stderr", "Separate", "Merged into one stream"], ["Needed for", "Most commands", "Interactive programs, REPLs, TUIs"]] },
        { kind: "p", text: "Most harnesses default to pipes and set environment variables that suppress interactive behaviour. Offer a PTY only for tools that genuinely need a terminal, and then give the model a way to send keystrokes and a timeout." },
        { kind: "code", lang: "ts", file: "noninteractive-env.ts", code: `export const NONINTERACTIVE_ENV = {
  CI: "1",                    // many tools disable prompts and spinners
  PAGER: "cat",
  GIT_PAGER: "cat",
  GIT_TERMINAL_PROMPT: "0",   // fail instead of asking for credentials
  NO_COLOR: "1",
  TERM: "dumb",
  DEBIAN_FRONTEND: "noninteractive",
  PIP_NO_INPUT: "1",
};
// And give stdin nothing to wait for:
// spawn(cmd, { stdio: ["ignore", "pipe", "pipe"], env: { ...safeEnv, ...NONINTERACTIVE_ENV } })
`, note: "With stdin set to `ignore`, a program that reads input gets EOF immediately instead of waiting forever." },
      ],
      practice: [
        ["Hanging installers", "`apt-get install` without `-y` waits on a prompt. Under a pipe with stdin open, the agent's tool simply hangs until its timeout."],
        ["Python buffering", "Python block-buffers stdout when it is a pipe, so logs appear in bursts. `PYTHONUNBUFFERED=1` or `python -u` streams them live."],
        ["Terminal tools", "VS Code's terminal and agent terminals use node-pty to give commands a real PTY, then render the escape codes."],
      ],
      check: [
        ["Why does the same command print differently under a harness?", "It calls `isatty` on stdout. A pipe is not a terminal, so it disables colour, paging and line buffering."],
        ["Why might `git log` hang a PTY-based tool?", "It detects a terminal, opens a pager, and the pager waits for keyboard input."],
        ["What does setting stdin to `ignore` achieve?", "Reads from stdin return EOF at once, so prompts fail fast instead of blocking."],
      ],
      tryIt: "Run `ls --color=auto | cat` and `ls --color=auto` and compare. Then run `python3 -c 'import sys; print(sys.stdout.isatty())'` both directly and piped through `cat`.",
    },
    {
      slug: "virtual-memory",
      title: "Virtual memory, page faults and the OOM killer",
      summary: "Every process sees its own clean address space. Behind it, the kernel maps pages lazily, shares them when it can, and kills someone when it runs out.",
      level: "Depth",
      minutes: 16,
      blocks: [
        { kind: "p", text: "Addresses in a process are **virtual**. The kernel divides memory into pages, usually 4 KiB, and keeps a page table per process mapping virtual pages to physical frames. Two processes can use the same virtual address for different data, and the same physical frame can appear in several processes, such as a shared library." },
        { kind: "figure", figure: "virtual-memory", title: "Two processes, one pool of physical memory", caption: "Each process has its own page table. Shared library code maps to one frame. After `fork`, parent and child share pages marked copy-on-write until one of them writes. Pages never touched have no frame at all." },
        { kind: "h", text: "Page faults" },
        { kind: "p", text: "Memory is allocated lazily. `malloc` of 1 GB reserves address space; frames arrive only on first touch. That first touch causes a **minor page fault**, which the kernel handles in microseconds. A **major fault** needs disk, for a page of a memory-mapped file that is not in RAM or a page in swap, and costs far more." },
        { kind: "h", text: "mmap and the page cache" },
        { kind: "p", text: "The kernel keeps recently used file data in the **page cache**. `read` copies from the page cache into your buffer. `mmap` maps the file's cached pages straight into your address space, so reading memory reads the file. The second time you read a file, it usually comes from RAM, which is why benchmarks must say whether the cache was warm." },
        { kind: "h", text: "Copy-on-write" },
        { kind: "p", text: "`fork` does not copy memory. Parent and child share every page, marked read-only. The first write to a page faults, and the kernel copies just that page. This makes fork cheap for small processes. For a parent with a large heap it still costs page-table copying, and heavy writes after forking can double memory, as Redis snapshots famously show." },
        { kind: "h", text: "The OOM killer" },
        { kind: "p", text: "Linux overcommits: it grants more virtual memory than it has. When physical memory and swap run out, the **OOM killer** picks a victim by a score based mainly on memory use and sends SIGKILL. Inside a container, the cgroup memory limit triggers the same thing for that cgroup only. The victim gets no warning and writes no error message, only exit status 137." },
        { kind: "code", lang: "bash", file: "inspect-memory.sh", code: `# Resident vs virtual size of a process
ps -o pid,rss,vsz,cmd -p $PID

# Minor and major page faults so far
ps -o min_flt,maj_flt -p $PID

# Recent OOM kills
dmesg | grep -i 'killed process'

# Inside a container (cgroup v2)
cat /sys/fs/cgroup/memory.max /sys/fs/cgroup/memory.events
`, note: "`memory.events` counts `oom_kill` events for the cgroup, which confirms a silent 137." },
      ],
      practice: [
        ["Database caches", "Postgres relies on the OS page cache in addition to its own buffers, which is why it is configured to use only part of RAM directly."],
        ["Sandbox snapshots", "MicroVM platforms restore snapshots with copy-on-write memory, so many sandboxes can start from one image in milliseconds (Module 12)."],
        ["Language runtimes", "Node's `--max-old-space-size` limits the V8 heap. Set it below the container limit, or the kernel kills the process before V8 can report an error."],
      ],
      check: [
        ["Why does `malloc(1 GB)` succeed instantly on a machine with little free memory?", "It only reserves virtual address space. Physical frames are allocated on first touch."],
        ["What is copy-on-write?", "After fork, pages are shared read-only, and a page is copied only when one process writes to it."],
        ["A container process vanished with status 137 and no log. Where do you look?", "`memory.events` for the cgroup and the kernel log for an OOM kill."],
      ],
      tryIt: "Allocate a 500 MB `Buffer.allocUnsafe` in Node and check RSS with `ps`. Then fill it with `buf.fill(1)` and check again.",
    },
    {
      slug: "hardened-run-command",
      title: "Build a run_command tool that cannot hang",
      summary: "Put the module together into the tool every coding agent needs, then see what Linux added in recent years to make it safer: pidfd, Landlock, EEVDF and sched_ext.",
      level: "Current",
      minutes: 20,
      blocks: [
        { kind: "p", text: "Here are the four ways an agent's shell tool hangs, all from this module. A complete `run_command` has to handle each one." },
        { kind: "steps", items: [
          ["The pipe is full", "The child wrote more than 64 KiB and the harness is not reading. Always drain stdout and stderr while the child runs."],
          ["It waits for input", "The child reads stdin or opens a pager because it detected a terminal. Use pipes, close stdin, and set the noninteractive environment."],
          ["A grandchild holds the pipe", "The main command exited, but a background process inherited stdout, so EOF never arrives. Watch for process exit, then close the streams."],
          ["The timeout misses children", "SIGTERM reached only the child. Start it in a new session and signal the whole process group, then escalate to SIGKILL."],
        ] },
        { kind: "code", lang: "ts", file: "run-command.ts", code: `import { spawn } from "node:child_process";
import { NONINTERACTIVE_ENV } from "./noninteractive-env";

type Result = { exit: number | null; signal: string | null; output: string; truncated: boolean; timedOut: boolean };

export function runCommand(command: string, opts: { cwd: string; timeoutMs: number; maxBytes: number; signal?: AbortSignal }): Promise<Result> {
  return new Promise((resolve) => {
    const child = spawn("bash", ["-c", command], {
      cwd: opts.cwd,
      detached: true,                                  // own process group
      stdio: ["ignore", "pipe", "pipe"],               // no stdin to wait on
      env: { PATH: process.env.PATH ?? "", HOME: opts.cwd, ...NONINTERACTIVE_ENV },
    });
    const chunks: Buffer[] = []; let kept = 0, total = 0, timedOut = false;

    const collect = (chunk: Buffer) => {               // drain both pipes, keep a prefix
      total += chunk.length;
      if (kept < opts.maxBytes) { const part = chunk.subarray(0, opts.maxBytes - kept); chunks.push(part); kept += part.length; }
    };
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);

    const killTree = (sig: NodeJS.Signals) => { try { process.kill(-child.pid!, sig); } catch {} };
    const stop = () => { killTree("SIGTERM"); setTimeout(() => killTree("SIGKILL"), 2000).unref(); };
    const timer = setTimeout(() => { timedOut = true; stop(); }, opts.timeoutMs);
    opts.signal?.addEventListener("abort", stop, { once: true });

    child.on("exit", () => {
      clearTimeout(timer);
      killTree("SIGKILL");                             // end background leftovers
      setTimeout(() => { child.stdout.destroy(); child.stderr.destroy(); }, 500).unref();
    });
    child.on("close", (exit, signal) => {              // all pipes closed or destroyed
      resolve({ exit, signal, output: Buffer.concat(chunks).toString("utf8"), truncated: total > kept, timedOut });
    });
  });
}
`, note: "Whether to kill background leftovers is a policy choice. A harness that supports `npm run dev &` needs a separate long-running process tool instead." },
        { kind: "p", text: "Decoding `Buffer.concat(chunks)` can still split the last character at the byte cap. Reuse the UTF-8-safe truncation from Module 1, and tell the model how many bytes were dropped." },
        { kind: "h", text: "What recent kernels add" },
        { kind: "table", head: ["Feature", "Since", "Why a harness cares"], rows: [["pidfd", "Linux 5.3 (2019)", "A descriptor for one process. PIDs are reused; signalling a stale PID can hit an unrelated process. `pidfd_send_signal` cannot."], ["cgroup.kill", "Linux 5.14 (2021)", "Kill every process in a cgroup at once, including ones that escaped the process group with their own setsid."], ["Landlock", "Linux 5.13 (2021)", "An unprivileged process can restrict its own and its children's file access, for example to the workspace only."], ["EEVDF", "Linux 6.6 (2023)", "Replaced CFS as the default scheduler. It orders tasks by virtual deadlines, and a task can ask for shorter slices to get lower latency."], ["sched_ext", "Linux 6.12 (2024)", "Load scheduling policies as BPF programs, so fleets can tune scheduling without a kernel rebuild."]] },
        { kind: "callout", tone: "now", title: "Where things stand in late 2026", text: "Local coding agents sandbox shell commands with OS features rather than containers: Codex uses Seatbelt on macOS and Landlock plus seccomp on Linux. A seccomp policy must block io_uring setup, because seccomp cannot see operations inside a ring (Module 3)." },
      ],
      practice: [
        ["Codex and Claude Code", "Both run model-issued commands through a sandboxed runner with timeouts, output caps and process-tree cleanup."],
        ["systemd-run", "`systemd-run --scope -p MemoryMax=2G cmd` places a command in its own cgroup with a memory limit, giving whole-tree kill for free."],
        ["Bubblewrap", "Flatpak's `bwrap` builds unprivileged namespaces for one command, a light alternative to a container runtime."],
      ],
      check: [
        ["Your agent's shell tool hangs sometimes. Walk through the causes.", "A full pipe nobody drains; a child waiting on stdin or a pager; a grandchild holding the pipe open; a timeout that signals only the child."],
        ["Why use a pidfd instead of a PID?", "PIDs are recycled. A pidfd refers to exactly one process, so a late signal cannot hit a new process with the same number."],
        ["How do you kill descendants that called setsid themselves?", "Put the command in its own cgroup and write to `cgroup.kill`, or kill the cgroup with systemd."],
      ],
      tryIt: "Build the tool above, then attack it with `yes`, `cat`, `git log` with a PTY, `sleep 1000 &`, and `bash -c 'setsid sleep 1000 &'`. Watch each with `strace -f` and note which control stopped it.",
    },
  ],
  lab: [
    "Write a small shell that supports pipes.",
    "Write a `run_command` tool with streamed stdout and stderr, a timeout, whole-tree kill, an output cap and an optional PTY.",
    "Use `strace -f` to watch what it really does.",
  ],
  interview: [
    ["Your agent's shell tool hangs sometimes. Walk me through the causes.", "Full pipe, stdin or pager wait, a grandchild holding stdout, and a timeout that signals only the child."],
    ["Why does the same command print differently under a harness?", "Programs call `isatty` and change colour, paging and buffering when stdout is a pipe."],
    ["What goes wrong when your app runs as PID 1 in a container?", "Signal defaults differ, so SIGTERM may be ignored, and zombies are not reaped."],
  ],
  reading: [
    "Operating Systems: Three Easy Pieces (free online)",
    "The Linux Programming Interface, Michael Kerrisk",
    "Man pages: pipe(7), pty(7), signal(7) and credentials(7)",
  ],
};
