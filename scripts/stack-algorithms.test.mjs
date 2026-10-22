import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';

async function loadTS(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { stackAlgorithms } = await loadTS('../lib/stack-catalog.ts');
const { stackCode } = await loadTS('../lib/stack-code.ts');
const { stackNotes } = await loadTS('../lib/stack-lessons.ts');
const { traceStack, stackScenarios } = await loadTS('../lib/stack-traces.ts');
const answer = (slug, input) => traceStack(slug, input).at(-1).result;
const cases = [];
const fixtureAnswers = [
  [true, false], [[-3, 0, -2], [2, null]], [[1, 1, 2, 3], [null, 4, 4, null]], [9, -2],
  ['3 4 2 1 - * +', '8 4 / 2 /'], ['accaccacc', 'abcccccccccccc'], ['/c', '/a/...'], ['ca', ''],
  [[4, 2, 4, -1, -1], [-1, -1, -1, -1]], [[2, -1, 2], [-1, -1, -1]],
  [[2, 5, 2, -1, -1], [-1, -1, -2, -1]], [[1, 1, 4, 2, 1, 1, 0, 0], [2, 1, 0]],
  [[1, 1, 1, 2, 1, 4, 6], [1, 2, 3, 4]], [10, 6], [6, 4], [6, 11], [17, 12], [[5, 10], []], ['1219', '200'], [4, 8],
];
for (const [i, { slug }] of stackAlgorithms.entries()) for (const [j, input] of stackScenarios(slug).entries()) cases.push({ slug, input, expected: fixtureAnswers[i][j] });

// Independent exhaustive scans, range enumeration, and repeated collision simulation.
function oracle(slug, { values: a, k = 0, matrix = [] }) {
  const n = a.length;
  if (['next-greater-element', 'next-greater-circular', 'next-smaller-element', 'daily-temperatures'].includes(slug)) return a.map((x, i) => {
    for (let d = 1; d < (slug === 'next-greater-circular' ? n : n - i); d++) {
      const j = (i + d) % n;
      if (slug === 'next-smaller-element' ? a[j] < x : a[j] > x) return slug === 'daily-temperatures' ? d : a[j];
    }
    return slug === 'daily-temperatures' ? 0 : -1;
  });
  if (slug === 'stock-span') return a.map((x, i) => { let j = i - 1; while (j >= 0 && a[j] <= x) j--; return i - j; });
  if (slug === 'largest-rectangle-histogram' || slug === 'sum-subarray-minimums') {
    let result = 0;
    for (let l = 0; l < n; l++) for (let r = l; r < n; r++) {
      const minimum = Math.min(...a.slice(l, r + 1));
      result = slug === 'largest-rectangle-histogram' ? Math.max(result, minimum * (r - l + 1)) : (result + minimum) % 1000000007;
    }
    return result;
  }
  if (slug === 'trapping-rain-water-stack') return a.reduce((sum, x, i) => sum + Math.max(0, Math.min(Math.max(...a.slice(0, i + 1)), Math.max(...a.slice(i))) - x), 0);
  if (slug === 'maximal-rectangle') {
    let best = 0; const rows = matrix.length, cols = matrix[0]?.length ?? 0;
    for (let top = 0; top < rows; top++) for (let bottom = top; bottom < rows; bottom++) for (let l = 0; l < cols; l++) for (let r = l; r < cols; r++) {
      if (matrix.slice(top, bottom + 1).every((row) => row.slice(l, r + 1).every((x) => x === 1))) best = Math.max(best, (bottom - top + 1) * (r - l + 1));
    }
    return best;
  }
  if (slug === 'asteroid-collision') {
    const survivors = [...a]; let changed = true;
    while (changed) { changed = false; for (let i = 0; i + 1 < survivors.length; i++) if (survivors[i] > 0 && survivors[i + 1] < 0) {
      const left = survivors[i], right = -survivors[i + 1];
      if (left === right) survivors.splice(i, 2); else survivors.splice(left < right ? i : i + 1, 1);
      changed = true; break;
    } }
    return survivors;
  }
  if (slug === 'remove-k-digits') {
    let best = null;
    for (let mask = 0; mask < 2 ** n; mask++) {
      const kept = a.filter((_, i) => mask & (1 << i));
      if (kept.length !== n - k) continue;
      const number = kept.join('').replace(/^0+/, '') || '0';
      if (best === null || number.length < best.length || (number.length === best.length && number < best)) best = number;
    }
    return best;
  }
  if (slug === 'valid-parentheses') {
    let s = a.join(''), old;
    do { old = s; s = s.replace(/\(\)|\[\]|\{\}/g, ''); } while (old !== s);
    return s === '';
  }
  if (slug === 'remove-adjacent-duplicates') {
    let s = a.join(''), old;
    do { old = s; s = s.replace(/(.)\1/, ''); } while (s !== old);
    return s;
  }
  if (slug === 'longest-valid-parentheses') {
    let best = 0;
    for (let l = 0; l < n; l++) { let balance = 0; for (let r = l; r < n; r++) { balance += a[r] === '(' ? 1 : -1; if (balance < 0) break; if (!balance) best = Math.max(best, r - l + 1); } }
    return best;
  }
  if (slug === 'min-stack' || slug === 'queue-using-stacks') {
    const items = [], output = [];
    for (const token of a) {
      if (token.startsWith('push:')) items.push(Number(token.slice(5)));
      else if (token === 'pop') { const value = slug === 'min-stack' ? items.pop() : items.shift(); if (slug !== 'min-stack') output.push(value ?? null); }
      else output.push(!items.length ? null : slug !== 'min-stack' ? items[0] : token === 'min' ? Math.min(...items) : items.at(-1));
    }
    return output;
  }
  throw new Error(`Missing oracle: ${slug}`);
}
let seed = 8472;
const rand = (n) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
const randomized = stackAlgorithms.filter(({ slug }) => !['evaluate-rpn', 'infix-to-postfix', 'decode-string', 'simplify-path'].includes(slug));
for (let trial = 0; trial < 110; trial++) for (const { slug } of randomized) {
  let values = Array.from({ length: rand(9) }, () => rand(7));
  const input = { id: 'random', label: 'Random input', values };
  if (['next-greater-element', 'next-greater-circular', 'next-smaller-element', 'daily-temperatures'].includes(slug)) values = values.map((x) => x - 3);
  if (slug === 'asteroid-collision') values = values.map((x) => (x + 1) * (rand(2) ? 1 : -1));
  if (slug === 'sum-subarray-minimums') values = values.map((x) => x + 1);
  if (slug === 'remove-k-digits') { values = values.length ? values.map(String) : ['0']; if (values.length > 1) values[0] = String(1 + rand(9)); input.k = rand(values.length + 1); }
  if (slug === 'valid-parentheses') values = values.map(() => '()[]{}'[rand(6)]);
  if (slug === 'longest-valid-parentheses') values = values.map(() => '()'[rand(2)]);
  if (slug === 'remove-adjacent-duplicates') values = values.map(() => 'abc'[rand(3)]);
  if (slug === 'maximal-rectangle') { const cols = rand(5); input.matrix = Array.from({ length: rand(5) }, () => Array.from({ length: cols }, () => rand(2))); values = []; }
  if (slug === 'min-stack' || slug === 'queue-using-stacks') values = Array.from({ length: 20 }, () => rand(3) ? `push:${rand(9) - 4}` : (slug === 'min-stack' ? ['pop', 'min', 'top'] : ['pop', 'peek'])[rand(slug === 'min-stack' ? 3 : 2)]);
  input.values = values;
  cases.push({ slug, input, expected: oracle(slug, input) });
}
// Generated expression/parser inputs with answers known from their grammar.
for (let i = 0; i < 100; i++) {
  const x = rand(30), y = 1 + rand(9), z = 1 + rand(9), count = 1 + rand(12);
  cases.push({ slug: 'evaluate-rpn', input: { values: [String(x), String(-y), '/', String(z), '-'] }, expected: Math.trunc(x / -y) - z });
  cases.push({ slug: 'infix-to-postfix', input: { values: `${x} - ${y} - ${z} * ( 2 + 1 )`.split(' ') }, expected: `${x} ${y} - ${z} 2 1 + * -` });
  cases.push({ slug: 'decode-string', input: { values: [...`a${count}[b2[c]]d`] }, expected: 'a' + 'bcc'.repeat(count) + 'd' });
  cases.push({ slug: 'simplify-path', input: { values: `/../../a${x}//./b${y}/../.../`.split('/') }, expected: `/a${x}/...` });
}

test('20 complete lessons provide two computed examples, notes, and both languages', () => {
  assert.equal(stackAlgorithms.length, 20);
  assert.equal(new Set(stackAlgorithms.map((x) => x.slug)).size, 20);
  for (const { slug } of stackAlgorithms) {
    assert.ok(stackCode[slug].python && stackCode[slug].cpp);
    assert.equal(stackNotes[slug].pattern.length, 3);
    assert.equal(stackScenarios(slug).length, 2);
  }
});

test(`all ${cases.length} fixtures and generated inputs match independent answers`, () => {
  for (const { slug, input, expected } of cases) {
    const original = JSON.stringify(input), steps = traceStack(slug, input);
    assert.deepEqual(steps.at(-1).result, expected, `${slug}: ${original}`);
    assert.equal(steps.at(-1).done, true);
    assert.equal(JSON.stringify(input), original, 'input must not mutate');
    assert.deepEqual(JSON.parse(JSON.stringify(steps)), steps);
  }
});

test('snapshots own their state; empty inputs and sentinel flushes stay valid', () => {
  for (const { slug } of stackAlgorithms) {
    if (slug === 'evaluate-rpn') continue; // Requires a valid expression.
    const input = { values: [], k: 0, matrix: [] }, steps = traceStack(slug, input);
    assert.equal(steps.at(-1).done, true);
    if (steps.length > 1) { const initial = JSON.stringify(steps[0]); steps.at(-1).stack.push('mutation'); assert.equal(JSON.stringify(steps[0]), initial); }
  }
  assert.equal(answer('sum-subarray-minimums', { values: Array(300).fill(30000) }), (30000 * 300 * 301 / 2) % 1000000007);
  assert.equal(answer('evaluate-rpn', { values: ['-7', '3', '/'] }), -2);
  assert.equal(answer('evaluate-rpn', { values: ['0', '-3', '/'] }), 0);
});

test('published Python and C++17 snippets produce the same independent answers', { skip: !process.env.ALGOKING_VERIFY_SNIPPETS }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'algoking-stacks-'));
  try {
    const python = `import json\nsources=json.loads(${JSON.stringify(JSON.stringify(stackCode))})\ncases=json.loads(${JSON.stringify(JSON.stringify(cases))})\nfor case in cases:\n ns={}\n exec(sources[case['slug']]['python'],ns)\n inp=case['input']\n args=[inp.get('matrix',[]) if case['slug']=='maximal-rectangle' else inp['values']]\n if case['slug']=='remove-k-digits': args.append(inp['k'])\n print(json.dumps(ns['solve'](*args)))\n`;
    await writeFile(join(directory, 'check.py'), python);
    const py = spawnSync('python3', [join(directory, 'check.py')], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    assert.equal(py.status, 0, py.stderr);
    const check = (output, language) => { const lines = output.trim().split('\n'); assert.equal(lines.length, cases.length, language); lines.forEach((line, i) => assert.deepEqual(JSON.parse(line), cases[i].expected, `${language}: ${cases[i].slug} ${JSON.stringify(cases[i].input)}`)); };
    check(py.stdout, 'Python');
    const namespaces = stackAlgorithms.map(({ slug }, i) => `namespace lesson${i} {\n${stackCode[slug].cpp.replace(/^#include.*\n/gm, '').replace('using namespace std;', '')}\n}`).join('\n');
    const numeric = new Set(['next-greater-element', 'next-greater-circular', 'next-smaller-element', 'daily-temperatures', 'stock-span', 'largest-rectangle-histogram', 'trapping-rain-water-stack', 'sum-subarray-minimums', 'asteroid-collision']);
    const literal = (a) => `{${a.map((x) => Array.isArray(x) ? literal(x) : JSON.stringify(x)).join(',')}}`;
    const calls = cases.map(({ slug, input }) => {
      const i = stackAlgorithms.findIndex((x) => x.slug === slug), type = slug === 'maximal-rectangle' ? 'vector<vector<int>>' : numeric.has(slug) ? 'vector<int>' : 'vector<string>';
      return `print(lesson${i}::solve(${type}${literal(slug === 'maximal-rectangle' ? input.matrix ?? [] : input.values)}${slug === 'remove-k-digits' ? `,${input.k}` : ''})); cout << '\\n';`;
    }).join('\n');
    const cpp = `#include <algorithm>\n#include <optional>\n#include <string>\n#include <vector>\n#include <iostream>\n#include <iomanip>\nusing namespace std;\n${namespaces}\ntemplate<class T> void print(const T& value) { cout << value; }\nvoid print(const string& value) { cout << quoted(value); }\nvoid print(bool value) { cout << (value ? "true" : "false"); }\nvoid print(const optional<int>& value) { if(value) cout << *value; else cout << "null"; }\ntemplate<class T> void print(const vector<T>& values) { cout << '['; bool first=true; for(const auto& value: values) { if(!first) cout << ','; first=false; print(value); } cout << ']'; }\nint main() { ${calls} }\n`;
    await writeFile(join(directory, 'check.cpp'), cpp);
    const compiled = spawnSync(process.env.CXX ?? 'clang++', ['-std=c++17', '-O0', join(directory, 'check.cpp'), '-o', join(directory, 'check')], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    assert.equal(compiled.status, 0, compiled.stderr);
    const run = spawnSync(join(directory, 'check'), [], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    assert.equal(run.status, 0, run.stderr); check(run.stdout, 'C++17');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
