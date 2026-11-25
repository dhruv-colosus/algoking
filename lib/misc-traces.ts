import type { WindowInput, WindowScenario, WindowStep } from "./sliding-window-traces";

// Display traces use base 10 without a modulus so a window's hash reads as its digits.
// Every example value is a single digit, which keeps that hash collision-free.
const BASE = 10;

function traceSmallestUnique(values: number[]): WindowStep[] {
  const n = values.length, steps: WindowStep[] = [];
  let lo = 1, hi = n, left = 0, right = -1;
  let best: [number, number] | null = [0, n - 1];
  let counts = new Map<number, number>(), countsLabel = "Hash counts · hash: count";
  const snapshot = (title: string, explanation: string, action: string, stats: [string, string][], done = false) => {
    steps.push({ left, right, title, explanation, action, stats: [["lo", String(lo)], ["hi", String(hi)], ...stats],
      entries: [...counts].map(([hash, count]) => `${hash}: ${count}`), entriesLabel: countsLabel,
      result: hi, best: best ? [...best] : null, done });
  };

  snapshot("Search the length range", `A unique window of length L can be extended into a unique window of length L + 1, so the answer is the first length that works. The whole array is always unique, so search lengths ${lo} through ${hi}.`, `lo = 1; hi = ${n}`, []);

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2), top = BASE ** (mid - 1);
    counts = new Map(); countsLabel = `Hash counts for length ${mid} · hash: count`;
    let hash = 0;
    left = 0; right = -1;
    snapshot(`Try length ${mid}`, `mid = ⌊(${lo} + ${hi}) / 2⌋ = ${mid}. Hash every window of ${mid} element${mid === 1 ? "" : "s"} and count how often each hash appears. The outgoing value is weighted by ${BASE}^${mid - 1} = ${top}.`, `check(length = ${mid})`, [["Length tried", String(mid)]]);
    for (let r = 0; r < n; r++) {
      const previous = hash, outgoing = r >= mid ? values[r - mid] : null;
      if (outgoing !== null) hash -= outgoing * top;
      hash = hash * BASE + values[r];
      if (r < mid - 1) continue;
      left = r - mid + 1; right = r;
      counts.set(hash, (counts.get(hash) ?? 0) + 1);
      const window = `[${values.slice(left, right + 1).join(", ")}]`;
      const explanation = outgoing === null
        ? `Build the first window ${window} by shifting in one value at a time: hash = ${hash}.`
        : `Roll instead of rebuilding: (${previous} − ${outgoing}·${top}) · ${BASE} + ${values[r]} = ${hash}. That is the hash of ${window}.`;
      snapshot(outgoing === null ? "Hash the first window" : "Roll the hash one step", `${explanation} It has now been seen ${counts.get(hash)} time${counts.get(hash) === 1 ? "" : "s"}.`, `count[${hash}] = ${counts.get(hash)}`, [["Length tried", String(mid)], ["Hash", String(hash)]]);
    }
    let firstUnique = -1, scanHash = 0;
    for (let r = 0; r < n; r++) {
      if (r >= mid) scanHash -= values[r - mid] * top;
      scanHash = scanHash * BASE + values[r];
      if (r >= mid - 1 && counts.get(scanHash) === 1) { firstUnique = r - mid + 1; break; }
    }
    if (firstUnique >= 0) {
      hi = mid; best = [firstUnique, firstUnique + mid - 1]; left = best[0]; right = best[1];
      snapshot(`Length ${mid} works`, `[${values.slice(left, right + 1).join(", ")}] has a count of one, so it appears nowhere else. Every longer length also works; keep ${mid} as the best and search shorter lengths.`, `hi = ${mid}`, [["Length tried", String(mid)]]);
    } else {
      lo = mid + 1; left = 0; right = -1;
      snapshot(`Length ${mid} fails`, `Every hash appears at least twice, so every window of length ${mid} repeats. No shorter length can work either; search longer lengths.`, `lo = ${mid + 1}`, [["Length tried", String(mid)]]);
    }
  }
  counts = new Map(); countsLabel = "Hash counts";
  if (best) { left = best[0]; right = best[1]; }
  snapshot("Return the answer", `lo and hi meet at ${lo}: the shortest length with a window that appears exactly once. Green brackets mark one such window.`, `return ${lo}`, [], true);
  return steps;
}

export function miscInputs(slug: string): WindowInput[] {
  const examples: Record<string, { label: string; values: number[] }[]> = {
    "smallest-unique-subarray": [
      { label: "Worked example", values: [1, 1, 2, 2, 1] },
      { label: "Periodic input", values: [1, 2, 1, 2, 1, 2] },
      { label: "All values equal", values: [3, 3, 3] },
    ],
  };
  return examples[slug].map((example, index) => ({ id: `example-${index}`, label: example.label, values: example.values }));
}

export function miscScenarios(slug: string): WindowScenario[] {
  const tracers: Record<string, (values: number[]) => WindowStep[]> = { "smallest-unique-subarray": traceSmallestUnique };
  return miscInputs(slug).map((input) => ({ ...input, steps: tracers[slug](input.values as number[]) }));
}
