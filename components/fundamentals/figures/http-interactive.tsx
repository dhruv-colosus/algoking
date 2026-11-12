"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { StepControls, ms } from "./controls";
import { Segmented } from "./segmented";

/* ---------- HTTP anatomy ---------- */

const httpLines: [string, string, "req" | "res" | "blank"][] = [
  ["POST /v1/messages HTTP/1.1", "Request line: method, path and protocol version. POST is neither safe nor idempotent, so it must not be retried blindly.", "req"],
  ["Host: api.example.com", "Required in HTTP/1.1. One IP address serves many sites; this says which one.", "req"],
  ["Authorization: Bearer sk-…", "Credentials. Never log this header, and keep it out of child process environments.", "req"],
  ["Content-Type: application/json", "How to interpret the body.", "req"],
  ["Accept: text/event-stream", "The client asks for a streamed response.", "req"],
  ["Idempotency-Key: run-42-turn-7", "Makes a POST safe to retry: the server returns the stored result for a repeated key.", "req"],
  ["Content-Length: 213", "Exact body size, so the server knows where the request ends on the TCP stream.", "req"],
  ["", "A blank line ends the headers. Everything after it is the body.", "blank"],
  ["{\"model\":\"…\",\"stream\":true,\"messages\":[…]}", "The body: 213 bytes of JSON.", "req"],
  ["HTTP/1.1 200 OK", "Status line. 2xx means success; the stream has started.", "res"],
  ["Content-Type: text/event-stream", "Server-Sent Events follow (Module 6).", "res"],
  ["Cache-Control: no-cache", "Tells proxies and browsers not to cache or hold the stream.", "res"],
  ["Transfer-Encoding: chunked", "Body length is unknown in advance, so it arrives in length-prefixed chunks.", "res"],
  ["Connection: keep-alive", "The connection stays open for the next request after this response ends.", "res"],
];

export function HttpAnatomy() {
  const [selected, setSelected] = useState(0);
  return <div className="fx-http">
    <div className="fx-http-lines" role="listbox" aria-label="Lines of an HTTP exchange" aria-activedescendant={`http-line-${selected}`}>
      {httpLines.map(([text, , kind], i) => <button key={i} id={`http-line-${i}`} type="button" role="option" aria-selected={selected === i} className={`is-${kind}`} onClick={() => setSelected(i)} onFocus={() => setSelected(i)} onMouseEnter={() => setSelected(i)}>
        <span>{kind === "res" && (i === 9) ? "←" : kind === "req" && i === 0 ? "→" : ""}</span><code>{text || "␍␊ (blank line)"}</code>
      </button>)}
    </div>
    <p className="fx-status" aria-live="polite"><strong>{httpLines[selected][0] || "Blank line"}</strong> {httpLines[selected][1]}</p>
  </div>;
}

/* ---------- TLS 1.3 handshake ---------- */

const tlsSteps: { from: "c" | "s" | null; name: string; encrypted: boolean; fields: string[]; note: string }[] = [
  { from: null, name: "", encrypted: false, fields: [], note: "The TCP handshake is done. Now TLS must agree on keys and prove the server's identity." },
  { from: "c", name: "ClientHello", encrypted: false, fields: ["random", "SNI: api.example.com", "ALPN: h2, http/1.1", "cipher suites", "key_share: X25519MLKEM768 (1,216 B)"], note: "The client guesses which key exchange the server will accept and sends its key share up front. This guess is what makes TLS 1.3 one round trip." },
  { from: "s", name: "ServerHello", encrypted: false, fields: ["random", "chosen cipher suite", "key_share (server)"], note: "The server picks the suite and sends its own key share. Both sides can now compute the shared secret and derive handshake keys." },
  { from: "s", name: "EncryptedExtensions", encrypted: true, fields: ["ALPN: h2"], note: "From here on, everything is encrypted, including which protocol was chosen." },
  { from: "s", name: "Certificate", encrypted: true, fields: ["api.example.com", "issuer: intermediate CA", "chain to a trusted root"], note: "The certificate chain, encrypted, so observers cannot see which certificate was sent." },
  { from: "s", name: "CertificateVerify", encrypted: true, fields: ["signature over the transcript"], note: "The server signs a hash of the handshake so far with its certificate's private key, proving it holds that key." },
  { from: "s", name: "Finished", encrypted: true, fields: ["MAC over the transcript"], note: "A MAC over the whole transcript. Any tampering with earlier messages would make this fail." },
  { from: "c", name: "Finished + GET /", encrypted: true, fields: ["MAC over the transcript", "first application data"], note: "The client verifies the chain and signature, sends Finished, and immediately its request. One round trip of TLS has passed." },
  { from: "s", name: "NewSessionTicket + response", encrypted: true, fields: ["ticket for resumption", "HTTP response"], note: "A ticket lets the client resume next time, even sending 0-RTT data, which can be replayed, so only for idempotent requests." },
];

