export const searchValues = [-1, 0, 3, 5, 9, 12, 15, 18];

export type SearchStep = {
  left: number;
  right: number;
  mid: number | null;
  title: string;
  explanation: string;
  action: string;
  found: boolean;
};

export function traceBinarySearch(values: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];
  let left = 0;
  let right = values.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const value = values[mid];
    const found = value === target;
    const goRight = value < target;
    steps.push({
      left, right, mid, found,
      title: found ? `Found ${target} at index ${mid}.` : `${value} ${goRight ? "<" : ">"} ${target}. Keep the ${goRight ? "right" : "left"} half.`,
      explanation: found
        ? "The middle value matches the target. Return its index, not the value."
        : goRight
          ? `The array is sorted, so everything at or before index ${mid} is too small. Move left past the middle.`
          : `The array is sorted, so everything at or after index ${mid} is too large. Move right before the middle.`,
      action: found ? `return ${mid}` : goRight ? `left = mid + 1 = ${mid + 1}` : `right = mid - 1 = ${mid - 1}`,
    });
    if (found) return steps;
    if (goRight) left = mid + 1;
    else right = mid - 1;
  }

  steps.push({ left, right, mid: null, found: false,
    title: `${target} isn’t in the array.`,
    explanation: "Left has passed right. No candidates remain, so return -1.",
    action: "return -1",
  });
  return steps;
}

export const binarySearchCode = {
  python: `def binary_search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = left + (right - left) // 2

        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,
  cpp: `#include <vector>

int binary_search(const std::vector<int>& nums, int target) {
    int left = 0;
    int right = static_cast<int>(nums.size()) - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}`,
};
