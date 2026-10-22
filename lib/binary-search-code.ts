export const searchCode: Record<string, { python: string; cpp: string }> = {
  "binary-search": {
    python: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    cpp: `#include <vector>
int binary_search(const std::vector<int>& nums, int target) {
    int left = 0, right = static_cast<int>(nums.size()) - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
  },
};
for (const [slug, strict] of [["lower-bound", false], ["upper-bound", true]] as const) {
  const name = strict ? "upper_bound" : "lower_bound", compare = strict ? "<=" : "<";
  searchCode[slug] = {
    python: `def ${name}(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] ${compare} target:
            left = mid + 1
        else:
            right = mid - 1
    return left  # len(nums) if no value qualifies.`,
    cpp: `#include <vector>
int ${name}(const std::vector<int>& nums, int target) {
    int left = 0, right = static_cast<int>(nums.size()) - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] ${compare} target) left = mid + 1;
        else right = mid - 1;
    }
    return left;  // nums.size() if no value qualifies.
}`,
  };
}
searchCode["first-last-occurrence"] = {
  python: `def equal_range(nums, target):
    def boundary(strict):
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = left + (right - left) // 2
            if nums[mid] < target or (strict and nums[mid] == target):
                left = mid + 1
            else:
                right = mid - 1
        return left

    first, end = boundary(False), boundary(True)
    if first == end:
        return [-1, -1, 0]
    return [first, end - 1, end - first]  # First, last, count.`,
  cpp: `#include <array>
#include <vector>
std::array<int, 3> equal_range(const std::vector<int>& nums, int target) {
    auto boundary = [&](bool strict) {
        int left = 0, right = static_cast<int>(nums.size()) - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target || (strict && nums[mid] == target))
                left = mid + 1;
            else right = mid - 1;
        }
        return left;
    };
    int first = boundary(false), end = boundary(true);
    if (first == end) return {-1, -1, 0};
    return {first, end - 1, end - first};
}`,
};
for (const [slug, duplicates] of [["search-rotated-array", false], ["search-rotated-array-duplicates", true]] as const) {
  searchCode[slug] = {
    python: `def rotated_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
${duplicates ? `        if nums[left] == nums[mid] == nums[right]:
            left += 1
            right -= 1
            continue
` : ""}        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1`,
    cpp: `#include <vector>
int rotated_search(const std::vector<int>& nums, int target) {
    int left = 0, right = static_cast<int>(nums.size()) - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
${duplicates ? `        if (nums[left] == nums[mid] && nums[mid] == nums[right]) {
            ++left; --right;
            continue;
        }
` : ""}        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) right = mid - 1;
            else left = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[right]) left = mid + 1;
            else right = mid - 1;
        }
    }
    return -1;
}`,
  };
}
searchCode["minimum-rotated-array"] = {
  python: `def rotated_minimum(nums):
    if not nums:
        return -1  # No minimum index.
    left, right = 0, len(nums) - 1
    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] > nums[right]:
            left = mid + 1
        else:
            right = mid
    return left  # Return the minimum's INDEX.`,
  cpp: `#include <vector>
int rotated_minimum(const std::vector<int>& nums) {
    if (nums.empty()) return -1;
    int left = 0, right = static_cast<int>(nums.size()) - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > nums[right]) left = mid + 1;
        else right = mid;
    }
    return left;  // Minimum index; values must be distinct.
}`,
};
searchCode["find-peak-element"] = {
  python: `def find_peak(nums):
    if not nums:
        return -1
    left, right = 0, len(nums) - 1
    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] < nums[mid + 1]:
            left = mid + 1
        else:
            right = mid
    return left`,
  cpp: `#include <vector>
int find_peak(const std::vector<int>& nums) {
    if (nums.empty()) return -1;
    int left = 0, right = static_cast<int>(nums.size()) - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < nums[mid + 1]) left = mid + 1;
        else right = mid;
    }
    return left;
}`,
};
searchCode["single-element-sorted-array"] = {
  python: `def single_element(nums):
    # Sorted, nonempty; one singleton, all others occur exactly twice.
    left, right = 0, len(nums) - 1
    while left < right:
        mid = left + (right - left) // 2
        mid -= mid % 2  # First index of a candidate pair.
        if nums[mid] == nums[mid + 1]:
            left = mid + 2
        else:
            right = mid
    return nums[left]`,
  cpp: `#include <vector>
int single_element(const std::vector<int>& nums) {
    int left = 0, right = static_cast<int>(nums.size()) - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        mid -= mid % 2;
        if (nums[mid] == nums[mid + 1]) left = mid + 2;
        else right = mid;
    }
    return nums[left];
}`,
};
searchCode["integer-square-root"] = {
  python: `def integer_sqrt(x):
    # 0 <= x <= 10**9
    if x == 0:
        return 0
    left, right, answer = 1, x, 0
    while left <= right:
        mid = left + (right - left) // 2
        if mid <= x // mid:
            answer = mid
            left = mid + 1
        else:
            right = mid - 1
    return answer`,
  cpp: `long long integer_sqrt(long long x) {
    if (x == 0) return 0;
    long long left = 1, right = x, answer = 0;
    while (left <= right) {
        long long mid = left + (right - left) / 2;
        if (mid <= x / mid) {
            answer = mid;
            left = mid + 1;
        } else right = mid - 1;
    }
    return answer;
}`,
};
searchCode["nth-root"] = {
  python: `def nth_root(x, p):
    # 0 <= x <= 10**9; 1 <= p <= 31.
    if x == 0:
        return 0
    left, right = 1, x
    while left <= right:
        mid = left + (right - left) // 2
        power = 1
        for _ in range(p):
            if power > x // mid:
                power = x + 1
                break
            power *= mid
        if power == x:
            return mid
        if power < x:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
  cpp: `long long nth_root(long long x, int p) {
    if (x == 0) return 0;
    long long left = 1, right = x;
    while (left <= right) {
        long long mid = left + (right - left) / 2, power = 1;
        for (int i = 0; i < p; ++i) {
            if (power > x / mid) { power = x + 1; break; }
            power *= mid;
        }
        if (power == x) return mid;
        if (power < x) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
};
searchCode["search-2d-matrix"] = {
  python: `def search_matrix(matrix, target):
    if not matrix or not matrix[0]:
        return False
    rows, cols = len(matrix), len(matrix[0])
    left, right = 0, rows * cols - 1
    while left <= right:
        mid = left + (right - left) // 2
        value = matrix[mid // cols][mid % cols]
        if value == target:
            return True
        if value < target:
            left = mid + 1
        else:
            right = mid - 1
    return False`,
  cpp: `#include <vector>
bool search_matrix(const std::vector<std::vector<int>>& matrix, int target) {
    if (matrix.empty() || matrix[0].empty()) return false;
    int cols = static_cast<int>(matrix[0].size());
    int left = 0, right = static_cast<int>(matrix.size()) * cols - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        int value = matrix[mid / cols][mid % cols];
        if (value == target) return true;
        if (value < target) left = mid + 1;
        else right = mid - 1;
    }
    return false;
}`,
};
searchCode["kth-smallest-sorted-matrix"] = {
  python: `def kth_smallest_matrix(matrix, k):
    # Nonempty rectangular matrix, rows AND columns sorted; 1 <= k <= r*c.
    rows, cols = len(matrix), len(matrix[0])
    left, right = matrix[0][0], matrix[-1][-1]
    while left < right:
        mid = left + (right - left) // 2
        row, col, count = rows - 1, 0, 0
        while row >= 0 and col < cols:
            if matrix[row][col] <= mid:
                count += row + 1
                col += 1
            else:
                row -= 1
        if count < k:
            left = mid + 1
        else:
            right = mid
    return left`,
  cpp: `#include <vector>
long long kth_smallest_matrix(const std::vector<std::vector<int>>& matrix, int k) {
    int rows = static_cast<int>(matrix.size()), cols = static_cast<int>(matrix[0].size());
    long long left = matrix[0][0], right = matrix.back().back();
    while (left < right) {
        long long mid = left + (right - left) / 2, count = 0;
        int row = rows - 1, col = 0;
        while (row >= 0 && col < cols) {
            if (matrix[row][col] <= mid) { count += row + 1; ++col; }
            else --row;
        }
        if (count < k) left = mid + 1;
        else right = mid;
    }
    return left;
}`,
};
searchCode["koko-eating-bananas"] = {
  python: `def minimum_speed(piles, h):
    # Nonempty positive piles; h >= 0. One pile per hour.
    if h < len(piles):
        return -1
    left, right = 1, max(piles)
    while left < right:
        mid = left + (right - left) // 2
        hours = sum((pile + mid - 1) // mid for pile in piles)
        if hours <= h:
            right = mid
        else:
            left = mid + 1
    return left`,
  cpp: `#include <algorithm>
#include <vector>
int minimum_speed(const std::vector<int>& piles, long long h) {
    if (h < static_cast<long long>(piles.size())) return -1;
    int left = 1, right = *std::max_element(piles.begin(), piles.end());
    while (left < right) {
        int mid = left + (right - left) / 2;
        long long hours = 0;
        for (int pile : piles) hours += (static_cast<long long>(pile) + mid - 1) / mid;
        if (hours <= h) right = mid;
        else left = mid + 1;
    }
    return left;
}`,
};
for (const [slug, name, budget] of [["ship-packages", "ship_capacity", "days"], ["split-array-largest-sum", "split_largest_sum", "k"]] as const) {
  const split = slug === "split-array-largest-sum";
  searchCode[slug] = {
    python: `def ${name}(nums, ${budget}):
    # ${split ? "Nonempty nonnegative nums; exactly k nonempty parts." : "Nonempty positive weights, kept in input order."}
    if ${budget} < 1${split ? ` or ${budget} > len(nums)` : ""}:
        return -1
    left, right = max(nums), sum(nums)
    while left < right:
        mid = left + (right - left) // 2
        parts, load = 1, 0
        for value in nums:
            if load + value > mid:
                parts += 1
                load = 0
            load += value
        if parts <= ${budget}:
            right = mid
        else:
            left = mid + 1
    return left`,
    cpp: `#include <algorithm>
#include <numeric>
#include <vector>
long long ${name}(const std::vector<int>& nums, int ${budget}) {
    if (${budget} < 1${split ? ` || ${budget} > static_cast<int>(nums.size())` : ""}) return -1;
    long long left = *std::max_element(nums.begin(), nums.end());
    long long right = std::accumulate(nums.begin(), nums.end(), 0LL);
    while (left < right) {
        long long mid = left + (right - left) / 2, load = 0;
        int parts = 1;
        for (int value : nums) {
            if (load + value > mid) { ++parts; load = 0; }
            load += value;
        }
        if (parts <= ${budget}) right = mid;
        else left = mid + 1;
    }
    return left;
}`,
  };
}
searchCode["minimum-days-bouquets"] = {
  python: `def minimum_days(bloom, m, k):
    # Nonempty positive bloom days; m >= 1, k >= 1.
    if m * k > len(bloom):
        return -1
    left, right = min(bloom), max(bloom)
    while left < right:
        mid = left + (right - left) // 2
        bouquets, run = 0, 0
        for day in bloom:
            if day > mid:
                run = 0
            else:
                run += 1
                if run == k:
                    bouquets += 1
                    run = 0
        if bouquets >= m:
            right = mid
        else:
            left = mid + 1
    return left`,
  cpp: `#include <algorithm>
#include <vector>
int minimum_days(const std::vector<int>& bloom, int m, int k) {
    if (1LL * m * k > static_cast<long long>(bloom.size())) return -1;
    int left = *std::min_element(bloom.begin(), bloom.end());
    int right = *std::max_element(bloom.begin(), bloom.end());
    while (left < right) {
        int mid = left + (right - left) / 2, bouquets = 0, run = 0;
        for (int day : bloom) {
            if (day > mid) run = 0;
            else if (++run == k) { ++bouquets; run = 0; }
        }
        if (bouquets >= m) right = mid;
        else left = mid + 1;
    }
    return left;
}`,
};
searchCode["aggressive-cows"] = {
  python: `def maximum_distance(stalls, k):
    # Distinct stall coordinates; 2 <= k <= len(stalls).
    if k < 2 or k > len(stalls):
        return -1
    stalls = sorted(stalls)  # Preserve the caller's input.
    left, right, answer = 0, stalls[-1] - stalls[0], 0
    while left <= right:
        mid = left + (right - left) // 2
        placed, last = 1, stalls[0]
        for position in stalls[1:]:
            if position - last >= mid:
                placed += 1
                last = position
        if placed >= k:
            answer = mid
            left = mid + 1
        else:
            right = mid - 1
    return answer`,
  cpp: `#include <algorithm>
#include <vector>
long long maximum_distance(const std::vector<int>& input, int k) {
    if (k < 2 || k > static_cast<int>(input.size())) return -1;
    auto stalls = input;  // Copy before sorting.
    std::sort(stalls.begin(), stalls.end());
    long long left = 0, right = static_cast<long long>(stalls.back()) - stalls.front(), answer = 0;
    while (left <= right) {
        long long mid = left + (right - left) / 2, last = stalls[0];
        int placed = 1;
        for (int i = 1; i < static_cast<int>(stalls.size()); ++i) {
            if (stalls[i] - last >= mid) { ++placed; last = stalls[i]; }
        }
        if (placed >= k) { answer = mid; left = mid + 1; }
        else right = mid - 1;
    }
    return answer;
}`,
};
for (const [slug, median] of [["median-two-sorted-arrays", true], ["kth-element-two-sorted-arrays", false]] as const) {
  const name = median ? "median_two_sorted" : "kth_two_sorted";
  searchCode[slug] = {
    python: `def ${name}(a, b${median ? "" : ", k"}):
    # Both arrays sorted; ${median ? "combined input must be nonempty." : "k is 1-based, 1 <= k <= len(a) + len(b)."}
    if len(a) > len(b):
        return ${name}(b, a${median ? "" : ", k"})
    n, m = len(a), len(b)
${median ? `    if n + m == 0:
        raise ValueError("Both arrays are empty")
    k = (n + m + 1) // 2` : `    if not 1 <= k <= n + m:
        raise ValueError("k out of range")`}
    left, right = max(0, k - m), min(k, n)
    while left <= right:
        i = left + (right - left) // 2
        j = k - i
        al = a[i - 1] if i else float("-inf")
        ar = a[i] if i < n else float("inf")
        bl = b[j - 1] if j else float("-inf")
        br = b[j] if j < m else float("inf")
        if al <= br and bl <= ar:
${median ? `            if (n + m) % 2:
                return max(al, bl)
            return (max(al, bl) + min(ar, br)) / 2` : `            return max(al, bl)`}
        if al > br:
            right = i - 1
        else:
            left = i + 1
    raise ValueError("Inputs must be sorted")`,
    cpp: `#include <algorithm>
#include <climits>
#include <stdexcept>
#include <vector>
${median ? "double" : "int"} ${name}(const std::vector<int>& a, const std::vector<int>& b${median ? "" : ", int k"}) {
    if (a.size() > b.size()) return ${name}(b, a${median ? "" : ", k"});
    int n = static_cast<int>(a.size()), m = static_cast<int>(b.size());
${median ? `    if (n + m == 0) throw std::invalid_argument("Both arrays are empty");
    int k = (n + m + 1) / 2;` : `    if (k < 1 || k > n + m) throw std::invalid_argument("k out of range");`}
    int left = std::max(0, k - m), right = std::min(k, n);
    while (left <= right) {
        int i = left + (right - left) / 2, j = k - i;
        long long al = i ? a[i - 1] : LLONG_MIN;
        long long ar = i < n ? a[i] : LLONG_MAX;
        long long bl = j ? b[j - 1] : LLONG_MIN;
        long long br = j < m ? b[j] : LLONG_MAX;
        if (al <= br && bl <= ar) {
${median ? `            if ((n + m) % 2) return std::max(al, bl);
            return (static_cast<double>(std::max(al, bl)) + std::min(ar, br)) / 2.0;` : `            return static_cast<int>(std::max(al, bl));`}
        }
        if (al > br) right = i - 1;
        else left = i + 1;
    }
    throw std::invalid_argument("Inputs must be sorted");
}`,
  };
}
