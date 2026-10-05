import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import TopicCard from "@/components/home/topic-card";
import { topics } from "@/lib/data";

export const metadata: Metadata = { title: "Learning roadmap" };

// Positions follow Figma node 250:37, in its 702.685 × 686.736 canvas.
const patterns = [
  { slug: "arrays", x: 368.102, y: 0, width: 260, height: 185 },
  { slug: "two-pointers", x: 234, y: 180, width: 232, height: 156 },
  { slug: "stacks", x: 496.801, y: 180, width: 232, height: 156 },
  { slug: "linked-list", x: 0, y: 372.6, width: 232, height: 156 },
  { slug: "sliding-window", x: 234, y: 376.2, width: 232, height: 156 },
  { slug: "binary-search", x: 468, y: 376.2, width: 232, height: 156 },
  { slug: "trees", x: 233.102, y: 556.2, width: 232, height: 156 },
];

const connectors = [
  { id: 106, x: 480, y: 133, width: 131, height: 49 },
  { id: 107, x: 324, y: 132, width: 138, height: 44 },
  { id: 108, x: 93, y: 301, width: 227, height: 73 },
  { id: 111, x: 323, y: 278.1, width: 7, height: 95 },
  { id: 112, x: 327, y: 301, width: 227, height: 73 },
  { id: 109, x: 95, y: 485, width: 227, height: 73 },
  { id: 110, x: 350, y: 488, width: 227, height: 73 },
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
          <div className="roadmap-connectors" aria-hidden="true">
            {connectors.map((connector) => (
              <Image key={connector.id} src={`/roadmap/connector-${connector.id}.png`} alt="" width={connector.width} height={connector.height} className="roadmap-connector" style={position(connector.x, connector.y, connector.width)} sizes="(max-width: 760px) 32vw, 240px" />
            ))}
          </div>
          <ol className="roadmap-nodes" aria-label="Patterns in learning order">
            {patterns.map((pattern, index) => {
              const topic = topics.find((item) => item.slug === pattern.slug)!;
              return (
                <li key={pattern.slug} className={`roadmap-node ${index === 0 ? "roadmap-root" : ""}`} style={position(pattern.x, pattern.y, 205.884)}>
                  <TopicCard topic={{ ...topic, image: `/roadmap/${pattern.slug}.png` }} index={index} imageWidth={pattern.width} imageHeight={pattern.height} sizes="(max-width: 760px) 32vw, 240px" />
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
