export const treeCode: Record<string, { python: string; cpp: string }> = {
  "tree-preorder": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def preorder(root):
    out, stack = [], []
    if root:
        stack.append(root)
    while stack:
        node = stack.pop()
        out.append(node.value)
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    return out
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<long long> preorder(Node* root) {
    vector<long long> out;
    stack<Node*> pending;
    if (root) pending.push(root);
    while (!pending.empty()) {
        Node* node = pending.top(); pending.pop();
        out.push_back(node->value);
        if (node->right) pending.push(node->right);
        if (node->left) pending.push(node->left);
    }
    return out;
}
`,
  },
  "tree-inorder": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def inorder(root):
    out, stack, node = [], [], root
    while node or stack:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        out.append(node.value)
        node = node.right
    return out
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<long long> inorder(Node* root) {
    vector<long long> out;
    stack<Node*> pending;
    Node* node = root;
    while (node || !pending.empty()) {
        while (node) { pending.push(node); node = node->left; }
        node = pending.top(); pending.pop();
        out.push_back(node->value);
        node = node->right;
    }
    return out;
}
`,
  },
  "tree-postorder": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def postorder(root):
    out, stack, node, last = [], [], root, None
    while node or stack:
        if node:
            stack.append(node)
            node = node.left
        else:
            top = stack[-1]
            if top.right and last is not top.right:
                node = top.right
            else:
                out.append(top.value)
                last = stack.pop()
    return out
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<long long> postorder(Node* root) {
    vector<long long> out;
    stack<Node*> pending;
    Node *node = root, *last = nullptr;
    while (node || !pending.empty()) {
        if (node) { pending.push(node); node = node->left; }
        else {
            Node* top = pending.top();
            if (top->right && last != top->right) node = top->right;
            else {
                out.push_back(top->value);
                last = top; pending.pop();
            }
        }
    }
    return out;
}
`,
  },
  "tree-level-order": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def level_order(root):
    if not root:
        return []
    queue, out = deque([root]), []
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.value)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        out.append(level)
    return out
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<vector<long long>> level_order(Node* root) {
    vector<vector<long long>> out;
    if (!root) return out;
    queue<Node*> pending; pending.push(root);

    while (!pending.empty()) {
        int width = static_cast<int>(pending.size());
        vector<long long> level;
        for (int i = 0; i < width; ++i) {
            Node* node = pending.front(); pending.pop();
            level.push_back(node->value);
            if (node->left) pending.push(node->left);
            if (node->right) pending.push(node->right);
        }

        out.push_back(level);
    }
    return out;
}
`,
  },
  "tree-zigzag": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def zigzag(root):
    if not root:
        return []
    queue, out = deque([root]), []
    reverse = False
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.value)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        if reverse:
            level.reverse()
        reverse = not reverse
        out.append(level)
    return out
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<vector<long long>> zigzag(Node* root) {
    vector<vector<long long>> out;
    if (!root) return out;
    queue<Node*> pending; pending.push(root);
    bool backwards = false;
    while (!pending.empty()) {
        int width = static_cast<int>(pending.size());
        vector<long long> level;
        for (int i = 0; i < width; ++i) {
            Node* node = pending.front(); pending.pop();
            level.push_back(node->value);
            if (node->left) pending.push(node->left);
            if (node->right) pending.push(node->right);
        }
        if (backwards) reverse(level.begin(), level.end()); backwards = !backwards;
        out.push_back(level);
    }
    return out;
}
`,
  },
  "tree-right-view": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def right_view(root):
    if not root:
        return []
    queue, out = deque([root]), []
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.value)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        out.append(level[-1])
    return out
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<long long> right_view(Node* root) {
    vector<long long> out;
    if (!root) return out;
    queue<Node*> pending; pending.push(root);

    while (!pending.empty()) {
        int width = static_cast<int>(pending.size());
        vector<long long> level;
        for (int i = 0; i < width; ++i) {
            Node* node = pending.front(); pending.pop();
            level.push_back(node->value);
            if (node->left) pending.push(node->left);
            if (node->right) pending.push(node->right);
        }

        out.push_back(level.back());
    }
    return out;
}
`,
  },
  "tree-morris": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def morris_inorder(root):
    out, node = [], root
    while node:
        if not node.left:
            out.append(node.value)
            node = node.right
        else:
            pred = node.left
            while pred.right and pred.right is not node:
                pred = pred.right
            if pred.right is None:
                pred.right = node
                node = node.left
            else:
                pred.right = None
                out.append(node.value)
                node = node.right
    return out
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<long long> morris_inorder(Node* root) {
    vector<long long> out;
    Node* node = root;
    while (node) {
        if (!node->left) {
            out.push_back(node->value); node = node->right;
        } else {
            Node* pred = node->left;
            while (pred->right && pred->right != node) pred = pred->right;
            if (!pred->right) { pred->right = node; node = node->left; }
            else {
                pred->right = nullptr;
                out.push_back(node->value); node = node->right;
            }
        }
    }
    return out;
}
`,
  },
  "tree-height": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def height(root):
    if root is None:
        return 0
    return 1 + max(height(root.left), height(root.right))
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

int height(Node* root) {
    if (!root) return 0;
    return 1 + max(height(root->left), height(root->right));
}
`,
  },
  "tree-balanced": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def is_balanced(root):
    def check(node):
        if node is None:
            return 0
        left = check(node.left)
        if left == -1:
            return -1
        right = check(node.right)
        if right == -1 or abs(left - right) > 1:
            return -1
        return 1 + max(left, right)
    return check(root) != -1
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

