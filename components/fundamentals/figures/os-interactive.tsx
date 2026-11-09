"use client";

import { useEffect, useId, useReducer, useState } from "react";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/* ---------- Pipe buffer ---------- */

const CAPACITY = 64, TOTAL = 160, WRITE = 8, READ = 12;
type PipeState = { buffer: number; written: number; drained: number; reading: boolean; tick: number };
type PipeAction = { type: "tick" } | { type: "toggle" } | { type: "reset" };
const initialPipe: PipeState = { buffer: 0, written: 0, drained: 0, reading: true, tick: 0 };

function pipeReducer(state: PipeState, action: PipeAction): PipeState {
  if (action.type === "reset") return { ...initialPipe, reading: state.reading };
  if (action.type === "toggle") return { ...state, reading: !state.reading };
  let { buffer, written, drained } = state;
  const room = Math.min(WRITE, CAPACITY - buffer, TOTAL - written);
  if (room > 0) { buffer += room; written += room; }
  if (state.reading) { const take = Math.min(READ, buffer); buffer -= take; drained += take; }
  return { ...state, buffer, written, drained, tick: state.tick + 1 };
}

export function PipeBuffer() {
  const [state, dispatch] = useReducer(pipeReducer, initialPipe);
  const [playing, setPlaying] = useState(false);
  const exited = state.written >= TOTAL;
  const blocked = !exited && state.buffer >= CAPACITY;
  const finished = exited && state.buffer === 0;
  const deadlock = blocked && !state.reading;
  const isPlaying = playing && !finished && !deadlock;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 320);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const childState = exited ? "Exited with status 0" : blocked ? "Blocked in write(1, …)" : "Running, writing output";
  const harnessState = state.reading ? (finished ? "Read everything, saw EOF" : "Reading stdout while it waits") : "Waiting in waitpid(), not reading";
  return <div className="fx-pipe">
    <div className="fx-toolbar">
      <label className="fx-switch"><input type="checkbox" checked={state.reading} onChange={() => dispatch({ type: "toggle" })} /><span aria-hidden="true" />Harness reads while it waits</label>
      <div className="fx-buttons">
        <Button variant="ghost" size="sm" onClick={() => { dispatch({ type: "reset" }); setPlaying(false); }}>Reset</Button>
        <Button variant="secondary" size="sm" disabled={finished || isPlaying || deadlock} onClick={() => dispatch({ type: "tick" })}>Step</Button>
        <Button variant="primary" size="sm" disabled={finished || deadlock} onClick={() => setPlaying(!isPlaying)}>{isPlaying ? "Pause" : "Play"}<Icon name={isPlaying ? "pause" : "play"} size={13} /></Button>
      </div>
    </div>
    <div className="fx-pipe-stage">
      <div className={`fx-actor${blocked ? " is-bad" : exited ? " is-good" : ""}`}>
        <span className="fx-actor-role">Child · npm test</span>
        <strong>{childState}</strong>
        <span className="fx-meter" aria-hidden="true"><span style={{ width: `${(state.written / TOTAL) * 100}%` }} /></span>
        <span className="fx-actor-meta">{state.written} of {TOTAL} KiB written</span>
      </div>
      <div className="fx-pipe-buffer">
        <span className="fx-actor-role">Pipe buffer · {state.buffer} / {CAPACITY} KiB</span>
        <div className="fx-pipe-cells" role="meter" aria-valuemin={0} aria-valuemax={CAPACITY} aria-valuenow={state.buffer} aria-label="Pipe buffer fill in KiB">
          {Array.from({ length: CAPACITY / 4 }, (_, i) => <span key={i} className={i < Math.ceil(state.buffer / 4) ? (state.buffer >= CAPACITY ? "is-full" : "is-filled") : ""} />)}
        </div>
        <span className="fx-pipe-flow" aria-hidden="true">write → <span>→ read</span></span>
      </div>
      <div className={`fx-actor${deadlock ? " is-bad" : finished ? " is-good" : ""}`}>
        <span className="fx-actor-role">Harness</span>
        <strong>{harnessState}</strong>
        <span className="fx-actor-meta">{state.drained} KiB drained</span>
      </div>
    </div>
    <p className={`fx-status${deadlock ? " is-bad" : finished ? " is-good" : ""}`} aria-live="polite">
      {deadlock ? "Deadlock. The child waits for room in the pipe; the harness waits for the child to exit. Turn reading back on to break it." : finished ? `Done in ${state.tick} steps. Because the harness kept draining, the child never blocked for long.` : blocked ? "The buffer is full, so the child is paused inside write() until the harness reads." : `Each step the child writes ${WRITE} KiB${state.reading ? ` and the harness reads up to ${READ} KiB` : ""}.`}
    </p>
  </div>;
}

