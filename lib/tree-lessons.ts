export type TreeLesson = { challenge: string; condition: string; example: string; approach: string; pattern: [string, string][]; complexity: string; pitfalls: string };
export const treeLessonNotes: Record<string, TreeLesson> = {
  "tree-preorder": {
    "challenge": "Return the values in root → left → right order.",
    "condition": "The input is a binary tree, with no cycles or shared child nodes.",
    "example": "Balanced example: [8, 4, 2, 6, 12, 10, 14].",
    "approach": "A LIFO stack remembers the branches still waiting to be explored.",
    "pattern": [
      [
        "Visit the root",
        "Pop a node and append its value."
      ],
      [
        "Push in reverse order",
        "Push right before left so left is processed first."
      ],
      [
        "Repeat until empty",
        "Each node is pushed and popped once."
      ]
    ],
    "complexity": "The pending right branches occupy at most O(h) stack space. The returned list takes O(n) space.",
    "pitfalls": "Try empty and skewed trees. Pushing left first visits the right subtree first."
  },
  "tree-inorder": {
    "challenge": "Return the values in left → root → right order.",
    "condition": "Inorder is sorted only when the input obeys the BST ordering rule.",
    "example": "Balanced example: [2, 4, 6, 8, 10, 12, 14].",
    "approach": "Delay the parent on a stack until its whole left subtree is finished.",
    "pattern": [
      [
        "Descend left",
        "Push every ancestor while walking left."
      ],
      [
        "Visit the next root",
        "Pop and output the node whose left side is complete."
      ],
      [
        "Enter its right subtree",
        "Move right and repeat the left descent."
      ]
    ],
    "complexity": "Each node is pushed and popped once. The ancestor stack takes O(h); output takes O(n).",
    "pitfalls": "An empty tree returns []. Do not infer BST validity from local parent comparisons."
  },
  "tree-postorder": {
    "challenge": "Return the values in left → right → root order with one stack.",
    "condition": "Compare node identities, not values: different nodes may have equal values.",
    "example": "Balanced example: [2, 6, 4, 10, 14, 12, 8].",
    "approach": "Remember the last completed subtree to know whether the right side still needs processing.",
    "pattern": [
      [
        "Descend left",
        "Keep ancestors waiting on the stack."
      ],
      [
        "Inspect the right child",
        "Enter it only if it has not just been completed."
      ],
      [
        "Finish the parent",
        "Output the parent after both children and remember its identity."
      ]
    ],
    "complexity": "Each edge is traversed a constant number of times. One stack uses O(h), plus O(n) output.",
    "pitfalls": "A two-stack implementation needs O(n) auxiliary space. This version uses one stack and a last-visited pointer."
  },
  "tree-level-order": {
    "challenge": "Return one list per depth from top to bottom, each level left to right.",
    "condition": "The empty tree returns an empty list. Queue expansion always follows left then right.",
    "example": "Balanced example: [[8], [4, 12], [2, 6, 10, 14]].",
    "approach": "Freeze the queue size before expanding a level.",
    "pattern": [
      [
        "Start with the root",
        "Place the root in a FIFO queue if it exists."
      ],
      [
        "Process one depth",
        "Pop exactly the current width and enqueue each child left to right."
      ],
      [
        "Record the level",
        "Save the row before starting the next depth."
      ]
    ],
    "complexity": "Every node is dequeued once. The queue holds at most O(w) nodes; the returned result is stored separately.",
    "pitfalls": "Try sparse and skewed trees. Do not let newly queued children change the number of pops for the current level."
  },
  "tree-zigzag": {
    "challenge": "Return one list per depth, alternating left-to-right and right-to-left.",
    "condition": "The empty tree returns an empty list. Queue expansion always follows left then right.",
    "example": "Balanced example: [[8], [12, 4], [2, 6, 10, 14]].",
    "approach": "Freeze the queue size before expanding a level.",
    "pattern": [
      [
        "Start with the root",
        "Place the root in a FIFO queue if it exists."
      ],
      [
        "Process one depth",
        "Pop exactly the current width and enqueue each child left to right."
      ],
      [
        "Record the level",
        "Reverse alternate output rows, keeping queue expansion unchanged."
      ]
    ],
    "complexity": "Every node is dequeued once. The queue holds at most O(w) nodes; the returned result is stored separately.",
    "pitfalls": "Try sparse and skewed trees. Do not let newly queued children change the number of pops for the current level."
  },
  "tree-right-view": {
    "challenge": "Return the last visible node at every depth, viewed from the right.",
    "condition": "The empty tree returns an empty list. Queue expansion always follows left then right.",
    "example": "Balanced example: [8, 12, 14].",
    "approach": "Freeze the queue size before expanding a level.",
    "pattern": [
      [
        "Start with the root",
        "Place the root in a FIFO queue if it exists."
      ],
      [
        "Process one depth",
        "Pop exactly the current width and enqueue each child left to right."
      ],
      [
        "Record the level",
        "Keep only the last value."
      ]
    ],
    "complexity": "Every node is dequeued once. The queue holds at most O(w) nodes; the returned result is stored separately.",
    "pitfalls": "Try sparse and skewed trees. The visible node can belong to the left subtree when the right side is shorter."
  },
  "tree-morris": {
    "challenge": "Produce inorder traversal without recursion or an auxiliary stack.",
    "condition": "The tree must be mutable and exclusively accessible during traversal. Complete the traversal so every temporary pointer is removed.",
    "example": "The balanced example outputs [2, 4, 6, 8, 10, 12, 14] and ends with the original tree.",
    "approach": "Use an unused predecessor right pointer as a temporary return address.",
    "pattern": [
      [
        "Find the predecessor",
        "Locate the rightmost node in the left subtree."
      ],
      [
        "Create a thread",
        "If its right pointer is null, point it to the current root and descend left."
      ],
      [
        "Restore and visit",
        "On the second encounter, remove the thread, visit the root, and move right."
      ]
    ],
    "complexity": "Each edge participates in a constant number of predecessor walks overall, so time is O(n). Auxiliary traversal storage is O(1); output is O(n). Teaching snapshots are excluded.",
    "pitfalls": "Never stop early without removing outstanding threads. Use node identity in thread tests. Avoid this approach on shared or read-only trees."
  },
  "tree-height": {
    "challenge": "Find the number of nodes on the longest root-to-leaf path.",
    "condition": "This lesson measures height in nodes: empty = 0 and a leaf = 1.",
    "example": "Balanced example: 3. Right-skewed example: 3.",
    "approach": "The parent needs only the larger of its two child heights.",
    "pattern": [
      [
        "Define the base case",
        "A null child contributes height zero."
      ],
      [
        "Solve both children",
        "Get each child height once."
      ],
      [
        "Add the root",
        "Return 1 + max(left, right)."
      ]
    ],
    "complexity": "Every node is processed once. At most h recursive frames are alive.",
    "pitfalls": "Some questions measure height in edges: subtract one for a nonempty tree and define the empty case explicitly."
  },
  "tree-balanced": {
    "challenge": "Check whether every node has left and right subtree heights differing by at most one.",
    "condition": "Balance must hold at every node, not only at the root. Empty trees are balanced.",
    "example": "Balanced example: true. The three-node right chain: false.",
    "approach": "Return a height when valid and −1 as soon as any subtree is unbalanced.",
    "pattern": [
      [
        "Compute heights bottom up",
        "A null subtree has height zero."
      ],
      [
        "Check the difference",
        "Reject a difference greater than one or an already failed child."
      ],
      [
        "Propagate one result",
        "Return a height or the failure sentinel to avoid repeated scans."
      ]
    ],
    "complexity": "Each node height is computed at most once. This avoids the O(n²) worst case of recomputing heights at every node.",
    "pitfalls": "Try a balanced root with an unbalanced descendant. Do not use −1 as both a valid height and a failure flag."
  },
  "tree-diameter": {
    "challenge": "Find the maximum number of edges on a path between any two nodes.",
    "condition": "The path may lie entirely below the root. Empty and single-node trees have diameter zero.",
    "example": "Balanced example: 4 edges. Three-node chain: 2 edges.",
    "approach": "Every candidate path has a highest node, joining its left and right downward heights.",
    "pattern": [
      [
        "Get child heights",
        "Measure each child height in nodes."
      ],
      [
        "Try a path through the root",
        "left_height + right_height is the number of edges through this node."
      ],
      [
        "Return one height",
        "Only the taller branch can continue into the parent."
      ]
    ],
    "complexity": "One postorder pass computes all heights and candidates in O(n), with O(h) stack space.",
    "pitfalls": "Keep height and diameter units distinct. Return height upward, not the best diameter."
  },
  "tree-max-path-sum": {
    "challenge": "Find the largest sum of a nonempty simple path, with any endpoints.",
    "condition": "Values may be negative. An empty tree returns None/nullopt because no nonempty path exists.",
    "example": "For [−10, 9, 20, null, null, 15, 7], the path 15 → 20 → 7 sums to 42. All-negative example: −2.",
    "approach": "A path can join two branches locally, but only one branch may continue upward.",
    "pattern": [
      [
        "Discard negative child gains",
        "Use max(0, gain(child)) for each side."
      ],
      [
        "Update the global answer",
        "Consider node.value + left + right."
      ],
      [
        "Return one branch",
        "Return node.value + max(left, right) to the parent."
      ]
    ],
    "complexity": "The postorder pass visits each node once and keeps O(h) recursive frames.",
    "pitfalls": "Initialize the best sum to negative infinity, not zero. C++ assumes every candidate and intermediate sum fits in long long."
  },
  "tree-symmetric": {
    "challenge": "Check whether the tree is a mirror of itself in both values and shape.",
    "condition": "Null positions matter. An empty tree is symmetric.",
    "example": "The first example is symmetric; the sparse example has equal values but mismatched child positions.",
    "approach": "Compare pairs of positions reflected across the root.",
    "pattern": [
      [
        "Compare null positions",
        "Both null matches; exactly one null fails."
      ],
      [
        "Compare values",
        "A mirror pair must hold equal values."
      ],
      [
        "Cross the children",
        "Compare left with right, then right with left."
      ]
    ],
    "complexity": "Every mirror pair is checked at most once. The recursive depth is bounded by h.",
    "pitfalls": "Two equal traversal lists are insufficient without shape information. Do not compare left-left and right-right."
  },
  "tree-invert": {
    "challenge": "Mirror the tree in place by exchanging every node’s children.",
    "condition": "The function mutates pointers and returns the same root object.",
    "example": "The balanced tree root remains 8; its left child becomes 12 and its right child becomes 4.",
    "approach": "Mirror both subtrees after swapping their positions.",
    "pattern": [
      [
        "Handle null",
        "An empty subtree stays empty."
      ],
      [
        "Swap children",
        "Preserve both pointers while exchanging them."
      ],
      [
        "Mirror recursively",
        "Apply the same operation to both resulting children."
      ]
    ],
    "complexity": "Every node is swapped once. The recursion uses O(h) space; no new nodes are allocated.",
    "pitfalls": "Inverting twice must restore the original tree. A BST mirror usually no longer follows the original ordering rule."
  },
  "tree-count-complete": {
    "challenge": "Count nodes faster than a full scan when the binary tree is complete.",
    "condition": "All levels before the last are full, and the final level fills left to right. Completeness is a required precondition, not checked here.",
    "example": "Perfect example: 7 nodes. Partial final level example: 6 nodes.",
    "approach": "In a complete tree, equal extreme heights prove that the subtree is perfect.",
    "pattern": [
      [
        "Measure the extremes",
        "Follow only left pointers and only right pointers."
      ],
      [
        "Count perfect subtrees directly",
        "Equal heights give 2^height − 1 nodes."
      ],
      [
        "Split only when needed",
        "Count both children plus one; at most one child remains non-perfect per level."
      ]
    ],
    "complexity": "There are O(log n) non-perfect levels, with O(log n) extreme-height work per level. Recursion occupies O(log n) space.",
    "pitfalls": "Equal extreme heights do not prove perfection in arbitrary trees. C++ requires height < 63 and counts fitting in long long."
  },
  "tree-root-paths": {
    "challenge": "Return every complete root-to-leaf path in left-to-right order.",
    "condition": "A leaf has no children. Let L be the total number of values copied into all returned paths.",
    "example": "Balanced example: [8,4,2], [8,4,6], [8,12,10], [8,12,14]. A single node gives one one-value path.",
    "approach": "Share one working path during recursion and copy it only at a leaf.",
    "pattern": [
      [
        "Extend",
        "Append the current value."
      ],
      [
        "Save complete paths",
        "At a leaf, copy the working list into the output."
      ],
      [
        "Backtrack",
        "Remove the current value before returning."
      ]
    ],
    "complexity": "Visiting costs O(n); copying all answers costs O(L). Stack and working path use O(h), excluding output.",
    "pitfalls": "Saving the same mutable list without copying changes earlier answers. Empty trees return no paths."
  },
  "tree-path-sum": {
    "challenge": "Decide whether any root-to-leaf path has the requested sum.",
    "condition": "A path must end at a leaf. Values can be negative, so a negative remainder does not justify pruning.",
    "example": "Target 14 succeeds via 8 → 4 → 2. Target 1 on [1,2,3] fails: the root is not a leaf.",
    "approach": "Pass the remaining sum down each branch.",
    "pattern": [
      [
        "Subtract the node",
        "Update remaining = target − node.value."
      ],
      [
        "Check only leaves",
        "At a leaf, succeed exactly when remaining is zero."
      ],
      [
        "Search either child",
        "Stop after the first successful path."
      ]
    ],
    "complexity": "Worst-case time is O(n), with O(h) recursion. Successful paths can stop the search early.",
    "pitfalls": "An empty tree has no root-to-leaf path, even for target zero. C++ requires intermediate subtraction to fit in long long."
  },
  "tree-lca": {
    "challenge": "Return the deepest node that is an ancestor of both target node objects in a binary tree.",
    "condition": "Both targets must exist in the tree. A node is its own ancestor; p and q may be the same object.",
    "example": "D:2 and E:6 meet at B:4. For B:4 and D:2, the answer is B:4 itself.",
    "approach": "Return a found target upward until two non-null branches meet.",
    "pattern": [
      [
        "Recognize a target",
        "Null returns null; either target returns itself."
      ],
      [
        "Search both sides",
        "Ask the two subtrees for matches."
      ],
      [
        "Resolve the split",
        "Both non-null means this root is LCA; otherwise propagate the single match."
      ]
    ],
    "complexity": "The worst case visits all nodes. The recursive call path occupies O(h).",
    "pitfalls": "Use object identity, not value equality. If a target may be missing, add an existence check or propagate a match count."
  },
  "tree-distance-k": {
    "challenge": "Return values of all nodes exactly k edges from the target node.",
    "condition": "Target identity matters when values repeat. A missing target, negative k, or empty tree gives [].",
    "example": "From B:4 at k = 2, the balanced example returns [12]. A distance beyond the tree gives [].",
    "approach": "Build upward links, then use BFS with a visited set.",
    "pattern": [
      [
        "Index parents",
        "Traverse once to map each child to its parent."
      ],
      [
        "Start at the target",
        "Mark it before enqueueing; distance zero contains only the target."
      ],
      [
        "Expand k layers",
        "Explore left, right, and parent without revisiting."
      ]
    ],
    "complexity": "Building parents and the BFS each take O(n) time. Parent links, visited nodes, and the queue use O(n) space.",
    "pitfalls": "Without visited state, parent links create repeated back-and-forth moves. Output order is not generally part of the problem contract."
  },
  "tree-boundary": {
    "challenge": "Return the anti-clockwise boundary, beginning at the root, without repeating nodes.",
    "condition": "Convention: root, non-leaf left boundary, all leaves left to right, then reversed non-leaf right boundary.",
    "example": "Balanced example: [8, 4, 2, 6, 10, 14, 12]. Right chain: [3, 1, 2].",
    "approach": "Assign each boundary node to exactly one phase.",
    "pattern": [
      [
        "Follow the left edge",
        "Prefer left; fall back to right. Exclude leaves."
      ],
      [
        "Collect all leaves",
        "Use left-to-right DFS; the root leaf is handled separately."
      ],
      [
        "Reverse the right edge",
        "Prefer right; fall back to left. Append non-leaves bottom up."
      ]
    ],
    "complexity": "Leaf DFS visits O(n) nodes. Recursion and a temporary right-boundary list use O(h), plus output.",
    "pitfalls": "Try a single node and trees with only one side. Emitting leaves in boundary walks would duplicate them."
  },
  "tree-vertical": {
    "challenge": "Group nodes by vertical column, ordering each column by row, then value for position ties.",
    "condition": "Root is (row 0, column 0); left changes column by −1 and right by +1. This lesson uses value-sorted ties.",
    "example": "In the first example, values 9 and 5 share (row 2, column 0). Output: [[4], [2], [1,5,9], [3], [6]].",
    "approach": "Turn geometry into sortable (column, row, value) records.",
    "pattern": [
      [
        "Assign coordinates",
        "Descend with row + 1 and column ± 1."
      ],
      [
        "Sort the records",
        "Sort lexicographically by column, row, then value."
      ],
      [
        "Group adjacent columns",
        "Start a new output list when the column changes."
      ]
    ],
    "complexity": "Recording visits is O(n); sorting dominates at O(n log n). Records and output use O(n), and the call stack is O(h).",
    "pitfalls": "Some problems use BFS encounter order for ties instead. Follow the exact tie rule in the statement; the walkthrough may gather with BFS while the code uses DFS, then both apply the same sort."
  },
  "bst-search": {
    "challenge": "Find a key in a binary search tree and return its node object, or null if absent.",
    "condition": "Strict BST: every key in the left subtree is smaller; every key in the right subtree is larger.",
    "example": "Key 10 follows 8 → 12 → 10 and returns F:10. Key 11 reaches a null child.",
    "approach": "Use the ordering rule to choose exactly one child at each comparison.",
    "pattern": [
      [
        "Compare the current key",
        "Return immediately on equality."
      ],
      [
        "Choose one side",
        "Smaller goes left; larger goes right."
      ],
      [
        "Stop at null",
        "An empty search range means the key is missing."
      ]
    ],
    "complexity": "One comparison per tree level gives O(h). This is O(log n) in a balanced BST but O(n) in a chain. Iteration uses O(1) extra space.",
    "pitfalls": "Do not assume a BST is balanced. Return the node, not a boolean, when callers need its subtree."
  },
  "bst-insert": {
    "challenge": "Insert a key while preserving the strict BST ordering rule and return the updated root.",
    "condition": "Duplicate keys are ignored. Insertion mutates the tree and does not rebalance it.",
    "example": "Key 5 becomes the left child of E:6. Inserting 7 into an empty tree creates the root.",
    "approach": "A recursive call returns the root that must be reattached to the chosen child pointer.",
    "pattern": [
      [
        "Find a null position",
        "Create one new node at the empty child."
      ],
      [
        "Reconnect on return",
        "Assign the returned node to root.left or root.right."
      ],
      [
        "Keep the root",
        "Return the current root; equality makes no change."
      ]
    ],
    "complexity": "One root-to-leaf route takes O(h) time and O(h) recursive frames, plus one new node.",
    "pitfalls": "Call root = bst_insert(root, key), including for an empty tree. Repeated sorted insertions can create a chain."
  },
  "bst-delete": {
    "challenge": "Remove one key from a strict BST and return the updated root.",
    "condition": "Missing keys leave the tree unchanged. For two children, copy the inorder successor key and remove the successor.",
    "example": "Deleting root 8 copies successor 10, then removes its original leaf. With one child, the root becomes 4.",
    "approach": "Deletion returns a replacement subtree root for every structural case.",
    "pattern": [
      [
        "Search by comparisons",
        "Recurse into only the relevant side."
      ],
      [
        "Handle zero or one child",
        "Replace the matched node with its surviving child or null."
      ],
      [
        "Handle two children",
        "Use the leftmost right-subtree node, copy its key, and delete it there."
      ]
    ],
    "complexity": "Searching and finding/removing the successor follow O(h) total edges. Recursive storage is O(h).",
    "pitfalls": "Always assign root = bst_delete(root, key). C++ uses individually new-allocated nodes and deletes the removed object; external pointers to it become invalid."
  },
  "bst-validate": {
    "challenge": "Check that every descendant follows strict BST ordering with respect to all its ancestors.",
    "condition": "Duplicates are invalid. Empty trees are valid. Values are finite integers.",
    "example": "The second example places 6 in the right subtree of 8: it is below parent 12 but still violates the lower bound 8.",
    "approach": "Pass an open interval of legal values down each path.",
    "pattern": [
      [
        "Start with no bounds",
        "The root is unrestricted."
      ],
      [
        "Check strict membership",
        "Require low < node.value < high when bounds exist."
      ],
      [
        "Narrow each child range",
        "Left inherits the lower bound; right inherits the upper bound."
      ]
    ],
    "complexity": "Each node is checked at most once in O(n), with O(h) recursive space.",
    "pitfalls": "Checking only immediate children misses deeper violations. Optional C++ bounds allow even the minimum and maximum long long keys."
  },
  "bst-kth-smallest": {
    "challenge": "Return the kth smallest key of a strict BST, using one-based k.",
    "condition": "Return None/nullopt for nonpositive k or k larger than the node count.",
    "example": "k = 3 returns 6. The seven-node example has no ninth smallest key.",
    "approach": "Inorder visits keys in increasing order, so stop on the kth visit.",
    "pattern": [
      [
        "Descend left",
        "Keep pending ancestors on a stack."
      ],
      [
        "Count visits",
        "Decrement k when popping a node, not when pushing it."
      ],
      [
        "Stop or go right",
        "Return at zero; otherwise visit the right subtree next."
      ]
    ],
    "complexity": "Initial descent costs O(h); processing k nodes adds O(k). Invalid k may scan all n nodes. The stack uses O(h).",
    "pitfalls": "This method requires a valid BST. For frequent rank queries and updates, consider subtree-size augmentation."
  },
  "tree-build": {
    "challenge": "Reconstruct the unique binary tree given its preorder and inorder traversals.",
    "condition": "Inputs must be valid traversals of the same tree with unique values. These snippets assume that precondition rather than validating arbitrary arrays.",
    "example": "Preorder [8,4,2,6,12,10,14] and inorder [2,4,6,8,10,12,14] reconstruct the balanced example.",
    "approach": "Preorder chooses the root; its inorder position divides the left and right subtrees.",
    "pattern": [
      [
        "Index inorder",
        "Map each value to its inorder position once."
      ],
      [
        "Consume a preorder root",
        "Use a single cursor shared by recursive calls."
      ],
      [
        "Build left then right",
        "Split the inorder interval and reconnect the results."
      ]
    ],
    "complexity": "Expected O(n) time with hash lookups; index, output nodes, and O(h) recursion use O(n) storage. No array slicing is needed.",
    "pitfalls": "Duplicates make this reconstruction ambiguous. Building the right side before the left consumes preorder in the wrong order."
  },
  "tree-serialize": {
    "challenge": "Encode a binary tree as text and decode it into the same values and shape.",
    "condition": "Values are signed integers. The decoder expects a valid complete stream from this serializer; it does not validate untrusted input.",
    "example": "The sparse example [1,null,2,3] encodes as 1,#,2,3,#,#,#. An empty tree encodes as #.",
    "approach": "Preorder plus a marker for every null child uniquely determines shape.",
    "pattern": [
      [
        "Write node or null",
        "Emit the value, or # for an absent node."
      ],
      [
        "Write left then right",
        "Use the same recursive order throughout."
      ],
      [
        "Read with one cursor",
        "Consume one token per call and rebuild both child positions."
      ]
    ],
    "complexity": "There are 2n + 1 tokens. With fixed-width integer values, time and storage are O(n), including the string and rebuilt nodes; recursion uses O(h).",
    "pitfalls": "Without null markers, preorder alone cannot preserve arbitrary shape. Test negative and duplicate values and a round trip."
  },
  "tree-flatten": {
    "challenge": "Rewire the existing nodes into a preorder chain using right pointers, with every left pointer null.",
    "condition": "Mutates the original tree. The root object and all node identities are preserved.",
    "example": "Balanced example chain: 8 → 4 → 2 → 6 → 12 → 10 → 14.",
    "approach": "Build the chain backward using reverse preorder: right, left, root.",
    "pattern": [
      [
        "Finish the right subtree",
        "It becomes the tail of the final chain."
      ],
      [
        "Finish the left subtree",
        "It is linked in front of that tail."
      ],
      [
        "Prepend the current root",
        "Set right to previous, clear left, and update previous."
      ]
    ],
    "complexity": "One recursive visit per node gives O(n) time and O(h) stack space. No replacement nodes are created.",
    "pitfalls": "Reset previous for every call, as the snippets do. This recursive version is not O(1) auxiliary space; deep chains can exhaust the call stack."
  }
};
