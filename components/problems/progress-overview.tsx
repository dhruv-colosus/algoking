"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { problems, topics } from "@/lib/data";
import { useProblemState } from "./use-problem-state";

export function ProgressOverview() {
  const { solvedCount, isSolved } = useProblemState();
  const solvedPercent = Math.round((solvedCount / problems.length) * 100);
  return <><div className="stats-grid"><article className="panel stat-card"><span className="stat-label">Problems solved</span><strong>{solvedCount}<span> / {problems.length}</span></strong><p>A little more intuition with every one.</p></article><article className="panel stat-card"><span className="stat-label">Sheet completion</span><strong>{solvedPercent}<span>%</span></strong><p>You are building a solid foundation.</p></article><article className="panel stat-card"><span className="stat-label">Topics explored</span><strong>{topics.filter((topic) => problems.some((problem) => problem.topic === topic.slug && isSolved(problem))).length}<span> / {topics.length}</span></strong><p>Connect the patterns as you go.</p></article></div><section className="panel progress-panel"><div className="section-heading"><div><h2>A little progress in every direction</h2><p>Your completion across the practice sheet.</p></div><span className="subtle-label"><Icon name="chart" size={16} /> Topic overview</span></div><div className="topic-progress-list">{topics.map((topic) => { const topicProblems = problems.filter((problem) => problem.topic === topic.slug); const completed = topicProblems.filter(isSolved).length; return <Link className="topic-progress-row" href={`/algorithms/${topic.slug}`} key={topic.slug}><span className="topic-progress-name">{topic.title}</span><div className="progress-track" role="progressbar" aria-label={`${topic.title} completion`} aria-valuemin={0} aria-valuemax={topicProblems.length} aria-valuenow={completed}><span style={{ width: `${(completed / topicProblems.length) * 100}%` }} /></div><span className="topic-progress-count">{completed} / {topicProblems.length}</span><Icon name="arrow-up-right" size={15} /></Link>; })}</div></section></>;
}
