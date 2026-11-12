import type { CourseModule } from "./types";

export const tlsHttpQuic: CourseModule = {
  number: 5,
  slug: "tls-http-and-quic",
  title: "TLS, HTTP/1.1, HTTP/2, HTTP/3 and QUIC",
  shortTitle: "TLS, HTTP & QUIC",
  tagline: "No HTTP version is simply the best. Each one moved the bottleneck somewhere else.",
  intuition: "HTTP/2 put many streams on one TCP connection. TCP knows nothing about those streams, so one lost packet stalls all of them until it is resent. QUIC moves streams into the transport, so a lost packet stalls only its own stream. HTTP/3 wins on lossy, high-latency mobile paths; inside a data centre, HTTP/2 is usually the better default.",
  harness: "Every model call and most tool calls are HTTPS requests. Connection setup cost, how many requests share a connection, and what happens when a packet is lost decide your time to first token as much as the model does.",
  levels: {
    Basics: ["HTTP semantics", "Status codes", "Caching headers", "Keep-alive", "Certificates and the chain of trust", "SNI", "ALPN"],
    Depth: ["TLS 1.3 key schedule", "Forward secrecy", "Resumption", "HTTP/2 framing and flow control", "HPACK by hand", "QUIC packet spaces", "Stream and connection flow control", "The HTTP/2 Rapid Reset attack"],
    Current: ["Hybrid post-quantum key exchange", "Encrypted Client Hello", "MASQUE", "Multipath QUIC", "103 Early Hints replacing server push"],
  },
  timeline: [
    ["1991", "HTTP/0.9", "One line: `GET /page`. The response is the document, and the connection closes."],
    ["1997", "HTTP/1.1", "Persistent connections, the Host header and chunked transfer. It runs most of the web for two decades."],
    ["1999", "TLS 1.0", "SSL becomes TLS. Encryption is still optional and often skipped."],
    ["2015", "HTTP/2", "Binary frames and many streams over one connection, derived from Google's SPDY."],
    ["2018", "TLS 1.3", "One round-trip handshakes, forward secrecy by default, and a lot of legacy removed."],
    ["2021–22", "QUIC and HTTP/3", "RFC 9000 and RFC 9114: transport and TLS combined, running over UDP."],
    ["2026", "Post-quantum by default", "Hybrid ML-KEM key exchange carries most TLS traffic at large CDNs."],
  ],
  lessons: [
    {
      slug: "http-semantics",
      title: "HTTP semantics: methods, status, headers and caching",
      summary: "Before versions and transports, HTTP is a contract: what a method promises, what a status means, and which headers let caches and retries work safely.",
      level: "Basics",
      minutes: 18,
      blocks: [
        { kind: "p", text: "HTTP separates **semantics**, what a request means, from **wire format**, how it is encoded. A `GET /users/7` means the same thing in HTTP/1.1, HTTP/2 and HTTP/3. Only the bytes differ. This lesson is about the meaning; the next lessons are about the bytes." },
        { kind: "figure", figure: "http-anatomy", title: "An HTTP/1.1 exchange, annotated", caption: "The request line, headers and body of a streaming model call, then the response. HTTP/1.1 is plain text, which is why you can type it by hand. Hover or focus each part for what it does." },
        { kind: "h", text: "Methods carry promises" },
        { kind: "table", head: ["Method", "Safe", "Idempotent", "Meaning"], rows: [
          ["GET", "Yes", "Yes", "Read a resource. Must not change state."],
          ["HEAD", "Yes", "Yes", "Like GET, headers only."],
          ["PUT", "No", "Yes", "Replace the resource with this body. Repeating it changes nothing further."],
          ["DELETE", "No", "Yes", "Remove it. Deleting twice leaves it deleted."],
          ["POST", "No", "No", "Process this. Repeating may create two orders or two charges."],
          ["PATCH", "No", "Not guaranteed", "Apply a partial change."],
        ] },
        { kind: "p", text: "**Safe** means no state change. **Idempotent** means doing it twice has the same effect as once. These properties decide what can be retried automatically: a client, proxy or browser may resend an idempotent request after a dropped connection, but must not blindly resend a POST. That is why payment APIs accept an `Idempotency-Key` header: it makes a POST safe to retry." },
        { kind: "h", text: "Status codes by family" },
        { kind: "table", head: ["Range", "Meaning", "Ones to know"], rows: [
          ["1xx", "Informational, more is coming", "`101 Switching Protocols` (WebSocket), `103 Early Hints`"],
          ["2xx", "Success", "`200 OK`, `201 Created`, `204 No Content`"],
          ["3xx", "Go elsewhere or use your cache", "`301`/`308` permanent, `302`/`307` temporary, `304 Not Modified`"],
          ["4xx", "The request is wrong; do not retry unchanged", "`400`, `401`, `403`, `404`, `409 Conflict`, `429 Too Many Requests`"],
          ["5xx", "The server failed; retry may help", "`500`, `502 Bad Gateway`, `503 Unavailable`, `504 Gateway Timeout`"],
        ] },
        { kind: "callout", tone: "trap", title: "429 and 529 are not the same as errors", text: "`429` means you are sending too fast; honour `Retry-After` and back off. Some model providers return `529` when they are overloaded. Both are retryable, but only with backoff and jitter, never in a tight loop (Module 10)." },
        { kind: "h", text: "Caching headers" },
        { kind: "p", text: "`Cache-Control` tells caches what they may do: `max-age=3600` (fresh for an hour), `no-store` (never keep), `private` (only the user's own browser), `immutable` (never revalidate). Validators let a cache ask “has it changed?” cheaply: the server sends an `ETag`, the client later sends `If-None-Match`, and an unchanged resource returns `304 Not Modified` with no body." },
        { kind: "example", title: "A conditional request saving a transfer", lines: [
          ["First response", "`200 OK`, `ETag: \"v42\"`, 480 KB body"],
          ["Later request", "`If-None-Match: \"v42\"`"],
          ["Resource unchanged", "`304 Not Modified`, empty body, a few hundred bytes of headers"],
        ], result: "Same round trip, 99.9% fewer bytes. Tool results fetched repeatedly by an agent benefit the same way." },
        { kind: "h", text: "Keep-alive" },
        { kind: "p", text: "HTTP/1.0 opened a new TCP connection per request. HTTP/1.1 made connections **persistent** by default: after a response, the connection stays open for the next request. That avoids repeating the TCP and TLS handshakes and slow start. But one HTTP/1.1 connection carries **one request at a time**. Browsers open up to six connections per origin to work around this, and that limit returns when we discuss SSE." },
        { kind: "deep", title: "Chunked transfer: streaming in HTTP/1.1", blocks: [
          { kind: "p", text: "A response usually announces its size with `Content-Length`. A streaming response does not know its size in advance, so HTTP/1.1 uses `Transfer-Encoding: chunked`: each chunk is its length in hexadecimal, a line break, the bytes, and another line break. A zero-length chunk ends the body." },
          { kind: "code", lang: "text", file: "chunked-response.txt", code: `HTTP/1.1 200 OK
Content-Type: text/event-stream
Transfer-Encoding: chunked

19
data: {"delta":"Hello"}\\n\\n
1a
data: {"delta":" world"}\\n\\n
0

` },
          { kind: "p", text: "Chunk boundaries are a transport detail. A proxy may merge or split them, so a client must never treat one chunk as one event. HTTP/2 and HTTP/3 drop chunked encoding entirely; their DATA frames do the same job." },
        ] },
      ],
      practice: [
        ["Retries in SDKs", "Model SDKs retry 408, 429 and 5xx responses with backoff, and only when the request is safe to repeat or carries an idempotency key."],
        ["CDN caching", "Static assets with content hashes in their names are served with `Cache-Control: max-age=31536000, immutable`, so browsers never even ask again."],
        ["Agent tools", "A web-fetch tool that sends `If-None-Match` for pages it has already read saves both bandwidth and the tokens of re-reading unchanged content."],
      ],
      check: [
        ["What is the difference between safe and idempotent?", "Safe means no state change at all. Idempotent means repeating the request has the same effect as doing it once."],
        ["Why do payment APIs accept an Idempotency-Key header?", "It lets a client safely retry a POST: the server returns the stored result for a repeated key instead of charging twice."],
        ["What does a 304 response save?", "The body. The client already has the current version, confirmed by its validator."],
      ],
      tryIt: "Run `curl -sI https://example.com` and read the caching headers. Then repeat with `-H 'If-None-Match: <the etag>'` and check for a 304.",
      terms: [
        ["Idempotent", "Repeating the operation has the same effect as doing it once."],
        ["ETag", "An opaque version identifier a server attaches to a response."],
        ["Persistent connection", "A connection reused for many requests, also called keep-alive."],
        ["Chunked encoding", "HTTP/1.1's way to stream a body of unknown length."],
      ],
    },
    {
      slug: "tls-and-trust",
      title: "TLS: certificates, trust and the 1-RTT handshake",
      summary: "How two strangers agree on a secret over a hostile network, and how the client knows it is talking to the right server. Then what TLS 1.3 removed and why it is faster.",
      level: "Basics",
      minutes: 22,
      blocks: [
        { kind: "p", text: "TLS gives a connection three properties. **Confidentiality**: nobody on the path can read it. **Integrity**: nobody can change it undetected. **Authentication**: the client knows which server it is talking to. The first two come from symmetric encryption with a shared key. The hard parts are agreeing on that key in public, and proving identity." },
        { kind: "h", text: "Key exchange in one idea" },
        { kind: "p", text: "In **Diffie-Hellman** key exchange, each side picks a private number, sends a public value derived from it, and combines its own private number with the other side's public value. Both arrive at the same secret, while an observer who saw only the public values cannot compute it. TLS 1.3 uses elliptic-curve versions such as X25519, and in 2026 increasingly a hybrid that adds a post-quantum algorithm." },
        { kind: "callout", tone: "analogy", title: "Mixing paint", text: "Both sides start with the same public yellow. Each mixes in a secret colour and sends the result. Each then adds their own secret colour to what they received. Both end with yellow + secret A + secret B. Someone who saw only the two mixtures cannot un-mix them to find the final colour." },
        { kind: "h", text: "Certificates and the chain of trust" },
        { kind: "p", text: "A key exchange alone could be with an attacker in the middle. The server therefore proves its identity with a **certificate**: a document binding its public key to its domain name, signed by a **certificate authority**. That CA's certificate is signed by a root CA whose certificate ships in your operating system or browser trust store. The client checks each signature up the chain, checks the name matches, and checks nothing has expired." },
        { kind: "figure", figure: "tls13-handshake", title: "The TLS 1.3 handshake, message by message", caption: "Step through the handshake. The client guesses the key exchange and sends its key share in the first message, so the server can derive keys immediately and encrypt everything after ServerHello, including its certificate. Application data can follow after one round trip." },
        { kind: "h", text: "SNI and ALPN" },
        { kind: "p", text: "One IP address often serves thousands of domains. The client names the one it wants in the **Server Name Indication** extension of its ClientHello, so the server can pick the right certificate. **ALPN** lets the client list protocols it speaks, such as `h2` and `http/1.1`, and the server picks one during the handshake, saving a round trip of negotiation." },
        { kind: "h", text: "Forward secrecy and resumption" },
        { kind: "p", text: "TLS 1.3 only allows **ephemeral** key exchanges: a fresh key pair per connection, thrown away afterwards. If the server's long-term private key leaks next year, recorded traffic from today stays safe. This is **forward secrecy**. TLS 1.2 also allowed RSA key transport, where a leaked key decrypts everything ever recorded." },
        { kind: "p", text: "A returning client can **resume** with a pre-shared key from a previous session ticket, skipping certificate checks. It can even send **0-RTT** early data in its first flight. Early data can be replayed by an attacker who captured it, so servers should accept it only for idempotent requests." },
        { kind: "example", title: "Round trips before the first response byte", lines: [
          ["TLS 1.2 full handshake", "TCP 1 RTT + TLS 2 RTT + request 1 RTT = 4 RTT"],
          ["TLS 1.3 full handshake", "TCP 1 RTT + TLS 1 RTT + request 1 RTT = 3 RTT"],
          ["TLS 1.3 with 0-RTT resumption", "TCP 1 RTT + request sent with the handshake = 2 RTT"],
          ["At 150 ms per RTT", "600 ms, 450 ms and 300 ms respectively"],
        ], result: "The next lesson adds DNS and QUIC to this table." },
        { kind: "deep", title: "The TLS 1.3 key schedule, briefly", blocks: [
          { kind: "p", text: "TLS 1.3 never uses the Diffie-Hellman secret directly. It feeds it through HKDF, a key-derivation function, together with a hash of every handshake message so far, the **transcript**. Out come separate keys for each direction and each phase: handshake traffic, application traffic, resumption." },
          { kind: "p", text: "Binding keys to the transcript means any tampering with an earlier message, such as removing a stronger cipher suite from the ClientHello to force a weaker one, produces different keys, and the Finished messages fail to verify. Downgrade attacks that plagued older versions stop working." },
        ] },
        { kind: "code", lang: "bash", file: "inspect-tls.sh", code: `# Handshake details: protocol, cipher, key exchange group, certificate chain
openssl s_client -connect api.example.com:443 -servername api.example.com -brief </dev/null

# Full chain with issuers
openssl s_client -connect api.example.com:443 -showcerts </dev/null | grep -E 's:|i:'

# Let Wireshark decrypt your own traffic for study
SSLKEYLOGFILE=$PWD/keys.log curl -s https://example.com > /dev/null
`, note: "Point Wireshark's TLS settings at `keys.log` and the encrypted records in your capture become readable." },
      ],
      practice: [
        ["Certificate expiry outages", "Expired certificates still cause major outages. Automated issuance with ACME, as Let's Encrypt popularised, renews them every few weeks."],
        ["Corporate proxies", "TLS-inspecting proxies install their own root CA on company machines. Tools with pinned or bundled trust stores then fail with certificate errors."],
        ["mTLS", "Service meshes give every service a certificate and require one from the client too, so both sides authenticate."],
      ],
      check: [
        ["What does a certificate prove, and who vouches for it?", "That a public key belongs to a domain name. A certificate authority signs it, and the client trusts that CA's root."],
        ["What is forward secrecy?", "Compromising a long-term key later does not decrypt past sessions, because each session used a fresh ephemeral key exchange."],
        ["Why is 0-RTT data dangerous?", "It can be replayed. A request that charges money must not be accepted as 0-RTT data."],
      ],
      tryIt: "Run the `openssl s_client -brief` command against three sites. Note the TLS version, the key exchange group (look for X25519MLKEM768) and the issuer.",
      terms: [
        ["Certificate authority", "An organisation trusted to sign certificates binding keys to names."],
        ["SNI", "Server Name Indication: the domain the client wants, sent in the ClientHello."],
        ["ALPN", "Application-Layer Protocol Negotiation: agreeing on h2 or http/1.1 inside the handshake."],
        ["Forward secrecy", "Past sessions stay safe even if long-term keys leak later."],
      ],
    },
    {
      slug: "cold-connection-cost",
      title: "The cold-connection tax and connection reuse",
      summary: "Add up every round trip before the first byte of a response, and you will see why connection reuse matters more than most code optimisation.",
      level: "Depth",
      minutes: 15,
      blocks: [
        { kind: "p", text: "A brand-new HTTPS request pays for several things before the server even sees it: a DNS lookup, a TCP handshake, a TLS handshake, then the request itself. Each costs at least one round trip, and round trips are set by distance, not by your code." },
        { kind: "figure", figure: "rtt-waterfall", title: "Time to first byte, cold and warm", caption: "Choose the round-trip time and the connection type. Each bar is one phase. A reused connection skips straight to the request. QUIC folds transport and TLS into one round trip, and 0-RTT resumption sends the request immediately, with replay risk." },
        { kind: "example", title: "The 150 ms cold-connection tax", lines: [
          ["DNS (cold)", "~1 RTT to the resolver, often less if cached"],
          ["TCP handshake", "1 RTT = 150 ms"],
          ["TLS 1.3 handshake", "1 RTT = 150 ms"],
          ["Request and first response byte", "1 RTT = 150 ms, plus server time"],
        ], result: "450 ms before any server work, ignoring DNS. On a warm connection, the same request costs 150 ms." },
        { kind: "h", text: "Connection pools" },
        { kind: "p", text: "HTTP clients keep a **pool** of open connections per origin and hand them out to requests. A good pool has a maximum size, an idle timeout shorter than the server's (so you do not reuse a connection the server is about to close), and health checks. In Node, `fetch` is built on undici, which pools by default; older `http.Agent` code needs `keepAlive: true`." },
        { kind: "code", lang: "ts", file: "pool.ts", code: `import { Agent, setGlobalDispatcher } from "undici";

// One pool for the whole process, tuned for a model API
setGlobalDispatcher(new Agent({
  connections: 64,             // max sockets per origin
  keepAliveTimeout: 30_000,    // close idle sockets before the server does
  keepAliveMaxTimeout: 600_000,
  connect: { timeout: 10_000 },
}));

// Every fetch() now reuses warm connections when one is free
const response = await fetch("https://api.example.com/v1/messages", { method: "POST", body });
`, note: "Creating a new client or agent per request silently throws the pool away. Create it once and share it." },
        { kind: "h", text: "Warming and prefetching" },
        { kind: "p", text: "Browsers can open connections before they are needed with `<link rel=\"preconnect\">`. Servers can do the same at startup: make one cheap request to each upstream so the first user request finds a warm, already-slow-started connection. For an agent harness that calls the same model API all day, the pool is warm after the first call; what matters is not throwing it away." },
        { kind: "deep", title: "When reuse goes wrong: stale connections", blocks: [
          { kind: "p", text: "A pooled connection may have been closed by the server, a load balancer or a NAT while it sat idle. The client only finds out when it writes: the request fails with `ECONNRESET` or `socket hang up`." },
          { kind: "p", text: "Good clients retry such failures once on a fresh connection, but only for requests that are safe to repeat, because the server may have received the first attempt. Keep client idle timeouts below the server's and the balancer's to make this rare." },
        ] },
      ],
      practice: [
        ["Serverless cold starts", "A function instance's first request pays for its own connections. Platforms that reuse instances, and code that creates clients outside the handler, keep connections warm."],
        ["Database proxies", "Connection poolers such as PgBouncer exist because opening a Postgres connection costs handshakes plus a process fork."],
        ["Browser preconnect", "Sites preconnect to their API and font origins in the HTML head, saving hundreds of milliseconds on mobile."],
      ],
      check: [
        ["How many round trips does a cold HTTPS/TCP request cost before the first response byte, ignoring DNS?", "Three with TLS 1.3: TCP, TLS and the request."],
        ["Why set the client's keep-alive timeout below the server's?", "So the client never reuses a connection the server has just closed."],
        ["What does a new HTTP client per request cost?", "A new connection each time: handshakes, slow start and possibly TIME_WAIT buildup."],
      ],
      tryIt: "Use `curl -w '%{time_namelookup} %{time_connect} %{time_appconnect} %{time_starttransfer}\\n' -o /dev/null -s https://example.com` twice in one command line with two URLs, and compare the first and second request.",
      terms: [
        ["Time to first byte", "Time from starting a request until the first response byte arrives."],
        ["Connection pool", "A set of open connections reused across requests."],
        ["Preconnect", "Opening a connection before the request that needs it."],
      ],
    },
    {
      slug: "http2-multiplexing",
      title: "HTTP/2: frames, streams and head-of-line blocking",
      summary: "HTTP/2 sends many requests over one connection as interleaved binary frames. Learn the framing, HPACK compression and flow control, and the TCP-level blocking HTTP/2 could not fix.",
      level: "Depth",
      minutes: 22,
      blocks: [
        { kind: "p", text: "HTTP/1.1 sends one request at a time per connection. A slow response blocks everything behind it on that connection: **application-level head-of-line blocking**. Browsers opened six connections per origin, and sites sharded assets across domains, just to get parallelism." },
        { kind: "p", text: "HTTP/2 keeps HTTP's semantics but replaces the text format with **binary frames**. Every request and response becomes a **stream** with an ID, and frames from many streams interleave on one connection. A slow response no longer blocks others at the HTTP level." },
        { kind: "table", head: ["Frame", "Purpose"], rows: [
          ["HEADERS", "Starts a stream; carries compressed headers"],
          ["DATA", "Body bytes for one stream"],
          ["SETTINGS", "Connection parameters, such as max concurrent streams"],
          ["WINDOW_UPDATE", "Flow control: permission to send more"],
          ["RST_STREAM", "Cancel one stream without closing the connection"],
          ["GOAWAY", "Graceful shutdown: no new streams after this ID"],
          ["PING", "Liveness and RTT measurement"],
        ] },
        { kind: "p", text: "Each frame has a 9-byte header: 24-bit length, 8-bit type, 8-bit flags, and a 31-bit stream ID. Client-initiated streams use odd IDs. Because frames are length-prefixed, the receiver always knows where each one ends, the framing lesson from Module 4 applied." },
        { kind: "h", text: "HPACK header compression" },
        { kind: "p", text: "Request headers repeat almost entirely between requests: the same host, user agent, cookies and accept headers. **HPACK** compresses them with three tools: a **static table** of 61 common header fields, a **dynamic table** of headers this connection has already sent, and Huffman coding for literal strings. A repeated header shrinks to a single byte index." },
        { kind: "example", title: "A repeated header in HPACK", lines: [
          ["First request sends", "`authorization: Bearer eyJ…` (about 900 bytes), and adds it to the dynamic table at index 62"],
          ["Second request sends", "One byte: “indexed header field 62”"],
          ["Saved per request", "~899 bytes"],
        ], result: "Over 1,000 requests on one connection, nearly 1 MB of header bytes is never sent." },
        { kind: "h", text: "The block HTTP/2 could not remove" },
        { kind: "figure", figure: "hol-blocking", title: "One lost packet, three streams", caption: "Three responses share a connection and one packet carrying stream B is lost. Switch protocols: HTTP/1.1 serialises the responses; HTTP/2 interleaves them but TCP holds back every later byte until the loss is repaired; HTTP/3 stalls only stream B." },
        { kind: "p", text: "Streams are independent to HTTP/2, but TCP sees one byte stream. When a packet is lost, TCP holds back every later byte, whichever stream it belongs to, until the retransmission arrives. On a clean data-centre network that is rare and cheap. On a mobile link with 2% loss, a single HTTP/2 connection can perform worse than six HTTP/1.1 connections." },
        { kind: "h", text: "Flow control" },
        { kind: "p", text: "HTTP/2 adds its own flow control on top of TCP's, per stream and per connection. A receiver grants credit with WINDOW_UPDATE frames. This lets one slow consumer, such as a stalled download, stop without starving every other stream on the connection." },
        { kind: "deep", title: "Rapid Reset: a protocol feature as an attack", blocks: [
          { kind: "p", text: "In October 2023, attackers exploited a simple pattern: open a stream with HEADERS, immediately cancel it with RST_STREAM, repeat. The client stays within its concurrent-stream limit because each stream is closed at once, but the server has already started work for every request. Record-breaking request floods followed (CVE-2023-44487)." },
          { kind: "p", text: "Servers now count resets and close connections that cancel too many streams. The lesson generalises: any cheap-for-client, expensive-for-server operation in a protocol needs a budget. Agent tool servers face the same shape when a client can start and cancel expensive tool runs freely." },
        ] },
        { kind: "callout", tone: "harness", title: "In a harness", text: "gRPC and most model SDKs run over HTTP/2. Many concurrent model calls can share one connection, but the server's `SETTINGS_MAX_CONCURRENT_STREAMS` (often 100) caps them. Beyond that, requests queue inside the client, which looks like mysterious latency." },
      ],
      practice: [
        ["gRPC", "gRPC maps each call to an HTTP/2 stream, uses trailers for status, and cancels calls with RST_STREAM."],
        ["Server push retired", "HTTP/2 server push was removed from major browsers because it rarely helped. `103 Early Hints` replaced it: the server suggests what to preload."],
        ["Domain sharding reversed", "Under HTTP/2, splitting assets across domains hurts, because each domain needs its own connection and handshake."],
      ],
      check: [
        ["Head-of-line blocking exists at which layers?", "HTTP/1.1 at the application layer, TCP at the transport layer under HTTP/2, and QPACK dynamic-table references under HTTP/3."],
        ["What does HPACK's dynamic table store?", "Header fields already sent on this connection, so repeats can be sent as small indexes."],
        ["Why can HTTP/2 be slower than HTTP/1.1 on a lossy link?", "One lost packet blocks every stream on the single TCP connection, while six HTTP/1.1 connections lose independently."],
      ],
      tryIt: "Run `curl -sv --http2 https://example.com -o /dev/null 2>&1 | grep -i 'alpn\\|http/2'`. Then use `nghttp -nv https://example.com` if you have it, to see individual frames.",
      terms: [
        ["Stream", "One request-response exchange inside an HTTP/2 or HTTP/3 connection."],
        ["Frame", "HTTP/2's unit on the wire: 9-byte header plus payload."],
        ["HPACK", "HTTP/2 header compression with static and dynamic tables."],
        ["Head-of-line blocking", "A stalled item at the front of a queue delaying everything behind it."],
      ],
    },
    {
      slug: "quic-and-http3",
      title: "QUIC and HTTP/3",
      summary: "QUIC rebuilds TCP's job in user space on top of UDP, with TLS built in and streams in the transport. Learn what that changes, what it costs, and when not to use it.",
      level: "Depth",
      minutes: 22,
      blocks: [
        { kind: "p", text: "QUIC is a transport protocol that runs over UDP. It provides what TCP provides, reliability, ordering and congestion control, plus what TLS provides, and it knows about **streams**. HTTP/3 is HTTP semantics mapped onto QUIC streams." },
        { kind: "h", text: "What QUIC changes" },
        { kind: "steps", items: [
          ["One handshake, not two", "Transport and TLS 1.3 handshakes combine. A new connection needs 1 round trip before the request, against 2 for TCP plus TLS."],
          ["Streams in the transport", "Loss is recovered per stream. A lost packet stalls only the streams whose data it carried."],
          ["Connection IDs", "Connections are identified by an ID, not the 4-tuple. A phone moving from Wi-Fi to cellular keeps its connection."],
          ["Never-reused packet numbers", "A retransmission gets a new packet number, so an ACK always says which transmission arrived. RTT measurement becomes unambiguous."],
          ["Encrypted headers", "Almost all of the header is encrypted. Middleboxes cannot inspect or depend on it, so the protocol can keep evolving."],
        ] },
        { kind: "figure", figure: "connection-migration", title: "Changing networks mid-download", caption: "A phone leaves Wi-Fi at token 900. With TCP, the 4-tuple changes, the connection breaks, and the client must reconnect and re-request. With QUIC, packets from the new address carry the same connection ID, and the server validates the new path and continues." },
        { kind: "h", text: "What it costs" },
        { kind: "list", items: [
          "**CPU.** QUIC runs in user space with less hardware offload than TCP, so CPU cost per byte is usually higher. Kernel-bypass and UDP segmentation offload narrow the gap.",
          "**Blocked UDP.** Some enterprise and hotel networks block or throttle UDP. Clients must fall back to TCP, and race both to avoid waiting.",
          "**Tooling.** Encrypted headers that block middleboxes also block your packet captures. Use qlog, QUIC's structured event log, and qvis to visualise it.",
          "**0-RTT replay.** As with TLS 1.3, early data can be replayed. Accept it only for idempotent requests.",
        ] },
        { kind: "h", text: "QPACK" },
        { kind: "p", text: "HPACK assumes headers arrive in order, which TCP guaranteed. QUIC streams arrive independently, so HTTP/3 uses **QPACK**: dynamic-table updates travel on a dedicated stream, and a request referencing an entry the decoder has not yet received must wait. That is the last place head-of-line blocking survives in HTTP/3, and encoders can trade compression for avoiding it." },
        { kind: "h", text: "How a client finds HTTP/3" },
        { kind: "p", text: "A client cannot assume a server speaks QUIC. It learns from an `Alt-Svc: h3=\":443\"` response header on an HTTP/2 connection, or before connecting from an HTTPS DNS record. Browsers then race QUIC against TCP and use whichever connects first, remembering failures." },
        { kind: "table", head: ["Situation", "Better default", "Why"], rows: [
          ["Mobile users, long or lossy paths", "HTTP/3", "Independent stream recovery, 1-RTT setup, connection migration"],
          ["Service to service inside one region", "HTTP/2", "Loss is near zero, CPU and tooling are cheaper"],
          ["Browser to CDN", "Both, raced", "Let the client pick what works on its network"],
          ["Long-lived streaming to phones", "HTTP/3 or resumable streams", "Survive network changes (Module 6)"],
        ] },
        { kind: "deep", title: "Why build a transport on UDP at all?", blocks: [
          { kind: "p", text: "TCP lives in operating system kernels, and changing it needs billions of devices to update. Worse, firewalls and NATs inspect TCP headers and drop anything unfamiliar, which is how TCP Fast Open stalled. UDP is a thin, universally forwarded wrapper. A transport built on it can live in an app or a library and change every release." },
          { kind: "p", text: "Encryption is the second half of the trick. Because QUIC encrypts nearly every header field, middleboxes cannot build features that depend on them, so they cannot freeze the protocol. Designers sometimes call this “greasing”: deliberately sending unused values so nobody can assume they never appear." },
        ] },
        { kind: "callout", tone: "now", title: "Where things stand in late 2026", text: "Support is not the same as use. W3Techs counted 41.1% of websites on HTTP/3 as of 8 November 2026, while Cloudflare's share of requests sat near 30% for years. Meta reported HTTP/3 at just under 90% of its egress, because it controls both client and server." },
      ],
      practice: [
        ["Video and apps", "Large apps that ship their own networking stacks use QUIC to their own servers and see the biggest gains on poor mobile networks."],
        ["Internal services", "Most service meshes and gRPC deployments stay on HTTP/2 inside the data centre."],
        ["Proxying with MASQUE", "MASQUE tunnels UDP and IP traffic over HTTP/3, used by privacy relays such as iCloud Private Relay."],
      ],
      check: [
        ["When would you not use HTTP/3 between internal services?", "When loss is near zero, so its main benefit disappears, while CPU cost, offload and tooling are worse."],
        ["How does QUIC survive a network change?", "Connections are identified by connection IDs, not addresses and ports, so packets from the new path still match."],
        ["Why do clients race QUIC against TCP?", "UDP may be blocked or throttled. Racing avoids waiting on a QUIC attempt that will never succeed."],
      ],
      tryIt: "Run `curl --http3 -sI https://cloudflare.com` (with an HTTP/3-enabled curl) and look at the first line. Then check `Alt-Svc` in `curl -sI --http2` output for the same site.",
      terms: [
        ["QUIC", "A UDP-based transport with built-in TLS 1.3 and streams."],
        ["Connection ID", "QUIC's identifier for a connection, independent of IP address and port."],
        ["QPACK", "HTTP/3 header compression adapted for out-of-order streams."],
        ["Alt-Svc", "A response header advertising that a service is also available another way, such as HTTP/3."],
      ],
    },
    {
      slug: "post-quantum-and-edge",
      title: "Post-quantum TLS, Encrypted Client Hello and Early Hints",
      summary: "What changed in the last two years: hybrid post-quantum key exchange in most TLS traffic, encrypted server names, and preload hints that replaced server push.",
      level: "Current",
      minutes: 16,
      blocks: [
        { kind: "p", text: "A large enough quantum computer could break the elliptic-curve key exchanges TLS uses today. None exists yet, but traffic recorded now could be decrypted later: **harvest now, decrypt later**. Protecting key exchange cannot wait for the computer to arrive." },
        { kind: "h", text: "Hybrid key exchange" },
        { kind: "p", text: "The deployed answer is a **hybrid**: run classical X25519 and the post-quantum ML-KEM-768 side by side and combine both secrets. An attacker must break both. The named group `X25519MLKEM768` carries this in ordinary TLS 1.3 key shares. Per the syllabus sources, RFC 10024 standardised it in August 2026, and it carried over two-thirds of human TLS traffic to Cloudflare by April 2026." },
        { kind: "figure", figure: "clienthello-size", title: "The post-quantum ClientHello no longer fits in one packet", caption: "A classical ClientHello with an X25519 key share fits easily in one packet. ML-KEM-768 adds a 1,184-byte encapsulation key, making the hybrid client share 1,216 bytes and pushing the ClientHello past a typical 1,500-byte packet." },
        { kind: "p", text: "Bigger first messages have consequences. Middleboxes that assumed a ClientHello fits in one packet broke; some servers needed bigger buffers; QUIC's anti-amplification limits interact with larger first flights. These were found and fixed through years of experiments before the default switch." },
        { kind: "callout", tone: "trap", title: "What it protects, and what not", text: "X25519MLKEM768 protects **key exchange**: recorded traffic stays confidential. **Authentication** still uses classical certificate signatures. Post-quantum signatures are much larger and are a separate, slower migration." },
        { kind: "h", text: "Encrypted Client Hello" },
        { kind: "p", text: "TLS 1.3 encrypts almost everything after ServerHello, but the ClientHello itself, including the SNI naming the site, travels in plaintext. Anyone on the path can see which site you visit. **Encrypted Client Hello** encrypts the real ClientHello with a key published in the site's HTTPS DNS record, inside an outer ClientHello that names only a shared front-end." },
        { kind: "h", text: "103 Early Hints" },
        { kind: "p", text: "While a server computes a response, the browser sits idle. HTTP/2 server push tried to fill that time by pushing resources unasked, but servers pushed things browsers already had, wasting bandwidth, and browsers removed it. **103 Early Hints** sends an informational response first, with `Link: rel=preload` headers. The browser decides what to fetch, using its own cache knowledge." },
        { kind: "code", lang: "text", file: "early-hints.txt", code: `HTTP/1.1 103 Early Hints
Link: </app.css>; rel=preload; as=style
Link: <https://api.example.com>; rel=preconnect

HTTP/1.1 200 OK
Content-Type: text/html
…
` },
        { kind: "deep", title: "MASQUE and multipath QUIC", blocks: [
          { kind: "p", text: "**MASQUE** defines how to proxy UDP and IP over HTTP/3, so a single QUIC connection to a proxy can carry other QUIC connections inside it. It powers privacy relays and modern VPN-like services that look like ordinary HTTPS to the network." },
          { kind: "p", text: "**Multipath QUIC** extends connection migration: instead of moving from one path to another, a connection uses several at once, like Multipath TCP. The aim is seamless handover and combined bandwidth on phones with Wi-Fi and cellular." },
        ] },
      ],
      practice: [
        ["Browsers and CDNs", "Chrome, Firefox and major CDNs negotiate the hybrid group by default. Your own TLS library may need an upgrade to offer it."],
        ["Compliance", "Organisations with long-lived secrets prioritise post-quantum key exchange now, because recorded traffic is the threat."],
        ["Page speed", "Sites with slow server-side rendering send 103 responses to start CSS and font downloads during the wait."],
      ],
      check: [
        ["What does X25519MLKEM768 protect, and what not?", "Key exchange, so recorded traffic stays confidential. Not certificate authentication, which still uses classical signatures."],
        ["Why is the hybrid used rather than ML-KEM alone?", "An attacker must break both algorithms, so a flaw in the newer one does not leave traffic exposed."],
        ["What does Encrypted Client Hello hide?", "The real ClientHello, including the SNI naming the site you are connecting to."],
      ],
      tryIt: "Run `openssl s_client -connect cloudflare.com:443 -groups X25519MLKEM768 -brief </dev/null` with an OpenSSL 3.5 or later build and check the negotiated group.",
      terms: [
        ["Harvest now, decrypt later", "Recording encrypted traffic today to decrypt once quantum attacks exist."],
        ["ML-KEM", "A standardised post-quantum key encapsulation mechanism."],
        ["ECH", "Encrypted Client Hello: hides the real ClientHello and SNI."],
        ["Early Hints", "A 103 response suggesting resources to preload before the final response."],
      ],
    },
  ],
  lab: [
    "Build an HTTP/1.1 server on raw sockets: parse the request line and headers, support keep-alive and chunked responses.",
    "Decode TLS in Wireshark using `SSLKEYLOGFILE`.",
    "Load the same page over HTTP/2 and HTTP/3 with 0%, 1% and 5% loss, and plot the results.",
    "View a QUIC connection with qlog and qvis.",
  ],
  interview: [
    ["When would you not use HTTP/3 between internal services?", "Low loss removes its main benefit, while CPU cost, weaker offload and tooling get worse."],
    ["Head-of-line blocking exists at which layers?", "HTTP/1.1 application, TCP transport, and QPACK dynamic-table references."],
    ["Why is 0-RTT dangerous?", "Replay. A POST that charges money must not use it."],
    ["What does X25519MLKEM768 protect, and what not?", "Key exchange yes, certificate authentication no."],
  ],
  reading: [
    "RFC 9000, 9001, 9114 and 9204 for QUIC and HTTP/3",
    "RFC 9113 for HTTP/2",
    "RFC 9846 for updated TLS 1.3",
    "The Illustrated TLS 1.3 Connection and The Illustrated QUIC Connection, Michael Driscoll",
  ],
};
