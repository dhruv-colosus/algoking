"use client";

import { useId, useState } from "react";
import { StepControls } from "./controls";
import { Segmented } from "./segmented";

/* ---------- Race interleaving ---------- */

type RaceStep = { thread: "A" | "B" | null; op: string; a: number | null; b: number | null; mem: number; lock: "A" | "B" | null; waiting: boolean; note: string };
const raceScripts: Record<"race" | "mutex", RaceStep[]> = {
  race: [
    { thread: null, op: "", a: null, b: null, mem: 0, lock: null, waiting: false, note: "Both threads will run count++ once. We expect 2." },
    { thread: "A", op: "load", a: 0, b: null, mem: 0, lock: null, waiting: false, note: "A loads count (0) into its register." },
    { thread: "B", op: "load", a: 0, b: 0, mem: 0, lock: null, waiting: false, note: "The scheduler switches. B also loads 0." },
    { thread: "A", op: "add", a: 1, b: 0, mem: 0, lock: null, waiting: false, note: "A adds 1 in its register." },
    { thread: "B", op: "add", a: 1, b: 1, mem: 0, lock: null, waiting: false, note: "B adds 1 to its stale copy." },
    { thread: "A", op: "store", a: 1, b: 1, mem: 1, lock: null, waiting: false, note: "A stores 1." },
    { thread: "B", op: "store", a: 1, b: 1, mem: 1, lock: null, waiting: false, note: "B stores 1 over it. One increment is lost: count is 1, not 2." },
  ],
  mutex: [
    { thread: null, op: "", a: null, b: null, mem: 0, lock: null, waiting: false, note: "Same work, now inside lock() and unlock()." },
    { thread: "A", op: "lock", a: null, b: null, mem: 0, lock: "A", waiting: false, note: "A takes the mutex." },
    { thread: "B", op: "lock", a: null, b: null, mem: 0, lock: "A", waiting: true, note: "B tries to lock and is put to sleep until A releases it." },
    { thread: "A", op: "load", a: 0, b: null, mem: 0, lock: "A", waiting: true, note: "A loads 0." },
    { thread: "A", op: "add", a: 1, b: null, mem: 0, lock: "A", waiting: true, note: "A adds 1." },
    { thread: "A", op: "store", a: 1, b: null, mem: 1, lock: "A", waiting: true, note: "A stores 1." },
    { thread: "A", op: "unlock", a: 1, b: null, mem: 1, lock: "B", waiting: false, note: "A unlocks. B wakes up holding the mutex." },
    { thread: "B", op: "load", a: 1, b: 1, mem: 1, lock: "B", waiting: false, note: "B loads the fresh value, 1." },
    { thread: "B", op: "add", a: 1, b: 2, mem: 1, lock: "B", waiting: false, note: "B adds 1." },
    { thread: "B", op: "store", a: 1, b: 2, mem: 2, lock: "B", waiting: false, note: "B stores 2." },
    { thread: "B", op: "unlock", a: 1, b: 2, mem: 2, lock: null, waiting: false, note: "B unlocks. count is 2, as expected." },
  ],
};

