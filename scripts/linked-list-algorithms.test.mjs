import assert from "node:assert/strict";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function load(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const [{ linkedListAlgorithms: catalog }, { linkedListCode: code }, { linkedListLessonNotes: notes }, { linkedListScenarios, traceLinkedList }] = await Promise.all([
  load("../lib/linked-list-catalog.ts"), load("../lib/linked-list-code.ts"), load("../lib/linked-list-lessons.ts"), load("../lib/linked-list-traces.ts"),
]);
const last = (steps) => steps.at(-1);
const values = (step) => step.output.map((id) => step.nodes.find((node) => node.id === id).value);
const chain = (step, start) => {
  const ids = [], seen = new Set();
  while (start !== null) {
    assert.ok(!seen.has(start), `Unexpected cycle at ${start}`); seen.add(start); ids.push(start);
    start = step.nodes.find((node) => node.id === start).next;
  }
  return ids;
};
let seed = 9124;
const random = (n) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
const sorted = (a) => [...a].sort((a, b) => a - b);
const cases = [];
function add(slug, input, expected, answer = null) { cases.push({ slug, input, expected, answer }); }
for (let trial = 0; trial < 60; trial++) {
  const a = Array.from({ length: trial < 9 ? trial : random(9) }, () => random(9) - 3);
  const b = Array.from({ length: random(7) }, () => random(9) - 3);
  const target = random(9) - 3, position = random(a.length + 3) - 1, deleteAt = random(a.length + 3) - 1;
  add("linked-list-traversal", { lists: [a], target }, a.includes(target) ? [target] : [], a.indexOf(target));
  const inserted = [...a]; if (position >= 0 && position <= a.length) inserted.splice(position, 0, 8);
  if (deleteAt >= 0 && deleteAt < inserted.length) inserted.splice(deleteAt, 1);
  add("linked-list-insert-delete", { lists: [a], insertAt: position, insertValue: 8, deleteAt }, inserted);
  add("reverse-linked-list", { lists: [a] }, [...a].reverse());
  add("middle-of-linked-list", { lists: [a] }, a.length ? [a[Math.floor(a.length / 2)]] : [], a.length ? `A${Math.floor(a.length / 2) + 1}` : null);
  const cycleAt = a.length && trial % 3 !== 0 ? random(a.length) : -1;
  add("linked-list-cycle", { lists: [a], cycleAt }, [], cycleAt >= 0);
  add("linked-list-cycle-entry", { lists: [a], cycleAt }, cycleAt >= 0 ? [a[cycleAt]] : [], cycleAt >= 0 ? `A${cycleAt + 1}` : null);
  add("merge-two-sorted-lists", { lists: [sorted(a), sorted(b)] }, sorted([...a, ...b]));
  const n = random(a.length + 4) - 1, removed = [...a];
  if (n > 0 && n <= a.length) removed.splice(a.length - n, 1);
  add("remove-nth-node-from-end", { lists: [a], n }, removed);
  const sharedAt = a.length && trial % 2 ? random(a.length) : -1;
  add("intersection-of-linked-lists", { lists: [a, b], sharedAt }, sharedAt >= 0 ? [a[sharedAt]] : [], sharedAt >= 0 ? `A${sharedAt + 1}` : null);
  // Exercise both true and false palindrome paths, plus restoration on mismatch.
  const palindrome = trial % 2 ? [...a, ...[...a].reverse()] : a;
  add("palindrome-linked-list", { lists: [palindrome] }, palindrome, palindrome.every((v, i) => v === palindrome[palindrome.length - i - 1]));
  add("remove-sorted-list-duplicates", { lists: [sorted(a)] }, [...new Set(sorted(a))]);
  const digitsA = a.map((v) => Math.abs(v)), digitsB = b.map((v) => Math.abs(v));
  const integer = (digits) => BigInt([...digits].reverse().join("") || "0");
  // Preserve high zero digits because the input representation permits them.
  let sum = integer(digitsA) + integer(digitsB), sumDigits = [];
  for (let i = 0; i < Math.max(digitsA.length, digitsB.length) || sum > 0n || !sumDigits.length; i++) { sumDigits.push(Number(sum % 10n)); sum /= 10n; }
  add("add-two-linked-list-numbers", { lists: [digitsA, digitsB] }, sumDigits);
  const reordered = []; for (let l = 0, r = a.length - 1; l <= r; l++, r--) { reordered.push(a[l]); if (l !== r) reordered.push(a[r]); }
  add("reorder-linked-list", { lists: [a] }, reordered);
  const k = random(30), shift = a.length ? k % a.length : 0;
  add("rotate-linked-list", { lists: [a], k }, shift ? [...a.slice(-shift), ...a.slice(0, -shift)] : a);
  const group = 1 + random(10), grouped = [];
  for (let i = 0; i < a.length; i += group) { const part = a.slice(i, i + group); grouped.push(...(part.length === group ? part.reverse() : part)); }
  add("reverse-nodes-in-k-group", { lists: [a], k: group }, grouped);
  add("copy-list-with-random-pointer", { lists: [a], random: a.map(() => random(a.length + 1)).map((index) => index === a.length ? null : index) }, a);
  const lists = [sorted(a), sorted(b), [], sorted(a.slice(0, 2))];
  add("merge-k-sorted-lists", { lists: trial === 0 ? [] : lists }, trial === 0 ? [] : sorted(lists.flat()));
  add("sort-linked-list", { lists: [a] }, sorted(a));
}
// Carry across every position and allocate a final digit.
add("add-two-linked-list-numbers", { lists: [[9, 9, 9], [1]] }, [0, 0, 0, 1]);

function checkSteps(steps) {
  assert.ok(steps.length >= 2); assert.equal(last(steps).done, true);
  assert.doesNotThrow(() => JSON.stringify(steps));
  for (const step of steps) {
    const ids = new Set(step.nodes.map((node) => node.id)); assert.equal(ids.size, step.nodes.length);
    for (const node of step.nodes) for (const target of [node.next, node.random ?? null]) assert.ok(target === null || ids.has(target));
    for (const target of [...Object.values(step.pointers), ...step.active, ...step.changed]) assert.ok(target === null || ids.has(target));
  }
}

test("18 lessons each have complete notes, standalone code and at least two walkthroughs", () => {
  assert.equal(catalog.length, 18); assert.equal(new Set(catalog.map((a) => a.slug)).size, 18);
  for (const { slug } of catalog) {
    assert.ok(code[slug].python && code[slug].cpp); assert.equal(notes[slug].pattern.length, 3);
    const scenarios = linkedListScenarios(slug); assert.ok(scenarios.length >= 2);
    for (const scenario of scenarios) checkSteps(scenario.steps);
  }
});

test("generated pointer traces agree with independent results across 1,081 edge and randomized cases", () => {
  for (const c of cases) {
    const steps = traceLinkedList(c.slug, c.input), end = last(steps); checkSteps(steps);
    assert.deepEqual(values(end), c.expected, `${c.slug}: ${JSON.stringify(c.input)}`);
    assert.equal(end.answer, c.answer, c.slug);
    if (end.pointers.result !== undefined && c.answer === null) assert.deepEqual(chain(end, end.pointers.result), end.output, c.slug);
    if (c.slug === "palindrome-linked-list") assert.deepEqual(end.nodes, steps[0].nodes, "Palindrome must restore all links");
    if (c.slug === "copy-list-with-random-pointer") {
      const originals = end.nodes.filter((node) => node.id.startsWith("A")), copies = end.nodes.filter((node) => node.id.startsWith("C"));
      assert.deepEqual(originals, steps[0].nodes);
      for (const [i, copy] of copies.entries()) {
        assert.equal(copy.random, c.input.random[i] === null ? null : `C${c.input.random[i] + 1}`);
        assert.ok(copy.next === null || copy.next.startsWith("C"));
      }
    }
    if (["reverse-linked-list", "reorder-linked-list", "rotate-linked-list", "reverse-nodes-in-k-group", "sort-linked-list"].includes(c.slug)) {
      assert.deepEqual([...end.output].sort(), steps[0].nodes.map((node) => node.id).sort(), "Relinking must preserve every node identity");
    }
  }
});

const pythonHarness = `
import json, sys
sources, cases = json.load(sys.stdin)
modules = {}
for slug, source in sources.items():
    env = {}; exec(source['python'], env); modules[slug] = env

def build(Node, values):
    nodes = [Node(v) for v in values]
    for a, b in zip(nodes, nodes[1:]): a.next = b
    return nodes, nodes[0] if nodes else None

def values(head):
    out, seen = [], set()
    while head:
        assert head not in seen, 'Unexpected result cycle'
        seen.add(head); out.append(head.val); head = head.next
    return out

for case in cases:
    slug, data = case['slug'], case['input']; env = modules[slug]; Node = env['Node']
    pairs = [build(Node, a) for a in data['lists']]
    nodes, head = pairs[0] if pairs else ([], None)
    head_b = pairs[1][1] if len(pairs) > 1 else None
    cycle = data.get('cycleAt', -1)
    if cycle >= 0: nodes[-1].next = nodes[cycle]
    shared = data.get('sharedAt', -1)
    if shared >= 0:
        if pairs[1][0]: pairs[1][0][-1].next = nodes[shared]
        else: head_b = nodes[shared]
    if slug == 'linked-list-traversal':
        assert env['search'](head, data['target']) == case['answer']; continue
    if slug == 'middle-of-linked-list':
        assert env['middle'](head) is (nodes[len(nodes)//2] if nodes else None); continue
    if slug == 'linked-list-cycle':
        assert env['has_cycle'](head) == (cycle >= 0); continue
    if slug == 'linked-list-cycle-entry':
        assert env['cycle_entry'](head) is (nodes[cycle] if cycle >= 0 else None); continue
    if slug == 'intersection-of-linked-lists':
        assert env['intersection'](head, head_b) is (nodes[shared] if shared >= 0 else None); continue
    if slug == 'palindrome-linked-list':
        links = [node.next for node in nodes]
        assert env['is_palindrome'](head) == case['answer']
        assert links == [node.next for node in nodes]
        continue
    if slug == 'copy-list-with-random-pointer':
        for node, index in zip(nodes, data['random']): node.random = nodes[index] if index is not None else None
        links = [(node.next, node.random) for node in nodes]
        result = env['copy_random'](head); copied = []; curr = result
        while curr:
            assert curr not in nodes and curr not in copied
            copied.append(curr); curr = curr.next
        assert len(copied) == len(nodes)
        for i, node in enumerate(copied):
            index = data['random'][i]
            assert node.random is (copied[index] if index is not None else None)
        assert links == [(node.next, node.random) for node in nodes]
    elif slug == 'linked-list-insert-delete': result = env['delete_at'](env['insert_at'](head, data['insertAt'], data['insertValue']), data['deleteAt'])
    elif slug == 'reverse-linked-list': result = env['reverse'](head)
    elif slug == 'merge-two-sorted-lists': result = env['merge'](head, head_b)
    elif slug == 'remove-nth-node-from-end': result = env['remove_nth'](head, data['n'])
    elif slug == 'remove-sorted-list-duplicates': result = env['deduplicate'](head)
    elif slug == 'add-two-linked-list-numbers':
        before = [values(head), values(head_b)]
        result = env['add_numbers'](head, head_b)
        assert before == [values(head), values(head_b)]
    elif slug == 'reorder-linked-list': result = env['reorder'](head)
    elif slug == 'rotate-linked-list': result = env['rotate_right'](head, data['k'])
    elif slug == 'reverse-nodes-in-k-group': result = env['reverse_k_group'](head, data['k'])
    elif slug == 'merge-k-sorted-lists': result = env['merge_k']([p[1] for p in pairs])
    elif slug == 'sort-linked-list': result = env['sort_list'](head)
    else: raise AssertionError(slug)
    assert values(result) == case['expected'], (slug, data, values(result), case['expected'])
print(str(len(cases)) + ' Python cases passed')
`;

test("published Python snippets execute correctly, including identity and restoration contracts", { skip: process.env.ALGOKING_VERIFY_SNIPPETS !== "1" ? "Set ALGOKING_VERIFY_SNIPPETS=1 to execute Python/C++ sources" : false }, () => {
  const result = execFileSync("python3", ["-c", pythonHarness], { input: JSON.stringify([code, cases]), timeout: 30000, encoding: "utf8" });
  assert.match(result, /1081 Python cases passed/);
});

const verifySnippets = process.env.ALGOKING_VERIFY_SNIPPETS === "1";
const cppVector = (values) => `std::vector<int>{${values.join(",")}}`;
test("all published C++17 snippets compile and pass the same generated cases", { skip: !verifySnippets ? "Set ALGOKING_VERIFY_SNIPPETS=1 to execute Python/C++ sources" : false }, async () => {
  const temp = await mkdtemp(join(tmpdir(), "algoking-linked-lists-"));
  try {
    let source = '#include <cassert>\n#include <vector>\n#include <queue>\n#include <unordered_map>\n#include <unordered_set>\n#include <iostream>\n';
    catalog.forEach(({ slug }, index) => { source += `namespace lesson${index} {\n${code[slug].cpp.replace(/^#include.*$/gm, "")}\n}\n`; });
    source += `
template<class Node> std::vector<Node*> build(std::vector<int> values) {
    std::vector<Node*> nodes;
    for (int value : values) nodes.push_back(new Node(value));
    for (size_t i = 1; i < nodes.size(); ++i) nodes[i-1]->next = nodes[i];
    return nodes;
}
template<class Node> std::vector<int> values(Node* head) {
    std::vector<int> result; std::unordered_set<Node*> seen;
    while (head) { assert(seen.insert(head).second); result.push_back(head->val); head = head->next; }
    return result;
}
int main() {\n`;
    for (const c of cases) {
      const i = catalog.findIndex(({ slug }) => slug === c.slug), d = c.input;
      source += `{ using namespace lesson${i};\n`;
      (d.lists.length ? d.lists : [[]]).forEach((list, j) => { source += `auto list${j} = build<Node>(${cppVector(list)}); Node* h${j} = list${j}.empty() ? nullptr : list${j}[0];\n`; });
      let expression;
      switch (c.slug) {
        case "linked-list-traversal": source += `assert(search(h0, ${d.target}) == ${c.answer});\n`; break;
        case "middle-of-linked-list": source += `assert(middle(h0) == ${d.lists[0].length ? `list0[${Math.floor(d.lists[0].length / 2)}]` : "nullptr"});\n`; break;
        case "linked-list-cycle": case "linked-list-cycle-entry":
          if (d.cycleAt >= 0) source += `list0.back()->next = list0[${d.cycleAt}];\n`;
          source += c.slug === "linked-list-cycle" ? `assert(has_cycle(h0) == ${d.cycleAt >= 0});\n` : `assert(cycle_entry(h0) == ${d.cycleAt >= 0 ? `list0[${d.cycleAt}]` : "nullptr"});\n`; break;
        case "intersection-of-linked-lists":
          if (d.sharedAt >= 0) source += d.lists[1].length ? `list1.back()->next = list0[${d.sharedAt}];\n` : `h1 = list0[${d.sharedAt}];\n`;
          source += `assert(intersection(h0, h1) == ${d.sharedAt >= 0 ? `list0[${d.sharedAt}]` : "nullptr"});\n`; break;
        case "palindrome-linked-list":
          source += `std::vector<Node*> links; for (Node* p : list0) links.push_back(p->next);\nassert(is_palindrome(h0) == ${c.answer});\nfor (size_t j = 0; j < list0.size(); ++j) assert(list0[j]->next == links[j]);\n`; break;
        case "linked-list-insert-delete": expression = `delete_at(insert_at(h0, ${d.insertAt}, ${d.insertValue}), ${d.deleteAt})`; break;
        case "reverse-linked-list": expression = "reverse(h0)"; break;
        case "merge-two-sorted-lists": expression = "merge(h0, h1)"; break;
        case "remove-nth-node-from-end": expression = `remove_nth(h0, ${d.n})`; break;
        case "remove-sorted-list-duplicates": expression = "deduplicate(h0)"; break;
        case "add-two-linked-list-numbers": expression = "add_numbers(h0, h1)"; break;
        case "reorder-linked-list": expression = "reorder(h0)"; break;
        case "rotate-linked-list": expression = `rotate_right(h0, ${d.k})`; break;
        case "reverse-nodes-in-k-group": expression = `reverse_k_group(h0, ${d.k})`; break;
        case "merge-k-sorted-lists": expression = `merge_k(std::vector<Node*>{${d.lists.map((_, j) => `h${j}`).join(",")}})`; break;
        case "sort-linked-list": expression = "sort_list(h0)"; break;
        case "copy-list-with-random-pointer":
          d.random.forEach((target, j) => { source += `list0[${j}]->random = ${target === null ? "nullptr" : `list0[${target}]`};\n`; });
          source += "Node* copiedHead = copy_random(h0); std::vector<Node*> copies; for (Node* p = copiedHead; p; p = p->next) { for (Node* original : list0) assert(p != original); copies.push_back(p); }\nassert(copies.size() == list0.size());\n";
          d.random.forEach((target, j) => { source += `assert(copies[${j}]->random == ${target === null ? "nullptr" : `copies[${target}]`});\nassert(list0[${j}]->random == ${target === null ? "nullptr" : `list0[${target}]`});\nassert(list0[${j}]->next == ${j + 1 < d.random.length ? `list0[${j + 1}]` : "nullptr"});\n`; });
          expression = "copiedHead"; break;
        default: assert.fail(c.slug);
      }
      if (expression) source += `assert((values(${expression}) == ${cppVector(c.expected)}));\n`;
      source += "}\n";
    }
    source += `std::cout << "${cases.length} C++ cases passed\\n";\n}\n`;
    const path = join(temp, "lessons.cpp"), binary = join(temp, "lessons"); await writeFile(path, source);
    execFileSync(process.env.CXX ?? "clang++", ["-std=c++17", "-O0", path, "-o", binary], { timeout: 60000, encoding: "utf8" });
    assert.match(execFileSync(binary, { timeout: 30000, encoding: "utf8" }), /1081 C\+\+ cases passed/);
  } finally { await rm(temp, { recursive: true, force: true }); }
});
