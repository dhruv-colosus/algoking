"use client";

import { useId, useMemo, useState } from "react";
import Button from "@/components/ui/button";
import { seeded } from "@/lib/fundamentals/toy-codecs";
import { StepControls, kb } from "./controls";
import { Segmented } from "./segmented";

/* ---------- Packet layers ---------- */

const payloadPresets: [string, number][] = [["40 B heartbeat", 40], ["1 KB request", 1000], ["16 KB tool result", 16000], ["100 KB file", 100000]];

export function PacketLayers() {
  const [payload, setPayload] = useState(1000);
  const [quic, setQuic] = useState(false);
  const layers = quic
    ? [["Ethernet", 18, "eth"], ["IPv4", 20, "ip"], ["UDP", 8, "udp"], ["QUIC header + frame", 15, "tcp"], ["AEAD tag", 16, "tls"]] as const
    : [["Ethernet", 18, "eth"], ["IPv4", 20, "ip"], ["TCP + timestamps", 32, "tcp"]] as const;
  const perPacketHeaders = layers.reduce((n, [, size]) => n + size, 0);
  const records = quic ? 0 : Math.ceil(payload / 16384);
  const stream = payload + records * 21;                         // TLS record header + tag per ≤16 KB record
  const mss = 1500 - 20 - (quic ? 8 + 15 + 16 : 32);
  const packets = Math.max(1, Math.ceil(stream / mss));
  const wire = stream + packets * perPacketHeaders;
  const firstData = Math.min(stream, mss);
  const segments = [...layers.map(([name, size, kind]) => ({ name, size, kind })), ...(!quic ? [{ name: "TLS record", size: Math.min(21, firstData), kind: "tls" }] : []), { name: "Your data", size: Math.max(0, firstData - (quic ? 0 : 21)), kind: "data" }];
  const total = segments.reduce((n, s) => n + s.size, 0);
  return <div className="fx-layers">
    <div className="fx-toolbar">
      <div className="fx-chip-row" role="group" aria-label="Payload size">{payloadPresets.map(([label, size]) => <button key={label} type="button" className="fx-chip" aria-pressed={payload === size} onClick={() => setPayload(size)}>{label}</button>)}</div>
      <Segmented label="Transport" value={quic ? "quic" : "tcp"} onChange={(v) => setQuic(v === "quic")} options={[["tcp", "TCP + TLS"], ["quic", "QUIC"]]} />
    </div>
    <p className="fx-caption-line">First packet on the wire · {total} bytes of a 1,518-byte maximum Ethernet frame</p>
    <div className="fx-onion" role="img" aria-label={segments.map((s) => `${s.name} ${s.size} bytes`).join(", ")}>
      {segments.map((s) => <span key={s.name} className={`is-${s.kind}`} style={{ flexGrow: Math.max(s.size, 14) }}><strong>{s.name}</strong><em>{s.size} B</em></span>)}
    </div>
    <dl className="fx-readout is-four">
      <div><dt>Packets</dt><dd>{packets.toLocaleString("en-US")}</dd></div>
      <div><dt>Data per packet (max)</dt><dd>{mss.toLocaleString("en-US")} B</dd></div>
      <div><dt>Bytes on the wire</dt><dd>{kb(wire)}</dd></div>
      <div><dt>Overhead</dt><dd className={(wire - payload) / wire > 0.3 ? "is-bad" : (wire - payload) / wire > 0.08 ? "is-warn" : "is-good"}>{(((wire - payload) / wire) * 100).toFixed(1)}%</dd></div>
    </dl>
  </div>;
}

/* ---------- Byte stream framing ---------- */

const messages = ['{"id":1,"tool":"ls"}', '{"id":2,"tool":"cat"}', '{"id":3,"tool":"grep"}'];
const chunkPlans = [[9, 26, 14, 30, 99], [33, 3, 21, 99], [5, 5, 40, 7, 99]];

