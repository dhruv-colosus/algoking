/* Static illustrations for Module 4. */

export function NatTimeout() {
  const rows: [string, string, string, string, string][] = [
    ["192.168.1.20:51544", "203.0.113.7:40001", "api.example.com:443", "idle 3 s", "active"],
    ["192.168.1.20:51545", "203.0.113.7:40002", "cdn.example.net:443", "idle 58 s", "expiring"],
    ["192.168.1.20:51546", "203.0.113.7:40003", "tools.example.com:443", "idle 75 s", "expired"],
  ];
  return <div className="fx-nat">
    <div className="fx-scroll" role="region" aria-label="NAT translation table" tabIndex={0}>
      <table className="fx-table">
        <caption>NAT table · idle timeout 60 s</caption>
        <thead><tr><th scope="col">Inside</th><th scope="col">Outside (public)</th><th scope="col">Destination</th><th scope="col">Last packet</th><th scope="col">State</th></tr></thead>
        <tbody>{rows.map(([inside, outside, dest, idle, state]) => <tr key={inside} className={`is-${state}`}><td><code>{inside}</code></td><td><code>{outside}</code></td><td><code>{dest}</code></td><td>{idle}</td><td><span className="fx-state">{state}</span></td></tr>)}</tbody>
      </table>
    </div>
    <div className="fx-nat-timeline" aria-label="Timeline of one stream through the NAT">
      <div className="fx-nat-track">
        <span className="is-traffic" style={{ width: "18%" }}>tokens flowing</span>
        <span className="is-quiet" style={{ width: "30%" }}>tool runs, no traffic</span>
        <span className="is-gone" style={{ width: "40%" }}>mapping expired · nobody told</span>
        <span className="is-reset" style={{ width: "12%" }}>write → reset</span>
      </div>
      <div className="fx-nat-axis"><span>0 s</span><span>60 s idle → entry removed</span><span>5 min: server writes</span></div>
    </div>
  </div>;
}

export function DnsResolution() {
  const boxes: [string, string, number, number, string][] = [
    ["Your program", "getaddrinfo()", 20, 40, ""],
    ["Stub resolver", "OS cache", 20, 150, ""],
    ["Recursive resolver", "ISP or 1.1.1.1 · big cache", 250, 95, "is-gold"],
    ["Root servers", "“ask .com”", 520, 20, ""],
    [".com servers", "“ask ns1.dnshost.net”", 520, 105, ""],
    ["Authoritative", "A 203.0.113.7 · TTL 300", 520, 190, "is-good"],
  ];
  const arrows: [number, number, number, number, string][] = [
    [100, 84, 100, 146, "1"], [204, 162, 246, 118, "2"], [410, 108, 516, 50, "3"], [410, 118, 516, 128, "4"], [410, 128, 516, 210, "5"], [250, 134, 206, 180, "6"],
  ];
  return <div className="fx-scroll" role="region" aria-label="DNS resolution diagram" tabIndex={0}>
    <svg className="fx-svg" viewBox="0 0 720 260" style={{ minWidth: 620 }} role="img" aria-labelledby="dns-t dns-d">
      <title id="dns-t">How a name is resolved</title>
      <desc id="dns-d">The program asks the stub resolver, which asks a recursive resolver. On a cold cache, the recursive resolver asks a root server, then the .com servers, then the domain authoritative server, and returns the address, caching every answer for its TTL.</desc>
      <defs><marker id="dns-a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" className="fx-arrow-head" /></marker></defs>
      {boxes.map(([title, sub, x, y, cls]) => <g key={title} className={`fx-node ${cls}`}><rect x={x} y={y} width={title === "Recursive resolver" ? 160 : 180} height="44" rx="7" /><text x={x + 12} y={y + 19} className="fx-svg-strong">{title}</text><text x={x + 12} y={y + 35} className="fx-svg-note">{sub}</text></g>)}
      {arrows.map(([x1, y1, x2, y2, n]) => <g key={n}><line x1={x1} y1={y1} x2={x2} y2={y2} className="fx-pointer" markerEnd="url(#dns-a)" /><circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r="8" className="fx-step-dot" /><text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 3.5} textAnchor="middle" className="fx-step-num">{n}</text></g>)}
      <text x="20" y="250" className="fx-svg-note">Steps 3–5 happen only on a cold cache. Warm lookups stop at step 2 or earlier.</text>
    </svg>
  </div>;
}
