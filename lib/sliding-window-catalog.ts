import type { Difficulty } from "./data";

export const windowCategories = ["Fixed windows", "Longest windows", "Smallest windows", "Counting windows", "Monotonic deque"] as const;
export type WindowCategory = typeof windowCategories[number];
export type WindowAlgorithm = {
  slug: string; title: string; shortTitle: string; category: WindowCategory;
  difficulty: Difficulty; description: string; time: string; space: string;
};

// Metadata only: lesson text, code, and trace generation stay on the server.
export const windowAlgorithms: WindowAlgorithm[] = [
  { slug: "maximum-sum-subarray-k", title: "Maximum Sum of a Size-K Subarray", shortTitle: "Fixed-size sum", category: "Fixed windows", difficulty: "Easy", description: "Add the incoming value and subtract the outgoing value to reuse a window sum.", time: "O(n)", space: "O(1)" },
  { slug: "maximum-vowels", title: "Maximum Vowels in a Substring", shortTitle: "Maximum vowels", category: "Fixed windows", difficulty: "Medium", description: "Maintain a count instead of rebuilding every substring of length k.", time: "O(n)", space: "O(1)" },
  { slug: "first-negative-in-window", title: "First Negative in Every Window", shortTitle: "First negative", category: "Fixed windows", difficulty: "Easy", description: "Keep negative-value indices in a queue and expire them from the front.", time: "O(n)", space: "O(k)" },
  { slug: "find-all-anagrams", title: "Find All Anagrams in a String", shortTitle: "Anagram windows", category: "Fixed windows", difficulty: "Medium", description: "Compare character frequencies in a fixed window with the pattern’s frequencies.", time: "O(n + m)", space: "O(1)" },
  { slug: "permutation-in-string", title: "Permutation in a String", shortTitle: "Permutation check", category: "Fixed windows", difficulty: "Medium", description: "Stop as soon as a window contains exactly the pattern’s character counts.", time: "O(n + m)", space: "O(1)" },
  { slug: "longest-substring-without-repeats", title: "Longest Substring Without Repeats", shortTitle: "No repeats", category: "Longest windows", difficulty: "Medium", description: "Expand right, then shrink until the new character is unique in the window.", time: "O(n)", space: "O(1)" },
  { slug: "longest-substring-k-distinct", title: "Longest Substring with At Most K Distinct", shortTitle: "At most K distinct", category: "Longest windows", difficulty: "Medium", description: "Use a frequency map to keep the number of distinct characters within a budget.", time: "O(n)", space: "O(1)" },
  { slug: "longest-repeating-character-replacement", title: "Longest Repeating Character Replacement", shortTitle: "Character replacement", category: "Longest windows", difficulty: "Medium", description: "A window is repairable when its length minus its largest frequency is at most k.", time: "O(n)", space: "O(1)" },
  { slug: "max-consecutive-ones-iii", title: "Max Consecutive Ones III", shortTitle: "Flip K zeros", category: "Longest windows", difficulty: "Medium", description: "Count zeros as the cost of making the entire window ones.", time: "O(n)", space: "O(1)" },
  { slug: "minimum-size-subarray-sum", title: "Minimum Size Subarray Sum", shortTitle: "Minimum length sum", category: "Smallest windows", difficulty: "Medium", description: "Once a positive-number window reaches the target, shrink it to improve the answer.", time: "O(n)", space: "O(1)" },
  { slug: "minimum-window-substring", title: "Minimum Window Substring", shortTitle: "Minimum covering window", category: "Smallest windows", difficulty: "Hard", description: "Cover every required character, including duplicates, then remove excess from the left.", time: "O(n + m)", space: "O(1)" },
  { slug: "subarrays-k-distinct", title: "Subarrays with Exactly K Distinct", shortTitle: "Exactly K distinct", category: "Counting windows", difficulty: "Hard", description: "Subtract atMost(k − 1) from atMost(k), counting valid suffixes at each right edge.", time: "O(n)", space: "O(n)" },
  { slug: "binary-subarrays-with-sum", title: "Binary Subarrays with Sum", shortTitle: "Exact binary sum", category: "Counting windows", difficulty: "Medium", description: "Turn an exact sum into two at-most counts; zeros make the counting step matter.", time: "O(n)", space: "O(1)" },
  { slug: "subarray-product-less-than-k", title: "Subarray Product Less Than K", shortTitle: "Product below K", category: "Counting windows", difficulty: "Medium", description: "Shrink a positive-integer product until it is below k, then count valid suffixes.", time: "O(n)", space: "O(1)" },
  { slug: "sliding-window-maximum", title: "Sliding Window Maximum", shortTitle: "Window maximum", category: "Monotonic deque", difficulty: "Hard", description: "Discard expired and dominated indices so the deque front is always the maximum.", time: "O(n)", space: "O(k)" },
];
