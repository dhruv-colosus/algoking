/* Static illustrations for Module 5. */

export function ConnectionMigration() {
  return <div className="fx-compare">
    <div className="fx-compare-col is-bad">
      <h4>TCP: the 4-tuple is the connection</h4>
      <ol>
        <li>Streaming from <code>10.0.0.5:51000</code> on Wi-Fi</li>
        <li>Phone switches to cellular: new address <code>100.64.3.9</code></li>
        <li>Server has no connection for the new 4-tuple: reset</li>
        <li>Client reconnects: TCP + TLS handshakes, slow start</li>
        <li>Request is sent again; tokens 1–900 are generated again or lost</li>
      </ol>
      <pre className="fx-term">{`token 900 ✓
── network change ──
ECONNRESET
reconnect … 3 RTT
answer restarts`}</pre>
    </div>
    <div className="fx-compare-col is-good">
      <h4>QUIC: the connection ID is the connection</h4>
      <ol>
        <li>Packets carry destination connection ID <code>7f3a…</code></li>
        <li>Phone switches to cellular: new address, same ID</li>
        <li>Server matches the ID to the existing connection</li>
        <li>Path validation: PATH_CHALLENGE and PATH_RESPONSE</li>
        <li>Stream continues from token 901</li>
      </ol>
      <pre className="fx-term">{`token 900 ✓
── network change ──
path validated (1 RTT)
token 901 ✓ token 902 ✓`}</pre>
    </div>
  </div>;
}

export function ClientHelloSize() {
  const rows: { name: string; parts: [string, number, string][] }[] = [
    { name: "Classical (X25519)", parts: [["Base fields and extensions", 450, "base"], ["X25519 share", 32, "x25519"]] },
    { name: "Hybrid (X25519MLKEM768)", parts: [["Base fields and extensions", 450, "base"], ["X25519 share", 32, "x25519"], ["ML-KEM-768 key", 1184, "mlkem"]] },
  ];
  const limit = 1460, scale = 1800;
  return <div className="fx-hello">
    {rows.map((row) => {
      const total = row.parts.reduce((n, [, b]) => n + b, 0);
      return <div key={row.name} className="fx-hello-row">
        <span className="fx-hello-name">{row.name}<em>≈ {total.toLocaleString("en-US")} B</em></span>
        <div className="fx-hello-track" role="img" aria-label={`${row.name}: about ${total} bytes, ${total > limit ? "more" : "less"} than one TCP segment`}>
          {row.parts.map(([label, bytes, kind]) => <span key={label} className={`is-${kind}`} style={{ width: `${(bytes / scale) * 100}%` }} title={`${label}: ${bytes} B`} />)}
          <i className="fx-hello-limit" style={{ left: `${(limit / scale) * 100}%` }} />
        </div>
      </div>;
    })}
    <div className="fx-legend"><span><i className="is-base" />Fields and extensions (varies by client)</span><span><i className="is-x25519" />X25519 share, 32 B</span><span><i className="is-mlkem" />ML-KEM-768 key, 1,184 B</span><span><i className="is-limit" />One TCP segment ≈ 1,460 B</span></div>
  </div>;
}
