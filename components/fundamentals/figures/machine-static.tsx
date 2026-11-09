/* Static illustrations for Module 1. */

const sign = "0", exponent = "01111111011", fraction = "1001100110011001100110011001100110011001100110011010";

export function FloatAnatomy() {
  const fields: [string, string, string, string][] = [
    ["sign", sign, "1 bit", "0 → positive"],
    ["exponent", exponent, "11 bits", "1019 − 1023 = −4"],
    ["fraction", fraction, "52 bits", "1.6000000000000000888…"],
  ];
  return <div className="fx-float">
    <div className="fx-scroll" role="region" aria-label="The 64 bits of the double nearest 0.1" tabIndex={0}>
      <div className="fx-float-bits">
        {fields.map(([name, bits, width, meaning]) => <div key={name} className={`fx-float-field is-${name}`}>
          <div className="fx-float-cells">{bits.split("").map((b, i) => <span key={i}>{b}</span>)}</div>
          <div className="fx-float-label"><strong>{name}</strong><span>{width}</span></div>
          <div className="fx-float-meaning">{meaning}</div>
        </div>)}
      </div>
    </div>
    <div className="fx-float-equation">
      <span>value = (−1)<sup>0</sup> × 1.6000000000000000888 × 2<sup>−4</sup></span>
      <strong>= 0.1000000000000000055511151231257827…</strong>
    </div>
    <dl className="fx-readout">
      <div><dt>Stored as hex</dt><dd>0x3FB999999999999A</dd></div>
      <div><dt>Exact integers up to</dt><dd>2<sup>53</sup></dd></div>
      <div><dt>0.1 + 0.2</dt><dd>0.30000000000000004</dd></div>
    </dl>
  </div>;
}

export function MemoryLayout() {
  return <div className="fx-scroll" role="region" aria-label="Stack frames pointing to heap objects, and struct padding" tabIndex={0}>
    <svg className="fx-svg" viewBox="0 0 720 400" style={{ minWidth: 620 }} role="img" aria-labelledby="mem-title mem-desc">
      <title id="mem-title">Stack and heap</title>
      <desc id="mem-desc">The stack holds three frames: main, runTurn and parseToolResult. Locals in runTurn and parseToolResult point to a messages array and a result object on the heap. Below, a struct with fields char, int32 and char uses 12 bytes with padding, while the reordered struct uses 8.</desc>
      <defs><marker id="mem-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 8 4 0 8z" className="fx-arrow-head" /></marker></defs>
      <text x="24" y="26" className="fx-svg-heading">Stack · grows down</text>
      <text x="400" y="26" className="fx-svg-heading">Heap · managed by the allocator or GC</text>
      {[
        { y: 40, name: "main()", vars: ["argv"], top: false },
        { y: 112, name: "runTurn()", vars: ["turn = 7", "messages ●"], top: false },
        { y: 184, name: "parseToolResult()", vars: ["raw ●", "result ●"], top: true },
      ].map((frame) => <g key={frame.name} className={`fx-frame${frame.top ? " is-top" : ""}`}>
        <rect x="24" y={frame.y} width="280" height="64" rx="6" />
        <text x="38" y={frame.y + 22} className="fx-svg-strong">{frame.name}</text>
        {frame.vars.map((v, i) => <text key={v} x={38 + i * 120} y={frame.y + 46} className="fx-svg-mono">{v}</text>)}
        {frame.top ? <text x="312" y={frame.y + 36} className="fx-svg-note">← top</text> : null}
      </g>)}
      <g className="fx-heap">
        <rect x="400" y="54" width="290" height="58" rx="6" /><text x="414" y="76" className="fx-svg-strong">messages: Array(42)</text><text x="414" y="98" className="fx-svg-mono">[ptr, ptr, ptr, …]</text>
        <rect x="400" y="138" width="200" height="50" rx="6" /><text x="414" y="160" className="fx-svg-strong">raw: string</text><text x="414" y="178" className="fx-svg-mono">2.1 MB of tool output</text>
        <rect x="470" y="208" width="220" height="50" rx="6" className="is-new" /><text x="484" y="230" className="fx-svg-strong">result: object</text><text x="484" y="248" className="fx-svg-mono">survives the return</text>
      </g>
      <path d="M 232 157 C 330 157, 330 84, 398 84" className="fx-pointer" markerEnd="url(#mem-arrow)" />
      <path d="M 78 236 C 90 290, 350 170, 398 165" className="fx-pointer" markerEnd="url(#mem-arrow)" />
      <path d="M 220 236 C 260 280, 420 260, 468 236" className="fx-pointer" markerEnd="url(#mem-arrow)" />
      <text x="24" y="292" className="fx-svg-heading">Field order changes size</text>
      {[
        { y: 304, label: "char · int32 · char = 12 bytes", cells: ["k", "p", "p", "p", "t", "t", "t", "t", "d", "p", "p", "p"] },
        { y: 340, label: "int32 · char · char = 8 bytes", cells: ["t", "t", "t", "t", "k", "d", "p", "p"] },
      ].map((row) => <g key={row.label}>
        {row.cells.map((c, i) => <rect key={i} x={24 + i * 26} y={row.y} width="24" height="24" rx="3" className={`fx-byte is-${c}`} />)}
        {row.cells.map((c, i) => <text key={`t${i}`} x={36 + i * 26} y={row.y + 16} textAnchor="middle" className="fx-svg-mono is-small">{c === "p" ? "·" : c}</text>)}
        <text x={24 + row.cells.length * 26 + 14} y={row.y + 16} className="fx-svg-note">{row.label}</text>
      </g>)}
      <text x="24" y="392" className="fx-svg-note">k = kind (char) · t = tokens (int32) · d = done (char) · dot = padding byte</text>
    </svg>
  </div>;
}

