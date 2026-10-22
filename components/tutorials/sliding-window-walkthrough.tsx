"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { WindowScenario, WindowStep } from "@/lib/sliding-window-traces";

function WindowDiagram({ scenario, step, id }: { scenario: WindowScenario; step: WindowStep; id: string }) {
  const width = Math.max(360, scenario.values.length * 46 + 48);
  const size = (width - 48) / Math.max(1, scenario.values.length);
  const center = (i: number) => 24 + (i + .5) * size;
  const hasWindow = step.right >= step.left;
  return <svg className="window-diagram" viewBox={`0 0 ${width} 245`} style={{ minWidth: Math.min(width, Math.max(260, scenario.values.length * 38 + 24)) }} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>{`Sliding window over ${scenario.values.length} elements`}</title>
    <desc id={`${id}-desc`}>{`${hasWindow ? `Current window: indices ${step.left} through ${step.right}.` : "The current window is empty."} ${step.best ? `Recorded answer window: indices ${step.best[0]} through ${step.best[1]}.` : ""} ${step.explanation}`}</desc>
    {hasWindow ? <g className="window-boundary"><path d={`M ${center(step.left) - size * .4} 65 V 51 H ${center(step.right) + size * .4} V 65`} /><text x={(center(step.left) + center(step.right)) / 2} y="33" textAnchor="middle">{step.left === step.right ? `L = R = ${step.left}` : `L = ${step.left} · R = ${step.right}`}</text></g> : <text className="window-empty" x={width / 2} y="38" textAnchor="middle">Empty window · L = {step.left}, R = {step.right}</text>}
    {scenario.values.map((value, index) => {
      const active = index >= step.left && index <= step.right;
      return <g key={index} transform={`translate(${center(index)} 105)`} className={`window-cell${active ? " is-middle" : " is-excluded"}`}>
        <path className="iso-face-left" d="M -18 0 L 0 10 L 0 48 L -18 38 Z" />
        <path className="iso-face-right" d="M 0 10 L 18 0 L 18 38 L 0 48 Z" />
        <path className="iso-face-top" d="M -18 0 L 0 -10 L 18 0 L 0 10 Z" />
        <text className="iso-value" x="0" y="32" textAnchor="middle">{value}</text>
        <text className="iso-index" x="0" y="74" textAnchor="middle">{index}</text>
      </g>;
    })}
    {step.best ? <g className="window-best"><path d={`M ${center(step.best[0]) - size * .4} 190 V 200 H ${center(step.best[1]) + size * .4} V 190`} /><text x={(center(step.best[0]) + center(step.best[1])) / 2} y="224" textAnchor="middle">Recorded answer window</text></g> : null}
  </svg>;
}

export function WindowWalkthrough({ scenarios, title }: { scenarios: WindowScenario[]; title: string }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const id = useId();
  const scenario = scenarios[scenarioIndex], step = scenario.steps[stepIndex];
  const finished = stepIndex === scenario.steps.length - 1;
  const result = typeof step.result === "string" && !step.result ? '""' : JSON.stringify(step.result);
  const parameters = [scenario.k !== undefined ? `k = ${scenario.k}` : "", scenario.target !== undefined ? `target = ${scenario.target}` : "", scenario.pattern ? `pattern = ${scenario.pattern}` : ""].filter(Boolean).join(" · ");

  return <section className="panel search-walkthrough graph-walkthrough window-walkthrough" aria-labelledby={`${id}-heading`}>
    <div className="tutorial-section-heading"><div><h2 id={`${id}-heading`}>See {title}, step by step</h2><p>Expand, shrink, and inspect the window state.</p></div><label className="target-select">Example <select value={scenarioIndex} onChange={(event) => { setScenarioIndex(Number(event.target.value)); setStepIndex(0); }}>{scenarios.map((item, index) => <option key={item.id} value={index}>{item.label}</option>)}</select></label></div>
    <div className="search-scene-layout graph-scene-layout">
      <div className="search-illustration graph-illustration">
        <div className="scene-caption"><span>{scenario.values.length} elements · zero-based indices</span><strong>{parameters}</strong></div>
        <div className="window-diagram-scroll" role="region" aria-label="Window diagram; scroll to inspect all elements" tabIndex={0}><WindowDiagram scenario={scenario} step={step} id={id} /></div>
        <div className="scene-legend"><span><i className="legend-middle" />Current window</span><span><i className="legend-visited" />Recorded answer</span><span><i className="legend-excluded" />Outside window</span></div>
        <dl className="window-stats"><div><dt>Left</dt><dd>{step.left}</dd></div><div><dt>Right</dt><dd>{step.right}</dd></div><div><dt>Length</dt><dd>{Math.max(0, step.right - step.left + 1)}</dd></div>{step.stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        {step.entries.length ? <div className="window-frequency"><h3>{step.entriesLabel}</h3><ul>{step.entries.map((entry) => <li key={entry}>{entry}</li>)}</ul></div> : null}
      </div>
      <div className="search-step graph-step"><div aria-live="polite" aria-atomic="true"><span className="step-count">Step {String(stepIndex + 1).padStart(2, "0")} <span>/ {scenario.steps.length}</span></span><h3>{step.title}</h3><p>{step.explanation}</p><code className={`step-action${step.done ? " is-found" : ""}`}>{step.action}</code></div><div className="graph-state-strip"><h4>{finished ? "Answer" : "Answer so far"}</h4><div><span>{result}</span></div></div></div>
    </div>
    <div className="walkthrough-controls graph-controls"><label className="graph-scrubber"><span>Step {stepIndex + 1} of {scenario.steps.length}</span><input type="range" aria-label="Walkthrough step" min={0} max={scenario.steps.length - 1} value={stepIndex} aria-valuetext={`Step ${stepIndex + 1}: ${step.title}`} onChange={(event) => setStepIndex(Number(event.target.value))} /></label><div className="walkthrough-buttons"><Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => index - 1)}><Icon name="arrow-right" className="back-icon" size={14} />Previous</Button><Button variant="secondary" disabled={finished} onClick={() => setStepIndex(scenario.steps.length - 1)}>Show result</Button><Button variant={finished ? "secondary" : "primary"} onClick={() => setStepIndex((index) => finished ? 0 : index + 1)}>{finished ? "Start again" : "Next step"}<Icon name={finished ? "shuffle" : "arrow-right"} size={14} /></Button></div></div>
    <details className="graph-edge-list"><summary>View exact input</summary><p>Input: {JSON.stringify(scenario.values)}{parameters ? ` · ${parameters}` : ""}</p><p>{step.right >= step.left ? `Current window: [${step.left}, ${step.right}], values: ${JSON.stringify(scenario.values.slice(step.left, step.right + 1))}.` : "Current window is empty."}{step.best ? ` Recorded answer window: [${step.best[0]}, ${step.best[1]}].` : ""}</p></details>
  </section>;
}
