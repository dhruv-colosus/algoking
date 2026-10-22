import type { Difficulty } from "./data";

export const stackCategories = ["Stack foundations", "Expressions & parsing", "Monotonic stacks", "Areas & contributions", "Simulation & greedy"] as const;
export type StackAlgorithm = { slug: string; title: string; shortTitle: string; category: typeof stackCategories[number]; difficulty: Difficulty; description: string; time: string; space: string };

// Metadata stays lightweight for shared navigation and problem search.
export const stackAlgorithms: StackAlgorithm[] = [
  {
    "slug": "valid-parentheses",
    "title": "Valid Parentheses",
    "shortTitle": "Valid Parentheses",
    "category": "Stack foundations",
    "difficulty": "Easy",
    "description": "Match every closing bracket with the most recent opening bracket.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "min-stack",
    "title": "Min Stack",
    "shortTitle": "Min Stack",
    "category": "Stack foundations",
    "difficulty": "Medium",
    "description": "Store the minimum alongside each value for constant-time queries.",
    "time": "O(1) per operation",
    "space": "O(n)"
  },
  {
    "slug": "queue-using-stacks",
    "title": "Queue Using Two Stacks",
    "shortTitle": "Queue Using Two Stacks",
    "category": "Stack foundations",
    "difficulty": "Easy",
    "description": "Reverse incoming values only when the outgoing stack is empty.",
    "time": "O(1) amortized",
    "space": "O(n)"
  },
  {
    "slug": "evaluate-rpn",
    "title": "Evaluate Reverse Polish Notation",
    "shortTitle": "Evaluate Reverse Polish Notation",
    "category": "Expressions & parsing",
    "difficulty": "Medium",
    "description": "Pop the right operand before the left operand, then push the result.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "infix-to-postfix",
    "title": "Infix to Postfix",
    "shortTitle": "Infix to Postfix",
    "category": "Expressions & parsing",
    "difficulty": "Medium",
    "description": "Use an operator stack to respect precedence and parentheses.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "decode-string",
    "title": "Decode a Repeated String",
    "shortTitle": "Decode a Repeated String",
    "category": "Expressions & parsing",
    "difficulty": "Medium",
    "description": "Save an outer prefix and repetition count whenever a nested group begins.",
    "time": "O(n + nL)",
    "space": "O(n + L)"
  },
  {
    "slug": "simplify-path",
    "title": "Simplify Unix Path",
    "shortTitle": "Simplify Unix Path",
    "category": "Expressions & parsing",
    "difficulty": "Medium",
    "description": "Resolve dot and parent segments with a stack of directory names.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "remove-adjacent-duplicates",
    "title": "Remove Adjacent Duplicates",
    "shortTitle": "Remove Adjacent Duplicates",
    "category": "Expressions & parsing",
    "difficulty": "Easy",
    "description": "Cancel equal neighbors and let newly adjacent characters meet.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "next-greater-element",
    "title": "Next Greater Element",
    "shortTitle": "Next Greater Element",
    "category": "Monotonic stacks",
    "difficulty": "Medium",
    "description": "Resolve waiting indices when a strictly greater value arrives.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "next-greater-circular",
    "title": "Next Greater Element in a Circular Array",
    "shortTitle": "Next Greater Element in a Circular Array",
    "category": "Monotonic stacks",
    "difficulty": "Medium",
    "description": "Scan twice to let unresolved positions wrap around once.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "next-smaller-element",
    "title": "Next Smaller Element",
    "shortTitle": "Next Smaller Element",
    "category": "Monotonic stacks",
    "difficulty": "Medium",
    "description": "Resolve waiting indices when a strictly smaller value arrives.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "daily-temperatures",
    "title": "Daily Temperatures",
    "shortTitle": "Daily Temperatures",
    "category": "Monotonic stacks",
    "difficulty": "Medium",
    "description": "Use index differences to measure the wait for a warmer day.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "stock-span",
    "title": "Stock Span",
    "shortTitle": "Stock Span",
    "category": "Monotonic stacks",
    "difficulty": "Medium",
    "description": "Remove dominated prices to find the previous strictly greater price.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "largest-rectangle-histogram",
    "title": "Largest Rectangle in a Histogram",
    "shortTitle": "Largest Rectangle in a Histogram",
    "category": "Areas & contributions",
    "difficulty": "Hard",
    "description": "A smaller bar fixes the right boundary of rectangles waiting on the stack.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "maximal-rectangle",
    "title": "Maximal Rectangle in a Binary Matrix",
    "shortTitle": "Maximal Rectangle in a Binary Matrix",
    "category": "Areas & contributions",
    "difficulty": "Hard",
    "description": "Build a histogram for each row, then solve its largest rectangle.",
    "time": "O(rows \u00d7 cols)",
    "space": "O(cols)"
  },
  {
    "slug": "trapping-rain-water-stack",
    "title": "Trapping Rain Water with a Stack",
    "shortTitle": "Trapping Rain Water with a Stack",
    "category": "Areas & contributions",
    "difficulty": "Hard",
    "description": "Pop a valley floor when a right wall appears.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "sum-subarray-minimums",
    "title": "Sum of Subarray Minimums",
    "shortTitle": "Sum of Subarray Minimums",
    "category": "Areas & contributions",
    "difficulty": "Medium",
    "description": "Charge every subarray minimum to exactly one index.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "asteroid-collision",
    "title": "Asteroid Collision",
    "shortTitle": "Asteroid Collision",
    "category": "Simulation & greedy",
    "difficulty": "Medium",
    "description": "Resolve only a right-moving survivor meeting a left-moving asteroid.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "remove-k-digits",
    "title": "Remove K Digits",
    "shortTitle": "Remove K Digits",
    "category": "Simulation & greedy",
    "difficulty": "Medium",
    "description": "Remove larger preceding digits to make the earliest positions as small as possible.",
    "time": "O(n)",
    "space": "O(n)"
  },
  {
    "slug": "longest-valid-parentheses",
    "title": "Longest Valid Parentheses",
    "shortTitle": "Longest Valid Parentheses",
    "category": "Simulation & greedy",
    "difficulty": "Hard",
    "description": "Keep a boundary index beneath unmatched openings to measure valid suffixes.",
    "time": "O(n)",
    "space": "O(n)"
  }
];
