"use client";

import { useEffect, useReducer, useState } from "react";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StepControls } from "./controls";
import { Segmented } from "./segmented";

/* ---------- SSE parser ---------- */

const SSE_TEXT = ': ping\n\nevent: delta\nid: 1\ndata: {"text":"Hel"}\n\nevent: delta\nid: 2\ndata: {"text":"lo 🙂"}\n\nevent: stop\nid: 3\ndata: {}\n\n';
const encoder = new TextEncoder();
const SSE_BYTES = encoder.encode(SSE_TEXT);
const emojiAt = SSE_BYTES.indexOf(0xf0);
const CUTS = [11, 30, 52, emojiAt + 2, emojiAt + 21, SSE_BYTES.length];
const CHUNKS = CUTS.map((end, i) => SSE_BYTES.subarray(i ? CUTS[i - 1] : 0, end));

type Parsed = { event: string; id?: string; data: string; ok: boolean };

function parseBlock(raw: string): Parsed | null {
  let event = "message", id: string | undefined;
  const data: string[] = [];
  for (const line of raw.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon < 0 ? line : line.slice(0, colon);
    const value = colon < 0 ? "" : line.slice(colon + 1).replace(/^ /, "");
    if (field === "data") data.push(value); else if (field === "event") event = value; else if (field === "id") id = value;
  }
  if (!data.length && event === "message") return null;
  const joined = data.join("\n");
  let ok = data.length > 0 && !joined.includes("�");
  try { if (ok) JSON.parse(joined); } catch { ok = false; }
  return { event, id, data: joined, ok };
}

function runParser(steps: number, correct: boolean) {
  const events: Parsed[] = [];
  let buffer = "";
  const decoder = new TextDecoder();
  for (let i = 0; i < steps; i++) {
    if (correct) {
      buffer += decoder.decode(CHUNKS[i], { stream: true });
      let end: number;
      while ((end = buffer.indexOf("\n\n")) !== -1) { const e = parseBlock(buffer.slice(0, end)); if (e) events.push(e); buffer = buffer.slice(end + 2); }
    } else {
      for (const part of new TextDecoder().decode(CHUNKS[i]).split("\n\n")) { const e = parseBlock(part); if (e) events.push(e); }
    }
  }
  return { events, buffer };
}

const show = (text: string) => text.replace(/\n/g, "↵");

export function SseParser() {
  const [correct, setCorrect] = useState(true);
  const [index, setIndex] = useState(0);
  const { events, buffer } = runParser(index, correct);
  const total = CHUNKS.length + 1;
  return <div className="fx-sse">
    <div className="fx-toolbar"><Segmented label="Parser" value={correct ? "correct" : "naive"} onChange={(v) => setCorrect(v === "correct")} options={[["naive", "Naive: each read is events"], ["correct", "Buffered, streaming decoder"]]} /></div>
    <span className="fx-actor-role">Network reads (↵ is a newline)</span>
    <ol className="fx-chunks">{CHUNKS.map((chunk, i) => <li key={i} className={i < index ? (i === index - 1 ? "is-current" : "is-done") : ""}><span>read {i + 1} · {chunk.length} B</span><code>{show(new TextDecoder().decode(chunk))}</code></li>)}</ol>
    <div className="fx-sse-state">
      <div><span className="fx-actor-role">Buffered text, waiting for a blank line</span><code className="fx-buffer">{correct ? (show(buffer) || "empty") : "no buffer: each read parsed alone"}</code></div>
      <div><span className="fx-actor-role">Events emitted</span><ul className="fx-parsed">{events.length ? events.map((e, i) => <li key={i} className={e.ok ? "is-good" : "is-bad"}><span>{e.ok ? "✓" : "✕"} {e.event}{e.id ? ` #${e.id}` : ""}</span><code>{e.data || "(no data)"}</code></li>) : <li className="fx-empty">none yet</li>}</ul></div>
    </div>
    <p className={`fx-status${!correct && events.some((e) => !e.ok) ? " is-bad" : ""}`} aria-live="polite">{index === 0 ? "Press Next step to deliver the first network read." : correct ? (index === total - 1 ? "Three events, all intact, including the emoji split across reads 3 and 4." : "Text waits in the buffer until a blank line completes an event. Partial UTF-8 bytes wait inside the decoder.") : events.some((e) => !e.ok) ? "Events cut across reads become broken JSON, and the emoji split across reads decodes to replacement characters." : "So far so good, but only because no event has crossed a read boundary yet."}</p>
    <StepControls index={index} total={total} onChange={setIndex} />
  </div>;
}

/* ---------- Stream failures ---------- */

const hops = ["Inference server", "API gateway", "Proxy or CDN", "Load balancer / NAT", "Phone network", "Client parser"];
const failures: { hop: number; title: string; symptom: string; fix: string }[] = [
  { hop: 5, title: "Read ends mid-event", symptom: "JSON parse errors on some deltas", fix: "Buffer until the blank line, then parse." },
  { hop: 5, title: "Read ends mid-character", symptom: "� inside words, emoji and CJK text", fix: "`TextDecoder` with `{ stream: true }`." },
  { hop: 0, title: "Partial tool-call JSON", symptom: "Parse errors on input_json_delta events", fix: "Accumulate fragments; parse at content_block_stop." },
  { hop: 2, title: "Proxy buffers the response", symptom: "Nothing for 20 s, then the whole answer", fix: "Disable buffering for the route; flush per event." },
  { hop: 3, title: "Idle timeout", symptom: "Drops during long tool runs or thinking", fix: "Comment heartbeats every 15–30 s." },
  { hop: 4, title: "Network change at token 900", symptom: "Stream dies; answer lost", fix: "Persist events by run ID and offset; resume." },
];

