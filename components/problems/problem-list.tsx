"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import DifficultyTag from "@/components/ui/difficulty-tag";
import { problems, getTopicTitle, type Difficulty } from "@/lib/data";
import { useProblemState } from "./use-problem-state";

type ProblemListProps = { compact?: boolean; topic?: string; savedOnly?: boolean };

export function ProblemList({ compact = false, topic, savedOnly = false }: ProblemListProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const { isSolved, isBookmarked, toggleBookmark, toggleSolved } = useProblemState();
  const searchTerm = search.trim().toLowerCase();
  const filteredProblems = problems.filter((problem) =>
    (!topic || problem.topic === topic || getTopicTitle(problem.topic) === topic) &&
    (!savedOnly || isBookmarked(problem.id)) &&
    (difficulty === "All" || problem.difficulty === difficulty) &&
    (!searchTerm || `${problem.title} ${getTopicTitle(problem.topic)}`.toLowerCase().includes(searchTerm))
  );
  const visibleProblems = compact ? filteredProblems.slice(0, 5) : filteredProblems;

  return (
    <div className="problem-list">
      {!compact ? (
        <div className="problem-toolbar">
          <label className="search-field">
            <Icon name="search" size={16} />
            <input aria-label="Search problems" placeholder="Search for a problem..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <div className="problem-filters">
            <select className="filter-select" aria-label="Filter by difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty | "All")}>
              <option value="All">All difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <span className="result-count">{filteredProblems.length} problems</span>
          </div>
        </div>
      ) : null}
      <div className="table-scroll" role="region" aria-label="Practice problems" tabIndex={0}>
        <table className="problem-table">
          <thead>
            <tr><th className="status-column"><span className="sr-only">Solved</span></th><th>Problem</th><th>Difficulty</th><th className="topic-column">Topic</th><th className="acceptance-column">Acceptance</th><th className="save-column"><span className="sr-only">Bookmark</span></th></tr>
          </thead>
          <tbody>
            {visibleProblems.map((problem) => {
              const complete = isSolved(problem);
              const bookmarked = isBookmarked(problem.id);
              return (
                <tr key={problem.id}>
                  <td className="status-column"><button type="button" className={`status-toggle${complete ? " is-solved" : ""}`} aria-label={`${complete ? "Mark unsolved" : "Mark solved"}: ${problem.title}`} aria-pressed={complete} onClick={() => toggleSolved(problem)}><Icon name={complete ? "check-circle" : "circle"} size={17} /></button></td>
                  <td><Link className="problem-title" href={`/problems/${problem.slug}`}>{problem.title}</Link></td>
                  <td><DifficultyTag difficulty={problem.difficulty} /></td>
                  <td className="topic-column"><Link className="table-topic" href={`/algorithms/${problem.topic}`}>{getTopicTitle(problem.topic)}</Link></td>
                  <td className="acceptance-column">{problem.acceptance}</td>
                  <td className="save-column"><button type="button" className={`bookmark-toggle${bookmarked ? " is-bookmarked" : ""}`} aria-label={`${bookmarked ? "Remove bookmark" : "Bookmark"}: ${problem.title}`} aria-pressed={bookmarked} onClick={() => toggleBookmark(problem.id)}><Icon name="bookmark" size={17} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {visibleProblems.length === 0 ? <div className="empty-state"><Icon name={savedOnly ? "bookmark" : "search"} size={24} /><h3>{savedOnly ? "A little space for your favorites" : "No problems found"}</h3><p>{savedOnly ? "Bookmark a problem to keep it here for later." : "Try a different title or difficulty."}</p><Link href="/problems" className="text-link">Browse all problems <Icon name="arrow-right" size={14} /></Link></div> : null}
    </div>
  );
}

export default ProblemList;
