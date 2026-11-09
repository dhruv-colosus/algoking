/* Static illustrations for Module 2. */

const arrow = (id: string) => <defs><marker id={id} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 8 4 0 8z" className="fx-arrow-head" /></marker></defs>;

export function ProcessAnatomy() {
  const segments: [string, number, string][] = [["Stack ↓", 34, "is-stack"], ["", 26, "is-free"], ["Shared libs · mmap", 30, "is-map"], ["", 26, "is-free"], ["Heap ↑", 34, "is-heap"], ["Data", 26, "is-data"], ["Code", 30, "is-code"]];
  let y = 62;
  const fds: [string, string, number][] = [["0", "stdin", 0], ["1", "stdout", 1], ["2", "stderr", 1], ["3", "socket", 2], ["4", "file", 3]];
  const objects: [string, string][] = [["Terminal", "/dev/pts/3"], ["Pipe", "64 KiB buffer"], ["TCP socket", "api.example:443"], ["File", "page cache"]];
  return <div className="fx-scroll" role="region" aria-label="Diagram of a process and the kernel" tabIndex={0}>
    <svg className="fx-svg" viewBox="0 0 740 330" style={{ minWidth: 660 }} role="img" aria-labelledby="pa-title pa-desc">
      <title id="pa-title">What a process owns</title>
      <desc id="pa-desc">A process has a virtual address space with code, data, heap, mapped libraries and stack, and a descriptor table where 0 is stdin to a terminal, 1 and 2 are stdout and stderr to a pipe, 3 is a socket and 4 is a file. Each descriptor refers to a kernel object across the system call boundary.</desc>
      {arrow("pa-arrow")}
      <rect x="12" y="12" width="436" height="306" rx="10" className="fx-region" />
      <text x="28" y="38" className="fx-svg-heading">Process · pid 4101</text>
      <g className="fx-thread-chips"><rect x="300" y="24" width="62" height="20" rx="10" /><text x="331" y="38" textAnchor="middle">thread 1</text><rect x="370" y="24" width="62" height="20" rx="10" /><text x="401" y="38" textAnchor="middle">thread 2</text></g>
      <text x="28" y="56" className="fx-svg-note">Virtual address space</text>
      {segments.map(([label, h, cls]) => { const top = y; y += h; return <g key={top} className={`fx-seg ${cls}`}><rect x="28" y={top} width="170" height={h - 2} rx="3" /><text x="113" y={top + h / 2 + 3} textAnchor="middle">{label}</text></g>; })}
      <text x="206" y="70" className="fx-svg-note">high</text><text x="206" y="268" className="fx-svg-note">low</text>
      <text x="252" y="76" className="fx-svg-note">File descriptors</text>
      {fds.map(([fd, name], i) => <g key={fd} className="fx-fd"><rect x="252" y={86 + i * 40} width="170" height="30" rx="5" /><text x="266" y={106 + i * 40} className="fx-svg-mono">{fd}</text><text x="290" y={106 + i * 40}>{name}</text></g>)}
      <line x1="470" y1="12" x2="470" y2="318" className="fx-boundary" />
      <text x="478" y="30" className="fx-svg-note">kernel boundary · system calls</text>
      <rect x="490" y="44" width="238" height="274" rx="10" className="fx-region is-kernel" />
      <text x="506" y="68" className="fx-svg-heading">Kernel objects</text>
      {objects.map(([name, detail], i) => <g key={name} className="fx-kobj"><rect x="560" y={84 + i * 56} width="156" height="42" rx="6" /><text x="574" y={102 + i * 56} className="fx-svg-strong">{name}</text><text x="574" y={118 + i * 56} className="fx-svg-mono is-small">{detail}</text></g>)}
      {fds.map(([fd, , target], i) => <path key={fd} d={`M 422 ${101 + i * 40} C 500 ${101 + i * 40}, 500 ${105 + target * 56}, 558 ${105 + target * 56}`} className="fx-pointer" markerEnd="url(#pa-arrow)" />)}
      <text x="506" y="306" className="fx-svg-mono is-small">read() · write() · openat() · mmap()</text>
    </svg>
  </div>;
}

