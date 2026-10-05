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
  acceptance: string;
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
];

export const problems: Problem[] = [
  { id: "two-sum", title: "Two Sum", slug: "two-sum", difficulty: "Easy", topic: "arrays", acceptance: "55.2%", solved: true },
  { id: "valid-parentheses", title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", topic: "stacks", acceptance: "42.3%", solved: true },
  { id: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", topic: "sliding-window", acceptance: "54.8%", solved: false },
  { id: "three-sum", title: "3Sum", slug: "three-sum", difficulty: "Medium", topic: "two-pointers", acceptance: "36.6%", solved: false },
  { id: "binary-search", title: "Binary Search", slug: "binary-search", difficulty: "Easy", topic: "binary-search", acceptance: "59.1%", solved: false },
  { id: "contains-duplicate", title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "Easy", topic: "arrays", acceptance: "62.5%", solved: true },
  { id: "valid-anagram", title: "Valid Anagram", slug: "valid-anagram", difficulty: "Easy", topic: "arrays", acceptance: "66.2%", solved: true },
  { id: "group-anagrams", title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium", topic: "arrays", acceptance: "70.4%", solved: false },
  { id: "valid-palindrome", title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "Easy", topic: "two-pointers", acceptance: "50.7%", solved: true },
  { id: "container-with-most-water", title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", topic: "two-pointers", acceptance: "58.1%", solved: false },
  { id: "daily-temperatures", title: "Daily Temperatures", slug: "daily-temperatures", difficulty: "Medium", topic: "stacks", acceptance: "67.9%", solved: false },
  { id: "min-stack", title: "Min Stack", slug: "min-stack", difficulty: "Medium", topic: "stacks", acceptance: "56.4%", solved: false },
  { id: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "Medium", topic: "binary-search", acceptance: "42.6%", solved: false },
  { id: "longest-substring-without-repeating", title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating", difficulty: "Medium", topic: "sliding-window", acceptance: "36.1%", solved: false },
  { id: "minimum-window-substring", title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: "Hard", topic: "sliding-window", acceptance: "44.7%", solved: false },
  { id: "reverse-linked-list", title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", topic: "linked-list", acceptance: "78.2%", solved: true },
  { id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy", topic: "linked-list", acceptance: "65.8%", solved: false },
  { id: "invert-binary-tree", title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "Easy", topic: "trees", acceptance: "80.1%", solved: true },
  { id: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", topic: "trees", acceptance: "76.4%", solved: true },
  { id: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "Medium", topic: "trees", acceptance: "70.8%", solved: false },
];

export const algorithms = [
  { name: "Hash map lookup", topic: "arrays", description: "Trade a little space for fast lookups. Great for counting, grouping, and finding pairs.", complexity: "O(n)", label: "Start here" },
  { name: "Two pointers", topic: "two-pointers", description: "Move inward from both ends, or move two pointers at different speeds.", complexity: "O(n)", label: "Essential" },
  { name: "Binary search", topic: "binary-search", description: "Use a sorted range and halve the possibilities with each comparison.", complexity: "O(log n)", label: "Essential" },
  { name: "Sliding window", topic: "sliding-window", description: "Maintain a useful slice of your input as its left and right boundaries move.", complexity: "O(n)", label: "Popular" },
  { name: "Monotonic stack", topic: "stacks", description: "Keep elements in order to find the next greater or smaller value in one pass.", complexity: "O(n)", label: "Next step" },
  { name: "Depth-first search", topic: "trees", description: "Follow one branch at a time. Recursion makes the repeated work feel natural.", complexity: "O(n)", label: "Essential" },
];

export function getTopicTitle(slug: string) {
  return topics.find((topic) => topic.slug === slug)?.title ?? slug;
}
