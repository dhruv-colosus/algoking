import type { GraphLessonNotes } from "./graph-lessons";

export const linkedListLessonNotes: Record<string, GraphLessonNotes> = {
  "linked-list-traversal": {
    "challenge": "Find the first node with a target value and return its zero-based index, or −1 if absent.",
    "condition": "The input is an acyclic singly linked list.",
    "example": "[4, 7, 2, 9], target 2 → index 2.",
    "approach": "Keep a current pointer and a position counter. Each next link advances by one.",
    "pattern": [
      [
        "Start at the head",
        "The head may be null; then the target is absent."
      ],
      [
        "Compare before moving",
        "Return immediately on the first match."
      ],
      [
        "Follow next",
        "Advance the pointer and index until a match or null."
      ]
    ],
    "complexity": "Each node is inspected at most once. Two scalar variables are enough.",
    "pitfalls": "Try an empty list, a missing target, repeated values, and a match at the head. A cycle needs a separate stopping rule."
  },
  "linked-list-insert-delete": {
    "challenge": "Insert a value at a zero-based position, then delete the node at a zero-based position in the updated list. Each operation returns the new head.",
    "condition": "Insertion accepts positions 0…n; deletion accepts 0…n−1. Invalid positions leave the list unchanged.",
    "example": "[2, 6, 8] → insert 4 at 1 → [2, 4, 6, 8] → delete at 2 → [2, 4, 8].",
    "approach": "A dummy node gives every real node a predecessor, including the head.",
    "pattern": [
      [
        "Add a sentinel",
        "Point a temporary dummy node at the head."
      ],
      [
        "Stop one node before",
        "Walk to the predecessor of the requested position."
      ],
      [
        "Splice the link",
        "Insert between predecessor and successor, or bypass the node to delete."
      ]
    ],
    "complexity": "Walking to a position costs O(n). Pointer updates cost O(1). The sentinel and one inserted node use constant extra space.",
    "pitfalls": "Try inserting into an empty list, deleting the head or tail, and invalid positions. C++ deletion frees the removed node; do not use aliases to it afterward."
  },
  "reverse-linked-list": {
    "challenge": "Reverse an acyclic singly linked list in place and return its new head.",
    "condition": "Reuse the existing nodes; only next pointers change.",
    "example": "[1, 2, 3, 4] → [4, 3, 2, 1].",
    "approach": "Keep the reversed prefix separate from the unprocessed suffix.",
    "pattern": [
      [
        "Save next",
        "Remember current.next before overwriting it."
      ],
      [
        "Reverse one edge",
        "Point current.next at the reversed prefix."
      ],
      [
        "Advance both pointers",
        "Move previous to current and current to saved next. Return previous."
      ]
    ],
    "complexity": "Each next pointer is rewritten once. Three node references give constant auxiliary space.",
    "pitfalls": "Try empty and single-node lists. Moving current before saving next loses access to the rest of the list."
  },
  "middle-of-linked-list": {
    "challenge": "Return the middle node of an acyclic singly linked list. For even length, return the second middle.",
    "condition": "Both pointers start at head; an empty list returns null.",
    "example": "[1, 2, 3, 4] → node 3 (second middle).",
    "approach": "When fast reaches the end, slow has covered half the distance.",
    "pattern": [
      [
        "Start together",
        "Initialize slow and fast at head."
      ],
      [
        "Guard both hops",
        "Advance only while fast and fast.next exist."
      ],
      [
        "Return slow",
        "Move slow once and fast twice in each iteration."
      ]
    ],
    "complexity": "Fast makes at most n forward hops, and only two pointers are stored.",
    "pitfalls": "Try odd and even lengths. Starting fast at head.next selects the first middle instead; keep the convention consistent."
  },
  "linked-list-cycle": {
    "challenge": "Determine whether following next pointers ever revisits a node.",
    "condition": "Compare node identity, not equal values. Do not modify any links.",
    "example": "1 → 2 → 3 → 4 → node 2 contains a cycle.",
    "approach": "Inside a cycle, fast gains one position per iteration and must meet slow.",
    "pattern": [
      [
        "Start at head",
        "An empty list has no cycle."
      ],
      [
        "Move before comparing",
        "Slow takes one hop and fast takes two; then compare identities."
      ],
      [
        "Stop at null or a meeting",
        "Null proves termination; a meeting proves a cycle."
      ]
    ],
    "complexity": "n is the number of distinct reachable nodes. The prefix and one cycle traversal bound the work; storage is constant.",
    "pitfalls": "Try a self-loop, a cycle beginning at head, and an acyclic list with duplicate values. Initial equality at head is not evidence of a cycle."
  },
  "linked-list-cycle-entry": {
    "challenge": "Return the node where a linked list cycle begins, or null when the list is acyclic.",
    "condition": "Use node identity and leave all next pointers unchanged.",
    "example": "1 → 2 → 3 → 4 → node 2 returns node 2.",
    "approach": "After Floyd’s meeting, equal-speed pointers from head and the meeting point converge at the entry.",
    "pattern": [
      [
        "Detect a meeting",
        "Run the fast and slow cycle test."
      ],
      [
        "Reset one pointer",
        "Place an entry pointer at head and keep slow at the meeting."
      ],
      [
        "Walk in lockstep",
        "Move both one hop until their identities match."
      ]
    ],
    "complexity": "Detection and entry search together take O(n) time for n distinct reachable nodes and constant extra storage.",
    "pitfalls": "Try no cycle, a self-loop, and an entry at head. The first meeting can be a different node from the cycle entry."
  },
  "merge-two-sorted-lists": {
    "challenge": "Merge two sorted singly linked lists into one nondecreasing list, reusing their nodes.",
    "condition": "Inputs are acyclic and share no nodes. Both are sorted in nondecreasing order.",
    "example": "[1, 3, 5] + [2, 4, 6] → [1, 2, 3, 4, 5, 6].",
    "approach": "A dummy head and output tail make every append the same operation.",
    "pattern": [
      [
        "Compare the fronts",
        "Choose the smaller current node; ties come from the first list."
      ],
      [
        "Append and advance",
        "Attach that node and advance only its input pointer."
      ],
      [
        "Attach the remainder",
        "When one list ends, append the other chain in one step."
      ]
    ],
    "complexity": "At most n + m nodes are examined. The merged output reuses input nodes and the dummy takes constant space.",
    "pitfalls": "Try an empty input, tied values, and lists of unequal lengths. These operations consume and relink their input chains."
  },
  "remove-nth-node-from-end": {
    "challenge": "Remove the nth node from the end and return the new head.",
    "condition": "n is one-based. If n ≤ 0 or n exceeds the list length, leave the list unchanged.",
    "example": "[1, 2, 3, 4, 5], n = 2 → [1, 2, 3, 5].",
    "approach": "With a dummy head, a gap of n nodes puts slow just before the node to remove.",
    "pattern": [
      [
        "Create the gap",
        "Advance fast n times from the dummy; reject an invalid n."
      ],
      [
        "Move together",
        "While fast.next exists, advance both fast and slow."
      ],
      [
        "Bypass the target",
        "Set slow.next to slow.next.next and return dummy.next."
      ]
    ],
    "complexity": "The two pointers move only forward. The dummy and pointers occupy O(1) extra space.",
    "pitfalls": "Try removing the only node, the head, the tail, and an out-of-range n. C++ frees the removed node; aliases to it become invalid."
  },
  "intersection-of-linked-lists": {
    "challenge": "Return the first shared node of two acyclic lists, or null if they do not intersect.",
    "condition": "Intersection means the same node object, not matching values. Once lists intersect, their suffix is shared.",
    "example": "A: 1 → 3 → 7 → 9; B: 2 → 7 → 9. Both refer to the same node 7.",
    "approach": "Switching to the other head cancels the difference in prefix lengths.",
    "pattern": [
      [
        "Start one pointer per list",
        "Keep the input heads unchanged."
      ],
      [
        "Switch at null",
        "A pointer reaching null resumes at the other list’s head."
      ],
      [
        "Stop on identity",
        "They meet at the shared suffix or both become null."
      ]
    ],
    "complexity": "Each pointer walks at most both list lengths plus a head switch. No visited set is needed.",
    "pitfalls": "Try disjoint lists with identical values, equal heads, and an empty list. Cyclic lists require a different intersection algorithm."
  },
  "palindrome-linked-list": {
    "challenge": "Decide whether a list reads the same forward and backward while restoring its original structure.",
    "condition": "The input is acyclic. Empty and single-node lists count as palindromes.",
    "example": "[1, 2, 2, 1] → true; [1, 2, 3] → false.",
    "approach": "Only the second half needs reversing; comparing corresponding nodes is then a forward walk.",
    "pattern": [
      [
        "Find the first-half end",
        "Use fast/slow pointers so slow stops before the second half."
      ],
      [
        "Reverse and compare",
        "Reverse slow.next, then compare the first and second halves."
      ],
      [
        "Restore before returning",
        "Reverse that half again and reconnect it, even after a mismatch."
      ]
    ],
    "complexity": "Finding, reversing, comparing, and restoring are each linear. All work uses a fixed number of pointers.",
    "pitfalls": "Try odd length, a mismatch, and all-equal values. Do not return immediately on mismatch before restoring the links."
  },
  "remove-sorted-list-duplicates": {
    "challenge": "Remove repeated values from a sorted list, keeping the first node of each value.",
    "condition": "Sorted nondecreasing input. This keeps one copy; it does not remove every value that appeared more than once.",
    "example": "[1, 1, 2, 3, 3] → [1, 2, 3].",
    "approach": "Sorted order puts every duplicate beside the node that should survive.",
    "pattern": [
      [
        "Inspect the next node",
        "Stop when current or current.next is null."
      ],
      [
        "Skip an equal neighbor",
        "Bypass current.next without advancing current."
      ],
      [
        "Advance on a new value",
        "Move current only when the next value differs."
      ]
    ],
    "complexity": "Each node is advanced past or removed once; no set is needed because the list is sorted.",
    "pitfalls": "Try three equal nodes in a row and duplicates at the tail. Advancing after a deletion can skip another duplicate. C++ deletes bypassed nodes."
  },
  "add-two-linked-list-numbers": {
    "challenge": "Add two nonnegative integers represented as reversed base-10 digit lists. Return a new reversed digit list.",
    "condition": "Each value is a digit 0…9. Empty inputs represent zero. Inputs are not modified.",
    "example": "[2, 4, 3] + [5, 6, 4] represents 342 + 465 → [7, 0, 8].",
    "approach": "At each position, append sum modulo 10 and carry sum divided by 10.",
    "pattern": [
      [
        "Read available digits",
        "Use zero when either input has ended."
      ],
      [
        "Include the carry",
        "Append a new node for total % 10; carry becomes total // 10."
      ],
      [
        "Finish the final carry",
        "Continue while an input or carry remains. Return [0] for two empty inputs."
      ]
    ],
    "complexity": "One pass covers the longer input and an optional final carry. The newly allocated output uses O(max(n, m)) space; auxiliary state is constant.",
    "pitfalls": "Try 999 + 1, unequal lengths, and zero. The least significant digit is first; forward-order digits need a different approach."
  },
  "reorder-linked-list": {
    "challenge": "Reorder L0 → L1 → … → Ln into L0 → Ln → L1 → Ln−1 → … in place.",
    "condition": "Change links rather than values; the input is acyclic.",
    "example": "[1, 2, 3, 4, 5] → [1, 5, 2, 4, 3].",
    "approach": "Reversing the second half makes the next end node available at its head.",
    "pattern": [
      [
        "Split near the middle",
        "Cut the first half’s tail so the two chains are separate."
      ],
      [
        "Reverse the second half",
        "Use the three-pointer reversal."
      ],
      [
        "Weave alternately",
        "Save both next pointers before interleaving one node from each half."
      ]
    ],
    "complexity": "Finding the middle, reversing, and weaving each take O(n). Existing nodes are reused with constant storage.",
    "pitfalls": "Try lengths 0, 1, 2, and odd length. Failing to cut the halves before weaving can introduce a cycle."
  },
  "rotate-linked-list": {
    "challenge": "Rotate a list to the right by k positions and return its new head.",
    "condition": "k is a nonnegative integer; an empty list remains empty.",
    "example": "[1, 2, 3, 4, 5], k = 2 → [4, 5, 1, 2, 3].",
    "approach": "Only k modulo length matters. The new tail is length − k − 1 steps from head.",
    "pattern": [
      [
        "Count and reduce",
        "Find length and tail; compute k modulo length."
      ],
      [
        "Close the ring",
        "Connect tail.next to head when a rotation is needed."
      ],
      [
        "Cut at the new tail",
        "Save newTail.next as head and set newTail.next to null."
      ]
    ],
    "complexity": "Counting and finding the cut take O(n) overall. Only a few pointers and counters are stored.",
    "pitfalls": "Try k = 0, k larger than length, and a multiple of length. Always break the temporary cycle."
  },
  "reverse-nodes-in-k-group": {
    "challenge": "Reverse nodes in consecutive groups of k. Preserve the last group when it contains fewer than k nodes.",
    "condition": "k ≥ 1; the input is acyclic. Relink nodes rather than swapping values.",
    "example": "[1, 2, 3, 4, 5], k = 2 → [2, 1, 4, 3, 5].",
    "approach": "Check that the complete group exists before changing any of its links.",
    "pattern": [
      [
        "Locate the kth node",
        "Walk k links from the previous group’s tail. Stop if incomplete."
      ],
      [
        "Reverse up to the boundary",
        "Use groupNext as the initial previous pointer."
      ],
      [
        "Reconnect the group",
        "Attach the kth node as the new front and move groupPrev to the old front."
      ]
    ],
    "complexity": "Each node participates in a bounded number of scans and pointer updates. The iterative implementation uses constant auxiliary storage.",
    "pitfalls": "Try k = 1, k greater than length, and an exact multiple. Saving the group boundary prevents losing the remaining list."
  },
  "copy-list-with-random-pointer": {
    "challenge": "Deep-copy an acyclic next chain whose nodes also have arbitrary random pointers.",
    "condition": "Each random pointer is null or refers to a node in the same next chain. The input remains unchanged.",
    "example": "A random link from original A to original C becomes copy A → copy C, never a link into the original.",
    "approach": "Allocate every clone first so even forward and self random links already have a destination.",
    "pattern": [
      [
        "Create an identity map",
        "Allocate a new node for every original next-chain node."
      ],
      [
        "Wire copied links",
        "Resolve next and random through the original-to-copy map."
      ],
      [
        "Return the copied head",
        "Null maps to null; the two lists share no nodes."
      ]
    ],
    "complexity": "Two passes use expected O(n) time with hashing. The map uses O(n) auxiliary space and the output allocates O(n) nodes.",
    "pitfalls": "Try null random links, self random links, backward links, and repeated values. Key the map by node identity. C++ returns newly allocated nodes for the caller to own."
  },
  "merge-k-sorted-lists": {
    "challenge": "Merge k sorted lists into a single sorted chain, reusing their nodes.",
    "condition": "Inputs are sorted, acyclic, and pairwise disjoint. N is their total node count.",
    "example": "[1, 4], [2, 5], [3, 6] → [1, 2, 3, 4, 5, 6].",
    "approach": "The smallest available front is always the next output node.",
    "pattern": [
      [
        "Seed the heap",
        "Push each nonempty list head, with a tie breaker for equal values."
      ],
      [
        "Pop the smallest",
        "Append that node and push its next node if present."
      ],
      [
        "Finish the chain",
        "Repeat until the heap is empty and terminate the output tail."
      ]
    ],
    "complexity": "Heap size never exceeds k. Seeding scans k heads; N removals and successor insertions each cost O(log(k + 1)). The heap uses O(k) extra space.",
    "pitfalls": "Try zero lists, empty lists, equal values, and one nonempty input. Python heap entries need a unique tie breaker so nodes are never compared directly."
  },
  "sort-linked-list": {
    "challenge": "Sort an acyclic singly linked list into nondecreasing order using top-down merge sort.",
    "condition": "Reuse the input nodes; the recursive calls use stack space.",
    "example": "[4, 2, 1, 3] → [1, 2, 3, 4].",
    "approach": "Lists split naturally with fast/slow pointers and merge without an auxiliary array.",
    "pattern": [
      [
        "Split into smaller lists",
        "Find the first-half tail and cut its next link."
      ],
      [
        "Sort both halves",
        "Recurse until each chain has at most one node."
      ],
      [
        "Merge sorted halves",
        "Take the smaller front; prefer the left on ties to preserve stability."
      ]
    ],
    "complexity": "Each recursion level merges O(n) nodes across O(log n) levels. Merging is iterative, so the recursion stack uses O(log n) auxiliary space.",
    "pitfalls": "Try an empty list, negative values, duplicates, and reverse order. Cutting the midpoint link is necessary for recursion to shrink. A bottom-up variant can use O(1) extra space."
  }
};
