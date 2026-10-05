import type { Metadata } from "next";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { algorithms } from "@/lib/data";

export const metadata: Metadata = { title: "Top algorithms" };

export default function AlgorithmsPage() {
  return <div className="page-content"><div className="page-heading"><div><span className="eyebrow">THE BUILDING BLOCKS</span><h1>A few patterns. A lot of possibilities.</h1><p>Understand the idea first. The right solution starts to look familiar.</p></div></div><div className="algorithm-grid">{algorithms.map((algorithm, index) => <article className="panel algorithm-card" key={algorithm.name}><div className="algorithm-topline"><span className="algorithm-number">0{index + 1}</span><span className="subtle-label">{algorithm.label}</span></div><h2>{algorithm.name}</h2><p>{algorithm.description}</p><div className="algorithm-footer"><code className="complexity-pill">{algorithm.complexity}</code><Button href={`/algorithms/${algorithm.topic}`} variant="ghost" size="sm">Explore pattern <Icon name="arrow-right" size={14} /></Button></div></article>)}</div></div>;
}
