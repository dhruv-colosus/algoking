"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/button";
import { entropy, frequencies, huffman, lz77, lzBits } from "@/lib/fundamentals/toy-codecs";
import { kb, ms } from "./controls";
import { Segmented } from "./segmented";

const glyph = (ch: string) => (ch === " " ? "␠" : ch === "\n" ? "↵" : ch);

function TextPicker({ value, onChange, presets, max = 80 }: { value: string; onChange: (v: string) => void; presets: [string, string][]; max?: number }) {
  const id = useId();
  return <div className="fx-toolbar">
    <label className="fx-input-label" htmlFor={id}>Text</label>
    <input id={id} className="fx-input" value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
    <div className="fx-chip-row" role="group" aria-label="Examples">{presets.map(([label, text]) => <button key={label} type="button" className="fx-chip" aria-pressed={value === text} onClick={() => onChange(text)}>{label}</button>)}</div>
  </div>;
}

/* ---------- Entropy meter ---------- */

const entropyPresets: [string, string][] = [["Skewed", "aaaaaaaaaaaaaaabbbbcc"], ["Repetitive", "hello hello hello hello"], ["English", "the quick brown fox jumps over the lazy dog"], ["Random", "x8#Qp!2zLm@7vR$k9^Wd"]];

export function EntropyMeter() {
  const [text, setText] = useState(entropyPresets[2][1]);
  const n = Array.from(text).length;
  const freq = frequencies(text);
  const h = entropy(text);
  const top = freq.slice(0, 12);
  const maxCount = top[0]?.[1] ?? 1;
  return <div className="fx-entropy">
    <TextPicker value={text} onChange={setText} presets={entropyPresets} />
    <ol className="fx-freq">{top.map(([ch, count]) => <li key={ch}>
      <code>{glyph(ch)}</code>
      <span className="fx-freq-bar"><span style={{ width: `${(count / maxCount) * 100}%` }} /></span>
      <span className="fx-freq-num">{count}×</span>
      <span className="fx-freq-bits">{(-Math.log2(count / n)).toFixed(2)} bits</span>
    </li>)}{freq.length > top.length ? <li className="fx-empty">+ {freq.length - top.length} rarer symbols</li> : null}</ol>
    <dl className="fx-readout is-four">
      <div><dt>Characters</dt><dd>{n}</dd></div>
      <div><dt>Entropy</dt><dd>{h.toFixed(2)} bits/char</dd></div>
      <div><dt>Floor for this model</dt><dd>{Math.ceil(h * n)} bits</dd></div>
      <div><dt>As 8-bit text</dt><dd>{n * 8} bits</dd></div>
    </dl>
  </div>;
}

/* ---------- Huffman ---------- */

export function HuffmanTree() {
  const [text, setText] = useState("abracadabra alakazam");
  const codes = huffman(text);
  const freq = frequencies(text);
  const n = Array.from(text).length;
  const bits = freq.reduce((sum, [ch, c]) => sum + c * (codes.get(ch)?.length ?? 0), 0);
  const encoded = Array.from(text).slice(0, 24);
  return <div className="fx-huff">
    <TextPicker value={text} onChange={setText} presets={[["Magic", "abracadabra alakazam"], ["Skewed", "aaaaaaaaab"], ["Even", "abcdefgh"], ["Sentence", "she sells sea shells by the sea shore"]]} />
    <div className="fx-scroll" role="region" aria-label="Huffman code table" tabIndex={0}>
      <table className="fx-table">
        <thead><tr><th scope="col">Symbol</th><th scope="col">Count</th><th scope="col">Huffman code</th><th scope="col">Bits</th><th scope="col">Ideal −log₂ p</th></tr></thead>
        <tbody>{freq.map(([ch, c]) => <tr key={ch}><td><code>{glyph(ch)}</code></td><td>{c}</td><td><code className="fx-code-bits">{codes.get(ch)}</code></td><td>{codes.get(ch)?.length}</td><td>{(-Math.log2(c / n)).toFixed(2)}</td></tr>)}</tbody>
      </table>
    </div>
    <div className="fx-bitstream" aria-label="Start of the encoded bit stream">{encoded.map((ch, i) => <span key={i} className={i % 2 ? "is-alt" : ""}><em>{glyph(ch)}</em>{codes.get(ch)}</span>)}{n > encoded.length ? <span className="fx-empty">…</span> : null}</div>
    <dl className="fx-readout">
      <div><dt>8-bit text</dt><dd>{n * 8} bits</dd></div>
      <div><dt>Huffman</dt><dd className="is-good">{bits} bits</dd></div>
      <div><dt>Entropy floor</dt><dd>{Math.ceil(entropy(text) * n)} bits</dd></div>
    </dl>
  </div>;
}

