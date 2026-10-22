"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { SearchScenario, SearchStep } from "@/lib/binary-search-traces";

function Blocks({ values, step, mode, cut, rowLabel }: { values: number[]; step: SearchStep; mode: SearchScenario["mode"]; cut?: number; rowLabel?: string }) {
  const width = Math.max(360, values.length * 52 + 80), size = (width - 80) / Math.max(1, values.length);
  const center = (i: number) => 40 + (i + .5) * size;
  return <svg className="window-diagram binary-array" viewBox={`0 0 ${width} 225`} style={{ minWidth: Math.min(width, Math.max(300, values.length * 44 + 80)) }} role="img" aria-label={`${rowLabel ?? "Input"}: ${JSON.stringify(values)}. ${cut !== undefined ? `Cut after ${cut} elements.` : mode === "indices" ? `Candidate indices ${step.left} through ${step.right}.` : mode === "partition" ? "No cut selected yet." : "Values used for the feasibility test."}`}>
    {rowLabel ? <text className="binary-row-label" x="20" y="24">{rowLabel} · cut = {cut ?? "—"}</text> : null}
    {!values.length ? <text className="window-empty" x={width / 2} y="110" textAnchor="middle">Empty array</text> : null}
    {mode === "indices" && step.left <= step.right ? <g className="window-boundary"><path d={`M ${center(step.left) - size * .4} 65 V 51 H ${center(step.right) + size * .4} V 65`} /><text x={width / 2} y="30" textAnchor="middle">L = {step.left} · mid = {step.mid ?? "—"} · R = {step.right}</text></g> : null}
    {mode === "indices" && step.left > step.right && values.length ? <text className="window-empty" x={width / 2} y="35" textAnchor="middle">Empty candidate range · L = {step.left}, R = {step.right}</text> : null}
    {values.map((value, index) => {
      const highlighted = step.focus.includes(index), excluded = mode === "indices" && (index < step.left || index > step.right);
      const state = mode === "partition" ? cut !== undefined && index < cut ? "found" : "candidate" : highlighted ? step.done ? "found" : "middle" : excluded ? "excluded" : "candidate";
      return <g key={index} transform={`translate(${center(index)} 100)`} className={`binary-cell is-${state}`}>
        <path className="iso-face-left" d="M -19 0 0 11 0 49 -19 38 Z" /><path className="iso-face-right" d="M 0 11 19 0 19 38 0 49 Z" /><path className="iso-face-top" d="M -19 0 0 -11 19 0 0 11 Z" />
        <text className="iso-value" x="0" y="32" textAnchor="middle">{value}</text><text className="iso-index" x="0" y="76" textAnchor="middle">{index}</text>
        {mode === "indices" && index === step.mid ? <text className="binary-mid-label" x="0" y="-25" textAnchor="middle">mid</text> : null}
      </g>;
    })}
    {cut !== undefined ? <g className="binary-cut"><path d={`M ${40 + cut * size} 55 V 188`} /><text x={40 + cut * size} y="210" textAnchor="middle">cut</text></g> : null}
  </svg>;
}

function AnswerRange({ step }: { step: SearchStep }) {
  const crossed = step.left > step.right;
  return <svg className="binary-range" viewBox="0 0 600 145" role="img" aria-label={`Answer range: left ${step.left}, candidate ${step.mid ?? "none"}, right ${step.right}. ${crossed ? "The range has crossed." : ""}`}>
    <path d="M 65 83 H 535" />
    {([[65, "left", step.left], [300, "candidate", step.mid], [535, "right", step.right]] as const).map(([x, name, value]) => <g key={name} className={name === "candidate" ? "is-candidate" : ""}><circle cx={x} cy="83" r={name === "candidate" ? 7 : 4} /><text x={x} y="35" textAnchor="middle">{name}</text><text className="binary-range-value" x={x} y="60" textAnchor="middle">{value ?? "—"}</text></g>)}
    <text className="binary-range-caption" x="300" y="126" textAnchor="middle">{crossed ? "Candidate range exhausted" : step.left === step.right ? "One candidate remains" : "Search candidate values, not input indices"}</text>
  </svg>;
}

function Matrix({ scenario, step }: { scenario: SearchScenario; step: SearchStep }) {
  const matrix = scenario.matrix ?? [], cols = matrix[0]?.length ?? 0;
  return <div className="graph-table-scroll"><table className="graph-state-table binary-matrix"><caption>Matrix · row and column indices start at 0{scenario.mode === "indices" ? " · brackets show virtual indices" : " · highlighted entries are ≤ the tested candidate"}</caption><thead><tr><th scope="col">r / c</th>{Array.from({ length: cols }, (_, i) => <th scope="col" key={i}>{i}</th>)}</tr></thead><tbody>{matrix.map((row, r) => <tr key={r}><th scope="row">{r}</th>{row.map((value, c) => { const index = r * cols + c; return <td key={c} className={step.focus.includes(index) ? "is-current" : ""}>{value}{scenario.mode === "indices" ? <small>[{index}]</small> : null}</td>; })}</tr>)}</tbody></table>{!matrix.length ? <p className="binary-empty">Empty matrix · no cells to search</p> : null}</div>;
}

