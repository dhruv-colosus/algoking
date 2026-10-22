export type SolutionCode = { python: string; cpp: string };

const pythonDSU = `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.components = n

    def find(self, u):
        while u != self.parent[u]:
            self.parent[u] = self.parent[self.parent[u]]
            u = self.parent[u]
        return u

    def union(self, u, v):
        a, b = self.find(u), self.find(v)
        if a == b:
            return False
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.parent[b] = a
        self.size[a] += self.size[b]
        self.components -= 1
        return True`;

const cppDSU = `#include <numeric>
#include <utility>
#include <vector>

struct DSU {
    std::vector<int> parent, size;
    int components;

    explicit DSU(int n) : parent(n), size(n, 1), components(n) {
        std::iota(parent.begin(), parent.end(), 0);
    }

    int find(int u) {
        while (u != parent[u]) {
            parent[u] = parent[parent[u]];
            u = parent[u];
        }
        return u;
    }

    bool unite(int u, int v) {
        int a = find(u), b = find(v);
        if (a == b) return false;
        if (size[a] < size[b]) std::swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        --components;
        return true;
    }
};`;

export const graphCode: Record<string, SolutionCode> = {
  "depth-first-search": {
    python: `def dfs(adj, source):
    # adj[u] lists neighbors; source must be a valid vertex.
    seen = [False] * len(adj)
    order = []

    def visit(u):
        seen[u] = True
        order.append(u)
        for v in adj[u]:
            if not seen[v]:
                visit(v)

    visit(source)
    return order  # Only the source's reachable component.`,
    cpp: `#include <functional>
#include <vector>

std::vector<int> dfs(const std::vector<std::vector<int>>& adj,
                     int source) {
    std::vector<bool> seen(adj.size(), false);
    std::vector<int> order;
    std::function<void(int)> visit = [&](int u) {
        seen[u] = true;
        order.push_back(u);
        for (int v : adj[u]) {
            if (!seen[v]) visit(v);
        }
    };
    visit(source);
    return order;  // Only vertices reachable from source.
}`,
  },
  "breadth-first-search": {
    python: `from collections import deque

def bfs(adj, source):
    distance = [-1] * len(adj)
    distance[source] = 0
    queue = deque([source])
    order = []

    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            if distance[v] == -1:
                distance[v] = distance[u] + 1
                queue.append(v)  # Mark before enqueuing.

    return distance, order  # -1 means unreachable.`,
    cpp: `#include <queue>
#include <utility>
#include <vector>

std::pair<std::vector<int>, std::vector<int>> bfs(
    const std::vector<std::vector<int>>& adj, int source) {
    std::vector<int> distance(adj.size(), -1), order;
    std::queue<int> queue;
    distance[source] = 0;
    queue.push(source);
    while (!queue.empty()) {
        int u = queue.front();
        queue.pop();
        order.push_back(u);
        for (int v : adj[u]) {
            if (distance[v] == -1) {
                distance[v] = distance[u] + 1;
                queue.push(v);
            }
        }
    }
    return {distance, order};  // -1 means unreachable.
}`,
  },
  dijkstra: {
    python: `from heapq import heappop, heappush
from math import inf

def dijkstra(adj, source):
    # adj[u] contains (v, weight); ALL weights >= 0.
    distance = [inf] * len(adj)
    distance[source] = 0
    heap = [(0, source)]

    while heap:
        d, u = heappop(heap)
        if d != distance[u]:
            continue  # Discard an outdated queue entry.
        for v, weight in adj[u]:
            candidate = d + weight
            if candidate < distance[v]:
                distance[v] = candidate
                heappush(heap, (candidate, v))

    return distance`,
    cpp: `#include <functional>
#include <queue>
#include <utility>
#include <vector>

using ll = long long;
constexpr ll INF = (1LL << 60);

std::vector<ll> dijkstra(
    const std::vector<std::vector<std::pair<int, ll>>>& adj,
    int source) {  // All weights >= 0; path sums < INF.
    std::vector<ll> distance(adj.size(), INF);
    using State = std::pair<ll, int>;
    std::priority_queue<State, std::vector<State>,
                        std::greater<State>> heap;
    distance[source] = 0;
    heap.push({0, source});
    while (!heap.empty()) {
        auto [d, u] = heap.top();
        heap.pop();
        if (d != distance[u]) continue;
        for (auto [v, weight] : adj[u]) {
            if (d + weight < distance[v]) {
                distance[v] = d + weight;
                heap.push({distance[v], v});
            }
        }
    }
    return distance;
}`,
  },
  "topological-sort": {
    python: `from collections import deque

def topological_sort(adj):
    indegree = [0] * len(adj)
    for neighbors in adj:
        for v in neighbors:
            indegree[v] += 1
    queue = deque(u for u, d in enumerate(indegree) if d == 0)
    order = []

    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)

    return order if len(order) == len(adj) else None`,
    cpp: `#include <optional>
#include <queue>
#include <vector>

std::optional<std::vector<int>> topological_sort(
    const std::vector<std::vector<int>>& adj) {
    int n = static_cast<int>(adj.size());
    std::vector<int> indegree(n, 0), order;
    for (const auto& neighbors : adj)
        for (int v : neighbors) ++indegree[v];
    std::queue<int> queue;
    for (int u = 0; u < n; ++u)
        if (indegree[u] == 0) queue.push(u);
    while (!queue.empty()) {
        int u = queue.front();
        queue.pop();
        order.push_back(u);
        for (int v : adj[u])
            if (--indegree[v] == 0) queue.push(v);
    }
    if (static_cast<int>(order.size()) != n) return std::nullopt;
    return order;
}`,
  },
  "bellman-ford": {
    python: `from math import inf

def bellman_ford(n, edges, source):
    # Directed edges: (u, v, weight).
    distance = [inf] * n
    distance[source] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, weight in edges:
            if distance[u] != inf and distance[u] + weight < distance[v]:
                distance[v] = distance[u] + weight
                changed = True
        if not changed:
            break

    for u, v, weight in edges:
        if distance[u] != inf and distance[u] + weight < distance[v]:
            return None  # Negative cycle reachable from source.
    return distance`,
    cpp: `#include <optional>
#include <tuple>
#include <vector>

using ll = long long;
constexpr ll INF = (1LL << 60);

std::optional<std::vector<ll>> bellman_ford(
    int n, const std::vector<std::tuple<int, int, ll>>& edges,
    int source) {  // Intermediate sums must fit in long long.
    std::vector<ll> distance(n, INF);
    distance[source] = 0;
    for (int pass = 1; pass < n; ++pass) {
        bool changed = false;
        for (auto [u, v, weight] : edges) {
            if (distance[u] != INF && distance[u] + weight < distance[v]) {
                distance[v] = distance[u] + weight;
                changed = true;
            }
        }
        if (!changed) break;
    }
    for (auto [u, v, weight] : edges)
        if (distance[u] != INF && distance[u] + weight < distance[v])
            return std::nullopt;
    return distance;
}`,
  },
  "floyd-warshall": {
    python: `from math import inf

def floyd_warshall(n, edges):
    # Directed edges: (u, v, weight).
    distance = [[inf] * n for _ in range(n)]
    for u in range(n):
        distance[u][u] = 0
    for u, v, weight in edges:
        distance[u][v] = min(distance[u][v], weight)

    for k in range(n):  # Intermediate vertex MUST be outermost.
        for i in range(n):
            for j in range(n):
                if distance[i][k] != inf and distance[k][j] != inf:
                    distance[i][j] = min(
                        distance[i][j], distance[i][k] + distance[k][j])

    negative_cycle = any(distance[u][u] < 0 for u in range(n))
    return distance, negative_cycle  # Affected pairs have no finite minimum.`,
    cpp: `#include <algorithm>
#include <tuple>
#include <utility>
#include <vector>

using ll = long long;
constexpr ll INF = (1LL << 60);

std::pair<std::vector<std::vector<ll>>, bool> floyd_warshall(
    int n, const std::vector<std::tuple<int, int, ll>>& edges) {
    // All intermediate sums must fit in long long.
    std::vector<std::vector<ll>> d(n, std::vector<ll>(n, INF));
    for (int u = 0; u < n; ++u) d[u][u] = 0;
    for (auto [u, v, weight] : edges)
        d[u][v] = std::min(d[u][v], weight);
    for (int k = 0; k < n; ++k)
        for (int i = 0; i < n; ++i)
            for (int j = 0; j < n; ++j)
                if (d[i][k] != INF && d[k][j] != INF)
                    d[i][j] = std::min(d[i][j], d[i][k] + d[k][j]);
    bool negative_cycle = false;
    for (int u = 0; u < n; ++u)
        if (d[u][u] < 0) negative_cycle = true;
    return {d, negative_cycle};
}`,
  },
  prim: {
    python: `from heapq import heappop, heappush

def prim(adj):
    # Undirected: store (v, weight) at BOTH endpoints.
    seen = [False] * len(adj)
    forest, total = [], 0
    for root in range(len(adj)):
        if seen[root]:
            continue
        heap = [(0, root, -1)]
        while heap:
            weight, u, parent = heappop(heap)
            if seen[u]:
                continue
            seen[u] = True
            if parent != -1:
                forest.append((parent, u, weight))
                total += weight
            for v, w in adj[u]:
                if not seen[v]:
                    heappush(heap, (w, v, u))
    return forest, total  # A forest if disconnected.`,
    cpp: `#include <functional>
#include <queue>
#include <tuple>
#include <utility>
#include <vector>

using ll = long long;
using Edge = std::tuple<int, int, ll>;

std::pair<std::vector<Edge>, ll> prim(
    const std::vector<std::vector<std::pair<int, ll>>>& adj) {
    // Store each undirected edge at both endpoints.
    int n = static_cast<int>(adj.size());
    std::vector<bool> seen(n, false);
    std::vector<Edge> forest;
    ll total = 0;
    using State = std::tuple<ll, int, int>;
    for (int root = 0; root < n; ++root) {
        if (seen[root]) continue;
        std::priority_queue<State, std::vector<State>,
                            std::greater<State>> heap;
        heap.push({0, root, -1});
        while (!heap.empty()) {
            auto [weight, u, parent] = heap.top();
            heap.pop();
            if (seen[u]) continue;
            seen[u] = true;
            if (parent != -1) {
                forest.push_back({parent, u, weight});
                total += weight;
            }
            for (auto [v, w] : adj[u])
                if (!seen[v]) heap.push({w, v, u});
        }
    }
    return {forest, total};
}`,
  },
  kruskal: {
    python: `# Undirected edges are listed once as (u, v, weight).
${pythonDSU}

def kruskal(n, edges):
    dsu = DSU(n)
    forest, total = [], 0
    for u, v, weight in sorted(edges, key=lambda e: e[2]):
        if dsu.union(u, v):
            forest.append((u, v, weight))
            total += weight
    return forest, total  # V - components accepted edges.`,
    cpp: `${cppDSU}

#include <algorithm>
#include <tuple>
using ll = long long;
using Edge = std::tuple<int, int, ll>;

std::pair<std::vector<Edge>, ll> kruskal(int n, std::vector<Edge> edges) {
    std::sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) {
        return std::get<2>(a) < std::get<2>(b);
    });
    DSU dsu(n);
    std::vector<Edge> forest;
    ll total = 0;
    for (auto [u, v, weight] : edges) {
        if (dsu.unite(u, v)) {
            forest.push_back({u, v, weight});
            total += weight;
        }
    }
    return {forest, total};
}`,
  },
  "disjoint-set-union": {
    python: `${pythonDSU}

# Example: vertices 0..5 (A..F in the diagram).
dsu = DSU(6)
dsu.union(0, 1)
dsu.union(1, 2)
connected = dsu.find(0) == dsu.find(2)  # True
merged = dsu.union(0, 2)  # False: already in one component.`,
    cpp: `${cppDSU}

// Example: vertices 0..5 (A..F in the diagram).
bool connectivity_example() {
    DSU dsu(6);
    dsu.unite(0, 1);
    dsu.unite(1, 2);
    return dsu.find(0) == dsu.find(2);  // true
}`,
  },
  "bipartite-check": {
    python: `from collections import deque

def is_bipartite(adj):
    # Undirected adjacency list; include both directions.
    color = [-1] * len(adj)
    for root in range(len(adj)):
        if color[root] != -1:
            continue
        color[root] = 0
        queue = deque([root])
        while queue:
            u = queue.popleft()
            for v in adj[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    queue.append(v)
                elif color[v] == color[u]:
                    return False
    return True`,
    cpp: `#include <queue>
#include <vector>

bool is_bipartite(const std::vector<std::vector<int>>& adj) {
    int n = static_cast<int>(adj.size());
    std::vector<int> color(n, -1);
    for (int root = 0; root < n; ++root) {
        if (color[root] != -1) continue;
        std::queue<int> queue;
        queue.push(root);
        color[root] = 0;
        while (!queue.empty()) {
            int u = queue.front();
            queue.pop();
            for (int v : adj[u]) {
                if (color[v] == -1) {
                    color[v] = 1 - color[u];
                    queue.push(v);
                } else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}`,
  },
  "directed-cycle-detection": {
    python: `def has_directed_cycle(adj):
    state = [0] * len(adj)  # 0: unseen, 1: active, 2: done

    def visit(u):
        state[u] = 1
        for v in adj[u]:
            if state[v] == 1:
                return True  # Back edge into the active path.
            if state[v] == 0 and visit(v):
                return True
        state[u] = 2
        return False

    for u in range(len(adj)):
        if state[u] == 0 and visit(u):
            return True
    return False`,
    cpp: `#include <functional>
#include <vector>

bool has_directed_cycle(const std::vector<std::vector<int>>& adj) {
    int n = static_cast<int>(adj.size());
    std::vector<int> state(n, 0);
    std::function<bool(int)> visit = [&](int u) {
        state[u] = 1;
        for (int v : adj[u]) {
            if (state[v] == 1) return true;
            if (state[v] == 0 && visit(v)) return true;
        }
        state[u] = 2;
        return false;
    };
    for (int u = 0; u < n; ++u)
        if (state[u] == 0 && visit(u)) return true;
    return false;
}`,
  },
  kosaraju: {
    python: `def kosaraju(adj):
    n = len(adj)
    seen, finish = [False] * n, []

    def dfs1(u):
        seen[u] = True
        for v in adj[u]:
            if not seen[v]:
                dfs1(v)
        finish.append(u)  # Postorder, NOT discovery order.

    for u in range(n):
        if not seen[u]:
            dfs1(u)
    transpose = [[] for _ in range(n)]
    for u in range(n):
        for v in adj[u]:
            transpose[v].append(u)
    seen = [False] * n
    components = []

    def dfs2(u, component):
        seen[u] = True
        component.append(u)
        for v in transpose[u]:
            if not seen[v]:
                dfs2(v, component)

    for u in reversed(finish):
        if not seen[u]:
            component = []
            dfs2(u, component)
            components.append(component)
    return components`,
    cpp: `#include <algorithm>
#include <functional>
#include <vector>

std::vector<std::vector<int>> kosaraju(
    const std::vector<std::vector<int>>& adj) {
    int n = static_cast<int>(adj.size());
    std::vector<bool> seen(n, false);
    std::vector<int> finish;
    std::function<void(int)> dfs1 = [&](int u) {
        seen[u] = true;
        for (int v : adj[u]) if (!seen[v]) dfs1(v);
        finish.push_back(u);
    };
    for (int u = 0; u < n; ++u) if (!seen[u]) dfs1(u);
    std::vector<std::vector<int>> transpose(n), components;
    for (int u = 0; u < n; ++u)
        for (int v : adj[u]) transpose[v].push_back(u);
    std::fill(seen.begin(), seen.end(), false);
    std::function<void(int, std::vector<int>&)> dfs2 =
        [&](int u, std::vector<int>& component) {
            seen[u] = true;
            component.push_back(u);
            for (int v : transpose[u]) if (!seen[v]) dfs2(v, component);
        };
    for (auto it = finish.rbegin(); it != finish.rend(); ++it) {
        if (!seen[*it]) {
            components.emplace_back();
            dfs2(*it, components.back());
        }
    }
    return components;
}`,
  },
  tarjan: {
    python: `def tarjan_scc(adj):
    n = len(adj)
    index, low = [-1] * n, [-1] * n
    stack, on_stack, components = [], [False] * n, []
    timer = 0

    def visit(u):
        nonlocal timer
        index[u] = low[u] = timer
        timer += 1
        stack.append(u)
        on_stack[u] = True
        for v in adj[u]:
            if index[v] == -1:
                visit(v)
                low[u] = min(low[u], low[v])
            elif on_stack[v]:
                low[u] = min(low[u], index[v])
        if low[u] == index[u]:
            component = []
            while True:
                v = stack.pop()
                on_stack[v] = False
                component.append(v)
                if v == u:
                    break
            components.append(component)

    for u in range(n):
        if index[u] == -1:
            visit(u)
    return components`,
    cpp: `#include <algorithm>
#include <functional>
#include <vector>

std::vector<std::vector<int>> tarjan_scc(
    const std::vector<std::vector<int>>& adj) {
    int n = static_cast<int>(adj.size()), timer = 0;
    std::vector<int> index(n, -1), low(n, -1), stack;
    std::vector<bool> on_stack(n, false);
    std::vector<std::vector<int>> components;
    std::function<void(int)> visit = [&](int u) {
        index[u] = low[u] = timer++;
        stack.push_back(u);
        on_stack[u] = true;
        for (int v : adj[u]) {
            if (index[v] == -1) {
                visit(v);
                low[u] = std::min(low[u], low[v]);
            } else if (on_stack[v]) low[u] = std::min(low[u], index[v]);
        }
        if (low[u] == index[u]) {
            components.emplace_back();
            int v;
            do {
                v = stack.back();
                stack.pop_back();
                on_stack[v] = false;
                components.back().push_back(v);
            } while (v != u);
        }
    };
    for (int u = 0; u < n; ++u) if (index[u] == -1) visit(u);
    return components;
}`,
  },
};

