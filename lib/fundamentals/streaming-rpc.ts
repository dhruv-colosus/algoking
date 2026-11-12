import type { CourseModule } from "./types";

export const streamingRpc: CourseModule = {
  number: 6,
  slug: "streaming-and-rpc",
  title: "Streaming and RPC",
  shortTitle: "Streaming & RPC",
  tagline: "Choose by who talks when and what sits in the path. LLM streaming is one-way, so Server-Sent Events usually wins by being ordinary HTTP that proxies already understand.",
  intuition: "Every streaming protocol answers three questions: which side may send, what happens when the connection breaks, and how the middleboxes in the path will treat it. Most production bugs in token streaming are not model bugs; they are framing, buffering and reconnection bugs.",
  harness: "Your users watch tokens arrive. Every proxy, load balancer and network change between the model and the screen can stall, merge, split or drop that stream. This module is the difference between a chat that feels instant and one that freezes and loses its answer.",
  levels: {
    Basics: ["Chunked transfer", "The SSE wire format", "The WebSocket upgrade", "Request-response versus streaming"],
    Depth: ["WebSocket framing and masking", "gRPC over HTTP/2 with trailers", "Deadlines and cancellation propagation", "L4 versus L7 load balancing", "Resumable streams"],
    Current: ["Connect RPC", "WebTransport", "Stateless agent protocols", "Append-only event logs as the source of truth for a stream"],
  },
  timeline: [
    ["2004", "Comet and long polling", "Web apps fake server push by holding requests open until there is news."],
    ["2009", "Server-Sent Events", "A simple text format for server-to-client streams over plain HTTP, later part of the HTML standard."],
    ["2011", "WebSocket", "RFC 6455 gives browsers a full-duplex channel after an HTTP upgrade."],
    ["2015", "gRPC", "Google open-sources its RPC framework: Protobuf messages over HTTP/2 streams."],
    ["2022", "Connect and WebTransport", "Connect makes gRPC-style APIs work in browsers over plain HTTP; WebTransport brings streams and datagrams over HTTP/3."],
    ["2023", "LLM streaming goes mainstream", "Model APIs standardise on SSE token streams with typed events for text, tool calls and stop reasons."],
    ["2026", "Stateless agent protocols", "The MCP 2026-07-28 revision drops sessions and stream resumability in favour of handles and polling."],
  ],
  lessons: [
    {
      slug: "choosing-a-stream",
      title: "Request-response, streaming and the options between",
      summary: "Long polling, SSE, WebSocket, gRPC, WebTransport and job handles each fit a different shape of conversation. Learn to pick by direction, reconnection and what sits in the path.",
      level: "Basics",
      minutes: 16,
      blocks: [
        { kind: "p", text: "Plain HTTP is request-response: the client asks, the server answers once, done. Many things do not fit that shape. A model produces tokens over 20 seconds. A collaborative editor needs both sides to send at any time. A video call needs low latency more than reliability. A five-minute agent task outlives any sensible connection." },
        { kind: "figure", figure: "stream-directions", title: "Who talks when", caption: "Five patterns side by side. Arrows show which side sends and when. SSE streams one way over an ordinary response. WebSocket and WebTransport are two-way. gRPC supports four call shapes. A job handle turns long work into short polls." },
        { kind: "table", head: ["Option", "Direction", "Reconnect", "Best fit", "Main trap"], rows: [
          ["Server-Sent Events", "Server to client", "Built in with `Last-Event-ID`", "Token streams, progress", "Proxy buffering; six-connection limit on HTTP/1.1"],
          ["WebSocket", "Both ways", "Build it yourself", "Voice, collaboration, realtime control", "Stateful load balancing; no backpressure in the basic browser API"],
          ["gRPC", "Unary plus three streaming modes", "Build it yourself", "Service to service", "Needs a proxy or Connect in browsers; L4 balancers pin connections"],
          ["WebTransport", "Both ways, plus datagrams", "Build it yourself", "Low-latency media and games", "Needs an HTTP/3 path and a fallback"],
          ["Job handle and polling", "Client pulls", "Built in: each poll is new", "Long-running work", "Polling cost and delay"],
        ] },
        { kind: "h", text: "A decision in three questions" },
        { kind: "steps", items: [
          ["Does the client need to send during the stream?", "If not, use SSE: it is plain HTTP, works through proxies and CDNs, and the browser reconnects for you. LLM token streaming is in this group."],
          ["Is the work longer than a connection should live?", "Minutes or more: return a job or task handle immediately and let the client poll or subscribe. Connections break; handles do not."],
          ["Do you need two-way, low-latency messages?", "WebSocket for browsers today; WebTransport where HTTP/3 is available and you want datagrams or many independent streams."],
        ] },
        { kind: "callout", tone: "analogy", title: "Radio, phone call, ticket", text: "SSE is a radio broadcast: you tune in and listen. WebSocket is a phone call: both can talk at any time, and if it drops, someone has to call back. A job handle is a dry-cleaning ticket: you leave, come back later, and the ticket finds your order." },
        { kind: "deep", title: "Long polling, the ancestor of everything here", blocks: [
          { kind: "p", text: "Before SSE and WebSocket, browsers had only request-response. **Long polling** faked push: the client sends a request, the server holds it open until there is news or a timeout, responds, and the client immediately sends another. It works through every proxy, which is why it survived as a fallback." },
          { kind: "p", text: "Its costs are a request per message and a gap between responses where events must be queued on the server. SSE removed both by keeping one response open and writing many events into it." },
        ] },
      ],
      practice: [
        ["Chat interfaces", "Model chat UIs stream responses with SSE, and send the next user message as a separate POST."],
        ["Voice agents", "Realtime voice APIs use WebSocket or WebRTC, because audio flows both ways continuously."],
        ["Agent tasks", "Long agent runs are exposed as tasks with IDs. The UI subscribes to a run's event log and can reattach after a refresh."],
      ],
      check: [
        ["SSE or WebSocket for a chat UI?", "SSE, unless the client must send on the same channel during generation."],
        ["When do you prefer a job handle over a stream?", "When the work can outlive a connection, from minutes to hours, or when the client may disconnect and return."],
        ["Why does SSE work better through corporate proxies than WebSocket?", "It is an ordinary HTTP response. WebSocket needs an upgrade that some proxies mishandle or block."],
      ],
      tryIt: "List three features you use daily (a chat app, a stock ticker, a CI job page) and pick a protocol for each with one sentence of justification.",
      terms: [
        ["Long polling", "Holding a request open until there is data, then immediately re-requesting."],
        ["Full duplex", "Both sides can send at the same time."],
        ["Job handle", "An ID returned for long work, used to check status or fetch results later."],
      ],
    },
    {
      slug: "server-sent-events",
      title: "Server-Sent Events, byte by byte",
      summary: "SSE is a tiny text format inside an HTTP response. Learn every field, how to parse it correctly from arbitrary chunks, and how reconnection with Last-Event-ID works.",
      level: "Basics",
      minutes: 22,
      blocks: [
        { kind: "p", text: "An SSE response has `Content-Type: text/event-stream` and a body made of **events**. Each event is a group of `field: value` lines and ends with a **blank line**. That blank line is the frame delimiter, the Module 4 framing lesson in its simplest form." },
        { kind: "code", lang: "text", file: "stream.txt", code: `: connected, keep this comment as a heartbeat

event: message_start
id: 1
data: {"type":"message_start","model":"…"}

event: content_block_delta
id: 2
data: {"type":"content_block_delta","delta":{"text":"Hel"}}

event: content_block_delta
id: 3
data: {"type":"content_block_delta","delta":{"text":"lo 🙂"}}

retry: 3000

` },
        { kind: "table", head: ["Field", "Meaning"], rows: [
          ["`data:`", "The payload. Several `data:` lines in one event are joined with newlines."],
          ["`event:`", "The event's type. Defaults to `message`."],
          ["`id:`", "The event ID. The client remembers the last one it saw."],
          ["`retry:`", "How long, in milliseconds, the client should wait before reconnecting."],
          ["`: comment`", "Any line starting with a colon is ignored. Perfect for heartbeats."],
        ] },
        { kind: "h", text: "Parsing from arbitrary chunks" },
        { kind: "p", text: "The body arrives in network reads that split anywhere: in the middle of a line, in the middle of a JSON string, even in the middle of a multi-byte character such as 🙂. A correct parser keeps two buffers: undecoded bytes, handled by a streaming `TextDecoder`, and decoded text waiting for a complete event." },
        { kind: "figure", figure: "sse-parser", title: "Feed a stream in random chunks", caption: "Step through network reads of the stream above, split at awkward points. A naive parser treats each read as events and corrupts data. A correct parser decodes UTF-8 with `{ stream: true }`, buffers text, and emits only events ended by a blank line." },
        { kind: "code", lang: "ts", file: "sse-parse.ts", code: `export type SSEEvent = { event: string; data: string; id?: string };

export async function* parseSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<SSEEvent> {
  const decoder = new TextDecoder();          // keeps partial UTF-8 between chunks
  let text = "";
  for await (const chunk of body) {
    text += decoder.decode(chunk, { stream: true });
    text = text.replace(/\\r\\n?/g, "\\n");     // the spec allows CRLF, LF or CR
    let end: number;
    while ((end = text.indexOf("\\n\\n")) !== -1) {
      const raw = text.slice(0, end);
      text = text.slice(end + 2);
      const event: SSEEvent = { event: "message", data: "" };
      const data: string[] = [];
      for (const line of raw.split("\\n")) {
        if (!line || line.startsWith(":")) continue;          // blank or comment
        const colon = line.indexOf(":");
        const field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? "" : line.slice(colon + 1);
        if (value.startsWith(" ")) value = value.slice(1);
        if (field === "data") data.push(value);
        else if (field === "event") event.event = value;
        else if (field === "id") event.id = value;
      }
      if (data.length) yield { ...event, data: data.join("\\n") };
    }
  }
}
`, note: "This is the part of a model SDK you can now write yourself. Fuzz it by re-chunking a recorded stream at every possible split point." },
        { kind: "h", text: "Reconnection" },
        { kind: "p", text: "The browser's `EventSource` reconnects automatically after a dropped connection, waiting `retry` milliseconds, and sends the last seen ID in a `Last-Event-ID` header. A server that keeps events can resume from there. A server that does not, which is most LLM endpoints, starts over or fails. Reconnection is only as good as the server's memory (the last lesson of this module)." },
        { kind: "callout", tone: "trap", title: "EventSource cannot POST", text: "The browser `EventSource` API only makes GET requests and cannot set custom headers such as `Authorization`. Model APIs need a POST body, so clients use `fetch` with a streaming body reader and a parser like the one above, and implement reconnection themselves." },
        { kind: "deep", title: "The six-connection limit", blocks: [
          { kind: "p", text: "Over HTTP/1.1, browsers allow about six connections per origin. Each open SSE stream holds one. Open seven tabs of your chat app and the seventh stream, and every other request to that origin, waits." },
          { kind: "p", text: "Over HTTP/2 or HTTP/3, streams share one connection and the limit becomes the server's concurrent-stream setting, often 100. Serving SSE over HTTP/2 removes the problem; so does multiplexing many logical streams over one SSE connection in the app." },
        ] },
      ],
      practice: [
        ["Model SDKs", "Official SDKs parse SSE exactly like this and expose typed events: message start, content deltas, tool-use deltas and stop."],
        ["Progress pages", "CI systems and deploy dashboards stream log lines with SSE, using IDs so a refreshed page continues where it left off."],
        ["Heartbeats", "Servers send `: ping` comments every 15 to 30 seconds so proxies and NATs keep the stream alive."],
      ],
      check: [
        ["How does an SSE parser know an event is complete?", "A blank line ends the event."],
        ["Why does an SSE parser need a streaming TextDecoder?", "A network read can end in the middle of a multi-byte UTF-8 character; the streaming decoder holds the partial bytes until the next read."],
        ["What does Last-Event-ID do?", "On reconnect, the client sends the last event ID it saw so the server can resume after it."],
      ],
      tryIt: "Record a real model stream with `curl -N` into a file. Feed it to the parser above in random 1-to-20-byte chunks, 1,000 times, and check every run yields identical events.",
      terms: [
        ["text/event-stream", "The content type of an SSE response."],
        ["Event", "One group of SSE field lines ended by a blank line."],
        ["Last-Event-ID", "Request header carrying the last event ID the client received."],
        ["Heartbeat", "A periodic message, here an SSE comment, that keeps idle connections alive."],
      ],
    },
    {
      slug: "websockets",
      title: "WebSocket: upgrade, frames and backpressure",
      summary: "A WebSocket starts as HTTP and becomes a two-way message channel. Learn the handshake, the frame format and its masking, and the operational traps of stateful connections.",
      level: "Depth",
      minutes: 18,
      blocks: [
        { kind: "p", text: "A WebSocket begins as an ordinary HTTP/1.1 GET with `Upgrade: websocket` and a random `Sec-WebSocket-Key`. The server proves it understood by hashing that key with a fixed GUID and returning the result in `Sec-WebSocket-Accept`, with status `101 Switching Protocols`. From then on, the TCP connection carries WebSocket frames, not HTTP." },
        { kind: "code", lang: "text", file: "upgrade.txt", code: `GET /realtime HTTP/1.1
Host: api.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
` },
        { kind: "h", text: "The frame" },
        { kind: "figure", figure: "websocket-frame", title: "Anatomy of a WebSocket frame", caption: "Two bytes of header carry the final-fragment flag, the opcode, the mask bit and a 7-bit length. Longer payloads add 2 or 8 bytes of extended length. Client frames add a 4-byte masking key, and the payload is XORed with it." },
        { kind: "table", head: ["Opcode", "Frame"], rows: [["0x1", "Text (UTF-8)"], ["0x2", "Binary"], ["0x0", "Continuation of a fragmented message"], ["0x8", "Close"], ["0x9 / 0xA", "Ping / Pong"]] },
        { kind: "p", text: "Unlike TCP, WebSocket preserves **message boundaries**: a message sent is a message received, though it may be split into several frames. Ping and pong frames give a built-in heartbeat for the idle-timeout problem from Module 4." },
        { kind: "deep", title: "Why clients mask their frames", blocks: [
          { kind: "p", text: "Every client-to-server frame is XORed with a random 4-byte key. It is not encryption: the key is in the frame. It defends **intermediaries**. Researchers showed that an attacker controlling the bytes a browser sends could craft data that a naive transparent proxy would interpret as a separate HTTP request, poisoning its cache." },
          { kind: "p", text: "Masking with a key the attacker's script cannot predict makes the bytes on the wire unpredictable, so they cannot be shaped into a valid HTTP request. Servers must reject unmasked client frames." },
        ] },
        { kind: "h", text: "Operational traps" },
        { kind: "list", items: [
          "**Stateful load balancing.** A WebSocket pins a client to one server for hours. Deploys must drain connections gracefully, and load spreads unevenly as old connections stay on old servers.",
          "**No backpressure in the basic browser API.** `socket.send()` never blocks; data piles up in `bufferedAmount`. Check it and pause your producer, or use the newer `WebSocketStream` where available.",
          "**Reconnection is yours.** After a drop, the client must reconnect with backoff, re-authenticate and resynchronise state. Nothing is replayed automatically.",
          "**Proxies and timeouts.** Some corporate proxies break the upgrade; idle timeouts kill quiet sockets unless you ping.",
        ] },
        { kind: "code", lang: "ts", file: "ws-backpressure.ts", code: `const MAX_BUFFERED = 1 << 20;  // 1 MiB

async function sendAll(socket: WebSocket, chunks: AsyncIterable<string>) {
  for await (const chunk of chunks) {
    while (socket.bufferedAmount > MAX_BUFFERED) {
      await new Promise((resolve) => setTimeout(resolve, 20));   // let the network drain
    }
    socket.send(chunk);
  }
}
`, note: "Polling `bufferedAmount` is crude but effective. On the server, Node's `ws` library exposes the socket's backpressure through its callback and stream APIs." },
      ],
      practice: [
        ["Realtime voice", "Voice agent APIs stream audio frames both ways over WebSocket, with ping frames keeping the connection alive through silences."],
        ["Collaborative editors", "Editors send operations both ways and resynchronise from a version number after reconnecting."],
        ["Deploys", "Teams running WebSocket servers send a close frame with a “going away” code during deploys so clients reconnect to new instances."],
      ],
      check: [
        ["Why must clients mask frames?", "To stop attacker-controlled bytes from being misread as HTTP requests by intermediary proxies."],
        ["Does WebSocket preserve message boundaries?", "Yes. Messages may be fragmented into frames, but the receiver reassembles whole messages."],
        ["Why is load balancing WebSockets harder than HTTP?", "Each connection is long-lived and stateful, so it pins a client to one server and load rebalances only as connections close."],
      ],
      tryIt: "In a browser console, open `new WebSocket(\"wss://echo.websocket.org\")` (or any echo server), send 10 MB in a tight loop and watch `bufferedAmount` grow.",
      terms: [
        ["Upgrade", "Switching an HTTP/1.1 connection to another protocol with 101 Switching Protocols."],
        ["Opcode", "The frame type field: text, binary, close, ping, pong or continuation."],
        ["Masking", "XORing client payloads with a random key to protect intermediaries."],
        ["bufferedAmount", "Bytes queued by `send()` but not yet transmitted."],
      ],
    },
    {
      slug: "grpc-and-load-balancing",
      title: "gRPC, deadlines and why load balancing surprises people",
      summary: "gRPC is typed RPC over HTTP/2 streams. Learn its message framing and trailers, how deadlines and cancellation should flow through a call tree, and why one long connection defeats an L4 balancer.",
      level: "Depth",
      minutes: 20,
      blocks: [
        { kind: "p", text: "gRPC defines services in Protobuf (Module 7) and generates client and server code. Each call is one HTTP/2 stream: a POST to `/package.Service/Method`, request messages in DATA frames, response messages back, and the call's status in **trailers**, headers sent after the body." },
        { kind: "table", head: ["Call type", "Shape", "Example"], rows: [
          ["Unary", "One request, one response", "GetUser"],
          ["Server streaming", "One request, many responses", "Generate tokens"],
          ["Client streaming", "Many requests, one response", "Upload audio chunks, get a transcript"],
          ["Bidirectional", "Many each way, interleaved", "Live transcription with partial results"],
        ] },
        { kind: "p", text: "Each message on the stream has a 5-byte prefix: one byte saying whether it is compressed, then a 4-byte big-endian length. The same length-prefixed framing you wrote in Module 4. Status arrives as `grpc-status` and `grpc-message` trailers, which is why browsers, whose fetch API long hid trailers, need a proxy or the Connect protocol." },
        { kind: "h", text: "Deadlines and cancellation" },
        { kind: "p", text: "gRPC calls carry a **deadline**: an absolute time after which the result is useless. It travels in the `grpc-timeout` header, and a well-behaved server passes the remaining time on to every call it makes. When the deadline passes or the client cancels, the cancellation propagates down the whole tree, so no server keeps working on an answer nobody will read." },
        { kind: "example", title: "Deadline propagation through three services", lines: [
          ["Gateway receives a request with", "a 2,000 ms budget"],
          ["Gateway spends 50 ms, calls the planner with", "1,950 ms remaining"],
          ["Planner spends 700 ms, calls a tool with", "1,250 ms remaining"],
          ["Tool takes 1,400 ms", "Deadline exceeded at 1,250 ms; the tool's work is cancelled"],
        ], result: "Without propagation, the tool would run to completion and its result would be thrown away. With it, everyone stops at the same moment." },
        { kind: "h", text: "The load balancing surprise" },
        { kind: "figure", figure: "lb-pinning", title: "One connection, many calls", caption: "An L4 balancer chooses a backend per TCP connection. gRPC opens one long HTTP/2 connection and sends every call over it, so every call lands on the same backend. An L7 balancer, or client-side balancing across several connections, spreads individual calls." },
        { kind: "p", text: "A **layer 4** balancer routes TCP connections and never looks inside. A **layer 7** balancer understands HTTP/2 and routes each request. With HTTP/1.1, many short connections made L4 balancing good enough. With gRPC's single long connection, an L4 balancer sends all of one client's traffic to one backend, and new backends added during a scale-up receive nothing until clients reconnect." },
        { kind: "deep", title: "Connect RPC and gRPC-Web", blocks: [
          { kind: "p", text: "**gRPC-Web** is a variant browsers can speak through a translating proxy. **Connect** goes further: the same Protobuf service definitions, served over plain HTTP/1.1 or HTTP/2 POST requests with JSON or binary bodies, readable with `curl`, and with streaming via length-prefixed bodies. One server can speak gRPC, gRPC-Web and Connect at once." },
          { kind: "p", text: "The trend is that RPC frameworks are converging on ordinary HTTP semantics so that every proxy, CDN and debugging tool in the path keeps working." },
        ] },
        { kind: "code", lang: "ts", file: "deadline.ts", code: `// Propagate the remaining budget to every downstream call
async function handle(req: Request, deadline: number) {
  const remaining = () => Math.max(0, deadline - Date.now());
  const signal = AbortSignal.timeout(remaining());

  const plan = await fetch(PLANNER_URL, { method: "POST", body: req.body, signal,
    headers: { "x-deadline-ms": String(remaining()) } });
  // …each hop subtracts its own time and passes the rest on
}
`, note: "Send an absolute deadline or a remaining budget, never a fixed per-hop timeout. Fixed timeouts add up to more than the caller is willing to wait." },
      ],
      practice: [
        ["Service meshes", "Envoy-based meshes balance gRPC per request at L7 for exactly this reason."],
        ["Kubernetes", "A plain Kubernetes Service balances connections, not requests. gRPC clients there use headless services and client-side balancing, or a mesh."],
        ["Model serving", "Inference servers expose gRPC streaming endpoints, and gateways in front of them must balance per request to keep GPUs evenly busy."],
      ],
      check: [
        ["Why does gRPC load balancing surprise people?", "One long HTTP/2 connection carries many calls, so an L4 balancer cannot spread them."],
        ["Where does gRPC put a call's status?", "In HTTP/2 trailers: `grpc-status` and `grpc-message`."],
        ["Why propagate deadlines rather than set fixed per-hop timeouts?", "So every service stops when the original caller stops caring, and nested timeouts never exceed the caller's budget."],
      ],
      tryIt: "Use `grpcurl -plaintext localhost:50051 list` against any gRPC server with reflection, then call a method with `-max-time 0.01` and read the deadline error.",
      terms: [
        ["Trailers", "Headers sent after the body, used by gRPC for status."],
        ["Deadline", "An absolute time after which a call's result is no longer useful."],
        ["L4 / L7 balancer", "Balancing by TCP connection versus by HTTP request."],
        ["Connect", "An RPC protocol using Protobuf services over plain HTTP."],
      ],
    },
    {
      slug: "breaking-llm-streams",
      title: "Everything that breaks an LLM stream",
      summary: "A worked catalogue of the six ways a token stream fails between the GPU and the screen, with the fix for each and a client that survives them.",
      level: "Depth",
      minutes: 20,
      blocks: [
        { kind: "p", text: "Put the module so far together. A token travels from an inference server through gateways, load balancers, CDNs, NATs and the user's Wi-Fi to a parser in a browser. Each hop can break the stream in its own way." },
        { kind: "figure", figure: "stream-failures", title: "Where each failure happens on the path", caption: "The path from model to screen with the six failure points marked. Select one to see its symptom, its cause and the fix." },
        { kind: "steps", items: [
          ["A read ends mid-event", "Symptom: JSON parse errors on some deltas. Cause: treating a network chunk as an event. Fix: buffer until the blank-line delimiter before parsing."],
          ["A read ends mid-character", "Symptom: `�` in the middle of words, especially emoji and CJK text. Fix: decode with `new TextDecoder().decode(chunk, { stream: true })`."],
          ["Tool-call arguments arrive as partial JSON", "Symptom: parse errors on `input_json_delta` events. Fix: accumulate the fragments and parse when the content block stops, or use an incremental JSON parser for live previews."],
          ["A proxy buffers the whole response", "Symptom: nothing for 20 seconds, then the entire answer at once. Fix: disable buffering for the route, for example `X-Accel-Buffering: no` on nginx, and avoid response compression middlewares that wait for full chunks."],
          ["A quiet period trips an idle timeout", "Symptom: long tool calls or thinking pauses end in a dropped connection. Fix: comment heartbeats every 15 to 30 seconds."],
          ["The phone changes network at token 900", "Symptom: the stream dies and the answer is lost. HTTP gives you nothing here. Fix: persist events by run ID and offset, and let the client resume (next lesson)."],
        ] },
        { kind: "code", lang: "ts", file: "accumulate-tool-input.ts", code: `// Tool input arrives as string fragments; only the whole thing is valid JSON.
const partial = new Map<number, string>();   // content block index → JSON text so far

for await (const event of parseSSE(response.body!)) {
  const message = JSON.parse(event.data);
  if (message.type === "content_block_delta" && message.delta.type === "input_json_delta") {
    partial.set(message.index, (partial.get(message.index) ?? "") + message.delta.partial_json);
  }
  if (message.type === "content_block_stop" && partial.has(message.index)) {
    const input = JSON.parse(partial.get(message.index)!);   // safe: the block is complete
    partial.delete(message.index);
    queueToolCall(message.index, input);
  }
}
`, note: "Event names follow a typical model streaming API; check your provider's reference. The pattern is the same everywhere: accumulate, then parse at a known boundary." },
        { kind: "h", text: "A server-side checklist" },
        { kind: "list", items: [
          "Flush after every event; do not let a framework buffer the body.",
          "Set `Cache-Control: no-cache` and disable proxy buffering for the route.",
          "Send heartbeats more often than the shortest idle timeout on the path.",
          "Give every event an ID and keep a log so a client can resume.",
          "Stop generating when the client disconnects, and record that it did.",
        ] },
        { kind: "callout", tone: "harness", title: "In a harness", text: "Stop wasting tokens on disconnected users. Listen for the request's `close` or abort signal and abort the upstream model request too; otherwise the model keeps generating, and you keep paying, for nobody." },
        { kind: "deep", title: "Batching tokens for the UI", blocks: [
          { kind: "p", text: "A model can emit 100 tokens per second. Re-rendering a Markdown view per token is wasted work; the screen updates at most 60 times per second, and re-parsing a growing document each time is quadratic (Module 11)." },
          { kind: "p", text: "Clients collect tokens into a buffer and flush it to the UI once per animation frame. The network stream stays fine-grained, while rendering stays at a steady frame rate." },
        ] },
      ],
      practice: [
        ["Platform defaults", "Some hosting platforms and CDNs buffer responses unless the content type is `text/event-stream` or buffering is disabled per route. Test streaming through the real production path, not just locally."],
        ["Compression", "Gzip middleware can hold output until it has enough to compress. Exclude streaming routes or flush the compressor per event."],
        ["Observability", "Log time to first token and inter-token gaps at the client, not just the server, to catch buffering in the middle."],
      ],
      check: [
        ["Tokens arrive all at once after 20 seconds. What happened?", "A proxy, CDN or compression middleware buffered the response. Disable buffering and flush per event."],
        ["Why accumulate tool-call input before parsing?", "Deltas are fragments of one JSON document; only the complete text is valid JSON."],
        ["What should a server do when the client disconnects mid-stream?", "Abort the upstream model call and any tools it started, and record the disconnect."],
      ],
      tryIt: "Put nginx with default settings in front of a local SSE endpoint and watch tokens arrive in a lump. Then add `proxy_buffering off;` or the `X-Accel-Buffering: no` header and compare.",
      terms: [
        ["Proxy buffering", "A proxy collecting a response before forwarding it."],
        ["Flush", "Forcing buffered output onto the network now."],
        ["Partial JSON", "A fragment of a JSON document delivered as part of a stream."],
      ],
    },
    {
      slug: "resumable-streams",
      title: "Resumable streams and stateless agent protocols",
      summary: "Make the stream a view of a durable log, and a dropped connection becomes a reconnect. Then see why the latest MCP revision went the other way: stateless requests, handles and polling.",
      level: "Current",
      minutes: 18,
      blocks: [
        { kind: "p", text: "A stream that lives only in a connection dies with it. The fix is to make the connection a **view** of something durable. The server appends every event to an **append-only log** keyed by run ID, with an increasing offset. A client streams from an offset; when it drops, it reconnects with the last offset it saw and receives everything after it." },
        { kind: "figure", figure: "resumable-stream", title: "Drop the connection at any point", caption: "The run writes events to a log as the model produces them. Disconnect the client, let the run continue, then reconnect. With a log, the client resumes from its last offset and loses nothing. Without one, everything produced during the gap is gone." },
        { kind: "code", lang: "ts", file: "resumable.ts", code: `// Server: the model loop writes to the log, never directly to a socket.
async function runAgent(runId: string) {
  for await (const event of modelStream()) await log.append(runId, event);   // offset assigned by the log
  await log.append(runId, { type: "done" });
}

// Server: any connection reads from the log, starting where the client left off.
app.get("/runs/:id/events", async (req, res) => {
  const from = Number(req.header("last-event-id") ?? -1) + 1;
  res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache" });
  for await (const { offset, event } of log.read(req.params.id, from, { follow: true, signal: req.signal })) {
    res.write(\`id: \${offset}\\ndata: \${JSON.stringify(event)}\\n\\n\`);
  }
  res.end();
});
`, note: "The model loop and the HTTP connection are now independent. A refresh, a network change or a second device all just read the same log." },
        { kind: "h", text: "What this buys, and what it costs" },
        { kind: "list", items: [
          "**Resume after any drop**, including a phone changing networks or a page refresh.",
          "**Multiple viewers** of one run, such as a second device or a teammate.",
          "**Replay and audit**: the log is the record of what the agent did (Module 10 builds durable execution on the same idea).",
          "**Cost**: storage per event, and a log service to run. Redis streams, Postgres tables or a managed durable stream all work.",
        ] },
        { kind: "h", text: "Idempotency: the other half of resuming" },
        { kind: "p", text: "A client that retries a request after a drop may cause the action twice. Starting a run must therefore be idempotent: the client generates the run ID or an idempotency key, and the server returns the existing run if it has seen that key. Any side-effecting tool call inside the run needs the same protection." },
        { kind: "callout", tone: "now", title: "Where things stand: MCP went stateless", text: "The Model Context Protocol's 2026-07-28 revision removed stream resumability. A broken response now loses the in-flight request, so side-effecting tools need an idempotency key. Long work moved to task handles that clients poll. The protocol now behaves like ordinary HTTP behind a round-robin load balancer." },
        { kind: "deep", title: "Why a protocol would drop resumability", blocks: [
          { kind: "p", text: "Resumable streams require the server to keep per-session state and route a reconnecting client to whoever holds it. That fights horizontal scaling: any server should be able to answer any request." },
          { kind: "p", text: "Stateless designs move state out of the connection into explicit **handles**: a task ID the client can poll from any server, backed by shared storage. It is the same durable-log idea, expressed as resources instead of a stream. Short calls stay simple; long calls become tasks." },
        ] },
      ],
      practice: [
        ["Chat apps", "Production chat products persist generation events so a refreshed tab picks up the answer mid-stream instead of losing it."],
        ["Durable streams", "Several platforms now offer resumable streams as a primitive, backed by Redis or a database, for exactly this pattern."],
        ["Task APIs", "Long agent jobs return a task ID immediately; clients poll or subscribe for status and results."],
      ],
      check: [
        ["How does a stream survive a network change?", "A durable event log, client-tracked offsets, and an idempotent resume request."],
        ["Why do side-effecting tools need idempotency keys once streams are not resumable?", "A broken response loses the in-flight request; the client cannot tell whether the action ran, so a retry must be safe."],
        ["What does a stateless protocol replace sessions with?", "Explicit handles, such as task IDs backed by shared storage, that any server can answer."],
      ],
      tryIt: "Build the log-backed endpoint above with an in-memory array, then use `curl -N -H 'Last-Event-ID: 41'` to resume from the middle. Kill the curl at random moments and confirm nothing is lost.",
      terms: [
        ["Append-only log", "A sequence of events that is only ever added to, never edited."],
        ["Offset", "An event's position in the log, used to resume reading."],
        ["Idempotency key", "A client-chosen ID that makes repeating a request safe."],
        ["Task handle", "An ID representing long-running work, used to poll status and results."],
      ],
    },
  ],
  lab: [
    "Write an SSE parser and fuzz it with random chunk boundaries, including splits inside a character.",
    "Build a resumable stream backed by an append-only log, and kill the connection at random points.",
    "Put a buffering proxy in front of your stream, observe the lump, and fix it.",
  ],
  interview: [
    ["SSE or WebSocket for a chat UI?", "SSE, unless the client must send on the same channel during generation."],
    ["How does a stream survive a network change?", "Durable event log, offsets, idempotent resume."],
    ["Why does gRPC load balancing surprise people?", "One long HTTP/2 connection carries many calls, so an L4 balancer cannot spread them."],
  ],
  reading: [
    "The Server-Sent Events section of the WHATWG HTML standard",
    "RFC 6455: The WebSocket Protocol",
    "gRPC's PROTOCOL-HTTP2 document",
    "The current Model Context Protocol specification",
  ],
};
