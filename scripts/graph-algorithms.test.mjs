import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function loadTypeScript(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const traces = await loadTypeScript("../lib/graph-traces.ts");
const { graphAlgorithms } = await loadTypeScript("../lib/graph-catalog.ts");
const { graphCode } = await loadTypeScript("../lib/graph-code.ts");
const { graphLessonNotes } = await loadTypeScript("../lib/graph-lessons.ts");
const last = (steps) => steps.at(-1);
const value = (text) => text === "∞" ? Infinity : Number(text);

function adjacency(graph) {
  const adj = Array.from({ length: graph.size }, () => []);
  for (const { from, to } of graph.edges) {
    adj[from].push(to);
    if (!graph.directed) adj[to].push(from);
  }
  return adj;
}

function distances(graph) {
  const d = Array.from({ length: graph.size }, (_, u) => Array.from({ length: graph.size }, (_, v) => u === v ? 0 : Infinity));
  for (const { from, to, weight = 1 } of graph.edges) {
    d[from][to] = Math.min(d[from][to], weight);
    if (!graph.directed) d[to][from] = Math.min(d[to][from], weight);
  }
  for (let k = 0; k < graph.size; k++)
    for (let u = 0; u < graph.size; u++)
      for (let v = 0; v < graph.size; v++)
        d[u][v] = Math.min(d[u][v], d[u][k] + d[k][v]);
  return d;
}

function componentCount(graph, removedVertex = -1, removedEdge = -1) {
  const remaining = { ...graph, edges: graph.edges.filter(({ from, to }, edge) => edge !== removedEdge && from !== removedVertex && to !== removedVertex) };
  const adj = adjacency(remaining), seen = new Set();
  let count = 0;
  for (let root = 0; root < graph.size; root++) if (root !== removedVertex && !seen.has(root)) {
    count++;
    const stack = [root]; seen.add(root);
    while (stack.length) for (const next of adj[stack.pop()]) if (!seen.has(next)) { seen.add(next); stack.push(next); }
  }
  return count;
}

function partition(step) {
  const groups = new Map();
  step.groups.forEach((group, u) => {
    assert.notEqual(group, -1);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(u);
  });
  return [...groups.values()].map((group) => group.join(",")).sort();
}

let seed = 6021;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; }
function randomGraph(directed, weighted = false, negative = false) {
  const size = 1 + Math.floor(random() * 6), edges = [];
  for (let u = 0; u < size; u++) for (let v = directed ? 0 : u; v < size; v++) if (random() < .23) {
    edges.push({ from: u, to: v, ...(weighted ? { weight: Math.floor(random() * 9) - (negative ? 3 : 0) } : {}) });
    if (!directed && random() < .12) edges.push({ from: u, to: v, ...(weighted ? { weight: 2 } : {}) });
  }
  return { id: "test", label: "Test", size, directed, edges, source: 0 };
}

test("every graph lesson has code, notes, two complete serializable walkthroughs", () => {
  assert.equal(graphAlgorithms.length, 15);
  assert.equal(new Set(graphAlgorithms.map(({ slug }) => slug)).size, 15);
  for (const { slug } of graphAlgorithms) {
    assert.ok(graphCode[slug].python && graphCode[slug].cpp);
    assert.equal(graphLessonNotes[slug].pattern.length, 3);
    const scenarios = traces.graphScenarios(slug);
    assert.equal(scenarios.length, 2);
    for (const scenario of scenarios) {
      assert.ok(scenario.steps.length > 1, slug);
      assert.equal(last(scenario.steps).done, true, slug);
      assert.equal(JSON.stringify(scenario).includes("null"), false, slug);
      for (const step of scenario.steps) {
        for (const u of [...step.active, ...step.visited]) assert.ok(u >= 0 && u < scenario.size);
        for (const e of [...step.activeEdges, ...step.accepted]) assert.ok(e >= 0 && e < scenario.edges.length);
      }
    }
  }
});

test("published examples produce the documented results and failure states", () => {
  const end = (slug, index = 0) => last(traces.graphScenarios(slug)[index].steps);
  assert.deepEqual(end("depth-first-search").result, ["A", "B", "C", "F", "D", "E"]);
  assert.deepEqual(end("breadth-first-search").values, ["0", "1", "2", "3", "4", "1"]);
  assert.deepEqual(end("dijkstra").values, ["0", "3", "4", "7", "8", "1"]);
  assert.equal(end("dijkstra", 1).values[4], "∞");
  assert.deepEqual(end("bellman-ford").values, ["0", "3", "1", "4", "5", "1"]);
  for (const slug of ["topological-sort", "bellman-ford", "floyd-warshall", "bipartite-check", "directed-cycle-detection"]) {
    assert.ok(!end(slug).warning, slug);
    assert.equal(end(slug, 1).warning, true, slug);
  }
  for (const slug of ["prim", "kruskal"]) {
    assert.deepEqual(end(slug).result, ["Total weight: 8", "1 component(s)"]);
    assert.deepEqual(end(slug, 1).result, ["Total weight: 7", "2 component(s)"]);
  }
  assert.deepEqual(partition(end("kosaraju")), ["0,1,5", "2,3", "4"]);
  assert.deepEqual(partition(end("tarjan")), ["0,1,5", "2,3", "4"]);
  assert.deepEqual(end("bridges").result.sort(), ["C–D", "D–E"]);
  assert.deepEqual(end("articulation-points").result.sort(), ["C", "D"]);
  assert.deepEqual(end("bridges", 1).result, []);
  assert.deepEqual(end("articulation-points", 1).result, []);
});

