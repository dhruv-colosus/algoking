export type SearchInput = {
  id: string; label: string; values: number[]; target?: number; other?: number[];
  matrix?: number[][]; x?: number; p?: number; k?: number; h?: number; days?: number; m?: number;
};
export type SearchStep = {
  left: number; right: number; mid: number | null; title: string; explanation: string;
  action: string; stats: [string, string][]; result: number | boolean | number[] | null;
  done: boolean; focus: number[]; cuts: [number, number] | null;
};
export type SearchScenario = SearchInput & { mode: "indices" | "answer" | "partition"; displayValues?: number[]; steps: SearchStep[] };
const answerSlugs = new Set(["integer-square-root", "nth-root", "kth-smallest-sorted-matrix", "koko-eating-bananas", "ship-packages", "split-array-largest-sum", "minimum-days-bouquets", "aggressive-cows"]);
const partitionSlugs = new Set(["median-two-sorted-arrays", "kth-element-two-sorted-arrays"]);
const show = (value: number) => value === Infinity ? "+∞" : value === -Infinity ? "−∞" : String(value);

export function traceSearch(slug: string, input: SearchInput): SearchStep[] {
  const a = input.matrix ? input.matrix.flat() : slug === "aggressive-cows" ? [...input.values].sort((x, y) => x - y) : input.values;
  const target = input.target ?? 0, n = a.length;
  let left = 0, right = n - 1, mid: number | null = null;
  let result: SearchStep["result"] = null, focus: number[] = [], cuts: [number, number] | null = null;
  const steps: SearchStep[] = [];
  const snapshot = (title: string, explanation: string, action: string, stats: [string, string][] = [], done = false) => {
    steps.push({ left, right, mid, title, explanation, action, stats, result: Array.isArray(result) ? [...result] : result, done, focus: [...focus], cuts: cuts ? [...cuts] : null });
  };
  const finish = (value: SearchStep["result"], explanation = "The search has resolved the answer. Inspect the final result and the boundary values.") => {
    result = value;
    snapshot("Return the answer", explanation, `return ${JSON.stringify(value)}`, [], true);
    return steps;
  };
  if (partitionSlugs.has(slug)) {
    let aa = input.values, b = input.other ?? [];
    if (aa.length > b.length) [aa, b] = [b, aa];
    const size = aa.length + b.length, median = slug === "median-two-sorted-arrays";
    const rank = median ? Math.floor((size + 1) / 2) : input.k ?? 0;
    if (size === 0 || rank < 1 || rank > size) throw new RangeError("Nonempty combined input and a valid rank are required");
    left = Math.max(0, rank - b.length); right = Math.min(rank, aa.length);
    snapshot("Search cuts in the shorter array", `A has ${aa.length} values, B has ${b.length}. The combined left side must contain ${rank} entries.`, `i ∈ [${left}, ${right}]; j = ${rank} − i`);
    while (left <= right) {
      mid = left + Math.floor((right - left) / 2);
      const i = mid, j = rank - i; cuts = [i, j];
      const al = i ? aa[i - 1] : -Infinity, ar = i < aa.length ? aa[i] : Infinity;
      const bl = j ? b[j - 1] : -Infinity, br = j < b.length ? b[j] : Infinity;
      const stats: [string, string][] = [["A left / right", `${show(al)} / ${show(ar)}`], ["B left / right", `${show(bl)} / ${show(br)}`], ["Combined left size", String(rank)]];
      if (al <= br && bl <= ar) {
        snapshot("Both cross-boundaries are ordered", `${show(al)} ≤ ${show(br)} and ${show(bl)} ≤ ${show(ar)}. Every left value is at most every right value.`, `valid cuts: A = ${i}, B = ${j}`, stats);
        return finish(median && size % 2 === 0 ? (Math.max(al, bl) + Math.min(ar, br)) / 2 : Math.max(al, bl), median && size % 2 === 0 ? "Even combined length: average the largest left value and the smallest right value." : "The largest left value is the requested middle or kth element.");
      }
      snapshot(al > br ? "Too many A values on the left" : "Too few A values on the left", al > br ? `A left ${show(al)} exceeds B right ${show(br)}. Move A’s cut left.` : `B left ${show(bl)} exceeds A right ${show(ar)}. Move A’s cut right.`, al > br ? `right = ${i - 1}` : `left = ${i + 1}`, stats);
      if (al > br) right = i - 1; else left = i + 1;
    }
    throw new RangeError("Inputs must be sorted");
  }
  if (["lower-bound", "upper-bound", "first-last-occurrence"].includes(slug)) {
    const boundary = (strict: boolean) => {
      left = 0; right = n - 1; mid = null;
      snapshot(strict ? "Find the first value > target" : "Find the first value ≥ target", "Reset the inclusive candidate interval. The returned boundary is allowed to equal the array length.", `left = 0; right = ${right}`);
      while (left <= right) {
        mid = left + Math.floor((right - left) / 2);
        const skip = strict ? a[mid] <= target : a[mid] < target;
        snapshot(skip ? "Middle belongs before the boundary" : "Middle could be the boundary", `${a[mid]} ${skip ? (strict ? "≤" : "<") : (strict ? ">" : "≥")} ${target}. ${skip ? "Every index through mid is before the answer." : "Keep this as a possible boundary and look for an earlier one."}`, skip ? `left = ${mid + 1}` : `right = ${mid - 1}`, [["Predicate", strict ? "value > target" : "value ≥ target"]]);
        if (skip) left = mid + 1; else right = mid - 1;
      }
      mid = null;
      snapshot("The boundaries crossed", `The first qualifying position is ${left}${left === n ? ", one past the array" : ""}.`, `boundary = ${left}`);
      return left;
    };
    const first = boundary(slug === "upper-bound");
    if (slug !== "first-last-occurrence") { focus = first < n ? [first] : []; return finish(first); }
    result = first; const end = boundary(true);
    focus = Array.from({ length: end - first }, (_, i) => first + i);
    return finish(first === end ? [-1, -1, 0] : [first, end - 1, end - first], `Lower bound ${first}; upper bound ${end}. ${first === end ? "The target is absent." : `Indices ${first} through ${end - 1} contain ${end - first} copies.`}`);
  }
  if (answerSlugs.has(slug)) {
    const x = input.x ?? 0, k = input.k ?? 0, p = input.p ?? 1;
    const matrix = input.matrix ?? [], rows = matrix.length, cols = matrix[0]?.length ?? 0;
    let answer = 0;
    if (["integer-square-root", "nth-root"].includes(slug)) { left = 1; right = x; if (x === 0) { left = right = 0; return finish(0, "Zero has root zero. Handle it before dividing by a candidate."); } }
    else if (slug === "kth-smallest-sorted-matrix") { left = matrix[0][0]; right = matrix[rows - 1][cols - 1]; }
    else if (slug === "koko-eating-bananas") { if ((input.h ?? 0) < n) { right = -1; return finish(-1, "Each positive pile needs at least one hour, so h < n is impossible."); } left = 1; right = Math.max(...a); }
    else if (["ship-packages", "split-array-largest-sum"].includes(slug)) {
      const budget = slug === "ship-packages" ? input.days ?? 0 : k;
      if (budget < 1 || (slug === "split-array-largest-sum" && budget > n)) { right = -1; return finish(-1, "The requested day or part count is invalid."); }
      left = Math.max(...a); right = a.reduce((s, v) => s + v, 0);
    } else if (slug === "minimum-days-bouquets") { if ((input.m ?? 0) * k > n) { right = -1; return finish(-1, "There are not enough flowers to fill m disjoint bouquets of size k."); } left = Math.min(...a); right = Math.max(...a); }
    else { if (k < 2 || k > n) { right = -1; return finish(-1, "At least two cows and enough distinct stalls are required."); } left = 0; right = a[n - 1] - a[0]; }
    const lastTrue = ["integer-square-root", "aggressive-cows"].includes(slug), exact = slug === "nth-root";
    snapshot("Search the answer range", `The candidate is a ${slug === "aggressive-cows" ? "minimum gap" : slug === "minimum-days-bouquets" ? "day" : "number"}, rather than an input index. ${lastTrue ? "Keep the largest feasible value." : exact ? "Require an exact power match." : "Keep the smallest feasible value."}`, `left = ${left}; right = ${right}`);
    while (lastTrue || exact ? left <= right : left < right) {
      mid = left + Math.floor((right - left) / 2);
      let feasible = false, detail = ""; const stats: [string, string][] = [];
      focus = [];
      if (slug === "integer-square-root") { feasible = mid <= Math.floor(x / mid); detail = `${mid} ${feasible ? "≤" : ">"} floor(${x} / ${mid}) = ${Math.floor(x / mid)}.`; stats.push(["x", String(x)]); }
      else if (exact) {
        let power = 1;
        for (let i = 0; i < p; i++) { if (power > Math.floor(x / mid)) { power = x + 1; break; } power *= mid; }
        detail = `${mid}^${p} ${power > x ? ">" : power === x ? "=" : "<"} ${x}. Multiplication stops as soon as it would exceed x.`;
        if (power === x) { snapshot("An exact power matches", detail, `root = ${mid}`); return finish(mid); }
        snapshot(power < x ? "Candidate root is too small" : "Candidate root is too large", detail, power < x ? `left = ${mid + 1}` : `right = ${mid - 1}`);
        if (power < x) left = mid + 1; else right = mid - 1;
        continue;
      } else if (slug === "kth-smallest-sorted-matrix") {
        let row = rows - 1, col = 0, count = 0;
        while (row >= 0 && col < cols) { if (matrix[row][col] <= mid) { count += row + 1; col++; } else row--; }
        focus = a.flatMap((v, i) => v <= mid! ? [i] : []);
        feasible = count >= k; detail = `${count} entries are ≤ ${mid}; need at least ${k}. Count by moving up or right from the bottom-left.`; stats.push(["Entries ≤ candidate", String(count)], ["Rank k", String(k)]);
      } else if (slug === "koko-eating-bananas") {
        const hours = a.reduce((s, v) => s + Math.ceil(v / mid!), 0); feasible = hours <= (input.h ?? 0);
        detail = `Per-pile hours: ${a.map((v) => Math.ceil(v / mid!)).join(" + ")} = ${hours}. Budget: ${input.h}.`; stats.push(["Hours needed", String(hours)], ["Hours available", String(input.h)]);
      } else if (["ship-packages", "split-array-largest-sum"].includes(slug)) {
        let parts = 1, load = 0; const groups: number[] = [];
        for (const v of a) { if (load + v > mid) { groups.push(load); load = 0; parts++; } load += v; } groups.push(load);
        const budget = slug === "ship-packages" ? input.days ?? 0 : k;
        feasible = parts <= budget; detail = `Greedy group sums: ${groups.join(" | ")}. Need ${parts} ${slug === "ship-packages" ? "days" : "parts"}; allowed ${budget}.`; stats.push(["Groups needed", String(parts)], ["Allowed", String(budget)]);
      } else if (slug === "minimum-days-bouquets") {
        let bouquets = 0, run = 0;
        a.forEach((v, i) => { if (v > mid!) run = 0; else { focus.push(i); run++; if (run === k) { bouquets++; run = 0; } } });
        feasible = bouquets >= (input.m ?? 0); detail = `${bouquets} disjoint bouquets of ${k} adjacent flowers can be formed by day ${mid}.`; stats.push(["Bouquets formed", String(bouquets)], ["Bouquets needed", String(input.m)]);
      } else {
        let last = a[0], placed = 1; focus = [0];
        for (let i = 1; i < n; i++) if (a[i] - last >= mid) { placed++; last = a[i]; focus.push(i); }
        feasible = placed >= k; detail = `Greedy placements: ${focus.map((i) => a[i]).join(", ")}. Can place ${placed}; need ${k}.`; stats.push(["Cows placed", String(placed)], ["Cows needed", String(k)]);
      }
      if (lastTrue && feasible) result = answer = mid;
      snapshot(feasible ? "Candidate is feasible" : "Candidate is not feasible", detail, lastTrue ? feasible ? `save ${mid}; left = ${mid + 1}` : `right = ${mid - 1}` : feasible ? `right = ${mid}` : `left = ${mid + 1}`, stats);
      if (lastTrue) { if (feasible) left = mid + 1; else right = mid - 1; }
      else { if (feasible) right = mid; else left = mid + 1; }
    }
    mid = null; focus = [];
    return finish(exact ? -1 : lastTrue ? answer : left, exact ? "The candidate range is empty and no integer power matched x exactly." : lastTrue ? "The boundaries crossed. Return the largest candidate saved as feasible." : "The first feasible value is the single candidate left after convergence.");
  }
  snapshot("Start with the candidate indices", "The retained interval contains the answer whenever it exists. Watch why each comparison can discard one side.", `left = ${left}; right = ${right}`);
  const converge = ["minimum-rotated-array", "find-peak-element", "single-element-sorted-array"].includes(slug);
  if (n === 0) return finish(slug === "search-2d-matrix" ? false : -1, "There are no elements to search.");
  while (converge ? left < right : left <= right) {
    mid = left + Math.floor((right - left) / 2);
    if (slug === "single-element-sorted-array") {
      mid -= mid % 2; focus = [mid, mid + 1]; const intact = a[mid] === a[mid + 1];
      snapshot(intact ? "The even-index pair is intact" : "The pair alignment has broken", `Indices ${mid} and ${mid + 1} contain ${a[mid]} and ${a[mid + 1]}. ${intact ? "The singleton is after this intact pair." : "The singleton is at or before this pair start."}`, intact ? `left = ${mid + 2}` : `right = ${mid}`);
      if (intact) left = mid + 2; else right = mid; continue;
    }
    if (slug === "minimum-rotated-array" || slug === "find-peak-element") {
      const goRight = slug === "minimum-rotated-array" ? a[mid] > a[right] : a[mid] < a[mid + 1];
      focus = slug === "find-peak-element" ? [mid, mid + 1] : [mid, right];
      snapshot(goRight ? "Keep the right half" : "Keep middle and the left half", slug === "minimum-rotated-array" ? `${a[mid]} ${goRight ? ">" : "≤"} right value ${a[right]}. ${goRight ? "The minimum lies after mid." : "Mid may itself be the minimum."}` : `${a[mid]} ${goRight ? "<" : ">"} neighbor ${a[mid + 1]}. ${goRight ? "The uphill right side contains a peak." : "The left side including mid contains a peak."}`, goRight ? `left = ${mid + 1}` : `right = ${mid}`);
      if (goRight) left = mid + 1; else right = mid; continue;
    }
    focus = [mid];
    if (a[mid] === target) {
      snapshot("The middle matches", `Value ${a[mid]} equals target ${target}.${input.matrix ? ` Virtual index ${mid} maps to row ${Math.floor(mid / input.matrix[0].length)}, column ${mid % input.matrix[0].length}.` : ""}`, slug === "search-2d-matrix" ? "return true" : `return ${mid}`);
      return finish(slug === "search-2d-matrix" ? true : mid);
    }
    if (slug === "search-rotated-array-duplicates" && a[left] === a[mid] && a[mid] === a[right]) {
      snapshot("Equal endpoints hide the sorted half", `Left, middle, and right all equal ${a[mid]}, which is not the target. Remove the endpoints safely.`, `left = ${left + 1}; right = ${right - 1}`);
      left++; right--; continue;
    }
    let goRight = a[mid] < target, detail = `${a[mid]} ${goRight ? "<" : ">"} ${target}. Sorted order eliminates the ${goRight ? "left" : "right"} half including mid.`;
    if (slug.startsWith("search-rotated-array")) {
      const leftSorted = a[left] <= a[mid];
      goRight = leftSorted ? !(a[left] <= target && target < a[mid]) : a[mid] < target && target <= a[right];
      detail = `${leftSorted ? "Left" : "Right"} half is sorted. Its values span ${leftSorted ? `${a[left]} to ${a[mid]}` : `${a[mid]} to ${a[right]}`}. The target belongs in the ${goRight ? "right" : "left"} search half.`;
    }
    snapshot(`Discard middle and the ${goRight ? "left" : "right"} half`, detail, goRight ? `left = ${mid + 1}` : `right = ${mid - 1}`, input.matrix ? [["Row", String(Math.floor(mid / input.matrix[0].length))], ["Column", String(mid % input.matrix[0].length)]] : []);
    if (goRight) left = mid + 1; else right = mid - 1;
  }
  mid = null;
  if (converge) { focus = [left]; return finish(slug === "single-element-sorted-array" ? a[left] : left, `Only index ${left}, value ${a[left]}, remains. ${slug === "single-element-sorted-array" ? "Return its value." : "Return its index."}`); }
  focus = [];
  return finish(slug === "search-2d-matrix" ? false : -1, "Left has passed right. No candidate can contain the target.");
}

