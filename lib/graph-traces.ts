export type GraphEdge = { from: number; to: number; weight?: number };
export type GraphExample = { id: string; label: string; size: number; directed: boolean; edges: GraphEdge[]; source?: number };
export type GraphStep = {
  title: string;
  explanation: string;
  action: string;
  active: number[];
  visited: number[];
  activeEdges: number[];
  accepted: number[];
  values: string[];
  valuesLabel: string;
  frontier: string[];
  frontierLabel: string;
  result: string[];
  resultLabel: string;
  groups?: number[];
  matrix?: string[][];
  reversed?: boolean;
  warning?: boolean;
  done?: boolean;
};
export type GraphScenario = GraphExample & { steps: GraphStep[] };

export const vertexName = (vertex: number) => String.fromCharCode(65 + vertex);
const names = (vertices: number[]) => vertices.map(vertexName);
const distanceText = (value: number) => Number.isFinite(value) ? String(value) : "∞";

function adjacency(graph: GraphExample, reverse = false) {
  const adj: { to: number; weight: number; edge: number }[][] = Array.from({ length: graph.size }, () => []);
  graph.edges.forEach((item, edge) => {
    const from = reverse ? item.to : item.from;
    const to = reverse ? item.from : item.to;
    adj[from].push({ to, weight: item.weight ?? 1, edge });
    if (!graph.directed) adj[to].push({ to: from, weight: item.weight ?? 1, edge });
  });
  return adj;
}

function recorder() {
  const steps: GraphStep[] = [];
  const emit = (step: Partial<GraphStep> & Pick<GraphStep, "title" | "explanation" | "action">) => {
    steps.push(structuredClone({ active: [], visited: [], activeEdges: [], accepted: [], values: [], valuesLabel: "State", frontier: [], frontierLabel: "Frontier", result: [], resultLabel: "Result", ...step }));
  };
  return { steps, emit };
}

export function traceTraversal(graph: GraphExample, bfs: boolean): GraphStep[] {
  const { steps, emit } = recorder();
  const adj = adjacency(graph);
  const seen = new Set<number>();
  const order: number[] = [], accepted: number[] = [], path: number[] = [];
  const distances = Array(graph.size).fill(Infinity) as number[];
  const source = graph.source ?? 0;
  const state = () => ({ visited: [...seen], accepted, result: names(order), resultLabel: "Visit order", values: distances.map(distanceText), valuesLabel: bfs ? "Distance from source" : "DFS depth (not shortest distance)" });
  seen.add(source); distances[source] = 0;
  emit({ ...state(), title: `Start at ${vertexName(source)}.`, explanation: bfs ? "Mark the source before enqueuing it. This prevents duplicate entries." : "Mark a vertex when entering it. Follow neighbors in the order shown in the edge list.", action: bfs ? `queue = [${vertexName(source)}]` : `dfs(${vertexName(source)})`, active: [source], frontier: [vertexName(source)], frontierLabel: bfs ? "Queue · front first" : "Recursion stack · top last" });
  if (bfs) {
    const queue = [source];
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head]; order.push(u);
      emit({ ...state(), active: [u], frontier: names(queue.slice(head + 1)), frontierLabel: "Queue · front first", title: `Dequeue ${vertexName(u)}.`, explanation: "Every vertex at a smaller distance has already been processed.", action: `u = queue.popleft()  # ${vertexName(u)}` });
      for (const { to: v, edge } of adj[u]) if (!seen.has(v)) {
        seen.add(v); distances[v] = distances[u] + 1; queue.push(v); accepted.push(edge);
        emit({ ...state(), active: [u, v], activeEdges: [edge], frontier: names(queue.slice(head + 1)), frontierLabel: "Queue · front first", title: `Discover ${vertexName(v)} from ${vertexName(u)}.`, explanation: "The first discovery gives the shortest number of edges from the source.", action: `distance[${vertexName(v)}] = ${distances[v]}; enqueue(${vertexName(v)})` });
      }
    }
  } else {
    function visit(u: number, incomingEdge = -1) {
      path.push(u); order.push(u);
      emit({ ...state(), active: [u], activeEdges: incomingEdge === -1 ? [] : [incomingEdge], frontier: names(path), frontierLabel: "Recursion stack · top last", title: `Enter ${vertexName(u)}.`, explanation: "Explore each unvisited neighbor before returning to the caller. Visited neighbors are skipped.", action: `visit(${vertexName(u)})` });
      for (const { to: v, edge } of adj[u]) if (!seen.has(v)) {
        seen.add(v); distances[v] = distances[u] + 1; accepted.push(edge); visit(v, edge);
      }
      path.pop();
      emit({ ...state(), active: [u], frontier: names(path), frontierLabel: "Recursion stack · top last", title: `Backtrack from ${vertexName(u)}.`, explanation: "All neighbors have been considered. Return to the preceding vertex on the path.", action: `return from dfs(${vertexName(u)})` });
    }
    visit(source);
  }
  emit({ ...state(), done: true, title: "Traversal complete.", explanation: seen.size === graph.size ? "Every vertex is reachable from the source." : "Vertices marked ∞ are unreachable from this source. To traverse the whole graph, start again at each unvisited vertex.", action: `return ${bfs ? "distance, " : ""}order` });
  return steps;
}

