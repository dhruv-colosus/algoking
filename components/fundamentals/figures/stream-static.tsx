/* Static illustrations for Module 6. */

type Msg = [number, "up" | "down", string?];
const patterns: { name: string; note: string; msgs: Msg[] }[] = [
  { name: "Request–response", note: "One question, one answer", msgs: [[10, "up"], [40, "down"]] },
  { name: "Server-Sent Events", note: "One request, a stream of events back", msgs: [[8, "up"], [26, "down"], [38, "down"], [50, "down"], [62, "down"], [74, "down"], [86, "down"]] },
  { name: "WebSocket", note: "Either side, any time", msgs: [[8, "up"], [20, "down"], [30, "up"], [38, "down"], [52, "up"], [60, "up"], [72, "down"], [86, "down"]] },
  { name: "gRPC bidirectional", note: "Two typed streams on one HTTP/2 stream", msgs: [[8, "up"], [16, "up"], [24, "down"], [34, "up"], [44, "down"], [56, "down"], [66, "up"], [80, "down"]] },
  { name: "Job handle", note: "Start, then short polls with the ID", msgs: [[6, "up", "start"], [14, "down", "id"], [44, "up", "poll"], [50, "down", "running"], [80, "up", "poll"], [86, "down", "done"]] },
];

export function StreamDirections() {
  return <div className="fx-directions">
    <div className="fx-directions-head" aria-hidden="true"><span /><span>client ↑ · server ↓ · time →</span></div>
    {patterns.map((p) => <div key={p.name} className="fx-direction-row">
      <div><strong>{p.name}</strong><span>{p.note}</span></div>
      <svg viewBox="0 0 100 34" preserveAspectRatio="none" role="img" aria-label={`${p.name}: ${p.msgs.filter((m) => m[1] === "up").length} client messages and ${p.msgs.filter((m) => m[1] === "down").length} server messages`}>
        <line x1="0" x2="100" y1="4" y2="4" className="fx-dir-lane" />
        <line x1="0" x2="100" y1="30" y2="30" className="fx-dir-lane" />
        {p.msgs.map(([x, dir], i) => <line key={i} x1={x} x2={x + 4} y1={dir === "up" ? 4 : 30} y2={dir === "up" ? 30 : 4} className={`fx-dir-msg is-${dir}`} vectorEffect="non-scaling-stroke" />)}
      </svg>
    </div>)}
    <div className="fx-legend"><span><i className="is-up" />Client to server</span><span><i className="is-down" />Server to client</span></div>
  </div>;
}

export function WebsocketFrame() {
  const fields: [string, string, number, string][] = [
    ["FIN", "1", 1, "last fragment"], ["RSV1–3", "000", 3, "extensions"], ["opcode", "0001", 4, "text"],
    ["MASK", "1", 1, "client frame"], ["length", "0000010", 7, "2 bytes"],
  ];
  return <div className="fx-wsframe">
    <span className="fx-actor-role">Client sends the text message “Hi”</span>
    <div className="fx-scroll" role="region" aria-label="Frame header bits" tabIndex={0}>
      <div className="fx-bitfields">{fields.map(([name, bits, width, meaning]) => <div key={name} style={{ flexGrow: width }} className={name === "opcode" ? "is-gold" : name === "MASK" ? "is-purple" : ""}>
        <span className="fx-bitfield-bits">{bits.split("").map((b, i) => <i key={i}>{b}</i>)}</span>
        <strong>{name}</strong><em>{meaning}</em>
      </div>)}</div>
    </div>
    <table className="fx-table fx-ws-bytes">
      <thead><tr><th scope="col">Bytes</th><th scope="col">Hex</th><th scope="col">Meaning</th></tr></thead>
      <tbody>
        <tr><td>0–1</td><td><code>81 82</code></td><td>FIN + text opcode; mask bit + length 2</td></tr>
        <tr><td>2–5</td><td><code>37 FA 21 3D</code></td><td>Masking key, random per frame</td></tr>
        <tr><td>6–7</td><td><code>7F 93</code></td><td>“Hi” (48 69) XOR the key’s first two bytes</td></tr>
      </tbody>
    </table>
    <p className="fx-note">Payloads of 126 bytes or more use a 2-byte or 8-byte extended length after the first two bytes. Server-to-client frames carry no mask.</p>
  </div>;
}

export function LbPinning() {
  const backends = (counts: number[], x: number) => counts.map((n, i) => <g key={i} className={`fx-node${n === 0 ? " is-idle" : ""}`}><rect x={x} y={20 + i * 52} width="120" height="40" rx="6" /><text x={x + 12} y={38 + i * 52} className="fx-svg-strong is-small">Backend {i + 1}</text><text x={x + 12} y={53 + i * 52} className="fx-svg-note">{n} calls</text></g>);
  return <div className="fx-scroll" role="region" aria-label="Load balancing comparison" tabIndex={0}>
    <svg className="fx-svg" viewBox="0 0 720 190" style={{ minWidth: 640 }} role="img" aria-labelledby="lb-t">
      <title id="lb-t">With an L4 balancer, all 12 calls on one HTTP/2 connection reach backend 1. With an L7 balancer, the calls are spread 4, 4 and 4.</title>
      <text x="10" y="12" className="fx-svg-heading">L4: balances connections</text>
      <text x="370" y="12" className="fx-svg-heading">L7: balances requests</text>
      {[0, 360].map((ox) => <g key={ox}>
        <g className="fx-node is-gold"><rect x={ox + 10} y="72" width="80" height="40" rx="6" /><text x={ox + 22} y="96" className="fx-svg-strong is-small">Client</text></g>
        <g className="fx-node"><rect x={ox + 130} y="72" width="70" height="40" rx="6" /><text x={ox + 142} y="90" className="fx-svg-strong is-small">{ox ? "L7" : "L4"}</text><text x={ox + 142} y="104" className="fx-svg-note">balancer</text></g>
        <line x1={ox + 90} x2={ox + 130} y1="92" y2="92" className="fx-conn" />
      </g>)}
      <line x1="200" x2="230" y1="92" y2="40" className="fx-conn" />
      {[40, 92, 144].map((y, i) => <line key={y} x1="560" x2="590" y1="92" y2={y} className={`fx-conn${i ? " is-thin" : ""}`} />)}
      <line x1="560" x2="590" y1="92" y2="40" className="fx-conn is-thin" />
      {backends([12, 0, 0], 230)}
      {backends([4, 4, 4], 590)}
      <text x="10" y="182" className="fx-svg-note">One long HTTP/2 connection carries every call; an L4 balancer picked its backend once.</text>
    </svg>
  </div>;
}