export function ForkExec() {
  return <div className="fx-scroll" role="region" aria-label="Timeline of fork, exec, exit and wait" tabIndex={0}>
    <svg className="fx-svg" viewBox="0 0 740 250" style={{ minWidth: 660 }} role="img" aria-labelledby="fe-title fe-desc">
      <title id="fe-title">fork, exec, exit and wait</title>
      <desc id="fe-desc">The harness process forks a child. The child redirects stdout to a pipe with dup2, then calls execve to become bash, which runs npm test and exits with status 0. Until the harness calls waitpid, the child is a zombie. waitpid returns the status and the zombie is reaped.</desc>
      {arrow("fe-arrow")}
      <text x="16" y="66" className="fx-svg-strong">Harness</text><text x="16" y="82" className="fx-svg-mono is-small">pid 4100</text>
      <text x="16" y="166" className="fx-svg-strong">Child</text><text x="16" y="182" className="fx-svg-mono is-small">pid 4101</text>
      <line x1="110" y1="70" x2="720" y2="70" className="fx-lane" />
      <line x1="150" y1="170" x2="560" y2="170" className="fx-lane is-child" />
      <line x1="560" y1="170" x2="640" y2="170" className="fx-lane is-zombie" />
      <path d="M 150 72 L 150 166" className="fx-pointer" markerEnd="url(#fe-arrow)" />
      <path d="M 560 166 C 600 120, 620 100, 640 74" className="fx-pointer is-good" markerEnd="url(#fe-arrow)" />
      {[
        [150, 70, "fork()", "returns 4101", "is-gold"], [350, 70, "reads the pipe", "streams output", ""], [640, 70, "waitpid(4101)", "status 0", "is-good"],
        [230, 170, "dup2(pipe, 1)", "stdout → pipe", ""], [330, 170, "execve(bash)", "same pid, new program", "is-gold"], [450, 170, "npm test", "runs…", ""], [560, 170, "exit(0)", "", "is-good"],
      ].map(([x, y, label, sub, cls]) => <g key={`${label}`} className={`fx-event ${cls}`}>
        <circle cx={x} cy={y} r="6" />
        <text x={x as number} y={(y as number) - 16} textAnchor="middle" className="fx-svg-mono">{label}</text>
        {sub ? <text x={x as number} y={(y as number) + 24} textAnchor="middle" className="fx-svg-note">{sub}</text> : null}
      </g>)}
      <text x="600" y="194" textAnchor="middle" className="fx-svg-note is-warn">zombie until reaped</text>
      <text x="150" y="232" className="fx-svg-note">Between fork and exec, the child can rearrange descriptors, change directory and drop privileges. exec keeps open descriptors.</text>
    </svg>
  </div>;
}

export function PipeVsPty() {
  return <div className="fx-compare">
    <div className="fx-compare-col is-good">
      <h4>stdout is a pipe</h4>
      <ol>
        <li><code>isatty(1)</code> returns 0</li>
        <li>Plain text, no colour codes</li>
        <li>No pager: output is written and the program exits</li>
        <li>Block-buffered: arrives in bursts</li>
      </ol>
      <pre className="fx-term" aria-label="Pipe output">{`commit 9f2c1e7
Author: Dhruv
    Fix pipe drain in run_command
commit 41b0aa3
…
[exit 0]`}</pre>
    </div>
    <div className="fx-compare-col is-bad">
      <h4>stdout is a PTY</h4>
      <ol>
        <li><code>isatty(1)</code> returns 1</li>
        <li>Adds ANSI colour escapes</li>
        <li>Opens <code>less</code> for long output</li>
        <li><code>less</code> waits for a keypress</li>
      </ol>
      <pre className="fx-term" aria-label="PTY output">{`\\x1b[33mcommit 9f2c1e7\\x1b[m
Author: Dhruv
    Fix pipe drain in run_command
:  ← less is waiting for input
…
[still running at timeout]`}</pre>
    </div>
  </div>;
}