export function traceDijkstra(graph: GraphExample): GraphStep[] {
  const { steps, emit } = recorder();
  const adj = adjacency(graph), source = graph.source ?? 0;
  const dist = Array(graph.size).fill(Infinity) as number[];
  const settled: number[] = [], parentEdge = Array(graph.size).fill(-1) as number[];
  const heap: [number, number][] = [[0, source]];
  dist[source] = 0;
  const state = () => ({ visited: settled, accepted: parentEdge.filter((e) => e !== -1), values: dist.map(distanceText), valuesLabel: "Best distance from source", frontier: [...heap].sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([d, u]) => `${vertexName(u)}:${d}`), frontierLabel: "Min-priority queue · smallest first" });
  emit({ ...state(), title: `Set distance[${vertexName(source)}] = 0.`, explanation: "All edge weights must be nonnegative. Unreached vertices begin at infinity.", action: `push(0, ${vertexName(source)})` });
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [d, u] = heap.shift()!;
    if (d !== dist[u]) {
      emit({ ...state(), active: [u], title: `Skip stale entry ${vertexName(u)}:${d}.`, explanation: "A shorter route was found after this entry was inserted. It must not relax edges again.", action: `if popped_distance != distance[u]: continue` }); continue;
    }
    settled.push(u);
    emit({ ...state(), active: [u], title: `Settle ${vertexName(u)} at distance ${d}.`, explanation: "No unprocessed route can improve this distance because weights are nonnegative.", action: `pop_min()  # (${d}, ${vertexName(u)})` });
    for (const { to: v, weight, edge } of adj[u]) if (d + weight < dist[v]) {
      const old = distanceText(dist[v]); dist[v] = d + weight; parentEdge[v] = edge; heap.push([dist[v], v]);
      emit({ ...state(), active: [u, v], activeEdges: [edge], title: `Improve ${vertexName(v)}: ${old} → ${dist[v]}.`, explanation: `Going through ${vertexName(u)} costs ${d} + ${weight}. Replace the previous route and push a new queue entry.`, action: `distance[${vertexName(v)}] = ${dist[v]}` });
    }
  }
  emit({ ...state(), done: true, title: "Shortest distances are final.", explanation: "∞ means unreachable from the source. Green edges show the final shortest-path tree.", action: "return distance", result: dist.map((d, u) => `${vertexName(u)}:${distanceText(d)}`), resultLabel: "Distances" });
  return steps;
}

export function traceKahn(graph: GraphExample): GraphStep[] {
  const { steps, emit } = recorder();
  const adj = adjacency(graph), indegree = Array(graph.size).fill(0) as number[];
  graph.edges.forEach(({ to }) => indegree[to]++);
  const queue: number[] = [], order: number[] = [], accepted: number[] = [];
  indegree.forEach((d, u) => { if (d === 0) queue.push(u); });
  let head = 0;
  const state = () => ({ visited: order, accepted, values: indegree.map(String), valuesLabel: "Remaining indegree", frontier: names(queue.slice(head)), frontierLabel: "Zero-indegree queue · front first", result: names(order), resultLabel: "Topological order" });
  emit({ ...state(), title: "Find vertices with no prerequisites.", explanation: "Count incoming edges. Only vertices with indegree zero may enter the initial queue.", action: "queue = all vertices with indegree 0" });
  while (head < queue.length) {
    const u = queue[head++]; order.push(u);
    emit({ ...state(), active: [u], title: `Output ${vertexName(u)}.`, explanation: "All prerequisites for this vertex have already been removed.", action: `order.append(${vertexName(u)})` });
    for (const { to: v, edge } of adj[u]) {
      indegree[v]--; accepted.push(edge);
      if (indegree[v] === 0) queue.push(v);
      emit({ ...state(), active: [u, v], activeEdges: [edge], title: `Remove ${vertexName(u)} → ${vertexName(v)}.`, explanation: indegree[v] === 0 ? `${vertexName(v)} now has no prerequisites. Enqueue it.` : `${vertexName(v)} still has ${indegree[v]} incoming edge(s).`, action: `indegree[${vertexName(v)}] -= 1` });
    }
  }
  const cycle = order.length !== graph.size;
  emit({ ...state(), done: true, warning: cycle, resultLabel: cycle ? "Partial order · incomplete" : "Topological order", title: cycle ? "A cycle blocks the remaining vertices." : "Topological order complete.", explanation: cycle ? "The queue is empty, but fewer than V vertices were output. The partial order is not a valid topological sort of the whole graph." : "For every directed edge u → v, u appears before v. Other valid orders may exist.", action: cycle ? "return None  # directed cycle" : "return order" });
  return steps;
}