bool is_balanced(Node* root) {
    function<int(Node*)> check = [&](Node* node) -> int {
        if (!node) return 0;
        int left = check(node->left);
        if (left == -1) return -1;
        int right = check(node->right);
        if (right == -1 || abs(left - right) > 1) return -1;
        return 1 + max(left, right);
    };
    return check(root) != -1;
}
`,
  },
  "tree-diameter": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if node is None:
            return 0
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)
        return 1 + max(left, right)
    height(root)
    return best
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

int diameter(Node* root) {
    int best = 0;
    function<int(Node*)> height = [&](Node* node) -> int {
        if (!node) return 0;
        int left = height(node->left), right = height(node->right);
        best = max(best, left + right);
        return 1 + max(left, right);
    };
    height(root);
    return best;
}
`,
  },
  "tree-max-path-sum": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def max_path_sum(root):
    if root is None:
        return None
    best = float("-inf")
    def gain(node):
        nonlocal best
        if node is None:
            return 0
        left = max(0, gain(node.left))
        right = max(0, gain(node.right))
        best = max(best, node.value + left + right)
        return node.value + max(left, right)
    gain(root)
    return best
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

optional<long long> max_path_sum(Node* root) {
    if (!root) return nullopt;
    long long best = numeric_limits<long long>::lowest();
    function<long long(Node*)> gain = [&](Node* node) -> long long {
        if (!node) return 0;
        long long left = max(0LL, gain(node->left));
        long long right = max(0LL, gain(node->right));
        best = max(best, node->value + left + right);
        return node->value + max(left, right);
    };
    gain(root);
    return best;
}
`,
  },
  "tree-symmetric": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def is_symmetric(root):
    def mirror(a, b):
        if a is None or b is None:
            return a is b
        return (a.value == b.value
                and mirror(a.left, b.right)
                and mirror(a.right, b.left))
    return root is None or mirror(root.left, root.right)
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

bool is_symmetric(Node* root) {
    function<bool(Node*, Node*)> mirror = [&](Node* a, Node* b) {
        if (!a || !b) return a == b;
        return a->value == b->value
            && mirror(a->left, b->right)
            && mirror(a->right, b->left);
    };
    return !root || mirror(root->left, root->right);
}
`,
  },
  "tree-invert": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def invert(root):
    if root is None:
        return None
    root.left, root.right = root.right, root.left
    invert(root.left)
    invert(root.right)
    return root
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

