import Link from "next/link";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AlgorithmProblemTable } from "@/components/problems/algorithm-problem-table";
import { windowAlgorithms, windowCategories } from "@/lib/sliding-window-catalog";

const categoryId = (category: string) => category.toLowerCase().replaceAll(/[^a-z]+/g, "-");

export function WindowLibrary() {
  return (
    <div className="page-content graph-library">
      <Button href="/algorithms" variant="link" size="sm"><Icon name="arrow-right" className="back-icon" size={14} />All algorithms</Button>
      <div className="page-heading graph-library-heading">
        <div><h1>Sliding window algorithms.</h1><p>Move the boundaries, maintain the invariant, then put it into code.</p></div>
        <span className="graph-lesson-count">{windowAlgorithms.length} lessons · Python & C++</span>
      </div>
      <nav className="graph-category-nav" aria-label="Sliding window algorithm categories">
        {windowCategories.map((category) => (
          <Link key={category} href={`#${categoryId(category)}`}>
            {category}<span>{windowAlgorithms.filter((algorithm) => algorithm.category === category).length}</span>
          </Link>
        ))}
      </nav>
      {windowCategories.map((category) => (
        <section className="graph-category-section" key={category} aria-labelledby={categoryId(category)}>
          <div className="section-heading"><h2 id={categoryId(category)}>{category}</h2></div>
          <AlgorithmProblemTable category={category} algorithms={windowAlgorithms.filter((algorithm) => algorithm.category === category)} />
        </section>
      ))}
    </div>
  );
}
