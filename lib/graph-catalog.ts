import type { Difficulty } from "./data";

export type GraphCategory = "Traversal" | "Shortest paths" | "Ordering" | "Spanning trees" | "Connectivity";
export type GraphAlgorithm = {
  slug: string;
  title: string;
  shortTitle: string;
  category: GraphCategory;
  difficulty: Difficulty;
  description: string;
  time: string;
  space: string;
};

// Keep the catalog small: code and generated traces stay on the server.
export const graphAlgorithms: GraphAlgorithm[] = [
  { slug: "depth-first-search", title: "Depth-First Search (DFS)", shortTitle: "DFS", category: "Traversal", difficulty: "Easy", description: "Explore a branch completely, then backtrack to the next unexplored neighbor.", time: "O(V + E)", space: "O(V)" },
  { slug: "breadth-first-search", title: "Breadth-First Search (BFS)", shortTitle: "BFS", category: "Traversal", difficulty: "Easy", description: "Explore one level at a time to find shortest paths in an unweighted graph.", time: "O(V + E)", space: "O(V)" },
  { slug: "dijkstra", title: "Dijkstra’s Algorithm", shortTitle: "Dijkstra", category: "Shortest paths", difficulty: "Medium", description: "Settle the nearest vertex and relax its edges using a min-priority queue.", time: "O((V + E) log V)", space: "O(V + E)" },
  { slug: "topological-sort", title: "Topological Sort (Kahn’s Algorithm)", shortTitle: "Kahn", category: "Ordering", difficulty: "Medium", description: "Resolve dependencies by repeatedly removing vertices with no incoming edges.", time: "O(V + E)", space: "O(V)" },
  { slug: "bellman-ford", title: "Bellman–Ford Algorithm", shortTitle: "Bellman–Ford", category: "Shortest paths", difficulty: "Medium", description: "Relax all edges in passes, handle negative weights, and detect reachable negative cycles.", time: "O(V × E)", space: "O(V)" },
  { slug: "floyd-warshall", title: "Floyd–Warshall Algorithm", shortTitle: "Floyd–Warshall", category: "Shortest paths", difficulty: "Medium", description: "Find distances between every pair by allowing one more intermediate vertex at a time.", time: "O(V³)", space: "O(V²)" },
  { slug: "prim", title: "Prim’s Algorithm", shortTitle: "Prim", category: "Spanning trees", difficulty: "Medium", description: "Grow a minimum spanning forest by choosing the cheapest edge leaving each tree.", time: "O((V + E) log V)", space: "O(V + E)" },
  { slug: "kruskal", title: "Kruskal’s Algorithm", shortTitle: "Kruskal", category: "Spanning trees", difficulty: "Medium", description: "Process edges from cheapest to most expensive, skipping any that close a cycle.", time: "O(E log E + V)", space: "O(V + E)" },
  { slug: "disjoint-set-union", title: "Disjoint Set Union (Union-Find)", shortTitle: "Union-Find", category: "Connectivity", difficulty: "Medium", description: "Maintain connected components with path compression and union by size.", time: "O(α(V)) amortized / operation", space: "O(V)" },
  { slug: "bipartite-check", title: "Bipartite Graph Check", shortTitle: "Bipartite check", category: "Connectivity", difficulty: "Medium", description: "Color every component with two colors; adjacent vertices must have opposite colors.", time: "O(V + E)", space: "O(V)" },
  { slug: "directed-cycle-detection", title: "Directed Cycle Detection", shortTitle: "Directed cycles", category: "Ordering", difficulty: "Medium", description: "Track the active DFS path. An edge back into that path proves a directed cycle.", time: "O(V + E)", space: "O(V)" },
  { slug: "kosaraju", title: "Kosaraju’s Algorithm", shortTitle: "Kosaraju", category: "Connectivity", difficulty: "Hard", description: "Find strongly connected components with finishing order and a DFS on reversed edges.", time: "O(V + E)", space: "O(V + E)" },
  { slug: "tarjan", title: "Tarjan’s SCC Algorithm", shortTitle: "Tarjan SCC", category: "Connectivity", difficulty: "Hard", description: "Use discovery indices, low-link values, and an active stack to extract SCCs in one DFS.", time: "O(V + E)", space: "O(V)" },
  { slug: "bridges", title: "Bridges in an Undirected Graph", shortTitle: "Bridges", category: "Connectivity", difficulty: "Hard", description: "Find edges whose removal increases the number of connected components.", time: "O(V + E)", space: "O(V)" },
  { slug: "articulation-points", title: "Articulation Points", shortTitle: "Articulation points", category: "Connectivity", difficulty: "Hard", description: "Find vertices whose removal disconnects an undirected graph using DFS low-link values.", time: "O(V + E)", space: "O(V)" },
];

export const graphCategories: GraphCategory[] = ["Traversal", "Shortest paths", "Ordering", "Spanning trees", "Connectivity"];
