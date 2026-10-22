export type TreeNode = { id: number; value: number; left: number | null; right: number | null };
export type TreeInput = { nodes: TreeNode[]; root: number | null; target?: number; other?: number; key?: number; k?: number; sum?: number };
export type TreeStep = {
  title: string; explanation: string; action: string; nodes: TreeNode[]; root: number | null;
  active: number[]; visited: number[]; frontier: string[]; frontierLabel: string;
  result: string[]; values: Record<number, string>; valuesLabel: string;
  threads: [number, number][]; done?: boolean; warning?: boolean;
};
export type TreeScenario = TreeInput & { id: string; label: string; parameters: string; steps: TreeStep[] };
export const nodeName = (id: number) => String.fromCharCode(65 + id);

// Queue-format level order: null entries have no children of their own.
export function treeInput(values: (number | null)[]): TreeInput {
  const nodes: TreeNode[] = [];
  const add = (value: number) => { const id = nodes.length; nodes.push({ id, value, left: null, right: null }); return id; };
  if (!values.length || values[0] === null) return { nodes, root: null };
  add(values[0]); let next = 1;
  for (let head = 0; head < nodes.length && next < values.length; head++) {
    for (const side of ["left", "right"] as const) {
      const value = values[next++];
      if (value !== null && value !== undefined) nodes[head][side] = add(value);
    }
  }
  return { nodes, root: 0 };
}