export function Tls13Handshake() {
  const [index, setIndex] = useState(0);
  const shown = tlsSteps.slice(1, index + 1);
  const current = tlsSteps[index];
  return <div className="fx-tls">
    <div className="fx-tls-stage">
      <div className="fx-tls-lanes" aria-label="Messages so far">
        <div className="fx-tls-heads"><strong>Client</strong><strong>Server</strong></div>
        <ol>{shown.map((step, i) => <li key={step.name} className={`is-${step.from}${i === shown.length - 1 ? " is-current" : ""}${step.encrypted ? " is-enc" : ""}`}>
          <span className="fx-tls-msg">{step.encrypted ? <Icon name="lock" size={12} /> : null}{step.name}</span>
          <span className="fx-tls-arrow" aria-hidden="true">{step.from === "c" ? "→" : "←"}</span>
        </li>)}</ol>
        {index >= 7 ? <span className="fx-tls-rtt">1 RTT of TLS</span> : null}
      </div>
      <div className="fx-tls-detail">
        <span className="fx-actor-role">{current.name ? `${current.from === "c" ? "Client → server" : "Server → client"} · ${current.encrypted ? "encrypted" : "plaintext"}` : "Ready"}</span>
        <strong>{current.name || "Before the handshake"}</strong>
        {current.fields.length ? <ul>{current.fields.map((f) => <li key={f}><code>{f}</code></li>)}</ul> : null}
      </div>
    </div>
    <p className="fx-status" aria-live="polite">{current.note}</p>
    <StepControls index={index} total={tlsSteps.length} onChange={setIndex} />
  </div>;
}

/* ---------- RTT waterfall ---------- */

const scenarios: { name: string; phases: [string, number][] }[] = [
  { name: "TCP + TLS 1.2", phases: [["TCP", 1], ["TLS", 2], ["Request", 1]] },
  { name: "TCP + TLS 1.3", phases: [["TCP", 1], ["TLS", 1], ["Request", 1]] },
  { name: "QUIC (HTTP/3)", phases: [["QUIC + TLS", 1], ["Request", 1]] },
  { name: "QUIC 0-RTT resume", phases: [["Request with handshake", 1]] },
  { name: "Reused connection", phases: [["Request", 1]] },
];

export function RttWaterfall() {
  const id = useId();
  const [rtt, setRtt] = useState(150);
  const [dns, setDns] = useState(true);
  const rows = scenarios.map((s) => ({ ...s, phases: s.name === "Reused connection" ? s.phases : [...(dns ? [["DNS", 1] as [string, number]] : []), ...s.phases] }));
  const totals = rows.map((r) => r.phases.reduce((n, [, k]) => n + k, 0) * rtt);
  const max = Math.max(...totals);
  return <div className="fx-waterfall">
    <div className="fx-toolbar">
      <div className="fx-slider is-inline"><label htmlFor={`${id}-rtt`}>Round trip<strong>{rtt} ms</strong></label><input id={`${id}-rtt`} type="range" min={10} max={300} step={5} value={rtt} onChange={(e) => setRtt(Number(e.target.value))} /></div>
      <label className="fx-switch"><input type="checkbox" checked={dns} onChange={(e) => setDns(e.target.checked)} /><span aria-hidden="true" />Include a cold DNS lookup</label>
    </div>
    <ol className="fx-wf-rows">{rows.map((row, i) => <li key={row.name}>
      <span className="fx-wf-name">{row.name}</span>
      <span className="fx-wf-track">{row.phases.map(([label, k], j) => <span key={j} className={`fx-wf-bar is-${label.split(" ")[0].toLowerCase()}`} style={{ width: `${((k * rtt) / max) * 100}%` }} title={`${label}: ${k * rtt} ms`}><em>{label}</em></span>)}</span>
      <strong className="fx-wf-total">{ms(totals[i])}</strong>
    </li>)}</ol>
    <p className="fx-status" aria-live="polite">A reused connection reaches the first byte {ms(totals[1] - totals[4])} sooner than a cold TLS 1.3 connection at this distance. Server time is extra in every row.</p>
  </div>;
}

/* ---------- Head-of-line blocking ---------- */