Node* invert(Node* root) {
    if (!root) return nullptr;
    swap(root->left, root->right);
    invert(root->left);
    invert(root->right);
    return root;
}
`,
  },
  "tree-count-complete": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def count_complete(root):
    if root is None:
        return 0
    left, right, lh, rh = root, root, 0, 0
    while left:
        lh += 1
        left = left.left
    while right:
        rh += 1
        right = right.right
    if lh == rh:
        return (1 << lh) - 1
    return 1 + count_complete(root.left) + count_complete(root.right)
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

long long count_complete(Node* root) {
    if (!root) return 0;
    Node *left = root, *right = root;
    int lh = 0, rh = 0;
    while (left) { ++lh; left = left->left; }
    while (right) { ++rh; right = right->right; }
    if (lh == rh) return (1LL << lh) - 1;
    return 1 + count_complete(root->left) + count_complete(root->right);
}
`,
  },
  "tree-root-paths": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def root_paths(root):
    out, path = [], []
    def visit(node):
        if node is None:
            return
        path.append(node.value)
        if node.left is None and node.right is None:
            out.append(path.copy())
        else:
            visit(node.left)
            visit(node.right)
        path.pop()
    visit(root)
    return out
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<vector<long long>> root_paths(Node* root) {
    vector<vector<long long>> out;
    vector<long long> path;
    function<void(Node*)> visit = [&](Node* node) {
        if (!node) return;
        path.push_back(node->value);
        if (!node->left && !node->right) out.push_back(path);
        else { visit(node->left); visit(node->right); }
        path.pop_back();
    };
    visit(root);
    return out;
}
`,
  },
  "tree-path-sum": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def has_path_sum(root, target):
    if root is None:
        return False
    remaining = target - root.value
    if root.left is None and root.right is None:
        return remaining == 0
    return (has_path_sum(root.left, remaining)
            or has_path_sum(root.right, remaining))
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

bool has_path_sum(Node* root, long long target) {
    if (!root) return false;
    long long remaining = target - root->value;
    if (!root->left && !root->right) return remaining == 0;
    return has_path_sum(root->left, remaining)
        || has_path_sum(root->right, remaining);
}
`,
  },
  "tree-lca": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def lowest_common_ancestor(root, p, q):
    if root is None or root is p or root is q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left is not None and right is not None:
        return root
    return left if left is not None else right
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

Node* lowest_common_ancestor(Node* root, Node* p, Node* q) {
    if (!root || root == p || root == q) return root;
    Node* left = lowest_common_ancestor(root->left, p, q);
    Node* right = lowest_common_ancestor(root->right, p, q);
    if (left && right) return root;
    return left ? left : right;
}
`,
  },
  "tree-distance-k": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def distance_k(root, target, k):
    if root is None or target is None or k < 0:
        return []
    parent, stack = {root: None}, [root]
    while stack:
        node = stack.pop()
        for child in (node.left, node.right):
            if child:
                parent[child] = node
                stack.append(child)
    if target not in parent:
        return []
    queue, seen = deque([target]), {target}
    for _ in range(k):
        if not queue:
            return []
        for _ in range(len(queue)):
            node = queue.popleft()
            for nxt in (node.left, node.right, parent[node]):
                if nxt is not None and nxt not in seen:
                    seen.add(nxt)
                    queue.append(nxt)
    return [node.value for node in queue]
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<long long> distance_k(Node* root, Node* target, int k) {
    if (!root || !target || k < 0) return {};
    unordered_map<Node*, Node*> parent; parent[root] = nullptr;
    stack<Node*> todo; todo.push(root);
    while (!todo.empty()) {
        Node* node = todo.top(); todo.pop();
        for (Node* child : {node->left, node->right}) {
            if (child) { parent[child] = node; todo.push(child); }
        }
    }
    if (!parent.count(target)) return {};
    queue<Node*> pending; pending.push(target);
    unordered_set<Node*> seen{target};
    for (int d = 0; d < k; ++d) {
        if (pending.empty()) return {};
        int width = static_cast<int>(pending.size());
        for (int i = 0; i < width; ++i) {
            Node* node = pending.front(); pending.pop();
            for (Node* next : {node->left, node->right, parent[node]}) {
                if (next && seen.insert(next).second) pending.push(next);
            }
        }
    }
    vector<long long> out;
    while (!pending.empty()) { out.push_back(pending.front()->value); pending.pop(); }
    return out;
}
`,
  },
  "tree-boundary": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def boundary(root):
    if root is None:
        return []
    def leaf(node):
        return node.left is None and node.right is None
    out = [root.value]
    if leaf(root):
        return out
    node = root.left
    while node:
        if not leaf(node):
            out.append(node.value)
        node = node.left if node.left else node.right
    def leaves(node):
        if node is None:
            return
        if leaf(node):
            out.append(node.value)
        else:
            leaves(node.left)
            leaves(node.right)
    leaves(root.left)
    leaves(root.right)
    right, node = [], root.right
    while node:
        if not leaf(node):
            right.append(node.value)
        node = node.right if node.right else node.left
    out.extend(reversed(right))
    return out
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<long long> boundary(Node* root) {
    if (!root) return {};
    auto leaf = [](Node* n) { return !n->left && !n->right; };
    vector<long long> out{root->value}, right;
    if (leaf(root)) return out;
    for (Node* n = root->left; n; n = n->left ? n->left : n->right)
        if (!leaf(n)) out.push_back(n->value);
    function<void(Node*)> leaves = [&](Node* n) {
        if (!n) return;
        if (leaf(n)) out.push_back(n->value);
        else { leaves(n->left); leaves(n->right); }
    };
    leaves(root->left); leaves(root->right);
    for (Node* n = root->right; n; n = n->right ? n->right : n->left)
        if (!leaf(n)) right.push_back(n->value);
    out.insert(out.end(), right.rbegin(), right.rend());
    return out;
}
`,
  },
  "tree-vertical": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def vertical_order(root):
    entries = []
    def visit(node, row, col):
        if node is None:
            return
        entries.append((col, row, node.value))
        visit(node.left, row + 1, col - 1)
        visit(node.right, row + 1, col + 1)
    visit(root, 0, 0)
    entries.sort()
    out, previous = [], None
    for col, row, value in entries:
        if col != previous:
            out.append([])
            previous = col
        out[-1].append(value)
    return out
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

vector<vector<long long>> vertical_order(Node* root) {
    vector<tuple<int, int, long long>> entries;
    function<void(Node*, int, int)> visit = [&](Node* n, int row, int col) {
        if (!n) return;
        entries.emplace_back(col, row, n->value);
        visit(n->left, row + 1, col - 1);
        visit(n->right, row + 1, col + 1);
    };
    visit(root, 0, 0);
    sort(entries.begin(), entries.end());
    vector<vector<long long>> out;
    optional<int> previous;
    for (auto [col, row, value] : entries) {
        if (!previous || col != *previous) { out.push_back({}); previous = col; }
        out.back().push_back(value);
    }
    return out;
}
`,
  },
  "bst-search": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def bst_search(root, key):
    node = root
    while node:
        if key == node.value:
            return node
        node = node.left if key < node.value else node.right
    return None
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

