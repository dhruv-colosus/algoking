import type { WindowAlgorithm } from "./sliding-window-catalog";

export type WindowInput = { id: string; label: string; values: (string | number)[]; k?: number; pattern?: string; target?: number };
export type WindowStep = {
  left: number; right: number; title: string; explanation: string; action: string;
  stats: [string, string][]; entries: string[]; entriesLabel: string;
  result: number | boolean | string | number[]; best: [number, number] | null; done: boolean;
};
export type WindowScenario = WindowInput & { steps: WindowStep[] };
const fixed = new Set(["maximum-sum-subarray-k", "maximum-vowels", "first-negative-in-window", "find-all-anagrams", "permutation-in-string", "sliding-window-maximum"]);

export function traceWindow(slug: WindowAlgorithm["slug"], input: WindowInput): WindowStep[] {
  const { values: a, k = 0, pattern = "", target = 0 } = input;
  const n = a.length, steps: WindowStep[] = [];
  let left = 0, right = -1, sum = 0, product = 1, best: [number, number] | null = null;
  let result: WindowStep["result"] = slug === "permutation-in-string" ? false : slug === "minimum-window-substring" ? "" : ["find-all-anagrams", "first-negative-in-window", "sliding-window-maximum"].includes(slug) ? [] : 0;
  const freq = new Map<string | number, number>(), need = new Map<string | number, number>();
  const queue: number[] = []; let head = 0;
  if (["find-all-anagrams", "permutation-in-string", "minimum-window-substring"].includes(slug)) {
    for (const c of pattern) need.set(c, (need.get(c) ?? 0) + 1);
  }
  const change = (x: string | number, delta: number) => { const count = (freq.get(x) ?? 0) + delta; if (count) freq.set(x, count); else freq.delete(x); };
  const snapshot = (title: string, explanation: string, action: string, stats: [string, string][] = [], done = false) => {
    steps.push({ left, right, title, explanation, action, stats,
      entries: ["first-negative-in-window", "sliding-window-maximum"].includes(slug) ? queue.slice(head).map((i) => `${i}: ${a[i]}`) : [...freq].map(([x, count]) => `${x}: ${count}`),
      entriesLabel: ["first-negative-in-window", "sliding-window-maximum"].includes(slug) ? "Deque · index: value · front first" : "Window frequencies · value: count",
      result: Array.isArray(result) ? [...result] : result, best: best ? [...best] : null, done });
  };
  const recordLongest = () => { if (right - left + 1 > Number(result)) { result = right - left + 1; best = [left, right]; } };
  snapshot("Start with an empty window", "Both boundaries move forward. Watch what enters, what leaves, and when the answer changes.", "left = 0; right = −1");

  if (fixed.has(slug)) {
    const width = ["find-all-anagrams", "permutation-in-string"].includes(slug) ? pattern.length : k;
    if (width < 1 || width > n) { snapshot("No full window", "The requested size must be between 1 and the input length. Return the empty result.", "no complete windows", [], true); return steps; }
    let maxSum = -Infinity;
    for (right = 0; right < n; right++) {
      const x = a[right];
      if (slug === "maximum-sum-subarray-k") sum += Number(x);
      if (slug === "maximum-vowels") sum += Number("aeiou".includes(String(x)));
      if (need.size) change(x, 1);
      // A head offset avoids O(n) array shifts in the trace generator.
      left = Math.max(0, right - width + 1);
      while (head < queue.length && queue[head] < left) head++;
      if (slug === "first-negative-in-window" && Number(x) < 0) queue.push(right);
      if (slug === "sliding-window-maximum") { while (queue.length > head && Number(a[queue[queue.length - 1]]) <= Number(x)) queue.pop(); queue.push(right); }
      if (right >= width) {
        const old = a[right - width];
        if (slug === "maximum-sum-subarray-k") sum -= Number(old);
        if (slug === "maximum-vowels") sum -= Number("aeiou".includes(String(old)));
        if (need.size) change(old, -1);
      }
      snapshot(right < width ? "Grow the window" : "Slide one position", `Include index ${right} (${x}). ${right >= width ? `Remove index ${right - width} (${a[right - width]}).` : "Wait until the window is full before recording an answer."}`, `window = [${left}, ${right}]`, [["Window size", String(right - left + 1)], ...(["maximum-sum-subarray-k", "maximum-vowels"].includes(slug) ? [[slug === "maximum-vowels" ? "Vowels" : "Sum", String(sum)] as [string, string]] : [])]);
      if (right - left + 1 !== width) continue;
      if (["maximum-sum-subarray-k", "maximum-vowels"].includes(slug)) { if (sum > maxSum) { maxSum = sum; result = sum; best = [left, right]; } }
      if (slug === "first-negative-in-window") (result as number[]).push(head < queue.length ? Number(a[queue[head]]) : 0);
      if (slug === "sliding-window-maximum") (result as number[]).push(Number(a[queue[head]]));
      const match = need.size > 0 && freq.size === need.size && [...need].every(([c, count]) => freq.get(c) === count);
      if (match) { best = [left, right]; if (slug === "find-all-anagrams") (result as number[]).push(left); else result = true; }
      snapshot("Evaluate the full window", need.size ? (match ? "All required frequencies match. Record this window." : "At least one frequency differs from the pattern.") : "Read the maintained state without rescanning the entire window.", `answer so far = ${JSON.stringify(result)}`);
      if (slug === "permutation-in-string" && result === true) break;
    }
  } else if (["subarrays-k-distinct", "binary-subarrays-with-sum"].includes(slug)) {
    const distinct = slug === "subarrays-k-distinct";
    const atMost = (budget: number) => {
      left = 0; right = -1; sum = 0; freq.clear(); let count = 0;
      snapshot(`Count at most ${budget}`, "Start a fresh pass. Every valid window ending at right contributes right − left + 1 nonempty suffixes.", `budget = ${budget}`);
      if (budget < 0) { snapshot("Negative budget", "No nonempty window can have a negative sum or distinct count.", "atMost = 0"); return 0; }
      for (right = 0; right < n; right++) {
        change(a[right], 1); sum += Number(a[right]);
        snapshot("Expand right", `Include index ${right}. Restore the at-most-${budget} constraint before counting.`, `pass: atMost(${budget})`);
        while ((distinct ? freq.size : sum) > budget && left <= right) {
          const removed = left; change(a[left], -1); sum -= Number(a[left++]);
          snapshot("Shrink an invalid window", `Remove index ${removed}; ${distinct ? "distinct values" : "sum"} must be at most ${budget}.`, `left = ${left}`);
        }
        const added = right - left + 1; count += added;
        snapshot("Count valid suffixes", `All ${added} nonempty suffixes ending at index ${right} satisfy this budget.`, `${count - added} + ${added} = ${count}`, [["Pass budget", String(budget)], ["Pass count", String(count)], [distinct ? "Distinct" : "Sum", String(distinct ? freq.size : sum)]]);
      }
      return count;
    };
    const budget = distinct ? k : target, upper = atMost(budget), lower = atMost(budget - 1);
    result = upper - lower;
    right = Math.min(right, n - 1);
    snapshot("Subtract the two counts", "Removing windows below the target leaves exactly the requested count.", `${upper} − ${lower} = ${result}`, [["atMost(target)", String(upper)], ["atMost(target − 1)", String(lower)]]);
  } else if (slug === "subarray-product-less-than-k" && k <= 1) {
    snapshot("No product can qualify", "All values are positive integers, so every nonempty product is at least 1.", "k ≤ 1 → 0", [], true); return steps;
  } else {
    let matched = 0;
    for (right = 0; right < n; right++) {
      const x = a[right]; change(x, 1); sum += Number(x) || 0; product *= slug === "subarray-product-less-than-k" ? Number(x) : 1;
      if (slug === "minimum-window-substring" && (freq.get(x) ?? 0) <= (need.get(x) ?? 0)) matched++;
      const stats = (): [string, string][] => slug === "minimum-size-subarray-sum" ? [["Sum", String(sum)], ["Target", String(target)]] : slug === "subarray-product-less-than-k" ? [["Product", String(product)], ["Threshold (strict)", String(k)]] : slug === "minimum-window-substring" ? [["Matched characters", `${matched} / ${pattern.length}`], ["Required", [...need].map(([c, count]) => `${c}:${count}`).join(" ")]] : slug === "max-consecutive-ones-iii" ? [["Zeros", String(freq.get(0) ?? 0)], ["Flip budget", String(k)]] : slug === "longest-repeating-character-replacement" ? [["Replacements", String(right - left + 1 - Math.max(0, ...freq.values()))], ["Budget", String(k)]] : [["Distinct", String(freq.size)], ["Length", String(right - left + 1)]];
      snapshot("Expand right", `Include index ${right} (${x}) and update the maintained state.`, `right = ${right}`, stats());
      if (["minimum-size-subarray-sum", "minimum-window-substring"].includes(slug)) {
        while (left <= right && (slug === "minimum-size-subarray-sum" ? sum >= target : pattern.length > 0 && matched === pattern.length)) {
          if (!best || right - left < best[1] - best[0]) { best = [left, right]; result = slug === "minimum-size-subarray-sum" ? right - left + 1 : a.slice(left, right + 1).join(""); }
          snapshot("Record a valid window", "This window satisfies the target. Save it if it is shorter, then try removing its first element.", `best = ${JSON.stringify(result)}`, stats());
          const old = a[left]; if (slug === "minimum-window-substring" && (freq.get(old) ?? 0) <= (need.get(old) ?? 0)) matched--;
          change(old, -1); sum -= Number(old) || 0; left++;
          snapshot("Try a smaller window", `Remove index ${left - 1} (${old}). Continue shrinking only while the constraint remains satisfied.`, `left = ${left}`, stats());
        }
      } else {
        const invalid = () => slug === "longest-substring-without-repeats" ? (freq.get(x) ?? 0) > 1 : slug === "longest-substring-k-distinct" ? freq.size > k : slug === "max-consecutive-ones-iii" ? (freq.get(0) ?? 0) > k : slug === "longest-repeating-character-replacement" ? right - left + 1 - Math.max(0, ...freq.values()) > k : product >= k;
        while (left <= right && invalid()) {
          const old = a[left]; change(old, -1); if (slug === "subarray-product-less-than-k") product /= Number(old); left++;
          snapshot("Shrink an invalid window", `Remove index ${left - 1} (${old}) to restore the constraint.`, `left = ${left}`, stats());
        }
        if (slug === "subarray-product-less-than-k") {
          const added = right - left + 1; result = Number(result) + added;
          snapshot("Count valid suffixes", `Positive integers ensure all ${added} suffixes of this window also have product below k.`, `count += ${added}`, stats());
        } else { recordLongest(); snapshot("Record the valid length", "The constraint now holds. Keep the longest valid window seen so far.", `best length = ${result}`, stats()); }
      }
    }
  }
  right = Math.min(right, n - 1);
  snapshot("Return the answer", "The scan is complete, or a successful existence check allowed an early return. Green brackets identify a recorded answer window when applicable.", `return ${JSON.stringify(result)}`, [], true);
  return steps;
}

