"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { ListScenario, ListStep } from "@/lib/linked-list-traces";

function ListDiagram({ step, scenario, id }: { step: ListStep; scenario: ListScenario; id: string }) {
  // Reserve the final canvas from the first step so new allocations do not move existing nodes.
  const allNodes = scenario.steps[scenario.steps.length - 1].nodes;
  const width = Math.max(510, ...allNodes.map((node) => node.column * 116 + 156));
  const height = Math.max(215, ...allNodes.map((node) => node.row * 158 + 205));
  const position = (node: { row: number; column: number }) => [74 + node.column * 116, 72 + node.row * 158];
  return <div className="list-diagram-scroll" role="region" aria-label="Linked list pointer diagram" tabIndex={0}><svg className="list-diagram" viewBox={`0 0 ${width} ${height}`} style={{ minWidth: Math.min(width, 580) }} role="img" aria-labelledby={`${id}-title ${id}-description`}>
    <title id={`${id}-title`}>{`${scenario.label}: ${step.title}`}</title>
    <desc id={`${id}-description`}>{`${step.explanation} Node positions stay fixed while arrows change. The pointer strip and node table below give the same state in text.`}</desc>
    <defs>{["normal", "changed", "random"].map((tone) => <marker key={tone} id={`${id}-${tone}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className={`list-arrow is-${tone}`} /></marker>)}</defs>
    {step.nodes.flatMap((from) => {
      const [x1, y1] = position(from);
      const links = [{ target: from.next, random: false }, ...(from.random !== undefined ? [{ target: from.random, random: true }] : [])];
      return links.map(({ target, random }) => {
        if (target === null) return null;
        const to = step.nodes.find((node) => node.id === target);
        if (!to) return null;
        const [x2, y2] = position(to), tone = random ? "random" : step.changed.includes(from.id) ? "changed" : "normal";
        let path: string;
        if (from.id === to.id) path = `M ${x1 + 25} ${y1 + 20} C ${x1 + 92} ${y1 + 90}, ${x1 - 68} ${y1 + 90}, ${x1 - 22} ${y1 + 23}`;
        else if (y1 !== y2) path = `M ${x1} ${y1 + (y2 > y1 ? 28 : -28)} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2 + (y2 > y1 ? -34 : 34)}`;
        else if (!random && x2 > x1 && to.column === from.column + 1) path = `M ${x1 + 33} ${y1} L ${x2 - 37} ${y2}`;
        else {
          const bend = 54 + (Math.abs(to.column - from.column) % 3) * 12;
          path = `M ${x1} ${y1 + 28} C ${x1} ${y1 + bend}, ${x2} ${y2 + bend}, ${x2} ${y2 + 34}`;
        }
        return <path key={`${from.id}-${random}`} d={path} className={`list-link is-${tone}`} markerEnd={`url(#${id}-${tone})`} />;
      });
    })}
    {step.nodes.map((node) => {
      const [x, y] = position(node), active = step.active.includes(node.id);
      const names = Object.entries(step.pointers).filter(([, target]) => target === node.id).map(([name]) => name);
      return <g key={node.id} transform={`translate(${x} ${y})`} className={`list-node${active ? " is-active" : ""}${node.removed ? " is-removed" : ""}${step.done && step.output.includes(node.id) ? " is-result" : ""}`}>
        <text className="list-node-pointers" textAnchor="middle" y="-44">{names.slice(0, 3).join(" · ")}{names.length > 3 ? " …" : ""}</text>
        <rect className="list-node-base" x="-33" y="-22" width="66" height="54" rx="10" />
        <rect className="list-node-face" x="-33" y="-28" width="66" height="54" rx="10" />
        <text className="list-node-value" textAnchor="middle" y="6">{node.value}</text>
        <text className="list-node-id" textAnchor="middle" y="47">{node.id}{node.removed ? " · removed" : ""}</text>
        {node.next === null && !node.removed ? <text className="list-node-null" x="39" y="5">∅</text> : null}
      </g>;
    })}
    {step.nodes.length === 0 ? <text className="list-empty" x={width / 2} y="100" textAnchor="middle">head → null</text> : null}
  </svg></div>;
}

