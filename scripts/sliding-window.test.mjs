import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function loadTS(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { windowAlgorithms } = await loadTS("../lib/sliding-window-catalog.ts");
const { windowCode } = await loadTS("../lib/sliding-window-code.ts");
const { windowNotes } = await loadTS("../lib/sliding-window-lessons.ts");
const { traceWindow, windowScenarios } = await loadTS("../lib/sliding-window-traces.ts");
const answer = (slug, input) => traceWindow(slug, input).at(-1).result;

// Enumerate all nonempty contiguous ranges, independently of the window algorithm.
export function brute(slug, { values: a, k = 0, target = 0, pattern = "" }) {
  const windows = [];
  for (let l = 0; l < a.length; l++) for (let r = l; r < a.length; r++) {
    const values = a.slice(l, r + 1);
    windows.push({ l, values, length: values.length, distinct: new Set(values).size, sum: values.reduce((s, x) => s + Number(x), 0) });
  }
  const length = (items) => Math.max(0, ...items.map((w) => w.length));
  const sorted = [...pattern].sort().join("");
  const anagrams = windows.filter((w) => w.length === pattern.length && [...w.values].sort().join("") === sorted).map((w) => w.l);
  switch (slug) {
    case "maximum-sum-subarray-k": return Math.max(...windows.filter((w) => w.length === k).map((w) => w.sum));
    case "maximum-vowels": return Math.max(0, ...windows.filter((w) => w.length === k).map((w) => w.values.filter((x) => "aeiou".includes(x)).length));
    case "first-negative-in-window": return windows.filter((w) => w.length === k).map((w) => w.values.find((x) => x < 0) ?? 0);
    case "find-all-anagrams": return anagrams;
    case "permutation-in-string": return anagrams.length > 0;
    case "longest-substring-without-repeats": return length(windows.filter((w) => w.distinct === w.length));
    case "longest-substring-k-distinct": return length(windows.filter((w) => w.distinct <= k));
    case "longest-repeating-character-replacement": return length(windows.filter((w) => w.length - Math.max(...w.values.map((x) => w.values.filter((y) => x === y).length)) <= k));
    case "max-consecutive-ones-iii": return length(windows.filter((w) => w.values.filter((x) => x === 0).length <= k));
    case "minimum-size-subarray-sum": return Math.min(...windows.filter((w) => w.sum >= target).map((w) => w.length), Infinity) === Infinity ? 0 : Math.min(...windows.filter((w) => w.sum >= target).map((w) => w.length));
    case "minimum-window-substring": {
      if (!pattern) return "";
      const valid = windows.filter((w) => [...new Set(pattern)].every((x) => w.values.filter((y) => y === x).length >= [...pattern].filter((y) => y === x).length));
      valid.sort((a, b) => a.length - b.length || a.l - b.l);
      return valid[0]?.values.join("") ?? "";
    }
    case "subarrays-k-distinct": return windows.filter((w) => w.distinct === k).length;
    case "binary-subarrays-with-sum": return windows.filter((w) => w.sum === target).length;
    case "subarray-product-less-than-k": return windows.filter((w) => w.values.reduce((p, x) => p * x, 1) < k).length;
    case "sliding-window-maximum": return windows.filter((w) => w.length === k).map((w) => Math.max(...w.values));
    default: throw new Error(slug);
  }
}

test("15 complete lessons have code, notes, and two correct serializable traces", () => {
  assert.equal(windowAlgorithms.length, 15);
  assert.equal(new Set(windowAlgorithms.map((a) => a.slug)).size, 15);
  for (const { slug } of windowAlgorithms) {
    assert.ok(windowCode[slug].python && windowCode[slug].cpp);
    assert.equal(windowNotes[slug].pattern.length, 3);
    const scenarios = windowScenarios(slug);
    assert.equal(scenarios.length, 2);
    for (const scenario of scenarios) {
      assert.ok(scenario.steps.length > 1);
      assert.equal(scenario.steps.at(-1).done, true);
      assert.deepEqual(scenario.steps.at(-1).result, brute(slug, scenario), slug);
      assert.deepEqual(JSON.parse(JSON.stringify(scenario)), scenario);
      for (const step of scenario.steps) {
        assert.ok(step.left >= 0 && step.left <= scenario.values.length, slug);
        assert.ok(step.right >= -1 && step.right < scenario.values.length, slug);
        if (step.best) assert.ok(step.best[0] >= 0 && step.best[0] <= step.best[1] && step.best[1] < scenario.values.length);
      }
    }
  }
});

let seed = 2037;
const random = (limit) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % limit; };
export const randomCases = [];
for (let run = 0; run < 140; run++) for (const { slug } of windowAlgorithms) {
  const size = 1 + random(9), values = Array.from({ length: size }, () => random(9) - 4);
  let input = { id: "random", label: "Random", values, k: 1 + random(size), target: 1 + random(10) };
  if (["maximum-vowels", "find-all-anagrams", "permutation-in-string", "longest-substring-without-repeats", "longest-substring-k-distinct", "longest-repeating-character-replacement", "minimum-window-substring"].includes(slug)) {
    input.values = values.map(() => "abcdeiou"[random(8)]);
    input.pattern = Array.from({ length: 1 + random(size + 2) }, () => "abcdeiou"[random(8)]).join("");
    if (slug === "longest-substring-k-distinct") input.k = random(5);
    if (slug === "longest-repeating-character-replacement") { input.values = input.values.map((x) => x.toUpperCase()); input.k = random(4); }
  }
  if (["max-consecutive-ones-iii", "binary-subarrays-with-sum"].includes(slug)) { input.values = values.map(() => random(2)); input.k = random(4); input.target = random(5); }
  if (["minimum-size-subarray-sum", "subarray-product-less-than-k"].includes(slug)) { input.values = values.map(() => 1 + random(7)); input.k = random(40); }
  if (slug === "subarrays-k-distinct") input.k = random(5);
  randomCases.push({ slug, input, expected: brute(slug, input) });
}