Node* bst_search(Node* root, long long key) {
    Node* node = root;
    while (node) {
        if (key == node->value) return node;
        node = key < node->value ? node->left : node->right;
    }
    return nullptr;
}
`,
  },
  "bst-insert": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def bst_insert(root, key):
    if root is None:
        return Node(key)
    if key < root.value:
        root.left = bst_insert(root.left, key)
    elif key > root.value:
        root.right = bst_insert(root.right, key)
    return root
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

Node* bst_insert(Node* root, long long key) {
    if (!root) return new Node(key);
    if (key < root->value) root->left = bst_insert(root->left, key);
    else if (key > root->value) root->right = bst_insert(root->right, key);
    return root;
}
`,
  },
  "bst-delete": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def bst_delete(root, key):
    if root is None:
        return None
    if key < root.value:
        root.left = bst_delete(root.left, key)
    elif key > root.value:
        root.right = bst_delete(root.right, key)
    else:
        if root.left is None:
            return root.right
        if root.right is None:
            return root.left
        successor = root.right
        while successor.left:
            successor = successor.left
        root.value = successor.value
        root.right = bst_delete(root.right, successor.value)
    return root
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

Node* bst_delete(Node* root, long long key) {
    if (!root) return nullptr;
    if (key < root->value) root->left = bst_delete(root->left, key);
    else if (key > root->value) root->right = bst_delete(root->right, key);
    else {
        if (!root->left || !root->right) {
            Node* child = root->left ? root->left : root->right;
            delete root; // Nodes must be individually allocated with new.
            return child;
        }
        Node* successor = root->right;
        while (successor->left) successor = successor->left;
        root->value = successor->value;
        root->right = bst_delete(root->right, successor->value);
    }
    return root;
}
`,
  },
  "bst-validate": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def is_valid_bst(root):
    def valid(node, low, high):
        if node is None:
            return True
        if not low < node.value < high:
            return False
        return (valid(node.left, low, node.value)
                and valid(node.right, node.value, high))
    return valid(root, float("-inf"), float("inf"))
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

bool is_valid_bst(Node* root) {
    function<bool(Node*, optional<long long>, optional<long long>)> valid =
        [&](Node* node, optional<long long> low, optional<long long> high) {
            if (!node) return true;
            if ((low && node->value <= *low) || (high && node->value >= *high))
                return false;
            return valid(node->left, low, node->value)
                && valid(node->right, node->value, high);
        };
    return valid(root, nullopt, nullopt);
}
`,
  },
  "bst-kth-smallest": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def kth_smallest(root, k):
    if k <= 0:
        return None
    stack, node = [], root
    while node or stack:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.value
        node = node.right
    return None
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

