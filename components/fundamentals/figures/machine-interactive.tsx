"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Segmented } from "./segmented";

/* ---------- Bit explorer ---------- */

const weights = [-128, 64, 32, 16, 8, 4, 2, 1];
const bytePresets: [string, number][] = [["5", 5], ["−5", 251], ["127", 127], ["−128", 128], ["−1", 255]];

export function BitExplorer() {
  const [value, setValue] = useState(5);
  const [note, setNote] = useState("");
  const bits = weights.map((_, i) => (value >> (7 - i)) & 1);
  const signed = value >= 128 ? value - 256 : value;
  const terms = weights.filter((_, i) => bits[i]).map((w) => (w < 0 ? `−${-w}` : String(w)));

  function addOne() {
    const next = (value + 1) & 255;
    const nextSigned = next >= 128 ? next - 256 : next;
    setNote(value === 127 ? "Overflow: 127 + 1 wrapped to −128 when read as signed." : value === 255 ? "Wrapped: 255 + 1 is 0 in eight bits; the carry fell off the end." : `${signed} + 1 = ${nextSigned}`);
    setValue(next);
  }

  return <div className="fx-bits">
    <div className="fx-toolbar">
      <div className="fx-chip-row" role="group" aria-label="Preset values">{bytePresets.map(([label, preset]) => <button key={label} type="button" className="fx-chip" aria-pressed={value === preset} onClick={() => { setValue(preset); setNote(""); }}>{label}</button>)}</div>
      <Button variant="secondary" size="sm" onClick={addOne}>Add 1</Button>
    </div>
    <div className="fx-bit-grid">
      {bits.map((bit, i) => <div key={i} className="fx-bit-cell">
        <span className={`fx-bit-weight${i === 0 ? " is-sign" : ""}`}>{i === 0 ? "−128" : weights[i]}</span>
        <button type="button" className={`fx-bit${bit ? " is-on" : ""}${i === 0 ? " is-sign" : ""}`} aria-pressed={bit === 1} aria-label={`Bit ${7 - i}, weight ${weights[i]} when signed`} onClick={() => { setValue((v) => v ^ (1 << (7 - i))); setNote(""); }}>{bit}</button>
        <span className="fx-bit-index">b{7 - i}</span>
      </div>)}
    </div>
    <dl className="fx-readout">
      <div><dt>Unsigned</dt><dd>{value}</dd></div>
      <div><dt>Signed (two&apos;s complement)</dt><dd>{signed}</dd></div>
      <div><dt>Hex</dt><dd>0x{value.toString(16).toUpperCase().padStart(2, "0")}</dd></div>
    </dl>
    <p className="fx-equation" aria-live="polite">{note || (terms.length ? `Signed: ${terms.join(" + ")} = ${signed}` : "All bits off: 0 in every reading.")}</p>
  </div>;
}

/* ---------- Text bytes ---------- */

const textPresets = ["Hi 🙂", "naïve café", "日本語", "👨‍👩‍👧 ok"];
const encoder = new TextEncoder();
const hex = (n: number, width = 2) => n.toString(16).toUpperCase().padStart(width, "0");

function graphemes(text: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) return [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text)].map((s) => s.segment);
  return Array.from(text);
}