export function traceBellmanFord(graph: GraphExample): GraphStep[] {
  const { steps, emit } = recorder();
  const dist = Array(graph.size).fill(Infinity) as number[];
  dist[graph.source ?? 0] = 0;
  const state = () => ({ values: dist.map(distanceText), valuesLabel: "Best distance from source", visited: dist.flatMap((d, u) => Number.isFinite(d) ? [u] : []) });
  emit({ ...state(), title: "Initialize the source at zero.", explanation: "Negative edges are allowed. A pass checks every directed edge in the listed order.", action: "distance[source] = 0" });
  for (let pass = 1; pass < graph.size; pass++) {
    let changed = false;
    emit({ ...state(), title: `Begin pass ${pass} of ${graph.size - 1}.`, explanation: "After pass k, all shortest routes with at most k edges are accounted for; in-place updates can propagate even farther.", action: `for each edge (u, v, weight)  # pass ${pass}` });
    graph.edges.forEach(({ from: u, to: v, weight = 1 }, edge) => {
      if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
        const old = distanceText(dist[v]); dist[v] = dist[u] + weight; changed = true;
        emit({ ...state(), active: [u, v], activeEdges: [edge], title: `Relax ${vertexName(u)} → ${vertexName(v)}: ${old} → ${dist[v]}.`, explanation: `The route through ${vertexName(u)} is cheaper. Store ${dist[u]} + (${weight}) = ${dist[v]}.`, action: `distance[${vertexName(v)}] = distance[${vertexName(u)}] + (${weight})` });
      }
    });
    if (!changed) {
      emit({ ...state(), title: "No distance changed in this pass.", explanation: "Further passes cannot improve anything, so stop early.", action: "if not changed: break" }); break;
    }
  }
  const cycleEdge = graph.edges.findIndex(({ from: u, to: v, weight = 1 }) => dist[u] !== Infinity && dist[u] + weight < dist[v]);
  const cycle = cycleEdge !== -1;
  emit({ ...state(), done: true, warning: cycle, activeEdges: cycle ? [cycleEdge] : [], title: cycle ? "A reachable negative cycle exists." : "The extra pass finds no improvement.", explanation: cycle ? "An edge can still relax after V − 1 passes. Distances downstream of this cycle have no finite minimum; the displayed estimates are not final answers." : "Shortest paths can be chosen with at most V − 1 edges when no reachable negative cycle exists. ∞ stays unreachable.", action: cycle ? "return None  # reachable negative cycle" : "return distance", result: cycle ? ["Reachable negative cycle"] : dist.map((d, u) => `${vertexName(u)}:${distanceText(d)}`), resultLabel: cycle ? "Result" : "Distances" });
  return steps;
}

