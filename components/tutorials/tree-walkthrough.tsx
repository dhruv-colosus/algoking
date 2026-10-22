"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { TreeScenario, TreeStep } from "@/lib/tree-traces";

const name = (id: number) => String.fromCharCode(65 + id);

function TreeDiagram({ step, id }: { step: TreeStep; id: string }) {
  const positions = new Map<number, [number, number]>(), seen = new Set<number>();
  let column = 0, maxDepth = 0;
  function place(u: number | null, depth: number) {
    if (u === null || seen.has(u)) return;
    seen.add(u); const node = step.nodes[u];
    place(node.left, depth + 1);
    positions.set(u, [60 + column++ * 76, 65 + depth * 104]);
    maxDepth = Math.max(maxDepth, depth);
    place(node.right, depth + 1);
  }
  place(step.root, 0);
  // New nodes can be awaiting reconnection by a recursive caller.
  for (const u of step.active) if (!seen.has(u) && step.nodes[u]) place(u, maxDepth + 1);
  const width = Math.max(360, column * 76 + 44), height = Math.max(300, maxDepth * 104 + 132);
  return <svg className="graph-diagram tree-diagram" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-title ${id}-description`}>
    <title id={`${id}-title`}>{step.title}</title><desc id={`${id}-description`}>{step.explanation} Node labels identify objects; numbers show their values. The pointer table below provides the same structure in text.</desc>
    <defs><marker id={`${id}-thread`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" /></marker></defs>
    {step.nodes.flatMap((node) => (["left", "right"] as const).map((side) => {
      const child = node[side]; if (child === null || !positions.has(node.id) || !positions.has(child)) return null;
      const [x1, y1] = positions.get(node.id)!, [x2, y2] = positions.get(child)!;
      const distance = Math.hypot(x2 - x1, y2 - y1), dx = (x2 - x1) / distance, dy = (y2 - y1) / distance;
      return <g key={`${node.id}-${side}`} className={`graph-edge${step.active.includes(node.id) && step.active.includes(child) ? " is-active" : step.visited.includes(child) ? " is-accepted" : ""}`}>
        <path d={`M ${x1 + dx * 29} ${y1 + dy * 29} L ${x2 - dx * 31} ${y2 - dy * 31}`} />
        <text className="tree-child-label" x={(x1 + x2) / 2 + (side === "left" ? -12 : 12)} y={(y1 + y2) / 2} textAnchor="middle">{side === "left" ? "L" : "R"}</text>
      </g>;
    }))}
    {step.threads.map(([from, to]) => {
      if (!positions.has(from) || !positions.has(to)) return null;
      const [x1, y1] = positions.get(from)!, [x2, y2] = positions.get(to)!;
      return <path className="tree-thread" key={`${from}-${to}`} d={`M ${x1 + 28} ${y1} Q ${Math.max(x1, x2) + 60} ${(y1 + y2) / 2} ${x2 + 28} ${y2}`} markerEnd={`url(#${id}-thread)`} />;
    })}
    {[...positions].map(([u, [x, y]]) => <g key={u} transform={`translate(${x} ${y})`} className={`graph-node${step.visited.includes(u) ? " is-visited" : ""}${step.active.includes(u) ? " is-active" : ""}${step.warning && step.active.includes(u) ? " is-warning" : ""}`}>
      <ellipse className="graph-node-shadow" cx="0" cy="13" rx="29" ry="24" /><circle className="graph-node-base" cy="6" r="27" /><circle className="graph-node-top" r="27" />
      {step.active.includes(u) ? <circle className="graph-node-ring" r="33" /> : null}
      <text textAnchor="middle" y="6">{step.nodes[u].value}</text><text className="graph-node-label" textAnchor="middle" y="51">{name(u)}{u === step.root ? " · root" : ""}</text>
    </g>)}
    {!positions.size ? <text className="tree-empty" x={width / 2} y={height / 2} textAnchor="middle">Empty tree · root = null</text> : null}
  </svg>;
}