export function RaceInterleaving() {
  const [mode, setMode] = useState<"race" | "mutex">("race");
  const [index, setIndex] = useState(0);
  const steps = raceScripts[mode], step = steps[index];
  const ops = mode === "race" ? ["load", "add", "store"] : ["lock", "load", "add", "store", "unlock"];
  const doneOps = (t: "A" | "B") => steps.slice(1, index + 1).filter((s) => s.thread === t).map((s) => s.op);
  const finalBad = mode === "race" && index === steps.length - 1;

  return <div className="fx-race">
    <div className="fx-toolbar"><Segmented label="Synchronisation" value={mode} onChange={(v) => { setMode(v as "race" | "mutex"); setIndex(0); }} options={[["race", "No lock"], ["mutex", "With a mutex"]]} /></div>
    <div className="fx-race-stage">
      {(["A", "B"] as const).map((t) => {
        const done = doneOps(t);
        return <div key={t} className={`fx-thread${step.thread === t ? " is-active" : ""}${t === "B" && step.waiting ? " is-waiting" : ""}`}>
          <span className="fx-actor-role">Thread {t}{t === "B" && step.waiting ? " · sleeping" : ""}</span>
          <ol>{ops.map((op, i) => <li key={op} className={done.length > i ? (done.length - 1 === i && step.thread === t ? "is-current" : "is-done") : ""}><code>{op === "load" ? "r = count" : op === "add" ? "r = r + 1" : op === "store" ? "count = r" : `${op}(m)`}</code></li>)}</ol>
          <span className="fx-register">register r = <strong>{(t === "A" ? step.a : step.b) ?? "—"}</strong></span>
        </div>;
      })}
      <div className={`fx-memory${finalBad ? " is-bad" : mode === "mutex" && index === steps.length - 1 ? " is-good" : ""}`}>
        <span className="fx-actor-role">Shared memory</span>
        <strong>count = {step.mem}</strong>
        {mode === "mutex" ? <span className="fx-actor-meta">mutex held by {step.lock ?? "nobody"}</span> : null}
      </div>
    </div>
    <p className={`fx-status${finalBad ? " is-bad" : ""}`} aria-live="polite">{step.note}</p>
    <StepControls index={index} total={steps.length} onChange={setIndex} />
  </div>;
}

/* ---------- Event loop ---------- */

const loopCode = [
  `console.log("A");`,
  `setTimeout(() => console.log("B"), 0);`,
  `Promise.resolve().then(() => console.log("C"));`,
  `queueMicrotask(() => console.log("D"));`,
  `console.log("E");`,
];
type LoopStep = { line: number | null; stack: string[]; micro: string[]; tasks: string[]; out: string[]; note: string };
const loopSteps: LoopStep[] = [
  { line: null, stack: ["main script"], micro: [], tasks: [], out: [], note: "The whole script is one task. It runs to completion before anything else." },
  { line: 0, stack: ["main script", "console.log"], micro: [], tasks: [], out: ["A"], note: "Synchronous: prints A immediately." },
  { line: 1, stack: ["main script", "setTimeout"], micro: [], tasks: ["timer → log B"], out: ["A"], note: "setTimeout registers a timer. When it expires, its callback joins the task queue, even with 0 ms." },
  { line: 2, stack: ["main script", "then"], micro: ["then → log C"], tasks: ["timer → log B"], out: ["A"], note: "The promise is already resolved, so its reaction goes straight to the microtask queue." },
  { line: 3, stack: ["main script", "queueMicrotask"], micro: ["then → log C", "microtask → log D"], tasks: ["timer → log B"], out: ["A"], note: "queueMicrotask adds a second microtask behind the first." },
  { line: 4, stack: ["main script", "console.log"], micro: ["then → log C", "microtask → log D"], tasks: ["timer → log B"], out: ["A", "E"], note: "Still synchronous: prints E." },
  { line: null, stack: ["then callback"], micro: ["microtask → log D"], tasks: ["timer → log B"], out: ["A", "E", "C"], note: "The stack is empty, so the loop drains every microtask before taking any task. C prints." },
  { line: null, stack: ["microtask callback"], micro: [], tasks: ["timer → log B"], out: ["A", "E", "C", "D"], note: "D prints. The microtask queue is now empty." },
  { line: null, stack: ["timer callback"], micro: [], tasks: [], out: ["A", "E", "C", "D", "B"], note: "Only now does the loop take the next task: the timer callback prints B. Final order: A E C D B." },
];

