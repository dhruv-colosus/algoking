/* Static illustration for Module 7. */

export function SchemaEvolution() {
  const cells: [string, string, string, "good" | "warn" | "bad"][] = [
    ["v1 writer", "v1 reader", "Same schema. Works.", "good"],
    ["v1 writer", "v2 reader", "Field 5 (idempotency_key) is missing, so the reader sees its default, an empty string. Code must handle that.", "warn"],
    ["v2 writer", "v1 reader", "Field 5 is unknown. The reader skips it using its wire type and keeps the bytes. Works.", "good"],
    ["v2 writer", "v2 reader", "Same schema. Works.", "good"],
    ["Old v1 writer", "v3 reader that reused number 3", "Field 3 meant priority (sint32); v3 reads it as timeout_ms (int32). Silent wrong data.", "bad"],
  ];
  return <div className="fx-evolution">
    <div className="fx-evolution-schemas">
      <pre className="fx-term">{`// v1
int64  id       = 1;
string name     = 2;
sint32 priority = 3;
repeated int32 ranks = 4;`}</pre>
      <pre className="fx-term">{`// v2
int64  id       = 1;
string name     = 2;
reserved 3;
repeated int32 ranks = 4;
string idempotency_key = 5;`}</pre>
    </div>
    <ul className="fx-evolution-cells">{cells.map(([writer, reader, text, tone]) => <li key={writer + reader} className={`is-${tone}`}><span>{writer} → {reader}</span><p>{text}</p></li>)}</ul>
  </div>;
}