export function traceFloydWarshall(graph: GraphExample): GraphStep[] {
  const { steps, emit } = recorder();
  const dist = Array.from({ length: graph.size }, (_, i) => Array.from({ length: graph.size }, (_, j) => i === j ? 0 : Infinity));
  graph.edges.forEach(({ from, to, weight = 1 }) => { dist[from][to] = Math.min(dist[from][to], weight); });
  const state = () => ({ matrix: dist.map((row) => row.map(distanceText)) });
  emit({ ...state(), title: "Initialize direct distances.", explanation: "The diagonal is zero, direct edges keep their minimum weight, and all other pairs start at infinity. Rows are sources; columns are destinations.", action: "distance[i][i] = 0; distance[u][v] = weight" });
  for (let k = 0; k < graph.size; k++) {
    emit({ ...state(), active: [k], title: `Allow ${vertexName(k)} as an intermediate.`, explanation: `Try every source/destination pair using ${vertexName(k)} between them. The intermediate-vertex loop must be outermost.`, action: `for i, j: d[i][j] = min(d[i][j], d[i][${vertexName(k)}] + d[${vertexName(k)}][j])` });
    for (let i = 0; i < graph.size; i++) for (let j = 0; j < graph.size; j++) {
      if (dist[i][k] !== Infinity && dist[k][j] !== Infinity && dist[i][k] + dist[k][j] < dist[i][j]) {
        const old = distanceText(dist[i][j]); dist[i][j] = dist[i][k] + dist[k][j];
        emit({ ...state(), active: [...new Set([i, k, j])], title: `${vertexName(i)} → ${vertexName(j)}: ${old} → ${dist[i][j]}.`, explanation: `The route via ${vertexName(k)} beats the previous estimate. Update this matrix cell.`, action: `d[${vertexName(i)}][${vertexName(j)}] = ${dist[i][j]}` });
      }
    }
  }
  const negative = dist.flatMap((row, u) => row[u] < 0 ? [u] : []);
  emit({ ...state(), active: negative, warning: negative.length > 0, done: true, title: negative.length ? "A negative diagonal reveals a negative cycle." : "All-pairs distances complete.", explanation: negative.length ? "A vertex can reach itself with negative cost. Pairs that can pass through a negative cycle have no finite shortest distance. The matrix is not a valid finite answer for those pairs." : "Every vertex has been allowed as an intermediate. ∞ means no directed path exists for that pair.", action: negative.length ? "has_negative_cycle = any(d[v][v] < 0)" : "return distance", result: negative.length ? ["Negative cycle detected"] : ["Read any source → destination in the matrix"] });
  return steps;
}

export function traceSpanning(graph: GraphExample, prim: boolean, unionOnly = false): GraphStep[] {
  const { steps, emit } = recorder();
  const parent = Array.from({ length: graph.size }, (_, u) => u), size = Array(graph.size).fill(1) as number[];
  function find(u: number): number { return parent[u] === u ? u : (parent[u] = find(parent[u])); }
  const selected: number[] = [], seen = new Set<number>();
  let cost = 0, components = graph.size;
  const state = () => ({ visited: [...seen], accepted: selected, values: parent.map((_, u) => vertexName(find(u))), valuesLabel: "Component representative", groups: parent.map((_, u) => find(u)), result: unionOnly ? [`${components} component(s)`] : [`Total weight: ${cost}`, `${components} component(s)`], resultLabel: unionOnly ? "Connectivity" : "Forest" });
  emit({ ...state(), title: prim ? "Start a new tree at A." : "Start with one component per vertex.", explanation: unionOnly ? "Process the undirected edges as union operations. Representatives identify connectivity, not literal graph edges." : prim ? "The priority queue contains edges leaving the growing tree. Restart at any unvisited vertex to handle disconnected graphs." : "Sort all edges by weight. Accept an edge only when its endpoints are in different components.", action: unionOnly ? "parent[u] = u; size[u] = 1" : prim ? "heap = edges leaving A" : "edges.sort(key=weight)" });
  function consider(edge: number) {
    const { from: u, to: v, weight = 1 } = graph.edges[edge];
    let a = find(u), b = find(v);
    const joined = a !== b;
    if (joined) {
      if (size[a] < size[b]) [a, b] = [b, a];
      parent[b] = a; size[a] += size[b]; components--; selected.push(edge); cost += weight;
    }
    emit({ ...state(), active: [u, v], activeEdges: [edge], title: joined ? `Join ${vertexName(u)} — ${vertexName(v)}${unionOnly ? "" : ` (weight ${weight})`}.` : `Skip ${vertexName(u)} — ${vertexName(v)}.`, explanation: joined ? "The endpoints have different representatives. Merge the smaller component into the larger one." : "Both endpoints already share a representative. This edge would close a cycle.", action: joined ? `union(${vertexName(u)}, ${vertexName(v)})` : "find(u) == find(v): skip" });
  }
  if (prim) {
    const adj = adjacency(graph);
    for (let root = 0; root < graph.size; root++) if (!seen.has(root)) {
      seen.add(root);
      const queue = adj[root].map(({ edge, to, weight }) => ({ edge, to, weight }));
      emit({ ...state(), active: [root], title: `Grow a tree from ${vertexName(root)}.`, explanation: "Only edges crossing from visited to unvisited vertices can extend this tree.", action: `visited.add(${vertexName(root)})`, frontier: queue.map(({ edge }) => edgeLabel(graph, edge)), frontierLabel: "Candidate edges" });
      while (queue.length) {
        queue.sort((a, b) => a.weight - b.weight || a.edge - b.edge);
        const { edge, to } = queue.shift()!;
        if (seen.has(to)) {
          emit({ ...state(), activeEdges: [edge], title: `Skip an edge to visited ${vertexName(to)}.`, explanation: "Both endpoints are already in this tree. Adding the edge would create a cycle.", action: "if visited[v]: continue" }); continue;
        }
        seen.add(to); consider(edge);
        for (const next of adj[to]) if (!seen.has(next.to)) queue.push(next);
      }
    }
  } else {
    const edges = graph.edges.map((_, edge) => edge);
    if (!unionOnly) edges.sort((a, b) => (graph.edges[a].weight ?? 1) - (graph.edges[b].weight ?? 1) || a - b);
    edges.forEach(consider);
  }
  emit({ ...state(), done: true, title: unionOnly ? "All unions processed." : components === 1 ? "Minimum spanning tree complete." : "Minimum spanning forest complete.", explanation: unionOnly ? "Vertices with the same representative are connected. Path compression speeds up later finds; union by size keeps trees shallow." : `Accepted ${selected.length} = V − ${components} edges. ${components === 1 ? "Every vertex is connected with minimum total weight." : "No edge connects the remaining components, so a single spanning tree does not exist."}`, action: unionOnly ? "return component representatives" : `return forest, ${cost}` });
  return steps;
}

