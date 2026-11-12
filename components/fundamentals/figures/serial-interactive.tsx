"use client";

import { useId, useState } from "react";
import { base64Groups, varint, zigzag32 } from "@/lib/fundamentals/toy-codecs";
import { hex2 } from "./controls";
import { Segmented } from "./segmented";

const encoder = new TextEncoder();

/* ---------- Base64 ---------- */

export function Base64Bits() {
  const id = useId();
  const [text, setText] = useState("Hi🙂");
  const bytes = encoder.encode(text);
  const groups = base64Groups(bytes);
  return <div className="fx-b64">
    <div className="fx-toolbar">
      <label className="fx-input-label" htmlFor={`${id}-in`}>Text</label>
      <input id={`${id}-in`} className="fx-input" value={text} maxLength={8} onChange={(e) => setText(e.target.value)} />
      <div className="fx-chip-row" role="group" aria-label="Examples">{["Man", "Ma", "M", "Hi🙂"].map((p) => <button key={p} type="button" className="fx-chip" aria-pressed={text === p} onClick={() => setText(p)}>{p}</button>)}</div>
    </div>
    <div className="fx-scroll" role="region" aria-label="Base64 groups" tabIndex={0}>
      <div className="fx-b64-groups">{groups.map((g, gi) => <div key={gi} className="fx-b64-group">
        <div className="fx-b64-bytes">{[0, 1, 2].map((k) => <span key={k} className={g.bytes[k] === undefined ? "is-pad" : ""}><code>{g.bytes[k] === undefined ? "——" : hex2(g.bytes[k])}</code><em>{g.bytes[k] === undefined ? "padding" : g.bytes[k].toString(2).padStart(8, "0")}</em></span>)}</div>
        <div className="fx-b64-sextets">{g.sextets.map((s, k) => <span key={k} className={s === null ? "is-pad" : ""}><em>{s === null ? "——" : s.toString(2).padStart(6, "0")}</em><code>{s === null ? "" : s}</code><strong>{g.chars[k]}</strong></span>)}</div>
      </div>)}</div>
    </div>
    <dl className="fx-readout">
      <div><dt>Input bytes (UTF-8)</dt><dd>{bytes.length}</dd></div>
      <div><dt>Base64</dt><dd>{groups.map((g) => g.chars.join("")).join("") || "—"}</dd></div>
      <div><dt>Growth</dt><dd>{bytes.length ? `${groups.length * 4} chars, +${Math.round(((groups.length * 4) / bytes.length - 1) * 100)}%` : "—"}</dd></div>
    </dl>
  </div>;
}

/* ---------- Protobuf encoder ---------- */

type FieldType = "int32" | "sint32" | "string";

