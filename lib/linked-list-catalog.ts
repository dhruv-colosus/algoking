import type { Difficulty } from "./data";

export type LinkedListCategory = "Basics" | "Fast & slow pointers" | "Reversal" | "Merging & sorting" | "Construction";
export type LinkedListAlgorithm = {
  slug: string; title: string; shortTitle: string; category: LinkedListCategory; difficulty: Difficulty; description: string; time: string; space: string;
};

// Metadata only: lesson sources and generated traces stay on the server.
export const linkedListAlgorithms: LinkedListAlgorithm[] = [
  {
    "slug": "linked-list-traversal",
    "title": "Traversal & Search",
    "shortTitle": "Traversal",
    "category": "Basics",
    "difficulty": "Easy",
    "description": "Walk next pointers to find the first matching node.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "linked-list-insert-delete",
    "title": "Insert & Delete by Position",
    "shortTitle": "Insert & delete",
    "category": "Basics",
    "difficulty": "Easy",
    "description": "Use a sentinel to update the head and interior links uniformly.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "reverse-linked-list",
    "title": "Reverse a Linked List",
    "shortTitle": "Reverse list",
    "category": "Reversal",
    "difficulty": "Easy",
    "description": "Save the next node before turning each link around.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "middle-of-linked-list",
    "title": "Middle of a Linked List",
    "shortTitle": "Middle node",
    "category": "Fast & slow pointers",
    "difficulty": "Easy",
    "description": "Move one pointer twice as fast to locate the middle.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "linked-list-cycle",
    "title": "Detect a Linked List Cycle",
    "shortTitle": "Detect cycle",
    "category": "Fast & slow pointers",
    "difficulty": "Easy",
    "description": "Use Floyd’s two speeds to detect a repeated loop.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "linked-list-cycle-entry",
    "title": "Find the Cycle Entry",
    "shortTitle": "Cycle entry",
    "category": "Fast & slow pointers",
    "difficulty": "Medium",
    "description": "Reset one pointer after a meeting to find where the loop begins.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "merge-two-sorted-lists",
    "title": "Merge Two Sorted Lists",
    "shortTitle": "Merge two lists",
    "category": "Merging & sorting",
    "difficulty": "Easy",
    "description": "Build one sorted chain by taking the smaller front node.",
    "time": "O(n + m)",
    "space": "O(1)"
  },
  {
    "slug": "remove-nth-node-from-end",
    "title": "Remove the Nth Node from the End",
    "shortTitle": "Remove nth from end",
    "category": "Fast & slow pointers",
    "difficulty": "Medium",
    "description": "Keep a fixed gap to locate the predecessor in one pass.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "intersection-of-linked-lists",
    "title": "Intersection of Two Linked Lists",
    "shortTitle": "Intersection",
    "category": "Fast & slow pointers",
    "difficulty": "Easy",
    "description": "Switch heads so both pointers cover the same total distance.",
    "time": "O(n + m)",
    "space": "O(1)"
  },
  {
    "slug": "palindrome-linked-list",
    "title": "Palindrome Linked List",
    "shortTitle": "Palindrome",
    "category": "Reversal",
    "difficulty": "Easy",
    "description": "Reverse the second half, compare, then restore the original list.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "remove-sorted-list-duplicates",
    "title": "Remove Duplicates from a Sorted List",
    "shortTitle": "Remove duplicates",
    "category": "Basics",
    "difficulty": "Easy",
    "description": "Bypass adjacent equal nodes while keeping one of each value.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "add-two-linked-list-numbers",
    "title": "Add Two Numbers",
    "shortTitle": "Add two numbers",
    "category": "Construction",
    "difficulty": "Medium",
    "description": "Add reversed digit chains with a carry, one place at a time.",
    "time": "O(max(n, m))",
    "space": "O(1) auxiliary"
  },
  {
    "slug": "reorder-linked-list",
    "title": "Reorder a Linked List",
    "shortTitle": "Reorder list",
    "category": "Reversal",
    "difficulty": "Medium",
    "description": "Split, reverse, and weave the two halves together.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "rotate-linked-list",
    "title": "Rotate a Linked List",
    "shortTitle": "Rotate right",
    "category": "Reversal",
    "difficulty": "Medium",
    "description": "Connect a temporary ring and cut at the new tail.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "reverse-nodes-in-k-group",
    "title": "Reverse Nodes in k-Group",
    "shortTitle": "Reverse k-group",
    "category": "Reversal",
    "difficulty": "Hard",
    "description": "Reverse complete groups and leave a short trailing group unchanged.",
    "time": "O(n)",
    "space": "O(1)"
  },
  {
    "slug": "copy-list-with-random-pointer",
    "title": "Copy a List with Random Pointers",
    "shortTitle": "Copy random pointers",
    "category": "Construction",
    "difficulty": "Medium",
    "description": "Map each original node to its copy before linking the copies.",
    "time": "O(n) expected",
    "space": "O(n)"
  },
  {
    "slug": "merge-k-sorted-lists",
    "title": "Merge k Sorted Lists",
    "shortTitle": "Merge k lists",
    "category": "Merging & sorting",
    "difficulty": "Hard",
    "description": "Keep one frontier node per list in a min-heap.",
    "time": "O(N log(k + 1) + k)",
    "space": "O(k)"
  },
  {
    "slug": "sort-linked-list",
    "title": "Merge Sort on a Linked List",
    "shortTitle": "Merge sort",
    "category": "Merging & sorting",
    "difficulty": "Medium",
    "description": "Split the chain, sort both halves, and merge by relinking nodes.",
    "time": "O(n log n)",
    "space": "O(log n)"
  }
];

export const linkedListCategories: LinkedListCategory[] = ["Basics", "Fast & slow pointers", "Reversal", "Merging & sorting", "Construction"];
