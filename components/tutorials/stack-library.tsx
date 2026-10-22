import Link from "next/link";
import Button from "@/components/ui/button";
import DifficultyTag from "@/components/ui/difficulty-tag";
import { Icon } from "@/components/ui/icon";
import { stackAlgorithms, stackCategories } from "@/lib/stack-catalog";

export function StackLibrary() {
  return <div className="page-content graph-library">
    <Button href="/algorithms" variant="link" size="sm"><Icon name="arrow-right" className="back-icon" size={14} />All algorithms</Button>
    <div className="page-heading graph-library-heading"><div><h1>Stack algorithms.</h1><p>Track the top, preserve the invariant, then put it into code.</p></div><span className="graph-lesson-count">{stackAlgorithms.length} lessons · Python & C++</span></div>
    <nav className="graph-category-nav" aria-label="Stack algorithm categories">{stackCategories.map((category) => <Link key={category} href={`#${category.toLowerCase().replaceAll(" ", "-")}`}>{category}<span>{stackAlgorithms.filter((algorithm) => algorithm.category === category).length}</span></Link>)}</nav>
    {stackCategories.map((category) => <section className="graph-category-section" key={category} aria-labelledby={category.toLowerCase().replaceAll(" ", "-")}><div className="section-heading"><h2 id={category.toLowerCase().replaceAll(" ", "-")}>{category}</h2></div><div className="algorithm-grid">{stackAlgorithms.filter((algorithm) => algorithm.category === category).map((algorithm) => <article className="panel algorithm-card graph-lesson-card" key={algorithm.slug}><div className="algorithm-topline"><span className="algorithm-number">{String(stackAlgorithms.indexOf(algorithm) + 1).padStart(2, "0")}</span><DifficultyTag difficulty={algorithm.difficulty} /></div><h3><Link href={`/problems/${algorithm.slug}`}>{algorithm.title}</Link></h3><p>{algorithm.description}</p><div className="algorithm-footer"><code className="complexity-pill">{algorithm.time}</code><Button href={`/problems/${algorithm.slug}`} variant="ghost" size="sm">Open lesson<Icon name="arrow-right" size={14} /></Button></div></article>)}</div></section>)}
  </div>;
}