/* ---------- Process tree kill ---------- */

type Proc = { pid: number; parent: number; cmd: string; holdsPipe: boolean; depth: number };
const tree: Proc[] = [
  { pid: 4101, parent: 4100, cmd: "bash -c \"npm test\"", holdsPipe: true, depth: 1 },
  { pid: 4102, parent: 4101, cmd: "npm test", holdsPipe: true, depth: 2 },
  { pid: 4103, parent: 4102, cmd: "node jest", holdsPipe: true, depth: 3 },
  { pid: 4104, parent: 4103, cmd: "node watch.js &", holdsPipe: true, depth: 4 },
];

export function ProcessTreeKill() {
  const id = useId();
  const [detached, setDetached] = useState(true);
  const [dead, setDead] = useState<number[]>([]);
  const [message, setMessage] = useState("All four processes are running and holding the stdout pipe.");
  const pgid = detached ? 4101 : 4100;
  const alive = tree.filter((p) => !dead.includes(p.pid));
  const holders = alive.filter((p) => p.holdsPipe).map((p) => p.pid);

  function killChild() {
    setDead((d) => [...new Set([...d, 4101])]);
    setMessage("SIGTERM reached bash only. npm is now an orphan, re-parented to PID 1, and jest and the watcher keep running beneath it. All three still hold the pipe, so the harness never sees EOF.");
  }
  function killGroup() {
    setDead(tree.map((p) => p.pid));
    setMessage(`kill(−${pgid}) signalled every process in group ${pgid}. All write ends closed, so the harness reads EOF.`);
  }
  function reset(nextDetached = detached) {
    setDetached(nextDetached); setDead([]);
    setMessage(nextDetached ? "All four processes are running and holding the stdout pipe." : "Without a new session, the child shares the harness's process group 4100.");
  }

  return <div className="fx-tree">
    <div className="fx-toolbar">
      <label className="fx-switch"><input type="checkbox" checked={detached} onChange={(e) => reset(e.target.checked)} /><span aria-hidden="true" />Start child in its own session (setsid)</label>
      <div className="fx-buttons">
        <Button variant="ghost" size="sm" onClick={() => reset()}>Reset</Button>
        <Button variant="secondary" size="sm" disabled={dead.includes(4101)} onClick={killChild}>kill(4101, SIGTERM)</Button>
        <Button variant="primary" size="sm" disabled={!detached || alive.length === 0} onClick={killGroup}>kill(−{pgid}, SIGTERM)</Button>
      </div>
    </div>
    <h4 id={`${id}-heading`} className="fx-sr">Process tree</h4>
    <ul className="fx-proc-list" aria-labelledby={`${id}-heading`}>
      <li className="fx-proc is-harness" style={{ paddingLeft: 12 }}><span className="fx-proc-dot" /><code>4100</code><span className="fx-proc-cmd">harness (your agent)</span><span className="fx-proc-meta">pgid 4100</span><span className="fx-proc-state">running</span></li>
      {tree.map((p) => {
        const isDead = dead.includes(p.pid);
        const orphan = !isDead && dead.includes(p.parent);
        return <li key={p.pid} className={`fx-proc${isDead ? " is-dead" : orphan ? " is-orphan" : ""}`} style={{ paddingLeft: 12 + p.depth * 22 }}>
          <span className="fx-proc-dot" /><code>{p.pid}</code><span className="fx-proc-cmd">{p.cmd}</span><span className="fx-proc-meta">pgid {pgid}{orphan ? " · ppid 1" : ""}</span>
          <span className="fx-proc-state">{isDead ? "terminated" : orphan ? "orphaned" : "running"}</span>
        </li>;
      })}
    </ul>
    <div className={`fx-pipe-status${holders.length ? " is-open" : " is-eof"}`}><strong>stdout pipe</strong>{holders.length ? <span>open · write end held by {holders.join(", ")}</span> : <span>EOF · every write end closed</span>}</div>
    <p className={`fx-status${!detached ? " is-warn" : ""}`} aria-live="polite">{!detached ? "Group kill is disabled: the child is in the harness's own group 4100, so kill(−4100) would terminate the harness too. Turn setsid back on." : message}</p>
  </div>;
}
