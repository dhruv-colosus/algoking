export type StackNotes = { challenge: string; condition: string; example: string; approach: string; pattern: [string, string][]; complexity: string; pitfalls: string };
export const stackNotes: Record<string, StackNotes> = {
  "valid-parentheses": {
    "challenge": "Return whether all brackets are correctly paired and nested.",
    "condition": "Input contains only ()[]{}. The empty string is valid.",
    "example": "([{}]) → true; ([)] → false.",
    "approach": "Push openings; a closer must match the top.",
    "pattern": [
      [
        "Push openers",
        "Keep unmatched opening brackets in their input order."
      ],
      [
        "Match the top",
        "A closer must match the most recent opener. A mismatch returns false immediately."
      ],
      [
        "Check for leftovers",
        "After the scan, return true only when the stack is empty."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Do not compare counts alone: order and nesting matter. Try a leading closer and an unfinished opening."
  },
  "min-stack": {
    "challenge": "Implement push, pop, top, and getMin, with each operation taking constant time.",
    "condition": "Operations use push:value, pop, top, min. Queries and pop on an empty stack return null.",
    "example": "push:-2, push:0, push:-3, min, pop, top, min → [-3, 0, -2].",
    "approach": "Each entry stores (value, minimum so far).",
    "pattern": [
      [
        "Save the prefix minimum",
        "Each pushed entry stores its value and the minimum through that depth."
      ],
      [
        "Pop one complete entry",
        "Remove the value together with its saved minimum."
      ],
      [
        "Read constant-time answers",
        "top reads the value; getMin reads its paired minimum. Empty queries return null."
      ]
    ],
    "complexity": "Store the minimum with every entry; queries read only the top. n is the number of stored values.",
    "pitfalls": "Repeated minima need their own entries. Popping one minimum must reveal the previous minimum."
  },
  "queue-using-stacks": {
    "challenge": "Implement a FIFO queue using two LIFO stacks. Return each peek or pop result.",
    "condition": "Operations are push:value, pop, peek. Empty queries return null.",
    "example": "push:1, push:2, peek, pop, push:3, pop, pop → [1, 1, 2, 3].",
    "approach": "Transfer incoming to outgoing only when outgoing is empty.",
    "pattern": [
      [
        "Collect incoming values",
        "Push new items onto the incoming stack."
      ],
      [
        "Reverse only when needed",
        "If outgoing is empty, transfer all incoming items, reversing their order."
      ],
      [
        "Serve the oldest value",
        "Peek or pop the outgoing top. New incoming values must wait behind it."
      ]
    ],
    "complexity": "One operation may transfer O(n) values. Across m operations, total work is O(m).",
    "pitfalls": "A transfer takes O(n) for one operation. Across all operations, each value transfers at most once."
  },
  "evaluate-rpn": {
    "challenge": "Evaluate a valid postfix expression containing integer operands and +, -, *, /.",
    "condition": "Tokens are space-separated. Division truncates toward zero. No division by zero; intermediates fit signed 32-bit integers.",
    "example": "2 1 + 3 * → 9.",
    "approach": "Operands wait on the stack until an operator consumes the top two.",
    "pattern": [
      [
        "Push numbers",
        "Convert each operand token to an integer and push it."
      ],
      [
        "Apply an operator",
        "Pop right, then left; compute left operator right and push the value."
      ],
      [
        "Return the final value",
        "A valid expression leaves one value. Division truncates toward zero."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Operand order matters for subtraction and division. Python // rounds down, so truncate explicitly."
  },
  "infix-to-postfix": {
    "challenge": "Convert a valid infix expression into space-separated postfix tokens.",
    "condition": "Space-separated integer operands, parentheses, and binary + - * /. All operators are left-associative; unary minus is not supported.",
    "example": "3 + 4 * ( 2 - 1 ) → 3 4 2 1 - * +.",
    "approach": "Pop higher or equal precedence operators before pushing the next operator.",
    "pattern": [
      [
        "Output operands",
        "Append numbers directly; push an opening parenthesis as a boundary."
      ],
      [
        "Respect precedence",
        "Before pushing an operator, output all pending operators with higher or equal precedence."
      ],
      [
        "Close and flush",
        "A closing parenthesis flushes its group. At the end, output every remaining operator."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Equal precedence must pop for left associativity. Parentheses are control markers and never appear in the output."
  },
  "decode-string": {
    "challenge": "Decode nested k[encoded] groups, preserving literal letters.",
    "condition": "ASCII letters, positive integer repeat counts, balanced brackets. Decoded length L ≤ 100,000.",
    "example": "3[a2[c]] → accaccacc.",
    "approach": "Save (prefix, count) on [, then restore and expand on ].",
    "pattern": [
      [
        "Accumulate repeat counts",
        "Read consecutive digits into one integer so multi-digit counts work."
      ],
      [
        "Save an outer context",
        "At [, push the current prefix and repeat count, then begin an empty inner fragment."
      ],
      [
        "Restore and expand",
        "At ], pop the context and append the repeated inner fragment to the saved prefix."
      ]
    ],
    "complexity": "n is encoded length; L is decoded length. Copying strings at nested levels costs at most O(nL); live prefixes and expansion need O(n + L) space.",
    "pitfalls": "Support multi-digit counts and nested groups. Intermediate repeated strings can make the time O(nL) in deeply nested cases."
  },
  "simplify-path": {
    "challenge": "Return the canonical form of an absolute Unix path.",
    "condition": "Path starts with /. Empty segments and . are ignored; .. removes one directory if possible. Other names, including ..., are literal.",
    "example": "/a/./b/../../c/ → /c.",
    "approach": "Read slash-separated names and keep the current directory chain.",
    "pattern": [
      [
        "Split into segments",
        "Read names between slashes. Ignore empty segments and a single dot."
      ],
      [
        "Resolve parent moves",
        "A double dot pops one name if the stack is nonempty; it cannot go above root."
      ],
      [
        "Join the directory chain",
        "Join the remaining names with slashes and prepend /. An empty chain is root."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Do not go above root. Repeated slashes collapse; names such as ... are ordinary directories."
  },
  "remove-adjacent-duplicates": {
    "challenge": "Repeatedly remove pairs of equal adjacent characters until none remain.",
    "condition": "ASCII letters; an empty result is the empty string.",
    "example": "abbaca → ca.",
    "approach": "The stack holds the already-reduced prefix.",
    "pattern": [
      [
        "Keep a reduced prefix",
        "The stack represents the prefix after all possible pair removals."
      ],
      [
        "Cancel or append",
        "If the incoming character equals the top, pop it; otherwise push the character."
      ],
      [
        "Read the remaining string",
        "Join the stack. Future input can expose and cancel a new adjacent pair."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Remove pairs, not entire runs: aaa becomes a. Deletions can expose another pair."
  },
  "next-greater-element": {
    "challenge": "For each array position, return the first strictly greater value to its right, or -1.",
    "condition": "Integer values may repeat or be negative. Results are values, not indices.",
    "example": "[2,1,2,4,3] → [4,2,4,-1,-1].",
    "approach": "Keep unresolved indices with non-increasing values.",
    "pattern": [
      [
        "Keep unresolved indices",
        "The stack contains indices with non-increasing values."
      ],
      [
        "Resolve strictly greater",
        "While the incoming value exceeds the top value, pop and assign that index its answer."
      ],
      [
        "Leave missing answers",
        "Push the current index. Any unresolved position retains its initial −1 answer."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Equal values are not greater. Store indices so duplicate values keep distinct answers."
  },
  "next-greater-circular": {
    "challenge": "Find the next strictly greater value for every position when the array is circular.",
    "condition": "At most n − 1 subsequent positions are eligible. Missing answers are -1.",
    "example": "[1,2,1] → [2,-1,2].",
    "approach": "Push indices only on the first pass; use the second pass to resolve them.",
    "pattern": [
      [
        "Scan the first pass",
        "Resolve smaller waiting values and push each original index once."
      ],
      [
        "Wrap around once",
        "Read the array a second time to resolve answers crossing the end; do not push new indices."
      ],
      [
        "Leave maxima unresolved",
        "Positions with no strictly greater value keep −1, including all-equal inputs."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Do not push every index twice. An all-equal array has no strictly greater answer."
  },
  "next-smaller-element": {
    "challenge": "For each position, return the first strictly smaller value to its right, or -1.",
    "condition": "Integer values may repeat or be negative. Results are values, not indices.",
    "example": "[4,8,5,2,25] → [2,5,2,-1,-1].",
    "approach": "Keep unresolved indices with non-decreasing values.",
    "pattern": [
      [
        "Keep unresolved indices",
        "Maintain a stack with non-decreasing values."
      ],
      [
        "Resolve strictly smaller",
        "Pop while the incoming value is less than the top value and assign it as the answer."
      ],
      [
        "Keep equal candidates",
        "Equal values do not resolve each other. Push the current index; missing answers stay −1."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Use > when popping. Equal values do not qualify as strictly smaller."
  },
  "daily-temperatures": {
    "challenge": "Return how many days each temperature must wait for a strictly warmer day.",
    "condition": "Integer temperatures. Return 0 when no warmer day follows.",
    "example": "[73,74,75,71,69,72,76,73] → [1,1,4,2,1,1,0,0].",
    "approach": "A warmer day resolves all cooler days waiting at the top.",
    "pattern": [
      [
        "Store waiting days",
        "Push indices of days that have not yet seen a warmer temperature."
      ],
      [
        "Resolve cooler days",
        "A strictly warmer temperature pops waiting indices; record current index − waiting index."
      ],
      [
        "Keep a zero for no answer",
        "Equal temperatures keep waiting. Unresolved days retain zero."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Return a distance, not the warmer temperature. Equal temperatures must keep waiting."
  },
  "stock-span": {
    "challenge": "For every price, count consecutive days ending today with price ≤ today’s price.",
    "condition": "Nonnegative prices; include today in its own span.",
    "example": "[100,80,60,70,60,75,85] → [1,1,1,2,1,4,6].",
    "approach": "Keep indices of strictly decreasing prices.",
    "pattern": [
      [
        "Discard dominated prices",
        "Pop every price less than or equal to today’s price."
      ],
      [
        "Measure from the blocker",
        "The remaining top is the nearest strictly greater price. Use −1 if none remains."
      ],
      [
        "Record and push",
        "Span is today − blocker. Push today so it can block a future smaller price."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Equal prices belong in the span, so pop with ≤. If the stack empties, the span reaches day zero."
  },
  "largest-rectangle-histogram": {
    "challenge": "Return the largest rectangular area beneath a histogram of unit-width bars.",
    "condition": "Nonnegative integer heights. An empty histogram returns 0.",
    "example": "[2,1,5,6,2,3] → 10.",
    "approach": "Pop a taller bar and measure width between its smaller boundaries.",
    "pattern": [
      [
        "Keep bar indices",
        "Maintain non-decreasing heights so a smaller incoming bar can close taller rectangles."
      ],
      [
        "Measure a popped bar",
        "Its right boundary is current; its left boundary is the new stack top or −1."
      ],
      [
        "Flush with a zero",
        "Compute height × (right − left − 1). A virtual trailing zero closes the remaining bars."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Use width = right − left − 1. A virtual zero at the end flushes remaining bars without modifying input."
  },
  "maximal-rectangle": {
    "challenge": "Return the largest area of an all-ones axis-aligned rectangle in a binary matrix.",
    "condition": "Rectangular matrix of numeric 0 and 1; an empty matrix returns 0.",
    "example": "[[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]] → 6.",
    "approach": "Accumulate column heights for each row; zero resets a height.",
    "pattern": [
      [
        "Build column heights",
        "At each row, increment heights for ones and reset heights to zero for zeros."
      ],
      [
        "Solve the histogram",
        "Run the largest-rectangle stack algorithm on the updated heights."
      ],
      [
        "Keep the global maximum",
        "A fresh stack per row covers every possible bottom boundary in O(rows × cols) time."
      ]
    ],
    "complexity": "Each row adds one linear histogram scan. Heights and the index stack need O(cols) extra space.",
    "pitfalls": "Do not carry a height through a zero. Reset the histogram stack for each row."
  },
  "trapping-rain-water-stack": {
    "challenge": "Return the total water trapped between nonnegative unit-width elevation bars.",
    "condition": "Heights are nonnegative integers. Fewer than three bars trap no water.",
    "example": "[0,1,0,2,1,0,1,3,2,1,2,1] → 6.",
    "approach": "A popped floor needs both a left wall and the current right wall.",
    "pattern": [
      [
        "Store possible left walls",
        "Keep indices of bars until a higher right wall arrives."
      ],
      [
        "Pop the basin floor",
        "The new top is a left wall. Without one, the popped floor cannot trap water."
      ],
      [
        "Add one bounded layer",
        "Add (right − left − 1) × (min(left height, right height) − floor height)."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "If no left wall remains, no basin is closed. Add only the newly bounded height layer."
  },
  "sum-subarray-minimums": {
    "challenge": "Sum the minimum of every nonempty contiguous subarray, modulo 1,000,000,007.",
    "condition": "Positive integer values up to 30,000; length ≤ 30,000. Empty input returns 0.",
    "example": "[3,1,2,4] → 17.",
    "approach": "Use previous strictly smaller and next smaller-or-equal boundaries.",
    "pattern": [
      [
        "Choose a tie owner",
        "Use a previous strictly smaller boundary and next smaller-or-equal boundary."
      ],
      [
        "Resolve each minimum",
        "When an equal or smaller value arrives, pop the minimum and find its left boundary."
      ],
      [
        "Count its subarrays",
        "Add value × (index − left) × (right − index), reducing modulo 1,000,000,007."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "The asymmetric tie rule prevents double-counting duplicate minima. Use 64-bit multiplication in C++."
  },
  "asteroid-collision": {
    "challenge": "Return surviving asteroids after every possible collision. Sign gives direction; magnitude gives size.",
    "condition": "Nonzero signed integers. Asteroids move at equal speed; equal sizes destroy both.",
    "example": "[5,10,-5] → [5,10]; [8,-8] → [].",
    "approach": "While top > 0 and current < 0, destroy the smaller magnitude.",
    "pattern": [
      [
        "Keep surviving asteroids",
        "The stack holds survivors from the processed prefix in their original order."
      ],
      [
        "Resolve head-on motion",
        "Only a positive top followed by a negative current asteroid can collide. The smaller magnitude disappears."
      ],
      [
        "Continue a collision chain",
        "A surviving incoming asteroid may hit another top. Equal magnitudes destroy both."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "Opposite signs alone do not imply a collision: [-2,1] move apart. One asteroid can destroy several survivors."
  },
  "remove-k-digits": {
    "challenge": "Remove exactly k digits from a decimal string to produce the smallest possible number as a string.",
    "condition": "Nonempty decimal string without leading zeros except 0 itself. 0 ≤ k ≤ n. Normalize leading zeros and return 0 if empty.",
    "example": "1432219, k = 3 → 1219.",
    "approach": "While deletions remain and top > current, remove the top digit.",
    "pattern": [
      [
        "Improve the earliest digit",
        "While a smaller digit arrives and deletions remain, pop larger preceding digits."
      ],
      [
        "Spend the remaining quota",
        "After the scan, remove any unused deletion quota from the end."
      ],
      [
        "Normalize the result",
        "Trim leading zeros only after exactly k deletions. Return 0 if no digits remain."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "If digits are already increasing, remove the remaining quota from the end. Only trim leading zeros after deleting exactly k digits."
  },
  "longest-valid-parentheses": {
    "challenge": "Return the length of the longest contiguous well-formed parentheses substring.",
    "condition": "Input contains only ( and ). Empty input returns 0.",
    "example": " )()()) → 4.",
    "approach": "Start with boundary −1; an unmatched closer becomes the new boundary.",
    "pattern": [
      [
        "Seed a boundary index",
        "Begin with −1, the boundary before a valid prefix. Push every opening index."
      ],
      [
        "Match or reset",
        "At a closer, pop. If the stack empties, use the closer’s index as the next invalid boundary."
      ],
      [
        "Measure valid suffixes",
        "Otherwise, current index − top gives the valid suffix length. Keep the maximum."
      ]
    ],
    "complexity": "Each item is pushed and popped at most once; the nested pop loop is amortized linear.",
    "pitfalls": "A subsequence is not a substring. After popping, reset an empty stack before measuring a length."
  }
};
