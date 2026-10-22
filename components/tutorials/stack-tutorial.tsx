import Link from "next/link";
import { codeToHtml } from "shiki";
import Button from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import DifficultyTag from "@/components/ui/difficulty-tag";
import { Icon } from "@/components/ui/icon";
import { ProblemActions } from "@/components/problems/problem-actions";
import { CodeTabs } from "./code-tabs";
import { StackWalkthrough } from "./stack-walkthrough";
import type { Problem } from "@/lib/data";
import { stackAlgorithms, type StackAlgorithm } from "@/lib/stack-catalog";
import { stackCode } from "@/lib/stack-code";
import { stackNotes } from "@/lib/stack-lessons";
import { stackScenarios } from "@/lib/stack-traces";

export async function StackTutorial({ algorithm, problem }: { algorithm: StackAlgorithm; problem: Problem }) {
  const notes = stackNotes[algorithm.slug], source = stackCode[algorithm.slug];
  const [python, cpp] = await Promise.all([
    codeToHtml(source.python, { lang: "python", theme: "github-dark" }),
    codeToHtml(source.cpp, { lang: "cpp", theme: "github-dark" }),
  ]);
  const index = stackAlgorithms.findIndex((item) => item.slug === algorithm.slug);
  const previous = stackAlgorithms[index - 1], next = stackAlgorithms[index + 1];

  return <article className="page-content tutorial-content">
    <header className="tutorial-header">
      <div className="tutorial-title-group"><Button href="/algorithms/stacks" variant="secondary" size="icon" aria-label="Back to stack algorithms" className="tutorial-back"><Icon name="arrow-right" className="back-icon" size={18} /></Button><div><h1>{algorithm.title}</h1><div className="tutorial-tags"><DifficultyTag difficulty={algorithm.difficulty} /><Link className="tutorial-topic-link" href="/algorithms/stacks">Stacks</Link><Tag>{algorithm.category}</Tag></div></div></div>
      <ProblemActions problem={problem} />
    </header>
    <section className="panel tutorial-challenge" aria-labelledby="challenge-heading"><div><h2 id="challenge-heading">The challenge</h2><p>{notes.challenge}</p><p className="challenge-condition">{notes.condition}</p></div><div className="tutorial-example"><h3>Example</h3><p>{notes.example}</p><p>Use the walkthrough below to inspect the input and each state change.</p></div></section>
    <StackWalkthrough scenarios={stackScenarios(algorithm.slug)} title={algorithm.shortTitle} />
    <div className="tutorial-bottom-grid">
      <section className="panel tutorial-solution" aria-labelledby="solution-heading"><div className="tutorial-section-heading"><div><h2 id="solution-heading">Put it into code</h2><p>{notes.approach}</p><p>Indices are zero-based. C++ uses C++17 or later.</p></div></div><CodeTabs source={source} filename={algorithm.slug.replaceAll("-", "_")} label={algorithm.shortTitle} python={<div dangerouslySetInnerHTML={{ __html: python }} />} cpp={<div dangerouslySetInnerHTML={{ __html: cpp }} />} /></section>
      <aside className="tutorial-notes">
        <section className="panel tutorial-note" aria-labelledby="pattern-heading"><h2 id="pattern-heading">The pattern to remember</h2><ol className="pattern-steps">{notes.pattern.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol></section>
        <section className="panel tutorial-note" aria-labelledby="complexity-heading"><h2 id="complexity-heading">Time & space</h2><div className="tutorial-complexity"><div><span>Time</span><strong>{algorithm.time}</strong></div><div><span>Extra space</span><strong>{algorithm.space}</strong></div></div><p>n = input length unless stated otherwise. Space bounds exclude returned output and walkthrough snapshots.</p><p>{notes.complexity}</p></section>
        <section className="tutorial-edge-note"><Icon name="code" size={17} /><p><strong>Before you mark it solved</strong>{notes.pitfalls}</p></section>
      </aside>
    </div>
    <nav className="graph-lesson-navigation" aria-label="Stack lesson navigation">{previous ? <Link href={`/problems/${previous.slug}`}><span>Previous lesson</span><strong><Icon name="arrow-right" className="back-icon" size={14} />{previous.shortTitle}</strong></Link> : <Link href="/algorithms/stacks"><span>Explore the collection</span><strong>All stack algorithms</strong></Link>}{next ? <Link href={`/problems/${next.slug}`}><span>Next lesson</span><strong>{next.shortTitle}<Icon name="arrow-right" size={14} /></strong></Link> : <Link href="/algorithms/stacks"><span>Collection complete</span><strong>All stack algorithms<Icon name="arrow-right" size={14} /></strong></Link>}</nav>
  </article>;
}
