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
const { treeAlgorithms } = await load("../lib/tree-catalog.ts");
const { treeCode } = await load("../lib/tree-code.ts");
const { treeLessonNotes } = await load("../lib/tree-lessons.ts");
const { treeInput, treeScenarios, traceTree } = await load("../lib/tree-traces.ts");
const last = (steps) => steps.at(-1);
function shape(nodes, root) { return root === null ? null : [nodes[root].value, shape(nodes, nodes[root].left), shape(nodes, nodes[root].right)]; }
function ordered(input, order = "in") {
  const out = [];
  function visit(u) { if (u === null) return; if (order === "pre") out.push(input.nodes[u].value); visit(input.nodes[u].left); if (order === "in") out.push(input.nodes[u].value); visit(input.nodes[u].right); if (order === "post") out.push(input.nodes[u].value); }
  visit(input.root); return out;
}
function paths(input) {
  const out = [];
  function visit(u, path) { if (u === null) return; const n = input.nodes[u], next = [...path, n.value]; if (n.left === null && n.right === null) out.push(next); visit(n.left, next); visit(n.right, next); } visit(input.root, []); return out;
}
function adjacency(input) {
  const out = input.nodes.map(() => []);
  for (const node of input.nodes) for (const child of [node.left, node.right]) if (child !== null) { out[node.id].push(child); out[child].push(node.id); }
  return out;
}
function bruteMetric(input, sum) {
  let best = sum ? -Infinity : 0; const adj = adjacency(input);
  for (const node of input.nodes) {
    const todo = [[node.id, -1, sum ? node.value : 0]];
    while (todo.length) { const [u, prev, score] = todo.pop(); best = Math.max(best, score); for (const v of adj[u]) if (v !== prev) todo.push([v, u, score + (sum ? input.nodes[v].value : 1)]); }
  }
  return best;
}
const expectedFixtures = {
  "tree-preorder": [["8", "4", "2", "6", "12", "10", "14"], ["3", "2", "1"]],
  "tree-inorder": [["2", "4", "6", "8", "10", "12", "14"], ["3", "2", "1"]],
  "tree-postorder": [["2", "6", "4", "10", "14", "12", "8"], ["1", "2", "3"]],
  "tree-level-order": [["[8]", "[4, 12]", "[2, 6, 10, 14]"], ["[3]", "[2]", "[1]"]],
  "tree-zigzag": [["[8]", "[12, 4]", "[2, 6, 10, 14]"], ["[3]", "[2]", "[1]"]],
  "tree-morris": [["2", "4", "6", "8", "10", "12", "14"], ["3", "2", "1"]],
  "tree-height": [["3"], ["3"]], "tree-balanced": [["true"], ["false"]], "tree-diameter": [["4"], ["2"]],
  "tree-max-path-sum": [["42"], ["-2"]], "tree-symmetric": [["true"], ["false"]], "tree-count-complete": [["7"], ["6"]],
  "tree-root-paths": [["8 → 4 → 2", "8 → 4 → 6", "8 → 12 → 10", "8 → 12 → 14"], ["5"]],
  "tree-path-sum": [["true"], ["false"]], "tree-lca": [["B:4"], ["B:4"]], "tree-distance-k": [["12"], []],
  "tree-right-view": [["8", "12", "14"], ["3", "2", "1"]], "tree-boundary": [["8", "4", "2", "6", "10", "14", "12"], ["3", "1", "2"]],
  "tree-vertical": [["[4]", "[2]", "[1, 5, 9]", "[3]", "[6]"], ["[3]", "[2]", "[1]"]],
  "bst-search": [["F:10"], ["null"]], "bst-validate": [["true"], ["false"]], "bst-kth-smallest": [["6"], ["null"]],
  "tree-serialize": [["8,4,2,#,#,6,#,#,12,10,#,#,14,#,#"], ["1,#,2,3,#,#,#"]],
};

test("all 28 lessons have complete content and independent serializable snapshots", () => {
  assert.equal(treeAlgorithms.length, 28);
  assert.equal(new Set(treeAlgorithms.map((a) => a.slug)).size, 28);
  for (const { slug } of treeAlgorithms) {
    assert.ok(treeCode[slug].python && treeCode[slug].cpp, slug);
    assert.equal(treeLessonNotes[slug].pattern.length, 3);
    for (const field of ["challenge", "condition", "example", "approach", "complexity", "pitfalls"]) assert.ok(treeLessonNotes[slug][field], `${slug}: ${field}`);
    const scenarios = treeScenarios(slug); assert.equal(scenarios.length, 2);
    for (const [i, scenario] of scenarios.entries()) {
      const { steps } = scenario;
      assert.ok(steps.length > 1); assert.ok(last(steps).done); assert.deepEqual(JSON.parse(JSON.stringify(scenario)), scenario);
      for (const step of steps) { for (const u of [...step.active, ...step.frontier.map((n) => n.charCodeAt(0) - 65)]) assert.ok(step.nodes[u], `${slug}: invalid node ${u}`); }
      if (expectedFixtures[slug]) assert.deepEqual(last(steps).result, expectedFixtures[slug][i], `${slug} scenario ${i}`);
      if (steps[0].nodes.length) { const value = steps[0].nodes[0].value; last(steps).nodes[0].value = 999; assert.equal(steps[0].nodes[0].value, value); }
    }
  }
});

