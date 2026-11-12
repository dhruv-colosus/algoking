import type { Metadata } from "next";
import type { CSSProperties } from "react";
import TopicCard from "@/components/home/topic-card";
import { topics } from "@/lib/data";

export const metadata: Metadata = { title: "Learning roadmap" };

// Card positions follow Figma node 250:37, in its 702.685 × 686.736 canvas.
const patterns = [
  { slug: "arrays", x: 368.102, y: 0 },
  { slug: "two-pointers", x: 234, y: 180 },
  { slug: "stacks", x: 496.801, y: 180 },
  { slug: "linked-list", x: 0, y: 372.6 },
  { slug: "sliding-window", x: 234, y: 376.2 },
  { slug: "binary-search", x: 468, y: 376.2 },
  { slug: "trees", x: 233.102, y: 556.2 },
];

// Connectors are vector paths in the same canvas so they stay sharp at any pixel density.
// Each path ends travelling straight down at `tip`, where the arrowhead is drawn.
const connectors = [
  { id: 106, x: 480, y: 133, d: "M.5 0C3 14 30 19 64 23.5S127.5 32 127.5 48", tip: [127.5, 48] },
  { id: 107, x: 324, y: 132, d: "M136.5 0C134 14 115 20 78 20S2.5 22 2.5 43", tip: [2.5, 43] },
  { id: 108, x: 93, y: 301, d: "M226.5 0C226.5 47 170 46 113 45.5S3 40 3 72", tip: [3, 72] },
  { id: 111, x: 323, y: 278.1, d: "M3.5 0V94", tip: [3.5, 94] },
  { id: 112, x: 327, y: 301, d: "M.5 0C.5 47 57 46 114 45.5S224 40 224 72", tip: [224, 72] },
  { id: 109, x: 95, y: 485, d: "M.5 0C.5 47 57 46 114 45.5S224 40 224 72", tip: [224, 72] },
  { id: 110, x: 350, y: 488, d: "M226.5 0C226.5 47 170 46 113 45.5S3 40 3 72", tip: [3, 72] },
];

function position(x: number, y: number, width?: number): CSSProperties {
  return { left: `${x / 702.685 * 100}%`, top: `${y / 686.736 * 100}%`, ...(width ? { width: `${width / 702.685 * 100}%` } : {}) };
}

export default function RoadmapPage() {
  return (
    <div className="page-content roadmap-content">
      <div className="page-heading">
        <div>
          <h1>Explore the roadmap.</h1>
          <p>Start with arrays, follow the connections, and choose a pattern to practice.</p>
        </div>
      </div>
      <section className="roadmap-map" aria-label="Learning roadmap">
        <div className="roadmap-canvas">
          <svg className="roadmap-connectors" viewBox="0 0 702.685 686.736" fill="none" aria-hidden="true">
            {connectors.map((connector) => (
              <g key={connector.id} transform={`translate(${connector.x} ${connector.y})`}>
                <path className="roadmap-connector" d={connector.d} />
                <path className="roadmap-arrowhead" d={`M${connector.tip[0] - 3} ${connector.tip[1] - 3.5}l3 3.5 3-3.5`} />
              </g>
            ))}
          </svg>
          <ol className="roadmap-nodes" aria-label="Patterns in learning order">
            {patterns.map((pattern, index) => {
              const topic = topics.find((item) => item.slug === pattern.slug)!;
              return (
                <li key={pattern.slug} className="roadmap-node" style={position(pattern.x, pattern.y, 205.884)}>
                  <TopicCard topic={topic} index={index} imageWidth={917} imageHeight={618} sizes="(max-width: 760px) 36vw, 260px" />
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