export function VirtualMemory() {
  const frames = ["libc code", "free", "heap page", "A: heap", "B: heap copy", "B: stack", "file page", "free"];
  const fy = (i: number) => 44 + i * 30;
  const rows: { label: string; frame: number | null; kind: string }[][] = [
    [{ label: "libc code", frame: 0, kind: "shared" }, { label: "heap · COW", frame: 2, kind: "cow" }, { label: "heap · written", frame: 3, kind: "private" }, { label: "mmap'd file", frame: 6, kind: "shared" }, { label: "untouched", frame: null, kind: "none" }],
    [{ label: "libc code", frame: 0, kind: "shared" }, { label: "heap · COW", frame: 2, kind: "cow" }, { label: "heap · copied", frame: 4, kind: "private" }, { label: "stack", frame: 5, kind: "private" }, { label: "untouched", frame: null, kind: "none" }],
  ];
  const py = (i: number) => 52 + i * 44;
  return <div className="fx-scroll" role="region" aria-label="Virtual pages of two processes mapped to physical frames" tabIndex={0}>
    <svg className="fx-svg" viewBox="0 0 740 300" style={{ minWidth: 660 }} role="img" aria-labelledby="vm-title vm-desc">
      <title id="vm-title">Virtual pages and physical frames</title>
      <desc id="vm-desc">Process A and process B each map five virtual pages. Both map libc code to one shared frame and a heap page to one copy-on-write frame. The heap page B wrote to was copied to its own frame. A maps a file page from the page cache. Untouched pages have no frame.</desc>
      <text x="24" y="28" className="fx-svg-heading">Process A · parent</text>
      <text x="300" y="28" className="fx-svg-heading">Physical frames</text>
      <text x="566" y="28" className="fx-svg-heading">Process B · after fork</text>
      {frames.map((f, i) => <g key={i} className={`fx-frame-box${f === "free" ? " is-free" : ""}`}><rect x="300" y={fy(i) - 14} width="140" height="24" rx="4" /><text x="312" y={fy(i) + 2} className="fx-svg-mono is-small">F{i}</text><text x="340" y={fy(i) + 2} className="is-small">{f}</text></g>)}
      {rows.map((pages, side) => pages.map((page, i) => {
        const x = side === 0 ? 24 : 566;
        return <g key={`${side}-${i}`} className={`fx-page is-${page.kind}`}>
          <rect x={x} y={py(i) - 16} width="150" height="30" rx="5" />
          <text x={x + 12} y={py(i) + 3}>{page.label}</text>
          {page.frame !== null ? <path d={side === 0 ? `M 174 ${py(i)} C 240 ${py(i)}, 240 ${fy(page.frame) - 2}, 300 ${fy(page.frame) - 2}` : `M 566 ${py(i)} C 500 ${py(i)}, 500 ${fy(page.frame) - 2}, 440 ${fy(page.frame) - 2}`} className={`fx-map is-${page.kind}`} /> : <text x={side === 0 ? 182 : 470} y={py(i) + 3} className="fx-svg-note">no frame: first touch faults</text>}
        </g>;
      }))}
      <g className="fx-legend-svg" transform="translate(24 286)">
        <rect width="10" height="10" rx="2" className="is-shared" /><text x="16" y="9">shared</text>
        <rect x="80" width="10" height="10" rx="2" className="is-cow" /><text x="96" y="9">copy-on-write</text>
        <rect x="200" width="10" height="10" rx="2" className="is-private" /><text x="216" y="9">private</text>
      </g>
    </svg>
  </div>;
}
