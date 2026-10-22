import Link from "next/link";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AlgorithmProblemTable } from "@/components/problems/algorithm-problem-table";
import { treeAlgorithms, treeCategories } from "@/lib/tree-catalog";

const categoryId = (category: string) => category.toLowerCase().replaceAll(/[^a-z]+/g, "-");

export function TreeLibrary() {
  return (
    <div className="page-content graph-library">
      <Button href="/algorithms" variant="link" size="sm"><Icon name="arrow-right" className="back-icon" size={14} />All algorithms</Button>
      <div className="page-heading graph-library-heading">
        <div><h1>Tree algorithms.</h1><p>Understand the recursion, follow each branch, then put it into code.</p></div>
        <span className="graph-lesson-count">{treeAlgorithms.length} lessons · Python & C++</span>
      </div>
      <nav className="graph-category-nav" aria-label="Tree algorithm categories">
        {treeCategories.map((category) => (
          <Link key={category} href={`#${categoryId(category)}`}>
            {category}<span>{treeAlgorithms.filter((algorithm) => algorithm.category === category).length}</span>
          </Link>
        ))}
      </nav>
      {treeCategories.map((category) => (
        <section className="graph-category-section" key={category} aria-labelledby={categoryId(category)}>
          <div className="section-heading"><h2 id={categoryId(category)}>{category}</h2></div>
          <AlgorithmProblemTable category={category} algorithms={treeAlgorithms.filter((algorithm) => algorithm.category === category)} />
        </section>
      ))}
    </div>
  );
}
