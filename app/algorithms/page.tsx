import type { Metadata } from "next";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { algorithms } from "@/lib/data";
import { linkedListAlgorithms } from "@/lib/linked-list-catalog";
import { treeAlgorithms } from "@/lib/tree-catalog";
import { graphAlgorithms } from "@/lib/graph-catalog";

import { windowAlgorithms } from "@/lib/sliding-window-catalog";

import { stackAlgorithms } from "@/lib/stack-catalog";

import { searchAlgorithms } from "@/lib/binary-search-catalog";

export const metadata: Metadata = { title: "Top algorithms" };

export default function AlgorithmsPage() {
  return <div className="page-content"><div className="page-heading"><div><span className="eyebrow">THE BUILDING BLOCKS</span><h1>A few patterns. A lot of possibilities.</h1><p>Understand the idea first. The right solution starts to look familiar.</p></div></div><section className="panel graph-collection-banner"><div><h2>Graph algorithms</h2><p>{graphAlgorithms.length} interactive lessons. DFS, BFS, shortest paths, spanning trees, and connectivity.</p></div><Button href="/algorithms/graphs" variant="primary">Explore graphs<Icon name="arrow-right" size={14} /></Button></section><section className="panel graph-collection-banner"><div><h2>Sliding window algorithms</h2><p>{windowAlgorithms.length} interactive lessons. Fixed windows, variable windows, frequency maps, counting, and monotonic deques.</p></div><Button href="/algorithms/sliding-window" variant="primary">Explore sliding window<Icon name="arrow-right" size={14} /></Button></section><section className="panel graph-collection-banner"><div><h2>Linked list algorithms</h2><p>{linkedListAlgorithms.length} interactive lessons. Pointer basics, cycles, reversal, merging, and sorting.</p></div><Button href="/algorithms/linked-list" variant="primary">Explore linked lists<Icon name="arrow-right" size={14} /></Button></section><section className="panel graph-collection-banner"><div><h2>Tree algorithms</h2><p>{treeAlgorithms.length} interactive lessons. Traversals, paths, views, binary search trees, and construction.</p></div><Button href="/algorithms/trees" variant="primary">Explore trees<Icon name="arrow-right" size={14} /></Button></section><section className="panel graph-collection-banner"><div><h2>Stack algorithms</h2><p>{stackAlgorithms.length} interactive lessons. Stack foundations, expressions, monotonic stacks, areas, and greedy algorithms.</p></div><Button href="/algorithms/stacks" variant="primary">Explore stacks<Icon name="arrow-right" size={14} /></Button></section><section className="panel graph-collection-banner"><div><h2>Binary search algorithms</h2><p>{searchAlgorithms.length} interactive lessons. Boundaries, rotations, peaks, matrices, answer search, and two-array partitions.</p></div><Button href="/algorithms/binary-search" variant="primary">Explore binary search<Icon name="arrow-right" size={14} /></Button></section><div className="algorithm-grid">{algorithms.map((algorithm, index) => <article className="panel algorithm-card" key={algorithm.name}><div className="algorithm-topline"><span className="algorithm-number">0{index + 1}</span><span className="subtle-label">{algorithm.label}</span></div><h2>{algorithm.name}</h2><p>{algorithm.description}</p><div className="algorithm-footer"><code className="complexity-pill">{algorithm.complexity}</code><Button href={`/algorithms/${algorithm.topic}`} variant="ghost" size="sm">Explore pattern <Icon name="arrow-right" size={14} /></Button></div></article>)}</div></div>;
}