test("all algorithms agree with exhaustive range enumeration on 2,100 inputs", () => {
  for (const { slug, input, expected } of randomCases) {
    const original = JSON.stringify(input);
    assert.deepEqual(answer(slug, input), expected, `${slug}: ${original}`);
    assert.equal(JSON.stringify(input), original, "must not mutate input");
  }
});

test("empty inputs, equal maxima, zero goals, absent covers, and complete windows", () => {
  for (const { slug } of windowAlgorithms.filter((a) => !["maximum-sum-subarray-k", "maximum-vowels", "first-negative-in-window", "sliding-window-maximum"].includes(a.slug))) {
    const input = { values: [], k: 0, target: 1, pattern: "a" };
    assert.deepEqual(answer(slug, input), brute(slug, input), slug);
  }
  assert.equal(answer("maximum-sum-subarray-k", { values: [-7, -5, -1], k: 3 }), -13);
  assert.equal(answer("minimum-window-substring", { values: [..."ABC"], pattern: "AA" }), "");
  assert.equal(answer("minimum-window-substring", { values: [..."ABC"], pattern: "" }), "");
  assert.deepEqual(answer("sliding-window-maximum", { values: [5, 5, 5], k: 2 }), [5, 5]);
  assert.equal(answer("binary-subarrays-with-sum", { values: [0, 0, 0, 0], target: 0 }), 10);
  assert.equal(answer("longest-substring-without-repeats", { values: [..."abba"] }), 2);
});

test("published Python and C++ implementations match the independent oracle", { skip: !process.env.ALGOKING_VERIFY_SNIPPETS }, async () => {
  const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { spawnSync } = await import("node:child_process");
  const directory = await mkdtemp(join(tmpdir(), "algoking-window-"));
  const functions = ["max_window_sum", "max_vowels", "first_negatives", "find_anagrams", "contains_permutation", "longest_unique", "longest_k_distinct", "character_replacement", "longest_ones", "min_subarray_length", "min_window", "exactly_k_distinct", "binary_subarrays_sum", "product_below_k", "window_maxima"];
  const strings = new Set([1, 3, 4, 5, 6, 7, 10]);
  const patterns = new Set([3, 4, 10]);
  const targets = new Set([9, 12]);
  const cases = [...randomCases, ...windowAlgorithms.flatMap(({ slug }) => windowScenarios(slug).map((input) => ({ slug, input, expected: brute(slug, input) })))].map((item) => {
    const index = windowAlgorithms.findIndex(({ slug }) => slug === item.slug);
    const args = [strings.has(index) ? item.input.values.join("") : item.input.values];
    if (patterns.has(index)) args.push(item.input.pattern);
    else if (targets.has(index)) args.push(item.input.target);
    else if (index !== 5) args.push(item.input.k);
    return { ...item, index, args, fn: functions[index] };
  });
  const run = (cmd, args) => {
    const execution = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
    assert.ifError(execution.error);
    assert.equal(execution.status, 0, execution.stderr);
    return execution.stdout;
  };
  try {
    await writeFile(join(directory, "fixtures.json"), JSON.stringify({ code: windowCode, cases }));
    await writeFile(join(directory, "verify.py"), `import json, sys\ndata = json.load(open(sys.argv[1]))\nscopes = {}\nfor slug, source in data['code'].items():\n    scope = {}\n    exec(source['python'], scope)\n    scopes[slug] = scope\nfor case in data['cases']:\n    got = scopes[case['slug']][case['fn']](*case['args'])\n    assert got == case['expected'], (case, got)\nprint(len(data['cases']))\n`);
    assert.equal(Number(run("python3", [join(directory, "verify.py"), join(directory, "fixtures.json")])), cases.length);
    const sources = windowAlgorithms.map(({ slug }, index) => `namespace lesson${index} {\n${windowCode[slug].cpp.split("using namespace std;\n\n")[1]}\n}`).join("\n");
    const literal = (arg) => Array.isArray(arg) ? `vector<int>{${arg.join(",")}}` : JSON.stringify(arg);
    const calls = cases.map(({ index, fn, args }) => `emit(lesson${index}::${fn}(${args.map(literal).join(",")})); cout << '\\n';`).join("\n");
    const includes = windowCode[windowAlgorithms[0].slug].cpp.split("using namespace std;")[0];
    await writeFile(join(directory, "verify.cpp"), `${includes}\n#include <iostream>\n#include <iomanip>\nusing namespace std;\ntemplate<class T> void emit(T x) { cout << boolalpha << x; }\nvoid emit(const string& x) { cout << quoted(x); }\nvoid emit(const vector<int>& xs) { cout << '['; for (int i=0; i<(int)xs.size(); ++i) { if(i) cout << ','; cout << xs[i]; } cout << ']'; }\n${sources}\nint main() {\n${calls}\n}\n`);
    run(process.env.CXX ?? "c++", ["-std=c++17", "-O0", join(directory, "verify.cpp"), "-o", join(directory, "verify")]);
    const output = run(join(directory, "verify"), []).trim().split("\n").map((line) => JSON.parse(line));
    assert.deepEqual(output, cases.map(({ expected }) => expected));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