type Proto = "h1" | "h2" | "h3";
const STREAMS = ["A", "B", "C"] as const;
const SIZES: Record<string, number> = { A: 2, B: 4, C: 4 };
const LOST = "B2", RETRANSMIT_DELAY = 8, SPAN = 15;

function deliveries(proto: Proto) {
  const order: string[] = [];
  if (proto === "h1") STREAMS.forEach((s) => { for (let n = 1; n <= SIZES[s]; n++) order.push(`${s}${n}`); });
  else for (let n = 1; n <= 4; n++) STREAMS.forEach((s) => { if (n <= SIZES[s]) order.push(`${s}${n}`); });
  const arrival = new Map(order.map((p, i) => [p, p === LOST ? i + 1 + RETRANSMIT_DELAY : i + 1]));
  const delivered = new Map<string, number>();
  const perStream = new Map<string, number>();
  let clock = 0;
  for (const p of order) {
    const a = arrival.get(p)!;
    if (proto === "h3") { const t = Math.max(a, perStream.get(p[0]) ?? 0); perStream.set(p[0], t); delivered.set(p, t); }
    else { clock = Math.max(a, clock); delivered.set(p, clock); }
  }
  return { order, arrival, delivered };
}

export function HolBlocking() {
  const id = useId();
  const [proto, setProto] = useState<Proto>("h2");
  const { order, arrival, delivered } = deliveries(proto);
  const x = (t: number) => 70 + (t / SPAN) * 540;
  const burst = new Map<string, number>();
  const offset = (p: string) => { const key = `${p[0]}-${delivered.get(p)}`; const k = burst.get(key) ?? 0; burst.set(key, k + 1); return k * 24; };
  const done = STREAMS.map((s) => Math.max(...order.filter((p) => p[0] === s).map((p) => delivered.get(p)!)));
  return <div className="fx-hol">
    <div className="fx-toolbar"><Segmented label="Protocol" value={proto} onChange={(v) => setProto(v as Proto)} options={[["h1", "HTTP/1.1"], ["h2", "HTTP/2 over TCP"], ["h3", "HTTP/3 over QUIC"]]} /></div>
    <div className="fx-scroll" role="region" aria-label="Delivery timeline" tabIndex={0}>
      <svg className="fx-svg" viewBox="0 0 640 150" style={{ minWidth: 520 }} role="img" aria-labelledby={`${id}-t`}>
        <title id={`${id}-t`}>{STREAMS.map((s, i) => `Stream ${s} completes at time ${done[i]}`).join(". ")}</title>
        {Array.from({ length: SPAN + 1 }, (_, t) => <line key={t} x1={x(t)} x2={x(t)} y1="10" y2="120" className="fx-gridline" />)}
        {STREAMS.map((s, row) => <text key={s} x="0" y={34 + row * 36} className="fx-svg-strong is-small">Stream {s}</text>)}
        {order.map((p) => {
          const row = STREAMS.indexOf(p[0] as typeof STREAMS[number]), t = delivered.get(p)!, waited = t > arrival.get(p)! || p === LOST, dx = offset(p);
          return <g key={p} className={`fx-packet${p === LOST ? " is-lost" : waited ? " is-held" : ""}`}>
            {waited && p !== LOST ? <line x1={x(arrival.get(p)!)} x2={x(t) + dx} y1={30 + row * 36} y2={30 + row * 36} className="fx-wait" /> : null}
            <rect x={x(t) + dx - 11} y={20 + row * 36} width="22" height="20" rx="4" />
            <text x={x(t) + dx} y={34 + row * 36} textAnchor="middle">{p}</text>
          </g>;
        })}
        <text x="70" y="142" className="fx-svg-note">time slots → · {LOST} is lost and retransmitted {RETRANSMIT_DELAY} slots later · lines show packets held after arriving</text>
      </svg>
    </div>
    <dl className="fx-readout">{STREAMS.map((s, i) => <div key={s}><dt>Stream {s} complete at</dt><dd className={done[i] > 11 ? "is-bad" : done[i] > 5 ? "is-warn" : "is-good"}>slot {done[i]}</dd></div>)}</dl>
    <p className="fx-status" aria-live="polite">{proto === "h1" ? "One response at a time. The loss in B delays B, and C queues behind it on the same connection." : proto === "h2" ? "Streams interleave, but TCP delivers bytes in order: every packet after B2, from any stream, waits for the retransmission. C finishes late though none of its packets were lost." : "QUIC recovers loss per stream: only B waits. C finishes as soon as its own packets arrive."}</p>
  </div>;
}