let seed = 1337;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; }
function randomTree() {
  const size = Math.floor(random() * 10), nodes = [], open = [];
  for (let id = 0; id < size; id++) {
    const node = { id, value: Math.floor(random() * 21) - 10, left: null, right: null }; nodes.push(node);
    if (id) { const i = Math.floor(random() * open.length), [parent, side] = open.splice(i, 1)[0]; nodes[parent][side] = id; }
    open.push([id, "left"], [id, "right"]);
  }
  return { nodes, root: size ? 0 : null };
}

test("random traversals, diameter, maximum sum, paths, symmetry and mutations match independent oracles", () => {
  for (let i = 0; i < 65; i++) {
    const input = randomTree(), before = structuredClone(input), pre = ordered(input, "pre");
    for (const [slug, order] of [["tree-preorder", "pre"], ["tree-inorder", "in"], ["tree-postorder", "post"], ["tree-morris", "in"]]) {
      const end = last(traceTree(slug, input)); assert.deepEqual(end.result, ordered(input, order).map(String), slug); assert.deepEqual(shape(end.nodes, end.root), shape(input.nodes, input.root)); assert.equal(end.threads.length, 0);
    }
    assert.deepEqual(last(traceTree("tree-diameter", input)).result, [String(bruteMetric(input, false))]);
    assert.deepEqual(last(traceTree("tree-max-path-sum", input)).result, [input.root === null ? "null" : String(bruteMetric(input, true))]);
    assert.deepEqual(last(traceTree("tree-root-paths", input)).result, paths(input).map((p) => p.join(" → ")));
    const sum = Math.floor(random() * 25) - 12;
    assert.deepEqual(last(traceTree("tree-path-sum", { ...input, sum })).result, [String(paths(input).some((p) => p.reduce((a, b) => a + b, 0) === sum))]);
    const flat = last(traceTree("tree-flatten", input)); let u = flat.root, values = []; const ids = new Set();
    while (u !== null) { assert.ok(!ids.has(u)); ids.add(u); assert.equal(flat.nodes[u].left, null); values.push(flat.nodes[u].value); u = flat.nodes[u].right; }
    assert.deepEqual(values, pre); assert.equal(ids.size, input.nodes.length);
    const inverted = last(traceTree("tree-invert", input)); const twice = last(traceTree("tree-invert", inverted)); assert.deepEqual(shape(twice.nodes, twice.root), shape(input.nodes, input.root));
    const decoded = last(traceTree("tree-serialize", input)); assert.deepEqual(shape(decoded.nodes, decoded.root), shape(input.nodes, input.root));
    const reversed = (s) => s === null ? null : [s[0], reversed(s[2]), reversed(s[1])]; const original = shape(input.nodes, input.root);
    assert.deepEqual(last(traceTree("tree-symmetric", input)).result, [String(JSON.stringify(original) === JSON.stringify(reversed(original)))]);
    if (input.nodes.length) {
      const target = Math.floor(random() * input.nodes.length), k = Math.floor(random() * 6), adj = adjacency(input), dist = new Map([[target, 0]]), queue = [target];
      for (const v of queue) for (const next of adj[v]) if (!dist.has(next)) { dist.set(next, dist.get(v) + 1); queue.push(next); }
      const expected = [...dist].filter(([, d]) => d === k).map(([v]) => String(input.nodes[v].value)).sort();
      assert.deepEqual(last(traceTree("tree-distance-k", { ...input, target, k })).result.sort(), expected);
    }
    assert.deepEqual(input, before, "trace must not mutate its input");
  }
});

test("complete counts, BST updates and empty inputs", () => {
  for (let n = 0; n < 80; n++) assert.deepEqual(last(traceTree("tree-count-complete", treeInput(Array.from({ length: n }, (_, i) => i)))).result, [String(n)]);
  for (const { slug } of treeAlgorithms) {
    const empty = treeInput([]); const end = last(traceTree(slug, { ...empty, k: 1, key: 3, sum: 0 })); assert.ok(end.done, slug);
  }
  let input = treeInput([]), keys = new Set();
  for (let i = 0; i < 45; i++) {
    const key = Math.floor(random() * 30), end = last(traceTree("bst-insert", { ...input, key })); input = { nodes: end.nodes, root: end.root }; keys.add(key);
    assert.deepEqual(ordered(input), [...keys].sort((a, b) => a - b)); assert.deepEqual(last(traceTree("bst-validate", input)).result, ["true"]);
  }
  for (const key of [...keys, -999]) { const end = last(traceTree("bst-delete", { ...input, key })); input = { nodes: end.nodes, root: end.root }; keys.delete(key); assert.deepEqual(ordered(input), [...keys].sort((a, b) => a - b)); }
  assert.equal(input.root, null);
  const duplicate = treeInput([2, 2, 3]); assert.deepEqual(last(traceTree("bst-validate", duplicate)).result, ["false"]);
});

