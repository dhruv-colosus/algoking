import Link from "next/link";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AlgorithmProblemTable } from "@/components/problems/algorithm-problem-table";
import { miscAlgorithms, miscCategories } from "@/lib/misc-catalog";
import { miscPrimers } from "@/lib/misc-lessons";

const categoryId = (category: string) => category.toLowerCase().replaceAll(/[^a-z]+/g, "-");

export function MiscLibrary() {
  return (
    <div className="page-content graph-library">
      <Button href="/algorithms" variant="link" size="sm"><Icon name="arrow-right" className="back-icon" size={14} />All algorithms</Button>
      <div className="page-heading graph-library-heading">
        <div><h1>Miscellaneous topics.</h1><p>Techniques that don’t fit one pattern family, each with its own idea to learn first.</p></div>
        <span className="graph-lesson-count">{miscAlgorithms.length} {miscAlgorithms.length === 1 ? "lesson" : "lessons"} · Python & C++</span>
      </div>
      <nav className="graph-category-nav" aria-label="Miscellaneous topic categories">
        {miscCategories.map((category) => (
          <Link key={category} href={`#${categoryId(category)}`}>
            {category}<span>{miscAlgorithms.filter((algorithm) => algorithm.category === category).length}</span>
          </Link>
        ))}
      </nav>
      {miscCategories.map((category) => (
        <section className="graph-category-section" key={category} aria-labelledby={categoryId(category)}>
          <div className="section-heading"><div><h2 id={categoryId(category)}>{category}</h2><p>{miscPrimers[category].summary}</p></div></div>
          <AlgorithmProblemTable category={category} algorithms={miscAlgorithms.filter((algorithm) => algorithm.category === category)} />
        </section>
      ))}
    </div>
  );
}
