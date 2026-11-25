export type MiscSource = { python: string; cpp: string };

export const miscCode: Record<string, MiscSource> = {
  "smallest-unique-subarray": {
    python: `import random
from collections import Counter

MOD1, MOD2 = 1_000_000_007, 998_244_353

def has_unique_window(nums, length, base1, base2):
    # Weight of the value about to leave the window.
    top1 = pow(base1, length - 1, MOD1)
    top2 = pow(base2, length - 1, MOD2)
    h1 = h2 = 0
    counts = Counter()
    for right, x in enumerate(nums):
        if right >= length:
            out = nums[right - length]
            h1 = (h1 - out * top1) % MOD1
            h2 = (h2 - out * top2) % MOD2
        h1 = (h1 * base1 + x) % MOD1  # shift left, append x
        h2 = (h2 * base2 + x) % MOD2
        if right >= length - 1:
            counts[(h1, h2)] += 1
    return any(count == 1 for count in counts.values())

def smallest_unique_subarray(nums):
    # Random bases larger than any value defeat crafted collisions.
    base1 = random.randrange(100_001, MOD1 - 1)
    base2 = random.randrange(100_001, MOD2 - 1)
    lo, hi = 1, len(nums)  # The whole array is always unique.
    while lo < hi:
        mid = (lo + hi) // 2
        if has_unique_window(nums, mid, base1, base2):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
    cpp: `#include <chrono>
#include <random>
#include <unordered_map>
#include <vector>
using namespace std;
using u64 = unsigned long long;

const u64 MOD1 = 1'000'000'007ULL, MOD2 = 998'244'353ULL;

u64 power(u64 base, int exp, u64 mod) {
    u64 result = 1;
    for (base %= mod; exp > 0; exp >>= 1) {
        if (exp & 1) result = result * base % mod;
        base = base * base % mod;
    }
    return result;
}

bool has_unique_window(const vector<int>& nums, int length, u64 base1, u64 base2) {
    u64 top1 = power(base1, length - 1, MOD1);
    u64 top2 = power(base2, length - 1, MOD2);
    u64 h1 = 0, h2 = 0;
    unordered_map<u64, int> counts;
    counts.reserve(nums.size() * 2);
    for (int r = 0; r < (int)nums.size(); ++r) {
        if (r >= length) {
            u64 out = nums[r - length];
            // Add MOD before subtracting to stay non-negative.
            h1 = (h1 + MOD1 - out * top1 % MOD1) % MOD1;
            h2 = (h2 + MOD2 - out * top2 % MOD2) % MOD2;
        }
        h1 = (h1 * base1 + nums[r]) % MOD1;
        h2 = (h2 * base2 + nums[r]) % MOD2;
        if (r >= length - 1) ++counts[h1 * MOD2 + h2];  // fits in 64 bits
    }
    for (const auto& [key, count] : counts)
        if (count == 1) return true;
    return false;
}

int smallest_unique_subarray(const vector<int>& nums) {
    mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
    u64 base1 = 100'001 + rng() % (MOD1 - 100'002);
    u64 base2 = 100'001 + rng() % (MOD2 - 100'002);
    int lo = 1, hi = (int)nums.size();  // The whole array is always unique.
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (has_unique_window(nums, mid, base1, base2)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
  },
};
