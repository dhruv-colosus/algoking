import assert from "node:assert/strict";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import ts from "typescript";

async function load(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { searchAlgorithms, searchCategories } = await load("../lib/binary-search-catalog.ts");
const { searchCode } = await load("../lib/binary-search-code.ts");
const { searchNotes } = await load("../lib/binary-search-lessons.ts");
const { searchInputs, searchScenarios, traceSearch } = await load("../lib/binary-search-traces.ts");
const last = (slug, input) => traceSearch(slug, input).at(-1).result;
const input = (values = [], rest = {}) => ({ id: "test", label: "Test", values, ...rest });

// Independent small-input oracles: linear searches, enumeration, merging, and exhaustive partitions.
function oracle(slug, data) {
  const a = data.values, t = data.target, matrix = data.matrix;
  switch (slug) {
    case "binary-search": case "search-rotated-array": case "search-rotated-array-duplicates": return a.indexOf(t);
    case "lower-bound": { const i = a.findIndex((v) => v >= t); return i < 0 ? a.length : i; }
    case "upper-bound": { const i = a.findIndex((v) => v > t); return i < 0 ? a.length : i; }
    case "first-last-occurrence": { const i = a.indexOf(t), end = a.lastIndexOf(t); return i < 0 ? [-1, -1, 0] : [i, end, end - i + 1]; }
    case "minimum-rotated-array": return a.length ? a.indexOf(Math.min(...a)) : -1;
    case "single-element-sorted-array": return a.find((v) => a.filter((x) => v === x).length === 1);
    case "integer-square-root": return Math.floor(Math.sqrt(data.x));
    case "nth-root": { for (let r = 0; r <= data.x; r++) { const power = BigInt(r) ** BigInt(data.p); if (power === BigInt(data.x)) return r; if (power > BigInt(data.x)) break; } return -1; }
    case "search-2d-matrix": return matrix.flat().includes(t);
    case "kth-smallest-sorted-matrix": return matrix.flat().sort((a, b) => a - b)[data.k - 1];
    case "koko-eating-bananas": { for (let speed = 1; speed <= Math.max(...a); speed++) if (a.reduce((s, v) => s + Math.ceil(v / speed), 0) <= data.h) return speed; return -1; }
    case "ship-packages": case "split-array-largest-sum": {
      const k = slug === "ship-packages" ? Math.min(a.length, data.days) : data.k;
      if (k < 1 || k > a.length) return -1;
      let best = Infinity;
      // Enumerate all cut sets; exactly min(D,n) parts gives the same optimum for shipping.
      for (let mask = 0; mask < 2 ** (a.length - 1); mask++) {
        let parts = 1, sum = 0, largest = 0;
        for (let i = 0; i < a.length; i++) { sum += a[i]; if (i === a.length - 1 || mask & (1 << i)) { largest = Math.max(largest, sum); sum = 0; if (i < a.length - 1) parts++; } }
        if (parts === k) best = Math.min(best, largest);
      }
      return best;
    }
    case "minimum-days-bouquets": {
      for (let day = 0; day <= Math.max(...a); day++) {
        let count = 0, run = 0;
        for (const v of a) { run = v <= day ? run + 1 : 0; if (run === data.k) { count++; run = 0; } }
        if (count >= data.m) return day;
      }
      return -1;
    }
    case "aggressive-cows": {
      if (data.k < 2 || data.k > a.length) return -1;
      let best = 0;
      for (let mask = 0; mask < 2 ** a.length; mask++) {
        const selected = a.filter((_, i) => mask & (1 << i)).sort((a, b) => a - b);
        if (selected.length === data.k) best = Math.max(best, Math.min(...selected.slice(1).map((v, i) => v - selected[i])));
      }
      return best;
    }
    case "median-two-sorted-arrays": case "kth-element-two-sorted-arrays": {
      const merged = [...a, ...data.other].sort((a, b) => a - b), n = merged.length;
      return slug === "kth-element-two-sorted-arrays" ? merged[data.k - 1] : (merged[Math.floor((n - 1) / 2)] + merged[Math.floor(n / 2)]) / 2;
    }
    default: throw new Error(slug);
  }
}
function verify(slug, data, answer) {
  if (slug === "find-peak-element") {
    if (!data.values.length) return assert.equal(answer, -1);
    const a = data.values; assert.ok(Number.isInteger(answer) && answer >= 0 && answer < a.length);
    assert.ok(a[answer] > (a[answer - 1] ?? -Infinity) && a[answer] > (a[answer + 1] ?? -Infinity));
  } else if (slug === "search-rotated-array-duplicates") {
    assert.ok(answer === -1 ? !data.values.includes(data.target) : answer >= 0 && answer < data.values.length && data.values[answer] === data.target);
  } else assert.deepEqual(answer, oracle(slug, data), `${slug}: ${JSON.stringify(data)}`);
}

const cases = searchAlgorithms.flatMap(({ slug }) => searchInputs(slug).map((input) => ({ slug, input })));
let seed = 73;
const rand = (max) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % max; };
for (let trial = 0; trial < 70; trial++) {
  const n = rand(8), a = Array.from({ length: n }, () => rand(14) - 5).sort((a, b) => a - b), unique = [...new Set(a)];
  const rotate = (array) => { const at = rand(array.length || 1); return [...array.slice(at), ...array.slice(0, at)]; };
  for (const slug of ["lower-bound", "upper-bound", "first-last-occurrence"]) cases.push({ slug, input: input(a, { target: rand(18) - 7 }) });
  cases.push({ slug: "binary-search", input: input(unique, { target: rand(18) - 7 }) }, { slug: "search-rotated-array", input: input(rotate(unique), { target: rand(18) - 7 }) }, { slug: "search-rotated-array-duplicates", input: input(rotate(a), { target: rand(18) - 7 }) }, { slug: "minimum-rotated-array", input: input(rotate(unique)) }, { slug: "find-peak-element", input: input(rotate(unique)) });
  const singleton = rand(6), pair = Array.from({ length: 6 }, (_, i) => i === singleton ? [i] : [i, i]).flat();
  cases.push({ slug: "single-element-sorted-array", input: input(pair) });
  cases.push({ slug: "integer-square-root", input: input([], { x: rand(1000) }) }, { slug: "nth-root", input: input([], { x: rand(300), p: 1 + rand(7) }) });
  const rows = 1 + rand(4), cols = 1 + rand(4), matrix = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => r * 3 + c * 2 - 6));
  cases.push({ slug: "kth-smallest-sorted-matrix", input: input([], { matrix, k: 1 + rand(rows * cols) }) }, { slug: "search-2d-matrix", input: input([], { matrix: Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (r * cols + c) * 2 - 6)), target: rand(30) - 8 }) });
  const positive = Array.from({ length: 1 + rand(7) }, () => 1 + rand(12));
  for (const [slug, params] of [["koko-eating-bananas", { h: rand(20) }], ["ship-packages", { days: 1 + rand(9) }], ["split-array-largest-sum", { k: 1 + rand(positive.length) }], ["minimum-days-bouquets", { k: 1 + rand(3), m: 1 + rand(5) }]]) cases.push({ slug, input: input(positive, params) });
  if (unique.length >= 2) cases.push({ slug: "aggressive-cows", input: input(unique, { k: 2 + rand(unique.length - 1) }) });
  const b = Array.from({ length: 1 + rand(7) }, () => rand(20) - 9).sort((a, b) => a - b);
  cases.push({ slug: "median-two-sorted-arrays", input: input(a, { other: b }) }, { slug: "kth-element-two-sorted-arrays", input: input(a, { other: b, k: 1 + rand(a.length + b.length) }) });
}
cases.push({ slug: "integer-square-root", input: input([], { x: 1e9 }) }, { slug: "nth-root", input: input([], { x: 1e9, p: 31 }) }, { slug: "koko-eating-bananas", input: input([1e9, 1e9, 1e9], { h: 3 }) }, { slug: "ship-packages", input: input([1e9, 1e9, 1e9], { days: 1 }) }, { slug: "median-two-sorted-arrays", input: input([2147483647], { other: [2147483647] }) }, { slug: "kth-smallest-sorted-matrix", input: input([], { matrix: [[-2147483648, 2147483647]], k: 2 }) }, { slug: "aggressive-cows", input: input([-2147483648, 2147483647], { k: 2 }) });