export function LinkedListWalkthrough({ scenarios, title }: { scenarios: ListScenario[]; title: string }) {
  const [scenarioIndex, setScenarioIndex] = useState(0), [stepIndex, setStepIndex] = useState(0);
  const id = useId(), scenario = scenarios[scenarioIndex], step = scenario.steps[stepIndex];
  const finished = stepIndex === scenario.steps.length - 1;
  return <section className="panel search-walkthrough graph-walkthrough list-walkthrough" aria-labelledby={`${id}-heading`}>
    <div className="tutorial-section-heading"><div><h2 id={`${id}-heading`}>See {title}, step by step</h2><p>Follow the pointers. Watch each link change.</p></div><label className="target-select">Example <select value={scenarioIndex} onChange={(event) => { setScenarioIndex(Number(event.target.value)); setStepIndex(0); }}>{scenarios.map((item, index) => <option key={item.id} value={index}>{item.label}</option>)}</select></label></div>
    <div className="search-scene-layout graph-scene-layout">
      <div className="search-illustration graph-illustration list-illustration"><div className="scene-caption"><span>{step.nodes.filter((node) => !node.removed && node.value !== "D").length} nodes · singly linked</span><span>IDs = node identity · ∅ = null</span></div><ListDiagram step={step} scenario={scenario} id={id} /><div className="scene-legend"><span><i className="legend-middle" />Current</span><span><i className="legend-visited" />Result</span><span>Yellow arrow: changed next link</span>{step.nodes.some((node) => node.random !== undefined) ? <span>Dashed arrow: random link</span> : null}</div>
        <div className="list-pointer-strip" aria-label="Current pointer values">{Object.entries(step.pointers).map(([name, value]) => <span key={name}><strong>{name}</strong><code>{value ?? "null"}</code></span>)}</div>
        <details className="list-node-details"><summary>Inspect node links</summary><div className="graph-table-scroll" role="region" aria-label="Node links at this step" tabIndex={0}><table className="graph-state-table"><caption>Each row is a distinct node object. D is the dummy sentinel.</caption><thead><tr><th scope="col">Node</th><th scope="col">Value</th><th scope="col">Next</th>{step.nodes.some((node) => node.random !== undefined) ? <th scope="col">Random</th> : null}</tr></thead><tbody>{step.nodes.map((node) => <tr key={node.id} className={step.active.includes(node.id) ? "is-current" : ""}><th scope="row">{node.id}{node.removed ? " (removed)" : ""}</th><td>{node.value}</td><td>{node.next ?? "null"}</td>{step.nodes.some((item) => item.random !== undefined) ? <td>{node.random ?? "null"}</td> : null}</tr>)}</tbody></table></div></details>
      </div>
      <div className="search-step graph-step"><div aria-live="polite" aria-atomic="true"><span className="step-count">Step {String(stepIndex + 1).padStart(2, "0")} <span>/ {scenario.steps.length}</span></span><h3>{step.title}</h3><p>{step.explanation}</p><code className={`step-action${step.done ? " is-found" : ""}`}>{step.action}</code></div>{Object.keys(step.state).length ? <dl className="list-state">{Object.entries(step.state).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl> : null}</div>
    </div>
    <div className="walkthrough-controls graph-controls"><label className="graph-scrubber"><span>Step {stepIndex + 1} of {scenario.steps.length}</span><input type="range" aria-label="Walkthrough step" min={0} max={scenario.steps.length - 1} value={stepIndex} aria-valuetext={`Step ${stepIndex + 1}: ${step.title}`} onChange={(event) => setStepIndex(Number(event.target.value))} /></label><div className="walkthrough-buttons"><Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex(stepIndex - 1)}><Icon name="arrow-right" className="back-icon" size={14} />Previous</Button><Button variant="secondary" disabled={finished} onClick={() => setStepIndex(scenario.steps.length - 1)}>Show result</Button><Button variant={finished ? "secondary" : "primary"} onClick={() => setStepIndex(finished ? 0 : stepIndex + 1)}>{finished ? "Start again" : "Next step"}<Icon name={finished ? "shuffle" : "arrow-right"} size={14} /></Button></div></div>
    <details className="graph-edge-list"><summary>View original input</summary><p>{scenario.input}</p><p>Parameter indices are zero-based, except n from the end, which is one-based. Node IDs remain fixed when links change.</p></details>
  </section>;
}