export function traceTree(slug: string, input: TreeInput): TreeStep[] {
  const nodes = structuredClone(input.nodes); let root = input.root;
  const steps: TreeStep[] = [], visited = new Set<number>(), values: Record<number, string> = {};
  let result: string[] = [], frontier: number[] = [], threads: [number, number][] = [];
  let frontierLabel = "Call path · current last", valuesLabel = "Node state";
  const name = (u: number) => `${nodeName(u)}:${nodes[u].value}`;
  const emit = (title: string, explanation: string, action: string, active: number[] = [], extra: Partial<TreeStep> = {}) => {
    steps.push(structuredClone({ title, explanation, action, nodes, root, active, visited: [...visited], frontier: frontier.map(name), frontierLabel, result, values, valuesLabel, threads, ...extra }));
  };
  const finish = (answer: string[], explanation = "The final result follows from the state changes above.") => { result = answer; emit("Result ready.", explanation, `return ${answer.length ? answer.join(" · ") : "[]"}`, [], { done: true }); };
  const enter = (u: number) => { frontier.push(u); emit(`Enter ${name(u)}.`, "Keep this node on the active call path until its children finish.", `visit(${nodeName(u)})`, [u]); };
  const leave = (u: number, value: string, explanation: string) => { values[u] = value; visited.add(u); frontier.pop(); emit(`Return from ${name(u)}.`, explanation, `${nodeName(u)} → ${value}`, [u]); };
  const leaf = (u: number) => nodes[u].left === null && nodes[u].right === null;
  const children = (u: number) => [nodes[u].left, nodes[u].right].filter((v): v is number => v !== null);
  emit("Inspect the input.", "Labels identify node objects; numbers are their values. Left and right child pointers define the tree.", root === null ? "root = null" : `root = ${name(root)}`);

  if (["tree-preorder", "tree-inorder", "tree-postorder"].includes(slug)) {
    frontierLabel = "Stack · top last";
    const output = (u: number) => { result.push(String(nodes[u].value)); visited.add(u); values[u] = `visit ${result.length}`; emit(`Output ${name(u)}.`, "Append this value at the position required by the traversal order.", `output.append(${nodes[u].value})`, [u]); };
    if (slug === "tree-preorder") {
      if (root !== null) frontier.push(root);
      while (frontier.length) {
        const u = frontier.pop()!; output(u);
        if (nodes[u].right !== null) frontier.push(nodes[u].right!);
        if (nodes[u].left !== null) frontier.push(nodes[u].left!);
        emit("Push right, then left.", "The left child is on top and will be processed next.", "push(right); push(left)", [u]);
      }
    } else {
      let current = root, last: number | null = null;
      while (current !== null || frontier.length) {
        if (current !== null) {
          frontier.push(current); emit(`Push ${name(current)}.`, "Descend left before processing the parent.", "stack.push(node); node = node.left", [current]); current = nodes[current].left;
        } else {
          const u = frontier[frontier.length - 1];
          if (slug === "tree-postorder" && nodes[u].right !== null && last !== nodes[u].right) current = nodes[u].right;
          else { frontier.pop(); output(u); if (slug === "tree-inorder") current = nodes[u].right; else last = u; }
        }
      }
    }
    finish(result, "Each node appears once. The stack is empty.");
  } else if (["tree-level-order", "tree-zigzag", "tree-right-view", "tree-vertical"].includes(slug)) {
    frontierLabel = "Queue · front first"; frontier = root === null ? [] : [root];
    const coords: Record<number, [number, number]> = {}; if (root !== null) coords[root] = [0, 0];
    const triples: [number, number, number][] = []; let depth = 0;
    while (frontier.length) {
      const width = frontier.length, level: number[] = [];
      for (let i = 0; i < width; i++) {
        const u = frontier.shift()!; level.push(nodes[u].value); visited.add(u);
        const [row, col] = coords[u]; values[u] = slug === "tree-vertical" ? `row ${row}, col ${col}` : `level ${depth}`; triples.push([col, row, nodes[u].value]);
        for (const side of ["left", "right"] as const) { const v = nodes[u][side]; if (v !== null) { frontier.push(v); coords[v] = [row + 1, col + (side === "left" ? -1 : 1)]; } }
        emit(`Dequeue ${name(u)}.`, "Enqueue children left to right. The level size was fixed before expansion.", `level.append(${nodes[u].value})`, [u]);
      }
      if (slug === "tree-zigzag" && depth % 2) level.reverse();
      if (slug === "tree-right-view") result.push(String(level[level.length - 1]));
      else if (slug !== "tree-vertical") result.push(`[${level.join(", ")}]`);
      emit(`Finish level ${depth}.`, slug === "tree-zigzag" ? "Reverse alternate output levels, keeping queue expansion left to right." : slug === "tree-right-view" ? "The last value on this level is visible from the right." : "All nodes from this depth have been processed.", `level = [${level.join(", ")}]`); depth++;
    }
    if (slug === "tree-vertical") {
      triples.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]); const columns = new Map<number, number[]>();
      for (const [col, , value] of triples) { if (!columns.has(col)) columns.set(col, []); columns.get(col)!.push(value); }
      result = [...columns.values()].map((col) => `[${col.join(", ")}]`);
      emit("Sort by column, row, then value.", "Nodes at the same row and column are ordered by value, not discovery order.", "sort(column, row, value)");
    }
    finish(result);
  } else if (slug === "tree-morris") {
    let current = root; const links = new Map<number, number>(); frontierLabel = "No auxiliary stack";
    while (current !== null) {
      const u: number = current;
      if (nodes[u].left === null) {
        result.push(String(nodes[u].value)); visited.add(u); values[u] = `visit ${result.length}`;
        emit(`Output ${name(u)}.`, "With no left subtree, visit now and follow the right pointer or temporary thread.", "visit(node); node = node.right", [u]); current = nodes[u].right ?? links.get(u) ?? null;
      } else {
        let pred = nodes[u].left!; while (nodes[pred].right !== null) pred = nodes[pred].right!;
        if (!links.has(pred)) { links.set(pred, u); threads = [...links]; emit(`Thread ${nodeName(pred)} back to ${nodeName(u)}.`, "The rightmost node of the left subtree remembers where to return. Dashed arrows are temporary pointers.", `predecessor.right = ${nodeName(u)}`, [u, pred]); current = nodes[u].left; }
        else { links.delete(pred); threads = [...links]; result.push(String(nodes[u].value)); visited.add(u); values[u] = `visit ${result.length}`; emit(`Remove the thread; output ${name(u)}.`, "The left subtree is complete. Restore the original null pointer before moving right.", "predecessor.right = null; visit(node)", [u, pred]); current = nodes[u].right ?? links.get(u) ?? null; }
      }
    }
    finish(result, "Every temporary thread has been removed. The original tree is restored. The trace stores snapshots for teaching; the algorithm needs no stack.");
  } else if (["tree-height", "tree-balanced", "tree-diameter", "tree-max-path-sum"].includes(slug)) {
    let best = slug === "tree-max-path-sum" ? -Infinity : 0; valuesLabel = slug === "tree-max-path-sum" ? "Upward gain" : "Subtree height · nodes";
    function dfs(u: number | null): number {
      if (u === null) return 0;
      enter(u); const left = dfs(nodes[u].left);
      if (slug === "tree-balanced" && left === -1) { leave(u, "unbalanced", "Propagate the child failure without recomputing its height."); return -1; }
      const right = dfs(nodes[u].right);
      let answer = 1 + Math.max(left, right), explanation = `1 + max(${left}, ${right}) = ${answer}.`;
      if (slug === "tree-balanced" && (right === -1 || Math.abs(left - right) > 1)) { answer = -1; explanation = "A child failed or the child heights differ by more than one. Propagate −1."; }
      if (slug === "tree-diameter") { best = Math.max(best, left + right); explanation += ` Path through this node: ${left + right} edges. Best: ${best}.`; }
      if (slug === "tree-max-path-sum") { const l = Math.max(0, left), r = Math.max(0, right); best = Math.max(best, nodes[u].value + l + r); answer = nodes[u].value + Math.max(l, r); explanation = `Candidate = ${nodes[u].value} + ${l} + ${r}. Best sum = ${best}. Return only one branch: ${answer}.`; }
      leave(u, String(answer), explanation); if (slug === "tree-diameter" || slug === "tree-max-path-sum") result = [String(best)]; return answer;
    }
    const answer = dfs(root);
    finish([slug === "tree-balanced" ? String(answer !== -1) : slug === "tree-max-path-sum" && root === null ? "null" : String(slug === "tree-height" ? answer : best)]);
  } else if (slug === "tree-symmetric") {
    function mirror(a: number | null, b: number | null): boolean {
      if (a === null || b === null) { const same = a === b; emit("Compare mirror positions.", same ? "Both are null, so this pair matches." : "Only one position is null. The shapes differ.", `pair_matches = ${same}`, [a, b].filter((v): v is number => v !== null), { warning: !same }); return same; }
      visited.add(a); visited.add(b); values[a] = `mirror ${nodeName(b)}`; values[b] = `mirror ${nodeName(a)}`;
      emit(`Compare ${name(a)} and ${name(b)}.`, "Equal values are necessary. Next compare outer and inner child pairs.", `${nodes[a].value} == ${nodes[b].value}`, [a, b], { warning: nodes[a].value !== nodes[b].value });
      return nodes[a].value === nodes[b].value && mirror(nodes[a].left, nodes[b].right) && mirror(nodes[a].right, nodes[b].left);
    }
    finish([String(root === null || mirror(nodes[root].left, nodes[root].right))]);
  } else if (slug === "tree-invert") {
    function invert(u: number | null) { if (u === null) return; enter(u); [nodes[u].left, nodes[u].right] = [nodes[u].right, nodes[u].left]; emit(`Swap children of ${name(u)}.`, "Both subtrees remain attached; their positions are exchanged.", "node.left, node.right = node.right, node.left", [u]); invert(nodes[u].left); invert(nodes[u].right); leave(u, "swapped", "Both child subtrees have also been mirrored."); }
    invert(root); finish([root === null ? "null" : `root ${name(root)}`], "The diagram now shows the mirrored tree.");
  } else if (slug === "tree-count-complete") {
    function count(u: number | null): number {
      if (u === null) return 0; enter(u); let l: number | null = u, r: number | null = u, lh = 0, rh = 0;
      while (l !== null) { lh++; l = nodes[l].left; } while (r !== null) { rh++; r = nodes[r].right; }
      emit(`Compare extreme heights at ${name(u)}.`, `Left height ${lh}, right height ${rh}. Equal heights identify a perfect subtree because the input is complete.`, `left_height = ${lh}; right_height = ${rh}`, [u]);
      const answer = lh === rh ? 2 ** lh - 1 : 1 + count(nodes[u].left) + count(nodes[u].right); leave(u, String(answer), lh === rh ? `Count directly: 2^${lh} − 1 = ${answer}.` : "Combine the two child counts plus the root."); return answer;
    }
    finish([String(count(root))]);
  } else if (slug === "tree-root-paths" || slug === "tree-path-sum") {
    valuesLabel = slug === "tree-path-sum" ? "Remaining sum after node" : "Depth";
    function paths(u: number | null, remaining: number): boolean {
      if (u === null) return false; enter(u); const rest = remaining - nodes[u].value; values[u] = slug === "tree-path-sum" ? String(rest) : String(frontier.length - 1);
      emit(`Extend through ${name(u)}.`, leaf(u) ? "This is a leaf: the working path is a complete root-to-leaf path." : "Continue to children. A matching sum at an internal node is insufficient.", slug === "tree-path-sum" ? `remaining = ${rest}` : "path.append(node.value)", [u]);
      if (leaf(u)) { const found = slug === "tree-root-paths" || rest === 0; if (found) result.push(frontier.map((v) => nodes[v].value).join(" → ")); leave(u, slug === "tree-path-sum" ? String(rest) : "leaf", "Backtrack by removing this node from the working path."); return found; }
      const left = paths(nodes[u].left, rest); const right = slug === "tree-path-sum" && left ? false : paths(nodes[u].right, rest); leave(u, values[u], "Restore the working path before returning to the parent."); return left || right;
    }
    const found = paths(root, input.sum ?? 0); finish(slug === "tree-path-sum" ? [String(found)] : result);
  } else if (slug === "tree-lca") {
    function lca(u: number | null): number | null {
      if (u === null) return null; enter(u);
      if (u === input.target || u === input.other) { leave(u, nodeName(u), "This node is a target. Return its object identity immediately."); return u; }
      const left = lca(nodes[u].left), right = lca(nodes[u].right); const answer = left !== null && right !== null ? u : left ?? right;
      leave(u, answer === null ? "null" : nodeName(answer), left !== null && right !== null ? "Both sides contain a target: this node is their lowest common ancestor." : "Propagate the non-null child result, or null if neither side matched."); return answer;
    }
    const answer = lca(root); finish([answer === null ? "null" : name(answer)], "The two target node objects must exist in the input tree; a target may be its own ancestor.");
  } else if (slug === "tree-distance-k") {
    const parent = new Map<number, number>(); const stack = root === null ? [] : [root];
    while (stack.length) { const u = stack.pop()!; for (const v of children(u)) { parent.set(v, u); stack.push(v); } }
    emit("Index parent pointers.", "A tree normally points only downward. Parent links make upward moves possible.", "parent[child] = node");
    frontierLabel = "BFS queue · current distance"; let distance = 0;
    if (input.target !== undefined && nodes[input.target]) { frontier = [input.target]; visited.add(input.target); }
    while (frontier.length && distance < (input.k ?? 0)) {
      const width = frontier.length;
      for (let i = 0; i < width; i++) { const u = frontier.shift()!; const neighbors = [...children(u), ...(parent.has(u) ? [parent.get(u)!] : [])]; for (const v of neighbors) if (!visited.has(v)) { visited.add(v); frontier.push(v); values[v] = String(distance + 1); } emit(`Expand ${name(u)} at distance ${distance}.`, "Visit left, right, and parent, skipping every node already seen.", "enqueue unseen neighbors", [u]); } distance++;
    }
    finish(distance === (input.k ?? 0) ? frontier.map((u) => String(nodes[u].value)) : [], "The remaining frontier is exactly k edges from the target. No frontier means no such nodes.");
  } else if (slug === "tree-boundary") {
    const output = (u: number, part: string) => { visited.add(u); values[u] = part; result.push(String(nodes[u].value)); emit(`Add ${name(u)} to ${part}.`, "Each boundary node must be emitted once.", `boundary.append(${nodes[u].value})`, [u]); };
    if (root !== null) {
      output(root, "root"); if (!leaf(root)) {
        let u = nodes[root].left; while (u !== null) { if (!leaf(u)) output(u, "left boundary"); u = nodes[u].left ?? nodes[u].right; }
        function leaves(v: number | null) { if (v === null) return; if (leaf(v)) output(v, "leaves"); else { leaves(nodes[v].left); leaves(nodes[v].right); } } leaves(nodes[root].left); leaves(nodes[root].right);
        u = nodes[root].right; frontierLabel = "Right boundary · reverse before output";
        while (u !== null) { if (!leaf(u)) { frontier.push(u); emit(`Save ${name(u)}.`, "Right boundary nodes are output bottom up after all leaves.", "right_boundary.push(node)", [u]); } u = nodes[u].right ?? nodes[u].left; }
        while (frontier.length) output(frontier.pop()!, "right boundary");
      }
    }
    finish(result);
  } else if (["bst-search", "bst-insert", "bst-delete"].includes(slug)) {
    const key = input.key ?? 0;
    if (slug === "bst-search") {
      frontierLabel = "No auxiliary stack"; let u = root;
      while (u !== null) { visited.add(u); values[u] = key === nodes[u].value ? "found" : key < nodes[u].value ? "go left" : "go right"; emit(`Compare ${key} with ${name(u)}.`, "The strict BST ordering eliminates one whole subtree.", `${key} ${key === nodes[u].value ? "==" : key < nodes[u].value ? "<" : ">"} ${nodes[u].value}`, [u]); if (key === nodes[u].value) break; u = key < nodes[u].value ? nodes[u].left : nodes[u].right; }
      finish([u === null ? "null" : name(u)]);
    } else {
      function update(u: number | null, value: number): number | null {
        if (u === null) { if (slug === "bst-delete") return null; const id = nodes.length; nodes.push({ id, value, left: null, right: null }); emit(`Create ${name(id)}.`, "Return the new node so the caller can attach it to its empty child pointer.", `return Node(${value})`, [id]); return id; }
        enter(u);
        emit(`Compare ${value} with ${name(u)}.`, "Recurse into the only subtree that can contain the key.", `key = ${value}`, [u]);
        if (value < nodes[u].value) nodes[u].left = update(nodes[u].left, value);
        else if (value > nodes[u].value) nodes[u].right = update(nodes[u].right, value);
        else if (slug === "bst-delete") {
          if (nodes[u].left === null || nodes[u].right === null) { const replacement = nodes[u].left ?? nodes[u].right; leave(u, "removed", "Return the surviving child, or null for a leaf. The caller replaces its pointer."); return replacement; }
          let successor = nodes[u].right!; while (nodes[successor].left !== null) successor = nodes[successor].left!;
          emit(`Use successor ${name(successor)}.`, "Copy the smallest key in the right subtree, then delete that successor node.", `node.value = ${nodes[successor].value}`, [u, successor]); nodes[u].value = nodes[successor].value; nodes[u].right = update(nodes[u].right, nodes[successor].value);
        }
        leave(u, "linked", slug === "bst-insert" && value === nodes[u].value ? "An equal key is already present. Keep one copy." : "Return this subtree root with its updated child pointer."); return u;
      }
      root = update(root, key); emit("Reconnect the root.", "Always assign the returned subtree root, including when the original root is removed or the tree was empty.", "root = update(root, key)"); finish([root === null ? "null" : `root ${name(root)}`], "The diagram shows the updated BST. Duplicate insertions leave it unchanged.");
    }
  } else if (slug === "bst-validate") {
    valuesLabel = "Strict ancestor bounds";
    function valid(u: number | null, low: number, high: number): boolean {
      if (u === null) return true; enter(u); const ok = low < nodes[u].value && nodes[u].value < high; values[u] = `(${low === -Infinity ? "−∞" : low}, ${high === Infinity ? "∞" : high})`;
      emit(`Check ${name(u)} within ${values[u]}.`, ok ? "Carry both ancestor bounds down to the children." : "This value violates an ancestor bound. Comparing only with its parent would miss some violations.", `${low} < ${nodes[u].value} < ${high}`, [u], { warning: !ok });
      const answer = ok && valid(nodes[u].left, low, nodes[u].value) && valid(nodes[u].right, nodes[u].value, high); leave(u, values[u], `Subtree valid: ${answer}.`); return answer;
    }
    finish([String(valid(root, -Infinity, Infinity))]);
  } else if (slug === "bst-kth-smallest") {
    frontierLabel = "Inorder stack · top last"; let current = root, remaining = input.k ?? 1; let answer: number | null = null;
    while (current !== null || frontier.length) {
      while (current !== null) { frontier.push(current); emit(`Push ${name(current)}.`, "Descend left to reach the next smallest key.", "stack.push(node); node = node.left", [current]); current = nodes[current].left; }
      const u = frontier.pop()!; visited.add(u); remaining--; values[u] = `rank ${(input.k ?? 1) - remaining}`;
      emit(`Visit ${name(u)}; ${remaining} remaining.`, "Inorder gives increasing values in a strict BST. Stop at the kth visit.", `k -= 1  # ${remaining}`, [u]); if (remaining === 0) { answer = nodes[u].value; break; } current = nodes[u].right;
    }
    finish([answer === null ? "null" : String(answer)], "Return null when k is out of range; the implementation also rejects nonpositive k.");
  } else if (slug === "tree-build") {
    const preorder: number[] = [], inorder: number[] = [];
    function orders(u: number | null) { if (u === null) return; preorder.push(nodes[u].value); orders(nodes[u].left); inorder.push(nodes[u].value); orders(nodes[u].right); } orders(root);
    const original = structuredClone(nodes); nodes.length = 0; root = null; let cursor = 0;
    const indices = new Map(inorder.map((v, i) => [v, i]));
    emit("Read the traversal arrays.", `Preorder [${preorder.join(", ")}]; inorder [${inorder.join(", ")}]. Values are unique and the traversals are valid.`, "index = {value: inorder_position}", [], { nodes: [] });
    function build(left: number, right: number, parent: number | null, side: "left" | "right"): number | null {
      if (left > right) return null; const value = preorder[cursor++], mid = indices.get(value)!; const id = nodes.length; nodes.push({ id, value, left: null, right: null });
      if (parent === null) root = id; else nodes[parent][side] = id; frontier.push(id); values[id] = `inorder [${left}, ${right}]`;
      emit(`Build root ${name(id)}.`, `The inorder split is ${mid}: indices [${left}, ${mid - 1}] go left, [${mid + 1}, ${right}] go right.`, `root = Node(${value}); preorder_index = ${cursor}`, [id]);
      build(left, mid - 1, id, "left"); build(mid + 1, right, id, "right"); leave(id, values[id], "Both subtree ranges are complete."); return id;
    }
    build(0, inorder.length - 1, null, "left"); finish([original.length ? "Tree reconstructed" : "null"], "The result has exactly the original shape and traversal orders. New node IDs follow construction order.");
  } else if (slug === "tree-serialize") {
    const tokens: string[] = [];
    function serialize(u: number | null) {
      if (u === null) { tokens.push("#"); result = [...tokens]; emit("Write a null marker.", "Null markers preserve shape, including which side a lone child occupies.", 'tokens.append("#")'); return; }
      enter(u); tokens.push(String(nodes[u].value)); result = [...tokens]; emit(`Write ${name(u)}.`, "Use preorder: node, left subtree, right subtree.", `tokens.append("${nodes[u].value}")`, [u]); serialize(nodes[u].left); serialize(nodes[u].right); leave(u, "encoded", "Both child positions have been encoded.");
    }
    serialize(root); const encoded = tokens.join(","); nodes.length = 0; root = null; let cursor = 0;
    emit("Decode the same stream.", `Encoded: ${encoded}. Consume one token per call; # returns null.`, "cursor = 0");
    function decode(parent: number | null, side: "left" | "right"): number | null {
      const token = tokens[cursor++]; if (token === "#") { emit("Read #.", "Return a null child without creating a node.", "return null"); return null; }
      const id = nodes.length; nodes.push({ id, value: Number(token), left: null, right: null }); if (parent === null) root = id; else nodes[parent][side] = id;
      visited.add(id); emit(`Restore ${name(id)}.`, "Read the left subtree first, then the right subtree from the same stream.", `node = Node(${token})`, [id]); decode(id, "left"); decode(id, "right"); return id;
    }
    decode(null, "left"); finish([encoded], "The rebuilt tree has the same values and shape. The codec expects a valid stream produced by serialize.");
  } else if (slug === "tree-flatten") {
    let previous: number | null = null;
    function flatten(u: number | null) {
      if (u === null) return; enter(u); const left = nodes[u].left, right = nodes[u].right; flatten(right); flatten(left);
      nodes[u].right = previous; nodes[u].left = null; previous = u; leave(u, "rewired", `Set left to null and right to the previously processed node. Current chain begins at ${name(u)}.`);
    }
    flatten(root); let u = root; while (u !== null) { result.push(String(nodes[u].value)); u = nodes[u].right; } finish(result, "Every left pointer is null. Following right pointers yields the original preorder traversal.");
  } else throw new Error(`Unknown tree algorithm: ${slug}`);
  return steps;
}