const functions = {
  "tree-preorder": "preorder", "tree-inorder": "inorder", "tree-postorder": "postorder", "tree-level-order": "level_order", "tree-zigzag": "zigzag", "tree-morris": "morris_inorder", "tree-height": "height", "tree-balanced": "is_balanced", "tree-diameter": "diameter", "tree-max-path-sum": "max_path_sum", "tree-symmetric": "is_symmetric", "tree-invert": "invert", "tree-count-complete": "count_complete", "tree-root-paths": "root_paths", "tree-path-sum": "has_path_sum", "tree-lca": "lowest_common_ancestor", "tree-distance-k": "distance_k", "tree-right-view": "right_view", "tree-boundary": "boundary", "tree-vertical": "vertical_order", "bst-search": "bst_search", "bst-insert": "bst_insert", "bst-delete": "bst_delete", "bst-validate": "is_valid_bst", "bst-kth-smallest": "kth_smallest", "tree-build": "build_tree", "tree-serialize": "serialize", "tree-flatten": "flatten",
};
const cases = treeAlgorithms.flatMap(({ slug }) => treeScenarios(slug).map((scenario) => ({ slug, input: scenario })));
// Every source snippet also gets empty-tree coverage.
for (const { slug } of treeAlgorithms) cases.push({ slug, input: { ...treeInput([]), k: 1, key: 3, sum: 0 } });
function expected(slug, input) {
  const end = last(traceTree(slug, input));
  if (["tree-invert", "bst-insert", "bst-delete", "tree-build", "tree-flatten"].includes(slug)) return shape(end.nodes, end.root);
  if (slug === "tree-serialize") return { encoded: end.result[0], shape: shape(end.nodes, end.root) };
  if (["bst-search", "tree-lca"].includes(slug)) return end.result[0] === "null" ? null : Number(end.result[0].split(":")[1]);
  if (slug === "tree-root-paths") return paths(input);
  if (["tree-level-order", "tree-zigzag", "tree-vertical"].includes(slug)) return end.result.map((row) => JSON.parse(row));
  if (["tree-balanced", "tree-symmetric", "tree-path-sum", "bst-validate"].includes(slug)) return end.result[0] === "true";
  if (["tree-height", "tree-diameter", "tree-max-path-sum", "tree-count-complete", "bst-kth-smallest"].includes(slug)) return end.result[0] === "null" ? null : Number(end.result[0]);
  return end.result.map(Number);
}