/* ---------- LZ77 ---------- */

export function Lz77Demo() {
  const id = useId();
  const [text, setText] = useState('{"type":"tool_result","id":1},{"type":"tool_result","id":2}');
  const [windowSize, setWindowSize] = useState(32);
  const tokens = lz77(text, windowSize);
  const bits = lzBits(tokens, windowSize);
  const n = Array.from(text).length;
  return <div className="fx-lz">
    <TextPicker value={text} onChange={setText} max={120} presets={[["Repeat", "abcabcabcabc"], ["Hamlet", "to be or not to be, that is the question"], ["JSON", '{"type":"tool_result","id":1},{"type":"tool_result","id":2}']]} />
    <div className="fx-slider is-inline"><label htmlFor={`${id}-w`}>Window<strong>{windowSize} chars</strong></label><input id={`${id}-w`} type="range" min={4} max={64} step={4} value={windowSize} onChange={(e) => setWindowSize(Number(e.target.value))} /></div>
    <p className="fx-lz-tokens" aria-label="Tokens">{tokens.map((t, i) => t.kind === "literal" ? <span key={i} className="is-lit">{glyph(t.text)}</span> : <span key={i} className="is-match" title={`copy ${t.length} from ${t.distance} back`}><em>↩{t.distance},{t.length}</em>{t.text}</span>)}</p>
    <dl className="fx-readout is-four">
      <div><dt>Literals</dt><dd>{tokens.filter((t) => t.kind === "literal").length}</dd></div>
      <div><dt>Matches</dt><dd>{tokens.filter((t) => t.kind === "match").length}</dd></div>
      <div><dt>Estimated size</dt><dd>{Math.ceil(bits / 8)} B</dd></div>
      <div><dt>vs 8-bit text</dt><dd className={bits < n * 8 ? "is-good" : "is-bad"}>{Math.round((bits / (n * 8)) * 100)}%</dd></div>
    </dl>
    <p className="fx-note">Toy cost model: a literal costs 9 bits (flag + byte); a match costs 1 + {Math.ceil(Math.log2(windowSize + 1))} distance bits + 8 length bits. Real codecs entropy-code these too.</p>
  </div>;
}

/* ---------- Codec decision ---------- */

// Illustrative orders of magnitude for JSON-like text. Measure your own data.
const codecs: { name: string; ratio: number; comp: number; decomp: number }[] = [
  { name: "None", ratio: 1, comp: Infinity, decomp: Infinity },
  { name: "LZ4", ratio: 2.1, comp: 700, decomp: 4000 },
  { name: "gzip -6", ratio: 3.2, comp: 35, decomp: 400 },
  { name: "zstd -3", ratio: 3.4, comp: 350, decomp: 1200 },
  { name: "zstd -19", ratio: 4.2, comp: 4, decomp: 1100 },
  { name: "Brotli -11", ratio: 4.4, comp: 1, decomp: 450 },
];
const sizes = [0.05, 0.5, 2, 20], speeds = [5, 20, 100, 1000];

