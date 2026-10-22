import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { problems } from "@/lib/data";
import { treeAlgorithms } from "@/lib/tree-catalog";
import { TreeTutorial } from "@/components/tutorials/tree-tutorial";
import { graphAlgorithms } from "@/lib/graph-catalog";
import { GraphTutorial } from "@/components/tutorials/graph-tutorial";

import { windowAlgorithms } from "@/lib/sliding-window-catalog";
import { WindowTutorial } from "@/components/tutorials/sliding-window-tutorial";

import { linkedListAlgorithms } from "@/lib/linked-list-catalog";
import { LinkedListTutorial } from "@/components/tutorials/linked-list-tutorial";

import { stackAlgorithms } from "@/lib/stack-catalog";
import { StackTutorial } from "@/components/tutorials/stack-tutorial";

import { searchAlgorithms } from "@/lib/binary-search-catalog";
import { SearchTutorial } from "@/components/tutorials/binary-search-tutorial";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return problems.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: problems.find((problem) => problem.slug === slug)?.title ?? "Problem" };
}

export default async function ProblemPage({ params }: Props) {
  const { slug } = await params;
  const problem = problems.find((item) => item.slug === slug);
  if (!problem) notFound();

  const stackAlgorithm = stackAlgorithms.find((algorithm) => algorithm.slug === slug);
  if (stackAlgorithm) return <StackTutorial algorithm={stackAlgorithm} problem={problem} />;

  const windowAlgorithm = windowAlgorithms.find((algorithm) => algorithm.slug === slug);
  if (windowAlgorithm) return <WindowTutorial algorithm={windowAlgorithm} problem={problem} />;

  const linkedListAlgorithm = linkedListAlgorithms.find((algorithm) => algorithm.slug === slug);
  if (linkedListAlgorithm) return <LinkedListTutorial algorithm={linkedListAlgorithm} problem={problem} />;

  const treeAlgorithm = treeAlgorithms.find((algorithm) => algorithm.slug === slug);
  if (treeAlgorithm) return <TreeTutorial algorithm={treeAlgorithm} problem={problem} />;

  const graphAlgorithm = graphAlgorithms.find((algorithm) => algorithm.slug === slug);
  if (graphAlgorithm) return <GraphTutorial algorithm={graphAlgorithm} problem={problem} />;

  const searchAlgorithm = searchAlgorithms.find((algorithm) => algorithm.slug === slug);
  if (searchAlgorithm) return <SearchTutorial algorithm={searchAlgorithm} problem={problem} />;
  notFound();
}
