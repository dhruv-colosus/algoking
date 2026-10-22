export type StackInput = { id: string; label: string; values: (string | number)[]; k?: number; matrix?: number[][] };
export type StackResult = null | number | boolean | string | (number | null)[];
export type StackStep = {
  title: string; explanation: string; cursor: number; values: (string | number)[];
  stack: string[]; secondary: string[]; secondaryLabel: string; stats: [string, string][];
  result: StackResult; done: boolean;
};
export type StackScenario = StackInput & { steps: StackStep[] };

// Execute the algorithms on the server. Every snapshot owns its arrays.
export function traceStack(slug: string, input: StackInput): StackStep[] {
  const a = input.values, nums = a.map(Number), n = a.length, st: number[] = [], steps: StackStep[] = [];
  let cursor = -1, result: StackResult = null, values = [...a], secondaryLabel = "Auxiliary stack · bottom → top";
  const emit = (title: string, explanation: string, stack: (number | string)[] = st, secondary: (number | string)[] = [], stats: [string, string][] = [], done = false) => {
    steps.push({ title, explanation, cursor, values: [...values], stack: stack.map(String), secondary: secondary.map(String), secondaryLabel, stats: stats.map(([k, v]) => [k, v]), result: Array.isArray(result) ? [...result] : result, done });
  };
  const indexed = () => st.map((i) => `${i}: ${nums[i]}`);
  emit("Start with an empty stack", "Read the input in order. The stack keeps only the state needed to resolve the next item.");
  if (slug === "valid-parentheses") {
    const openings: string[] = [], pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
    result = true;
    for (cursor = 0; cursor < n; cursor++) {
      const c = String(a[cursor]);
      if ("([{".includes(c)) { openings.push(c); emit("Push an opening bracket", `${c} waits for its matching closer.`, openings); }
      else if (openings.at(-1) === pairs[c]) { openings.pop(); emit("Pop a matching pair", `${c} matches the most recent opening bracket.`, openings); }
      else { result = false; emit("Mismatched closer", `${c} cannot match the current top. The sequence is invalid.`, openings); break; }
    }
    result = result === true && openings.length === 0;
    cursor = Math.min(cursor, n - 1); emit("Check remaining openings", `Return ${result}. Every opening must be closed.`, openings, [], [], true); return steps;
  } else if (slug === "min-stack") {
    const minima: number[] = []; result = []; secondaryLabel = "Minimum at each depth · bottom → top";
    for (cursor = 0; cursor < n; cursor++) {
      const [op, raw] = String(a[cursor]).split(":");
      if (op === "push") { const x = Number(raw); st.push(x); minima.push(Math.min(x, minima.at(-1) ?? Infinity)); }
      if (op === "pop") { st.pop(); minima.pop(); }
      if (op === "top" || op === "min") result.push((op === "top" ? st : minima).at(-1) ?? null);
      emit(op === "push" ? "Push value and minimum" : op === "pop" ? "Pop both stacks" : "Read the top", `${a[cursor]}: the minimum at each depth describes exactly that prefix.`, st, minima);
    }
  } else if (slug === "queue-using-stacks") {
    const outgoing: number[] = []; result = []; secondaryLabel = "Outgoing stack · top is queue front";
    for (cursor = 0; cursor < n; cursor++) {
      const [op, raw] = String(a[cursor]).split(":");
      if (op === "push") { st.push(Number(raw)); emit("Push into incoming", `${raw} joins the back of the queue.`, st, outgoing); }
      else {
        if (!outgoing.length) while (st.length) { outgoing.push(st.pop()!); emit("Transfer one value", "Reverse incoming values only when outgoing is empty; its top becomes the oldest value.", st, outgoing); }
        result.push(op === "pop" ? outgoing.pop() ?? null : outgoing.at(-1) ?? null);
        emit(op === "pop" ? "Pop the queue front" : "Peek at the queue front", `Return ${result.at(-1)} from the outgoing top.`, st, outgoing);
      }
    }
  } else if (slug === "evaluate-rpn") {
    for (cursor = 0; cursor < n; cursor++) {
      const token = String(a[cursor]);
      if (!["+", "-", "*", "/"].includes(token)) { st.push(Number(token)); emit("Push an operand", `${token} waits for an operator.`); }
      else { const right = st.pop()!, left = st.pop()!; const value = token === "+" ? left + right : token === "-" ? left - right : token === "*" ? left * right : Math.trunc(left / right); st.push(value === 0 ? 0 : value); emit("Apply the operator", `${left} ${token} ${right} = ${value}. Pop right before left.`); }
    }
    result = st[0];
  } else if (slug === "infix-to-postfix") {
    const ops: string[] = [], output: string[] = [], precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
    for (cursor = 0; cursor < n; cursor++) {
      const token = String(a[cursor]);
      if (/^\d+$/.test(token)) { output.push(token); result = output.join(" "); emit("Output an operand", "Operands keep their relative evaluation order.", ops); }
      else if (token === "(") { ops.push(token); emit("Push a group boundary", "The opening parenthesis blocks operators from the outer expression.", ops); }
      else if (token === ")") { while (ops.at(-1) !== "(") { output.push(ops.pop()!); result = output.join(" "); emit("Close the group", "Move the group's pending operator to the output.", ops); } ops.pop(); emit("Remove the boundary", "Parentheses do not appear in postfix output.", ops); }
      else { while (ops.length && ops.at(-1) !== "(" && precedence[ops.at(-1)!] >= precedence[token]) { output.push(ops.pop()!); result = output.join(" "); emit("Resolve precedence", "Pop higher or equal precedence; these operators are left-associative.", ops); } ops.push(token); emit("Push the new operator", `${token} waits for its right operand.`, ops); }
    }
    while (ops.length) { output.push(ops.pop()!); result = output.join(" "); emit("Flush pending operators", "The input is complete; output the remaining operators.", ops); }
    result = output.join(" ");
  } else if (slug === "decode-string") {
    const prefixes: string[] = [], counts: number[] = []; let text = "", count = 0;
    secondaryLabel = "Saved repetition counts · bottom → top";
    for (cursor = 0; cursor < n; cursor++) {
      const c = String(a[cursor]);
      if (/\d/.test(c)) { count = count * 10 + Number(c); }
      else if (c === "[") { prefixes.push(text); counts.push(count); text = ""; count = 0; }
      else if (c === "]") { text = prefixes.pop()! + text.repeat(counts.pop()!); }
      else text += c;
      result = text; emit(c === "]" ? "Restore and repeat" : c === "[" ? "Save the outer context" : "Read the next character", `Current decoded fragment: ${JSON.stringify(text)}; pending repeat count: ${count}.`, prefixes.map((p) => JSON.stringify(p)), counts, [["Repeat count", String(count)]]);
    }
    result = text;
  } else if (slug === "simplify-path" || slug === "remove-adjacent-duplicates") {
    const chars: string[] = []; result = "";
    for (cursor = 0; cursor < n; cursor++) {
      const c = String(a[cursor]);
      if (slug === "simplify-path") { if (c === "..") chars.pop(); else if (c && c !== ".") chars.push(c); result = "/" + chars.join("/"); emit(c === ".." ? "Go up one directory" : !c || c === "." ? "Ignore this segment" : "Push a directory", `Resolve segment ${JSON.stringify(c)}. The stack is the canonical directory chain.`, chars); }
      else { const cancel = chars.at(-1) === c; if (cancel) chars.pop(); else chars.push(c); result = chars.join(""); emit(cancel ? "Cancel an adjacent pair" : "Push the character", cancel ? `${c} matches the top. Removing both may expose another pair.` : `${c} differs from the top, so preserve it.`, chars); }
    }
    result = slug === "simplify-path" ? "/" + chars.join("/") : chars.join("");
  } else if (["next-greater-element", "next-greater-circular", "next-smaller-element", "daily-temperatures"].includes(slug)) {
    const out = Array<number>(n).fill(slug === "daily-temperatures" ? 0 : -1); result = out;
    const smaller = slug === "next-smaller-element", circular = slug === "next-greater-circular";
    for (let pass = 0; pass < (circular ? 2 * n : n); pass++) {
      cursor = pass % n;
      while (st.length && (smaller ? nums[st.at(-1)!] > nums[cursor] : nums[st.at(-1)!] < nums[cursor])) {
        const j = st.pop()!; out[j] = slug === "daily-temperatures" ? cursor - j : nums[cursor];
        emit("Resolve a waiting index", `${cursor}: ${nums[cursor]} is the first strictly ${smaller ? "smaller" : "greater"} value after index ${j}. Record ${out[j]}.`, indexed(), [], [["Pass", String(Math.floor(pass / Math.max(1, n)) + 1)]]);
      }
      if (pass < n) { st.push(cursor); emit("Push an unresolved index", "Keep the index so duplicates and answer positions remain distinct.", indexed()); }
      else emit("Inspect the wraparound value", "The second pass resolves waiting indices without pushing duplicates.", indexed());
    }
  } else if (slug === "stock-span") {
    const out: number[] = []; result = out;
    for (cursor = 0; cursor < n; cursor++) {
      while (st.length && nums[st.at(-1)!] <= nums[cursor]) { const j = st.pop()!; emit("Remove a dominated price", `${nums[j]} ≤ ${nums[cursor]}, so it cannot block today's span.`, indexed()); }
      const span = cursor - (st.at(-1) ?? -1); out.push(span); st.push(cursor); emit("Record today's span", `Nearest strictly greater price is ${cursor - span}; span = ${span}, including today.`, indexed());
    }
  } else if (slug === "largest-rectangle-histogram" || slug === "maximal-rectangle") {
    let best = 0;
    const rows = slug === "maximal-rectangle" ? input.matrix ?? [] : [nums];
    const heights = Array<number>(slug === "maximal-rectangle" ? rows[0]?.length ?? 0 : n).fill(0);
    for (let row = 0; row < rows.length; row++) {
      for (let c = 0; c < heights.length; c++) heights[c] = slug === "maximal-rectangle" ? rows[row][c] ? heights[c] + 1 : 0 : rows[row][c];
      values = [...heights]; st.length = 0;
      emit("Build the current histogram", slug === "maximal-rectangle" ? `Row ${row}: a 1 extends its column height; a 0 resets it.` : "Each height is a unit-width bar.", [], [], [["Row", String(row)]]);
      for (cursor = 0; cursor <= heights.length; cursor++) {
        const height = heights[cursor] ?? 0;
        while (st.length && heights[st.at(-1)!] > height) {
          const j = st.pop()!, left = st.at(-1) ?? -1, width = cursor - left - 1, area = heights[j] * width; best = Math.max(best, area); result = best;
          emit("Close a rectangle", `Bar ${j}: height ${heights[j]} × width (${cursor} − ${left} − 1) = ${area}.`, st.map((i) => `${i}: ${heights[i]}`), [], [["Row", String(row)], ["Popped bar", String(j)], ["Width", String(width)], ["Area", String(area)]]);
        }
        if (cursor < heights.length) { st.push(cursor); emit("Push the next bar", "The stack keeps non-decreasing heights until a smaller right boundary appears.", st.map((i) => `${i}: ${heights[i]}`), [], [["Row", String(row)]]); }
      }
    }
    result = best;
  } else if (slug === "trapping-rain-water-stack") {
    let water = 0; result = 0;
    for (cursor = 0; cursor < n; cursor++) {
      while (st.length && nums[cursor] > nums[st.at(-1)!]) {
        const bottom = st.pop()!;
        if (!st.length) { emit("No left wall", `Popped floor ${bottom} has no left boundary, so no water is added.`, indexed()); break; }
        const left = st.at(-1)!, width = cursor - left - 1, depth = Math.min(nums[left], nums[cursor]) - nums[bottom]; water += width * depth; result = water;
        emit("Fill a bounded layer", `Walls ${left} and ${cursor}, floor ${bottom}: width ${width} × depth ${depth} = ${width * depth}.`, indexed(), [], [["Water added", String(width * depth)]]);
      }
      st.push(cursor); emit("Keep the current wall", "This index can bound a future basin.", indexed());
    }
    result = water;
  } else if (slug === "sum-subarray-minimums") {
    const mod = 1_000_000_007; let total = 0; result = 0;
    for (cursor = 0; cursor <= n; cursor++) {
      while (st.length && (cursor === n || nums[st.at(-1)!] >= nums[cursor])) {
        const j = st.pop()!, left = st.at(-1) ?? -1, count = (j - left) * (cursor - j), contribution = nums[j] * count; total = (total + contribution) % mod; result = total;
        emit("Count one minimum's contribution", `Index ${j} owns (${j} − ${left}) × (${cursor} − ${j}) = ${count} subarrays; add ${contribution}. Equal values stop on the right to avoid double-counting.`, indexed(), [], [["Contribution", String(contribution)], ["Subarrays", String(count)]]);
      }
      if (cursor < n) { st.push(cursor); emit("Push a candidate minimum", "Values on the stack are strictly increasing after equal or larger entries are resolved.", indexed()); }
    }
    result = total;
  } else if (slug === "asteroid-collision") {
    result = [];
    for (cursor = 0; cursor < n; cursor++) {
      const x = nums[cursor]; let alive = true;
      while (alive && x < 0 && st.length && st.at(-1)! > 0) {
        const top = st.at(-1)!;
        if (top < -x) st.pop(); else { if (top === -x) st.pop(); alive = false; }
        result = [...st]; emit("Resolve a collision", `${top} meets ${x}. ${top === -x ? "Both are destroyed." : top < -x ? "The previous survivor is destroyed; keep checking." : "The incoming asteroid is destroyed."}`);
      }
      if (alive) st.push(x); result = [...st]; emit("Record the survivors", "Only a positive top and a negative incoming value can collide.");
    }
  } else if (slug === "remove-k-digits") {
    let remaining = input.k ?? 0; const digits: string[] = [];
    for (cursor = 0; cursor < n; cursor++) {
      const c = String(a[cursor]);
      while (remaining > 0 && digits.length && digits.at(-1)! > c) { const removed = digits.pop(); remaining--; result = digits.join(""); emit("Remove a larger leading digit", `${removed} before ${c} makes the number larger. Use one deletion.`, digits, [], [["Deletions left", String(remaining)]]); }
      digits.push(c); result = digits.join(""); emit("Keep the current digit", "Preserve this digit unless a smaller later digit justifies deleting it.", digits, [], [["Deletions left", String(remaining)]]);
    }
    while (remaining > 0) { digits.pop(); remaining--; result = digits.join(""); emit("Delete from the end", "The remaining prefix is non-decreasing, so remove the largest available trailing position.", digits, [], [["Deletions left", String(remaining)]]); }
    result = digits.join("").replace(/^0+/, "") || "0";
  } else if (slug === "longest-valid-parentheses") {
    st.push(-1); let best = 0;
    emit("Set the initial boundary", "Index −1 is the boundary before a valid substring starting at zero.");
    for (cursor = 0; cursor < n; cursor++) {
      if (a[cursor] === "(") { st.push(cursor); emit("Push an opening index", "Remember where an unmatched opening begins."); }
      else { st.pop(); if (!st.length) { st.push(cursor); emit("Reset the invalid boundary", "This closer has no matching opening. A future valid substring must start after it."); } else { const length = cursor - st.at(-1)!; best = Math.max(best, length); result = best; emit("Measure a valid suffix", `${cursor} − ${st.at(-1)} = ${length}; retain the largest length.`); } }
    }
    result = best;
  } else throw new Error(`Unknown stack algorithm: ${slug}`);
  cursor = Math.min(cursor, values.length - 1);
  const last = steps.at(-1)!;
  emit("Return the answer", `Finished. Result: ${JSON.stringify(result)}.`, last.stack, last.secondary, last.stats, true);
  return steps;
}