function edgeLabel(graph: GraphExample, edge: number) {
  const { from, to, weight } = graph.edges[edge];
  return `${vertexName(from)}–${vertexName(to)}${weight === undefined ? "" : `:${weight}`}`;
}

export function traceBipartite(graph: GraphExample): GraphStep[] {
  const { steps, emit } = recorder();
  const adj = adjacency(graph), color = Array(graph.size).fill(-1) as number[];
  const state = () => ({ groups: color, visited: color.flatMap((c, u) => c !== -1 ? [u] : []), values: color.map((c) => c === -1 ? "—" : String(c)), valuesLabel: "Color (0 or 1)" });
  emit({ ...state(), title: "Begin with all vertices uncolored.", explanation: "Bipartite graphs admit two colors with no equal-colored endpoints on any edge. Check every connected component.", action: "color = [-1] * V" });
  for (let root = 0; root < graph.size; root++) if (color[root] === -1) {
    const queue = [root]; color[root] = 0;
    emit({ ...state(), active: [root], title: `Start a component at ${vertexName(root)}.`, explanation: "Choose color 0 for this component’s first vertex.", action: `color[${vertexName(root)}] = 0`, frontier: names(queue), frontierLabel: "Queue · front first" });
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head];
      for (const { to: v, edge } of adj[u]) {
        if (color[v] === -1) {
          color[v] = 1 - color[u]; queue.push(v);
          emit({ ...state(), active: [u, v], activeEdges: [edge], title: `Color ${vertexName(v)} with ${color[v]}.`, explanation: `It must differ from ${vertexName(u)}, whose color is ${color[u]}.`, action: `color[${vertexName(v)}] = 1 - color[${vertexName(u)}]`, frontier: names(queue.slice(head + 1)), frontierLabel: "Queue · front first" });
        } else if (color[v] === color[u]) {
          emit({ ...state(), active: [u, v], activeEdges: [edge], done: true, warning: true, title: "Equal-colored neighbors: not bipartite.", explanation: "This conflict witnesses an odd cycle (a self-loop also fails). Two colors cannot satisfy all edges.", action: "return False", result: ["Not bipartite"] }); return steps;
        }
      }
    }
  }
  emit({ ...state(), done: true, title: "Every edge connects opposite colors.", explanation: "All components were checked, including isolated vertices. The graph is bipartite.", action: "return True", result: ["Bipartite"] });
  return steps;
}