test("shortest paths agree with independent all-pairs distances", () => {
  for (let run = 0; run < 90; run++) {
    const graph = randomGraph(true, true), expected = distances(graph);
    assert.deepEqual(last(traces.traceDijkstra(graph)).values.map(value), expected[0]);
    assert.deepEqual(last(traces.traceBellmanFord(graph)).values.map(value), expected[0]);
    assert.deepEqual(last(traces.traceFloydWarshall(graph)).matrix.map((row) => row.map(value)), expected);
    const unweighted = { ...graph, edges: graph.edges.map(({ from, to }) => ({ from, to })) };
    assert.deepEqual(last(traces.traceTraversal(unweighted, true)).values.map(value), distances(unweighted)[0]);
    const negative = randomGraph(true, true, true), ref = distances(negative);
    const reachableCycle = ref.some((row, u) => ref[0][u] !== Infinity && row[u] < 0);
    assert.equal(!!last(traces.traceBellmanFord(negative)).warning, reachableCycle);
    assert.equal(!!last(traces.traceFloydWarshall(negative)).warning, ref.some((row, u) => row[u] < 0));
    if (!reachableCycle) assert.deepEqual(last(traces.traceBellmanFord(negative)).values.map(value), ref[0]);
  }
});

test("Kahn and DFS cycles agree with reachability; both SCC algorithms match mutual reachability", () => {
  for (let run = 0; run < 100; run++) {
    const graph = randomGraph(true), d = distances(graph);
    const cycle = graph.edges.some(({ from, to }) => from === to || d[to][from] !== Infinity);
    const kahn = last(traces.traceKahn(graph));
    assert.equal(!!kahn.warning, cycle);
    assert.equal(!!last(traces.traceDirectedCycle(graph)).warning, cycle);
    if (!cycle) for (const { from, to } of graph.edges) assert.ok(kahn.result.indexOf(traces.vertexName(from)) < kahn.result.indexOf(traces.vertexName(to)));
    const remaining = new Set(Array.from({ length: graph.size }, (_, u) => u));
    const expected = [];
    while (remaining.size) {
      const root = remaining.values().next().value;
      const group = [...remaining].filter((u) => d[root][u] !== Infinity && d[u][root] !== Infinity);
      group.forEach((u) => remaining.delete(u)); expected.push(group.join(","));
    }
    assert.deepEqual(partition(last(traces.traceKosaraju(graph))), expected.sort());
    assert.deepEqual(partition(last(traces.traceLowLink(graph, "tarjan"))), expected.sort());
  }
});

test("bridges and articulation points match brute-force deletion, including parallel edges", () => {
  for (let run = 0; run < 100; run++) {
    const graph = randomGraph(false), count = componentCount(graph);
    const bridges = graph.edges.flatMap((_, edge) => componentCount(graph, -1, edge) > count ? [edge] : []);
    const cuts = Array.from({ length: graph.size }, (_, u) => u).filter((u) => componentCount(graph, u) > count);
    assert.deepEqual(last(traces.traceLowLink(graph, "bridges")).accepted.sort((a, b) => a - b), bridges);
    assert.deepEqual(last(traces.traceLowLink(graph, "articulation-points")).active.sort((a, b) => a - b), cuts);
  }
});

test("bipartiteness matches exhaustive coloring, and Prim/Kruskal agree on forest weight", () => {
  for (let run = 0; run < 100; run++) {
    const graph = randomGraph(false, true, true);
    const bipartite = Array.from({ length: 2 ** graph.size }, (_, mask) => mask).some((mask) => graph.edges.every(({ from, to }) => ((mask >> from) & 1) !== ((mask >> to) & 1)));
    assert.equal(!!last(traces.traceBipartite(graph)).warning, !bipartite);
    const prim = last(traces.traceSpanning(graph, true)), kruskal = last(traces.traceSpanning(graph, false));
    assert.deepEqual(prim.result, kruskal.result);
    const components = componentCount(graph);
    assert.equal(prim.accepted.length, graph.size - components);
    const dsu = last(traces.traceSpanning(graph, false, true));
    assert.equal(new Set(dsu.groups).size, components);
    const reachability = distances({ ...graph, edges: graph.edges.map(({ from, to }) => ({ from, to })) });
    for (let u = 0; u < graph.size; u++) for (let v = 0; v < graph.size; v++)
      assert.equal(dsu.groups[u] === dsu.groups[v], reachability[u][v] !== Infinity);
  }
});