export function CodecDecision() {
  const id = useId();
  const [size, setSize] = useState(2);
  const [mbps, setMbps] = useState(20);
  const [reads, setReads] = useState("1");
  const readers = Number(reads);
  const rows = codecs.map((c) => {
    const compress = c.comp === Infinity ? 0 : (size / c.comp) * 1000 / readers;
    const transfer = ((size / c.ratio) * 8 / mbps) * 1000;
    const decompress = c.decomp === Infinity ? 0 : (size / c.decomp) * 1000;
    return { ...c, compress, transfer, decompress, total: compress + transfer + decompress };
  });
  const best = rows.reduce((a, b) => (b.total < a.total ? b : a));
  const max = Math.max(...rows.map((r) => r.total));
  return <div className="fx-codec">
    <div className="fx-sliders is-row">
      <div className="fx-slider"><label htmlFor={`${id}-s`}>Payload<strong>{kb(size * 1e6)}</strong></label><input id={`${id}-s`} type="range" min={0} max={sizes.length - 1} value={sizes.indexOf(size)} onChange={(e) => setSize(sizes[Number(e.target.value)])} aria-valuetext={kb(size * 1e6)} /></div>
      <div className="fx-slider"><label htmlFor={`${id}-b`}>Reader bandwidth<strong>{mbps} Mbps</strong></label><input id={`${id}-b`} type="range" min={0} max={speeds.length - 1} value={speeds.indexOf(mbps)} onChange={(e) => setMbps(speeds[Number(e.target.value)])} aria-valuetext={`${mbps} megabits per second`} /></div>
      <div><span className="fx-input-label">Times it is read</span><Segmented label="Times read" value={reads} onChange={setReads} options={[["1", "Once"], ["1000", "1,000×"], ["1000000", "1,000,000×"]]} /></div>
    </div>
    <ol className="fx-wf-rows">{rows.map((r) => <li key={r.name} className={r === best ? "is-best" : ""}>
      <span className="fx-wf-name">{r.name}{r === best ? " · best" : ""}</span>
      <span className="fx-wf-track">
        <span className="fx-wf-bar is-compress" style={{ width: `${(r.compress / max) * 100}%` }} title={`compress ${ms(r.compress)} per read`} />
        <span className="fx-wf-bar is-transfer" style={{ width: `${(r.transfer / max) * 100}%` }} title={`transfer ${ms(r.transfer)}`} />
        <span className="fx-wf-bar is-decompress" style={{ width: `${(r.decompress / max) * 100}%` }} title={`decompress ${ms(r.decompress)}`} />
      </span>
      <strong className="fx-wf-total">{ms(r.total)}</strong>
    </li>)}</ol>
    <div className="fx-legend"><span><i className="is-compress" />Compress (shared across reads)</span><span><i className="is-transfer" />Transfer</span><span><i className="is-decompress" />Decompress</span></div>
  </div>;
}

/* ---------- Length oracle ---------- */

const SECRET = "7f3a9c";
const ALPHABET = "0123456789abcdef";
const page = (guess: string) => `GET /search?q=token=${guess}\nCookie: lang=en; token=${SECRET}`;

export function CrimeOracle() {
  const [known, setKnown] = useState("");
  const done = known.length >= SECRET.length;
  const sizes = Array.from(ALPHABET, (ch) => ({ ch, bits: lzBits(lz77(page(known + ch), 64), 64) }));
  const minBits = Math.min(...sizes.map((s) => s.bits));
  const winners = sizes.filter((s) => s.bits === minBits);
  const maxBits = Math.max(...sizes.map((s) => s.bits));
  return <div className="fx-oracle">
    <code className="fx-oracle-page">{page(known + "?")}</code>
    <div className="fx-oracle-bars" role="img" aria-label={`Compressed sizes per guess; smallest: ${winners.map((w) => w.ch).join(", ")}`}>
      {sizes.map((s) => <span key={s.ch} className={s.bits === minBits ? "is-min" : ""}><i style={{ height: `${20 + ((s.bits - minBits + 1) / (maxBits - minBits + 1)) * 70}%` }} /><em>{s.ch}</em><b>{s.bits}</b></span>)}
    </div>
    <div className="fx-toolbar">
      <span className="fx-oracle-known">Recovered: <code>{known || "—"}</code>{done ? " ✓ the whole token" : ""}</span>
      <div className="fx-buttons">
        <Button variant="ghost" size="sm" onClick={() => setKnown("")}>Reset</Button>
        <Button variant="primary" size="sm" disabled={done || winners.length !== 1} onClick={() => setKnown(known + winners[0].ch)}>Keep the smallest guess</Button>
      </div>
    </div>
    <p className={`fx-status${done ? " is-bad" : ""}`} aria-live="polite">{done ? "Six rounds of 16 guesses each recovered the secret without ever decrypting anything. Only sizes were observed." : `Guess ${winners[0].ch} compresses ${maxBits - minBits} bits smaller than the worst guess: it extends a match with the real token. Sizes come from this course's toy LZ77 model.`}</p>
  </div>;
}