export function traceDirectedCycle(graph: GraphExample): GraphStep[] {
  const { steps, emit } = recorder();
  const adj = adjacency(graph), color = Array(graph.size).fill(0) as number[], path: number[] = [];
  let cycle: number[] = [];
  const state = () => ({ values: color.map((c) => ["unseen", "active", "done"][c]), valuesLabel: "DFS state", visited: color.flatMap((c, u) => c ? [u] : []), frontier: names(path), frontierLabel: "Active DFS path · top last" });
  emit({ ...state(), title: "Track three states per vertex.", explanation: "Unseen vertices have not been entered; active vertices are on the recursion path; done vertices have finished.", action: "state = [0] * V" });
  function visit(u: number): boolean {
    color[u] = 1; path.push(u);
    emit({ ...state(), active: [u], title: `Enter ${vertexName(u)}.`, explanation: "Mark this vertex active until all its outgoing edges have been checked.", action: `state[${vertexName(u)}] = 1` });
    for (const { to: v, edge } of adj[u]) {
      if (color[v] === 1) {
        cycle = [...path.slice(path.indexOf(v)), v];
        emit({ ...state(), active: cycle, activeEdges: [edge], warning: true, done: true, title: `Back edge ${vertexName(u)} → ${vertexName(v)} closes a cycle.`, explanation: "The destination is still on the active path, so following this edge returns to an ancestor.", action: "return True", result: names(cycle), resultLabel: "Directed cycle" }); return true;
      }
      if (color[v] === 0 && visit(v)) return true;
    }
    color[u] = 2; path.pop();
    emit({ ...state(), active: [u], title: `Finish ${vertexName(u)}.`, explanation: "Edges to a finished vertex do not prove a cycle. Only edges to active vertices do.", action: `state[${vertexName(u)}] = 2` }); return false;
  }
  for (let u = 0; u < graph.size; u++) if (color[u] === 0 && visit(u)) return steps;
  emit({ ...state(), done: true, title: "No directed cycle exists.", explanation: "Every component was explored with no edge back into the active recursion path. This graph is a DAG.", action: "return False", result: ["Acyclic"] }); return steps;
}

export function traceKosaraju(graph: GraphExample): GraphStep[] {
  const { steps, emit } = recorder();
  const adj = adjacency(graph), reversed = adjacency(graph, true), seen = new Set<number>(), finish: number[] = [];
  const groups = Array(graph.size).fill(-1) as number[], components: string[] = [];
  const state = () => ({ visited: [...seen], groups, frontier: names(finish), frontierLabel: "Finish order · latest last", result: components, resultLabel: "Strongly connected components" });
  emit({ ...state(), title: "Pass 1: compute finishing order.", explanation: "Run DFS over every vertex in the original directed graph. Append a vertex only after all its neighbors finish.", action: "for each unseen vertex: dfs1(vertex)" });
  function visit(u: number) {
    seen.add(u);
    for (const { to } of adj[u]) if (!seen.has(to)) visit(to);
    finish.push(u);
    emit({ ...state(), active: [u], title: `Finish ${vertexName(u)}.`, explanation: "Store this vertex after exploring its outgoing paths. This is postorder, not discovery order.", action: `finish.append(${vertexName(u)})` });
  }
  for (let u = 0; u < graph.size; u++) if (!seen.has(u)) visit(u);
  seen.clear();
  emit({ ...state(), reversed: true, title: "Reverse every edge.", explanation: "Pass 2 follows the transpose graph in decreasing finishing order. Each new DFS collects one SCC.", action: "transpose[v].append(u) for each edge u → v" });
  let group = 0;
  function collect(u: number, members: number[]) {
    seen.add(u); groups[u] = group; members.push(u);
    emit({ ...state(), reversed: true, active: [u], title: `Add ${vertexName(u)} to component ${group + 1}.`, explanation: "On the reversed graph, this search stays inside the next unassigned strongly connected component.", action: `component[${vertexName(u)}] = ${group + 1}` });
    for (const { to } of reversed[u]) if (!seen.has(to)) collect(to, members);
  }
  for (const u of [...finish].reverse()) if (!seen.has(u)) {
    const members: number[] = []; collect(u, members); components.push(`{${names(members).join(", ")}}`); group++;
  }
  emit({ ...state(), reversed: true, done: true, title: `Found ${group} strongly connected components.`, explanation: "Inside each component, every vertex can reach every other vertex in the original directed graph. Collapsing components produces a DAG.", action: "return components" }); return steps;
}