const chars = (s: string) => [...s];
export function windowInputs(slug: string): WindowInput[] {
  const examples: Record<string, [Omit<WindowInput, "id" | "label">, Omit<WindowInput, "id" | "label">, string]> = {
    "maximum-sum-subarray-k": [{ values: [2, 1, 5, 1, 3, 2], k: 3 }, { values: [-4, -2, -7, -1], k: 2 }, "All negative values"],
    "maximum-vowels": [{ values: chars("abciiidef"), k: 3 }, { values: chars("rhythms"), k: 3 }, "No vowels"],
    "first-negative-in-window": [{ values: [12, -1, -7, 8, -15, 30, 16, 28], k: 3 }, { values: [1, 2, 3, 4], k: 2 }, "No negatives"],
    "find-all-anagrams": [{ values: chars("cbaebabacd"), pattern: "abc" }, { values: chars("baaab"), pattern: "aab" }, "Repeated pattern characters"],
    "permutation-in-string": [{ values: chars("eidbaooo"), pattern: "ab" }, { values: chars("eidboaoo"), pattern: "ab" }, "No permutation"],
    "longest-substring-without-repeats": [{ values: chars("abcabcbb") }, { values: chars("abba") }, "Repeated character inside the window"],
    "longest-substring-k-distinct": [{ values: chars("eceba"), k: 2 }, { values: chars("aaaa"), k: 0 }, "Zero distinct-character budget"],
    "longest-repeating-character-replacement": [{ values: chars("AABABBA"), k: 1 }, { values: chars("ABAB"), k: 0 }, "No replacements allowed"],
    "max-consecutive-ones-iii": [{ values: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k: 2 }, { values: [0, 0, 0], k: 0 }, "No flips allowed"],
    "minimum-size-subarray-sum": [{ values: [2, 3, 1, 2, 4, 3], target: 7 }, { values: [1, 1, 1, 1], target: 8 }, "Target cannot be reached"],
    "minimum-window-substring": [{ values: chars("ADOBECODEBANC"), pattern: "ABC" }, { values: chars("ABAAC"), pattern: "AAC" }, "Duplicate requirements"],
    "subarrays-k-distinct": [{ values: [1, 2, 1, 2, 3], k: 2 }, { values: [1, 1, 1], k: 1 }, "Overlapping valid subarrays"],
    "binary-subarrays-with-sum": [{ values: [1, 0, 1, 0, 1], target: 2 }, { values: [0, 0, 0], target: 0 }, "Zero target and all zeros"],
    "subarray-product-less-than-k": [{ values: [10, 5, 2, 6], k: 100 }, { values: [1, 2, 3], k: 1 }, "Threshold at one"],
    "sliding-window-maximum": [{ values: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 }, { values: [4, 4, 2, 4], k: 2 }, "Equal maxima and expiration"],
  };
  const [first, second, label] = examples[slug];
  return [{ ...first, id: "main", label: "Worked example" }, { ...second, id: "edge", label }];
}
export function windowScenarios(slug: string): WindowScenario[] {
  return windowInputs(slug).map((input) => ({ ...input, steps: traceWindow(slug, input) }));
}