export function TextBytes() {
  const id = useId();
  const [text, setText] = useState(textPresets[0]);
  const firstSurrogate = [...text].length !== text.length ? Array.from({ length: text.length }, (_, i) => text.charCodeAt(i)).findIndex((c) => c >= 0xd800 && c <= 0xdbff) : -1;
  const [cut, setCut] = useState<number | null>(null);
  const n = Math.min(cut ?? (firstSurrogate >= 0 ? firstSurrogate + 1 : text.length), text.length);

  const columns = useMemo(() => {
    const segments = graphemes(text);
    return segments.map((g, index) => {
      const start = segments.slice(0, index).join("").length;
      return { g, start, points: Array.from(g).map((c) => `U+${hex(c.codePointAt(0)!, 4)}`), utf8: Array.from(encoder.encode(g)).map((b) => hex(b)), utf16: Array.from({ length: g.length }, (_, i) => hex(g.charCodeAt(i), 4)) };
    });
  }, [text]);

  const slice = text.slice(0, n);
  const last = slice.charCodeAt(slice.length - 1);
  const lone = last >= 0xd800 && last <= 0xdbff;
  const boundaries = new Set(columns.map((c) => c.start).concat(text.length));
  const status = lone ? `Broken: ends with a lone surrogate 0x${hex(last, 4)}. Encoded to UTF-8 it becomes the replacement character.` : boundaries.has(n) ? "Valid: the cut lands on a character boundary." : "Valid Unicode, but the cut splits a grapheme, so a reader sees a different character.";

  return <div className="fx-text">
    <div className="fx-toolbar">
      <label className="fx-input-label" htmlFor={`${id}-text`}>Text</label>
      <input id={`${id}-text`} className="fx-input" value={text} maxLength={32} onChange={(e) => { setText(e.target.value); setCut(null); }} />
      <div className="fx-chip-row" role="group" aria-label="Example strings">{textPresets.map((p) => <button key={p} type="button" className="fx-chip" aria-pressed={text === p} onClick={() => { setText(p); setCut(null); }}>{p}</button>)}</div>
    </div>
    <div className="fx-scroll" role="region" aria-label="Characters and their encodings" tabIndex={0}>
      <table className="fx-text-table">
        <tbody>
          <tr><th scope="row">Grapheme</th>{columns.map((c, i) => <td key={i} className="fx-glyph">{c.g === " " ? "␠" : c.g}</td>)}</tr>
          <tr><th scope="row">Code points</th>{columns.map((c, i) => <td key={i}>{c.points.map((p) => <span key={p + i} className="fx-tok is-point">{p}</span>)}</td>)}</tr>
          <tr><th scope="row">UTF-8 bytes</th>{columns.map((c, i) => <td key={i}>{c.utf8.map((b, j) => <span key={j} className="fx-tok is-byte">{b}</span>)}</td>)}</tr>
          <tr><th scope="row">UTF-16 units</th>{columns.map((c, i) => <td key={i}>{c.utf16.map((u, j) => <span key={j} className={`fx-tok is-unit${c.start + j < n ? " is-kept" : ""}`}>{u}</span>)}</td>)}</tr>
        </tbody>
      </table>
    </div>
    <dl className="fx-readout is-four">
      <div><dt><code>.length</code></dt><dd>{text.length}</dd></div>
      <div><dt>UTF-8 bytes</dt><dd>{encoder.encode(text).length}</dd></div>
      <div><dt>Code points</dt><dd>{Array.from(text).length}</dd></div>
      <div><dt>Graphemes</dt><dd>{columns.length}</dd></div>
    </dl>
    <div className="fx-slice">
      <label htmlFor={`${id}-cut`}><code>text.slice(0, {n})</code></label>
      <input id={`${id}-cut`} type="range" min={0} max={text.length} value={n} onChange={(e) => setCut(Number(e.target.value))} aria-valuetext={`Keep ${n} UTF-16 units`} />
      <output className={`fx-slice-out${lone ? " is-bad" : ""}`} htmlFor={`${id}-cut`}>“{new TextDecoder().decode(encoder.encode(slice))}”</output>
      <p className={lone ? "is-bad" : boundaries.has(n) ? "is-good" : "is-warn"} aria-live="polite">{status}</p>
    </div>
  </div>;
}

/* ---------- Latency ladder ---------- */

const ladder: [string, number, string, string, string][] = [
  ["L1 cache read", 1, "1 ns", "1 second", "cpu"],
  ["L2 cache read", 4, "4 ns", "4 seconds", "cpu"],
  ["Main memory read", 100, "100 ns", "1.7 minutes", "cpu"],
  ["NVMe SSD read", 50_000, "50 µs", "14 hours", "disk"],
  ["Same-region round trip", 500_000, "0.5 ms", "5.8 days", "net"],
  ["Cross-continent round trip", 150_000_000, "150 ms", "4.8 years", "net"],
  ["First token from an LLM", 1_000_000_000, "1 s", "32 years", "model"],
];

export function LatencyLadder() {
  const [human, setHuman] = useState(false);
  return <div className="fx-ladder">
    <div className="fx-toolbar"><Segmented label="Time scale" value={human ? "human" : "real"} onChange={(v) => setHuman(v === "human")} options={[["real", "Real time"], ["human", "If 1 ns were 1 s"]]} /></div>
    <ol className="fx-ladder-rows">
      {ladder.map(([label, ns, real, scaled, kind]) => <li key={label} className={`is-${kind}`}>
        <span className="fx-ladder-label">{label}</span>
        <span className="fx-ladder-track"><span className="fx-ladder-bar" style={{ width: `${Math.max(1.5, (Math.log10(ns) / 9) * 100)}%` }} /></span>
        <strong className="fx-ladder-value">{human ? scaled : real}</strong>
      </li>)}
    </ol>
    <div className="fx-ladder-axis" aria-hidden="true"><span>1 ns</span><span>1 µs</span><span>1 ms</span><span>1 s</span></div>
    <div className="fx-legend"><span><i className="is-cpu" />CPU and memory</span><span><i className="is-disk" />Storage</span><span><i className="is-net" />Network</span><span><i className="is-model" />Model</span></div>
  </div>;
}