export function TreeWalkthrough({ scenarios, title }: { scenarios: TreeScenario[]; title: string }) {
  const [scenarioIndex, setScenarioIndex] = useState(0), [stepIndex, setStepIndex] = useState(0);
  const id = useId(), scenario = scenarios[scenarioIndex], step = scenario.steps[stepIndex];
  const finished = stepIndex === scenario.steps.length - 1;
  return <section className="panel search-walkthrough graph-walkthrough tree-walkthrough" aria-labelledby={`${id}-heading`}>
    <div className="tutorial-section-heading"><div><h2 id={`${id}-heading`}>See {title}, step by step</h2><p>Follow the branches. Watch the state change.</p></div><label className="target-select">Example <select value={scenarioIndex} onChange={(event) => { setScenarioIndex(Number(event.target.value)); setStepIndex(0); }}>{scenarios.map((item, index) => <option value={index} key={item.id}>{item.label}</option>)}</select></label></div>
    <div className="search-scene-layout graph-scene-layout">
      <div className="search-illustration graph-illustration">
        <div className="scene-caption"><span>{scenario.nodes.length} input nodes{scenario.parameters ? ` · ${scenario.parameters}` : ""}</span><span>L = left · R = right</span></div>
        <TreeDiagram step={step} id={id} />
        <div className="scene-legend"><span><i className="legend-middle" />Current</span><span><i className="legend-visited" />Processed</span><span><i className="legend-candidate" />Pending</span>{step.threads.length ? <span>Dashed = temporary thread</span> : null}</div>
        <details className="graph-edge-list tree-pointer-list"><summary>View child pointers & node state</summary><div className="graph-table-scroll" role="region" aria-label="Tree child pointers and node state" tabIndex={0}><table className="graph-state-table"><caption>{step.valuesLabel} · null means no child</caption><thead><tr><th scope="col">Node</th><th scope="col">Value</th><th scope="col">Left</th><th scope="col">Right</th><th scope="col">State</th></tr></thead><tbody>{step.nodes.map((node) => <tr key={node.id} className={step.active.includes(node.id) ? "is-current" : ""}><th scope="row">{name(node.id)}</th><td>{node.value}</td><td>{node.left === null ? "null" : name(node.left)}</td><td>{node.right === null ? "null" : name(node.right)}</td><td>{step.values[node.id] ?? "—"}</td></tr>)}</tbody></table></div></details>
      </div>
      <div className="search-step graph-step"><div aria-live="polite" aria-atomic="true"><span className="step-count">Step {String(stepIndex + 1).padStart(2, "0")} <span>/ {scenario.steps.length}</span></span><h3>{step.title}</h3><p>{step.explanation}</p><code className={`step-action${step.warning ? " is-warning" : step.done ? " is-found" : ""}`}>{step.action}</code></div>
        {step.frontier.length ? <div className="graph-state-strip"><h4>{step.frontierLabel}</h4><div>{step.frontier.map((item, index) => <span key={index}>{item}</span>)}</div></div> : null}
        {step.result.length || step.done ? <div className="graph-state-strip"><h4>{step.done ? "Final result" : "Output so far"}</h4><div>{step.result.length ? step.result.map((item, index) => <span key={index}>{item}</span>) : <span className="graph-empty-value">[]</span>}</div></div> : null}
      </div>
    </div>
    <div className="walkthrough-controls graph-controls"><label className="graph-scrubber"><span>Step {stepIndex + 1} of {scenario.steps.length}</span><input type="range" aria-label="Walkthrough step" min={0} max={scenario.steps.length - 1} value={stepIndex} aria-valuetext={`Step ${stepIndex + 1}: ${step.title}`} onChange={(event) => setStepIndex(Number(event.target.value))} /></label><div className="walkthrough-buttons"><Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex(stepIndex - 1)}><Icon name="arrow-right" className="back-icon" size={14} />Previous</Button><Button variant="secondary" disabled={finished} onClick={() => setStepIndex(scenario.steps.length - 1)}>Show result</Button><Button variant={finished ? "secondary" : "primary"} onClick={() => setStepIndex(finished ? 0 : stepIndex + 1)}>{finished ? "Start again" : "Next step"}<Icon name={finished ? "shuffle" : "arrow-right"} size={14} /></Button></div></div>
    <details className="graph-edge-list"><summary>View original input</summary><p>{scenario.nodes.length ? scenario.nodes.map((node) => `${name(node.id)}:${node.value} [L:${node.left === null ? "null" : name(node.left)}, R:${node.right === null ? "null" : name(node.right)}]`).join(" · ") : "Empty tree"}</p>{scenario.parameters ? <p>{scenario.parameters}</p> : null}<p>Node IDs stay distinct even when values repeat. Pointer mutations update the diagram; removed nodes remain in the state table for reference.</p></details>
  </section>;
}