// Both undirected low-link lessons share the same traversal, but return different results.
const pythonCuts = `def find_cuts(n, edges):
    # Undirected edges listed ONCE as (u, v).
    # Edge IDs make parallel edges safe.
    adj = [[] for _ in range(n)]
    for edge_id, (u, v) in enumerate(edges):
        adj[u].append((v, edge_id))
        adj[v].append((u, edge_id))
    discovery, low = [-1] * n, [-1] * n
    bridges, articulation = [], set()
    timer = 0

    def visit(u, parent_edge=-1):
        nonlocal timer
        discovery[u] = low[u] = timer
        timer += 1
        children = 0
        for v, edge_id in adj[u]:
            if edge_id == parent_edge:
                continue
            if discovery[v] == -1:
                children += 1
                visit(v, edge_id)
                low[u] = min(low[u], low[v])
                if low[v] > discovery[u]:
                    bridges.append(edge_id)
                if parent_edge != -1 and low[v] >= discovery[u]:
                    articulation.add(u)
            else:
                low[u] = min(low[u], discovery[v])
        if parent_edge == -1 and children > 1:
            articulation.add(u)

    for u in range(n):
        if discovery[u] == -1:
            visit(u)
    return bridges, sorted(articulation)`;

const cppCuts = `#include <algorithm>
#include <functional>
#include <utility>
#include <vector>

// Returns {bridge edge IDs, articulation vertices}.
std::pair<std::vector<int>, std::vector<int>> find_cuts(
    int n, const std::vector<std::pair<int, int>>& edges) {
    std::vector<std::vector<std::pair<int, int>>> adj(n);
    for (int id = 0; id < static_cast<int>(edges.size()); ++id) {
        auto [u, v] = edges[id];
        adj[u].push_back({v, id});
        adj[v].push_back({u, id});
    }
    std::vector<int> discovery(n, -1), low(n, -1), bridges, cuts;
    std::vector<bool> articulation(n, false);
    int timer = 0;
    std::function<void(int, int)> visit = [&](int u, int parent_edge) {
        discovery[u] = low[u] = timer++;
        int children = 0;
        for (auto [v, id] : adj[u]) {
            if (id == parent_edge) continue;
            if (discovery[v] == -1) {
                ++children;
                visit(v, id);
                low[u] = std::min(low[u], low[v]);
                if (low[v] > discovery[u]) bridges.push_back(id);
                if (parent_edge != -1 && low[v] >= discovery[u])
                    articulation[u] = true;
            } else low[u] = std::min(low[u], discovery[v]);
        }
        if (parent_edge == -1 && children > 1) articulation[u] = true;
    };
    for (int u = 0; u < n; ++u) if (discovery[u] == -1) visit(u, -1);
    for (int u = 0; u < n; ++u) if (articulation[u]) cuts.push_back(u);
    return {bridges, cuts};
}`;

graphCode.bridges = { python: pythonCuts, cpp: cppCuts };
graphCode["articulation-points"] = { python: pythonCuts, cpp: cppCuts };