export function searchInputs(slug: string): SearchInput[] {
  const make = (label: string, values: number[], rest: Omit<SearchInput, "id" | "label" | "values"> = {}): SearchInput => ({ id: label.toLowerCase().replaceAll(" ", "-"), label, values, ...rest });
  switch (slug) {
    case "binary-search": return [make("Target present", [-1, 0, 3, 5, 9, 12, 15, 18], { target: 9 }), make("Target absent", [-1, 0, 3, 5, 9, 12, 15, 18], { target: 8 }), make("Empty array", [], { target: 9 })];
    case "lower-bound": case "upper-bound": case "first-last-occurrence": return [make("Duplicate target", [1, 2, 2, 2, 5, 8], { target: 2 }), make("Between values", [1, 2, 2, 2, 5, 8], { target: 4 }), make("Beyond the last value", [1, 2, 2, 2, 5, 8], { target: 9 }), make("Empty array", [], { target: 2 })];
    case "search-rotated-array": return [make("Across the pivot", [4, 5, 6, 7, 0, 1, 2], { target: 0 }), make("Missing target", [4, 5, 6, 7, 0, 1, 2], { target: 3 }), make("Two elements", [3, 1], { target: 1 })];
    case "search-rotated-array-duplicates": return [make("Ambiguous endpoints", [1, 0, 1, 1, 1], { target: 0 }), make("All equal, absent", [2, 2, 2, 2, 2], { target: 3 }), make("Repeated target", [2, 5, 6, 0, 0, 1, 2], { target: 0 })];
    case "minimum-rotated-array": return [make("Rotated array", [4, 5, 6, 7, 0, 1, 2]), make("Already sorted", [1, 2, 3, 4, 5]), make("One value", [7])];
    case "find-peak-element": return [make("One interior peak", [1, 2, 3, 1]), make("Multiple valid peaks", [1, 3, 2, 4, 1]), make("Peak at the edge", [5, 4, 3, 2, 1])];
    case "single-element-sorted-array": return [make("Middle singleton", [1, 1, 2, 3, 3, 4, 4]), make("First singleton", [0, 1, 1, 2, 2]), make("Last singleton", [1, 1, 2, 2, 3]), make("One value", [7])];
    case "integer-square-root": return [make("Between perfect squares", [], { x: 26 }), make("Perfect square", [], { x: 36 }), make("Zero", [], { x: 0 })];
    case "nth-root": return [make("Exact cube", [], { x: 27, p: 3 }), make("No integer root", [], { x: 28, p: 3 }), make("Power one", [], { x: 7, p: 1 })];
    case "search-2d-matrix": return [make("Target present", [], { matrix: [[1, 3, 5], [7, 9, 11]], target: 9 }), make("Target absent", [], { matrix: [[1, 3, 5], [7, 9, 11]], target: 6 }), make("Empty matrix", [], { matrix: [], target: 1 })];
    case "kth-smallest-sorted-matrix": return [make("Overlapping row ranges", [], { matrix: [[1, 5, 9], [10, 11, 13], [12, 13, 15]], k: 8 }), make("Duplicates and negatives", [], { matrix: [[-5, -4, 0], [-4, 0, 3]], k: 3 }), make("All equal", [], { matrix: [[2, 2], [2, 2]], k: 3 })];
    case "koko-eating-bananas": return [make("Eight hours", [3, 6, 7, 11], { h: 8 }), make("One hour per pile", [30, 11, 23, 4, 20], { h: 5 }), make("Impossible hours", [3, 6, 7], { h: 2 })];
    case "ship-packages": return [make("Four shipping days", [1, 2, 3, 1, 1], { days: 4 }), make("One shipping day", [3, 2, 2, 4, 1, 4], { days: 1 }), make("One day per package", [3, 2, 4], { days: 3 })];
    case "split-array-largest-sum": return [make("Two parts", [7, 2, 5, 10, 8], { k: 2 }), make("One value per part", [1, 4, 4], { k: 3 }), make("All zero", [0, 0, 0], { k: 2 })];
    case "minimum-days-bouquets": return [make("Single-flower bouquets", [1, 10, 3, 10, 2], { m: 3, k: 1 }), make("Adjacency matters", [7, 7, 7, 7, 12, 7, 7], { m: 2, k: 3 }), make("Not enough flowers", [1, 10, 3, 10, 2], { m: 3, k: 2 })];
    case "aggressive-cows": return [make("Three cows", [1, 2, 8, 4, 9], { k: 3 }), make("Use all stalls", [0, 3, 7, 10], { k: 4 }), make("Two endpoint cows", [-5, 0, 4, 9], { k: 2 })];
    case "median-two-sorted-arrays": return [make("Odd total", [1, 3], { other: [2] }), make("Even total", [1, 2], { other: [3, 4] }), make("One array empty", [], { other: [2, 3] }), make("Repeated values", [0, 0], { other: [0, 0] })];
    case "kth-element-two-sorted-arrays": return [make("Fifth element", [2, 3, 6, 7, 9], { other: [1, 4, 8, 10], k: 5 }), make("First element", [2, 3], { other: [1, 4, 5], k: 1 }), make("One array empty", [], { other: [2, 4, 6], k: 3 })];
    default: throw new Error(`Unknown binary search lesson: ${slug}`);
  }
}
export function searchScenarios(slug: string): SearchScenario[] {
  return searchInputs(slug).map((input) => ({ ...input, ...(slug === "aggressive-cows" ? { displayValues: [...input.values].sort((a, b) => a - b) } : {}), mode: partitionSlugs.has(slug) ? "partition" : answerSlugs.has(slug) ? "answer" : "indices", steps: traceSearch(slug, input) }));
}
