import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProblemList from "@/components/problems/problem-list";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { topics, problems, algorithms } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return topics.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: topics.find((topic) => topic.slug === slug)?.title ?? "Topic" };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = topics.find((item) => item.slug === slug);
  if (!topic) notFound();
  const pattern = algorithms.find((algorithm) => algorithm.topic === topic.slug);
  const count = problems.filter((problem) => problem.topic === slug).length;
  return <div className="page-content"><Button href="/algorithms" variant="link" size="sm"><Icon name="chevron-right" size={14} /> All algorithms</Button><section className="panel topic-detail-hero"><div><span className="eyebrow">{topic.level.toUpperCase()} · {count} PRACTICE PROBLEMS</span><h1>{topic.title}</h1><p>{topic.description}</p><div className="topic-hero-meta"><span><Icon name="book" size={16} /> Learn the pattern</span><span><Icon name="code" size={16} /> Put it into practice</span></div></div><Image src={topic.image} alt="" width={250} height={170} className="topic-detail-image" /></section>{pattern ? <section className="panel pattern-note"><div className="pattern-note-icon"><Icon name="layers" size={20} /></div><div><span className="eyebrow">THE CORE IDEA</span><h2>{pattern.name}</h2><p>{pattern.description}</p></div><code className="complexity-pill">{pattern.complexity}</code></section> : null}<section className="panel"><div className="section-heading panel-heading"><div><h2>A good place to practice</h2><p>Start simple, then build up to the next challenge.</p></div></div><ProblemList topic={slug} /></section></div>;
}
