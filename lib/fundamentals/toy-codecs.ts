// Small, deterministic codec models used by the Phase 2 figures.
// They are teaching models, not production encoders.

export type LzToken = { kind: "literal"; text: string } | { kind: "match"; text: string; distance: number; length: number };

/** Greedy LZ77 over characters with a minimum match of 3. Matches may overlap their own output. */
export function lz77(input: string, window = 32, maxLength = 255): LzToken[] {
  const chars = Array.from(input);
  const tokens: LzToken[] = [];
  let i = 0;
  while (i < chars.length) {
    let bestLength = 0, bestDistance = 0;
    for (let start = Math.max(0, i - window); start < i; start++) {
      let length = 0;
      while (i + length < chars.length && length < maxLength && chars[start + length] === chars[i + length]) length++;
      if (length > bestLength || (length === bestLength && length > 0 && i - start < bestDistance)) { bestLength = length; bestDistance = i - start; }
    }
    if (bestLength >= 3) {
      tokens.push({ kind: "match", text: chars.slice(i, i + bestLength).join(""), distance: bestDistance, length: bestLength });
      i += bestLength;
    } else {
      tokens.push({ kind: "literal", text: chars[i] });
      i += 1;
    }
  }
  return tokens;
}

/** Bits for a token stream: 1 flag bit plus 8 bits per literal, or flag + distance bits + 8 length bits per match. */
export function lzBits(tokens: LzToken[], window = 32) {
  const distanceBits = Math.max(1, Math.ceil(Math.log2(window + 1)));
  return tokens.reduce((bits, t) => bits + (t.kind === "literal" ? 9 : 1 + distanceBits + 8), 0);
}

export function frequencies(text: string) {
  const counts = new Map<string, number>();
  for (const ch of Array.from(text)) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}

/** Shannon entropy in bits per symbol for a zero-order model of the text. */
export function entropy(text: string) {
  const n = Array.from(text).length;
  if (!n) return 0;
  return frequencies(text).reduce((h, [, c]) => h - (c / n) * Math.log2(c / n), 0);
}

type HuffNode = { weight: number; order: number; symbol?: string; left?: HuffNode; right?: HuffNode };

/** Huffman codes with deterministic tie-breaking, so server and browser agree. */
export function huffman(text: string): Map<string, string> {
  const freq = frequencies(text);
  if (freq.length === 0) return new Map();
  if (freq.length === 1) return new Map([[freq[0][0], "0"]]);
  let order = 0;
  let nodes: HuffNode[] = freq.map(([symbol, weight]) => ({ symbol, weight, order: order++ }));
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.weight - b.weight || a.order - b.order);
    const [left, right, ...rest] = nodes;
    nodes = [...rest, { weight: left.weight + right.weight, order: order++, left, right }];
  }
  const codes = new Map<string, string>();
  const walk = (node: HuffNode, path: string) => {
    if (node.symbol !== undefined) { codes.set(node.symbol, path); return; }
    walk(node.left!, path + "0");
    walk(node.right!, path + "1");
  };
  walk(nodes[0], "");
  return codes;
}

/** Protobuf-style varint of an unsigned 64-bit value. */
export function varint(value: bigint): number[] {
  const out: number[] = [];
  let v = BigInt.asUintN(64, value);
  do {
    let byte = Number(v & BigInt(0x7f));
    v >>= BigInt(7);
    if (v) byte |= 0x80;
    out.push(byte);
  } while (v);
  return out;
}

export const zigzag32 = (n: number) => BigInt(((n << 1) ^ (n >> 31)) >>> 0);

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Base64 with the intermediate 6-bit groups exposed for teaching. */
export function base64Groups(bytes: Uint8Array) {
  const groups: { bytes: number[]; sextets: (number | null)[]; chars: string[] }[] = [];
  for (let i = 0; i < bytes.length; i += 3) {
    const chunk = Array.from(bytes.subarray(i, i + 3));
    const n = (chunk[0] << 16) | ((chunk[1] ?? 0) << 8) | (chunk[2] ?? 0);
    const sextets = [(n >> 18) & 63, (n >> 12) & 63, (n >> 6) & 63, n & 63].map((s, k) => (k <= chunk.length ? s : null));
    groups.push({ bytes: chunk, sextets, chars: sextets.map((s) => (s === null ? "=" : alphabet[s])) });
  }
  return groups;
}

/** Deterministic pseudo-random numbers (Park–Miller). */
export function seeded(seed: number) {
  let state = seed % 2147483647 || 1;
  return () => (state = (state * 48271) % 2147483647) / 2147483647;
}
