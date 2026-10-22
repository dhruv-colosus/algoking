export const stackCode: Record<string, { python: string; cpp: string }> = {
  "valid-parentheses": {
    python: `def solve(values):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in values:
        if c in '([{':
            stack.append(c)
        elif not stack or stack.pop() != pairs[c]:
            return False
    return not stack
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

bool solve(const vector<string>& values) {
    vector<string> stack;
    for (const auto& c : values) {
        if (c == "(" || c == "[" || c == "{") stack.push_back(c);
        else {
            string opening = c == ")" ? "(" : c == "]" ? "[" : "{";
            if (stack.empty() || stack.back() != opening) return false;
            stack.pop_back();
        }
    }
    return stack.empty();
}
`
  },
  "min-stack": {
    python: `class MinStack:
    def __init__(self):
        self.stack = []

    def push(self, value):
        minimum = min(value, self.stack[-1][1]) if self.stack else value
        self.stack.append((value, minimum))

    def pop(self):
        if self.stack:
            self.stack.pop()

    def top(self):
        return self.stack[-1][0] if self.stack else None

    def get_min(self):
        return self.stack[-1][1] if self.stack else None


def solve(operations):
    stack, output = MinStack(), []
    for token in operations:
        op, _, raw = token.partition(':')
        if op == 'push': stack.push(int(raw))
        elif op == 'pop': stack.pop()
        elif op == 'top': output.append(stack.top())
        else: output.append(stack.get_min())
    return output
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

class MinStack {
    vector<pair<int, int>> entries;
public:
    void push(int value) {
        int minimum = entries.empty() ? value : min(value, entries.back().second);
        entries.push_back({value, minimum});
    }
    void pop() { if (!entries.empty()) entries.pop_back(); }
    optional<int> top() const {
        return entries.empty() ? nullopt : optional<int>(entries.back().first);
    }
    optional<int> getMin() const {
        return entries.empty() ? nullopt : optional<int>(entries.back().second);
    }
};

vector<optional<int>> solve(const vector<string>& operations) {
    MinStack stack;
    vector<optional<int>> output;
    for (const auto& op : operations) {
        if (op.rfind("push:", 0) == 0) stack.push(stoi(op.substr(5)));
        else if (op == "pop") stack.pop();
        else output.push_back(op == "top" ? stack.top() : stack.getMin());
    }
    return output;
}
`
  },
  "queue-using-stacks": {
    python: `class MyQueue:
    def __init__(self):
        self.incoming, self.outgoing = [], []

    def _transfer(self):
        if not self.outgoing:
            while self.incoming:
                self.outgoing.append(self.incoming.pop())

    def push(self, value):
        self.incoming.append(value)

    def peek(self):
        self._transfer()
        return self.outgoing[-1] if self.outgoing else None

    def pop(self):
        self._transfer()
        return self.outgoing.pop() if self.outgoing else None


def solve(operations):
    queue, output = MyQueue(), []
    for token in operations:
        op, _, raw = token.partition(':')
        if op == 'push': queue.push(int(raw))
        else: output.append(queue.pop() if op == 'pop' else queue.peek())
    return output
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

class MyQueue {
    vector<int> incoming, outgoing;
    void transfer() {
        if (outgoing.empty()) while (!incoming.empty()) {
            outgoing.push_back(incoming.back());
            incoming.pop_back();
        }
    }
public:
    void push(int value) { incoming.push_back(value); }
    optional<int> peek() {
        transfer();
        return outgoing.empty() ? nullopt : optional<int>(outgoing.back());
    }
    optional<int> pop() {
        auto value = peek();
        if (!outgoing.empty()) outgoing.pop_back();
        return value;
    }
};

vector<optional<int>> solve(const vector<string>& operations) {
    MyQueue queue;
    vector<optional<int>> output;
    for (const auto& op : operations) {
        if (op.rfind("push:", 0) == 0) queue.push(stoi(op.substr(5)));
        else output.push_back(op == "pop" ? queue.pop() : queue.peek());
    }
    return output;
}
`
  },
  "evaluate-rpn": {
    python: `def solve(tokens):
    stack = []
    for token in tokens:
        if token not in ('+', '-', '*', '/'):
            stack.append(int(token))
            continue
        right, left = stack.pop(), stack.pop()
        if token == '+': value = left + right
        elif token == '-': value = left - right
        elif token == '*': value = left * right
        else:
            value = abs(left) // abs(right)
            if (left < 0) != (right < 0): value = -value
        stack.append(value)
    return stack[0]
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

int solve(const vector<string>& tokens) {
    vector<long long> stack;
    for (const auto& token : tokens) {
        if (token != "+" && token != "-" && token != "*" && token != "/") {
            stack.push_back(stoll(token));
            continue;
        }
        long long right = stack.back(); stack.pop_back();
        long long left = stack.back(); stack.pop_back();
        long long value = token == "+" ? left + right : token == "-" ? left - right
                        : token == "*" ? left * right : left / right;
        stack.push_back(value); // Integer division truncates toward zero.
    }
    return static_cast<int>(stack.back());
}
`
  },
  "infix-to-postfix": {
    python: `def solve(tokens):
    precedence = {'+': 1, '-': 1, '*': 2, '/': 2}
    operators, output = [], []
    for token in tokens:
        if token.isdigit(): output.append(token)
        elif token == '(': operators.append(token)
        elif token == ')':
            while operators[-1] != '(':
                output.append(operators.pop())
            operators.pop()
        else:
            while (operators and operators[-1] != '(' and
                   precedence[operators[-1]] >= precedence[token]):
                output.append(operators.pop())
            operators.append(token)
    while operators:
        output.append(operators.pop())
    return ' '.join(output)
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

string solve(const vector<string>& tokens) {
    vector<string> operators, output;
    auto precedence = [](const string& op) { return op == "+" || op == "-" ? 1 : 2; };
    auto pop = [&]() { output.push_back(operators.back()); operators.pop_back(); };
    for (const auto& token : tokens) {
        if (token[0] >= '0' && token[0] <= '9') output.push_back(token);
        else if (token == "(") operators.push_back(token);
        else if (token == ")") {
            while (operators.back() != "(") pop();
            operators.pop_back();
        } else {
            while (!operators.empty() && operators.back() != "(" &&
                   precedence(operators.back()) >= precedence(token)) pop();
            operators.push_back(token);
        }
    }
    while (!operators.empty()) pop();
    string result;
    for (const auto& token : output) {
        if (!result.empty()) result += ' ';
        result += token;
    }
    return result;
}
`
  },
  "decode-string": {
    python: `def solve(values):
    stack = []
    text, count = '', 0
    for c in values:
        if c.isdigit(): count = 10 * count + int(c)
        elif c == '[':
            stack.append((text, count))
            text, count = '', 0
        elif c == ']':
            prefix, repeat = stack.pop()
            text = prefix + text * repeat
        else: text += c
    return text
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

string solve(const vector<string>& values) {
    vector<pair<string, int>> stack;
    string text;
    int count = 0;
    for (const auto& token : values) {
        char c = token[0];
        if (c >= '0' && c <= '9') count = 10 * count + c - '0';
        else if (c == '[') {
            stack.push_back({text, count});
            text.clear(); count = 0;
        } else if (c == ']') {
            auto [prefix, repeat] = stack.back(); stack.pop_back();
            string expanded = prefix;
            for (int i = 0; i < repeat; ++i) expanded += text;
            text = expanded;
        } else text += c;
    }
    return text;
}
`
  },
  "simplify-path": {
    python: `def solve(segments):
    # segments = absolute_path.split('/')
    stack = []
    for name in segments:
        if name == '..':
            if stack: stack.pop()
        elif name and name != '.':
            stack.append(name)
    return '/' + '/'.join(stack)
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

string solve(const vector<string>& segments) {
    // Supply the absolute path split on '/'.
    vector<string> stack;
    for (const auto& name : segments) {
        if (name == "..") { if (!stack.empty()) stack.pop_back(); }
        else if (!name.empty() && name != ".") stack.push_back(name);
    }
    string path;
    for (const auto& name : stack) path += "/" + name;
    return path.empty() ? "/" : path;
}
`
  },
  "remove-adjacent-duplicates": {
    python: `def solve(values):
    stack = []
    for c in values:
        if stack and stack[-1] == c: stack.pop()
        else: stack.append(c)
    return ''.join(stack)
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

string solve(const vector<string>& values) {
    string stack;
    for (const auto& c : values) {
        if (!stack.empty() && stack.back() == c[0]) stack.pop_back();
        else stack += c;
    }
    return stack;
}
`
  },
  "next-greater-element": {
    python: `def solve(values):
    n = len(values)
    answer, stack = [-1] * n, []
    for step in range(n):
        i = step % n
        while stack and values[stack[-1]] < values[i]:
            j = stack.pop()
            answer[j] = values[i]
        if step < n: stack.append(i)
    return answer
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

vector<int> solve(const vector<int>& values) {
    int n = static_cast<int>(values.size());
    vector<int> answer(n, -1), stack;
    for (int step = 0; step < n; ++step) {
        int i = step % n;
        while (!stack.empty() && values[stack.back()] < values[i]) {
            int j = stack.back(); stack.pop_back();
            answer[j] = values[i];
        }
        if (step < n) stack.push_back(i);
    }
    return answer;
}
`
  },
  "next-greater-circular": {
    python: `def solve(values):
    n = len(values)
    answer, stack = [-1] * n, []
    for step in range(2 * n):
        i = step % n
        while stack and values[stack[-1]] < values[i]:
            j = stack.pop()
            answer[j] = values[i]
        if step < n: stack.append(i)
    return answer
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

vector<int> solve(const vector<int>& values) {
    int n = static_cast<int>(values.size());
    vector<int> answer(n, -1), stack;
    for (int step = 0; step < 2 * n; ++step) {
        int i = step % n;
        while (!stack.empty() && values[stack.back()] < values[i]) {
            int j = stack.back(); stack.pop_back();
            answer[j] = values[i];
        }
        if (step < n) stack.push_back(i);
    }
    return answer;
}
`
  },
  "next-smaller-element": {
    python: `def solve(values):
    n = len(values)
    answer, stack = [-1] * n, []
    for step in range(n):
        i = step % n
        while stack and values[stack[-1]] > values[i]:
            j = stack.pop()
            answer[j] = values[i]
        if step < n: stack.append(i)
    return answer
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

vector<int> solve(const vector<int>& values) {
    int n = static_cast<int>(values.size());
    vector<int> answer(n, -1), stack;
    for (int step = 0; step < n; ++step) {
        int i = step % n;
        while (!stack.empty() && values[stack.back()] > values[i]) {
            int j = stack.back(); stack.pop_back();
            answer[j] = values[i];
        }
        if (step < n) stack.push_back(i);
    }
    return answer;
}
`
  },
  "daily-temperatures": {
    python: `def solve(values):
    n = len(values)
    answer, stack = [0] * n, []
    for step in range(n):
        i = step % n
        while stack and values[stack[-1]] < values[i]:
            j = stack.pop()
            answer[j] = i - j
        if step < n: stack.append(i)
    return answer
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

vector<int> solve(const vector<int>& values) {
    int n = static_cast<int>(values.size());
    vector<int> answer(n, 0), stack;
    for (int step = 0; step < n; ++step) {
        int i = step % n;
        while (!stack.empty() && values[stack.back()] < values[i]) {
            int j = stack.back(); stack.pop_back();
            answer[j] = i - j;
        }
        if (step < n) stack.push_back(i);
    }
    return answer;
}
`
  },
  "stock-span": {
    python: `def solve(prices):
    stack, answer = [], []
    for i, price in enumerate(prices):
        while stack and prices[stack[-1]] <= price:
            stack.pop()
        answer.append(i - (stack[-1] if stack else -1))
        stack.append(i)
    return answer
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

vector<int> solve(const vector<int>& prices) {
    vector<int> stack, answer;
    for (int i = 0; i < static_cast<int>(prices.size()); ++i) {
        while (!stack.empty() && prices[stack.back()] <= prices[i]) stack.pop_back();
        answer.push_back(i - (stack.empty() ? -1 : stack.back()));
        stack.push_back(i);
    }
    return answer;
}
`
  },
  "largest-rectangle-histogram": {
    python: `def histogram(heights):
    stack, best = [], 0
    for i in range(len(heights) + 1):
        height = heights[i] if i < len(heights) else 0
        while stack and heights[stack[-1]] > height:
            j = stack.pop()
            left = stack[-1] if stack else -1
            best = max(best, heights[j] * (i - left - 1))
        if i < len(heights): stack.append(i)
    return best


def solve(heights):
    return histogram(heights)
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

long long histogram(const vector<int>& heights) {
    vector<int> stack;
    long long best = 0;
    int n = static_cast<int>(heights.size());
    for (int i = 0; i <= n; ++i) {
        int height = i < n ? heights[i] : 0;
        while (!stack.empty() && heights[stack.back()] > height) {
            int j = stack.back(); stack.pop_back();
            int left = stack.empty() ? -1 : stack.back();
            best = max(best, 1LL * heights[j] * (i - left - 1));
        }
        if (i < n) stack.push_back(i);
    }
    return best;
}

long long solve(const vector<int>& heights) { return histogram(heights); }
`
  },
  "maximal-rectangle": {
    python: `def histogram(heights):
    stack, best = [], 0
    for i in range(len(heights) + 1):
        height = heights[i] if i < len(heights) else 0
        while stack and heights[stack[-1]] > height:
            j = stack.pop()
            left = stack[-1] if stack else -1
            best = max(best, heights[j] * (i - left - 1))
        if i < len(heights): stack.append(i)
    return best


def solve(matrix):
    heights = [0] * (len(matrix[0]) if matrix else 0)
    best = 0
    for row in matrix:
        for c, value in enumerate(row):
            heights[c] = heights[c] + 1 if value else 0
        best = max(best, histogram(heights))
    return best
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

long long histogram(const vector<int>& heights) {
    vector<int> stack;
    long long best = 0;
    int n = static_cast<int>(heights.size());
    for (int i = 0; i <= n; ++i) {
        int height = i < n ? heights[i] : 0;
        while (!stack.empty() && heights[stack.back()] > height) {
            int j = stack.back(); stack.pop_back();
            int left = stack.empty() ? -1 : stack.back();
            best = max(best, 1LL * heights[j] * (i - left - 1));
        }
        if (i < n) stack.push_back(i);
    }
    return best;
}

long long solve(const vector<vector<int>>& matrix) {
    vector<int> heights(matrix.empty() ? 0 : matrix[0].size(), 0);
    long long best = 0;
    for (const auto& row : matrix) {
        for (int c = 0; c < static_cast<int>(heights.size()); ++c)
            heights[c] = row[c] ? heights[c] + 1 : 0;
        best = max(best, histogram(heights));
    }
    return best;
}
`
  },
  "trapping-rain-water-stack": {
    python: `def solve(heights):
    stack, water = [], 0
    for right, height in enumerate(heights):
        while stack and height > heights[stack[-1]]:
            floor = stack.pop()
            if not stack: break
            left = stack[-1]
            depth = min(heights[left], height) - heights[floor]
            water += depth * (right - left - 1)
        stack.append(right)
    return water
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

long long solve(const vector<int>& heights) {
    vector<int> stack;
    long long water = 0;
    for (int right = 0; right < static_cast<int>(heights.size()); ++right) {
        while (!stack.empty() && heights[right] > heights[stack.back()]) {
            int floor = stack.back(); stack.pop_back();
            if (stack.empty()) break;
            int left = stack.back();
            int depth = min(heights[left], heights[right]) - heights[floor];
            water += 1LL * depth * (right - left - 1);
        }
        stack.push_back(right);
    }
    return water;
}
`
  },
  "sum-subarray-minimums": {
    python: `def solve(values):
    mod = 1_000_000_007
    stack, total = [], 0
    n = len(values)
    for right in range(n + 1):
        # Previous strictly smaller, next smaller-or-equal.
        while stack and (right == n or values[stack[-1]] >= values[right]):
            i = stack.pop()
            left = stack[-1] if stack else -1
            total = (total + values[i] * (i - left) * (right - i)) % mod
        if right < n: stack.append(right)
    return total
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

int solve(const vector<int>& values) {
    const long long mod = 1000000007;
    vector<int> stack;
    long long total = 0;
    int n = static_cast<int>(values.size());
    for (int right = 0; right <= n; ++right) {
        // Previous strictly smaller, next smaller-or-equal.
        while (!stack.empty() && (right == n || values[stack.back()] >= values[right])) {
            int i = stack.back(); stack.pop_back();
            int left = stack.empty() ? -1 : stack.back();
            total = (total + 1LL * values[i] * (i - left) * (right - i)) % mod;
        }
        if (right < n) stack.push_back(right);
    }
    return static_cast<int>(total);
}
`
  },
  "asteroid-collision": {
    python: `def solve(values):
    stack = []
    for current in values:
        alive = True
        while alive and current < 0 and stack and stack[-1] > 0:
            if stack[-1] < -current: stack.pop()
            else:
                if stack[-1] == -current: stack.pop()
                alive = False
        if alive: stack.append(current)
    return stack
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

vector<int> solve(const vector<int>& values) {
    vector<int> stack;
    for (int current : values) {
        bool alive = true;
        while (alive && current < 0 && !stack.empty() && stack.back() > 0) {
            if (stack.back() < -1LL * current) stack.pop_back();
            else {
                if (stack.back() == -1LL * current) stack.pop_back();
                alive = false;
            }
        }
        if (alive) stack.push_back(current);
    }
    return stack;
}
`
  },
  "remove-k-digits": {
    python: `def solve(values, k):
    stack = []
    for digit in values:
        while k and stack and stack[-1] > digit:
            stack.pop()
            k -= 1
        stack.append(digit)
    if k: del stack[-k:]
    return ''.join(stack).lstrip('0') or '0'
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

string solve(const vector<string>& values, int k) {
    string stack;
    for (const auto& token : values) {
        char digit = token[0];
        while (k > 0 && !stack.empty() && stack.back() > digit) {
            stack.pop_back(); --k;
        }
        stack += digit;
    }
    stack.resize(stack.size() - k);
    auto first = stack.find_first_not_of('0');
    return first == string::npos ? "0" : stack.substr(first);
}
`
  },
  "longest-valid-parentheses": {
    python: `def solve(values):
    stack, best = [-1], 0
    for i, c in enumerate(values):
        if c == '(': stack.append(i)
        else:
            stack.pop()
            if not stack: stack.append(i)
            else: best = max(best, i - stack[-1])
    return best
`,
    cpp: `#include <algorithm>
#include <optional>
#include <utility>
#include <string>
#include <vector>
using namespace std;

int solve(const vector<string>& values) {
    vector<int> stack = {-1};
    int best = 0;
    for (int i = 0; i < static_cast<int>(values.size()); ++i) {
        if (values[i] == "(") stack.push_back(i);
        else {
            stack.pop_back();
            if (stack.empty()) stack.push_back(i);
            else best = max(best, i - stack.back());
        }
    }
    return best;
}
`
  }
};
