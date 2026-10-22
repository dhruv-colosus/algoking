import Link from "next/link";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AlgorithmProblemTable } from "@/components/problems/algorithm-problem-table";
import { searchAlgorithms, searchCategories } from "@/lib/binary-search-catalog";

const categoryId = (category: string) => category.toLowerCase().replaceAll(/[^a-z]+/g, "-");

export function SearchLibrary() {
  return (
    <div className="page-content graph-library">
      <Button href="/algorithms" variant="link" size="sm"><Icon name="arrow-right" className="back-icon" size={14} />All algorithms</Button>
      <div className="page-heading graph-library-heading">
        <div><h1>Binary search algorithms.</h1><p>Find boundaries, uncover structure, and search the answer space.</p></div>
        <span className="graph-lesson-count">{searchAlgorithms.length} lessons · Python & C++</span>
      </div>
      <nav className="graph-category-nav" aria-label="Binary search algorithm categories">
        {searchCategories.map((category) => (
          <Link key={category} href={`#${categoryId(category)}`}>
            {category}<span>{searchAlgorithms.filter((algorithm) => algorithm.category === category).length}</span>
          </Link>
        ))}
      </nav>
      {searchCategories.map((category) => (
        <section className="graph-category-section" key={category} aria-labelledby={categoryId(category)}>
          <div className="section-heading"><h2 id={categoryId(category)}>{category}</h2></div>
          <AlgorithmProblemTable category={category} algorithms={searchAlgorithms.filter((algorithm) => algorithm.category === category)} />
        </section>
      ))}
    </div>
  );
}
