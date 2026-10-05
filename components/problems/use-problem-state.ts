"use client";

import { useSyncExternalStore } from "react";
import { problems, type Problem } from "@/lib/data";

const BOOKMARK_KEY = "algoking-bookmarks-v1";
const SOLVED_KEY = "algoking-solved-v1";
const CHANGE_EVENT = "algoking-problem-state-change";
const DEFAULT_BOOKMARKS = JSON.stringify(["two-sum", "binary-search", "valid-parentheses"]);
const DEFAULT_SOLVED = "{}";

function readStorage(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Browsers can disable local storage. The rest of the workspace stays usable.
  }
}

function parseBookmarks(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function parseSolved(value: string): Record<string, boolean> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, solved]) => typeof solved === "boolean"));
  } catch {
    return {};
  }
}

const readBookmarks = () => readStorage(BOOKMARK_KEY, DEFAULT_BOOKMARKS);
const readSolved = () => readStorage(SOLVED_KEY, DEFAULT_SOLVED);
const serverBookmarks = () => DEFAULT_BOOKMARKS;
const serverSolved = () => DEFAULT_SOLVED;

export function useProblemState() {
  const bookmarkSnapshot = useSyncExternalStore(subscribe, readBookmarks, serverBookmarks);
  const solvedSnapshot = useSyncExternalStore(subscribe, readSolved, serverSolved);
  const bookmarks = parseBookmarks(bookmarkSnapshot);
  const solved = parseSolved(solvedSnapshot);

  const isSolved = (problem: Problem) => solved[problem.id] ?? problem.solved;
  const isBookmarked = (id: string) => bookmarks.includes(id);
  const toggleBookmark = (id: string) => {
    const current = parseBookmarks(readBookmarks());
    writeStorage(BOOKMARK_KEY, current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };
  const toggleSolved = (problem: Problem) => {
    const current = parseSolved(readSolved());
    writeStorage(SOLVED_KEY, { ...current, [problem.id]: !(current[problem.id] ?? problem.solved) });
  };

  return { isSolved, isBookmarked, toggleBookmark, toggleSolved, solvedCount: problems.filter(isSolved).length };
}
