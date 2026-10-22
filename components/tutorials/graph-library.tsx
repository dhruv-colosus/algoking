import Link from "next/link";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AlgorithmProblemTable } from "@/components/problems/algorithm-problem-table";
import { graphAlgorithms, graphCategories } from "@/lib/graph-catalog";

const categoryId = (category: string) => category.toLowerCase().replaceAll(/[^a-z]+/g, "-");

export function GraphLibrary() {
  return (
    <div className="page-content graph-library">
      <Button href="/algorithms" variant="link" size="sm"><Icon name="arrow-right" className="back-icon" size={14} />All algorithms</Button>
      <div className="page-heading graph-library-heading">
        <div><h1>Graph algorithms.</h1><p>Learn the idea, walk through a graph, then put it into code.</p></div>
        <span className="graph-lesson-count">{graphAlgorithms.length} lessons · Python & C++</span>
      </div>
      <nav className="graph-category-nav" aria-label="Graph algorithm categories">
        {graphCategories.map((category) => (
          <Link key={category} href={`#${categoryId(category)}`}>
            {category}<span>{graphAlgorithms.filter((algorithm) => algorithm.category === category).length}</span>
          </Link>
        ))}
      </nav>
      {graphCategories.map((category) => (
        <section className="graph-category-section" key={category} aria-labelledby={categoryId(category)}>
          <div className="section-heading"><h2 id={categoryId(category)}>{category}</h2></div>
          <AlgorithmProblemTable category={category} algorithms={graphAlgorithms.filter((algorithm) => algorithm.category === category)} />
        </section>
      ))}
    </div>
  );
}