// These large cases have direct, independently known results rather than enumerating the range.
const large = new Map([["integer-square-root", 31622], ["nth-root", -1], ["koko-eating-bananas", 1e9], ["ship-packages", 3e9], ["median-two-sorted-arrays", 2147483647], ["kth-smallest-sorted-matrix", 2147483647], ["aggressive-cows", 4294967295]]);
function checkCase(slug, data, answer) {
  if ((data.x >= 1e9 || data.values.some((v) => Math.abs(v) >= 1e9) || data.matrix?.flat().some((v) => Math.abs(v) >= 1e9))) assert.deepEqual(answer, large.get(slug), slug);
  else verify(slug, data, answer);
}

test("all lessons have code, notes, categorized scenarios, and final snapshots", () => {
  assert.equal(new Set(searchAlgorithms.map((a) => a.slug)).size, 20);
  for (const { slug, category } of searchAlgorithms) {
    assert.ok(searchCategories.includes(category)); assert.ok(searchCode[slug]?.python && searchCode[slug]?.cpp);
    assert.equal(searchNotes[slug]?.pattern.length, 3);
    for (const scenario of searchScenarios(slug)) {
      assert.ok(scenario.steps.at(-1).done); assert.ok(scenario.steps.every((s) => s.title && s.explanation && s.action));
      assert.deepEqual(JSON.parse(JSON.stringify(scenario)), scenario, "scenario must be serializable");
    }
  }
});
test("traces agree with independent oracles and preserve input", () => {
  for (const { slug, input } of cases) { const before = structuredClone(input); checkCase(slug, input, last(slug, input)); assert.deepEqual(input, before); }
});
test("invalid partition ranks fail explicitly", () => {
  assert.throws(() => traceSearch("median-two-sorted-arrays", input([], { other: [] })), RangeError);
  for (const k of [0, 4]) assert.throws(() => traceSearch("kth-element-two-sorted-arrays", input([1], { other: [2], k })), RangeError);
});