function cut(text: string, sizes: number[]) {
  const chunks: string[] = [];
  let i = 0;
  for (const size of sizes) { if (i >= text.length) break; chunks.push(text.slice(i, i + size)); i += size; }
  if (i < text.length) chunks.push(text.slice(i));
  return chunks;
}

export function ByteStreamFraming() {
  const [framed, setFramed] = useState(true);
  const [plan, setPlan] = useState(0);
  const wire = framed ? messages.map((m) => `${m.length}:${m}`).join("") : messages.join("");
  const chunks = cut(wire, chunkPlans[plan]);
  const results = useMemo(() => {
    if (!framed) return chunks.map((chunk, i) => { try { JSON.parse(chunk); return { read: i + 1, text: chunk, ok: true }; } catch { return { read: i + 1, text: chunk, ok: false }; } });
    const out: { read: number; text: string; ok: boolean }[] = [];
    let buffer = "";
    chunks.forEach((chunk, i) => {
      buffer += chunk;
      for (;;) {
        const colon = buffer.indexOf(":");
        if (colon < 0) break;
        const length = Number(buffer.slice(0, colon));
        if (buffer.length < colon + 1 + length) break;
        out.push({ read: i + 1, text: buffer.slice(colon + 1, colon + 1 + length), ok: true });
        buffer = buffer.slice(colon + 1 + length);
      }
    });
    return out;
  }, [chunks, framed]);
  return <div className="fx-framing">
    <div className="fx-toolbar">
      <Segmented label="Reader" value={framed ? "framed" : "naive"} onChange={(v) => setFramed(v === "framed")} options={[["naive", "Parse each read"], ["framed", "Length-prefixed reader"]]} />
      <Button variant="secondary" size="sm" onClick={() => setPlan((p) => (p + 1) % chunkPlans.length)}>Re-chunk the stream</Button>
    </div>
    <span className="fx-actor-role">What the receiver&apos;s reads return{framed ? " · prefix written as digits for readability" : ""}</span>
    <ol className="fx-chunks">{chunks.map((chunk, i) => <li key={i}><span>read {i + 1}</span><code>{chunk}</code></li>)}</ol>
    <span className="fx-actor-role">Messages the app sees</span>
    <ul className="fx-parsed">{results.map((r, i) => <li key={i} className={r.ok ? "is-good" : "is-bad"}><span>{r.ok ? "✓" : "✕"} after read {r.read}</span><code>{r.text}</code>{!r.ok ? <em>JSON.parse fails</em> : null}</li>)}</ul>
    <p className={`fx-status ${framed ? "is-good" : "is-bad"}`} aria-live="polite">{framed ? `All ${results.length} messages recovered intact, whatever the read sizes.` : `${results.filter((r) => !r.ok).length} of ${results.length} reads fail to parse: TCP never promised that a read is a message.`}</p>
  </div>;
}

/* ---------- TCP handshake ---------- */

