import type { CourseModule } from "./types";

export const compression: CourseModule = {
  number: 8,
  slug: "compression",
  title: "Compression",
  shortTitle: "Compression",
  tagline: "Compression is prediction: guess what comes next, then spend bits only on the surprise.",
  intuition: "Nearly every mainstream codec combines two ideas: repeat removal, which replaces text seen before with a short back-reference, and entropy coding, which gives common symbols short codes and rare ones long codes. Choosing a codec is then arithmetic: minimise compress time plus transfer time plus decompress time, across everyone who reads the data.",
  harness: "Tool results, traces, logs and stored transcripts are all compressible, and model context is the most expensive storage of all. Context compaction is lossy compression measured by task success; prompt caching is something else entirely. Knowing the difference saves both money and confusion.",
  levels: {
    Basics: ["Lossless and lossy", "Shannon entropy", "Huffman coding", "Run-length encoding"],
    Depth: ["LZ77 parsing", "Hash chains", "Window sizing", "Arithmetic coding", "tANS and FSE", "Streaming flush modes", "Why encrypted data does not compress"],
    Current: ["Shared dictionaries over HTTP", "zstd at the edge", "Columnar and float compression", "KV-cache compression in inference"],
  },
  timeline: [
    ["1948", "Shannon's entropy", "Claude Shannon defines information mathematically and sets the lower bound no lossless coder can beat."],
    ["1952", "Huffman coding", "David Huffman, then a student, finds the optimal prefix code for known symbol frequencies."],
    ["1977", "LZ77", "Lempel and Ziv replace repeats with back-references into a sliding window."],
    ["1993", "DEFLATE", "Phil Katz combines LZ77 and Huffman coding. gzip and zip use it to this day."],
    ["2013–15", "Brotli and Zstandard", "Google's Brotli adds context modelling and a web dictionary; Facebook's zstd adds a huge speed range and ANS-based entropy coding."],
    ["2025", "Dictionary transport", "RFC 9842 standardises compressing HTTP responses against a previous response as the dictionary."],
    ["2026", "Compressing context", "Agent harnesses compact transcripts and inference servers compress KV caches, both trading fidelity for space."],
  ],
  lessons: [
    {
      slug: "entropy-and-prediction",
      title: "Entropy: why some data compresses and some never will",
      summary: "Information is surprise. Learn Shannon's measure, why it sets a hard floor on compressed size, and why random and encrypted data cannot be shrunk at all.",
      level: "Basics",
      minutes: 17,
      blocks: [
        { kind: "p", text: "**Lossless** compression reproduces the input exactly: text, code, JSON, executables. **Lossy** compression keeps what matters and discards the rest: JPEG, MP3, video, and, as we will see, summarising an agent's context. This module is mostly about lossless compression, where the rules are precise." },
        { kind: "h", text: "Information is surprise" },
        { kind: "p", text: "If you can predict the next symbol perfectly, it carries no information: you did not need to be told. If it is a coin flip, it carries one bit. Shannon defined the information of a symbol with probability p as −log₂ p bits, and the **entropy** of a source as the average over all symbols. Entropy is the minimum average number of bits per symbol any lossless code can achieve for that source model." },
        { kind: "figure", figure: "entropy-meter", title: "Measure the surprise in a string", caption: "Type or pick text. The bars show each character's frequency and its ideal code length, −log₂ p. The total is the floor for any coder that treats characters independently. Repetitive text sits far below 8 bits per character; random text approaches its alphabet's limit." },
        { kind: "example", title: "Three symbols, uneven odds", lines: [
          ["Probabilities", "A = 0.5, B = 0.25, C = 0.25"],
          ["Ideal code lengths", "A: −log₂ 0.5 = 1 bit; B and C: −log₂ 0.25 = 2 bits"],
          ["A matching code", "A = `0`, B = `10`, C = `11`"],
          ["Average", "0.5 × 1 + 0.25 × 2 + 0.25 × 2 = 1.5 bits per symbol"],
          ["Fixed-width alternative", "2 bits per symbol (3 symbols need 2 bits)"],
        ], result: "25% smaller, and 1.5 bits is exactly the entropy: no lossless code can do better for this source." },
        { kind: "h", text: "The model is everything" },
        { kind: "p", text: "Entropy depends on the **model** of the data. Counting single letters, English text measures about 4 bits per character. A model that knows `q` is almost always followed by `u`, or that predicts whole words, sees far less surprise; strong text compressors reach around 2 bits per character, and language models lower still. Every better compressor is, at heart, a better predictor." },
        { kind: "h", text: "What cannot be compressed" },
        { kind: "p", text: "There are 2^n possible n-bit inputs, but fewer than 2^n shorter outputs. So no lossless compressor can shrink every input; any that shrinks some must grow others. Data that is already random, or already compressed, or **encrypted**, looks uniformly random and has no pattern to exploit. Compressing it adds a few bytes of header." },
        { kind: "callout", tone: "trap", title: "Compress, then encrypt; never the reverse", text: "Encrypted output is designed to be indistinguishable from random, so compressing it achieves nothing. Compression must happen first. But compressing secrets next to attacker-controlled data before encrypting can leak them, as the last lesson shows." },
        { kind: "deep", title: "Run-length encoding, the simplest model", blocks: [
          { kind: "p", text: "**Run-length encoding** replaces a run of identical symbols with the symbol and a count: `AAAAAABBB` becomes `6A3B`. Its model is “the next symbol is probably the same as the last one”. It is excellent for that kind of data, such as simple images, sparse bitmaps and sorted columns, and worse than useless on text, where it doubles the size of `ABCD`." },
          { kind: "p", text: "It survives inside sophisticated systems exactly where its model is right: Parquet's run-length encoding of sorted or low-cardinality columns, fax machines, and the zero runs in many binary formats." },
        ] },
      ],
      practice: [
        ["Pre-compressed assets", "Servers skip gzip for JPEG, PNG, MP4 and zip files: they are already compressed, and recompressing wastes CPU."],
        ["Encrypted backups", "Backup tools compress before encrypting. Tools that encrypt first cannot deduplicate or compress at all."],
        ["Sorted columns", "Databases sort or cluster data so that columns have long runs and low entropy, then compress far better."],
      ],
      check: [
        ["What is the entropy of a fair coin, and of a coin that lands heads 90% of the time?", "1 bit; about 0.47 bits (0.9 × 0.152 + 0.1 × 3.32)."],
        ["Why can no compressor shrink every input?", "There are fewer shorter strings than inputs, so some inputs must map to equal or longer outputs."],
        ["Why does encrypted data not compress?", "Good encryption output is statistically indistinguishable from random data, which has no redundancy."],
      ],
      tryIt: "Run `head -c 1000000 /dev/urandom | gzip | wc -c` and compare it to gzipping a 1 MB log file. Then gzip the gzip output and see it grow.",
      terms: [
        ["Lossless / lossy", "Exact reconstruction versus keeping only what matters."],
        ["Entropy", "The average information per symbol, the floor for lossless coding under a model."],
        ["Model", "A compressor's prediction of what comes next."],
        ["Run-length encoding", "Replacing a run of repeated symbols with one symbol and a count."],
      ],
    },
    {
      slug: "huffman-and-ans",
      title: "Entropy coding: Huffman, arithmetic coding and ANS",
      summary: "Turn probabilities into bits. Build a Huffman code by hand, see where its one-bit minimum wastes space, and learn how arithmetic coding and ANS spend fractions of a bit.",
      level: "Depth",
      minutes: 20,
      blocks: [
        { kind: "p", text: "An **entropy coder** takes symbols and their probabilities and emits bits, giving likely symbols short codes. The codes must be **prefix-free**: no code is the start of another, so the decoder always knows where one ends without separators." },
        { kind: "h", text: "Building a Huffman code" },
        { kind: "steps", items: [
          ["Count", "Count how often each symbol appears."],
          ["Merge the two rarest", "Take the two least frequent nodes and join them under a new parent whose count is their sum."],
          ["Repeat", "Keep merging the two smallest until one tree remains."],
          ["Read codes", "Walk from the root to each leaf, writing 0 for left and 1 for right. That path is the symbol's code."],
        ] },
        { kind: "figure", figure: "huffman-tree", title: "Build a Huffman code from your text", caption: "The table lists each symbol's count, its Huffman code and its ideal length, −log₂ p. Common symbols get short codes. Compare the encoded size with 8 bits per character and with the entropy floor." },
        { kind: "h", text: "Huffman's one-bit floor" },
        { kind: "p", text: "Huffman is optimal among codes that give each symbol a **whole number** of bits. That restriction hurts when one symbol dominates. A symbol with probability 0.9 deserves about 0.15 bits, but Huffman must spend at least 1. In a skewed stream, that is roughly six times the ideal for the most common symbol." },
        { kind: "example", title: "The cost of whole bits", lines: [
          ["Source", "A with p = 0.9, B with p = 0.1"],
          ["Entropy", "0.9 × 0.152 + 0.1 × 3.32 ≈ 0.47 bits per symbol"],
          ["Best Huffman code", "A = `0`, B = `1`: exactly 1 bit per symbol"],
          ["Waste", "1 ÷ 0.47 ≈ 2.1× the floor"],
        ], result: "Arithmetic coding and ANS close this gap by spending fractional bits per symbol." },
        { kind: "h", text: "Arithmetic coding and ANS" },
        { kind: "p", text: "**Arithmetic coding** represents an entire message as one number in [0, 1). Each symbol narrows the current interval in proportion to its probability; a likely symbol barely narrows it and so costs a fraction of a bit. It reaches the entropy almost exactly but was historically slow and patent-encumbered." },
        { kind: "p", text: "**Asymmetric numeral systems**, ANS, published by Jarek Duda around 2009, achieves arithmetic coding's compression at Huffman-like speed by keeping its state in a single integer and using table lookups. Zstandard's FSE is a table-based ANS variant. It is a large part of why zstd is both fast and strong." },
        { kind: "deep", title: "Static, adaptive and context modelling", blocks: [
          { kind: "p", text: "A **static** coder computes probabilities once and sends the table with the data, which is what DEFLATE does per block. An **adaptive** coder updates probabilities as it goes, so the decoder can mirror the updates and no table is sent." },
          { kind: "p", text: "**Context modelling** keeps separate probabilities depending on what came before, such as the previous byte. Brotli uses context modelling to choose among several literal codes; strong archivers mix many contexts. Each refinement is a better prediction, which is the whole game." },
        ] },
        { kind: "code", lang: "ts", file: "huffman.ts", code: `type Node = { weight: number; symbol?: string; left?: Node; right?: Node };

export function huffmanCodes(text: string): Map<string, string> {
  const counts = new Map<string, number>();
  for (const ch of text) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let nodes: Node[] = [...counts].map(([symbol, weight]) => ({ symbol, weight }));
  if (nodes.length === 1) return new Map([[nodes[0].symbol!, "0"]]);

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.weight - b.weight);                 // a heap in real code
    const [left, right, ...rest] = nodes;
    nodes = [...rest, { weight: left.weight + right.weight, left, right }];
  }

  const codes = new Map<string, string>();
  (function walk(node: Node, path: string) {
    if (node.symbol !== undefined) return void codes.set(node.symbol, path);
    walk(node.left!, path + "0");
    walk(node.right!, path + "1");
  })(nodes[0], "");
  return codes;
}
`, note: "Real encoders use a priority queue, limit maximum code length, and send canonical codes so the table itself is small." },
      ],
      practice: [
        ["DEFLATE", "gzip, zip and PNG use Huffman codes over LZ77 output, with a new code table every block."],
        ["Zstandard", "zstd uses Huffman for literals and FSE, a table-based ANS, for match lengths and offsets."],
        ["Images and video", "JPEG uses Huffman coding; modern video codecs use arithmetic coding (CABAC) for the extra efficiency."],
      ],
      check: [
        ["Why must codes be prefix-free?", "So the decoder can tell where each code ends without separators."],
        ["Why did ANS beat Huffman?", "Huffman spends whole bits per symbol; ANS spends fractions, approaching entropy, at comparable speed."],
        ["A symbol has probability 0.9. How many bits does it deserve?", "About 0.15 bits, from −log₂ 0.9."],
      ],
      tryIt: "Run the Huffman function on a page of your own code. Compute the encoded size in bits and compare it with `gzip -9` on the same text. gzip wins: why? (Hint: next lesson.)",
      terms: [
        ["Prefix-free code", "No code word is a prefix of another."],
        ["Huffman code", "The optimal whole-bit prefix code for known frequencies."],
        ["Arithmetic coding", "Encoding a whole message as an interval, achieving fractional bits per symbol."],
        ["ANS / FSE", "Asymmetric numeral systems and its table-based form used in zstd."],
      ],
    },
    {
      slug: "lz77-and-repeats",
      title: "LZ77: replacing repeats with back-references",
      summary: "Most real data repeats itself. LZ77 replaces a repeat with “copy n bytes from d back”. Learn the parse, the window, and how DEFLATE and zstd combine it with entropy coding.",
      level: "Depth",
      minutes: 20,
      blocks: [
        { kind: "p", text: "Entropy coding treats symbols one at a time. But text, code and JSON repeat whole strings: keys, function names, HTML tags, log prefixes. **LZ77** scans the input and, at each position, looks back into a **window** of recent data for the longest earlier match. If it finds one, it emits a **(distance, length)** pair; otherwise it emits the next byte as a **literal**." },
        { kind: "example", title: "abcabcabc", lines: [
          ["Positions 0–2", "No earlier match: literals `a`, `b`, `c`"],
          ["Position 3", "`abcabc` matches starting 3 back"],
          ["Emit", "(distance 3, length 6)"],
          ["Output", "`a b c` + copy 6 from 3 back"],
        ], result: "The copy overlaps itself: copying byte by byte from 3 back regenerates the pattern as it goes. That is how LZ77 expresses runs too." },
        { kind: "figure", figure: "lz77-demo", title: "Parse text into literals and matches", caption: "Pick or type text and adjust the window. Literals are grey; matches are gold, labelled with distance and length. The token count and estimated size update, showing how repetition, and a window large enough to reach it, drive the ratio." },
        { kind: "h", text: "Finding matches quickly" },
        { kind: "p", text: "Checking every earlier position for every new one would be quadratic. Encoders hash the next three or four bytes and keep **hash chains**: for each hash, a list of earlier positions with the same prefix. At each position they follow the chain for a few candidates and keep the longest match. Compression levels mostly decide how long to search: level 1 checks a handful, level 9 or 19 searches deep." },
        { kind: "h", text: "Window size" },
        { kind: "p", text: "The window limits how far back a match can reach. DEFLATE's window is 32 KB, so a repeat 40 KB earlier is invisible. zstd and Brotli support much larger windows, megabytes up to gigabytes in long modes, which finds repeats across a large file. The cost is memory: the decoder must keep the whole window too." },
        { kind: "h", text: "Putting it together: DEFLATE and zstd" },
        { kind: "table", head: ["Stage", "DEFLATE (gzip)", "Zstandard"], rows: [
          ["Repeat removal", "LZ77, 32 KB window", "LZ77, large configurable window"],
          ["Literals coded with", "Huffman", "Huffman"],
          ["Lengths and distances coded with", "Huffman", "FSE (ANS)"],
          ["Levels", "1–9", "Negative fast levels through 19, plus ultra 20–22"],
        ] },
        { kind: "deep", title: "Streaming and flush modes", blocks: [
          { kind: "p", text: "A compressor holds data back to find better matches and to fill a block. That is fine for files and fatal for streams: an SSE event sitting inside a gzip buffer never reaches the client. Codecs offer **flush** operations that end the current block and emit everything so far, at a small cost in ratio." },
          { kind: "p", text: "In Node, `zlib` streams take `flush: zlib.constants.Z_SYNC_FLUSH`, and you can call `.flush()` after each event. Many compression middlewares do neither, which is why they buffer token streams (Module 6)." },
        ] },
        { kind: "callout", tone: "harness", title: "In a harness", text: "Agent transcripts are extremely repetitive: the same tool names, JSON keys and file paths recur constantly. Stored traces compress very well with zstd. But the model's context window does not benefit: the model reads tokens, not compressed bytes." },
      ],
      practice: [
        ["Log storage", "Log systems compress blocks of lines with zstd or LZ4. Repeated prefixes such as timestamps and service names make ratios of 5–10× common."],
        ["Git", "Git stores objects zlib-compressed and also delta-compresses similar files against each other in packfiles: the same back-reference idea across files."],
        ["Kafka", "Kafka compresses batches of messages together, so repeats across messages are found, which single-message compression would miss."],
      ],
      check: [
        ["What does an LZ77 match encode?", "A distance back into the window and a length to copy."],
        ["How can a match be longer than its distance?", "The copy overlaps itself; copying byte by byte reuses bytes just written, which encodes runs and periodic patterns."],
        ["Why does gzip miss a repeat 100 KB back?", "DEFLATE's window is 32 KB, so the earlier copy is out of reach."],
      ],
      tryIt: "Concatenate a 50 KB file with itself and gzip both the single and double versions. Then do the same with `zstd --long`. Explain the difference.",
      terms: [
        ["Literal", "A byte emitted as-is because no useful match was found."],
        ["Back-reference", "A (distance, length) pair pointing to earlier data."],
        ["Window", "How far back the encoder may look for matches."],
        ["Hash chain", "Lists of earlier positions with the same short prefix, for fast match search."],
      ],
    },
    {
      slug: "choosing-a-codec",
      title: "Choosing a codec: gzip, Brotli, zstd, LZ4 or XZ",
      summary: "Every codec trades ratio against speed. Learn the decision rule, compress time plus transfer time plus decompress time across all readers, and apply it to APIs, assets and storage.",
      level: "Depth",
      minutes: 18,
      blocks: [
        { kind: "table", head: ["Codec", "How it works", "Strength", "Use it for"], rows: [
          ["gzip (DEFLATE)", "LZ77 with a 32 KB window, Huffman", "Works everywhere", "Compatibility"],
          ["Brotli", "LZ77, Huffman, context modelling, built-in web dictionary", "Best on small web text", "Static assets"],
          ["Zstandard", "LZ77, Huffman for literals, FSE for sequences", "Wide speed range, trainable dictionaries", "APIs, logs, storage, Kafka"],
          ["LZ4", "LZ only, no entropy stage", "Extremely fast", "In-memory data, realtime paths"],
          ["XZ (LZMA)", "LZ with a range coder", "High ratio, slow", "Archives, packages"],
          ["Columnar encodings", "Dictionary, run-length, delta, bit-packing, then a general codec", "Exploits column structure", "Parquet, time series"],
        ] },
        { kind: "h", text: "The decision rule" },
        { kind: "p", text: "Compression is worth it when the time it saves on the network exceeds the time it costs on the CPU. Add them up for everyone involved: **compress time** (once, or per request), **transfer time** for each reader, and **decompress time** for each reader. Compress once and serve millions, and a slow, strong level pays off. Compress per request, and a fast level usually wins." },
        { kind: "figure", figure: "codec-decision", title: "When does compression pay?", caption: "Set the payload size, the reader's bandwidth and how many times the result is read. Bars show total time for each codec, split into compress, transfer and decompress. The speeds and ratios are illustrative orders of magnitude; measure your own data with `zstd -b`." },
        { kind: "example", title: "A 2 MB JSON API response, compressed per request", lines: [
          ["Client bandwidth", "20 Mbps = 2.5 MB/s"],
          ["Uncompressed transfer", "2 MB ÷ 2.5 MB/s = 800 ms"],
          ["Fast codec at ~4× ratio, ~400 MB/s compress", "5 ms compress + 200 ms transfer"],
          ["Strong codec at ~6× ratio, ~5 MB/s compress", "400 ms compress + 133 ms transfer"],
        ], result: "The fast level wins by about 330 ms per request. For a static file compressed once at build time, the strong level wins instead." },
        { kind: "h", text: "What clients accept" },
        { kind: "p", text: "HTTP content encoding is negotiated: the client sends `Accept-Encoding: gzip, br, zstd`, and the server picks one and says so in `Content-Encoding`. Browsers support gzip and Brotli widely and zstd increasingly. Internal services can use whatever both sides agree on." },
        { kind: "code", lang: "bash", file: "benchmark.sh", code: `# Benchmark zstd levels 1 to 19 on your own data: ratio and speed per level
zstd -b1 -e19 sample.json

# Compare with gzip and brotli at a few levels
for l in 1 6 9; do gzip -c -$l sample.json | wc -c; done
for q in 4 9 11; do brotli -c -q $q sample.json | wc -c; done
`, note: "Plot ratio against compression speed. The curve has a knee; levels past it cost much more CPU for little extra ratio." },
        { kind: "deep", title: "Why LZ4 in one layer and zstd in another", blocks: [
          { kind: "p", text: "Hot paths want speed. An in-memory cache or a replication stream inside a data centre has bandwidth to spare and latency to protect, so LZ4's gigabytes per second matter more than its modest ratio." },
          { kind: "p", text: "Cold storage wants ratio. Data written once and read rarely, such as archived traces, pays storage costs forever, so a strong zstd level or XZ is worth slow compression. Many systems use both: LZ4 for fresh data, recompressed with zstd as it ages." },
        ] },
      ],
      practice: [
        ["Static sites", "Build pipelines precompress assets with Brotli at the maximum quality, because they compress once and serve millions of times."],
        ["APIs", "Dynamic API responses typically use gzip or Brotli at low levels, or zstd at levels 1–3, to keep per-request CPU small."],
        ["Databases", "RocksDB-based stores often use LZ4 for upper levels and zstd for the bottom level, where most data lives."],
      ],
      check: [
        ["gzip, Brotli or zstd for a dynamic API?", "Argue from CPU per request and client support: a fast level of zstd or Brotli where clients accept it, gzip for compatibility."],
        ["Why LZ4 in one layer and zstd in another?", "Hot paths want speed; cold storage wants ratio."],
        ["When does a slow, strong level pay off?", "When data is compressed once and read many times, so compression cost is amortised."],
      ],
      tryIt: "Run `zstd -b1 -e19` on a real tool result and a real log file. Find the knee in each curve and pick a level for an API and for archival storage.",
      terms: [
        ["Compression ratio", "Original size divided by compressed size."],
        ["Content-Encoding", "The HTTP header naming how a response body was compressed."],
        ["Level", "A codec setting trading speed for ratio."],
      ],
    },
    {
      slug: "dictionaries",
      title: "Dictionaries: compressing small messages",
      summary: "A 300-byte message barely compresses alone, because the codec has no history. Give it a trained dictionary and it does. Then see how HTTP now uses the previous response as the dictionary for the next.",
      level: "Current",
      minutes: 16,
      blocks: [
        { kind: "p", text: "LZ77 finds repeats in what it has already seen. At the start of a short message, it has seen nothing. A 300-byte tool result is full of patterns common to every tool result, but none repeated within itself, so it barely compresses, and the codec's own headers eat the gain." },
        { kind: "p", text: "A **dictionary** is shared history agreed in advance. Both sides load it before compressing or decompressing, so back-references can point into it. The first `{\"type\":\"tool_result\",\"tool_use_id\":` in a message becomes a single match." },
        { kind: "figure", figure: "dictionary-effect", title: "Small messages with and without a dictionary", caption: "Compressed size for messages of increasing size, compressed alone and with a trained dictionary. The dictionary helps most where messages are smallest. Values are illustrative; train and measure on your own samples." },
        { kind: "code", lang: "bash", file: "train.sh", code: `# Train a 110 KB dictionary on 10,000 real samples, one per file
zstd --train samples/*.json -o tool-results.dict

# Compress and decompress with it
zstd -D tool-results.dict message.json -o message.json.zst
zstd -D tool-results.dict -d message.json.zst

# Compare: one sample alone versus with the dictionary
zstd -c samples/0001.json | wc -c
zstd -c -D tool-results.dict samples/0001.json | wc -c
`, note: "Version dictionaries and store their ID with the data. A message compressed with dictionary v3 can only be read with v3." },
        { kind: "p", text: "Brotli takes the same idea to the web: it ships with a **built-in dictionary** of about 120 KB of common words and HTML, CSS and JavaScript fragments. That is why Brotli does so well on small text files where gzip struggles." },
        { kind: "h", text: "Shared dictionaries over HTTP" },
        { kind: "p", text: "RFC 9842, published in September 2025, standardises **compression dictionary transport**. A server marks a response as usable as a dictionary with a `Use-As-Dictionary` header. Later, the browser advertises it with `Available-Dictionary`, and the server can send the new version compressed against the old one, with content encodings `dcb` (Brotli) or `dcz` (zstd)." },
        { kind: "example", title: "Shipping a new version of a JavaScript bundle", lines: [
          ["app.v1.js, compressed normally", "≈ 100 KB"],
          ["app.v2.js changes a few functions", "Full download would again be ≈ 100 KB"],
          ["Compressed against v1 as the dictionary", "≈ 1 KB delta (the RFC's own example)"],
        ], result: "Users who already have v1 download about 1% of the bytes. Browser support was Chromium-led as of June 2026." },
        { kind: "deep", title: "Dictionaries for agent traffic", blocks: [
          { kind: "p", text: "Agent systems send and store millions of small, similar messages: tool calls, tool results, trace spans. A dictionary trained on a day's traffic can cut their stored size several-fold compared with compressing each alone, and zstd's dictionary decompression is fast enough for hot paths." },
          { kind: "p", text: "The same caution applies as with any compression of mixed data: a dictionary built from one tenant's data must not be used to compress another tenant's secrets, or the length-oracle attack in the next lesson becomes possible." },
        ] },
      ],
      practice: [
        ["Messaging", "Facebook built zstd dictionary support for compressing many small, similar messages and records."],
        ["Databases", "Some databases train per-table zstd dictionaries to compress small rows and values."],
        ["Web performance", "Large sites experiment with dictionary transport so returning users download only deltas of updated bundles."],
      ],
      check: [
        ["Why does a 300-byte message barely compress alone?", "The codec has no history to find repeats in, and its headers offset small gains."],
        ["What must both sides share to use a dictionary?", "The exact same dictionary, identified by version or hash."],
        ["What does RFC 9842 let a server do?", "Compress a response against a previous response the client already has, sending only the differences."],
      ],
      tryIt: "Collect 1,000 of your agent's tool results as separate files, train a zstd dictionary on 900, and measure the size of the other 100 with and without it.",
      terms: [
        ["Dictionary", "Pre-shared data that compressor and decompressor both load as history."],
        ["Training", "Building a dictionary from representative samples."],
        ["Use-As-Dictionary", "Response header marking a resource as a future compression dictionary."],
      ],
    },
    {
      slug: "compression-security-and-context",
      title: "Length oracles, context compaction and KV caches",
      summary: "Compression leaks information through size, and that broke HTTPS twice. Then the agent view: compaction is lossy compression of context, prompt caching is not compression at all, and inference servers compress their caches.",
      level: "Current",
      minutes: 18,
      blocks: [
        { kind: "h", text: "Size is a side channel" },
        { kind: "p", text: "Encryption hides content but not length. If a response contains a secret, such as a session token, and also text the attacker controls, compression makes the length depend on both. When the attacker's guess matches the secret, LZ77 finds a repeat and the output shrinks. By trying guesses and watching encrypted sizes, the attacker recovers the secret one character at a time." },
        { kind: "figure", figure: "crime-oracle", title: "Guess a secret from compressed length", caption: "The page contains a secret token and echoes an attacker-chosen search term. For each candidate next character, the compressed size is shown. The correct guess extends a match and compresses smaller, revealing one more character per round." },
        { kind: "p", text: "**CRIME** (2012) used this against TLS-level compression, which was then disabled everywhere. **BREACH** (2013) applied it to HTTP response compression, which is still on. Defences: never compress secrets alongside attacker-controlled input; mask tokens differently per response; add random padding; or disable compression for sensitive responses. RFC 9842 repeats the warning for dictionaries." },
        { kind: "h", text: "Context compaction is lossy compression" },
        { kind: "p", text: "An agent's context window is the most expensive store in the system. When it fills, harnesses **compact**: summarise older turns into a shorter text and drop the originals. That is lossy compression, and its quality is measured by whether the agent still succeeds at its task. Verbatim details that looked unimportant, such as an exact error message or file path, are often what the next step needed." },
        { kind: "table", head: ["Technique", "What it does", "Lossy?", "Saves"], rows: [
          ["Compaction", "Summarises the transcript", "Yes, verbatim detail is lost", "Context tokens"],
          ["Tool-result clearing", "Drops old, re-fetchable tool output", "Recoverable by re-running the tool", "Context tokens, with no inference cost"],
          ["Prompt caching", "Reuses computed work for an identical prefix", "No: nothing is removed", "Recomputation, cost and latency, not tokens"],
          ["Byte compression (gzip, zstd)", "Shrinks stored or transferred bytes", "No", "Storage and bandwidth, not context"],
        ] },
        { kind: "callout", tone: "trap", title: "Prompt caching is not compression", text: "Caching removes recomputation, not bytes: the model still attends to every token in the window. And compaction invalidates the cache, because it rewrites the prefix. Compact in large, infrequent steps so each invalidation is worth it (Module 13)." },
        { kind: "h", text: "KV-cache compression in inference" },
        { kind: "p", text: "Inference servers store attention keys and values for every token of every active sequence, the **KV cache** (Module 13). It is often the limit on how many requests fit on a GPU. Servers compress it: quantising cached values to fewer bits, evicting or merging less important tokens, and paging cold blocks to slower memory. Like compaction, the lossy versions trade a little quality for a lot of capacity." },
        { kind: "deep", title: "Choosing what to keep when compacting", blocks: [
          { kind: "p", text: "Good compaction is structured, not a generic summary. Keep decisions and their reasons, open questions, file paths touched, exact error messages and commands that worked. Drop exploration that led nowhere and tool output that can be fetched again." },
          { kind: "p", text: "An alternative is a **handoff file**: the agent writes its state to disk and a fresh session starts by reading it. Comparing compaction and handoff on the same tasks, by success rate and cost, is part of the capstone." },
        ] },
      ],
      practice: [
        ["Web frameworks", "CSRF tokens are masked with a fresh random value on every response, so BREACH cannot accumulate matches across requests."],
        ["Agent harnesses", "Production coding agents combine tool-result clearing for old outputs with occasional compaction, and track task success when tuning thresholds."],
        ["Inference servers", "Serving stacks quantise KV caches to 8 bits or fewer to fit more concurrent sequences on each GPU."],
      ],
      check: [
        ["How can compression leak a secret?", "When attacker-controlled text matches the secret, compressed size shrinks. Observing sizes across guesses reveals the secret."],
        ["What is the difference between compaction and prompt caching?", "Compaction removes context tokens lossily; caching reuses computation for an unchanged prefix and removes nothing."],
        ["Why does compaction hurt cache hit rates?", "It rewrites the prompt prefix, so the cached work for the old prefix no longer matches."],
      ],
      tryIt: "In Node, build a string containing `token=s3cr3t` plus a guess, compress it with `zlib.deflateRawSync` for every possible next character of the guess, and see which length is smallest.",
      terms: [
        ["Length oracle", "Learning about secret content from the size of compressed, encrypted output."],
        ["Compaction", "Summarising an agent's transcript to free context."],
        ["KV cache", "Stored attention keys and values for tokens already processed."],
        ["Quantisation", "Storing numbers with fewer bits, trading precision for space."],
      ],
    },
  ],
  lab: [
    "Implement Huffman coding and a toy LZ77 in about 200 lines.",
    "Run `zstd -b1 -e19` on your own data and plot ratio against speed.",
    "Train a dictionary on real tool results and measure the gain.",
    "Reproduce a length oracle in a small script, then defeat it with per-response masking.",
  ],
  interview: [
    ["gzip, Brotli or zstd for a dynamic API?", "Argue from CPU per request and client support."],
    ["Why LZ4 in one layer and zstd in another?", "Hot paths want speed, cold storage wants ratio."],
    ["How can compression leak a secret?", "Walk through a length oracle: attacker-controlled text that matches the secret compresses smaller."],
  ],
  reading: [
    "RFC 1951: DEFLATE",
    "RFC 7932: Brotli",
    "RFC 8878: Zstandard",
    "Yann Collet's Finite State Entropy blog posts",
    "Data Compression Explained, Matt Mahoney",
  ],
};
