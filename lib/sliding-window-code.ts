export type WindowSource = { python: string; cpp: string };
const cpp = (body: string) => `#include <algorithm>\n#include <array>\n#include <deque>\n#include <string>\n#include <unordered_map>\n#include <vector>\nusing namespace std;\n\n${body}`;
export const windowCode: Record<string, WindowSource> = {
  "maximum-sum-subarray-k": {
    python: `def max_window_sum(nums, k):
    # Contract: 1 <= k <= len(nums).
    total = sum(nums[:k])
    best = total  # Correct even when every value is negative.
    for right in range(k, len(nums)):
        total += nums[right] - nums[right - k]
        best = max(best, total)
    return best`,
    cpp: cpp(`long long max_window_sum(const vector<int>& nums, int k) {
    // Contract: 1 <= k <= nums.size().
    long long total = 0;
    for (int i = 0; i < k; ++i) total += nums[i];
    long long best = total;
    for (int r = k; r < (int)nums.size(); ++r) {
        total += (long long)nums[r] - nums[r - k];
        best = max(best, total);
    }
    return best;
}`),
  },
  "maximum-vowels": {
    python: `def max_vowels(s, k):
    vowels = set("aeiou")
    count = best = 0
    for right, char in enumerate(s):
        count += char in vowels
        if right >= k:
            count -= s[right - k] in vowels
        if right >= k - 1:
            best = max(best, count)
    return best`,
    cpp: cpp(`int max_vowels(const string& s, int k) {
    auto vowel = [](char c) {
        return string("aeiou").find(c) != string::npos;
    };
    int count = 0, best = 0;
    for (int r = 0; r < (int)s.size(); ++r) {
        count += vowel(s[r]);
        if (r >= k) count -= vowel(s[r - k]);
        if (r >= k - 1) best = max(best, count);
    }
    return best;
}`),
  },
  "first-negative-in-window": {
    python: `from collections import deque


def first_negatives(nums, k):
    negative = deque()  # Indices in increasing order.
    answer = []
    for right, value in enumerate(nums):
        left = right - k + 1
        while negative and negative[0] < left:
            negative.popleft()
        if value < 0:
            negative.append(right)
        if left >= 0:
            answer.append(nums[negative[0]] if negative else 0)
    return answer`,
    cpp: cpp(`vector<int> first_negatives(const vector<int>& nums, int k) {
    deque<int> negative;
    vector<int> answer;
    for (int r = 0; r < (int)nums.size(); ++r) {
        int left = r - k + 1;
        while (!negative.empty() && negative.front() < left)
            negative.pop_front();
        if (nums[r] < 0) negative.push_back(r);
        if (left >= 0)
            answer.push_back(negative.empty() ? 0 : nums[negative.front()]);
    }
    return answer;
}`),
  },
  "find-all-anagrams": {
    python: `def find_anagrams(s, pattern):
    # Lowercase English letters; pattern is nonempty.
    need, window = [0] * 26, [0] * 26
    for char in pattern:
        need[ord(char) - ord('a')] += 1
    answer, k = [], len(pattern)
    for right, char in enumerate(s):
        window[ord(char) - ord('a')] += 1
        if right >= k:
            window[ord(s[right - k]) - ord('a')] -= 1
        if right >= k - 1 and window == need:
            answer.append(right - k + 1)
    return answer`,
    cpp: cpp(`vector<int> find_anagrams(const string& s, const string& pattern) {
    array<int, 26> need{}, window{};
    for (char c : pattern) ++need[c - 'a'];
    int k = (int)pattern.size();
    vector<int> answer;
    for (int r = 0; r < (int)s.size(); ++r) {
        ++window[s[r] - 'a'];
        if (r >= k) --window[s[r - k] - 'a'];
        if (r >= k - 1 && window == need) answer.push_back(r - k + 1);
    }
    return answer;
}`),
  },
  "permutation-in-string": {
    python: `def contains_permutation(s, pattern):
    # Lowercase English letters; pattern is nonempty.
    need, window = [0] * 26, [0] * 26
    for char in pattern:
        need[ord(char) - ord('a')] += 1
    k = len(pattern)
    for right, char in enumerate(s):
        window[ord(char) - ord('a')] += 1
        if right >= k:
            window[ord(s[right - k]) - ord('a')] -= 1
        if right >= k - 1 and window == need:
            return True
    return False`,
    cpp: cpp(`bool contains_permutation(const string& s, const string& pattern) {
    array<int, 26> need{}, window{};
    for (char c : pattern) ++need[c - 'a'];
    int k = (int)pattern.size();
    for (int r = 0; r < (int)s.size(); ++r) {
        ++window[s[r] - 'a'];
        if (r >= k) --window[s[r - k] - 'a'];
        if (r >= k - 1 && window == need) return true;
    }
    return false;
}`),
  },
  "longest-substring-without-repeats": {
    python: `def longest_unique(s):
    count = {}
    left = best = 0
    for right, char in enumerate(s):
        count[char] = count.get(char, 0) + 1
        while count[char] > 1:
            old = s[left]
            count[old] -= 1
            if count[old] == 0:
                del count[old]
            left += 1
        best = max(best, right - left + 1)
    return best`,
    cpp: cpp(`int longest_unique(const string& s) {
    array<int, 256> count{};  // ASCII input.
    int left = 0, best = 0;
    for (int r = 0; r < (int)s.size(); ++r) {
        unsigned char c = s[r];
        ++count[c];
        while (count[c] > 1) --count[(unsigned char)s[left++]];
        best = max(best, r - left + 1);
    }
    return best;
}`),
  },
  "longest-substring-k-distinct": {
    python: `def longest_k_distinct(s, k):
    count = {}
    left = best = 0
    for right, char in enumerate(s):
        count[char] = count.get(char, 0) + 1
        while len(count) > k:
            old = s[left]
            count[old] -= 1
            if count[old] == 0:
                del count[old]
            left += 1
        best = max(best, right - left + 1)
    return best`,
    cpp: cpp(`int longest_k_distinct(const string& s, int k) {
    array<int, 256> count{};
    int left = 0, best = 0, distinct = 0;
    for (int r = 0; r < (int)s.size(); ++r) {
        if (count[(unsigned char)s[r]]++ == 0) ++distinct;
        while (distinct > k)
            if (--count[(unsigned char)s[left++]] == 0) --distinct;
        best = max(best, r - left + 1);
    }
    return best;
}`),
  },
  "longest-repeating-character-replacement": {
    python: `def character_replacement(s, k):
    # Uppercase English letters. Recompute the exact max count.
    count = [0] * 26
    left = best = 0
    for right, char in enumerate(s):
        count[ord(char) - ord('A')] += 1
        while right - left + 1 - max(count) > k:
            count[ord(s[left]) - ord('A')] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
    cpp: cpp(`int character_replacement(const string& s, int k) {
    array<int, 26> count{};
    int left = 0, best = 0;
    for (int r = 0; r < (int)s.size(); ++r) {
        ++count[s[r] - 'A'];
        while (r - left + 1 - *max_element(count.begin(), count.end()) > k)
            --count[s[left++] - 'A'];
        best = max(best, r - left + 1);
    }
    return best;
}`),
  },
  "max-consecutive-ones-iii": {
    python: `def longest_ones(nums, k):
    left = zeros = best = 0
    for right, value in enumerate(nums):
        zeros += value == 0
        while zeros > k:
            zeros -= nums[left] == 0
            left += 1
        best = max(best, right - left + 1)
    return best`,
    cpp: cpp(`int longest_ones(const vector<int>& nums, int k) {
    int left = 0, zeros = 0, best = 0;
    for (int r = 0; r < (int)nums.size(); ++r) {
        zeros += nums[r] == 0;
        while (zeros > k) zeros -= nums[left++] == 0;
        best = max(best, r - left + 1);
    }
    return best;
}`),
  },
  "minimum-size-subarray-sum": {
    python: `def min_subarray_length(nums, target):
    # Positive integers; target > 0.
    left = total = 0
    best = len(nums) + 1
    for right, value in enumerate(nums):
        total += value
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == len(nums) + 1 else best`,
    cpp: cpp(`int min_subarray_length(const vector<int>& nums, long long target) {
    int left = 0, best = (int)nums.size() + 1;
    long long total = 0;
    for (int r = 0; r < (int)nums.size(); ++r) {
        total += nums[r];
        while (total >= target) {
            best = min(best, r - left + 1);
            total -= nums[left++];
        }
    }
    return best == (int)nums.size() + 1 ? 0 : best;
}`),
  },
  "minimum-window-substring": {
    python: `from collections import Counter


def min_window(s, pattern):
    if not pattern:
        return ""
    need, count = Counter(pattern), Counter()
    left = matched = start = 0
    best = len(s) + 1
    for right, char in enumerate(s):
        count[char] += 1
        if count[char] <= need[char]:
            matched += 1
        while matched == len(pattern):
            if right - left + 1 < best:
                start, best = left, right - left + 1
            old = s[left]
            if count[old] <= need[old]:
                matched -= 1
            count[old] -= 1
            left += 1
    return "" if best == len(s) + 1 else s[start:start + best]`,
    cpp: cpp(`string min_window(const string& s, const string& pattern) {
    if (pattern.empty()) return "";
    array<int, 256> need{}, count{};
    for (unsigned char c : pattern) ++need[c];
    int left = 0, matched = 0, start = 0, best = (int)s.size() + 1;
    for (int r = 0; r < (int)s.size(); ++r) {
        unsigned char c = s[r];
        if (++count[c] <= need[c]) ++matched;
        while (matched == (int)pattern.size()) {
            if (r - left + 1 < best) { start = left; best = r - left + 1; }
            unsigned char old = s[left++];
            if (count[old] <= need[old]) --matched;
            --count[old];
        }
    }
    return best == (int)s.size() + 1 ? "" : s.substr(start, best);
}`),
  },
  "subarrays-k-distinct": {
    python: `def exactly_k_distinct(nums, k):
    def at_most(budget):
        if budget < 0:
            return 0
        count = {}
        left = total = 0
        for right, value in enumerate(nums):
            count[value] = count.get(value, 0) + 1
            while len(count) > budget:
                old = nums[left]
                count[old] -= 1
                if count[old] == 0:
                    del count[old]
                left += 1
            total += right - left + 1
        return total
    return at_most(k) - at_most(k - 1)`,
    cpp: cpp(`long long exactly_k_distinct(const vector<int>& nums, int k) {
    auto at_most = [&](int budget) -> long long {
        if (budget < 0) return 0;
        unordered_map<int, int> count;
        int left = 0;
        long long total = 0;
        for (int r = 0; r < (int)nums.size(); ++r) {
            ++count[nums[r]];
            while ((int)count.size() > budget) {
                int old = nums[left++];
                if (--count[old] == 0) count.erase(old);
            }
            total += r - left + 1;
        }
        return total;
    };
    return at_most(k) - at_most(k - 1);
}`),
  },
  "binary-subarrays-with-sum": {
    python: `def binary_subarrays_sum(nums, goal):
    def at_most(budget):
        if budget < 0:
            return 0
        left = total = window_sum = 0
        for right, value in enumerate(nums):
            window_sum += value
            while window_sum > budget:
                window_sum -= nums[left]
                left += 1
            total += right - left + 1
        return total
    return at_most(goal) - at_most(goal - 1)`,
    cpp: cpp(`long long binary_subarrays_sum(const vector<int>& nums, int goal) {
    auto at_most = [&](int budget) -> long long {
        if (budget < 0) return 0;
        int left = 0, sum = 0;
        long long total = 0;
        for (int r = 0; r < (int)nums.size(); ++r) {
            sum += nums[r];
            while (sum > budget) sum -= nums[left++];
            total += r - left + 1;
        }
        return total;
    };
    return at_most(goal) - at_most(goal - 1);
}`),
  },
  "subarray-product-less-than-k": {
    python: `def product_below_k(nums, k):
    # Positive integers only.
    if k <= 1:
        return 0
    left = total = 0
    product = 1
    for right, value in enumerate(nums):
        product *= value
        while product >= k:
            product //= nums[left]
            left += 1
        total += right - left + 1
    return total`,
    cpp: cpp(`long long product_below_k(const vector<int>& nums, long long k) {
    // nums[i] <= 10^6, k <= 10^9: intermediate product fits.
    if (k <= 1) return 0;
    int left = 0;
    long long product = 1, total = 0;
    for (int r = 0; r < (int)nums.size(); ++r) {
        product *= nums[r];
        while (product >= k) product /= nums[left++];
        total += r - left + 1;
    }
    return total;
}`),
  },
  "sliding-window-maximum": {
    python: `from collections import deque


def window_maxima(nums, k):
    candidates = deque()  # Indices; values decrease front to back.
    answer = []
    for right, value in enumerate(nums):
        left = right - k + 1
        while candidates and candidates[0] < left:
            candidates.popleft()
        while candidates and nums[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(right)
        if left >= 0:
            answer.append(nums[candidates[0]])
    return answer`,
    cpp: cpp(`vector<int> window_maxima(const vector<int>& nums, int k) {
    deque<int> candidates;
    vector<int> answer;
    for (int r = 0; r < (int)nums.size(); ++r) {
        int left = r - k + 1;
        while (!candidates.empty() && candidates.front() < left)
            candidates.pop_front();
        while (!candidates.empty() && nums[candidates.back()] <= nums[r])
            candidates.pop_back();
        candidates.push_back(r);
        if (left >= 0) answer.push_back(nums[candidates.front()]);
    }
    return answer;
}`),
  },
};