export function ProtobufEncoder() {
  const id = useId();
  const [field, setField] = useState(1);
  const [type, setType] = useState<FieldType>("int32");
  const [raw, setRaw] = useState("150");
  const wire = type === "string" ? 2 : 0;
  const tagBytes = varint(BigInt((field << 3) | wire));
  let valueBytes: number[] = [], error = "", jsonValue = "";
  if (type === "string") { const b = Array.from(encoder.encode(raw)); valueBytes = [...varint(BigInt(b.length)), ...b]; jsonValue = JSON.stringify(raw); }
  else {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < -2147483648 || n > 2147483647) error = "Enter a 32-bit integer.";
    else { valueBytes = type === "sint32" ? varint(zigzag32(n)) : varint(BigInt(n)); jsonValue = String(n); }
  }
  const name = type === "string" ? "name" : type === "sint32" ? "delta" : "id";
  const json = `{"${name}":${jsonValue}}`;
  const varintBytes = type === "string" ? [] : valueBytes;
  return <div className="fx-proto">
    <div className="fx-proto-inputs">
      <label htmlFor={`${id}-f`}>Field number<input id={`${id}-f`} className="fx-input" type="number" min={1} max={2047} value={field} onChange={(e) => setField(Math.max(1, Math.min(2047, Number(e.target.value) || 1)))} /></label>
      <div><span className="fx-input-label">Type</span><Segmented label="Field type" value={type} onChange={(v) => { setType(v as FieldType); setRaw(v === "string" ? "grep" : v === "sint32" ? "-1" : "150"); }} options={[["int32", "int32"], ["sint32", "sint32"], ["string", "string"]]} /></div>
      <label htmlFor={`${id}-v`}>Value<input id={`${id}-v`} className="fx-input" value={raw} maxLength={24} onChange={(e) => setRaw(e.target.value)} /></label>
    </div>
    {error ? <p className="fx-status is-bad">{error}</p> : <>
      <div className="fx-proto-rows">
        <div><span className="fx-actor-role">Tag = (field {field} &lt;&lt; 3) | wire type {wire}{type === "string" ? " (LEN)" : " (VARINT)"} = {(field << 3) | wire}</span><div className="fx-bytes">{tagBytes.map((b, i) => <span key={i} className="is-tag"><code>{hex2(b)}</code><em><b>{b >> 7}</b>{(b & 0x7f).toString(2).padStart(7, "0")}</em></span>)}</div></div>
        {type === "string" ? <div><span className="fx-actor-role">Length {encoder.encode(raw).length}, then the UTF-8 bytes</span><div className="fx-bytes">{valueBytes.map((b, i) => <span key={i} className={i === 0 ? "is-len" : "is-data"}><code>{hex2(b)}</code><em>{i === 0 ? "length" : String.fromCharCode(b).replace(/[^\x20-\x7e]/, "·")}</em></span>)}</div></div>
          : <div><span className="fx-actor-role">Value as varint{type === "sint32" ? ` after zigzag: ${zigzag32(Number(raw))}` : Number(raw) < 0 ? " (negative: sign-extended to 64 bits)" : ""} · first bit of each byte = “more follows”</span><div className="fx-bytes">{varintBytes.map((b, i) => <span key={i} className="is-data"><code>{hex2(b)}</code><em><b>{b >> 7}</b>{(b & 0x7f).toString(2).padStart(7, "0")}</em></span>)}</div></div>}
      </div>
      <dl className="fx-readout">
        <div><dt>Protobuf bytes</dt><dd>{[...tagBytes, ...valueBytes].map(hex2).join(" ")}</dd></div>
        <div><dt>Protobuf size</dt><dd className={tagBytes.length + valueBytes.length >= 10 ? "is-bad" : "is-good"}>{tagBytes.length + valueBytes.length} B</dd></div>
        <div><dt>JSON <code>{json.length > 26 ? json.slice(0, 24) + "…" : json}</code></dt><dd>{encoder.encode(json).length} B</dd></div>
      </dl>
    </>}
  </div>;
}

/* ---------- Row vs column ---------- */

const records = [
  { id: 1, tool: "grep", latency_ms: 120, ok: true },
  { id: 2, tool: "read", latency_ms: 35, ok: true },
  { id: 3, tool: "bash", latency_ms: 4200, ok: false },
  { id: 4, tool: "grep", latency_ms: 95, ok: true },
];
const fields = ["id", "tool", "latency_ms", "ok"] as const;

