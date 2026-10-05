"use client";

import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Problem } from "@/lib/data";
import { useProblemState } from "./use-problem-state";

export function ProblemActions({ problem }: { problem: Problem }) {
  const { isSolved, isBookmarked, toggleSolved, toggleBookmark } = useProblemState();
  const solved = isSolved(problem);
  const bookmarked = isBookmarked(problem.id);
  return <div className="detail-actions"><Button variant={solved ? "secondary" : "primary"} onClick={() => toggleSolved(problem)} aria-pressed={solved}><Icon name="check" size={16} />{solved ? "Solved" : "Mark as solved"}</Button><Button variant="secondary" onClick={() => toggleBookmark(problem.id)} aria-pressed={bookmarked}><Icon name="bookmark" size={16} />{bookmarked ? "Bookmarked" : "Bookmark"}</Button></div>;
}