export function EventLoop() {
  const [index, setIndex] = useState(0);
  const step = loopSteps[index];
  const queue = (title: string, items: string[], kind: string) => <div className={`fx-queue is-${kind}`}><span className="fx-actor-role">{title}</span>{items.length ? <ol>{items.map((item) => <li key={item}>{item}</li>)}</ol> : <span className="fx-empty">empty</span>}</div>;
  return <div className="fx-loop">
    <div className="fx-loop-stage">
      <pre className="fx-loop-code" aria-label="Example code">{loopCode.map((line, i) => <span key={i} className={step.line === i ? "is-current" : ""}><i>{i + 1}</i>{line}{"\n"}</span>)}</pre>
      <div className="fx-loop-state">
        {queue("Call stack", [...step.stack].reverse(), "stack")}
        {queue("Microtask queue", step.micro, "micro")}
        {queue("Task queue", step.tasks, "task")}
        <div className="fx-console"><span className="fx-actor-role">Console</span><code>{step.out.join(" ") || "…"}</code></div>
      </div>
    </div>
    <p className="fx-status" aria-live="polite">{step.note}</p>
    <StepControls index={index} total={loopSteps.length} onChange={setIndex} />
  </div>;
}

/* ---------- Blocked loop ---------- */

const users = [["A", 0], ["B", 7], ["C", 14]] as const;
const SPAN = 400, BLOCK_START = 100, BLOCK_END = 300;

export function BlockedLoop() {
  const id = useId();
  const [worker, setWorker] = useState(false);
  const x = (ms: number) => 70 + (ms / SPAN) * 640;
  const lanes = worker ? ["User A", "User B", "User C", "Main thread", "Worker"] : ["User A", "User B", "User C", "Main thread"];
  return <div className="fx-blocked">
    <div className="fx-toolbar"><Segmented label="Where the parse runs" value={worker ? "worker" : "main"} onChange={(v) => setWorker(v === "worker")} options={[["main", "Parse on the main thread"], ["worker", "Parse on a worker"]]} /></div>
    <div className="fx-scroll" role="region" aria-label="Token timeline" tabIndex={0}>
      <svg className="fx-svg" viewBox={`0 0 730 ${40 + lanes.length * 40}`} style={{ minWidth: 620 }} role="img" aria-labelledby={`${id}-t ${id}-d`}>
        <title id={`${id}-t`}>Token delivery over 400 ms</title>
        <desc id={`${id}-d`}>{worker ? "With the parse on a worker, each user keeps receiving a token every 20 ms." : "With the parse on the main thread, no user receives tokens between 100 and 300 ms; delayed tokens arrive in a burst at 300 ms."}</desc>
        {[0, 100, 200, 300, 400].map((ms) => <g key={ms}><line x1={x(ms)} x2={x(ms)} y1="18" y2={20 + lanes.length * 40} className="fx-gridline" /><text x={x(ms)} y="12" textAnchor="middle" className="fx-svg-note">{ms} ms</text></g>)}
        {!worker ? <rect x={x(BLOCK_START)} y="22" width={x(BLOCK_END) - x(BLOCK_START)} height={lanes.length * 40 - 4} className="fx-freeze" /> : null}
        {lanes.map((lane, i) => <text key={lane} x="0" y={46 + i * 40} className="fx-svg-strong is-small">{lane}</text>)}
        {users.map(([name, offset], u) => Array.from({ length: SPAN / 20 }, (_, k) => {
          const due = offset + k * 20;
          const delayed = !worker && due >= BLOCK_START && due < BLOCK_END;
          const at = delayed ? BLOCK_END + u * 2 + (k % 3) : due;
          return <rect key={`${name}-${k}`} x={x(at) - 2} y={34 + u * 40} width="4" height="16" rx="1.5" className={delayed ? "fx-token is-late" : "fx-token"} />;
        }))}
        {worker ? <>
          <rect x={x(BLOCK_START)} y={34 + 4 * 40} width={x(BLOCK_END) - x(BLOCK_START)} height="16" rx="3" className="fx-work" />
          <text x={x(200)} y={46 + 4 * 40} textAnchor="middle" className="fx-work-label">JSON.parse · 200 ms</text>
          {Array.from({ length: SPAN / 20 }, (_, k) => <rect key={k} x={x(k * 20 + 3) - 1.5} y={38 + 3 * 40} width="3" height="8" className="fx-token is-small" />)}
        </> : <>
          <rect x={x(BLOCK_START)} y={34 + 3 * 40} width={x(BLOCK_END) - x(BLOCK_START)} height="16" rx="3" className="fx-work is-blocking" />
          <text x={x(200)} y={46 + 3 * 40} textAnchor="middle" className="fx-work-label">JSON.parse · 200 ms · loop blocked</text>
        </>}
      </svg>
    </div>
    <dl className="fx-readout">
      <div><dt>Longest gap between tokens</dt><dd className={worker ? "is-good" : "is-bad"}>{worker ? "20 ms" : "≈ 200 ms"}</dd></div>
      <div><dt>Users affected</dt><dd>{worker ? "None" : "All 3"}</dd></div>
      <div><dt>Main thread during parse</dt><dd>{worker ? "Free" : "Busy"}</dd></div>
    </dl>
  </div>;
}

