import type { Difficulty } from "./data";

export const searchCategories = ["Search & boundaries", "Rotations & structure", "Numbers & matrices", "Search on the answer", "Two-array partitions"] as const;
export type SearchCategory = typeof searchCategories[number];
export type SearchAlgorithm = {
  slug: string; title: string; shortTitle: string; category: SearchCategory;
  difficulty: Difficulty; description: string; time: string; space: string;
};

// Metadata stays small for the problem sheet; code, notes, and traces are server-built.
export const searchAlgorithms: SearchAlgorithm[] = [
  { slug: "binary-search", title: "Binary Search", shortTitle: "Exact search", category: "Search & boundaries", difficulty: "Easy", description: "Find a target by discarding the half that cannot contain it.", time: "O(log n)", space: "O(1)" },
  { slug: "lower-bound", title: "Lower Bound & Search Insert Position", shortTitle: "Lower bound", category: "Search & boundaries", difficulty: "Easy", description: "Find the first index whose value is at least the target, or n.", time: "O(log n)", space: "O(1)" },
  { slug: "upper-bound", title: "Upper Bound", shortTitle: "Upper bound", category: "Search & boundaries", difficulty: "Easy", description: "Find the first value strictly greater than the target, skipping all equals.", time: "O(log n)", space: "O(1)" },
  { slug: "first-last-occurrence", title: "First & Last Occurrence", shortTitle: "Equal range & count", category: "Search & boundaries", difficulty: "Medium", description: "Use two boundaries to locate a duplicate run and count its occurrences.", time: "O(log n)", space: "O(1)" },
  { slug: "search-rotated-array", title: "Search in a Rotated Sorted Array", shortTitle: "Rotated search", category: "Rotations & structure", difficulty: "Medium", description: "Identify the sorted half before deciding where the target can be.", time: "O(log n)", space: "O(1)" },
  { slug: "search-rotated-array-duplicates", title: "Rotated Search with Duplicates", shortTitle: "Duplicate-aware rotation", category: "Rotations & structure", difficulty: "Medium", description: "Peel equal endpoints when duplicates hide which half is sorted.", time: "O(n) worst case", space: "O(1)" },
  { slug: "minimum-rotated-array", title: "Minimum in a Rotated Sorted Array", shortTitle: "Rotation minimum", category: "Rotations & structure", difficulty: "Medium", description: "Compare the middle with the right endpoint to keep the minimum.", time: "O(log n)", space: "O(1)" },
  { slug: "find-peak-element", title: "Find a Peak Element", shortTitle: "Peak search", category: "Rotations & structure", difficulty: "Medium", description: "Follow an uphill neighbor to preserve a half containing a peak.", time: "O(log n)", space: "O(1)" },
  { slug: "single-element-sorted-array", title: "Single Element in a Sorted Array", shortTitle: "Pair parity", category: "Rotations & structure", difficulty: "Medium", description: "Align the middle to an even index and inspect whether its pair is intact.", time: "O(log n)", space: "O(1)" },
  { slug: "integer-square-root", title: "Integer Square Root", shortTitle: "Floor square root", category: "Numbers & matrices", difficulty: "Easy", description: "Find the last integer whose square does not exceed x, without overflow.", time: "O(log x)", space: "O(1)" },
  { slug: "nth-root", title: "Exact Integer Nth Root", shortTitle: "Nth root", category: "Numbers & matrices", difficulty: "Medium", description: "Compare bounded powers with x and return an integer root only if exact.", time: "O(p log x)", space: "O(1)" },
  { slug: "search-2d-matrix", title: "Search a 2D Matrix", shortTitle: "Flattened matrix search", category: "Numbers & matrices", difficulty: "Medium", description: "Map a virtual one-dimensional middle back to its matrix row and column.", time: "O(log(rc))", space: "O(1)" },
  { slug: "kth-smallest-sorted-matrix", title: "Kth Smallest in a Sorted Matrix", shortTitle: "Matrix value search", category: "Numbers & matrices", difficulty: "Medium", description: "Count entries at most a candidate value using the row and column ordering.", time: "O((r + c) log W)", space: "O(1)" },
  { slug: "koko-eating-bananas", title: "Koko Eating Bananas", shortTitle: "Minimum feasible speed", category: "Search on the answer", difficulty: "Medium", description: "Search speeds and use ceiling division to test the hours needed.", time: "O(n log M)", space: "O(1)" },
  { slug: "ship-packages", title: "Capacity to Ship Packages Within D Days", shortTitle: "Minimum shipping capacity", category: "Search on the answer", difficulty: "Medium", description: "Greedily load packages in order to test each candidate capacity.", time: "O(n log S)", space: "O(1)" },
  { slug: "split-array-largest-sum", title: "Split Array Largest Sum", shortTitle: "Minimize the largest part", category: "Search on the answer", difficulty: "Hard", description: "Find the smallest sum limit allowing at most k contiguous parts.", time: "O(n log S)", space: "O(1)" },
  { slug: "minimum-days-bouquets", title: "Minimum Days to Make Bouquets", shortTitle: "Earliest bouquet day", category: "Search on the answer", difficulty: "Medium", description: "Count disjoint adjacent flower groups to test whether a day is feasible.", time: "O(n log M)", space: "O(1)" },
  { slug: "aggressive-cows", title: "Aggressive Cows / Maximum Minimum Distance", shortTitle: "Maximize minimum distance", category: "Search on the answer", difficulty: "Medium", description: "Place greedily in sorted stalls and find the largest feasible gap.", time: "O(n log n + n log W)", space: "O(n)" },
  { slug: "median-two-sorted-arrays", title: "Median of Two Sorted Arrays", shortTitle: "Median partition", category: "Two-array partitions", difficulty: "Hard", description: "Partition the shorter array so every left value is at most every right value.", time: "O(log(min(n, m) + 1))", space: "O(1)" },
  { slug: "kth-element-two-sorted-arrays", title: "Kth Element of Two Sorted Arrays", shortTitle: "Kth partition", category: "Two-array partitions", difficulty: "Hard", description: "Keep exactly k values on the combined left side and return its largest value.", time: "O(log(min(n, m) + 1))", space: "O(1)" },
];
