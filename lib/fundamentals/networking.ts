import type { CourseModule } from "./types";

export const networking: CourseModule = {
  number: 4,
  slug: "networking-and-tcp",
  title: "Networking from packets to TCP",
  shortTitle: "Packets & TCP",
  tagline: "The internet delivers packets with no promises. TCP builds a reliable, ordered byte stream on top, and every protocol above it inherits its costs.",
  intuition: "Latency is limited by distance and throughput by window size divided by round-trip time. TCP is a byte stream with no message boundaries, so one read may return half a message or three. And every TCP sender has to discover the network's capacity by probing it, which is why a new connection starts slow.",
  harness: "An agent harness is a network client before it is anything else: it streams tokens from a model API, calls tools over HTTP and holds long, mostly idle connections. Silent stream deaths, slow first requests and connection exhaustion under load all come from this module.",
  levels: {
    Basics: ["Layering", "Ethernet frames and MTU", "IP routing", "NAT", "Ports", "UDP and TCP", "The sockets API", "DNS resolution"],
    Depth: ["Three-way handshake", "Sequence numbers", "Flow and congestion windows", "Retransmission and SACK", "Slow start", "Nagle and delayed ACK stalls", "TCP_NODELAY", "TIME_WAIT", "Ephemeral port exhaustion", "Path MTU discovery", "NAT idle timeouts"],
    Current: ["Reno to CUBIC to the BBR family", "Bufferbloat", "ECN and L4S", "Multipath TCP", "DNS over HTTPS", "HTTPS DNS records that advertise HTTP/3"],
  },
  timeline: [
    ["1974", "TCP/IP proposed", "Vint Cerf and Bob Kahn describe a protocol for connecting different packet networks: the internet's design in one paper."],
    ["1983", "Flag day", "ARPANET switches to TCP/IP on 1 January. DNS is specified the same year."],
    ["1988", "Congestion control", "After a series of congestion collapses, Van Jacobson adds slow start and congestion avoidance to TCP."],
    ["1994", "NAT", "Address translation is proposed as a stopgap for IPv4 exhaustion. It never goes away."],
    ["2006", "CUBIC", "Linux adopts CUBIC as its default, growing the window faster on high-bandwidth, long-delay paths."],
    ["2016", "BBR", "Google publishes BBR, which models bandwidth and round-trip time instead of treating loss as the signal."],
    ["2023", "L4S", "Low-latency, low-loss scalable throughput is standardised, with ECN marks replacing loss as the early signal."],
  ],
  lessons: [
    {
      slug: "layers-and-packets",
      title: "Layers, frames and packets",
      summary: "Every message you send is wrapped in headers, one per layer, and cut to fit the smallest pipe on the path. Learn what each layer adds and why 1,500 bytes rules everything.",
      level: "Basics",
      minutes: 20,
      blocks: [
        { kind: "p", text: "Networking is built in **layers**. Each layer solves one problem and relies on the one below it. The application says what it wants to say. The transport layer, TCP or UDP, gets it to the right program on the right machine. The network layer, IP, gets it to the right machine across many networks. The link layer, usually Ethernet or Wi-Fi, gets it across one physical hop." },
        { kind: "callout", tone: "analogy", title: "Envelopes inside envelopes", text: "Write a letter (your HTTP request). Put it in an envelope addressed to a department (the TCP port). Put that in an envelope addressed to a building (the IP address). Hand it to a courier who only knows how to reach the next depot (Ethernet). Each depot opens only the outer envelope, reads the next hop, and re-wraps it. Only the destination opens all of them." },
        { kind: "p", text: "Wrapping each layer's data inside the next layer's header is called **encapsulation**. On the way out, every layer adds its header in front. On the way in, every layer strips its own header and hands the rest up." },
        { kind: "figure", figure: "packet-layers", title: "Wrap a request in its headers", caption: "Choose a payload size. Each layer adds its header; the link layer cuts the stream into frames no larger than the 1,500-byte MTU. Small messages pay a large share in headers; large ones are split into many packets." },
        { kind: "h", text: "What each header carries" },
        { kind: "table", head: ["Layer", "Header", "Main fields", "Answers"], rows: [
          ["Link (Ethernet)", "14 bytes, plus a 4-byte checksum trailer", "Destination MAC, source MAC, EtherType", "Which device on this local network?"],
          ["Network (IPv4)", "20 bytes without options", "Source and destination IP, TTL, protocol, total length", "Which machine on the internet?"],
          ["Network (IPv6)", "40 bytes, fixed", "Source and destination IP, hop limit, next header", "Same, with 128-bit addresses"],
          ["Transport (TCP)", "20 bytes, often 32 with timestamps", "Ports, sequence and ACK numbers, window, flags", "Which program, and which bytes are these?"],
          ["Transport (UDP)", "8 bytes", "Ports, length, checksum", "Which program? Nothing else."],
          ["TLS record", "5 bytes plus a 16-byte authentication tag", "Content type, length", "Is this encrypted data intact and authentic?"],
        ] },
        { kind: "h", text: "MTU: the 1,500-byte ceiling" },
        { kind: "p", text: "Every link has a **maximum transmission unit**, the largest packet it carries in one frame. Standard Ethernet's MTU is 1,500 bytes, and since most paths cross Ethernet somewhere, 1,500 is the de facto internet MTU. Subtract 20 bytes of IPv4 header and 20 of TCP, and each TCP segment carries at most 1,460 bytes of your data. That number is the **maximum segment size**, MSS." },
        { kind: "example", title: "How many packets is a 100 KB tool result?", lines: [
          ["Payload", "100,000 bytes"],
          ["MSS on a plain IPv4 path", "1,500 − 20 (IP) − 20 (TCP) = 1,460 bytes"],
          ["With TCP timestamps (common)", "1,460 − 12 = 1,448 bytes per segment"],
          ["Segments", "⌈100,000 ÷ 1,448⌉ = 70 packets"],
          ["Header bytes on the wire", "70 × (14 + 20 + 32) = 4,620 bytes, about 4.6%"],
        ], result: "Large transfers pay a few percent in headers. A 40-byte heartbeat pays more than 60%." },
        { kind: "deep", title: "Path MTU discovery and black holes", blocks: [
          { kind: "p", text: "Some links have a smaller MTU than 1,500: VPN tunnels, PPPoE home connections at 1,492, or overlay networks in Kubernetes that add their own headers. A packet too big for a link must be fragmented or dropped." },
          { kind: "p", text: "Modern TCP sets the IP **Don't Fragment** bit and relies on **path MTU discovery**: a router that cannot forward a too-large packet drops it and sends back an ICMP “packet too big” message with the right size. The sender lowers its packet size and retries." },
          { kind: "p", text: "Firewalls that block all ICMP break this. Small packets, such as the TCP handshake and short requests, get through; the first full-size packet vanishes and the connection hangs. This is called a **PMTU black hole**. The tell-tale sign: `curl` connects, sends headers, then stalls when the response gets large. Fixes include clamping the MSS at the tunnel edge or enabling packetisation-layer discovery, which probes sizes without ICMP." },
        ] },
        { kind: "callout", tone: "harness", title: "In a harness", text: "Tiny writes are expensive. Streaming every token as its own TCP segment, plus TLS and HTTP framing, can send far more header bytes than text. Servers batch tokens into fewer writes, and TCP itself may coalesce them, as the lesson on Nagle's algorithm shows." },
      ],
      practice: [
        ["Kubernetes overlays", "VXLAN-based pod networks add 50 bytes of headers, so pod MTUs are often set to 1,450. A mismatch causes exactly the large-response stalls described above."],
        ["VPN debugging", "“Works off VPN, hangs on VPN for big pages” is a classic PMTU problem. `ping -M do -s 1472 host` tests whether a full 1,500-byte packet gets through."],
        ["Jumbo frames", "Data centres often run a 9,000-byte MTU inside the cluster, cutting per-packet overhead for storage and database traffic."],
      ],
      check: [
        ["What is the MSS on a standard Ethernet path with IPv4 and no TCP options?", "1,460 bytes: 1,500 MTU minus 20 bytes of IP header and 20 of TCP header."],
        ["What does encapsulation mean?", "Each layer wraps the data from the layer above with its own header. Receivers strip one header per layer."],
        ["A connection handshakes fine but stalls on the first large response. What do you suspect?", "A PMTU black hole: a smaller MTU somewhere on the path, and ICMP “packet too big” messages being blocked."],
      ],
      tryIt: "Run `ping -c 3 -M do -s 1472 example.com` on Linux (or `ping -D -s 1472` on macOS). 1,472 + 8 (ICMP) + 20 (IP) = 1,500. Then try 1,473 and read the error.",
      terms: [
        ["Encapsulation", "Wrapping one layer's data in the next layer's header."],
        ["MTU", "Maximum transmission unit: the largest packet a link carries, usually 1,500 bytes."],
        ["MSS", "Maximum segment size: the most application data one TCP segment can carry on a path."],
        ["Frame", "A link-layer unit, such as one Ethernet frame. A packet is the IP-layer unit; a segment is TCP's."],
      ],
    },
    {
      slug: "addresses-routing-nat",
      title: "Addresses, routing, ports and NAT",
      summary: "How a packet finds one machine among billions, then one program on that machine, and why the box in the middle that rewrites addresses silently kills idle connections.",
      level: "Basics",
      minutes: 18,
      blocks: [
        { kind: "p", text: "An **IP address** names a network interface. IPv4 addresses are 32 bits, written as four bytes such as `203.0.113.7`. IPv6 addresses are 128 bits, such as `2001:db8::7`. Addresses are grouped into **prefixes**: `203.0.113.0/24` means every address whose first 24 bits match, 256 addresses in all." },
        { kind: "h", text: "Routing: one hop at a time" },
        { kind: "p", text: "No router knows the full path to your destination. Each one has a **routing table** mapping prefixes to a next hop and picks the most specific match, the **longest prefix**. Your laptop's table is usually one line: everything goes to the home router. Internet backbone routers learn hundreds of thousands of prefixes from their neighbours through BGP." },
        { kind: "p", text: "Every IP packet carries a **TTL**, a hop counter that each router decrements. At zero, the packet is dropped and the router sends back an ICMP error. `traceroute` exploits this: it sends packets with TTL 1, 2, 3 and so on, and each router that drops one reveals itself." },
        { kind: "code", lang: "bash", file: "trace.sh", code: `# Each line is one router on the path, with three round-trip samples
traceroute api.anthropic.com

# The kernel's routing decision for one destination
ip route get 1.1.1.1          # Linux
route -n get 1.1.1.1          # macOS
`, note: "Rows of `* * *` usually mean a router that does not answer ICMP, not a broken path." },
        { kind: "h", text: "Ports: which program" },
        { kind: "p", text: "IP gets a packet to a machine. A 16-bit **port** gets it to a program. A connection is identified by its **4-tuple**: source IP, source port, destination IP, destination port. Servers listen on well-known ports such as 443. Clients pick a temporary **ephemeral port** for each outgoing connection, from a range that on Linux defaults to 32768 to 60999." },
        { kind: "h", text: "NAT: sharing one public address" },
        { kind: "p", text: "Your home network uses private addresses such as `192.168.1.20`, which mean nothing on the internet. The router performs **network address translation**: it rewrites the source of each outgoing packet to its own public IP and a port it chooses, and remembers the mapping in a table. Replies arriving at that public port are rewritten back and delivered inside." },
        { kind: "figure", figure: "nat-timeout", title: "A NAT table, and how an idle stream dies", caption: "Each outgoing connection creates a mapping. Mappings with no traffic expire after the NAT's idle timeout. When a quiet stream finally sends data, the NAT has forgotten it: packets are dropped or answered with a reset, and neither end was told." },
        { kind: "p", text: "The mapping table is state, and state must be cleaned up. NATs, cloud NAT gateways, firewalls and load balancers all expire entries that have been idle too long. Timeouts vary widely: UDP mappings often last only 30 seconds; cloud NAT gateways and load balancers commonly expire TCP after a few minutes; home routers vary." },
        { kind: "example", title: "Why a quiet five-minute stream dies with no error", lines: [
          ["Agent starts a long tool run", "Server streams progress, then goes quiet while the tool works"],
          ["Path includes a load balancer", "Idle timeout 60 seconds (a common default)"],
          ["At 60 s of silence", "The balancer drops the connection state. Neither client nor server is told."],
          ["At 5 min the tool finishes", "Server writes the result. The balancer has no state, so it resets or drops it."],
          ["Client side", "Either a reset (`ECONNRESET`) or, if packets are silently dropped, a hang until a timeout"],
        ], result: "Fix: send application heartbeats more often than the shortest idle timeout on the path, such as an SSE comment every 15 to 30 seconds." },
        { kind: "deep", title: "TCP keepalive versus application heartbeats", blocks: [
          { kind: "p", text: "TCP has a built-in **keepalive**: after a period of silence, the kernel sends an empty probe that the peer must acknowledge. On Linux the default idle period is two hours, far longer than any middlebox timeout, so it does nothing useful unless you lower it with `TCP_KEEPIDLE` or the `setKeepAlive(true, ms)` call in Node." },
          { kind: "p", text: "Even when tuned, TCP keepalives only prove the TCP path is alive. They pass through some proxies without resetting the proxy's own HTTP-level idle timer. An application-level heartbeat, such as an SSE comment line or a WebSocket ping, travels through every layer and keeps every timer fresh. Prefer it for long streams." },
        ] },
        { kind: "callout", tone: "trap", title: "IPv6 does not remove the problem", text: "IPv6 has enough addresses to avoid NAT, but stateful firewalls on the path keep the same kind of idle-expiring connection table. Heartbeats are needed either way." },
      ],
      practice: [
        ["Load balancer idle timeouts", "AWS Application Load Balancers default to a 60-second idle timeout. Long-polling and streaming endpoints raise it or send heartbeats."],
        ["Cloud NAT exhaustion", "A NAT gateway has a limited number of ports per destination. A service that opens a new connection per request to one API can run out and see connection failures."],
        ["Mobile networks", "Carrier-grade NAT on cellular networks often uses short timeouts, which is why mobile apps lean on push notifications rather than long-held sockets."],
      ],
      check: [
        ["What identifies a TCP connection?", "The 4-tuple: source IP, source port, destination IP and destination port."],
        ["A quiet five-minute stream died with no error. Why?", "A NAT, firewall or proxy on the path expired its idle state and dropped the connection silently."],
        ["Why are TCP keepalives often not enough?", "The default interval is hours, and they may not reset idle timers in HTTP-level proxies. Application heartbeats travel through every layer."],
      ],
      tryIt: "Open a connection with `nc example.com 80`, wait ten minutes without typing, then type `GET / HTTP/1.1`, press Enter twice and see whether anything comes back. Repeat on a different network.",
      terms: [
        ["Prefix", "A block of addresses sharing the same leading bits, such as `10.0.0.0/8`."],
        ["TTL", "A hop counter in every IP packet. Routers decrement it and drop the packet at zero."],
        ["Ephemeral port", "A temporary client-side port chosen for one outgoing connection."],
        ["NAT", "Network address translation: rewriting addresses and ports so many devices share one public IP."],
      ],
    },
    {
      slug: "dns-resolution",
      title: "DNS: from a name to an address",
      summary: "Before any connection, a name must become an address. Learn the resolution chain, why caches make DNS fast and stale at once, and what HTTPS records add in 2026.",
      level: "Basics",
      minutes: 16,
      blocks: [
        { kind: "p", text: "The **Domain Name System** is a distributed database that maps names such as `api.example.com` to records such as IP addresses. No single server holds everything. Authority is delegated down a tree: the root knows who runs `.com`, the `.com` servers know who runs `example.com`, and `example.com`'s own servers answer for its names." },
        { kind: "figure", figure: "dns-resolution", title: "One lookup, four servers, many caches", caption: "Your program asks a stub resolver, which asks a recursive resolver. On a cold cache, the recursive resolver walks the tree: root, then the top-level domain, then the authoritative server. Every answer is cached for its TTL, so most lookups never leave the first or second box." },
        { kind: "h", text: "Record types you will meet" },
        { kind: "table", head: ["Type", "Holds", "Example"], rows: [
          ["A / AAAA", "IPv4 / IPv6 address", "`api.example.com A 203.0.113.7`"],
          ["CNAME", "An alias to another name", "`www CNAME example.cdn.net`"],
          ["MX", "Mail servers", "`example.com MX 10 mail.example.com`"],
          ["TXT", "Free text, often verification", "`\"v=spf1 include:_spf.example.net ~all\"`"],
          ["NS", "Which servers are authoritative", "`example.com NS ns1.dnshost.net`"],
          ["HTTPS / SVCB", "Connection hints: ALPN protocols, ports, address hints", "`HTTPS 1 . alpn=\"h3,h2\"`"],
        ] },
        { kind: "h", text: "Caching and TTLs" },
        { kind: "p", text: "Every record carries a **time to live** in seconds. Resolvers cache the answer for that long. A TTL of 300 means a change can take up to five minutes to be seen by everyone, and longer when software ignores TTLs. Low TTLs make failover faster but send more queries; high TTLs are cheaper and slower to change." },
        { kind: "code", lang: "bash", file: "dig.sh", code: `# Ask your configured resolver; note the TTL column and the query time
dig api.example.com

# Walk the delegation from the root yourself
dig +trace api.example.com

# See whether a site advertises HTTP/3 through an HTTPS record
dig cloudflare.com HTTPS +short
`, note: "Run `dig` twice. The second answer usually shows a lower TTL and a query time near 0 ms: it came from cache." },
        { kind: "example", title: "What a cold lookup costs", lines: [
          ["Stub → recursive resolver", "1 round trip to your ISP or a public resolver, ~10 ms"],
          ["Recursive → root (often cached)", "0 to 1 round trip"],
          ["Recursive → .com servers (often cached)", "0 to 1 round trip, ~20 ms"],
          ["Recursive → authoritative", "1 round trip, 20 to 100 ms"],
        ], result: "A cold lookup can add 50 to 150 ms before the first TCP packet. A warm one costs almost nothing, which is why a harness should reuse connections and let the OS cache." },
        { kind: "deep", title: "Private and modern DNS: DoH, DoT and HTTPS records", blocks: [
          { kind: "p", text: "Classic DNS travels over unencrypted UDP port 53, so anyone on the path can see and alter which names you look up. **DNS over TLS** (port 853) and **DNS over HTTPS** wrap queries in encryption. Browsers commonly use DoH to a trusted resolver." },
          { kind: "p", text: "**HTTPS records** let a site advertise how to connect before the first packet: supported protocols such as `h3`, alternative ports, IP hints and keys for Encrypted Client Hello. A browser that sees `alpn=\"h3\"` can try HTTP/3 on the very first connection instead of learning it from an `Alt-Svc` header after a TCP connection (Module 5)." },
        ] },
        { kind: "callout", tone: "trap", title: "Node's dns.lookup and the thread pool", text: "Node's default `dns.lookup` uses the system resolver through libuv's four-thread pool (Module 3). Slow DNS can stall unrelated file reads. HTTP clients with connection pools avoid most lookups; for heavy fan-out, use a caching resolver or `dns.resolve`." },
      ],
      practice: [
        ["Failover", "Moving traffic to a standby region by changing DNS takes effect only as caches expire. Teams lower TTLs before planned migrations."],
        ["Service discovery", "Kubernetes gives every service a DNS name. Misconfigured search domains can turn one lookup into five failed queries first."],
        ["Outage pattern", "When a large DNS provider fails, sites that are perfectly healthy become unreachable, because nobody can find their address."],
      ],
      check: [
        ["What does a recursive resolver do on a cold cache?", "It walks the delegation: root servers, then the top-level domain's servers, then the domain's authoritative servers, caching each answer."],
        ["Why might a DNS change take a long time to be seen?", "Resolvers cache records for their TTL, and some clients cache longer than the TTL."],
        ["What does an HTTPS DNS record add?", "Connection hints before connecting, such as supported protocols including HTTP/3, ports and address hints."],
      ],
      tryIt: "Run `dig +trace` on a domain you use daily. Count the servers involved, then run plain `dig` twice and compare the query times.",
      terms: [
        ["Stub resolver", "The small resolver in your OS that forwards questions to a recursive resolver."],
        ["Recursive resolver", "A server that finds answers on your behalf by walking the DNS tree and caching results."],
        ["Authoritative server", "A server that holds the true records for a domain."],
        ["TTL (DNS)", "How long, in seconds, a record may be cached."],
      ],
    },
    {
      slug: "udp-tcp-and-framing",
      title: "UDP, TCP and the byte stream",
      summary: "UDP sends datagrams and promises nothing. TCP promises an ordered, reliable stream of bytes, but not messages. Learn why every protocol on top of TCP must frame its own messages.",
      level: "Basics",
      minutes: 18,
      blocks: [
        { kind: "p", text: "The two main transports make opposite choices. **UDP** sends independent datagrams: each `send` becomes one packet, it may arrive, arrive twice, arrive out of order or not at all, and nobody tells you. **TCP** gives you a connection and an ordered, reliable stream of bytes, retransmitting lost data and slowing down when the network is busy." },
        { kind: "table", head: ["", "UDP", "TCP"], rows: [
          ["Unit", "Datagram, boundaries preserved", "Byte stream, no boundaries"],
          ["Delivery", "Best effort", "Reliable and in order"],
          ["Connection setup", "None", "Three-way handshake"],
          ["Congestion control", "None built in", "Built in"],
          ["Used by", "DNS, video calls, games, QUIC", "HTTP/1.1, HTTP/2, databases, SSH"],
        ] },
        { kind: "h", text: "The sockets API" },
        { kind: "p", text: "Programs talk to the network through **sockets**, which are file descriptors (Module 2). A server calls `socket`, `bind` to a port, `listen`, then `accept` for each client. A client calls `socket` then `connect`. After that, both sides `read` and `write` bytes. Everything a harness does over HTTP rests on these few calls." },
        { kind: "h", text: "No message boundaries" },
        { kind: "p", text: "This is the most important property of TCP and the most common bug. If the sender writes `hello` and then `world`, the receiver may read `helloworld` in one call, or `hel` then `loworld`, or one byte at a time. TCP only promises that the bytes arrive in order. How they are grouped into reads depends on packet sizes, timing and buffers." },
        { kind: "figure", figure: "byte-stream-framing", title: "Three messages, random reads", caption: "The sender writes three JSON messages. The network delivers them in arbitrary chunks. Parsing each read as a message breaks; length-prefixed framing accumulates bytes until a full message is available." },
        { kind: "h", text: "Framing: three common strategies" },
        { kind: "steps", items: [
          ["Delimiters", "End each message with a byte that cannot appear inside it, such as a newline. JSON Lines and SSE (a blank line) work this way. Simple, but the delimiter must be escaped inside messages."],
          ["Length prefixes", "Send the message length first, then exactly that many bytes. gRPC uses a 5-byte prefix; many binary protocols use a 4-byte big-endian length."],
          ["Self-delimiting formats", "Some encodings reveal their own end, such as HTTP/1.1 headers ending in a blank line plus a `Content-Length`."],
        ] },
        { kind: "code", lang: "ts", file: "frame-reader.ts", code: `/** Reads 4-byte big-endian length-prefixed messages from a TCP stream. */
export function frameReader(onMessage: (msg: Buffer) => void) {
  let buffered = Buffer.alloc(0);
  return (chunk: Buffer) => {
    buffered = Buffer.concat([buffered, chunk]);
    while (buffered.length >= 4) {
      const length = buffered.readUInt32BE(0);
      if (length > 16 * 1024 * 1024) throw new Error("frame too large");  // never trust the peer
      if (buffered.length < 4 + length) break;                            // wait for more bytes
      onMessage(buffered.subarray(4, 4 + length));
      buffered = buffered.subarray(4 + length);
    }
  };
}

// socket.on("data", frameReader((msg) => handle(JSON.parse(msg.toString("utf8")))));
`, note: "The size check matters: without it, a hostile or buggy peer can claim a 4 GB message and make you buffer forever." },
        { kind: "deep", title: "Why would anyone choose UDP?", blocks: [
          { kind: "p", text: "Reliability has a price. When a TCP packet is lost, every later byte waits until the lost one is retransmitted, even bytes that have already arrived. For a live video call, a frame that arrives 300 ms late is worse than a missing frame. UDP lets the application decide what to do about loss." },
          { kind: "p", text: "UDP is also the escape hatch for new transports. Changing TCP requires kernel updates on billions of devices and middleboxes that understand the change. A protocol built on UDP can live in user space and ship with an app. That is exactly how QUIC, and therefore HTTP/3, was deployed (Module 5)." },
        ] },
        { kind: "callout", tone: "harness", title: "In a harness", text: "Every stream parser you write, whether for SSE, JSON Lines or tool-call deltas, must assume reads split anywhere: inside a message, inside a JSON string, even inside a multi-byte UTF-8 character. Buffer until a complete frame, then parse." },
      ],
      practice: [
        ["Line-delimited logs", "Log shippers read files and sockets as streams and split on newlines, keeping any partial last line for the next read."],
        ["Redis and Postgres", "Their wire protocols prefix values with lengths or type bytes so clients can read exact message boundaries from the TCP stream."],
        ["LLM streaming", "Model APIs send Server-Sent Events, framed by blank lines. Clients that parse each network chunk as one event drop or corrupt tokens under load."],
      ],
      check: [
        ["The sender writes two 10-byte messages. How many reads will the receiver need?", "Any number from 1 to 20. TCP preserves order, not boundaries."],
        ["Name three framing strategies.", "Delimiters, length prefixes and self-delimiting formats."],
        ["Why check the length prefix against a maximum?", "A peer can claim an enormous length and make the reader allocate or wait without limit."],
      ],
      tryIt: "Start `nc -l 9000` in one terminal and `nc localhost 9000` in another. Write a Node client that sends three messages in a loop with no delay, and log each `data` event on a Node server. Count events versus messages.",
      terms: [
        ["Datagram", "A self-contained UDP message delivered whole or not at all."],
        ["Socket", "A file descriptor for one end of a network connection."],
        ["Framing", "How a protocol marks where one message ends and the next begins."],
        ["Length prefix", "A fixed-size field stating how many bytes of message follow."],
      ],
    },
    {
      slug: "tcp-handshake-and-reliability",
      title: "The handshake, sequence numbers and retransmission",
      summary: "How TCP turns lossy packets into a reliable stream: numbered bytes, acknowledgements, timers and selective repair. Then the leftovers: TIME_WAIT and running out of ports.",
      level: "Depth",
      minutes: 22,
      blocks: [
        { kind: "p", text: "TCP numbers every byte. Each side picks a random **initial sequence number**, and every segment says which byte number it starts at. The receiver replies with an **acknowledgement number**: the next byte it expects. From those two numbers, both sides always know exactly what has been delivered." },
        { kind: "h", text: "The three-way handshake" },
        { kind: "p", text: "Before data flows, the two sides agree on starting sequence numbers. The client sends **SYN** with its number. The server replies **SYN-ACK** with its own number and an acknowledgement of the client's. The client sends **ACK**. That costs one full round trip before the first request byte can be sent." },
        { kind: "figure", figure: "tcp-handshake", title: "A connection from SYN to FIN", caption: "Step through a short HTTP exchange. Sequence numbers count bytes; each ACK names the next byte expected. Note the round trip spent on the handshake, the lost segment repaired by retransmission, and the TIME_WAIT left behind by whoever closes first." },
        { kind: "h", text: "Detecting loss" },
        { kind: "p", text: "TCP learns about loss in two ways. **Timeouts**: if an acknowledgement does not arrive within the retransmission timeout, computed from measured round-trip times, the sender resends. Timeouts are slow, at least 200 ms on Linux and often more. **Duplicate ACKs**: when segment 3 is lost but 4, 5 and 6 arrive, the receiver keeps acknowledging “I still need 3”. Three duplicate ACKs trigger **fast retransmit** without waiting for the timer." },
        { kind: "p", text: "**Selective acknowledgement**, SACK, lets the receiver say exactly which later ranges it already has, so the sender resends only the holes. Without SACK, a burst of losses can force the sender to resend data the receiver already holds." },
        { kind: "example", title: "Why one lost packet delays everything after it", lines: [
          ["Sent", "Segments 1–10, each 1,448 bytes"],
          ["Lost", "Segment 3"],
          ["Arrived", "1, 2, 4, 5, 6, 7, 8, 9, 10"],
          ["Delivered to the app", "Only 1 and 2. Segments 4–10 wait in the kernel's buffer."],
          ["After fast retransmit (about 1 RTT later)", "3 arrives; 3–10 are delivered at once"],
        ], result: "This is TCP head-of-line blocking. It is invisible in a single stream, and it becomes a big deal when HTTP/2 puts many streams on one connection (Module 5)." },
        { kind: "h", text: "Closing, and TIME_WAIT" },
        { kind: "p", text: "Each side closes its direction with **FIN**. The side that closes first enters **TIME_WAIT** and keeps the connection's 4-tuple reserved for twice the maximum segment lifetime, 60 seconds on Linux. This stops a delayed packet from an old connection being mistaken for part of a new one with the same ports." },
        { kind: "example", title: "Running out of ephemeral ports", lines: [
          ["Default Linux ephemeral range", "32768–60999, so 28,232 ports"],
          ["Each closed connection holds its port in TIME_WAIT for", "60 seconds"],
          ["Sustainable new connections to one destination IP and port", "28,232 ÷ 60 ≈ 470 per second"],
          ["A client making 1,000 fresh connections per second to one API", "Exhausts the range in under 30 seconds"],
        ], result: "Symptom: `EADDRNOTAVAIL` or connect timeouts under load. Fix: reuse connections with keep-alive pools rather than tuning kernel flags." },
        { kind: "deep", title: "SYN floods, SYN cookies and TCP Fast Open", blocks: [
          { kind: "p", text: "A server must remember each half-open connection between SYN and the final ACK. An attacker sending millions of SYNs from spoofed addresses can fill that queue. **SYN cookies** let the server encode the needed state into its own initial sequence number and keep nothing until the final ACK proves the client is real." },
          { kind: "p", text: "**TCP Fast Open** lets a returning client put data in its SYN, saving a round trip. It saw limited deployment because middleboxes dropped or mangled SYNs carrying data, an example of **ossification**: a protocol becoming impossible to change because devices in the path assume its current shape. QUIC's encrypted headers were designed to avoid that fate." },
        ] },
        { kind: "code", lang: "bash", file: "inspect-tcp.sh", code: `# Connection states on this machine, counted
ss -tan | awk 'NR>1 {print $1}' | sort | uniq -c

# Per-connection internals: RTT, congestion window, retransmissions
ss -ti dst api.example.com

# Watch a handshake and close on the wire
sudo tcpdump -ni any 'host example.com and tcp port 443' -c 20
`, note: "`ss -ti` shows `rtt`, `cwnd` and `retrans` per connection, which turns guesses about a slow connection into numbers." },
      ],
      practice: [
        ["Connection pools", "HTTP clients such as undici keep connections alive and reuse them, avoiding both handshake latency and TIME_WAIT buildup."],
        ["Load testers", "Naive load tests that open a new connection per request often measure their own port exhaustion instead of the server."],
        ["Packet capture", "Wireshark marks retransmissions and duplicate ACKs in colour, which is often the fastest way to prove network loss."],
      ],
      check: [
        ["What does an ACK number mean?", "The next byte the receiver expects. Everything before it has arrived."],
        ["Why does fast retransmit need three duplicate ACKs?", "Duplicate ACKs can also come from reordering. Three is a heuristic that loss, not reordering, is likely."],
        ["Why does TIME_WAIT exist, and when does it hurt?", "To stop old delayed packets confusing a new connection on the same 4-tuple. It hurts clients that open many short connections to one destination."],
      ],
      tryIt: "Capture `curl -s https://example.com > /dev/null` with `tcpdump` and open it in Wireshark. Find the SYN, SYN-ACK, ACK, the TLS handshake and the FINs. Note the relative sequence numbers.",
      terms: [
        ["SYN / ACK / FIN", "TCP flags: synchronise sequence numbers, acknowledge data, and finish a direction."],
        ["Retransmission timeout", "How long the sender waits for an ACK before resending, derived from measured RTT."],
        ["SACK", "Selective acknowledgement: reporting which later byte ranges have already arrived."],
        ["TIME_WAIT", "The state that keeps a closed connection's 4-tuple reserved for a while."],
      ],
    },
    {
      slug: "windows-and-throughput",
      title: "Windows, bandwidth-delay and small-write stalls",
      summary: "Throughput is window divided by round-trip time. Learn the bandwidth-delay product, why a fat pipe can feel slow, and the classic Nagle plus delayed-ACK stall.",
      level: "Depth",
      minutes: 20,
      blocks: [
        { kind: "p", text: "TCP never sends without limit. At any moment, the sender may have at most a **window** of unacknowledged bytes in flight. Then it must wait for acknowledgements. Two windows apply, and the smaller wins: the receiver's **flow control window**, which protects the receiver's buffer, and the sender's **congestion window**, which protects the network." },
        { kind: "h", text: "The bandwidth-delay product" },
        { kind: "p", text: "If the window is W bytes and a round trip takes RTT seconds, the sender can deliver at most W per RTT. To keep a link of bandwidth B full, the window must be at least **B × RTT**. That product is the **bandwidth-delay product**: the number of bytes that fit “in the pipe” at once." },
        { kind: "figure", figure: "bdp-calculator", title: "Why a fat pipe can feel slow", caption: "Set the link speed, round-trip time and window. Throughput is the smaller of the link speed and window ÷ RTT. On long paths a small window wastes most of the link, whatever you paid for." },
        { kind: "example", title: "1 Gbps across an ocean with a 64 KB window", lines: [
          ["Bandwidth", "1 Gbps = 125,000,000 bytes/s"],
          ["Round trip", "100 ms"],
          ["Bandwidth-delay product", "125,000,000 × 0.1 = 12.5 MB must be in flight"],
          ["Actual window", "64 KB = 65,535 bytes"],
          ["Throughput", "65,535 ÷ 0.1 s = 655 KB/s ≈ 5.2 Mbps"],
        ], result: "About 0.5% of the link. Window scaling, auto-tuned buffers and parallel connections exist to fix exactly this." },
        { kind: "p", text: "The original TCP header has a 16-bit window field, limiting windows to 64 KB. The **window scale** option, negotiated in the handshake, multiplies it by up to 2^14. Modern kernels auto-tune receive buffers into the megabytes. A missing or stripped window scale option, or a small fixed `SO_RCVBUF`, brings the 64 KB ceiling back." },
        { kind: "h", text: "Nagle's algorithm and delayed ACKs" },
        { kind: "p", text: "Two old optimisations each make sense alone and stall together. **Nagle's algorithm** on the sender: if there is unacknowledged small data in flight, hold new small writes until the ACK arrives, then send them together. **Delayed ACK** on the receiver: wait up to tens of milliseconds before acknowledging, hoping to piggyback the ACK on a reply." },
        { kind: "steps", items: [
          ["Client writes a small header", "Sent immediately; nothing is in flight yet."],
          ["Client writes the small body", "Nagle holds it: the header is still unacknowledged."],
          ["Server receives the header", "No full request yet, so no reply to piggyback on. It delays its ACK, often 40 ms on Linux and up to 200 ms elsewhere."],
          ["Delayed-ACK timer fires", "Server ACKs; Nagle releases the body; the request finally completes."],
        ] },
        { kind: "p", text: "The fix is to stop doing small separate writes: build the whole request and write it once. Or set **TCP_NODELAY** to disable Nagle on latency-sensitive connections. Node, Go and most HTTP libraries set it by default; custom protocols often forget." },
        { kind: "code", lang: "ts", file: "nodelay.ts", code: `import net from "node:net";

const socket = net.connect({ host, port, noDelay: true });  // disable Nagle

// Better still: one write per message, not one per field
socket.write(Buffer.concat([header, body]));
`, note: "`noDelay` sends small writes immediately. Combining writes still helps: fewer packets, fewer system calls." },
        { kind: "deep", title: "Receive buffers, zero windows and slow readers", blocks: [
          { kind: "p", text: "The receiver advertises how much free buffer it has. If the application stops reading, the buffer fills and the advertised window drops to zero. The sender stops and periodically probes. This is TCP's backpressure, and it reaches all the way into your program: a Node `socket.write` eventually returns false, and the stream asks you to wait for `drain` (Module 3)." },
          { kind: "p", text: "That chain is why a slow client can hold a server's memory. Each stalled connection keeps its unsent bytes in user space if the server ignores backpressure. Servers bound per-connection buffers and drop clients that stay at zero window for too long." },
        ] },
      ],
      practice: [
        ["Cross-region transfers", "Copying data between continents with one TCP stream is often window-limited. Tools such as `rclone` and cloud SDKs open several parallel streams."],
        ["Database drivers", "Drivers that write a query's parts separately can hit Nagle and delayed-ACK stalls, showing up as a suspicious 40 ms floor on every query."],
        ["Interactive protocols", "SSH and terminal sessions set TCP_NODELAY so each keystroke is sent immediately."],
      ],
      check: [
        ["Why is a large download slow on a long link?", "Throughput is capped at window ÷ RTT. If the window is smaller than the bandwidth-delay product, the link sits idle."],
        ["What is the bandwidth-delay product of 100 Mbps at 50 ms RTT?", "12,500,000 bytes/s × 0.05 s = 625 KB."],
        ["Describe the Nagle and delayed-ACK stall.", "The sender holds a small write until the previous one is acknowledged, while the receiver delays the ACK hoping to piggyback it. Both wait until the delayed-ACK timer fires."],
      ],
      tryIt: "On Linux, add 100 ms of delay with `sudo tc qdisc add dev lo root netem delay 50ms` and run `iperf3` over loopback with `-w 64K` and then without `-w`. Remove the delay with `tc qdisc del dev lo root`.",
      terms: [
        ["Flow control window", "How much the receiver can buffer; it protects the receiver."],
        ["Congestion window", "How much the sender allows in flight; it protects the network."],
        ["Bandwidth-delay product", "Bandwidth × RTT: the bytes needed in flight to keep a link full."],
        ["TCP_NODELAY", "A socket option that disables Nagle's algorithm."],
      ],
    },
    {
      slug: "congestion-control",
      title: "Congestion control: from Reno to BBR",
      summary: "Nobody tells a TCP sender how fast the network is. Learn how slow start and AIMD probe for capacity, why CUBIC and BBR changed the curve, and what bufferbloat and L4S are about.",
      level: "Current",
      minutes: 22,
      blocks: [
        { kind: "p", text: "A sender cannot see the path. It might cross a 10 Gbps data-centre link and then a crowded café Wi-Fi. If every sender transmitted at its own link speed, routers would overflow, drop most packets, and everyone would retransmit into a collapse. **Congestion control** is each sender's algorithm for finding a fair share by watching what happens to its packets." },
        { kind: "h", text: "Slow start" },
        { kind: "p", text: "A new connection starts with a small congestion window, typically 10 segments, about 14 KB. Every ACK grows the window by one segment, so the window **doubles every round trip**. It sounds slow but is exponential: from 14 KB it reaches 1 MB in about six round trips. It ends at the first loss or when it reaches a threshold." },
        { kind: "example", title: "The cold-start tax on a 1 MB response", lines: [
          ["Initial window", "10 segments × 1,448 bytes ≈ 14.5 KB"],
          ["Round trip 1, 2, 3, 4, 5, 6", "14.5 → 29 → 58 → 116 → 232 → 463 KB per round trip"],
          ["Cumulative after 6 round trips", "≈ 912 KB"],
          ["Total at 100 ms RTT", "About 7 round trips of data, ~700 ms, plus handshakes"],
        ], result: "The same transfer on a warm connection with a large window takes about one round trip. Connection reuse beats almost any code optimisation." },
        { kind: "h", text: "AIMD: Reno's sawtooth" },
        { kind: "p", text: "After slow start, classic **Reno** enters congestion avoidance: add one segment per round trip (additive increase), and halve the window on loss (multiplicative decrease). The window traces a sawtooth. Competing Reno flows converge to a fair share. But on a long, fast path, adding one segment per round trip takes minutes to recover from a single halving." },
        { kind: "figure", figure: "congestion-window", title: "Three ways to probe a network", caption: "The congestion window over 60 round trips on a path whose capacity is the dashed line. Reno grows linearly and halves on loss. CUBIC regrows along a cubic curve that flattens near the last peak. BBR estimates bandwidth and minimum RTT and paces near the capacity line, with periodic probes. Raise random loss to see which one suffers." },
        { kind: "h", text: "CUBIC and BBR" },
        { kind: "p", text: "**CUBIC**, Linux's default since 2006, makes the window a cubic function of time since the last loss: it climbs quickly, slows as it approaches the previous peak, then probes carefully beyond it. It still treats loss as the congestion signal." },
        { kind: "p", text: "**BBR** takes a different view. It continually estimates the **bottleneck bandwidth** and the **minimum round-trip time**, and sends at roughly their product, pacing packets evenly. Random loss that does not reflect congestion, common on Wi-Fi and cellular links, barely affects it. Its later versions added fairness fixes after the first version was found to crowd out loss-based flows." },
        { kind: "h", text: "Bufferbloat, ECN and L4S" },
        { kind: "p", text: "Loss-based algorithms keep increasing the window until a buffer overflows. If routers have large buffers, they fill completely before any loss, and every packet waits in a long queue. Latency on a busy home link can jump from 20 ms to over a second: **bufferbloat**. A video call stutters because a download filled the queue." },
        { kind: "p", text: "**ECN** lets routers mark packets instead of dropping them, signalling congestion early. **L4S**, standardised in 2023, pairs very shallow queues with fine-grained ECN marks and scalable congestion controllers, aiming for consistently low queueing delay. Deployment is growing in cable and mobile networks." },
        { kind: "deep", title: "Multipath TCP and HTTPS over many links", blocks: [
          { kind: "p", text: "**Multipath TCP** lets one connection use several paths at once, such as Wi-Fi and cellular, with a separate congestion window per subflow. Apple has used it for Siri and Maps for years, and Linux has supported it upstream since 5.6. It keeps connections alive when one interface disappears." },
          { kind: "p", text: "QUIC reaches a similar goal differently: connection IDs let it migrate from one network to another without a new handshake (Module 5). Both reflect the same reality: phones change networks mid-request, and a protocol bound to one IP address and port loses work every time." },
        ] },
        { kind: "code", lang: "bash", file: "congestion.sh", code: `# Which algorithm does this Linux machine use, and which are available?
sysctl net.ipv4.tcp_congestion_control net.ipv4.tcp_available_congestion_control

# Simulate a bad path on an interface: 100 ms delay and 2% loss
sudo tc qdisc add dev eth0 root netem delay 100ms loss 2%

# Compare algorithms with iperf3 (server: iperf3 -s)
iperf3 -c server -C cubic -t 20
iperf3 -c server -C bbr   -t 20
`, note: "Run the comparison with and without loss. The gap between CUBIC and BBR grows with random loss." },
      ],
      practice: [
        ["CDNs", "Several large CDNs and video services run BBR on their edge servers to keep throughput high on lossy last-mile links."],
        ["Router firmware", "Queue management such as fq_codel and CAKE in modern routers fights bufferbloat by keeping queues short."],
        ["Agent traffic", "Token streams are small but latency-sensitive. When they share a congested link with large uploads, bufferbloat shows up as bursty, delayed tokens."],
      ],
      check: [
        ["How does slow start grow the window?", "By one segment per ACK, which doubles the window every round trip."],
        ["What signal do Reno and CUBIC use, and what does BBR use instead?", "Reno and CUBIC treat loss as congestion. BBR models bottleneck bandwidth and minimum RTT."],
        ["What is bufferbloat?", "Oversized buffers that fill before any loss, adding large queueing delay for every packet."],
      ],
      tryIt: "Run `ping` to a nearby host while a large download saturates your connection. Watch the round-trip time rise. Then test your network at a bufferbloat test site and compare the loaded and unloaded latency.",
      terms: [
        ["Slow start", "Doubling the congestion window every round trip until loss or a threshold."],
        ["AIMD", "Additive increase, multiplicative decrease: Reno's probing pattern."],
        ["Pacing", "Spreading packets evenly over time instead of sending bursts."],
        ["ECN", "Explicit congestion notification: routers mark packets instead of dropping them."],
      ],
    },
  ],
  lab: [
    "Capture a `curl` with `tcpdump` and read it in Wireshark: handshake, TLS, data, close.",
    "Use `tc netem` to add 100 ms delay and 2% loss, then compare CUBIC and BBR with `iperf3`.",
    "Reproduce a Nagle and delayed-ACK stall with two small writes, measure it, then fix it with one write and with `TCP_NODELAY`.",
    "Write a length-prefixed frame reader and fuzz it with random chunk sizes.",
  ],
  interview: [
    ["What happens when you type a URL?", "DNS lookup, TCP handshake (1 RTT), TLS handshake (1 RTT for TLS 1.3), request and response (1 RTT), with slow start limiting the first response. Count the round trips."],
    ["A quiet five-minute stream died with no error. Why?", "A NAT or proxy idle timeout dropped its state. Send heartbeats more often than the shortest idle timeout."],
    ["Why is a large download slow on a long link?", "Throughput ≤ window ÷ RTT. If the window is below the bandwidth-delay product, the link is underused."],
  ],
  reading: [
    "High Performance Browser Networking, Ilya Grigorik (free online)",
    "Beej's Guide to Network Programming",
    "RFC 9293: Transmission Control Protocol",
    "BBR: Congestion-Based Congestion Control, Cardwell et al.",
  ],
};
