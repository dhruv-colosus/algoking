import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import DifficultyTag from "@/components/ui/difficulty-tag";
import { ProblemActions } from "@/components/problems/problem-actions";
import { problems, getTopicTitle } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

const examples: Record<string, { statement: string; input: string; output: string; explanation: string; hint: string }> = {
  "two-sum": { statement: "Given an array of integers and a target, return the indices of the two numbers that add up to the target. Each input has exactly one solution, and you may not use the same element twice.", input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "The values at indices 0 and 1 add up to 9.", hint: "For each number, think about the complement you need. How could you remember the numbers you have already seen?" },
  "valid-parentheses": { statement: "Given a string containing brackets, decide whether every opening bracket has a matching closing bracket of the same type, in the correct order.", input: 's = "({[]})"', output: "true", explanation: "Every pair closes in the reverse order it was opened.", hint: "The most recently opened bracket should be the first one to close. Which data structure behaves this way?" },
  "binary-search": { statement: "Given an array sorted in ascending order and a target value, return the target's index. Return -1 when the target does not appear. Aim for logarithmic time.", input: "nums = [-1, 0, 3, 5, 9, 12], target = 9", output: "4", explanation: "The value 9 appears at index 4.", hint: "Compare the target to the middle element. Which half can you safely leave out?" },
  "reverse-linked-list": { statement: "Given the head of a singly linked list, reverse the list and return its new head.", input: "head = [1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]", explanation: "Every pointer now leads to the previous node.", hint: "Save the next node before changing the current pointer. Track the previous and current nodes as you move." },
};

export function generateStaticParams() { return problems.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: problems.find((problem) => problem.slug === slug)?.title ?? "Problem" };
}

export default async function ProblemPage({ params }: Props) {
  const { slug } = await params;
  const problem = problems.find((item) => item.slug === slug);
  if (!problem) notFound();
  const example = examples[slug];
  const index = problems.findIndex((item) => item.slug === slug);
  const next = problems[(index + 1) % problems.length];
  return <div className="page-content"><Button href="/problems" variant="link" size="sm"><Icon name="chevron-right" size={14} /> Back to the problem sheet</Button><div className="page-heading"><div><span className="eyebrow">PRACTICE · {getTopicTitle(problem.topic).toUpperCase()}</span><h1>{problem.title}</h1><div className="problem-detail-meta"><DifficultyTag difficulty={problem.difficulty} /><span>{problem.acceptance} acceptance</span><span>Sample problem</span></div></div><ProblemActions problem={problem} /></div><div className="problem-detail-grid"><section className="panel problem-description"><h2>The challenge</h2><p>{example?.statement ?? `Practice ${getTopicTitle(problem.topic).toLowerCase()} with ${problem.title}. This preview gives every question a place in your sheet. The full problem statement and worked explanation will be added here.`}</p>{example ? <><h3>Example</h3><div className="example-block"><p><strong>Input</strong> <code>{example.input}</code></p><p><strong>Output</strong> <code>{example.output}</code></p></div><p>{example.explanation}</p><h3>Before you begin</h3><ul className="constraint-list"><li>Read through the example and consider edge cases.</li><li>Write down a simple solution before optimizing.</li><li>Describe the time and space complexity of your approach.</li></ul></> : <div className="placeholder-block"><Icon name="code" size={22} /><h3>Your thinking goes here</h3><p>Choose your approach, sketch a solution, and mark this problem solved when it clicks.</p></div>}</section><aside className="problem-detail-aside"><section className="panel hint-card"><span className="eyebrow">A SMALL NUDGE</span><h2>Start with the pattern</h2><p>{example?.hint ?? `Explore the ${getTopicTitle(problem.topic).toLowerCase()} pattern. Think about which information you need to keep, and what you can leave behind.`}</p><Button href={`/algorithms/${problem.topic}`} variant="secondary" size="sm">Explore this topic <Icon name="arrow-up-right" size={14} /></Button></section><section className="panel next-problem-card"><span className="eyebrow">WHEN YOU&apos;RE READY</span><h2>A little more practice</h2><p>{next.title}</p><Button href={`/problems/${next.slug}`} variant="ghost" size="sm">Next problem <Icon name="arrow-right" size={14} /></Button></section></aside></div><p className="page-footnote">A space to understand the problem. Use your favorite editor to write and run your solution.</p></div>;
}