optional<long long> kth_smallest(Node* root, int k) {
    if (k <= 0) return nullopt;
    stack<Node*> pending;
    Node* node = root;
    while (node || !pending.empty()) {
        while (node) { pending.push(node); node = node->left; }
        node = pending.top(); pending.pop();
        if (--k == 0) return node->value;
        node = node->right;
    }
    return nullopt;
}
`,
  },
  "tree-build": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def build_tree(preorder, inorder):
    # Precondition: valid traversals with the same unique values.
    index = {value: i for i, value in enumerate(inorder)}
    cursor = 0
    def build(left, right):
        nonlocal cursor
        if left > right:
            return None
        value = preorder[cursor]
        cursor += 1
        mid = index[value]
        node = Node(value)
        node.left = build(left, mid - 1)
        node.right = build(mid + 1, right)
        return node
    return build(0, len(inorder) - 1)
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

Node* build_tree(const vector<long long>& preorder, const vector<long long>& inorder) {
    // Precondition: valid traversals with the same unique values.
    unordered_map<long long, int> index;
    for (int i = 0; i < static_cast<int>(inorder.size()); ++i) index[inorder[i]] = i;
    int cursor = 0;
    function<Node*(int, int)> build = [&](int left, int right) -> Node* {
        if (left > right) return nullptr;
        long long value = preorder[cursor++];
        int mid = index.at(value);
        Node* node = new Node(value);
        node->left = build(left, mid - 1);
        node->right = build(mid + 1, right);
        return node;
    };
    return build(0, static_cast<int>(inorder.size()) - 1);
}
`,
  },
  "tree-serialize": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def serialize(root):
    tokens = []
    def write(node):
        if node is None:
            tokens.append("#")
            return
        tokens.append(str(node.value))
        write(node.left)
        write(node.right)
    write(root)
    return ",".join(tokens)

def deserialize(data):
    # Input must be a complete stream produced by serialize.
    tokens = iter(data.split(","))
    def read():
        token = next(tokens)
        if token == "#":
            return None
        node = Node(int(token))
        node.left = read()
        node.right = read()
        return node
    return read()
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

string serialize(Node* root) {
    vector<string> tokens;
    function<void(Node*)> write = [&](Node* node) {
        if (!node) { tokens.push_back("#"); return; }
        tokens.push_back(to_string(node->value));
        write(node->left); write(node->right);
    };
    write(root);
    string out;
    for (const string& token : tokens) {
        if (!out.empty()) out += ',';
        out += token;
    }
    return out;
}
Node* deserialize(const string& data) {
    // Input must be a complete stream produced by serialize.
    istringstream stream(data);
    function<Node*()> read = [&]() -> Node* {
        string token; getline(stream, token, ',');
        if (token == "#") return nullptr;
        Node* node = new Node(stoll(token));
        node->left = read(); node->right = read();
        return node;
    };
    return read();
}
`,
  },
  "tree-flatten": {
    python: `from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def flatten(root):
    previous = None
    def visit(node):
        nonlocal previous
        if node is None:
            return
        visit(node.right)
        visit(node.left)
        node.right = previous
        node.left = None
        previous = node
    visit(root)
    return root
`,
    cpp: `#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct Node {
    long long value;
    Node *left = nullptr, *right = nullptr;
    explicit Node(long long v) : value(v) {}
};

Node* flatten(Node* root) {
    Node* previous = nullptr;
    function<void(Node*)> visit = [&](Node* node) {
        if (!node) return;
        visit(node->right); visit(node->left);
        node->right = previous;
        node->left = nullptr;
        previous = node;
    };
    visit(root);
    return root;
}
`,
  },
};
