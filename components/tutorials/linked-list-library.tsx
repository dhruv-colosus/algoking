import Link from "next/link";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AlgorithmProblemTable } from "@/components/problems/algorithm-problem-table";
import { linkedListAlgorithms, linkedListCategories } from "@/lib/linked-list-catalog";

const categoryId = (category: string) => category.toLowerCase().replaceAll(/[^a-z]+/g, "-");

export function LinkedListLibrary() {
  return (
    <div className="page-content graph-library">
      <Button href="/algorithms" variant="link" size="sm"><Icon name="arrow-right" className="back-icon" size={14} />All algorithms</Button>
      <div className="page-heading graph-library-heading">
        <div><h1>Linked list algorithms.</h1><p>Learn the idea, follow the pointers, then put it into code.</p></div>
        <span className="graph-lesson-count">{linkedListAlgorithms.length} lessons · Python & C++</span>
      </div>
      <nav className="graph-category-nav" aria-label="Linked list algorithm categories">
        {linkedListCategories.map((category) => (
          <Link key={category} href={`#${categoryId(category)}`}>
            {category}<span>{linkedListAlgorithms.filter((algorithm) => algorithm.category === category).length}</span>
          </Link>
        ))}
      </nav>
      {linkedListCategories.map((category) => (
        <section className="graph-category-section" key={category} aria-labelledby={categoryId(category)}>
          <div className="section-heading"><h2 id={categoryId(category)}>{category}</h2></div>
          <AlgorithmProblemTable category={category} algorithms={linkedListAlgorithms.filter((algorithm) => algorithm.category === category)} />
        </section>
      ))}
    </div>
  );
}
