export type WindowNotes = {
  challenge: string; condition: string; example: string; approach: string;
  pattern: [string, string][]; complexity: string; pitfalls: string;
};
const letters = "Strings contain ASCII characters; indices are zero-based. C++17 or later.";
const lowercase = "Strings contain lowercase English letters. The pattern is nonempty. Indices are zero-based.";
const fixedSize = "Use 1 ≤ k ≤ n. Values may be negative. Indices are zero-based.";
export const windowNotes: Record<string, WindowNotes> = {
  "maximum-sum-subarray-k": {
    challenge: "Return the largest sum among all contiguous subarrays of exactly k elements.", condition: fixedSize,
    example: "[2, 1, 5, 1, 3, 2], k = 3 → 9, from [5, 1, 3].",
    approach: "Build the first sum once. Each slide adds one value and removes one value. Divide the best sum by k to get the maximum fixed-window average.",
    pattern: [["Build a full window", "Sum the first k values before choosing the initial best."], ["Reuse the sum", "Add nums[right] and subtract nums[right − k]."], ["Keep the largest", "Compare the new sum with the best after every slide."]],
    complexity: "A single scan with only a running sum and best sum; no extra subarray is needed.", pitfalls: "Initialize best with the first complete sum, not zero. Try all-negative values, k = 1, and k = n. The nonempty-window contract excludes an empty input.",
  },
  "maximum-vowels": {
    challenge: "Return the largest number of vowels in any substring of exactly k characters. Vowels are a, e, i, o, and u.", condition: "Lowercase English letters; 1 ≤ k ≤ n.",
    example: "abciiidef, k = 3 → 3, from iii.", approach: "Maintain the count of characters satisfying a predicate. The same template counts any chosen category within a fixed window.",
    pattern: [["Count incoming vowels", "Add one if the new right character is a vowel."], ["Remove outgoing vowels", "Once right ≥ k, subtract the contribution at right − k."], ["Evaluate full windows", "Update the best only after at least k characters have arrived."]],
    complexity: "Membership uses a constant-size vowel set. Each character enters and leaves once.", pitfalls: "The letter y is not a vowel here. Try no vowels, all vowels, and a vowel leaving the left boundary.",
  },
  "first-negative-in-window": {
    challenge: "Return the first negative number in each consecutive window of k elements. Return 0 for a window with no negative numbers.", condition: fixedSize,
    example: "[12, −1, −7, 8, −15, 30, 16, 28], k = 3 → [−1, −1, −7, −15, −15, 0].",
    approach: "Store only the indices of negative numbers, in input order. The first unexpired index identifies the answer.",
    pattern: [["Expire old indices", "Remove queue entries smaller than right − k + 1."], ["Enqueue negatives", "If the incoming value is negative, append its index."], ["Read the front", "The oldest remaining negative is first in this window; an empty queue means 0."]],
    complexity: "Each index is enqueued and removed at most once. Up to k negative indices can be live; output storage is excluded.", pitfalls: "Store indices so you can expire duplicates correctly. Zero is not negative. Use a deque rather than repeatedly shifting a dynamic array.",
  },
  "find-all-anagrams": {
    challenge: "Return every start index where a substring of s is an anagram of pattern. Anagrams have exactly the same character multiplicities.", condition: lowercase,
    example: "s = cbaebabacd, pattern = abc → [0, 6].", approach: "Keep a frequency vector for a window of pattern.length characters. Comparing 26 counters is constant work for this alphabet.",
    pattern: [["Count the pattern", "Build its 26-letter frequency vector once."], ["Slide a matching-size window", "Increment the incoming character and decrement the outgoing one."], ["Compare multiplicities", "If both vectors match, record right − pattern.length + 1."]],
    complexity: "n = s.length, m = pattern.length. O(m + 26n) simplifies to O(n + m). The two 26-counter vectors use constant extra space; output is excluded.", pitfalls: "A set of letters loses duplicates. Try overlapping matches, repeated pattern characters, and a pattern longer than the source. Return all matches, including overlaps.",
  },
  "permutation-in-string": {
    challenge: "Return true if any substring of s is a permutation of pattern; otherwise return false.", condition: lowercase,
    example: "s = eidbaooo, pattern = ab → true, because ba appears at index 3.", approach: "Use the anagram frequency window, returning immediately at the first match. The function takes the source first and pattern second.",
    pattern: [["Set the required frequencies", "A permutation must have the same length and counts as pattern."], ["Maintain a fixed window", "Update only the characters entering and leaving the window."], ["Stop at the first match", "Return true for an equal vector; finish the scan with false otherwise."]],
    complexity: "n = source length, m = pattern length. Two 26-entry vectors make each comparison constant time.", pitfalls: "Check multiplicities, not just presence. Try a missing permutation, a pattern longer than s, and a pattern with repeated letters.",
  },
  "longest-substring-without-repeats": {
    challenge: "Return the length of the longest contiguous substring in which every character appears at most once.", condition: letters,
    example: "abcabcbb → 3, from abc; abba → 2.", approach: "Before adding right, the old window is valid. Only the incoming character can introduce a duplicate, so shrink until its frequency is one.",
    pattern: [["Add the next character", "Increment its frequency in the active window."], ["Remove the duplicate", "Advance left while the incoming character appears more than once."], ["Measure a valid window", "Update best with right − left + 1 after restoring uniqueness."]],
    complexity: "Both pointers advance at most n times. Frequencies use at most 128 ASCII entries; empty input returns 0.", pitfalls: "A substring is contiguous. If using last-seen indices instead, never move left backward; abba exposes that bug. Spaces and letter case are distinct characters.",
  },
  "longest-substring-k-distinct": {
    challenge: "Return the longest substring length containing at most k distinct characters. Characters may repeat.", condition: `${letters} k ≥ 0.`,
    example: "eceba, k = 2 → 3, from ece.", approach: "Maintain exact character frequencies. A character stops contributing to distinct count only when its frequency reaches zero. For a fruit-basket problem, the same rule uses k = 2.",
    pattern: [["Expand and count", "Add the incoming character to the frequency map."], ["Restore the budget", "While distinct > k, remove from the left and delete zero-count entries."], ["Keep the longest", "All remaining windows have at most k distinct characters."]],
    complexity: "The ASCII alphabet bounds the map size independently of n. For arbitrary integer values, use O(min(n, k + 1)) space instead.", pitfalls: "At most k allows fewer than k. A zero budget returns 0. Leaving zero-count keys in the map corrupts the distinct count.",
  },
  "longest-repeating-character-replacement": {
    challenge: "Return the longest substring length that can become a single repeated letter after replacing at most k characters.", condition: "Uppercase English letters; k ≥ 0. Empty input returns 0.",
    example: "AABABBA, k = 1 → 4: replace the B in AABA to get AAAA.", approach: "Keep the most common letter and replace the rest. This version recomputes the exact maximum frequency so every displayed window is truly valid.",
    pattern: [["Count the window", "Update the 26 uppercase-letter counters."], ["Compute the repair cost", "Replacements needed = length − largest current frequency."], ["Shrink until affordable", "Remove left characters while the exact cost exceeds k; then record the length."]],
    complexity: "Recomputing the maximum scans 26 counters. O(26n) is O(n); the counter array uses constant space.", pitfalls: "Use the largest frequency, not the number of distinct characters. A historical maximum is a different optimization with a different invariant; do not mix its explanation with exact-window validity.",
  },
  "max-consecutive-ones-iii": {
    challenge: "Return the longest contiguous run of ones obtainable by flipping at most k zeros in a binary array.", condition: "Every value is 0 or 1; k ≥ 0. The input is not modified.",
    example: "[1,1,1,0,0,0,1,1,1,1,0], k = 2 → 6.", approach: "Treat each zero as one unit of cost. Maintain a window whose zero count fits the flip budget.",
    pattern: [["Count incoming zeros", "Adding a one costs nothing; adding a zero increases the cost."], ["Shrink when over budget", "Advance left until the zero count is at most k."], ["Record the full length", "The valid window includes both existing ones and zeros you could flip."]],
    complexity: "A zero counter and two boundaries suffice; every element enters and leaves once.", pitfalls: "Use at most k flips, not exactly k. Try all zeros with k = 0, all ones, and a budget larger than the zero count.",
  },
  "minimum-size-subarray-sum": {
    challenge: "Return the minimum length of a contiguous subarray with sum at least target. Return 0 when no such subarray exists.", condition: "Positive integers only; target > 0. Empty input returns 0.",
    example: "[2, 3, 1, 2, 4, 3], target = 7 → 2, from [4, 3].", approach: "Positive values make expansion increase the sum and shrinking decrease it. Record a valid window before removing its left element.",
    pattern: [["Expand toward the target", "Add nums[right] to the running sum."], ["Save a qualifying length", "While sum ≥ target, improve the best length."], ["Try removing the left edge", "Subtract nums[left] and advance left until the window is too small in sum."]],
    complexity: "Each pointer advances at most n times; only a running sum and shortest length are needed.", pitfalls: "Negative numbers break this monotone sum argument. Use a prefix-sum/monotonic-deque method for shortest subarray with negatives. Try no solution and a single value reaching the target.",
  },
  "minimum-window-substring": {
    challenge: "Return the shortest substring of s containing all characters of pattern, including repeated requirements. Return an empty string if none exists; ties keep the earliest window.", condition: letters,
    example: "s = ADOBECODEBANC, pattern = ABC → BANC.", approach: "Track matched required occurrences, not only distinct letters. An excess copy does not increase matched. Save boundaries while scanning and slice only once.",
    pattern: [["Add a required occurrence", "Increment matched only when the new count does not exceed the requirement."], ["Cover, then minimize", "When matched equals pattern.length, save the shortest window before shrinking."], ["Notice lost coverage", "Removing a character decreases matched only if its count was at or below the required count."]],
    complexity: "n = source length, m = pattern length. The scan and pattern count take O(n + m); ASCII counters use constant auxiliary space. Returned substring storage is excluded.", pitfalls: "A pattern such as AAC needs two As. Empty pattern returns an empty string. Avoid copying every candidate substring in the scan, which can make the code quadratic.",
  },
  "subarrays-k-distinct": {
    challenge: "Count nonempty contiguous subarrays containing exactly k distinct values.", condition: "Integer array; k ≥ 0. Empty input or k = 0 returns 0.",
    example: "[1, 2, 1, 2, 3], k = 2 → 7.", approach: "Exactly k is not preserved by removing a left element. Count at most k and at most k − 1 independently, then subtract.",
    pattern: [["Build an at-most counter", "Shrink until the distinct count is within the current budget."], ["Count every valid ending", "The valid window [left, right] contributes right − left + 1 suffixes."], ["Subtract adjacent budgets", "exactly(k) = atMost(k) − atMost(k − 1). Define atMost(negative) as 0."]],
    complexity: "Two linear passes remain O(n), with expected constant-time hash operations. Arbitrary integer keys need O(n) space in the worst case.", pitfalls: "Count subarrays rather than just recording one length. Delete zero-count keys, reset all state between passes, and use a 64-bit C++ answer for up to n(n + 1)/2 windows.",
  },
  "binary-subarrays-with-sum": {
    challenge: "Count nonempty contiguous subarrays of a binary array whose sum equals goal.", condition: "Every value is 0 or 1; goal ≥ 0. Empty input returns 0.",
    example: "[1, 0, 1, 0, 1], goal = 2 → 4; [0, 0, 0], goal = 0 → 6.", approach: "Nonnegative values support an at-most sum window. Subtract counts for goal and goal − 1 to include every valid zero-prefixed or zero-suffixed subarray.",
    pattern: [["Count sums up to a budget", "Shrink while the running sum exceeds the budget."], ["Add valid suffixes", "Every start from left through right yields a valid at-most window."], ["Isolate the exact sum", "Subtract atMost(goal − 1) from atMost(goal); negative budgets contribute zero."]],
    complexity: "Two passes, a running sum, and two boundaries use O(n) time and O(1) extra space.", pitfalls: "Zeros create multiple windows with the same sum. A single increment per matching right edge undercounts them. Goal = 0 requires the explicit negative-budget guard; negative array values require another approach.",
  },
  "subarray-product-less-than-k": {
    challenge: "Count nonempty contiguous subarrays whose product is strictly smaller than k.", condition: "1 ≤ nums[i] ≤ 10⁶; 0 ≤ k ≤ 10⁹. Empty input returns 0.",
    example: "[10, 5, 2, 6], k = 100 → 8. The product 10 × 5 × 2 = 100 is excluded.", approach: "With positive integers, dropping elements cannot increase a product. Restore product < k, then count all suffixes ending at right.",
    pattern: [["Handle k ≤ 1 first", "Every nonempty positive-integer product is at least 1, so return 0."], ["Maintain a strict bound", "Multiply the incoming value; divide outgoing values while product ≥ k."], ["Count all suffixes", "Add right − left + 1, including zero when even the single value fails."]],
    complexity: "Each value is multiplied once and divided out at most once. Under the stated bounds, the intermediate product fits a C++ 64-bit integer.", pitfalls: "The comparison is strict: shrink on ≥, not >. Zeros, negatives, and fractions need different handling. Python uses exact integer division; C++ stores both product and answer in long long.",
  },
  "sliding-window-maximum": {
    challenge: "Return the maximum value in every consecutive window of exactly k elements.", condition: fixedSize,
    example: "[1, 3, −1, −3, 5, 3, 6, 7], k = 3 → [3, 3, 5, 5, 6, 7].", approach: "Keep candidate indices with decreasing values. A newer value that is at least as large dominates older smaller candidates and expires later.",
    pattern: [["Expire from the front", "Remove indices to the left of the current window."], ["Discard dominated candidates", "Pop from the back while its value is ≤ the incoming value, then append right."], ["Read the maximum", "For a full window, the front index points to its largest value."]],
    complexity: "Despite the inner loops, each index enters once and leaves at most once. The deque has at most k live indices; returned output is excluded.", pitfalls: "Store indices rather than only values. Expiration and dominance are separate rules. Try equal maxima, decreasing input, k = 1, and k = n.",
  },
};
