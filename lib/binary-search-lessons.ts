export type SearchNotes = {
  challenge: string; condition: string; example: string; approach: string;
  pattern: [string, string][]; complexity: string; pitfalls: string;
};
export const searchNotes: Record<string, SearchNotes> = {
  "binary-search": {
    challenge: "Return the index of a target in an ascending sorted array, or −1 if it is absent.", condition: "Values are distinct. Empty input returns −1. Indices are zero-based.",
    example: "[−1, 0, 3, 5, 9, 12, 15, 18], target = 9 → 4.", approach: "Keep an inclusive interval [left, right]. A comparison with the middle eliminates every value on one side.",
    pattern: [["Inspect the middle", "Compute left + (right − left) / 2, rounded down."], ["Discard an impossible half", "A smaller middle moves left past mid; a larger middle moves right before mid."], ["Stop at a match or empty range", "Return the index on equality. When left > right, return −1."]],
    complexity: "Every failed comparison halves the candidate count. Only three indices are stored.", pitfalls: "Try the first and last elements, a singleton, an empty array, and an absent target. Return the index rather than the value, and always move past mid after a failed comparison.",
  },
  "lower-bound": {
    challenge: "Return the first index i with nums[i] ≥ target. Return n if every value is smaller. This is the sorted insertion position.", condition: "Ascending order; duplicates allowed. Empty input returns 0. The result can be one past the last index.",
    example: "[1, 2, 2, 2, 5, 8], target = 2 → 1; target = 9 → 6.", approach: "Search for the false-to-true boundary of nums[i] ≥ target. Equality must continue toward the left.",
    pattern: [["Define the predicate", "Values before the boundary are < target; values from the boundary onward are ≥ target."], ["Keep searching on equality", "If nums[mid] ≥ target, move right to mid − 1. Otherwise move left to mid + 1."], ["Return left", "The crossed interval leaves left at the first qualifying index, possibly n."]],
    complexity: "A single halving search uses O(log n) comparisons and constant extra memory.", pitfalls: "Do not return immediately on equality: that may be a later duplicate. A result of n is valid and must never be dereferenced. Lower bound also solves search-insert position.",
  },
  "upper-bound": {
    challenge: "Return the first index i with nums[i] > target, or n if no value qualifies.", condition: "Ascending order; duplicates allowed. Empty input returns 0.",
    example: "[1, 2, 2, 2, 5, 8], target = 2 → 4.", approach: "Use a strict predicate. Equal values belong on the discarded left side, so the search moves beyond the entire duplicate run.",
    pattern: [["Make the comparison strict", "The first true value must be > target, not ≥ target."], ["Skip equals", "When nums[mid] ≤ target, move left to mid + 1."], ["Return the crossing point", "Otherwise move right to mid − 1; left is the final answer."]],
    complexity: "The interval halves on every iteration, independent of how many duplicates exist.", pitfalls: "Upper bound is an index, not the largest value ≤ target. That predecessor index is upperBound(target) − 1, which may be −1. Avoid replacing the predicate with target + 1, which can overflow.",
  },
  "first-last-occurrence": {
    challenge: "Return [first index, last index, count] for a target in a sorted array. If absent, return [−1, −1, 0].", condition: "Ascending order with duplicates. Empty input returns [−1, −1, 0].",
    example: "[1, 2, 2, 2, 5, 8], target = 2 → [1, 3, 3].", approach: "Run lower bound and upper bound independently. Their half-open interval contains exactly the target’s occurrences.",
    pattern: [["Find the beginning", "Lower bound finds the first value ≥ target."], ["Find the exclusive end", "Upper bound finds the first value > target. Reset the interval before this pass."], ["Convert the interval", "Equal bounds mean absence; otherwise last = end − 1 and count = end − first."]],
    complexity: "Two O(log n) searches remain O(log n). No scan over duplicates is necessary.", pitfalls: "Do not expand linearly after finding one match. Check absence before subtracting one from end. The upper boundary is exclusive, while the returned last index is inclusive.",
  },
  "search-rotated-array": {
    challenge: "Find the target’s index in an ascending array rotated at an unknown pivot, or return −1.", condition: "All values are distinct. Rotation may be zero; empty input returns −1.",
    example: "[4, 5, 6, 7, 0, 1, 2], target = 0 → 4.", approach: "At least one half is sorted. Check whether the target lies within that half’s endpoints before choosing where to continue.",
    pattern: [["Check equality first", "A matching middle can be returned immediately."], ["Identify a sorted half", "nums[left] ≤ nums[mid] means the left half is sorted; otherwise the right half is sorted."], ["Test endpoint membership", "Keep the sorted half only when its value interval contains target; otherwise keep the opposite half."]],
    complexity: "Distinct values reveal a sorted half every time, allowing logarithmic elimination.", pitfalls: "Normal binary search comparisons alone fail across the pivot. Use inclusive comparisons at the retained endpoint and strict comparisons at mid. Try a two-element rotation and a missing target.",
  },
  "search-rotated-array-duplicates": {
    challenge: "Find any matching target index in a rotated nondecreasing array, or return −1.", condition: "Duplicates allowed. Any matching index is valid; empty input returns −1.",
    example: "[1, 0, 1, 1, 1], target = 0 → 1.", approach: "Use rotated search, but remove both endpoints when left, middle, and right all have the same value after a failed equality check.",
    pattern: [["Return any match", "Check nums[mid] == target before removing duplicates."], ["Resolve ambiguity", "If nums[left] == nums[mid] == nums[right], both endpoints are safely removable."], ["Use sorted-half membership", "When endpoints distinguish the halves, use the usual rotated-array checks."]],
    complexity: "All-equal values may force removing only two candidates per iteration: O(n) worst case, with constant space.", pitfalls: "Do not promise O(log n) worst-case performance with duplicates. The ambiguity check must precede the sorted-half test. Removing endpoints is safe only after checking the middle is not target.",
  },
  "minimum-rotated-array": {
    challenge: "Return the index of the minimum value in a rotated ascending array.", condition: "Distinct values. Empty input returns −1. This lesson returns an index; use nums[index] for the value.",
    example: "[4, 5, 6, 7, 0, 1, 2] → index 4, value 0.", approach: "Compare nums[mid] with nums[right]. A middle larger than the right endpoint lies before the rotation break.",
    pattern: [["Compare to the right", "nums[mid] > nums[right] puts the minimum strictly after mid."], ["Retain a possible minimum", "Otherwise set right = mid because mid itself could be the smallest value."], ["Converge on one index", "Stop when left == right and return that index."]],
    complexity: "The remaining interval halves until a single candidate remains.", pitfalls: "Do not replace right = mid with mid − 1: that can discard the minimum. Duplicates require a separate equality rule and can degrade the bound to O(n). The input here is distinct.",
  },
  "find-peak-element": {
    challenge: "Return any index whose value is strictly larger than both neighbors. Outside the array, imagine values of −∞.", condition: "Adjacent values differ. Empty input returns −1. The array does not need to be sorted.",
    example: "[1, 2, 3, 1] → 2; [1, 3, 2, 4, 1] has peaks at 1 and 3.", approach: "Follow the slope between mid and mid + 1. An uphill direction guarantees that the retained half contains a peak.",
    pattern: [["Inspect the next neighbor", "left < right guarantees mid + 1 is in bounds."], ["Follow the uphill side", "If nums[mid] < nums[mid + 1], move left to mid + 1."], ["Keep a downhill middle", "Otherwise right = mid. At convergence the remaining index is a peak."]],
    complexity: "Only the search interval, rather than the array’s values, must shrink monotonically. Each iteration halves it.", pitfalls: "A peak need not be the global maximum. The strict-peak guarantee relies on unequal neighbors. Do not read mid + 1 inside a left ≤ right loop without an extra bounds guard.",
  },
  "single-element-sorted-array": {
    challenge: "Return the single value that appears once when every other value appears exactly twice.", condition: "Sorted, nonempty array of odd length; exactly one singleton and all other counts are two.",
    example: "[1, 1, 2, 3, 3, 4, 4] → 2.", approach: "Before the singleton, pairs start at even indices. Align mid to an even index so a pair comparison tells you which side changed parity.",
    pattern: [["Align to an even index", "Round mid down to the nearest even index."], ["Skip an intact pair", "If nums[mid] == nums[mid + 1], the singleton is after both values: left = mid + 2."], ["Keep a broken pair", "Otherwise right = mid. Return the value at convergence."]],
    complexity: "Each comparison eliminates about half the positions while preserving an odd-length candidate interval.", pitfalls: "The return value is the element rather than its index. Arbitrary duplicate counts invalidate pair parity. Try a singleton at either endpoint and a one-element array.",
  },
  "integer-square-root": {
    challenge: "Return floor(√x), the largest nonnegative integer whose square is at most x.", condition: "0 ≤ x ≤ 10⁹. This is an integer search with no floating-point approximation.",
    example: "x = 26 → 5, because 5² ≤ 26 < 6².", approach: "Search the last true value of mid² ≤ x. Compare mid ≤ x / mid using integer division to avoid overflowing a product.",
    pattern: [["Handle zero", "Return 0 before using division by mid."], ["Save feasible values", "If mid ≤ x // mid, save mid and search larger candidates."], ["Reject oversized squares", "Otherwise move right to mid − 1. Return the last saved value."]],
    complexity: "The integer range [1, x] halves per comparison; no list of candidates is allocated.", pitfalls: "Keep the saved answer when the boundaries cross. Avoid floating-point sqrt rounding and overflowing mid * mid. Perfect squares must be accepted with ≤.",
  },
  "nth-root": {
    challenge: "Return an integer r with rᵖ = x, or −1 if no exact nonnegative integer root exists.", condition: "0 ≤ x ≤ 10⁹ and 1 ≤ p ≤ 31. Return 0 for x = 0.",
    example: "x = 27, p = 3 → 3; x = 28, p = 3 → −1.", approach: "Binary search candidate roots. Build the power with a guard before every multiplication and stop as soon as it would exceed x.",
    pattern: [["Bound the candidate root", "For positive x, search integers from 1 to x."], ["Compare powers safely", "If power > x // mid, the next product exceeds x; stop multiplying."], ["Require exact equality", "Return mid only when its pth power equals x. A crossed range returns −1."]],
    complexity: "At most p guarded multiplications per comparison give O(p log x) time and O(1) space.", pitfalls: "This returns an exact root, unlike floor square root. Do not use a floating-point equality test. The positive-mid guard avoids division by zero and bounded multiplication prevents overflow.",
  },
  "search-2d-matrix": {
    challenge: "Determine whether the target exists in a rectangular matrix viewed in row-major order.", condition: "Each row is ascending and its first value is greater than the previous row’s last. Empty matrices return false. r × c fits a signed 32-bit index.",
    example: "[[1, 3, 5], [7, 9, 11]], target = 9 → true.", approach: "The matrix is globally sorted when read row by row. Search virtual indices without allocating a flattened copy.",
    pattern: [["Search a virtual array", "Use indices 0 through r*c − 1."], ["Map middle to a cell", "row = mid // c, column = mid % c."], ["Apply exact binary search", "Compare the cell with target and discard the impossible half."]],
    complexity: "There are r*c virtual positions; index-to-cell mapping costs O(1), with no flattened allocation.", pitfalls: "Rows and columns being individually sorted is insufficient for this algorithm. The row-boundary condition is required. Check matrix and its first row before indexing.",
  },
  "kth-smallest-sorted-matrix": {
    challenge: "Return the kth smallest matrix entry, counting duplicate values separately.", condition: "Nonempty rectangular matrix; rows AND columns sorted nondecreasingly. 1 ≤ k ≤ r*c; entries are signed 32-bit integers.",
    example: "[[1, 5, 9], [10, 11, 13], [12, 13, 15]], k = 8 → 13.", approach: "Search values rather than indices. For a candidate mid, count entries ≤ mid using a staircase from the bottom-left.",
    pattern: [["Bound the answer value", "The smallest and largest matrix corners bound the answer."], ["Count with a staircase", "A cell ≤ mid admits its entire column prefix; otherwise move up."], ["Find the first sufficient value", "If count ≥ k, keep mid with right = mid; otherwise left = mid + 1."]],
    complexity: "Each count moves up at most r times and right at most c times. W is max − min + 1; total O((r + c) log W).",
    pitfalls: "Do not flatten and binary search row-major indices: rows may overlap in value. Count duplicates separately and use count ≥ k rather than equality. The answer is a value, not a cell index.",
  },
  "koko-eating-bananas": {
    challenge: "Find the smallest integer speed allowing all piles to be eaten in at most h hours. Each hour is spent on one pile.", condition: "Nonempty positive integer piles, each ≤ 10⁹. Return −1 when h < number of piles. Sums of counts fit 64-bit integers.",
    example: "[3, 6, 7, 11], h = 8 → speed 4, needing 1 + 2 + 2 + 3 hours.", approach: "The hours needed never increase as speed rises. Search the first speed whose total ceiling-divided hours is within budget.",
    pattern: [["Choose safe bounds", "Speeds range from 1 to the largest pile."], ["Test feasibility", "Add ceil(pile / speed) for each pile. Unused fractions of an hour cannot transfer between piles."], ["Minimize a feasible speed", "Feasible means right = mid; too slow means left = mid + 1."]],
    complexity: "Each feasibility check scans n piles, with O(log M) checks where M is the largest pile.", pitfalls: "Use ceiling division per pile, not on the combined sum. Check h < n first. Accumulate hours in a 64-bit C++ integer and widen before pile + speed − 1.",
  },
  "ship-packages": {
    challenge: "Find the minimum capacity that ships all packages in their given order within D days.", condition: "Nonempty positive integer weights and D ≥ 1. Invalid D returns −1. Total weight fits a signed 64-bit integer.",
    example: "[1, 2, 3, 1, 1], D = 4 → capacity 3.", approach: "Greedily fill each day until the next package would exceed capacity. Larger capacities cannot need more days.",
    pattern: [["Bound the capacity", "The largest package is a lower bound; the total weight is a feasible upper bound."], ["Count greedy days", "Start a new day before adding a package that would exceed capacity."], ["Find the first feasible capacity", "If days used ≤ D, try a smaller capacity while retaining mid."]],
    complexity: "An O(n) feasibility scan repeats O(log S) times, where S is total weight; only counters are needed.", pitfalls: "Keep package order and never split a package. Start with one day for nonempty input. D is a maximum, so fewer days are also feasible. Use 64-bit capacity and running load.",
  },
  "split-array-largest-sum": {
    challenge: "Split an array into exactly k nonempty contiguous parts, minimizing the largest part sum.", condition: "Nonempty nonnegative integer array. 1 ≤ k ≤ n; invalid k returns −1. Total sum fits signed 64-bit.",
    example: "[7, 2, 5, 10, 8], k = 2 → 18, using [7, 2, 5] and [10, 8].", approach: "For a candidate maximum sum, greedy packing uses the fewest parts. At most k parts is enough: nonnegative parts can be subdivided to reach exactly k.",
    pattern: [["Search a maximum-part limit", "Start between max(nums) and sum(nums)."], ["Pack each part greedily", "Start another part only when adding the next value would exceed the limit."], ["Use the nonnegative guarantee", "If at most k parts suffice, the candidate is feasible for exactly k after subdivision."]],
    complexity: "Each candidate takes a linear pass. S is total sum; the all-zero case returns immediately.", pitfalls: "Negative values invalidate this greedy feasibility test and its bounds. Exactly k is not the same as at most k without the nonnegative guarantee and k ≤ n. Use 64-bit sums.",
  },
  "minimum-days-bouquets": {
    challenge: "Find the earliest day when m bouquets can be made, each using k adjacent flowers without reuse.", condition: "Nonempty positive bloom days ≤ 10⁹; m ≥ 1 and k ≥ 1. Return −1 if m*k exceeds the number of flowers.",
    example: "[1, 10, 3, 10, 2], m = 3, k = 1 → day 3.", approach: "A flower is available on day d when bloom[i] ≤ d. Count disjoint adjacent runs; availability can only improve on later days.",
    pattern: [["Reject impossible counts", "There must be at least m*k flowers."], ["Count adjacent groups", "An unavailable flower breaks a run. Every complete k-flower run creates a bouquet and resets the run."], ["Find the earliest feasible day", "Enough bouquets means keep mid and search earlier days."]],
    complexity: "Scan n flowers per day candidate; M is the largest bloom day, giving O(n log M) time.", pitfalls: "A count of available flowers alone ignores adjacency. Reset the run after making a bouquet to prevent reuse, and widen m*k before multiplying in C++.",
  },
  "aggressive-cows": {
    challenge: "Place k cows in distinct stalls to maximize the minimum distance between any two cows.", condition: "Distinct signed 32-bit stall coordinates; 2 ≤ k ≤ n. Invalid k returns −1. Input order is arbitrary.",
    example: "[1, 2, 8, 4, 9], k = 3 → gap 3, placing at 1, 4, 8.", approach: "Sort a copy of the coordinates. For a proposed gap, always place the next cow in the earliest stall far enough from the last.",
    pattern: [["Sort stall positions", "The coordinate span bounds the maximum possible gap."], ["Test a proposed minimum gap", "Earliest legal placement leaves the most room for every remaining cow."], ["Maximize a feasible gap", "Save feasible mid and search larger gaps; reject infeasible mid and everything above it."]],
    complexity: "Sorting costs O(n log n); each of O(log W) gap tests costs O(n). W is coordinate span + 1. Copying preserves input and takes O(n) space.", pitfalls: "This is a last-true search, so feasible moves left upward. Sorting changes adjacency; the displayed walkthrough uses sorted coordinates. Use 64-bit differences for extreme coordinates.",
  },
  "median-two-sorted-arrays": {
    challenge: "Return the median of two sorted arrays without merging them.", condition: "Both arrays ascending; at least one is nonempty. Values are signed 32-bit integers. Both empty raises an error.",
    example: "A = [1, 3], B = [2] → 2; A = [1, 2], B = [3, 4] → 2.5.", approach: "Search a cut in the shorter array. The combined left side must contain ceil((n + m)/2) entries, with all left values ≤ all right values.",
    pattern: [["Fix the combined left size", "Choose cut i in shorter A, then j = leftSize − i in B."], ["Check both cross-boundaries", "Aleft ≤ Bright and Bleft ≤ Aright make the partition valid. Missing endpoints use ±∞."], ["Read the middle values", "Odd length returns max(left); even length averages max(left) and min(right)."]],
    complexity: "Only min(n, m) + 1 cut positions are searched. No merged array is allocated; swapping the array roles uses at most one extra call.", pitfalls: "Constrain the cut so j is valid. Move left when Aleft > Bright; otherwise move right. Widen before averaging the two middle values. The diagram labels A as the shorter array after swapping.",
  },
  "kth-element-two-sorted-arrays": {
    challenge: "Return the kth smallest value in two sorted arrays, counting duplicates separately.", condition: "k is 1-based and 1 ≤ k ≤ n + m. One array may be empty. Invalid k raises an error.",
    example: "A = [2, 3, 6, 7, 9], B = [1, 4, 8, 10], k = 5 → 6.", approach: "Use the same valid-partition test as median, but put exactly k elements on the combined left. The largest left value is the kth element.",
    pattern: [["Bound the shorter-array cut", "Search i in [max(0, k − m), min(k, n)] so j = k − i fits B."], ["Restore cross ordering", "Check Aleft ≤ Bright and Bleft ≤ Aright; move the A cut in the failing direction."], ["Return the largest left value", "Exactly k entries are on the left, so max(Aleft, Bleft) has rank k."]],
    complexity: "The cut range has at most min(n, m) + 1 possibilities and uses constant extra space.", pitfalls: "Do not confuse a 1-based rank with a zero-based index. Handle i = 0, j = 0, and end cuts with sentinels. Duplicate values are separate ranked entries.",
  },
};