const example = (label: string, values: (string | number)[], extra: Partial<StackInput> = {}): StackInput => ({ id: label.toLowerCase().replaceAll(" ", "-"), label, values, ...extra });
const chars = (s: string) => [...s];
const fixtures: Record<string, StackInput[]> = {
  "valid-parentheses": [example("Nested pairs", chars("([{}])")), example("Crossed pairs", chars("([)]"))],
  "min-stack": [example("Minimum changes", ["push:-2", "push:0", "push:-3", "min", "pop", "top", "min"]), example("Repeated minima", ["push:2", "push:2", "pop", "min", "pop", "min"])],
  "queue-using-stacks": [example("Interleaved operations", ["push:1", "push:2", "peek", "pop", "push:3", "pop", "pop"]), example("Empty queue", ["pop", "push:4", "peek", "pop", "peek"])],
  "evaluate-rpn": [example("Postfix arithmetic", ["2", "1", "+", "3", "*"]), example("Negative division", ["7", "-3", "/"])],
  "infix-to-postfix": [example("Precedence and groups", "3 + 4 * ( 2 - 1 )".split(" ")), example("Left associativity", "8 / 4 / 2".split(" "))],
  "decode-string": [example("Nested repetition", chars("3[a2[c]]")), example("Multi-digit count", chars("ab12[c]"))],
  "simplify-path": [example("Parent directories", "/a/./b/../../c/".split("/")), example("Root and literal dots", "/../../a//.../b/..".split("/"))],
  "remove-adjacent-duplicates": [example("Cascading cancellation", chars("abbaca")), example("All pairs cancel", chars("abccba"))],
  "next-greater-element": [example("Repeated values", [2, 1, 2, 4, 3]), example("No greater values", [4, 3, 2, 1])],
  "next-greater-circular": [example("Wrap around", [1, 2, 1]), example("All equal", [3, 3, 3])],
  "next-smaller-element": [example("Smaller boundaries", [4, 8, 5, 2, 25]), example("Equal and negative", [2, 2, -1, -2])],
  "daily-temperatures": [example("Warm and cool days", [73, 74, 75, 71, 69, 72, 76, 73]), example("Equal temperatures", [70, 70, 71])],
  "stock-span": [example("Price history", [100, 80, 60, 70, 60, 75, 85]), example("Equal prices", [5, 5, 5, 5])],
  "largest-rectangle-histogram": [example("Mixed heights", [2, 1, 5, 6, 2, 3]), example("Equal heights and zero", [2, 2, 0, 3, 3])],
  "maximal-rectangle": [example("Binary matrix", [], { matrix: [[1, 0, 1, 0, 0], [1, 0, 1, 1, 1], [1, 1, 1, 1, 1], [1, 0, 0, 1, 0]] }), example("Reset at zeros", [], { matrix: [[1, 1, 1], [0, 1, 1], [1, 1, 0]] })],
  "trapping-rain-water-stack": [example("Several basins", [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]), example("One wide basin", [4, 0, 1, 0, 4])],
  "sum-subarray-minimums": [example("Distinct minima", [3, 1, 2, 4]), example("Duplicate minima", [2, 2, 2])],
  "asteroid-collision": [example("Larger survivor", [5, 10, -5]), example("Chain and equal collision", [10, 2, -5, -10])],
  "remove-k-digits": [example("Greedy removals", chars("1432219"), { k: 3 }), example("Leading zeros", chars("10200"), { k: 1 })],
  "longest-valid-parentheses": [example("Invalid boundary", chars(")()())")), example("Nested and separate", chars("(()())()"))],
};
export function stackScenarios(slug: string): StackScenario[] {
  if (!fixtures[slug]) throw new Error(`Unknown stack algorithm: ${slug}`);
  return fixtures[slug].map((input) => ({ ...input, steps: traceStack(slug, input) }));
}