export function SearchWalkthrough({ scenarios, title }: { scenarios: SearchScenario[]; title: string }) {
  const [scenarioIndex, setScenarioIndex] = useState(0), [stepIndex, setStepIndex] = useState(0);
  const id = useId(), scenario = scenarios[scenarioIndex], step = scenario.steps[stepIndex];
  const finished = stepIndex === scenario.steps.length - 1;
  const parameters = ([['target', scenario.target], ['x', scenario.x], ['p', scenario.p], ['k', scenario.k], ['h', scenario.h], ['D', scenario.days], ['m', scenario.m]] as const).filter(([, value]) => value !== undefined).map(([name, value]) => `${name} = ${value}`).join(" · ");
  let a = scenario.values, b = scenario.other ?? [];
  if (scenario.mode === "partition" && a.length > b.length) [a, b] = [b, a];
  const values = scenario.displayValues ?? a;

  return <section className="panel search-walkthrough graph-walkthrough binary-walkthrough" aria-labelledby={`${id}-heading`}>
    <div className="tutorial-section-heading"><div><h2 id={`${id}-heading`}>See {title}, step by step</h2><p>Inspect the comparison, the invariant, and the next boundary.</p></div><label className="target-select">Example <select value={scenarioIndex} onChange={(event) => { setScenarioIndex(Number(event.target.value)); setStepIndex(0); }}>{scenarios.map((item, index) => <option key={item.id} value={index}>{item.label}</option>)}</select></label></div>
    <div className="search-scene-layout graph-scene-layout">
      <div className="search-illustration graph-illustration">
        <div className="scene-caption"><span>{scenario.mode === "partition" ? "A = shorter array · green = left partition" : scenario.mode === "answer" ? scenario.displayValues ? "Answer-space search · sorted stalls" : "Answer-space search" : "Inclusive candidate indices"}</span><strong>{parameters}</strong></div>
        {scenario.mode === "answer" ? <AnswerRange step={step} /> : null}
        {scenario.matrix ? <Matrix scenario={scenario} step={step} /> : values.length || scenario.mode !== "answer" ? <div className="window-diagram-scroll" role="region" aria-label="Search diagram; scroll to inspect all elements" tabIndex={0}><Blocks values={values} mode={scenario.mode} step={step} cut={step.cuts?.[0]} rowLabel={scenario.mode === "partition" ? "A" : undefined} />{scenario.mode === "partition" ? <Blocks values={b} mode="partition" step={step} cut={step.cuts?.[1]} rowLabel="B" /> : null}</div> : null}
        <div className="scene-legend"><span><i className="legend-middle" />{scenario.mode === "answer" ? "Tested candidate / qualifying input" : "Current comparison"}</span><span><i className="legend-visited" />{scenario.mode === "partition" ? "Left partition" : "Resolved position"}</span><span className="index-note">{scenario.mode === "answer" ? "Parameters shown above" : "Numbers below = indices"}</span></div>
        <dl className="window-stats"><div><dt>{scenario.mode === "partition" ? "Left cut bound" : "Left"}</dt><dd>{step.left}</dd></div><div><dt>{scenario.mode === "partition" ? "Cut in A" : "Middle"}</dt><dd>{step.mid ?? "—"}</dd></div><div><dt>{scenario.mode === "partition" ? "Right cut bound" : "Right"}</dt><dd>{step.right}</dd></div>{step.stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </div>
      <div className="search-step graph-step"><div aria-live="polite" aria-atomic="true"><span className="step-count">Step {String(stepIndex + 1).padStart(2, "0")} <span>/ {scenario.steps.length}</span></span><h3>{step.title}</h3><p>{step.explanation}</p><code className={`step-action${step.done ? " is-found" : ""}`}>{step.action}</code></div><div className="graph-state-strip"><h4>{finished ? "Answer" : "Recorded result so far"}</h4><div><span>{step.result === null ? "Not resolved" : JSON.stringify(step.result)}</span></div></div></div>
    </div>
    <div className="walkthrough-controls graph-controls"><label className="graph-scrubber"><span>Step {stepIndex + 1} of {scenario.steps.length}</span><input type="range" aria-label="Walkthrough step" min={0} max={scenario.steps.length - 1} value={stepIndex} aria-valuetext={`Step ${stepIndex + 1}: ${step.title}`} onChange={(event) => setStepIndex(Number(event.target.value))} /></label><div className="walkthrough-buttons"><Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => index - 1)}><Icon name="arrow-right" className="back-icon" size={14} />Previous</Button><Button variant="secondary" disabled={finished} onClick={() => setStepIndex(scenario.steps.length - 1)}>Show result</Button><Button variant={finished ? "secondary" : "primary"} onClick={() => setStepIndex((index) => finished ? 0 : index + 1)}>{finished ? "Start again" : "Next step"}<Icon name={finished ? "shuffle" : "arrow-right"} size={14} /></Button></div></div>
    <details className="graph-edge-list"><summary>View exact input</summary><p>{scenario.matrix ? `Matrix: ${JSON.stringify(scenario.matrix)}` : scenario.mode === "partition" ? `Original A: ${JSON.stringify(scenario.values)} · Original B: ${JSON.stringify(scenario.other)}` : `Input: ${JSON.stringify(scenario.values)}`}{parameters ? ` · ${parameters}` : ""}</p>{scenario.mode === "partition" ? <p>The diagram relabels the shorter array A. Cuts count elements on the left; missing boundary values are −∞ or +∞.</p> : null}</details>
  </section>;
}