/* ---------- Cache walk ---------- */

const SLOTS = 64, LINE = 8, CAPACITY = 2;
const sequential = Array.from({ length: SLOTS }, (_, i) => i);
const shuffled = (() => {
  const order = [...sequential];
  let seed = 7;
  for (let i = order.length - 1; i > 0; i--) {
    seed = (seed * 48271) % 2147483647;
    const j = seed % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
})();

function simulate(order: number[], steps: number) {
  let cache: number[] = [], hits = 0, misses = 0, lastHit: boolean | null = null;
  for (let s = 0; s < steps; s++) {
    const line = Math.floor(order[s] / LINE);
    if (cache.includes(line)) { hits++; lastHit = true; cache = [...cache.filter((l) => l !== line), line]; }
    else { misses++; lastHit = false; cache = [...cache, line].slice(-CAPACITY); }
  }
  return { cache, hits, misses, lastHit };
}

export function CacheWalk() {
  const [mode, setMode] = useState<"array" | "list">("array");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const order = mode === "array" ? sequential : shuffled;
  const state = simulate(order, step);
  const visited = new Set(order.slice(0, step));
  const current = step > 0 ? order[step - 1] : -1;
  const done = step >= SLOTS;
  const isPlaying = playing && !done;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => setStep((s) => Math.min(SLOTS, s + 1)), 140);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const nanos = state.hits * 1 + state.misses * 100;
  return <div className="fx-cache">
    <div className="fx-toolbar">
      <Segmented label="Access pattern" value={mode} onChange={(v) => { setMode(v as "array" | "list"); setStep(0); setPlaying(false); }} options={[["array", "Sum an array"], ["list", "Walk a shuffled list"]]} />
      <div className="fx-buttons">
        <Button variant="ghost" size="sm" onClick={() => { setStep(0); setPlaying(false); }}>Reset</Button>
        <Button variant="secondary" size="sm" disabled={done || isPlaying} onClick={() => setStep((s) => Math.min(SLOTS, s + 1))}>Step</Button>
        <Button variant="primary" size="sm" onClick={() => { if (done) { setStep(0); setPlaying(true); } else setPlaying(!isPlaying); }}>{isPlaying ? "Pause" : done ? "Replay" : "Play"}<Icon name={isPlaying ? "pause" : "play"} size={13} /></Button>
      </div>
    </div>
    <div className="fx-cache-layout">
      <div className="fx-cache-grid" role="img" aria-label={`Memory of ${SLOTS} values in ${SLOTS / LINE} cache lines. Lines ${state.cache.join(" and ") || "none"} are cached.`}>
        {Array.from({ length: SLOTS / LINE }, (_, line) => <div key={line} className={`fx-cache-line${state.cache.includes(line) ? " is-cached" : ""}`}>
          <span className="fx-cache-line-label">line {line}</span>
          {Array.from({ length: LINE }, (_, k) => {
            const slot = line * LINE + k;
            return <span key={slot} className={`fx-cache-slot${slot === current ? (state.lastHit ? " is-hit" : " is-miss") : visited.has(slot) ? " is-visited" : ""}`}>{mode === "list" && visited.has(slot) ? order.indexOf(slot) + 1 : slot}</span>;
          })}
        </div>)}
      </div>
      <dl className="fx-cache-stats" aria-live="polite">
        <div><dt>Values read</dt><dd>{step} / {SLOTS}</dd></div>
        <div><dt>Cache hits</dt><dd className="is-good">{state.hits}</dd></div>
        <div><dt>Misses to DRAM</dt><dd className="is-bad">{state.misses}</dd></div>
        <div><dt>Last access</dt><dd>{state.lastHit === null ? "—" : state.lastHit ? "Hit · ~1 ns" : "Miss · ~100 ns"}</dd></div>
        <div className="is-wide"><dt>Estimated time</dt><dd>{nanos.toLocaleString("en-US")} ns</dd></div>
      </dl>
    </div>
    <div className="fx-legend"><span><i className="is-cached" />Line in cache (holds {CAPACITY})</span><span><i className="is-hit" />Hit</span><span><i className="is-miss" />Miss</span>{mode === "list" ? <span>Numbers show visit order</span> : null}</div>
  </div>;
}
