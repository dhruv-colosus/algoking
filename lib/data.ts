import { searchAlgorithms } from "./binary-search-catalog";
import { linkedListAlgorithms } from "./linked-list-catalog";
import { graphAlgorithms } from "./graph-catalog";
import { treeAlgorithms } from "./tree-catalog";
import { windowAlgorithms } from "./sliding-window-catalog";

import { stackAlgorithms } from "./stack-catalog";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Topic = {
  slug: string;
  title: string;
  description: string;
  image: string;
  solved: number;
  total: number;
  level: "Beginner" | "Intermediate" | "Advanced";
};

export type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topic: string;
  solved: boolean;
};

export const topics: Topic[] = [
  { slug: "arrays", title: "Arrays & Hashing", description: "Find the pattern. Make every lookup count.", image: "/illustrations/arrays.png", solved: 8, total: 24, level: "Beginner" },
  { slug: "two-pointers", title: "Two Pointers", description: "Two positions. One elegant solution.", image: "/illustrations/two-pointers.png", solved: 3, total: 12, level: "Beginner" },
  { slug: "stacks", title: "Stacks", description: "Build intuition, one layer at a time.", image: "/illustrations/stacks.png", solved: 2, total: 14, level: "Intermediate" },
  { slug: "binary-search", title: "Binary Search", description: "Cut the search space. Find the answer.", image: "/illustrations/binary-search.png", solved: 4, total: 16, level: "Beginner" },
  { slug: "sliding-window", title: "Sliding Window", description: "Move your window. Keep what matters.", image: "/illustrations/sliding-window.png", solved: 2, total: 15, level: "Intermediate" },
  { slug: "linked-list", title: "Linked Lists", description: "Connect the dots with a little pointer magic.", image: "/illustrations/linked-list.png", solved: 3, total: 18, level: "Intermediate" },
  { slug: "trees", title: "Trees", description: "Explore branches. Discover recursive thinking.", image: "/illustrations/trees.png", solved: 5, total: 28, level: "Intermediate" },
  { slug: "graphs", title: "Graphs", description: "Traversals, shortest paths, spanning trees, and connectivity.", image: "", solved: 0, total: graphAlgorithms.length, level: "Intermediate" },
];

export const problems: Problem[] = [
  ...searchAlgorithms.map((algorithm) => ({ id: algorithm.slug, title: algorithm.title, slug: algorithm.slug, difficulty: algorithm.difficulty, topic: "binary-search", solved: false })),
  ...stackAlgorithms.map((algorithm) => ({ id: algorithm.slug, title: algorithm.title, slug: algorithm.slug, difficulty: algorithm.difficulty, topic: "stacks", solved: false })),
  ...windowAlgorithms.map((algorithm) => ({ id: algorithm.slug, title: algorithm.title, slug: algorithm.slug, difficulty: algorithm.difficulty, topic: "sliding-window", solved: false })),
  ...linkedListAlgorithms.map((algorithm) => ({ id: algorithm.slug, title: algorithm.title, slug: algorithm.slug, difficulty: algorithm.difficulty, topic: "linked-list", solved: false })),
  ...treeAlgorithms.map((algorithm) => ({ id: algorithm.slug, title: algorithm.title, slug: algorithm.slug, difficulty: algorithm.difficulty, topic: "trees", solved: false })),
  ...graphAlgorithms.map((algorithm) => ({ id: algorithm.slug, title: algorithm.title, slug: algorithm.slug, difficulty: algorithm.difficulty, topic: "graphs", solved: false })),
];

export const algorithms = [
  { name: "Hash map lookup", topic: "arrays", description: "Trade a little space for fast lookups. Great for counting, grouping, and finding pairs.", complexity: "O(n)", label: "Start here" },
  { name: "Two pointers", topic: "two-pointers", description: "Move inward from both ends, or move two pointers at different speeds.", complexity: "O(n)", label: "Essential" },
  { name: "Binary search", topic: "binary-search", description: "Use a sorted range and halve the possibilities with each comparison.", complexity: "O(log n)", label: "Essential" },
  { name: "Sliding window", topic: "sliding-window", description: "Maintain a useful slice of your input as its left and right boundaries move.", complexity: "O(n)", label: "Popular" },
  { name: "Monotonic stack", topic: "stacks", description: "Keep elements in order to find the next greater or smaller value in one pass.", complexity: "O(n)", label: "Next step" },
  { name: "Depth-first search", topic: "graphs", description: "Follow one branch at a time, track visited vertices, then backtrack.", complexity: "O(V + E)", label: "Essential" },
];

export function getTopicTitle(slug: string) {
  return topics.find((topic) => topic.slug === slug)?.title ?? slug;
}