export function traceLowLink(graph: GraphExample, mode: "tarjan" | "bridges" | "articulation-points"): GraphStep[] {
  const { steps, emit } = recorder();
  const adj = adjacency(graph), tin = Array(graph.size).fill(-1) as number[], low = [...tin], groups = [...tin];
  const stack: number[] = [], onStack = new Set<number>(), bridges: number[] = [], cuts = new Set<number>(), components: string[] = [];
  let timer = 0;
  const scc = mode === "tarjan";
  const state = () => ({ visited: tin.flatMap((t, u) => t !== -1 ? [u] : []), values: tin.map((t, u) => t === -1 ? "—" : `${t} / ${low[u]}`), valuesLabel: "Discovery / low-link", frontier: names(stack), frontierLabel: scc ? "SCC stack · top last" : "DFS path · top last", accepted: bridges, groups: scc ? groups : undefined, result: scc ? components : mode === "bridges" ? bridges.map((edge) => edgeLabel(graph, edge)) : names([...cuts]), resultLabel: scc ? "Strongly connected components" : mode === "bridges" ? "Bridges" : "Articulation points" });
  emit({ ...state(), title: "Initialize discovery and low-link values.", explanation: scc ? "Discovery is the DFS entry index. Low-link tracks the earliest active SCC candidate reachable through the DFS subtree." : "low[u] is the earliest discovery reachable from u’s DFS subtree using tree edges and at most one back edge. Skip the parent edge by ID.", action: "discovery = [-1] * V; timer = 0" });
  function visit(u: number, parentEdge: number) {
    tin[u] = low[u] = timer++; stack.push(u); onStack.add(u);
    let children = 0;
    emit({ ...state(), active: [u], title: `Discover ${vertexName(u)} at time ${tin[u]}.`, explanation: "Initially, this vertex can reach its own discovery index.", action: `discovery[${vertexName(u)}] = low[${vertexName(u)}] = ${tin[u]}` });
    for (const { to: v, edge } of adj[u]) {
      if (!scc && edge === parentEdge) continue;
      if (tin[v] === -1) {
        children++; visit(v, edge); low[u] = Math.min(low[u], low[v]);
        if (!scc && low[v] > tin[u]) bridges.push(edge);
        if (!scc && parentEdge !== -1 && low[v] >= tin[u]) cuts.add(u);
        emit({ ...state(), active: [u, v], activeEdges: [edge], title: `Return from ${vertexName(v)} to ${vertexName(u)}.`, explanation: scc ? "Propagate the child’s low-link. When low[u] equals discovery[u], u is the root of an SCC." : `low[${vertexName(v)}] = ${low[v]}, discovery[${vertexName(u)}] = ${tin[u]}. ${mode === "bridges" ? (low[v] > tin[u] ? "Strictly greater: this tree edge is a bridge." : "A back route exists, so this edge is not a bridge.") : (parentEdge !== -1 && low[v] >= tin[u] ? "This non-root vertex separates the child subtree." : "A root needs at least two DFS children; a non-root uses the ≥ test.")}`, action: `low[${vertexName(u)}] = min(low[${vertexName(u)}], low[${vertexName(v)}])` });
      } else if (!scc || onStack.has(v)) {
        low[u] = Math.min(low[u], tin[v]);
        emit({ ...state(), active: [u, v], activeEdges: [edge], title: `Use ${vertexName(u)} → ${vertexName(v)} as a back connection.`, explanation: scc ? "Only neighbors still on the SCC stack may lower this value. Use discovery[v], not low[v], for this already discovered neighbor." : "This is not the parent edge. Lower the value with the neighbor’s discovery time; parallel edges are handled separately.", action: `low[${vertexName(u)}] = min(low[${vertexName(u)}], discovery[${vertexName(v)}])` });
      }
    }
    if (scc && low[u] === tin[u]) {
      const members: number[] = [];
      let v: number;
      do { v = stack.pop()!; onStack.delete(v); groups[v] = components.length; members.push(v); } while (v !== u);
      components.push(`{${names(members).join(", ")}}`);
      emit({ ...state(), active: members, title: `Pop SCC {${names(members).join(", ")}}.`, explanation: "This vertex is an SCC root. Pop through it; every popped vertex belongs to the same strongly connected component.", action: "pop until the SCC root is removed" });
    }
    if (!scc) {
      if (parentEdge === -1 && children > 1) {
        cuts.add(u);
        emit({ ...state(), active: [u], title: `DFS root ${vertexName(u)} has ${children} children.`, explanation: "The root is an articulation point only when it has more than one DFS child. Its children belong to separate DFS subtrees.", action: "if root and child_count > 1: mark articulation" });
      }
      stack.pop(); onStack.delete(u);
    }
  }
  for (let u = 0; u < graph.size; u++) if (tin[u] === -1) visit(u, -1);
  emit({ ...state(), active: mode === "articulation-points" ? [...cuts] : [], done: true, title: scc ? `Found ${components.length} strongly connected components.` : mode === "bridges" ? `Found ${bridges.length} bridge(s).` : `Found ${cuts.size} articulation point(s).`, explanation: scc ? "Every vertex was pushed and popped once. Edges to already completed SCCs do not lower low-link values." : mode === "bridges" ? "A tree edge u–v is a bridge exactly when low[v] > discovery[u]. Removing any highlighted green edge increases the component count." : "For a non-root u, some child v must satisfy low[v] ≥ discovery[u]. For a root, require more than one DFS child. Highlighted vertices are the cut vertices.", action: scc ? "return components" : mode === "bridges" ? "return bridges" : "return articulation_points" });
  return steps;
}

