import Link from "next/link";
import { codeToHtml } from "shiki";
import Button from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import DifficultyTag from "@/components/ui/difficulty-tag";
import { Icon } from "@/components/ui/icon";
import { ProblemActions } from "@/components/problems/problem-actions";
import { CodeTabs } from "./code-tabs";
import { WindowWalkthrough } from "./sliding-window-walkthrough";
import type { Problem } from "@/lib/data";
import { miscAlgorithms, type MiscAlgorithm } from "@/lib/misc-catalog";
import { miscCode } from "@/lib/misc-code";
import { miscNotes, miscPrimers } from "@/lib/misc-lessons";
import { miscScenarios } from "@/lib/misc-traces";

export async function MiscTutorial({ algorithm, problem }: { algorithm: MiscAlgorithm; problem: Problem }) {
  const notes = miscNotes[algorithm.slug], source = miscCode[algorithm.slug], primer = miscPrimers[algorithm.category];
  const [python, cpp] = await Promise.all([
    codeToHtml(source.python, { lang: "python", theme: "github-dark" }),
    codeToHtml(source.cpp, { lang: "cpp", theme: "github-dark" }),
  ]);
  const index = miscAlgorithms.findIndex((item) => item.slug === algorithm.slug);
  const previous = miscAlgorithms[index - 1], next = miscAlgorithms[index + 1];

  return <article className="page-content tutorial-content">
    <header className="tutorial-header">
      <div className="tutorial-title-group"><Button href="/algorithms/miscellaneous" variant="secondary" size="icon" aria-label="Back to miscellaneous topics" className="tutorial-back"><Icon name="arrow-right" className="back-icon" size={18} /></Button><div><h1>{algorithm.title}</h1><div className="tutorial-tags"><DifficultyTag difficulty={algorithm.difficulty} /><Link className="tutorial-topic-link" href="/algorithms/miscellaneous">Miscellaneous</Link><Tag>{algorithm.category}</Tag></div></div></div>
      <ProblemActions problem={problem} />
    </header>
    <section className="panel tutorial-challenge" aria-labelledby="challenge-heading"><div><h2 id="challenge-heading">The challenge</h2><p>{notes.challenge}</p><p className="challenge-condition">{notes.condition}</p></div><div className="tutorial-example"><h3>Example</h3><p>{notes.example}</p><p>Use the walkthrough below to inspect the input and each state change.</p></div></section>
    <section className="panel concept-primer" aria-labelledby="primer-heading">
      <div className="concept-primer-intro"><span className="eyebrow">NEW TECHNIQUE</span><h2 id="primer-heading">{primer.title}</h2><p>{primer.summary}</p></div>
      <ol className="concept-primer-ideas">{primer.ideas.map(([title, description], ideaIndex) => <li key={title}><span>{String(ideaIndex + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
      <figure className="concept-primer-example"><figcaption>{primer.example.label}</figcaption><pre><code>{primer.example.lines.join("\n")}</code></pre></figure>
    </section>
    <WindowWalkthrough scenarios={miscScenarios(algorithm.slug)} title={algorithm.shortTitle} subtitle="Binary search the length, roll the hash, and watch the counts." />
    <div className="tutorial-bottom-grid">
      <section className="panel tutorial-solution" aria-labelledby="solution-heading"><div className="tutorial-section-heading"><div><h2 id="solution-heading">Put it into code</h2><p>{notes.approach}</p><p>Indices are zero-based. C++ uses C++17 or later.</p></div></div><CodeTabs source={source} filename={algorithm.slug.replaceAll("-", "_")} label={algorithm.shortTitle} python={<div dangerouslySetInnerHTML={{ __html: python }} />} cpp={<div dangerouslySetInnerHTML={{ __html: cpp }} />} /></section>
      <aside className="tutorial-notes">
        <section className="panel tutorial-note" aria-labelledby="pattern-heading"><h2 id="pattern-heading">The pattern to remember</h2><ol className="pattern-steps">{notes.pattern.map(([title, description], stepIndex) => <li key={title}><span>{String(stepIndex + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol></section>
        <section className="panel tutorial-note" aria-labelledby="complexity-heading"><h2 id="complexity-heading">Time & space</h2><div className="tutorial-complexity"><div><span>Time</span><strong>{algorithm.time}</strong></div><div><span>Extra space</span><strong>{algorithm.space}</strong></div></div><p>n = input length. Hash-map operations are expected O(1).</p><p>{notes.complexity}</p></section>
        <section className="tutorial-edge-note"><Icon name="code" size={17} /><p><strong>Before you mark it solved</strong>{notes.pitfalls}</p></section>
      </aside>
    </div>
    <nav className="graph-lesson-navigation" aria-label="Miscellaneous lesson navigation">{previous ? <Link href={`/problems/${previous.slug}`}><span>Previous lesson</span><strong><Icon name="arrow-right" className="back-icon" size={14} />{previous.shortTitle}</strong></Link> : <Link href="/algorithms/miscellaneous"><span>Explore the collection</span><strong>All miscellaneous topics</strong></Link>}{next ? <Link href={`/problems/${next.slug}`}><span>Next lesson</span><strong>{next.shortTitle}<Icon name="arrow-right" size={14} /></strong></Link> : <Link href="/algorithms/miscellaneous"><span>Collection complete</span><strong>All miscellaneous topics<Icon name="arrow-right" size={14} /></strong></Link>}</nav>
  </article>;
}