export function FalseSharing() {
  const line = (cells: ["hits" | "misses", "a" | "b"][]) => <div className="fx-line" aria-hidden="true">
    {Array.from({ length: 8 }, (_, i) => <span key={i} className={cells[i] ? `is-${cells[i][1]}` : ""}>{cells[i]?.[0] ?? ""}</span>)}
  </div>;
  return <div className="fx-sharing">
    <div className="fx-sharing-case is-bad">
      <h4>Same line: ping-pong</h4>
      <div className="fx-core"><strong>Core 0 · thread A</strong><span>writes <code>hits</code></span>{line([["hits", "a"], ["misses", "b"]])}</div>
      <div className="fx-sharing-bounce" aria-hidden="true"><span>invalidate ↓</span><span>↑ invalidate</span></div>
      <div className="fx-core"><strong>Core 1 · thread B</strong><span>writes <code>misses</code></span>{line([["hits", "a"], ["misses", "b"]])}</div>
      <p>Every write forces the other core to fetch the 64-byte line again, roughly 100 ns each time.</p>
    </div>
    <div className="fx-sharing-case is-good">
      <h4>Padded: each line has one owner</h4>
      <div className="fx-core"><strong>Core 0 · thread A</strong><span>writes <code>hits</code></span>{line([["hits", "a"]])}</div>
      <div className="fx-sharing-bounce is-quiet" aria-hidden="true"><span>no traffic</span></div>
      <div className="fx-core"><strong>Core 1 · thread B</strong><span>writes <code>misses</code></span>{line([["misses", "b"]])}</div>
      <p>Each counter sits alone in its line, so both cores keep their copy and write at L1 speed.</p>
    </div>
  </div>;
}

const json = `{"id":7,"ok":[]}`;
const inString = (() => { let inside = false; return json.split("").map((c) => { if (c === '"') { inside = !inside; return false; } return inside; }); })();

export function SimdLanes() {
  return <div className="fx-simd">
    <div className="fx-simd-row">
      <span className="fx-simd-label">Scalar · 8 instructions</span>
      <div className="fx-simd-lanes is-scalar">{Array.from({ length: 8 }, (_, i) => <span key={i} className={i === 0 ? "is-active" : ""}>a{i}+b{i}</span>)}</div>
    </div>
    <div className="fx-simd-row">
      <span className="fx-simd-label">SIMD · 1 instruction, 8 lanes</span>
      <div className="fx-simd-lanes is-vector">{Array.from({ length: 8 }, (_, i) => <span key={i} className="is-active">a{i}+b{i}</span>)}</div>
    </div>
    <div className="fx-simd-json" role="img" aria-label={`simdjson classifies the 16 bytes ${json} at once into a quote mask and a structural-character mask.`}>
      <div className="fx-simd-mask"><span className="fx-simd-label">Input bytes</span><div>{json.split("").map((c, i) => <span key={i} className="is-char">{c}</span>)}</div></div>
      <div className="fx-simd-mask"><span className="fx-simd-label">Quote mask</span><div>{json.split("").map((c, i) => <span key={i} className={c === '"' ? "is-one" : ""}>{c === '"' ? 1 : 0}</span>)}</div></div>
      <div className="fx-simd-mask"><span className="fx-simd-label">Structural mask</span><div>{json.split("").map((c, i) => { const s = "{}[]:,".includes(c) && !inString[i]; return <span key={i} className={s ? "is-one" : ""}>{s ? 1 : 0}</span>; })}</div></div>
    </div>
  </div>;
}