test("published Python snippets execute and agree with every walkthrough, including empty trees", () => {
  const python = `
import json, sys
payload = json.load(sys.stdin)
def shape(n):
    return None if n is None else [n.value, shape(n.left), shape(n.right)]
def order(n, pre):
    if n is None: return []
    return ([n.value] if pre else []) + order(n.left, pre) + ([] if pre else [n.value]) + order(n.right, pre)
out = []
for case in payload['cases']:
    slug, data = case['slug'], case['input']
    env = {}; exec(payload['code'][slug]['python'], env)
    nodes = [env['Node'](n['value']) for n in data['nodes']]
    for n in data['nodes']:
        nodes[n['id']].left = None if n['left'] is None else nodes[n['left']]
        nodes[n['id']].right = None if n['right'] is None else nodes[n['right']]
    root = None if data['root'] is None else nodes[data['root']]
    args = [root]
    if slug in ['bst-search', 'bst-insert', 'bst-delete']: args += [data.get('key', 0)]
    if slug in ['bst-kth-smallest']: args += [data.get('k', 1)]
    if slug == 'tree-path-sum': args += [data.get('sum', 0)]
    if slug == 'tree-lca': args += [nodes[data['target']] if nodes else None, nodes[data['other']] if nodes else None]
    if slug == 'tree-distance-k': args += [nodes[data['target']] if nodes else None, data.get('k', 0)]
    if slug == 'tree-build': args = [order(root, True), order(root, False)]
    before = shape(root)
    answer = env[payload['functions'][slug]](*args)
    if slug in ['tree-invert','bst-insert','bst-delete','tree-build','tree-flatten']: answer = shape(answer)
    elif slug == 'tree-serialize': answer = {'encoded': answer, 'shape': shape(env['deserialize'](answer))}
    elif slug in ['bst-search','tree-lca']: answer = None if answer is None else answer.value
    if slug == 'tree-morris': assert before == shape(root), 'Morris must restore pointers'
    out.append(answer)
json.dump(out, sys.stdout)
`;
  const result = spawnSync("python3", ["-c", python], { input: JSON.stringify({ cases, code: treeCode, functions }), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  JSON.parse(result.stdout).forEach((answer, i) => assert.deepEqual(answer, expected(cases[i].slug, cases[i].input), `${cases[i].slug} case ${i}`));
});

test("published C++17 snippets compile and execute against the same fixtures", async () => {
  const directory = await mkdtemp(join(tmpdir(), "algoking-trees-"));
  try {
    const includes = treeCode["tree-preorder"].cpp.split("\n").filter((line) => line.startsWith("#include")).join("\n");
    const namespaces = treeAlgorithms.map(({ slug }, i) => `namespace lesson${i} {\n${treeCode[slug].cpp.replace(/^#include.*\n/gm, "")}\n}`).join("\n");
    const helpers = `
using namespace std;
template<class N> string shape(N* n) { return n ? "[" + to_string(n->value) + "," + shape(n->left) + "," + shape(n->right) + "]" : "null"; }
string dump(long long x) { return to_string(x); }
string dump(int x) { return to_string(x); }
string dump(bool x) { return x ? "true" : "false"; }
template<class T> string dump(const vector<T>& v);
template<class T> string dump(const optional<T>& v) { return v ? dump(*v) : "null"; }
template<class T> string dump(const vector<T>& v) { string s = "["; for (const auto& x : v) { if (s.size() > 1) s += ","; s += dump(x); } return s + "]"; }
`;
    const checks = cases.map(({ slug, input }, ci) => {
      const ns = `lesson${treeAlgorithms.findIndex((a) => a.slug === slug)}`, init = input.nodes.map((n) => `nodes.push_back(new ${ns}::Node(${n.value}));`).join("\n");
      const links = input.nodes.map((n) => `nodes[${n.id}]->left = ${n.left === null ? "nullptr" : `nodes[${n.left}]`}; nodes[${n.id}]->right = ${n.right === null ? "nullptr" : `nodes[${n.right}]`};`).join("\n");
      const nodeArg = (id) => id === undefined ? "nullptr" : `nodes[${id}]`;
      let args = "root";
      if (["bst-search", "bst-insert", "bst-delete"].includes(slug)) args += `, ${input.key ?? 0}`;
      if (slug === "bst-kth-smallest") args += `, ${input.k ?? 1}`;
      if (slug === "tree-path-sum") args += `, ${input.sum ?? 0}`;
      if (slug === "tree-lca") args += `, ${nodeArg(input.target)}, ${nodeArg(input.other)}`;
      if (slug === "tree-distance-k") args += `, ${nodeArg(input.target)}, ${input.k ?? 0}`;
      if (slug === "tree-build") args = `vector<long long>{${ordered(input, "pre")}}, vector<long long>{${ordered(input)}}`;
      let call = `${ns}::${functions[slug]}(${args})`, check;
      const want = expected(slug, input), literal = JSON.stringify(JSON.stringify(want));
      if (["tree-invert", "bst-insert", "bst-delete", "tree-build", "tree-flatten"].includes(slug)) check = `shape(${call}) == ${literal}`;
      else if (slug === "tree-serialize") check = `${call} == ${JSON.stringify(want.encoded)} && shape(${ns}::deserialize(${call})) == ${JSON.stringify(JSON.stringify(want.shape))}`;
      else if (["bst-search", "tree-lca"].includes(slug)) check = `([&] { auto n = ${call}; return n ? to_string(n->value) : string("null"); }()) == ${literal}`;
      else check = `dump(${call}) == ${literal}`;
      return `{ vector<${ns}::Node*> nodes; ${init}\n${links}\n auto root = ${input.root === null ? `static_cast<${ns}::Node*>(nullptr)` : `nodes[${input.root}]`}; if (!(${check})) return ${ci + 1}; }`;
    }).join("\n");
    const path = join(directory, "lessons.cpp"), binary = join(directory, "lessons");
    await writeFile(path, `${includes}\n${namespaces}\n${helpers}\nint main() {\n${checks}\nreturn 0; }`);
    const build = spawnSync(process.env.CXX ?? "clang++", ["-std=c++17", ...(process.env.SDKROOT ? ["-isysroot", process.env.SDKROOT] : []), path, "-o", binary], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 });
    assert.equal(build.status, 0, build.stderr);
    const run = spawnSync(binary, [], { encoding: "utf8" });
    assert.equal(run.status, 0, `C++ case ${run.status}: ${cases[run.status - 1]?.slug}\n${run.stderr}`);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