/* ---------- Little's Law ---------- */

export function LittlesLaw() {
  const id = useId();
  const [rate, setRate] = useState(20);
  const [time, setTime] = useState(30);
  const [limit, setLimit] = useState(800);
  const [memory, setMemory] = useState(4);
  const open = rate * time;
  const over = open > limit;
  const served = over ? limit / time : rate;
  const growth = rate - served;
  const scale = Math.max(open, limit);
  const slider = (key: string, label: string, value: number, min: number, max: number, step: number, unit: string, set: (n: number) => void) => <div className="fx-slider" key={key}>
    <label htmlFor={`${id}-${key}`}>{label}<strong>{value.toLocaleString("en-US")} {unit}</strong></label>
    <input id={`${id}-${key}`} type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} />
  </div>;
  return <div className="fx-littles">
    <div className="fx-sliders">
      {slider("rate", "Arrival rate λ", rate, 1, 50, 1, "runs/s", setRate)}
      {slider("time", "Time per run W", time, 5, 120, 5, "s", setTime)}
      {slider("limit", "Concurrency limit", limit, 100, 2000, 50, "runs", setLimit)}
      {slider("memory", "Memory per open run", memory, 1, 50, 1, "MB", setMemory)}
    </div>
    <div className="fx-littles-result">
      <p className="fx-littles-equation">L = λ × W = {rate} × {time} = <strong>{open.toLocaleString("en-US")} runs open</strong></p>
      <div className="fx-capacity" role="img" aria-label={`${Math.min(open, limit)} of ${limit} slots used${over ? `, ${open - limit} more would queue` : ""}.`}>
        <span className="fx-capacity-fill" style={{ width: `${(Math.min(open, limit) / scale) * 100}%` }} />
        {over ? <span className="fx-capacity-over" style={{ width: `${((open - limit) / scale) * 100}%` }} /> : null}
        <span className="fx-capacity-limit" style={{ left: `${(limit / scale) * 100}%` }} />
      </div>
      <div className="fx-capacity-axis"><span>0</span><span>limit {limit.toLocaleString("en-US")}</span>{over ? <span>demand {open.toLocaleString("en-US")}</span> : null}</div>
      <dl className="fx-readout">
        <div><dt>Utilisation</dt><dd className={over ? "is-bad" : open / limit > 0.8 ? "is-warn" : "is-good"}>{Math.round((open / limit) * 100)}%</dd></div>
        <div><dt>Memory for open runs</dt><dd>{((Math.min(open, limit) * memory) / 1024).toFixed(1)} GB</dd></div>
        <div><dt>{over ? "Queue grows by" : "Headroom"}</dt><dd className={over ? "is-bad" : ""}>{over ? `${growth.toFixed(1)} runs/s` : `${(limit - open).toLocaleString("en-US")} runs`}</dd></div>
      </dl>
      <p className={`fx-status${over ? " is-bad" : ""}`} aria-live="polite">{over ? `Demand exceeds the limit. Only ${served.toFixed(1)} runs/s can complete, so after one minute ${Math.round(growth * 60).toLocaleString("en-US")} runs are waiting. Bound the queue and reject early, or raise the limit.` : "The system is stable. Keep headroom for bursts, since λ and W are averages."}</p>
    </div>
  </div>;
}