export function treeScenarios(slug: string): TreeScenario[] {
  let first = treeInput([8, 4, 12, 2, 6, 10, 14]), second = treeInput([3, null, 2, null, 1]);
  let labels = ["Balanced tree", "Right-skewed tree"], parameters = ["", ""];
  if (slug.startsWith("bst-")) { second = treeInput([8, 4, 12, 2, 6, 10, 14]); labels = ["Balanced BST", "Alternative query"]; }
  switch (slug) {
    case "tree-max-path-sum": first = treeInput([-10, 9, 20, null, null, 15, 7]); second = treeInput([-3, -5, -2]); labels = ["Path below the root", "All negative values"]; break;
    case "tree-symmetric": first = treeInput([1, 2, 2, 3, 4, 4, 3]); second = treeInput([1, 2, 2, null, 3, null, 3]); labels = ["Mirror symmetry", "Same values, different shape"]; break;
    case "tree-count-complete": second = treeInput([1, 2, 3, 4, 5, 6]); labels = ["Perfect tree", "Complete, last level partial"]; break;
    case "tree-root-paths": second = treeInput([5]); labels[1] = "Single leaf"; break;
    case "tree-path-sum": first.sum = 14; second = treeInput([1, 2, 3]); second.sum = 1; labels = ["Matching leaf path", "Internal match is not a leaf"]; parameters = ["Target sum: 14", "Target sum: 1"]; break;
    case "tree-lca": first.target = 3; first.other = 4; second = treeInput([8, 4, 12, 2, 6]); second.target = 1; second.other = 3; labels = ["Targets in sibling branches", "One target is the ancestor"]; parameters = ["Targets: D:2 and E:6", "Targets: B:4 and D:2"]; break;
    case "tree-distance-k": first.target = 1; first.k = 2; second.target = 0; second.k = 5; labels = ["Walk through the parent", "Distance exceeds tree size"]; parameters = ["Target: B:4 · k = 2", "Target: A:3 · k = 5"]; break;
    case "tree-vertical": first = treeInput([1, 2, 3, 4, 9, 5, 6]); labels[0] = "Two nodes share a position"; break;
    case "bst-search": first.key = 10; second.key = 11; labels[1] = "Missing key"; parameters = ["Key: 10", "Key: 11"]; break;
    case "bst-insert": first.key = 5; second = treeInput([]); second.key = 7; labels = ["Insert a new leaf", "Insert into an empty tree"]; parameters = ["Key: 5", "Key: 7"]; break;
    case "bst-delete": first.key = 8; second = treeInput([8, 4, null, 2]); second.key = 8; labels = ["Delete root with two children", "Delete root with one child"]; parameters = ["Key: 8", "Key: 8"]; break;
    case "bst-validate": second = treeInput([8, 4, 12, null, null, 6, 14]); labels[1] = "Ancestor bound violation"; break;
    case "bst-kth-smallest": first.k = 3; second.k = 9; labels[1] = "k is out of range"; parameters = ["k = 3", "k = 9"]; break;
    case "tree-build": second = treeInput([]); labels[1] = "Empty traversals"; break;
    case "tree-serialize": second = treeInput([1, null, 2, 3]); labels[1] = "Sparse tree"; break;
  }
  return [first, second].map((input, index) => ({ ...input, id: `${slug}-${index}`, label: labels[index], parameters: parameters[index], steps: traceTree(slug, input) }));
}
