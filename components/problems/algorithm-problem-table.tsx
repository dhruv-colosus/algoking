import Link from "next/link";
import DifficultyTag from "@/components/ui/difficulty-tag";
import type { Difficulty } from "@/lib/data";
import { PracticeLink } from "./practice-link";

type Algorithm = { slug: string; title: string; difficulty: Difficulty; time: string };

export function AlgorithmProblemTable({ algorithms, category }: { algorithms: readonly Algorithm[]; category: string }) {
  return (
    <div className="panel problem-panel">
      <div className="table-scroll" role="region" aria-label={`${category} problems`} tabIndex={0}>
        <table className="problem-table algorithm-problem-table">
          <thead>
            <tr>
              <th scope="col">Problem</th>
              <th scope="col">Difficulty</th>
              <th scope="col">Time complexity</th>
              <th scope="col">Practice</th>
            </tr>
          </thead>
          <tbody>
            {algorithms.map((algorithm) => (
              <tr key={algorithm.slug}>
                <td><Link className="problem-title" href={`/problems/${algorithm.slug}`}>{algorithm.title}</Link></td>
                <td><DifficultyTag difficulty={algorithm.difficulty} /></td>
                <td><code className="table-complexity">{algorithm.time}</code></td>
                <td><PracticeLink slug={algorithm.slug} title={algorithm.title} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
