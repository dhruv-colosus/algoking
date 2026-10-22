"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { GraphScenario, GraphStep } from "@/lib/graph-traces";

const name = (vertex: number) => String.fromCharCode(65 + vertex);
const positions = [[85, 180], [215, 75], [385, 75], [515, 180], [385, 285], [215, 285]];

function GraphDiagram({ scenario, step, id }: { scenario: GraphScenario; step: GraphStep; id: string }) {
  return <svg className="graph-diagram" viewBox="0 0 600 370" role="img" aria-labelledby={`${id}-title ${id}-description`}>
    <title id={`${id}-title`}>{scenario.label}</title>
    <desc id={`${id}-description`}>{`${scenario.directed ? "Directed" : "Undirected"} graph with ${scenario.size} vertices. ${step.reversed ? "All arrows are reversed in this pass. " : ""}${step.title} ${step.explanation} The edge list and state table below provide the graph in text.`}</desc>
    <defs>
      {["normal", "active", "accepted"].map((tone) => <marker key={tone} id={`${id}-arrow-${tone}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className={`graph-arrow is-${tone}`} /></marker>)}
      <pattern id={`${id}-grid`} width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--border)" strokeWidth=".7" /></pattern>
    </defs>
    <rect x="22" y="22" width="556" height="326" rx="12" fill={`url(#${id}-grid)`} opacity=".55" />
    {scenario.edges.map((edge, index) => {
      const from = step.reversed ? edge.to : edge.from, to = step.reversed ? edge.from : edge.to;
      const [x1, y1] = positions[from], [x2, y2] = positions[to];
      const dx = x2 - x1, dy = y2 - y1, distance = Math.hypot(dx, dy);
      const hasReverse = scenario.edges.some((other, otherIndex) => otherIndex !== index && other.from === edge.to && other.to === edge.from);
      const bend = hasReverse ? 28 : 0;
      const cx = (x1 + x2) / 2 - dy / distance * bend, cy = (y1 + y2) / 2 + dx / distance * bend;
      const startLength = Math.hypot(cx - x1, cy - y1), endLength = Math.hypot(x2 - cx, y2 - cy);
      const startX = x1 + (cx - x1) / startLength * 29, startY = y1 + (cy - y1) / startLength * 29;
      const endX = x2 - (x2 - cx) / endLength * 32, endY = y2 - (y2 - cy) / endLength * 32;
      const tone = step.activeEdges.includes(index) ? "active" : step.accepted.includes(index) ? "accepted" : "normal";
      return <g key={index} className={`graph-edge is-${tone}`}>
        <path d={`M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`} markerEnd={scenario.directed ? `url(#${id}-arrow-${tone})` : undefined} />
        {edge.weight !== undefined ? <g transform={`translate(${(x1 + x2) / 2 - dy / distance * bend / 2} ${(y1 + y2) / 2 + dx / distance * bend / 2})`}><rect x="-15" y="-11" width="30" height="22" rx="6" /><text textAnchor="middle" y="4">{edge.weight}</text></g> : null}
      </g>;
    })}
    {Array.from({ length: scenario.size }, (_, vertex) => {
      const [x, y] = positions[vertex];
      const active = step.active.includes(vertex), visited = step.visited.includes(vertex);
      const group = step.groups?.[vertex];
      const groupClass = group !== undefined && group >= 0 ? ` group-${group % 6}` : "";
      return <g key={vertex} transform={`translate(${x} ${y})`} className={`graph-node${visited ? " is-visited" : ""}${active ? " is-active" : ""}${step.warning && active ? " is-warning" : ""}${groupClass}`}>
        <ellipse className="graph-node-shadow" cx="0" cy="13" rx="29" ry="24" />
        <circle className="graph-node-base" cy="6" r="27" />
        <circle className="graph-node-top" r="27" />
        {active ? <circle className="graph-node-ring" r="33" /> : null}
        <text textAnchor="middle" y="6">{name(vertex)}</text>
        {group !== undefined && group >= 0 ? <text className="graph-node-label" textAnchor="middle" y="54">{step.valuesLabel.startsWith("Color") ? `color ${group}` : `set ${group + 1}`}</text> : null}
      </g>;
    })}
  </svg>;
}

export function GraphWalkthrough({ scenarios, title }: { scenarios: GraphScenario[]; title: string }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const id = useId();
  const scenario = scenarios[scenarioIndex], step = scenario.steps[stepIndex];
  const finished = stepIndex === scenario.steps.length - 1;

  return <section className="panel search-walkthrough graph-walkthrough" aria-labelledby={`${id}-heading`}>
    <div className="tutorial-section-heading">
      <div><h2 id={`${id}-heading`}>See {title}, step by step</h2><p>Follow the edges. Watch the state change.</p></div>
      <label className="target-select">Example <select value={scenarioIndex} onChange={(event) => { setScenarioIndex(Number(event.target.value)); setStepIndex(0); }}>{scenarios.map((item, index) => <option value={index} key={item.id}>{item.label}</option>)}</select></label>
    </div>

    <div className="search-scene-layout graph-scene-layout">
      <div className="search-illustration graph-illustration">
        <div className="scene-caption"><span>{scenario.directed ? "Directed" : "Undirected"} · {scenario.size} vertices · {scenario.edges.length} edges</span><span>{step.reversed ? "Reversed edges" : "A = 0, B = 1, …"}</span></div>
        <GraphDiagram scenario={scenario} step={step} id={id} />
        <div className="scene-legend"><span><i className="legend-middle" />Current</span><span><i className="legend-visited" />Visited / accepted</span><span><i className="legend-candidate" />Unvisited</span>{step.groups ? <span>Labels identify components or colors</span> : null}</div>
        {step.matrix ? <div className="graph-table-scroll" role="region" aria-label="All-pairs distance matrix" tabIndex={0}><table className="graph-state-table graph-matrix"><caption>Distances · row → column</caption><thead><tr><th scope="col">From / to</th>{step.matrix.map((_, u) => <th scope="col" key={u}>{name(u)}</th>)}</tr></thead><tbody>{step.matrix.map((row, u) => <tr key={u}><th scope="row">{name(u)}</th>{row.map((value, v) => <td key={v} className={step.active.includes(u) && step.active.includes(v) ? "is-current" : ""}>{value}</td>)}</tr>)}</tbody></table></div> : step.values.length ? <div className="graph-table-scroll" role="region" aria-label={step.valuesLabel} tabIndex={0}><table className="graph-state-table"><caption>{step.valuesLabel}</caption><thead><tr>{step.values.map((_, u) => <th scope="col" key={u}>{name(u)}</th>)}</tr></thead><tbody><tr>{step.values.map((value, u) => <td key={u} className={step.active.includes(u) ? "is-current" : ""}>{value}</td>)}</tr></tbody></table></div> : null}
      </div>
      <div className="search-step graph-step">
        <div aria-live="polite" aria-atomic="true">
          <span className="step-count">Step {String(stepIndex + 1).padStart(2, "0")} <span>/ {scenario.steps.length}</span></span>
          <h3>{step.title}</h3><p>{step.explanation}</p>
          <code className={`step-action${step.warning ? " is-warning" : step.done ? " is-found" : ""}`}>{step.action}</code>
        </div>
        {step.frontierLabel !== "Frontier" && (!step.done || step.frontier.length > 0) ? <div className="graph-state-strip"><h4>{step.frontierLabel}</h4><div>{step.frontier.length ? step.frontier.map((item, index) => <span key={index}>{item}</span>) : <span className="graph-empty-value">Empty</span>}</div></div> : null}
        {step.result.length ? <div className="graph-state-strip"><h4>{step.resultLabel}</h4><div>{step.result.map((item, index) => <span key={index}>{item}</span>)}</div></div> : null}
      </div>
    </div>

    <div className="walkthrough-controls graph-controls">
      <label className="graph-scrubber"><span>Step {stepIndex + 1} of {scenario.steps.length}</span><input type="range" aria-label="Walkthrough step" min={0} max={scenario.steps.length - 1} value={stepIndex} aria-valuetext={`Step ${stepIndex + 1}: ${step.title}`} onChange={(event) => setStepIndex(Number(event.target.value))} /></label>
      <div className="walkthrough-buttons"><Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex(stepIndex - 1)}><Icon name="arrow-right" className="back-icon" size={14} />Previous</Button><Button variant="secondary" disabled={finished} onClick={() => setStepIndex(scenario.steps.length - 1)}>Show result</Button><Button variant={finished ? "secondary" : "primary"} onClick={() => setStepIndex(finished ? 0 : stepIndex + 1)}>{finished ? "Start again" : "Next step"}<Icon name={finished ? "shuffle" : "arrow-right"} size={14} /></Button></div>
    </div>
    <details className="graph-edge-list"><summary>View input edges{step.reversed ? " (original direction)" : ""}</summary><p>{scenario.edges.map(({ from, to, weight }) => `${name(from)} ${scenario.directed ? "→" : "—"} ${name(to)}${weight !== undefined ? ` (${weight})` : ""}`).join(" · ")}</p>{scenario.source !== undefined || ["Best distance from source", "Distance from source", "DFS depth (not shortest distance)"].includes(step.valuesLabel) ? <p>Source: {name(scenario.source ?? 0)}. Adjacency entries follow this edge order.</p> : null}</details>
  </section>;
}