type Arrow = { from: "c" | "s"; label: string; detail?: string; lost?: boolean; tone?: "gold" | "good" | "bad" };
const tcpSteps: { arrow: Arrow | null; note: string }[] = [
  { arrow: null, note: "The client wants to send an HTTP request. First it must agree on sequence numbers with the server." },
  { arrow: { from: "c", label: "SYN", detail: "seq=1000", tone: "gold" }, note: "SYN: “my bytes will start after 1000.” The initial sequence number is random in practice." },
  { arrow: { from: "s", label: "SYN-ACK", detail: "seq=5000 ack=1001", tone: "gold" }, note: "The server picks its own number and acknowledges the client's: “next I expect byte 1001.”" },
  { arrow: { from: "c", label: "ACK", detail: "ack=5001", tone: "gold" }, note: "The handshake is done. One full round trip has passed before any request byte." },
  { arrow: { from: "c", label: "GET /", detail: "seq=1001 len=80" }, note: "The request carries 80 bytes, numbered 1001 to 1080." },
  { arrow: { from: "s", label: "Data 1", detail: "seq=5001 len=1448" }, note: "The response arrives in MSS-sized segments, numbered by byte." },
  { arrow: { from: "s", label: "Data 2", detail: "seq=6449 len=1448", lost: true, tone: "bad" }, note: "This segment is lost in the network. Nobody knows yet." },
  { arrow: { from: "s", label: "Data 3", detail: "seq=7897 len=1448" }, note: "Data 3 arrives, but bytes 6449 to 7896 are missing. The kernel holds data 3 back from the application." },
  { arrow: { from: "c", label: "ACK ×3", detail: "ack=6449 (duplicate)", tone: "bad" }, note: "The client keeps acknowledging 6449, “I still need this.” Three duplicate ACKs trigger fast retransmit." },
  { arrow: { from: "s", label: "Data 2 again", detail: "seq=6449 len=1448", tone: "good" }, note: "The server resends only the missing segment, about one round trip after the loss." },
  { arrow: { from: "c", label: "ACK", detail: "ack=9345", tone: "good" }, note: "Everything up to byte 9344 has arrived. Data 2 and data 3 are delivered to the application together." },
  { arrow: { from: "c", label: "FIN", detail: "seq=1081" }, note: "The client closes its direction. The server acknowledges and sends its own FIN (not drawn)." },
  { arrow: { from: "s", label: "FIN + ACK", detail: "ack=1082" }, note: "The client acknowledges the server's FIN and enters TIME_WAIT for 60 seconds on Linux, holding its port." },
];

