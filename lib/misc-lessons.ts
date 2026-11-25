import type { MiscCategory } from "./misc-catalog";

export type MiscNotes = {
  challenge: string; condition: string; example: string; approach: string;
  pattern: [string, string][]; complexity: string; pitfalls: string;
};

export type ConceptPrimer = {
  title: string; summary: string;
  ideas: [string, string][];
  example: { label: string; lines: string[] };
};

// A short concept explainer shown above every lesson in a category.
export const miscPrimers: Record<MiscCategory, ConceptPrimer> = {
  "Rolling hash": {
    title: "Rolling hash, the idea",
    summary: "Comparing two windows element by element costs O(length). A rolling hash turns each window into one number, and updates that number in O(1) when the window slides by one position.",
    ideas: [
      ["Read the window as a number", "Treat the window as digits in base B: hash(a₀ … a_last) = a₀·B^(L−1) + a₁·B^(L−2) + … + a_last, taken mod a large prime M."],
      ["Slide in O(1)", "Remove the outgoing value’s contribution a₀·B^(L−1), multiply by B to shift every digit left, then add the incoming value."],
      ["Equal windows, equal hashes", "Identical windows always hash to the same value, so a hash map of hash → count groups identical windows without comparing them."],
      ["Guard against collisions", "Different windows can share a hash. Use a base larger than every value, pick it at random, and combine two moduli so a false match is vanishingly unlikely."],
    ],
    example: {
      label: "With base 10 and single-digit values, the hash is the window read as a decimal number",
      lines: [
        "nums = [1, 2, 1, 2],  L = 3,  B^(L−1) = 100",
        "hash([1, 2, 1]) = 1·100 + 2·10 + 1      = 121",
        "slide: (121 − 1·100) · 10 + 2           = 212",
        "hash([2, 1, 2])                         = 212  ✓",
      ],
    },
  },
};

export const miscNotes: Record<string, MiscNotes> = {
  "smallest-unique-subarray": {
    challenge: "Return the minimum length of a subarray that is not identical to any other subarray of nums. Two subarrays are identical when they have the same length and the same element at every position.",
    condition: "1 ≤ nums.length ≤ 10⁵ and 1 ≤ nums[i] ≤ 10⁵. Occurrences may overlap. Indices are zero-based.",
    example: "[3, 3, 3] → 3; [2, 1, 2, 3, 3] → 1, from [1]; [1, 1, 2, 2, 1] → 2, from [1, 1].",
    approach: "Uniqueness is monotone in length: extend a unique window by one element and any copy of the longer window would contain a copy of the shorter one. So binary search the length, and for each candidate count every window with a double rolling hash.",
    pattern: [
      ["Prove the answer is monotone", "If some window of length L appears once, extending it by one neighbour still appears once. The whole array (L = n) is always unique."],
      ["Binary search the length", "lo = 1, hi = n. If a unique window of length mid exists, keep mid as hi; otherwise move lo past it."],
      ["Roll a hash across each length", "Drop the outgoing value times B^(mid−1), multiply by B, add the incoming value. Count each window’s hash pair."],
      ["Look for a count of one", "Any hash seen exactly once is a unique window, so this length works."],
    ],
    complexity: "Each length check is one O(n) pass with a hash map of up to n − mid + 1 keys. Binary search makes O(log n) checks.",
    pitfalls: "A single 32-bit-sized modulus collides often across 10⁵ windows, and a collision can hide a unique window and inflate the answer; combine two moduli and random bases. Keep the subtraction non-negative in C++, and pack both hashes into one 64-bit key. Try all-equal values, an answer of 1, and periodic input such as [1, 2, 1, 2, 1, 2].",
  },
};
