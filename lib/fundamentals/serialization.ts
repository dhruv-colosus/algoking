import type { CourseModule } from "./types";

export const serialization: CourseModule = {
  number: 7,
  slug: "serialization",
  title: "Serialization",
  shortTitle: "Serialization",
  tagline: "QUIC moves bytes and Protobuf defines what the bytes mean. Choose a format by who reads it, how the schema will evolve and how much of the data you touch.",
  intuition: "JSON repeats every field name in every message. Protobuf replaces names with small numbers agreed in a schema. Columnar and zero-copy formats go further and avoid parsing altogether. And for agents there is a twist: the model reads text and you pay per token, so the right format for a model is rarely the right format for a wire.",
  harness: "Tool schemas, tool results, prompt prefixes and trace storage are all serialization decisions. A change in key order can silently break prompt caching and double your bill; a careless number type can corrupt an ID.",
  levels: {
    Basics: ["JSON grammar", "Base64", "JSON Lines", "Big and little endian", "Why JSON numbers lose precision above 2^53"],
    Depth: ["Varints and zigzag", "Tag and wire types", "Schema evolution", "Unknown fields", "Why field numbers are never reused", "Canonical serialization", "Streaming parsers"],
    Current: ["SIMD JSON parsing", "Protobuf Editions", "Connect RPC", "Arrow Flight", "JSON Schema as the contract for tool calls"],
  },
  timeline: [
    ["1984", "ASN.1 and BER", "Telecom standards define schema-driven binary encodings. X.509 certificates still use them."],
    ["2001", "JSON", "Douglas Crockford names a subset of JavaScript literals as a data format. It spreads with AJAX."],
    ["2008", "Protocol Buffers", "Google open-sources the schema-based binary format it uses internally for RPC and storage."],
    ["2013", "Parquet", "A columnar on-disk format for analytics, from Twitter and Cloudera."],
    ["2016", "Apache Arrow", "A standard columnar in-memory format, so tools can share data without converting it."],
    ["2019", "simdjson", "SIMD instructions parse JSON at gigabytes per second."],
    ["2026", "Schemas as tool contracts", "JSON Schema defines every agent tool's inputs, and deterministic serialization matters for prompt caching."],
  ],
  lessons: [
    {
      slug: "json-and-text-formats",
      title: "JSON, Base64 and JSON Lines in depth",
      summary: "JSON looks trivial until a number loses digits, a binary blob grows by a third, or a log file is one giant array. Learn the grammar's edges and the text formats around it.",
      level: "Basics",
      minutes: 18,
      blocks: [
        { kind: "p", text: "JSON has six value types: object, array, string, number, `true`/`false` and `null`. Strings are Unicode with backslash escapes. Objects are unordered collections of name-value pairs. That is the whole grammar, which is why every language can parse it and why its weak spots are always the same ones." },
        { kind: "h", text: "Numbers: the 2^53 cliff" },
        { kind: "p", text: "The JSON grammar allows any number of digits, but most parsers store numbers as 64-bit doubles (Module 1). Integers above 2^53 = 9,007,199,254,740,992 lose precision silently. The standard itself warns that interoperable numbers should stay within double range." },
        { kind: "example", title: "A 64-bit ID through JSON.parse", lines: [
          ["Sent by a Go or Java service", "`{\"id\": 1234567890123456789}`"],
          ["Exactly representable as a double?", "No: it needs 61 bits of precision; a double has 53"],
          ["`JSON.parse(...).id` in JavaScript", "1234567890123456800"],
          ["Sent as a string instead", "`{\"id\": \"1234567890123456789\"}` survives every parser"],
        ], result: "Rule: 64-bit IDs, money and anything that must round-trip exactly travel as strings or integers in minor units." },
        { kind: "h", text: "Base64: binary inside text" },
        { kind: "p", text: "JSON strings cannot hold arbitrary bytes. **Base64** encodes every 3 bytes as 4 printable characters, each carrying 6 bits. The output is always about 33% larger than the input, and `=` padding marks a final group shorter than 3 bytes. Images and files sent to model APIs as Base64 pay that size, and the decoded bytes are what count, not the characters." },
        { kind: "figure", figure: "base64-bits", title: "Watch bytes become Base64", caption: "Type a few characters. Each 3-byte group is split into four 6-bit values, and each value picks one character from the 64-character alphabet. A short final group is padded with `=`." },
        { kind: "h", text: "JSON Lines: one record per line" },
        { kind: "p", text: "A log of a million events as one JSON array must be parsed whole before you read the first element. **JSON Lines** (also called NDJSON) puts one complete JSON value per line. Because JSON escapes newlines inside strings, a raw newline can only be a record boundary. You can append, stream, `grep` and split such files freely; a truncated file loses only its last line." },
        { kind: "code", lang: "ts", file: "jsonl.ts", code: `import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

// Stream a multi-GB trace file with constant memory
for await (const line of createInterface({ input: createReadStream("trace.jsonl") })) {
  if (!line) continue;
  const event = JSON.parse(line);
  if (event.type === "tool_call") count(event.name);
}
`, note: "Agent traces, eval results and fine-tuning datasets are usually JSON Lines for exactly these reasons." },
        { kind: "deep", title: "Streaming JSON parsers and duplicate keys", blocks: [
          { kind: "p", text: "A **streaming** or SAX-style parser emits events (start object, key, value, end array) as bytes arrive, without building the whole tree. It lets you process a 2 GB array in constant memory, or show a model's partial tool-call arguments before they finish." },
          { kind: "p", text: "JSON's grammar does not forbid duplicate keys: `{\"a\":1,\"a\":2}` is valid. Parsers disagree about which wins, and attackers have used that disagreement when a validating service and an executing service parse the same document differently. Security-sensitive code should reject duplicates." },
        ] },
        { kind: "callout", tone: "harness", title: "In a harness", text: "Tool results are text the model reads, so their JSON is paid for per token. Large Base64 blobs in tool results waste context; store the bytes and pass a reference or a description instead." },
      ],
      practice: [
        ["API design", "Twitter/X, Discord and Stripe send large IDs as strings, and Stripe sends money as integer minor units."],
        ["Data pipelines", "BigQuery, Snowflake and most log tools import JSON Lines directly, since each line can be processed in parallel."],
        ["Model inputs", "Images sent to model APIs as Base64 are about a third larger on the wire than the raw file."],
      ],
      check: [
        ["Why can a 64-bit integer change when parsed as JSON in JavaScript?", "It is stored as a double with 53 bits of precision, so integers above 2^53 are rounded."],
        ["How much larger is Base64 than its input?", "About 33%: every 3 bytes become 4 characters."],
        ["Why is JSON Lines better than one big JSON array for logs?", "Each line is independent: you can append, stream and process records without parsing the whole file, and corruption is limited to one line."],
      ],
      tryIt: "In Node, compare `Buffer.from(bytes).toString(\"base64\").length` to `bytes.length` for 1, 2, 3, 100 and 1,000 bytes, and explain the padding.",
      terms: [
        ["Double", "A 64-bit IEEE 754 floating-point number, JSON's usual numeric type in practice."],
        ["Base64", "An encoding of binary data into 64 printable characters, 6 bits each."],
        ["JSON Lines", "One JSON value per line, newline-delimited."],
        ["Streaming parser", "A parser that emits events as input arrives instead of building a whole tree first."],
      ],
    },
    {
      slug: "protobuf-by-hand",
      title: "Protobuf by hand: tags, varints and zigzag",
      summary: "Encode a Protobuf message byte by byte. Once you can do it on paper, the format's size, speed and compatibility rules all make sense.",
      level: "Depth",
      minutes: 22,
      blocks: [
        { kind: "p", text: "A Protobuf schema assigns each field a **number**. On the wire, a message is a sequence of fields, each written as a **tag** followed by a value. Names never appear. The tag packs the field number and a **wire type** that tells the reader how to find the value's end, even for fields it does not know." },
        { kind: "code", lang: "text", file: "tool_call.proto", code: `syntax = "proto3";

message ToolCall {
  int64  id        = 1;
  string name      = 2;
  sint32 priority  = 3;
  repeated int32 ranks = 4;
}
` },
        { kind: "table", head: ["Wire type", "Name", "Used for", "How the reader finds the end"], rows: [
          ["0", "VARINT", "int32, int64, uint, bool, enum, sint", "Bytes until one with the top bit clear"],
          ["1", "I64", "fixed64, double", "Exactly 8 bytes"],
          ["2", "LEN", "string, bytes, nested messages, packed repeated", "A varint length, then that many bytes"],
          ["5", "I32", "fixed32, float", "Exactly 4 bytes"],
        ] },
        { kind: "h", text: "Varints" },
        { kind: "p", text: "A **varint** writes an integer 7 bits at a time, least significant group first. Each byte's top bit is a **continuation bit**: 1 means another byte follows, 0 means this is the last. Small numbers take one byte; the largest 64-bit numbers take ten." },
        { kind: "example", title: "Encoding field 1 = 150", lines: [
          ["Tag", "(field 1 << 3) | wire type 0 = 8 = `0x08`"],
          ["150 in binary", "1001 0110"],
          ["Split into 7-bit groups, low first", "`0010110` then `0000001`"],
          ["Add continuation bits", "`1`0010110 = `0x96`, then `0`0000001 = `0x01`"],
          ["Message bytes", "`08 96 01`, 3 bytes"],
          ["Same data as JSON", "`{\"id\":150}`, 10 bytes"],
        ], result: "Names cost nothing on the wire because the schema holds them. That is most of Protobuf's size advantage." },
        { kind: "figure", figure: "protobuf-encoder", title: "Encode a field yourself", caption: "Pick a field number, a type and a value. The tag byte, the varint groups with their continuation bits, and the final bytes update live, beside the JSON equivalent. Try −1 as int32 and then as sint32." },
        { kind: "h", text: "Negative numbers and zigzag" },
        { kind: "p", text: "Negative `int32` values are sign-extended to 64 bits before varint encoding, so −1 becomes ten bytes. Types `sint32` and `sint64` use **zigzag** encoding first, mapping small negatives to small positives: 0→0, −1→1, 1→2, −2→3. Then −1 costs one byte. Choose `sint` for fields that are often negative." },
        { kind: "code", lang: "ts", file: "varint.ts", code: `export function encodeVarint(value: bigint): number[] {
  const out: number[] = [];
  let v = BigInt.asUintN(64, value);          // negative int32/int64 → two's complement
  do {
    let byte = Number(v & 0x7fn);
    v >>= 7n;
    if (v) byte |= 0x80;                      // continuation bit
    out.push(byte);
  } while (v);
  return out;
}

export const zigzag32 = (n: number) => ((n << 1) ^ (n >> 31)) >>> 0;
export const tag = (field: number, wireType: number) => encodeVarint(BigInt((field << 3) | wireType));

// field 1 = 150 → [0x08, 0x96, 0x01]
console.log([...tag(1, 0), ...encodeVarint(150n)].map((b) => b.toString(16)));
`, note: "Check your encoder against `protoc --decode_raw`, which prints field numbers and values from raw bytes without a schema." },
        { kind: "h", text: "Is Protobuf always faster than JSON?" },
        { kind: "p", text: "No. Three things narrow the gap. **Compression**: gzip removes JSON's repeated names well. **Runtime**: JavaScript engines parse JSON in highly optimised native code, while a Protobuf library may run in JavaScript. **Payload shape**: large strings cost the same in both. Benchmark your real payload in your real language before switching." },
        { kind: "deep", title: "Field numbers 1 to 15 and packed repeated fields", blocks: [
          { kind: "p", text: "The tag is itself a varint. With 3 bits for the wire type, field numbers 1 to 15 fit in one tag byte; 16 to 2,047 need two. Put frequently set fields in 1 to 15." },
          { kind: "p", text: "A `repeated int32` field could repeat its tag for every element. In proto3, numeric repeated fields are **packed** by default: one tag with wire type LEN, a total byte length, then the varints back to back. A list of 1,000 small numbers drops from about 2,000 bytes to about 1,003." },
        ] },
      ],
      practice: [
        ["gRPC", "Every gRPC message is Protobuf behind a 5-byte frame prefix (Module 6)."],
        ["Storage", "Systems store Protobuf in databases and logs for compact, schema-checked records that old and new code can both read."],
        ["Debugging", "`protoc --decode_raw < message.bin` reveals the fields of an unknown message, which is often the fastest way to debug a wire problem."],
      ],
      check: [
        ["Encode field 2, the string \"hi\".", "Tag (2 << 3) | 2 = `0x12`, length `0x02`, then `0x68 0x69`: `12 02 68 69`."],
        ["Why does −1 as int32 take 10 bytes?", "It is sign-extended to 64 bits, so the varint must carry all 64 bits, 7 at a time."],
        ["Is Protobuf always faster than JSON?", "No. Language runtime, compression and payload shape decide; benchmark the real case."],
      ],
      tryIt: "Encode `ToolCall { id: 150, name: \"grep\" }` by hand on paper. Then write the bytes with `printf '\\x08\\x96\\x01\\x12\\x04grep' | protoc --decode_raw`.",
      terms: [
        ["Tag", "Field number and wire type packed into one varint."],
        ["Varint", "A variable-length integer, 7 data bits per byte plus a continuation bit."],
        ["Wire type", "How a field's value is laid out, so readers can skip unknown fields."],
        ["Zigzag", "A mapping that turns small negative integers into small positive ones."],
      ],
    },
    {
      slug: "schema-evolution",
      title: "Schema evolution: changing a format without breaking anyone",
      summary: "Old readers meet new data and new readers meet old data, for years. Learn the rules that keep both working, and why field numbers are never reused.",
      level: "Depth",
      minutes: 16,
      blocks: [
        { kind: "p", text: "Data outlives code. A message written today may be read by a service deployed last month and another deployed next year. During a rolling deploy, old and new versions run side by side and talk to each other. **Schema evolution** is the set of changes you can make without breaking any of these readers." },
        { kind: "table", head: ["Compatibility", "Means", "Needed when"], rows: [
          ["Backward", "New code can read data written by old code", "Reading old stored data after an upgrade"],
          ["Forward", "Old code can read data written by new code", "Rolling deploys, old clients, rollbacks"],
          ["Full", "Both", "Long-lived storage and public APIs"],
        ] },
        { kind: "figure", figure: "schema-evolution", title: "Two versions, four conversations", caption: "Version 2 of a message adds a field and removes another. Each cell shows what happens when a reader of one version meets data from the other: unknown fields are skipped or preserved, missing fields take defaults, and a reused number is the one change that corrupts data." },
        { kind: "h", text: "Rules that keep Protobuf compatible" },
        { kind: "steps", items: [
          ["Add fields freely, with new numbers", "Old readers skip the unknown tag using its wire type. New readers see the default value in old data."],
          ["Never change a field's number", "The number is the field's identity on the wire. The name is only for code."],
          ["Never reuse a removed number", "Mark it `reserved`. Old data or old services may still send the old meaning under that number."],
          ["Change types only within wire-compatible groups", "int32, int64 and bool share VARINT, with truncation risks; string and bytes share LEN. Most other changes break."],
          ["Treat rename as free, and removal as expensive", "Renaming affects code and JSON mapping, not the wire. Removal requires reserving."],
        ] },
        { kind: "code", lang: "text", file: "tool_call_v2.proto", code: `message ToolCall {
  reserved 3;                 // was: sint32 priority
  reserved "priority";        // also stop the name being reused in JSON

  int64  id      = 1;
  string name    = 2;
  repeated int32 ranks = 4;
  string idempotency_key = 5; // new in v2: old readers skip it
}
` },
        { kind: "example", title: "What goes wrong when a number is reused", lines: [
          ["v1", "field 3 = `sint32 priority`"],
          ["v2 removes priority, then a later change adds", "field 3 = `int32 timeout_ms`"],
          ["An old client sends priority −1", "zigzag-encoded as 1"],
          ["A new server reads field 3 as int32", "timeout_ms = 1"],
        ], result: "No error, just wrong data: a one-millisecond timeout. `reserved` makes the compiler refuse this change." },
        { kind: "h", text: "Unknown fields" },
        { kind: "p", text: "When a reader meets a field number it does not know, Protobuf skips it but also **keeps** its bytes in the parsed object. If that object is re-serialised, the unknown field goes back out. A proxy built on an old schema can therefore pass new fields through without understanding them." },
        { kind: "deep", title: "JSON's evolution rules, and Protobuf Editions", blocks: [
          { kind: "p", text: "JSON has no schema on the wire, so the same principles apply by convention: readers ignore unknown fields, writers only add optional fields, and nobody changes a field's meaning under the same name. A strict JSON Schema validator with `additionalProperties: false` breaks forward compatibility, which is sometimes the right choice for tool inputs and wrong for API responses." },
          { kind: "p", text: "**Protobuf Editions** replaces the proto2/proto3 split with per-file editions and per-feature settings, such as whether fields track presence. It lets the format evolve its defaults without another syntax fork." },
        ] },
      ],
      practice: [
        ["Rolling deploys", "Every rolling deploy is a forward and backward compatibility test between adjacent versions."],
        ["Schema registries", "Kafka users register Avro or Protobuf schemas and let the registry reject incompatible changes before they ship."],
        ["Linters", "Tools such as `buf breaking` compare a schema against the previous version in CI and fail on reused numbers or incompatible type changes."],
      ],
      check: [
        ["How do you rename or remove a field safely?", "Rename freely; it does not affect the wire. To remove, keep the number unused forever with `reserved`."],
        ["What does an old reader do with a new field?", "Skips it using the wire type, and in Protobuf preserves its bytes for re-serialisation."],
        ["Why is reusing a field number dangerous?", "Old writers still send the old meaning under that number, and new readers silently misinterpret it."],
      ],
      tryIt: "Write v1 and v2 of a message, serialise data with each, and read it with the other using `protoc`. Then reuse a reserved number and see the compiler error.",
      terms: [
        ["Backward compatible", "New readers handle old data."],
        ["Forward compatible", "Old readers handle new data."],
        ["reserved", "A Protobuf declaration that forbids reusing field numbers or names."],
        ["Unknown field", "A field a reader's schema does not define; skipped and often preserved."],
      ],
    },
    {
      slug: "zero-copy-and-columnar",
      title: "Zero-copy and columnar formats",
      summary: "The fastest parse is no parse. Learn how FlatBuffers and Cap'n Proto read fields in place, and how Arrow and Parquet lay data out by column for analytics.",
      level: "Depth",
      minutes: 17,
      blocks: [
        { kind: "p", text: "JSON and Protobuf both need **decoding**: walk the bytes and build objects in memory before you can read a field. For a 50 MB message where you need one field, that is a lot of wasted work. Two families of formats avoid it." },
        { kind: "h", text: "Zero-copy: read in place" },
        { kind: "p", text: "**FlatBuffers** and **Cap'n Proto** lay data out in the buffer the same way it will be used in memory, with offsets instead of pointers. Reading a field is pointer arithmetic on the received bytes. Nothing is copied or allocated, so access time is independent of message size. The price: larger messages, awkward building APIs, and care needed to validate untrusted buffers." },
        { kind: "h", text: "Columnar: one array per field" },
        { kind: "p", text: "Row formats store each record's fields together. **Columnar** formats store each field's values together across all records. A query that sums one column then reads only that column's bytes, contiguously, the cache-friendly pattern from Module 1." },
        { kind: "figure", figure: "row-vs-column", title: "The same table, by row and by column", caption: "Four tool-call records stored row by row and column by column. Highlight a query: “average latency” touches every row's latency in row layout, scattered among other fields, but one contiguous run in columnar layout." },
        { kind: "table", head: ["Format", "Where", "Core idea", "Best fit"], rows: [
          ["Apache Arrow", "In memory, between processes", "Standard columnar layout; no conversion between tools", "Analytics engines, data frames, Arrow Flight RPC"],
          ["Parquet", "On disk", "Columnar, encoded and compressed per column, with statistics per chunk", "Data lakes and analytical storage"],
          ["FlatBuffers / Cap'n Proto", "Messages", "Read fields in place, no decode step", "Large messages read partially, games, mobile"],
        ] },
        { kind: "h", text: "Why columns compress so well" },
        { kind: "p", text: "Values in one column look alike: the same few tool names, timestamps that increase steadily, small integers. Parquet applies **dictionary** encoding (store each distinct string once, then small indexes), **run-length** encoding (5,000 identical values become one value and a count), **delta** encoding (store differences between timestamps) and **bit-packing** (use 3 bits for values below 8), then a general codec on top (Module 8)." },
        { kind: "example", title: "A tool-name column of one million rows", lines: [
          ["Raw strings, average 12 bytes", "≈ 12 MB"],
          ["Dictionary of 40 distinct names", "≈ 480 bytes"],
          ["Indexes bit-packed at 6 bits each", "1,000,000 × 6 ÷ 8 ≈ 750 KB"],
          ["With runs of the same tool, run-length encoded", "Often far smaller still"],
        ], result: "Over 15x before general compression, because the encoding exploits what the column is." },
        { kind: "deep", title: "Predicate pushdown: skipping data you never read", blocks: [
          { kind: "p", text: "Parquet files store minimum and maximum values for each column in each row group. A query for `latency_ms > 5000` can skip every row group whose maximum is below 5,000 without decompressing it. Engines such as DuckDB push filters down into the file reader this way." },
          { kind: "p", text: "That makes Parquet in object storage a reasonable database for agent traces: write runs as Parquet files partitioned by day, and query them with DuckDB directly from S3." },
        ] },
      ],
      practice: [
        ["Trace analytics", "Agent observability platforms store spans in columnar engines such as ClickHouse so cost-per-task queries scan only the needed columns."],
        ["Data frames", "Pandas, Polars and DuckDB exchange Arrow data without copying, so a pipeline can hop between tools cheaply."],
        ["Games and mobile", "FlatBuffers is popular where parsing time and allocation directly affect frame rate or battery."],
      ],
      check: [
        ["What does zero-copy mean for a format?", "Fields are read directly from the received bytes via offsets, without decoding into new objects."],
        ["Why are analytical scans faster on columnar data?", "They read only the needed columns, contiguously, with good cache behaviour and high compression."],
        ["Name three encodings Parquet uses before general compression.", "Dictionary, run-length, delta and bit-packing (any three)."],
      ],
      tryIt: "Export some JSON Lines traces to Parquet with DuckDB (`COPY (SELECT * FROM 'trace.jsonl') TO 'trace.parquet'`). Compare file sizes and the time of a `SELECT avg(latency_ms)` on each.",
      terms: [
        ["Zero-copy", "Using data in place without copying or decoding it."],
        ["Columnar", "Storing each field's values together across records."],
        ["Dictionary encoding", "Replacing repeated values with indexes into a table of distinct values."],
        ["Row group", "A chunk of rows in a Parquet file with its own per-column statistics."],
      ],
    },
    {
      slug: "serialization-for-agents",
      title: "Serialization for agents: tokens, schemas and cache-stable prompts",
      summary: "Models read text and you pay per token, which rewrites the rules: binary saves nothing the model sees, schemas become tool contracts, and byte-identical serialization decides your cache hit rate.",
      level: "Current",
      minutes: 20,
      blocks: [
        { kind: "p", text: "Everything earlier in this module optimised bytes on a wire. A model does not see bytes; it sees **tokens**, and you pay per token in and out. Encoding a tool result as Protobuf saves nothing the model reads, because the harness must turn it back into text. What matters is how many tokens the text costs and how stable it is from request to request." },
        { kind: "h", text: "Fewer tokens, same meaning" },
        { kind: "list", items: [
          "Drop fields the model does not need. A 40-field API response trimmed to 6 fields often cuts tokens by 80%.",
          "Prefer short, clear keys over long ones, but never cryptic: the model must still understand them.",
          "Avoid repeating structure: a table-like list of records can be rendered as compact lines rather than verbose objects.",
          "Do not pretty-print large JSON in tool results; indentation is tokens.",
        ] },
        { kind: "h", text: "JSON Schema as the contract" },
        { kind: "p", text: "Tools are described to the model with a name, a description and a **JSON Schema** for their input. The model generates arguments that should match it, and structured-output modes can force them to (Module 13). The schema is now an API contract read by a model: descriptions, enums and examples improve call accuracy, and the evolution rules from the previous lesson apply to it too." },
        { kind: "code", lang: "json", file: "tool.json", code: `{
  "name": "search_issues",
  "description": "Search the issue tracker. Returns at most 20 issues, newest first.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query":  { "type": "string", "description": "Full-text query, e.g. \\"login timeout\\"" },
      "state":  { "type": "string", "enum": ["open", "closed", "all"], "default": "open" },
      "limit":  { "type": "integer", "minimum": 1, "maximum": 20 }
    },
    "required": ["query"],
    "additionalProperties": false
  }
}
` },
        { kind: "h", text: "Determinism and prompt caching" },
        { kind: "p", text: "Providers cache the model's work for a prompt **prefix** and reuse it when a new request starts with exactly the same tokens (Module 13). Cached input is typically billed at a fraction of the normal rate and processed faster. The match is exact: one different token early in the prompt invalidates everything after it." },
        { kind: "figure", figure: "prompt-cache-order", title: "Same tools, different bytes, no cache", caption: "Two requests carry the same tool definitions. In the second, the tools are serialised from an unordered map, so their order and key order differ. Toggle deterministic serialization to see how much of the prefix the cache can reuse." },
        { kind: "code", lang: "ts", file: "stable-json.ts", code: `/** Serialise with sorted keys so equal values always produce equal bytes. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return \`[\${value.map(stableStringify).join(",")}]\`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return \`{\${entries.map(([k, v]) => \`\${JSON.stringify(k)}:\${stableStringify(v)}\`).join(",")}}\`;
  }
  return JSON.stringify(value);
}

// And sort the tool list itself by name before building the request.
const tools = [...registry.values()].sort((a, b) => a.name.localeCompare(b.name));
`, note: "JavaScript objects keep insertion order, so two code paths that build “the same” object in different orders produce different JSON. Sorting removes the accident." },
        { kind: "callout", tone: "now", title: "Where things stand in late 2026", text: "The MCP 2026-07-28 revision tells servers to return tools in a deterministic order for exactly this reason. And deserializers facing untrusted input are attack surface: CVE-2025-55182, rated CVSS 10.0, allowed remote code execution through how React decoded Server Function payloads (Module 11)." },
        { kind: "deep", title: "Canonical serialization beyond caching", blocks: [
          { kind: "p", text: "Signatures, content-addressed storage and deduplication all need one byte representation per value. JSON's freedom (key order, whitespace, number forms like `1.0` versus `1`, Unicode escapes) defeats that. Canonical forms such as RFC 8785's JSON Canonicalization Scheme fix every choice." },
          { kind: "p", text: "Protobuf is not canonical either: field order on the wire and unknown-field handling can vary between libraries. Never hash serialised Protobuf and expect another implementation to match." },
        ] },
      ],
      practice: [
        ["Prompt caching", "Harnesses put stable content first (system prompt, tools sorted by name), then the conversation, and track cache-hit rate as a metric."],
        ["Tool result shaping", "Agents wrap verbose APIs in tools that return trimmed, consistently ordered fields, often cutting tokens by more than half."],
        ["Validation", "Servers validate tool inputs against the same JSON Schema the model saw, and return precise error messages the model can act on."],
      ],
      check: [
        ["Why might two identical requests miss the same prompt cache?", "Non-deterministic serialization: different key or tool order changes the token prefix."],
        ["Why does binary encoding not reduce a model's cost?", "The model reads text tokens. Binary data must be converted back to text before the model sees it."],
        ["What does `additionalProperties: false` do in a tool schema?", "Rejects arguments with fields the schema does not define."],
      ],
      tryIt: "Log the exact request body your harness sends for two consecutive turns, then diff the first few kilobytes. Any difference before the conversation starts is a cache miss you are paying for.",
      terms: [
        ["Token", "The unit a model reads and is billed by: a piece of text from its vocabulary."],
        ["Prompt cache", "Reuse of computed work for an exactly repeated prompt prefix."],
        ["JSON Schema", "A vocabulary for describing the shape of JSON data."],
        ["Canonical form", "A single agreed byte representation for each value."],
      ],
    },
  ],
  lab: [
    "Write a Protobuf encoder and decoder from scratch in about 100 lines, and check it with `protoc --decode_raw`.",
    "Benchmark JSON, gzipped JSON and Protobuf in Node on one of your real payloads.",
    "Measure your harness's prompt cache-hit rate, then make tool serialization deterministic and measure again.",
  ],
  interview: [
    ["Is Protobuf always faster than JSON?", "No. Language runtime, compression and payload shape decide."],
    ["How do you rename or remove a field safely?", "Keep the number; mark removed numbers reserved."],
    ["Why might two identical requests miss the same prompt cache?", "Non-deterministic serialization."],
  ],
  reading: [
    "The Protobuf Encoding guide",
    "Designing Data-Intensive Applications, chapter 4: Encoding and Evolution, Martin Kleppmann",
    "Parsing Gigabytes of JSON per Second, Langdale and Lemire",
    "The Apache Arrow columnar format specification",
  ],
};