export function StreamFailures() {
  const [selected, setSelected] = useState(3);
  const failure = failures[selected];
  return <div className="fx-failures">
    <ol className="fx-path" aria-label="Path from model to screen">{hops.map((hop, i) => <li key={hop} className={failure.hop === i ? "is-active" : ""}><span>{hop}</span>{failures.some((f) => f.hop === i) ? <em>{failures.filter((f) => f.hop === i).length}</em> : null}</li>)}</ol>
    <div className="fx-chip-row" role="group" aria-label="Failures">{failures.map((f, i) => <button key={f.title} type="button" className="fx-chip" aria-pressed={selected === i} onClick={() => setSelected(i)}>{i + 1}. {f.title}</button>)}</div>
    <dl className="fx-failure-card" aria-live="polite">
      <div><dt>Where</dt><dd>{hops[failure.hop]}</dd></div>
      <div><dt>Symptom</dt><dd>{failure.symptom}</dd></div>
      <div><dt>Fix</dt><dd>{failure.fix.split("`").map((part, i) => i % 2 ? <code key={i}>{part}</code> : part)}</dd></div>
    </dl>
  </div>;
}

/* ---------- Resumable stream ---------- */

const TOTAL_EVENTS = 24;
type ResumeState = { produced: number; received: (number | null)[]; connected: boolean; lastId: number; caughtUp: number[]; lastCatch: number };
type ResumeAction = { type: "tick" } | { type: "toggle" } | { type: "reset" };
const initialResume: ResumeState = { produced: 0, received: [], connected: true, lastId: 0, caughtUp: [], lastCatch: 0 };

function resumeReducer(log: boolean) {
  return (state: ResumeState, action: ResumeAction): ResumeState => {
    if (action.type === "reset") return initialResume;
    if (action.type === "toggle") {
      if (state.connected) return { ...state, connected: false, lastCatch: 0 };
      if (!log) return { ...state, connected: true };
      const missed = Array.from({ length: state.produced - state.lastId }, (_, i) => state.lastId + 1 + i);
      return { ...state, connected: true, received: [...state.received, ...missed], lastId: state.produced, caughtUp: [...state.caughtUp, ...missed], lastCatch: missed.length };
    }
    if (state.produced >= TOTAL_EVENTS) return state;
    const next = state.produced + 1;
    if (state.connected) return { ...state, produced: next, received: [...state.received, next], lastId: next };
    return { ...state, produced: next };
  };
}

export function ResumableStream() {
  const [log, setLog] = useState(true);
  const [state, dispatch] = useReducer((s: ResumeState, a: ResumeAction | { type: "mode"; log: boolean }) => a.type === "mode" ? initialResume : resumeReducer(log)(s, a), initialResume);
  const [playing, setPlaying] = useState(false);
  const done = state.produced >= TOTAL_EVENTS;
  const isPlaying = playing && !done;
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 380);
    return () => window.clearInterval(timer);
  }, [isPlaying]);
  const got = new Set(state.received);
  const lost = Array.from({ length: state.produced }, (_, i) => i + 1).filter((n) => !got.has(n) && (state.connected || n <= state.lastId || !log));
  return <div className="fx-resume">
    <div className="fx-toolbar">
      <Segmented label="Server design" value={log ? "log" : "socket"} onChange={(v) => { setLog(v === "log"); dispatch({ type: "mode", log: v === "log" }); setPlaying(false); }} options={[["log", "Events in a durable log"], ["socket", "Events written to the socket only"]]} />
      <div className="fx-buttons">
        <Button variant="ghost" size="sm" onClick={() => { dispatch({ type: "reset" }); setPlaying(false); }}>Reset</Button>
        <Button variant="secondary" size="sm" disabled={state.produced === 0} onClick={() => dispatch({ type: "toggle" })}>{state.connected ? "Drop the connection" : log ? `Reconnect with Last-Event-ID: ${state.lastId}` : "Reconnect"}</Button>
        <Button variant="primary" size="sm" disabled={done} onClick={() => setPlaying(!isPlaying)}>{isPlaying ? "Pause" : "Run the model"}<Icon name={isPlaying ? "pause" : "play"} size={13} /></Button>
      </div>
    </div>
    <div className="fx-resume-rows">
      <span className="fx-actor-role">{log ? "Server log" : "Server output"} · {state.produced} of {TOTAL_EVENTS} events produced</span>
      <div className="fx-cells">{Array.from({ length: TOTAL_EVENTS }, (_, i) => <span key={i} className={i < state.produced ? "is-made" : ""}>{i + 1}</span>)}</div>
      <span className="fx-actor-role">Client · {state.connected ? "connected" : "disconnected"}</span>
      <div className="fx-cells">{Array.from({ length: TOTAL_EVENTS }, (_, i) => { const n = i + 1; return <span key={i} className={got.has(n) ? (state.caughtUp.includes(n) ? "is-caught" : "is-got") : lost.includes(n) ? "is-lost" : ""}>{n}</span>; })}</div>
    </div>
    <div className="fx-legend"><span><i className="is-got" />Received live</span><span><i className="is-caught" />Caught up on reconnect</span><span><i className="is-lost" />Lost for good</span></div>
    <p className={`fx-status${lost.length && !log ? " is-bad" : ""}`} aria-live="polite">{!state.connected ? (log ? "The model keeps running and the log keeps growing. Nothing is lost while you are away." : "Events produced now go nowhere: the socket is gone and nothing kept them.") : lost.length && !log ? `${lost.length} events were produced while disconnected and are gone for good.` : state.lastCatch ? `Reconnected with Last-Event-ID and replayed ${state.lastCatch} missed events from the log, then continued live.` : "Run the model, drop the connection part-way, then reconnect."}</p>
  </div>;
}