export function RowVsColumn() {
  const [query, setQuery] = useState<"avg" | "record">("avg");
  const touched = (row: number, f: string) => query === "avg" ? f === "latency_ms" : row === 2;
  const cell = (row: number, f: typeof fields[number]) => <span key={`${row}-${f}`} className={`fx-rc-cell is-${f}${touched(row, f) ? " is-touched" : ""}`}><em>{f}</em>{String(records[row][f])}</span>;
  const rowRuns = query === "avg" ? 4 : 1, colRuns = query === "avg" ? 1 : 4;
  return <div className="fx-rc">
    <div className="fx-toolbar"><Segmented label="Query" value={query} onChange={(v) => setQuery(v as "avg" | "record")} options={[["avg", "Average latency of all calls"], ["record", "Fetch call #3"]]} /></div>
    <div className="fx-rc-layouts">
      <div><span className="fx-actor-role">Row layout (JSON, Protobuf, most databases) · {rowRuns} separate {rowRuns === 1 ? "read" : "reads"}</span><div className="fx-rc-strip">{records.map((_, r) => fields.map((f) => cell(r, f)))}</div></div>
      <div><span className="fx-actor-role">Columnar layout (Arrow, Parquet) · {colRuns} separate {colRuns === 1 ? "read" : "reads"}</span><div className="fx-rc-strip">{fields.map((f) => records.map((_, r) => cell(r, f)))}</div></div>
    </div>
    <p className="fx-status" aria-live="polite">{query === "avg" ? "Columnar reads one contiguous run of latencies and skips every other field. Row layout must step over ids, names and flags to reach each latency." : "Fetching one whole record favours rows: its fields sit together. In columnar layout they are spread across four columns."}</p>
  </div>;
}

/* ---------- Prompt cache order ---------- */

const system = "You are a coding agent. Follow the repository conventions.";
const toolDefs = [
  { name: "bash", description: "Run a shell command", input_schema: { type: "object", properties: { command: { type: "string" } } } },
  { name: "edit", description: "Replace text in a file", input_schema: { type: "object", properties: { path: { type: "string" }, old: { type: "string" }, new: { type: "string" } } } },
  { name: "read", description: "Read a file", input_schema: { type: "object", properties: { path: { type: "string" } } } },
];

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(",")}}`;
  return JSON.stringify(value);
}

export function PromptCacheOrder() {
  const [deterministic, setDeterministic] = useState(false);
  const first = deterministic ? stable({ system, tools: [...toolDefs].sort((a, b) => a.name.localeCompare(b.name)) }) : JSON.stringify({ system, tools: toolDefs });
  const reordered = [toolDefs[2], toolDefs[0], { input_schema: toolDefs[1].input_schema, name: "edit", description: toolDefs[1].description }];
  const second = deterministic ? stable({ system, tools: [...reordered].sort((a, b) => a.name.localeCompare(b.name)) }) : JSON.stringify({ system, tools: reordered });
  let common = 0;
  while (common < first.length && first[common] === second[common]) common++;
  const tokens = (chars: number) => Math.round(chars / 4);
  const conversation = 8000;
  const cached = tokens(common), fresh = tokens(second.length - common) + conversation;
  return <div className="fx-cacheorder">
    <div className="fx-toolbar"><label className="fx-switch"><input type="checkbox" checked={deterministic} onChange={(e) => setDeterministic(e.target.checked)} /><span aria-hidden="true" />Serialise deterministically (sorted tools and keys)</label></div>
    {[["Turn 1 request prefix", first], ["Turn 2 request prefix", second]].map(([label, text]) => <div key={label} className="fx-prefix">
      <span className="fx-actor-role">{label}</span>
      <code><mark className="is-match">{text.slice(0, common)}</mark><mark className="is-diff">{text.slice(common)}</mark></code>
    </div>)}
    <dl className="fx-readout">
      <div><dt>Prefix matching turn 1</dt><dd className={common === second.length ? "is-good" : "is-bad"}>{Math.round((common / second.length) * 100)}%</dd></div>
      <div><dt>Tokens read from cache</dt><dd>≈ {cached.toLocaleString("en-US")}</dd></div>
      <div><dt>Tokens processed fresh</dt><dd>≈ {fresh.toLocaleString("en-US")}</dd></div>
    </dl>
    <p className={`fx-status${common === second.length ? " is-good" : " is-bad"}`} aria-live="polite">{common === second.length ? "Byte-identical tools: the cache covers the whole prefix, and only new conversation is processed fresh." : "Turn 2 built its tools from a map in a different order. The bytes diverge early, so everything after the first difference, including the 8,000-token conversation, is reprocessed."}</p>
  </div>;
}