const functions = {
  "binary-search": "binary_search", "lower-bound": "lower_bound", "upper-bound": "upper_bound", "first-last-occurrence": "equal_range", "search-rotated-array": "rotated_search", "search-rotated-array-duplicates": "rotated_search", "minimum-rotated-array": "rotated_minimum", "find-peak-element": "find_peak", "single-element-sorted-array": "single_element", "integer-square-root": "integer_sqrt", "nth-root": "nth_root", "search-2d-matrix": "search_matrix", "kth-smallest-sorted-matrix": "kth_smallest_matrix", "koko-eating-bananas": "minimum_speed", "ship-packages": "ship_capacity", "split-array-largest-sum": "split_largest_sum", "minimum-days-bouquets": "minimum_days", "aggressive-cows": "maximum_distance", "median-two-sorted-arrays": "median_two_sorted", "kth-element-two-sorted-arrays": "kth_two_sorted",
};
function args(slug, d) {
  if (slug === "integer-square-root") return [d.x];
  if (slug === "nth-root") return [d.x, d.p];
  if (slug === "search-2d-matrix") return [d.matrix, d.target];
  if (slug === "kth-smallest-sorted-matrix") return [d.matrix, d.k];
  if (slug === "median-two-sorted-arrays") return [d.values, d.other];
  if (slug === "kth-element-two-sorted-arrays") return [d.values, d.other, d.k];
  if (slug === "minimum-days-bouquets") return [d.values, d.m, d.k];
  return [d.values, ...(["koko-eating-bananas"].includes(slug) ? [d.h] : slug === "ship-packages" ? [d.days] : ["aggressive-cows", "split-array-largest-sum"].includes(slug) ? [d.k] : ["minimum-rotated-array", "find-peak-element", "single-element-sorted-array"].includes(slug) ? [] : [d.target])];
}
test("every published Python solution runs against fixtures and randomized cases", () => {
  const payload = cases.map(({ slug, input }) => ({ slug, args: args(slug, input) }));
  const result = spawnSync("python3", ["-c", `import json,sys\np=json.load(sys.stdin)\nenvs={}\nfor slug,source in p['code'].items():\n env={};exec(source['python'],env);envs[slug]=env\nout=[envs[c['slug']][p['functions'][c['slug']]](*c['args']) for c in p['cases']]\njson.dump(out,sys.stdout)`], { input: JSON.stringify({ cases: payload, code: searchCode, functions }), encoding: "utf8", maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  JSON.parse(result.stdout).forEach((answer, i) => checkCase(cases[i].slug, cases[i].input, answer));
});
test("every published C++17 solution compiles and runs the same cases", async () => {
  const directory = await mkdtemp(join(tmpdir(), "algoking-binary-search-"));
  try {
    const includes = [...new Set(Object.values(searchCode).flatMap(({ cpp }) => cpp.split("\n").filter((line) => line.startsWith("#include"))))].join("\n");
    const namespaces = searchAlgorithms.map(({ slug }, i) => `namespace lesson${i} {\n${searchCode[slug].cpp.replace(/^#include.*\n/gm, "")}\n}`).join("\n");
    const literal = (value, matrix = false) => Array.isArray(value) ? `std::vector<${matrix || Array.isArray(value[0]) ? "std::vector<int>" : "int"}>${JSON.stringify(value).replaceAll("[", "{").replaceAll("]", "}")}` : String(value);
    const lines = cases.map(({ slug, input }) => { const ns = `lesson${searchAlgorithms.findIndex((a) => a.slug === slug)}`; return `std::cout << dump(${ns}::${functions[slug]}(${args(slug, input).map((value, index) => literal(value, index === 0 && slug.includes("matrix"))).join(", ")})) << '\\n';`; });
    const helpers = `#include <iostream>\n#include <string>\nstd::string dump(int x) { return std::to_string(x); }\nstd::string dump(long long x) { return std::to_string(x); }\nstd::string dump(double x) { return std::to_string(x); }\nstd::string dump(bool x) { return x ? "true" : "false"; }\nstd::string dump(const std::array<int,3>& x) { return "[" + dump(x[0]) + "," + dump(x[1]) + "," + dump(x[2]) + "]"; }`;
    await writeFile(join(directory, "lessons.cpp"), `${includes}\n${namespaces}\n${helpers}\nint main() {\n${lines.join("\n")}\n}`);
    const compiled = spawnSync(process.env.CXX ?? "clang++", ["-std=c++17", ...(process.env.SDKROOT ? ["-isysroot", process.env.SDKROOT] : []), join(directory, "lessons.cpp"), "-o", join(directory, "lessons")], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 });
    assert.equal(compiled.status, 0, compiled.stderr);
    const run = spawnSync(join(directory, "lessons"), [], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 });
    assert.equal(run.status, 0, run.stderr);
    run.stdout.trim().split("\n").map(JSON.parse).forEach((answer, i) => checkCase(cases[i].slug, cases[i].input, answer));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