const undirected: GraphExample = { id: "connected", label: "Connected graph", size: 6, directed: false, edges: [{ from: 0, to: 1 }, { from: 0, to: 5 }, { from: 1, to: 2 }, { from: 2, to: 5 }, { from: 2, to: 3 }, { from: 3, to: 4 }] };
const disconnected: GraphExample = { ...undirected, id: "disconnected", label: "Disconnected graph", edges: undirected.edges.filter(({ from, to }) => !(from === 2 && to === 3)) };
const dag: GraphExample = { id: "dag", label: "DAG", size: 6, directed: true, edges: [{ from: 0, to: 1 }, { from: 0, to: 5 }, { from: 1, to: 2 }, { from: 5, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }] };
const cyclic: GraphExample = { ...dag, id: "cycle", label: "Directed cycle", edges: [...dag.edges, { from: 3, to: 1 }] };
const weighted: GraphExample = { id: "weighted", label: "Weighted graph", size: 6, directed: true, edges: [{ from: 0, to: 1, weight: 4 }, { from: 0, to: 5, weight: 1 }, { from: 5, to: 1, weight: 2 }, { from: 1, to: 2, weight: 1 }, { from: 5, to: 4, weight: 8 }, { from: 2, to: 3, weight: 3 }, { from: 3, to: 4, weight: 1 }] };
const negative: GraphExample = { ...weighted, id: "negative", label: "Negative edge", edges: weighted.edges.map((edge) => edge.from === 1 && edge.to === 2 ? { ...edge, weight: -2 } : edge) };
const negativeCycle: GraphExample = { ...negative, id: "negative-cycle", label: "Negative cycle", edges: [...negative.edges, { from: 3, to: 1, weight: -3 }] };
const mst: GraphExample = { ...weighted, directed: false };
const scc: GraphExample = { id: "scc", label: "Three SCCs", size: 6, directed: true, edges: [{ from: 0, to: 1 }, { from: 1, to: 5 }, { from: 5, to: 0 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 2 }, { from: 3, to: 4 }] };

export function graphScenarios(slug: string): GraphScenario[] {
  let examples: GraphExample[];
  let trace: (graph: GraphExample) => GraphStep[];
  switch (slug) {
    case "depth-first-search": case "breadth-first-search": examples = [undirected, disconnected]; trace = (graph) => traceTraversal(graph, slug === "breadth-first-search"); break;
    case "dijkstra": examples = [weighted, { ...weighted, id: "unreachable", label: "Unreachable vertex", edges: weighted.edges.filter(({ to }) => to !== 4) }]; trace = traceDijkstra; break;
    case "topological-sort": examples = [dag, cyclic]; trace = traceKahn; break;
    case "bellman-ford": examples = [negative, negativeCycle]; trace = traceBellmanFord; break;
    case "floyd-warshall": examples = [negative, negativeCycle]; trace = traceFloydWarshall; break;
    case "prim": case "kruskal": case "disjoint-set-union": examples = [mst, { ...mst, id: "disconnected", label: "Disconnected graph", edges: mst.edges.filter(({ from, to }) => from !== 4 && to !== 4) }]; trace = (graph) => traceSpanning(graph, slug === "prim", slug === "disjoint-set-union"); break;
    case "bipartite-check": examples = [{ ...undirected, label: "Even cycle + tail" }, { ...undirected, id: "odd-cycle", label: "Odd cycle", edges: [...undirected.edges, { from: 0, to: 2 }] }]; trace = traceBipartite; break;
    case "directed-cycle-detection": examples = [dag, cyclic]; trace = traceDirectedCycle; break;
    case "kosaraju": case "tarjan": examples = [scc, { ...dag, label: "DAG · singleton SCCs" }]; trace = slug === "kosaraju" ? traceKosaraju : (graph) => traceLowLink(graph, "tarjan"); break;
    case "bridges": case "articulation-points": examples = [undirected, { id: "ring", label: "Cycle · no cuts", size: 6, directed: false, edges: Array.from({ length: 6 }, (_, u) => ({ from: u, to: (u + 1) % 6 })) }]; trace = (graph) => traceLowLink(graph, slug); break;
    default: return [];
  }
  return examples.map((example) => ({ ...example, steps: trace(example) }));
}
