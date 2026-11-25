import type { Difficulty } from "./data";

export const miscCategories = ["Rolling hash"] as const;
export type MiscCategory = typeof miscCategories[number];
export type MiscAlgorithm = {
  slug: string; title: string; shortTitle: string; category: MiscCategory;
  difficulty: Difficulty; description: string; time: string; space: string;
};

// Metadata only: lesson text, code, and trace generation stay on the server.
export const miscAlgorithms: MiscAlgorithm[] = [
  { slug: "smallest-unique-subarray", title: "Smallest Unique Subarray", shortTitle: "Smallest unique subarray", category: "Rolling hash", difficulty: "Hard", description: "Binary search the length; hash every window of that length in O(1) per slide and look for a count of one.", time: "O(n log n)", space: "O(n)" },
];