export function TcpHandshake() {
  const id = useId();
  const [index, setIndex] = useState(0);
  const shown = tcpSteps.slice(1, index + 1);
  const rowH = 30, height = 40 + (tcpSteps.length - 1) * rowH;
  return <div className="fx-tcp">
    <div className="fx-scroll" role="region" aria-label="TCP sequence diagram" tabIndex={0}>
      <svg className="fx-svg" viewBox={`0 0 640 ${height}`} style={{ minWidth: 520 }} role="img" aria-labelledby={`${id}-t`}>
        <title id={`${id}-t`}>{shown.map((s) => `${s.arrow!.from === "c" ? "Client to server" : "Server to client"}: ${s.arrow!.label} ${s.arrow!.detail ?? ""}${s.arrow!.lost ? " (lost)" : ""}`).join(". ") || "No packets yet"}</title>
        <defs><marker id={`${id}-a`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" fill="context-stroke" /></marker></defs>
        <text x="110" y="18" textAnchor="middle" className="fx-svg-strong">Client</text>
        <text x="530" y="18" textAnchor="middle" className="fx-svg-strong">Server</text>
        <line x1="110" y1="26" x2="110" y2={height} className="fx-lane" />
        <line x1="530" y1="26" x2="530" y2={height} className="fx-lane" />
        {shown.map((step, i) => {
          const a = step.arrow!, y = 38 + i * rowH, fromX = a.from === "c" ? 110 : 530, toX = a.from === "c" ? 530 : 110;
          const endX = a.lost ? (fromX + toX) / 2 : toX + (a.from === "c" ? -4 : 4);
          return <g key={i} className={`fx-msg${a.tone ? ` is-${a.tone}` : ""}${i === shown.length - 1 ? " is-current" : ""}`}>
            <line x1={fromX} y1={y} x2={endX} y2={y + 16} markerEnd={a.lost ? undefined : `url(#${id}-a)`} />
            {a.lost ? <text x={endX + 6} y={y + 20} className="fx-lost">✕ lost</text> : null}
            <text x="320" y={y + 4} textAnchor="middle" className="fx-msg-label">{a.label}</text>
            <text x="320" y={y + 17} textAnchor="middle" className="fx-msg-detail">{a.detail}</text>
          </g>;
        })}
        {index >= 3 ? <g className="fx-brace"><line x1="70" y1="38" x2="70" y2={38 + 2 * rowH + 16} /><text x="62" y={38 + rowH + 12} textAnchor="end">1 RTT</text></g> : null}
        {index >= 12 ? <text x="110" y={height - 4} textAnchor="middle" className="fx-svg-note is-warn">TIME_WAIT 60 s</text> : null}
      </svg>
    </div>
    <p className="fx-status" aria-live="polite">{tcpSteps[index].note}</p>
    <StepControls index={index} total={tcpSteps.length} onChange={setIndex} />
  </div>;
}

/* ---------- Bandwidth-delay calculator ---------- */

const bandwidths = [10, 100, 1000, 10000];
const windows = [64, 256, 1024, 4096, 16384];

export function BdpCalculator() {
  const id = useId();
  const [bw, setBw] = useState(1000);
  const [rtt, setRtt] = useState(100);
  const [win, setWin] = useState(64);
  const bdpBytes = (bw * 1e6 / 8) * (rtt / 1000);
  const winBytes = win * 1024;
  const throughput = Math.min(bw, (winBytes * 8) / (rtt / 1000) / 1e6);
  const fill = Math.min(1, winBytes / bdpBytes);
  return <div className="fx-bdp">
    <div className="fx-sliders is-row">
      <div className="fx-slider"><label htmlFor={`${id}-bw`}>Link speed<strong>{bw >= 1000 ? `${bw / 1000} Gbps` : `${bw} Mbps`}</strong></label><input id={`${id}-bw`} type="range" min={0} max={bandwidths.length - 1} value={bandwidths.indexOf(bw)} onChange={(e) => setBw(bandwidths[Number(e.target.value)])} aria-valuetext={`${bw} megabits per second`} /></div>
      <div className="fx-slider"><label htmlFor={`${id}-rtt`}>Round trip<strong>{rtt} ms</strong></label><input id={`${id}-rtt`} type="range" min={1} max={300} value={rtt} onChange={(e) => setRtt(Number(e.target.value))} /></div>
      <div className="fx-slider"><label htmlFor={`${id}-win`}>Window<strong>{kb(winBytes)}</strong></label><input id={`${id}-win`} type="range" min={0} max={windows.length - 1} value={windows.indexOf(win)} onChange={(e) => setWin(windows[Number(e.target.value)])} aria-valuetext={`${win} kilobytes`} /></div>
    </div>
    <div className="fx-pipe-visual" role="img" aria-label={`The pipe holds ${kb(bdpBytes)}; the window fills ${Math.round(fill * 100)}% of it.`}>
      <span className="fx-pipe-end">Sender</span>
      <div className="fx-pipe-body"><span style={{ width: `${fill * 100}%` }} /><em>{kb(bdpBytes)} fits in the pipe</em></div>
      <span className="fx-pipe-end">Receiver</span>
    </div>
    <dl className="fx-readout">
      <div><dt>Bandwidth-delay product</dt><dd>{kb(bdpBytes)}</dd></div>
      <div><dt>Throughput</dt><dd>{throughput >= 1000 ? `${(throughput / 1000).toFixed(2)} Gbps` : `${throughput.toFixed(throughput < 10 ? 1 : 0)} Mbps`}</dd></div>
      <div><dt>Link used</dt><dd className={fill < 0.5 ? "is-bad" : fill < 0.95 ? "is-warn" : "is-good"}>{Math.round((throughput / bw) * 100)}%</dd></div>
    </dl>
    <p className={`fx-status${fill < 0.5 ? " is-bad" : ""}`} aria-live="polite">{fill >= 1 ? "The window covers the whole pipe, so the link speed is the limit." : `Window-limited: the sender waits on ACKs with the link ${Math.round((1 - fill) * 100)}% idle. It needs a ${kb(bdpBytes)} window.`}</p>
  </div>;
}

/* ---------- Congestion window ---------- */

const CAP = 100, ROUNDS = 60;
type Algo = "reno" | "cubic" | "bbr";

function simulate(algo: Algo, loss: number) {
  const rand = seeded(algo === "reno" ? 11 : algo === "cubic" ? 23 : 37);
  const out: number[] = [];
  let cwnd = 10, ssthresh = Infinity, wmax = CAP, t = 0, phase: "startup" | "steady" = "startup", cycle = 0;
  for (let r = 0; r < ROUNDS; r++) {
    out.push(cwnd);
    const randomLoss = rand() < 1 - Math.pow(1 - loss, Math.min(cwnd, CAP));
    if (algo === "bbr") {
      if (phase === "startup") { cwnd = Math.min(cwnd * 2, CAP * 1.25); if (cwnd >= CAP) { phase = "steady"; cwnd = CAP * 0.85; } }
      else { const gains = [1.25, 0.75, 1, 1, 1, 1, 1, 1]; cwnd = CAP * gains[cycle++ % gains.length] * (loss > 0.15 ? 0.6 : 1); }
      continue;
    }
    const congested = cwnd > CAP;
    if (congested || randomLoss) {
      if (algo === "reno") { ssthresh = Math.max(2, cwnd / 2); cwnd = ssthresh; }
      else { wmax = cwnd; cwnd = Math.max(2, cwnd * 0.7); t = 0; ssthresh = cwnd; }
      continue;
    }
    if (cwnd < ssthresh) cwnd = Math.min(cwnd * 2, ssthresh === Infinity ? cwnd * 2 : Math.max(ssthresh, cwnd + 1));
    else if (algo === "reno") cwnd += 1;
    else { t += 1; const k = Math.cbrt((wmax * 0.3) / 0.4); cwnd = Math.max(cwnd + 1, 0.4 * Math.pow(t - k, 3) + wmax); }
  }
  return out.map((w) => Math.round(w * 100) / 100);
}

export function CongestionWindow() {
  const id = useId();
  const [loss, setLoss] = useState("0");
  const series = useMemo(() => (["reno", "cubic", "bbr"] as Algo[]).map((algo) => ({ algo, points: simulate(algo, Number(loss)) })), [loss]);
  const x = (r: number) => 40 + (r / (ROUNDS - 1)) * 580, y = (w: number) => 190 - (Math.min(w, 140) / 140) * 170;
  const avg = (points: number[]) => Math.round((points.reduce((s, w) => s + Math.min(w, CAP), 0) / points.length / CAP) * 100);
  const names: Record<Algo, string> = { reno: "Reno", cubic: "CUBIC", bbr: "BBR" };
  return <div className="fx-cwnd">
    <div className="fx-toolbar"><Segmented label="Random packet loss" value={loss} onChange={setLoss} options={[["0", "No random loss"], ["0.001", "0.1% loss"], ["0.01", "1% loss"]]} /></div>
    <div className="fx-scroll" role="region" aria-label="Congestion window chart" tabIndex={0}>
      <svg className="fx-svg" viewBox="0 0 640 220" style={{ minWidth: 520 }} role="img" aria-labelledby={`${id}-t`}>
        <title id={`${id}-t`}>{series.map((s) => `${names[s.algo]} averages ${avg(s.points)}% of capacity`).join(". ")}</title>
        {[0, 50, 100].map((w) => <g key={w}><line x1="40" x2="620" y1={y(w)} y2={y(w)} className="fx-gridline" /><text x="32" y={y(w) + 4} textAnchor="end" className="fx-svg-note">{w}</text></g>)}
        <line x1="40" x2="620" y1={y(CAP)} y2={y(CAP)} className="fx-capline" />
        <text x="620" y={y(CAP) - 6} textAnchor="end" className="fx-svg-note">path capacity</text>
        {series.map((s) => <polyline key={s.algo} className={`fx-series is-${s.algo}`} points={s.points.map((w, r) => `${x(r).toFixed(1)},${y(w).toFixed(1)}`).join(" ")} />)}
        <text x="330" y="214" textAnchor="middle" className="fx-svg-note">round trips →</text>
        <text x="12" y="110" className="fx-svg-note" transform="rotate(-90 12 110)" textAnchor="middle">window (segments)</text>
      </svg>
    </div>
    <div className="fx-legend">{series.map((s) => <span key={s.algo}><i className={`is-${s.algo}`} />{names[s.algo]} · {avg(s.points)}% of capacity used</span>)}</div>
  </div>;
}
