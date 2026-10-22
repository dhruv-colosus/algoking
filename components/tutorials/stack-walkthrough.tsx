"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { StackScenario, StackStep } from "@/lib/stack-traces";

function StackDiagram({ step, id, height }: { step: StackStep; id: string; height: number }) {
  const width = Math.max(420, step.values.length * 54 + 40);
  const stacks = [{ x: width * .29, entries: step.stack, label: "Main stack" }, { x: width * .73, entries: step.secondary, label: "Auxiliary" }];
  return <svg className="stack-diagram" viewBox={`0 0 ${width} ${height}`} style={{ minWidth: width }} role="img" aria-labelledby={`${id}-diagram-title ${id}-diagram-desc`}>
    <title id={`${id}-diagram-title`}>Input and stack state</title>
    <desc id={`${id}-diagram-desc`}>{`Current input index: ${step.cursor}. Main stack bottom to top: ${JSON.stringify(step.stack)}. ${step.secondaryLabel}: ${JSON.stringify(step.secondary)}. ${step.explanation}`}</desc>
    {step.values.map((value, i) => <g key={i} transform={`translate(${24 + i * 54} 20)`} className={`stack-input${i === step.cursor ? " is-current" : ""}`}><rect width="46" height="34" rx="5" /><text x="23" y="22" textAnchor="middle">{String(value).length > 5 ? String(value).slice(0, 4) + "…" : value}</text><text className="stack-index" x="23" y="51" textAnchor="middle">{i === step.cursor ? `i=${i}` : i}</text></g>)}
    {!step.values.length ? <text className="stack-empty" x={width / 2} y="42" textAnchor="middle">Empty input</text> : null}
    {stacks.map(({ x, entries, label }) => <g key={label}>
      <path className="stack-tray" d={`M ${x - 82} 112 V ${height - 30} H ${x + 82} V 112`} />
      <text className="stack-label" x={x} y={height - 8} textAnchor="middle">{label} · bottom → top ↑</text>
      {entries.length ? entries.map((entry, index) => {
        const y = height - 64 - index * 32, top = index === entries.length - 1;
        return <g className={`stack-entry${top ? " is-top" : ""}`} key={index}><path className="stack-entry-depth" d={`M ${x - 70} ${y + 4} l 6 4 h 140 v -26 l -6 -4 Z`} /><rect x={x - 70} y={y - 22} width="140" height="26" rx="4" /><text x={x} y={y - 4} textAnchor="middle">{entry.length > 17 ? entry.slice(0, 15) + "…" : entry}</text>{top ? <text className="stack-top-label" x={x + 84} y={y - 4}>top</text> : null}</g>;
      }) : <text className="stack-empty" x={x} y={height - 49} textAnchor="middle">empty</text>}
    </g>)}
  </svg>;
}

export function StackWalkthrough({ scenarios, title }: { scenarios: StackScenario[]; title: string }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const id = useId(), scenario = scenarios[scenarioIndex], step = scenario.steps[stepIndex];
  const finished = stepIndex === scenario.steps.length - 1;
  const height = Math.max(300, ...scenario.steps.map((item) => Math.max(item.stack.length, item.secondary.length) * 32 + 145));
  return <section className="panel search-walkthrough graph-walkthrough stack-walkthrough" aria-labelledby={`${id}-heading`}>
    <div className="tutorial-section-heading"><div><h2 id={`${id}-heading`}>See {title}, step by step</h2><p>Inspect each push, pop, and recorded answer. Entries such as 2: 5 mean index: value.</p></div><label className="target-select">Example <select value={scenarioIndex} onChange={(event) => { setScenarioIndex(Number(event.target.value)); setStepIndex(0); }}>{scenarios.map((item, i) => <option key={item.id} value={i}>{item.label}</option>)}</select></label></div>
    <div className="search-scene-layout graph-scene-layout">
      <div className="search-illustration graph-illustration">
        <div className="scene-caption"><span>Zero-based input · top labeled explicitly</span><strong>{scenario.k !== undefined ? `k = ${scenario.k}` : "LIFO"}</strong></div>
        {scenario.matrix ? <div className="graph-table-scroll stack-matrix"><table className="graph-state-table"><caption>Binary matrix · the current row builds histogram heights</caption><tbody>{scenario.matrix.map((row, r) => <tr key={r} className={step.stats.some(([key, value]) => key === "Row" && Number(value) === r) ? "is-current" : ""}><th scope="row">Row {r}</th>{row.map((value, c) => <td key={c}>{value}</td>)}</tr>)}</tbody></table></div> : null}
        <div className="stack-diagram-scroll" role="region" aria-label="Stack diagram; scroll to inspect all values" tabIndex={0}><StackDiagram step={step} id={id} height={height} /></div>
        <dl className="window-stats"><div><dt>Current input index</dt><dd>{step.cursor < 0 ? "—" : step.cursor >= step.values.length ? "End sentinel" : step.cursor}</dd></div><div><dt>Main stack size</dt><dd>{step.stack.length}</dd></div>{step.stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </div>
      <div className="search-step graph-step"><div aria-live="polite" aria-atomic="true"><span className="step-count">Step {String(stepIndex + 1).padStart(2, "0")} <span>/ {scenario.steps.length}</span></span><h3>{step.title}</h3><p>{step.explanation}</p></div><div className="graph-state-strip"><h4>{finished ? "Answer" : "Answer so far"}</h4><div><span>{step.result === null ? "Not recorded yet" : JSON.stringify(step.result)}</span></div></div><dl className="list-state"><div><dt>Main stack · bottom → top</dt><dd>{step.stack.length ? step.stack.join(" → ") : "Empty"}</dd></div><div><dt>{step.secondaryLabel}</dt><dd>{step.secondary.length ? step.secondary.join(" → ") : "Empty"}</dd></div></dl></div>
    </div>
    <div className="walkthrough-controls graph-controls"><label className="graph-scrubber"><span>Step {stepIndex + 1} of {scenario.steps.length}</span><input type="range" aria-label="Walkthrough step" min={0} max={scenario.steps.length - 1} value={stepIndex} aria-valuetext={`Step ${stepIndex + 1}: ${step.title}`} onChange={(event) => setStepIndex(Number(event.target.value))} /></label><div className="walkthrough-buttons"><Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}><Icon name="arrow-right" className="back-icon" size={14} />Previous</Button><Button variant="secondary" disabled={finished} onClick={() => setStepIndex(scenario.steps.length - 1)}>Show result</Button><Button variant={finished ? "secondary" : "primary"} onClick={() => setStepIndex((i) => finished ? 0 : i + 1)}>{finished ? "Start again" : "Next step"}<Icon name={finished ? "shuffle" : "arrow-right"} size={14} /></Button></div></div>
    <details className="graph-edge-list"><summary>View exact input and state</summary><p>Input: {JSON.stringify(scenario.matrix ?? scenario.values)}{scenario.k !== undefined ? ` · k = ${scenario.k}` : ""}</p><p>Main stack: {JSON.stringify(step.stack)}. {step.secondaryLabel}: {JSON.stringify(step.secondary)}.</p></details>
  </section>;
}
