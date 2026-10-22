// Computed on the server. Stable IDs distinguish node identity from node value.
export type ListNodeState = { id: string; value: number | string; next: string | null; random?: string | null; row: number; column: number; removed?: boolean };
export type ListStep = {
  title: string; explanation: string; action: string; nodes: ListNodeState[];
  pointers: Record<string, string | null>; state: Record<string, string>;
  active: string[]; changed: string[]; done: boolean; result: string;
  output: string[]; answer: string | number | boolean | null;
};
export type ListScenario = { id: string; label: string; input: string; steps: ListStep[] };
export type ListInput = {
  lists: number[][]; target?: number; insertAt?: number; insertValue?: number;
  deleteAt?: number; n?: number; k?: number; cycleAt?: number;
  sharedAt?: number; random?: (number | null)[];
};
type Ref = string | null;

export function traceLinkedList(slug: string, input: ListInput): ListStep[] {
  const nodes: ListNodeState[] = [], steps: ListStep[] = [];
  const pointers: Record<string, Ref> = {}, state: Record<string, string> = {};
  const node = (id: string) => nodes.find((item) => item.id === id)!;
  const next = (id: Ref): Ref => id === null ? null : node(id).next;
  const value = (id: string) => Number(node(id).value);
  const setNext = (id: string, to: Ref) => { node(id).next = to; };
  const make = (value: number | string, row: number, column: number, id: string): string => {
    nodes.push({ id, value, next: null, row, column }); return id;
  };
  const heads: Ref[] = input.lists.map((values, row) => {
    const ids = values.map((v, i) => make(v, row, i, `${String.fromCharCode(65 + row)}${i + 1}`));
    ids.forEach((id, i) => setNext(id, ids[i + 1] ?? null));
    return ids[0] ?? null;
  });
  let head: Ref = heads[0] ?? null;
  if (input.cycleAt !== undefined && input.cycleAt >= 0 && input.lists[0]?.length) {
    setNext(`A${input.lists[0].length}`, `A${input.cycleAt + 1}`);
  }
  if (input.sharedAt !== undefined && input.sharedAt >= 0) {
    const shared = `A${input.sharedAt + 1}`;
    if (heads[1]) setNext(`B${input.lists[1].length}`, shared);
    else heads[1] = shared;
  }
  if (input.random) input.random.forEach((target, i) => { node(`A${i + 1}`).random = target === null ? null : `A${target + 1}`; });
  const chain = (start: Ref): string[] => {
    const order: string[] = [], seen = new Set<string>();
    while (start !== null && !seen.has(start)) { seen.add(start); order.push(start); start = next(start); }
    return order;
  };
  const show = (ids: string[]) => ids.length ? ids.map((id) => `${node(id).value} (${id})`).join(" → ") : "null";
  const snap = (title: string, explanation: string, action: string, active: Ref[] = [], changed: string[] = []) => {
    steps.push({ title, explanation, action, nodes: nodes.map((item) => ({ ...item })), pointers: { ...pointers }, state: { ...state }, active: active.filter((id): id is string => id !== null), changed, done: false, result: "", output: [], answer: null });
  };
  const finish = (result: string, output: string[] = [], answer: ListStep["answer"] = null) => {
    snap("Result", result, result, output);
    Object.assign(steps[steps.length - 1], { done: true, result, output, answer });
  };
  const finishList = (root: Ref) => { pointers.result = root; const ids = chain(root); finish(show(ids), ids); };
  const dummy = (root: Ref) => { const id = make("D", input.lists.length, 0, "D"); setNext(id, root); pointers.dummy = id; return id; };
  const remove = (id: string) => { node(id).removed = true; node(id).next = null; };
  pointers.head = head;
  heads.forEach((root, i) => { if (heads.length > 1) pointers[`head${String.fromCharCode(65 + i)}`] = root; });
  snap("Read the input", "IDs label node objects. Equal values can belong to different nodes. Solid arrows are next links; dashed arrows are random links.", "Start from the input head pointers.");

  function reverse(start: Ref, stop: Ref = null): Ref {
    let prev: Ref = stop, curr = start;
    pointers.prev = prev; pointers.curr = curr;
    while (curr !== stop) {
      const saved = next(curr);
      pointers.savedNext = saved;
      snap("Save the next node", "Keep access to the unprocessed suffix before overwriting this link.", "savedNext = curr.next", [curr]);
      setNext(curr!, prev);
      snap("Reverse one link", "The current node now points to the growing reversed prefix.", "curr.next = prev", [curr, prev], [curr!]);
      prev = curr; curr = saved;
      pointers.prev = prev; pointers.curr = curr;
      snap("Advance the pointers", "Move to the saved next node. The original node identities stay fixed in the diagram.", "prev = curr; curr = savedNext", [prev, curr]);
    }
    delete pointers.savedNext;
    return prev;
  }

  function merge(a: Ref, b: Ref): Ref {
    let root: Ref = null, tail: Ref = null;
    pointers.a = a; pointers.b = b; pointers.tail = tail;
    while (a !== null && b !== null) {
      const takeA = value(a) <= value(b), picked = takeA ? a : b;
      if (takeA) a = next(a); else b = next(b);
      if (tail) setNext(tail, picked); else root = picked;
      tail = picked;
      pointers.a = a; pointers.b = b; pointers.tail = tail; pointers.merged = root;
      snap("Take the smaller front", "Append this node to the output prefix. Only its input pointer advances. The tail's old next link can still point into an input until the next append.", `append ${picked}`, [picked], [tail!]);
    }
    const rest = a ?? b;
    if (tail) setNext(tail, rest); else root = rest;
    pointers.merged = root;
    snap("Attach the remainder", "One input is exhausted; its partner is already sorted.", `tail.next = ${rest ?? "null"}`, [rest], tail ? [tail] : []);
    return root;
  }

  switch (slug) {
    case "linked-list-traversal": {
      let curr = head, index = 0;
      state.target = String(input.target); pointers.curr = curr;
      while (curr !== null) {
        state.index = String(index); pointers.curr = curr;
        snap("Compare the current value", `Check ${value(curr)} against target ${input.target} at index ${index}.`, "curr.val == target", [curr]);
        if (value(curr) === input.target) { finish(`Found ${curr} at index ${index}.`, [curr], index); return steps; }
        curr = next(curr); index++;
      }
      pointers.curr = null; state.index = String(index);
      finish("Target absent: return −1.", [], -1); break;
    }
    case "linked-list-insert-delete": {
      const d = dummy(head);
      function predecessor(index: number): Ref {
        let prev: Ref = d;
        pointers.prev = prev;
        if (index < 0) return null;
        for (let i = 0; i < index; i++) {
          if (!next(prev)) return null;
          prev = next(prev); pointers.prev = prev;
          snap("Find the predecessor", `Advance to the node before position ${index}.`, "prev = prev.next", [prev]);
        }
        return prev;
      }
      state.insertAt = String(input.insertAt); state.insertValue = String(input.insertValue);
      let prev = predecessor(input.insertAt ?? 0);
      if (prev) {
        const inserted = make(input.insertValue ?? 0, input.lists.length, 1, "X1");
        setNext(inserted, next(prev)); pointers.inserted = inserted;
        snap("Preserve the successor", "The new node points to the predecessor's old successor.", "inserted.next = prev.next", [inserted], [inserted]);
        setNext(prev, inserted);
        snap("Insert the node", "Redirect the predecessor to the inserted node.", "prev.next = inserted", [prev, inserted], [prev]);
      } else snap("Invalid insertion position", "The input is unchanged because this position is outside 0…length.", "return head");
      pointers.head = next(d); state.deleteAt = String(input.deleteAt);
      prev = predecessor(input.deleteAt ?? 0);
      if (prev && next(prev)) {
        const target = next(prev)!; setNext(prev, next(target)); remove(target);
        snap("Bypass the removed node", "The predecessor skips the target. Faded nodes are detached and no longer part of the result.", "prev.next = prev.next.next", [prev], [prev]);
      } else snap("Invalid deletion position", "There is no node to remove at that position.", "return head");
      head = next(d); pointers.head = head; finishList(head); break;
    }
    case "reverse-linked-list": {
      head = reverse(head); pointers.head = head; finishList(head); break;
    }
    case "middle-of-linked-list":
    case "linked-list-cycle":
    case "linked-list-cycle-entry": {
      let slow = head, fast = head, met = false;
      pointers.slow = slow; pointers.fast = fast;
      snap("Start both pointers at head", "Compare for a cycle only after moving; initial equality does not prove a loop.", "slow = fast = head", [slow]);
      while (fast !== null && next(fast) !== null) {
        slow = next(slow); fast = next(next(fast)); pointers.slow = slow; pointers.fast = fast;
        snap("One hop and two hops", "Slow advances once. Fast advances twice, following the actual next arrows.", "slow = slow.next; fast = fast.next.next", [slow, fast]);
        if (slug !== "middle-of-linked-list" && slow === fast) { met = true; break; }
      }
      if (slug === "middle-of-linked-list") { pointers.result = slow; finish(slow ? `Middle: ${slow}, value ${value(slow)}.` : "Empty list: null.", slow ? [slow] : [], slow); }
      else if (slug === "linked-list-cycle") finish(met ? "The pointers met: cycle detected." : "Fast reached the end: no cycle.", [], met);
      else if (!met) finish("No cycle: return null.");
      else {
        let entry = head; pointers.entry = entry;
        snap("Reset one pointer to head", "Keep slow at the meeting node. Both pointers now move at the same speed.", "entry = head", [entry, slow]);
        while (entry !== slow) {
          entry = next(entry); slow = next(slow); pointers.entry = entry; pointers.slow = slow;
          snap("Move in lockstep", "Equal distances from head and the meeting point lead to the cycle entry.", "entry = entry.next; slow = slow.next", [entry, slow]);
        }
        pointers.result = entry; finish(`Cycle entry: ${entry}, value ${value(entry!)}.`, entry ? [entry] : [], entry);
      }
      break;
    }
    case "merge-two-sorted-lists": finishList(merge(heads[0], heads[1])); break;
    case "remove-nth-node-from-end": {
      const n = input.n ?? 1; state.n = String(n);
      if (n <= 0) { snap("Invalid n", "n must be positive; preserve the input.", "return head"); finishList(head); break; }
      const d = dummy(head); let slow: Ref = d, fast: Ref = d;
      pointers.slow = slow; pointers.fast = fast;
      for (let i = 0; i < n; i++) {
        fast = next(fast); pointers.fast = fast;
        snap("Create the pointer gap", `Fast has moved ${i + 1} of ${n} hops from the dummy.`, "fast = fast.next", [fast, slow]);
        if (!fast) { snap("n exceeds the length", "Preserve every input link.", "return head"); finishList(head); return steps; }
      }
      while (next(fast)) {
        slow = next(slow); fast = next(fast); pointers.slow = slow; pointers.fast = fast;
        snap("Keep the gap fixed", "Stop when fast is at the tail; slow is then just before the target.", "slow = slow.next; fast = fast.next", [slow, fast]);
      }
      const target = next(slow)!; setNext(slow!, next(target)); remove(target);
      snap("Remove the target", "Skip its link and preserve the successor.", "slow.next = slow.next.next", [slow], [slow!]);
      head = next(d); pointers.head = head; finishList(head); break;
    }
    case "intersection-of-linked-lists": {
      let a = heads[0], b = heads[1]; pointers.a = a; pointers.b = b;
      while (a !== b) {
        a = a ? next(a) : heads[1]; b = b ? next(b) : heads[0]; pointers.a = a; pointers.b = b;
        snap("Advance or switch heads", "At null, resume at the other head. Compare IDs, since equal values do not imply shared nodes.", "a = a.next or switch; b = b.next or switch", [a, b]);
      }
      pointers.result = a; finish(a ? `Shared node: ${a}, value ${value(a)}.` : "Both pointers reached null: no intersection.", a ? [a] : [], a); break;
    }
    case "remove-sorted-list-duplicates": {
      let curr = head; pointers.curr = curr;
      while (curr && next(curr)) {
        const neighbor = next(curr)!;
        if (value(curr) === value(neighbor)) {
          setNext(curr, next(neighbor)); remove(neighbor);
          snap("Skip an equal neighbor", "Keep current here so a run of more than two equal nodes is fully checked.", "curr.next = curr.next.next", [curr], [curr]);
        } else {
          curr = neighbor; pointers.curr = curr;
          snap("Advance to a new value", "The previous value's run is finished.", "curr = curr.next", [curr]);
        }
      }
      finishList(head); break;
    }
    case "palindrome-linked-list":
    case "reorder-linked-list": {
      if (!head || !next(head)) { if (slug === "palindrome-linked-list") finish("Zero or one node: palindrome.", chain(head), true); else finishList(head); break; }
      let slow = head, fast: Ref = next(head);
      pointers.slow = slow; pointers.fast = fast;
      while (fast && next(fast)) {
        slow = next(slow)!; fast = next(next(fast)); pointers.slow = slow; pointers.fast = fast;
        snap("Locate the first-half tail", "Slow stops at the end of the first half; the first half has the extra node on odd lengths.", "slow = slow.next; fast = fast.next.next", [slow, fast]);
      }
      const secondStart = next(slow);
      if (slug === "reorder-linked-list") {
        setNext(slow, null);
        snap("Split the two halves", "Cut the first half before weaving to prevent a cycle.", "slow.next = null", [slow], [slow]);
      }
      const second = reverse(secondStart); pointers.second = second;
      if (slug === "palindrome-linked-list") {
        let a: Ref = head, b = second, matches = true;
        while (b) {
          pointers.a = a; pointers.b = b;
          if (value(a!) !== value(b)) matches = false;
          state.matches = String(matches);
          snap("Compare corresponding values", `Compare ${value(a!)} with ${value(b)}. Keep checking, then restore the list before returning.`, "matches &= (a.val == b.val)", [a, b]);
          a = next(a); b = next(b);
        }
        const restored = reverse(second); setNext(slow, restored); pointers.second = restored;
        snap("Restore the original links", "Reconnect the restored second half. This also happens after a mismatch.", "slow.next = reverse(second)", [slow], [slow]);
        finish(matches ? "Palindrome: true. Original list restored." : "Palindrome: false. Original list restored.", chain(head), matches);
      } else {
        let first: Ref = head, other = second;
        while (other) {
          const nextFirst = next(first), nextOther = next(other);
          pointers.first = first; pointers.second = other; pointers.nextFirst = nextFirst; pointers.nextSecond = nextOther;
          setNext(first!, other); setNext(other, nextFirst);
          snap("Weave one pair", "Save both successors, then insert the next node from the reversed half.", "first.next = second; second.next = nextFirst", [first, other], [first!, other]);
          first = nextFirst; other = nextOther;
        }
        finishList(head);
      }
      break;
    }
    case "rotate-linked-list": {
      const ids = chain(head), n = ids.length, k = input.k ?? 0; state.k = String(k); state.length = String(n);
      if (n < 2 || k % n === 0) { snap("No rotation needed", "An empty or single-node list, or a multiple of length, stays unchanged.", "return head"); finishList(head); break; }
      const shift = k % n; state.effectiveK = String(shift);
      let tail = head!; pointers.tail = tail;
      while (next(tail)) { tail = next(tail)!; pointers.tail = tail; snap("Find the tail", "Count each node to reduce k modulo the length.", "tail = tail.next", [tail]); }
      setNext(tail, head); snap("Close a temporary ring", "The old tail points to the old head until the new tail is found.", "tail.next = head", [tail, head], [tail]);
      let newTail = head!; pointers.newTail = newTail;
      for (let i = 0; i < n - shift - 1; i++) {
        newTail = next(newTail)!; pointers.newTail = newTail;
        snap("Find the new tail", `Walk ${n - shift - 1} steps from the original head.`, "newTail = newTail.next", [newTail]);
      }
      head = next(newTail); setNext(newTail, null); pointers.head = head;
      snap("Cut the ring", "The successor becomes the new head. Null-terminate the new tail.", "head = newTail.next; newTail.next = null", [head, newTail], [newTail]);
      finishList(head); break;
    }
    case "reverse-nodes-in-k-group": {
      const k = input.k ?? 2; state.k = String(k);
      if (k <= 1) { snap("Groups of one", "Every node is already a complete group of one.", "return head"); finishList(head); break; }
      const d = dummy(head); let groupPrev = d;
      pointers.groupPrev = groupPrev;
      while (true) {
        let kth: Ref = groupPrev;
        for (let i = 0; i < k; i++) {
          kth = next(kth); pointers.kth = kth;
          snap("Check for a complete group", `Find node ${i + 1} of ${k} before changing any links.`, "kth = kth.next", [kth]);
          if (kth === null) break;
        }
        if (kth === null) { snap("Keep the trailing group", "Fewer than k nodes remain. Leave their order unchanged.", "return dummy.next"); break; }
        const groupNext = next(kth), oldHead = next(groupPrev);
        pointers.groupNext = groupNext;
        reverse(oldHead, groupNext); setNext(groupPrev, kth);
        snap("Reconnect this group", "The kth node is its new front; the old front becomes the previous-group tail.", "groupPrev.next = kth; groupPrev = oldHead", [groupPrev, kth], [groupPrev]);
        groupPrev = oldHead!; pointers.groupPrev = groupPrev;
      }
      head = next(d); pointers.head = head; finishList(head); break;
    }
    case "add-two-linked-list-numbers": {
      let a = heads[0], b = heads[1], carry = 0, result: Ref = null, tail: Ref = null, index = 0;
      pointers.a = a; pointers.b = b;
      while (a || b || carry) {
        const total = carry + (a ? value(a) : 0) + (b ? value(b) : 0);
        carry = Math.floor(total / 10); state.total = String(total); state.carry = String(carry);
        const added = make(total % 10, input.lists.length, index++, `R${index}`);
        if (tail) setNext(tail, added); else result = added;
        tail = added; a = next(a); b = next(b); pointers.a = a; pointers.b = b; pointers.tail = tail; pointers.result = result;
        snap("Add one digit and carry", "Allocate a fresh result node. Both input lists keep their original links.", `digit = ${total} % 10; carry = ${carry}`, [tail], [tail]);
      }
      if (!result) result = make(0, input.lists.length, 0, "R1");
      finishList(result); break;
    }
    case "copy-list-with-random-pointer": {
      const originals = chain(head), copies = new Map<string, string>();
      for (const [i, original] of originals.entries()) {
        const copy = make(value(original), 1, i, `C${i + 1}`); node(copy).random = null; copies.set(original, copy);
        pointers.original = original; pointers.copy = copy; state.map = [...copies].map(([a, b]) => `${a} → ${b}`).join(", ");
        snap("Allocate an independent copy", "Map node identity to a fresh object. Its links are not wired yet.", `copies[${original}] = ${copy}`, [original, copy]);
      }
      for (const original of originals) {
        const copy = copies.get(original)!;
        setNext(copy, copies.get(next(original)!) ?? null);
        node(copy).random = copies.get(node(original).random!) ?? null;
        pointers.original = original; pointers.copy = copy;
        snap("Wire copied links", "Resolve next and random through the map. Every copied edge stays inside the copied list.", "copy.next = copies[next]; copy.random = copies[random]", [original, copy], [copy]);
      }
      finishList(head ? copies.get(head)! : null); break;
    }
    case "merge-k-sorted-lists": {
      // Binary min-heap: the walkthrough executes the same frontier strategy as the snippets.
      const heap: string[] = [];
      const less = (a: string, b: string) => value(a) < value(b) || (value(a) === value(b) && a < b);
      const push = (id: string) => {
        heap.push(id); let i = heap.length - 1;
        while (i > 0) { const p = (i - 1) >> 1; if (!less(heap[i], heap[p])) break; [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; }
      };
      const pop = () => {
        const root = heap[0], last = heap.pop()!;
        if (heap.length) {
          heap[0] = last; let i = 0;
          while (true) {
            let child = i * 2 + 1; if (child >= heap.length) break;
            if (child + 1 < heap.length && less(heap[child + 1], heap[child])) child++;
            if (!less(heap[child], heap[i])) break;
            [heap[i], heap[child]] = [heap[child], heap[i]]; i = child;
          }
        }
        return root;
      };
      for (const root of heads) if (root) push(root);
      const heapText = () => heap.map((id) => `${id}:${value(id)}`).join(", ") || "Empty";
      state.heap = heapText(); snap("Seed the min-heap", "Keep one current frontier node from each nonempty input. Heap entries below are in heap-array order.", "push each nonempty head", heap);
      let result: Ref = null, tail: Ref = null;
      while (heap.length) {
        const picked = pop(), saved = next(picked);
        if (tail) setNext(tail, picked); else result = picked;
        tail = picked; if (saved) push(saved);
        pointers.tail = tail; pointers.result = result; state.heap = heapText();
        snap("Pop the minimum frontier", "Append the smallest node and push its successor. Only one node per input list occupies the heap.", `append ${picked}; push its successor`, [picked], [picked]);
      }
      if (tail) setNext(tail, null);
      finishList(result); break;
    }
    case "sort-linked-list": {
      function sort(root: Ref, depth: number): Ref {
        if (!root || !next(root)) return root;
        let slow = root, fast = next(root);
        while (fast && next(fast)) { slow = next(slow)!; fast = next(next(fast)); }
        const right = next(slow); setNext(slow, null);
        pointers.left = root; pointers.right = right; state.recursionDepth = String(depth);
        snap("Split the chain", "Cut at the first-half tail so both recursive inputs are strictly smaller.", "right = slow.next; slow.next = null", [root, right], [slow]);
        const leftSorted = sort(root, depth + 1), rightSorted = sort(right, depth + 1);
        state.recursionDepth = String(depth);
        snap("Merge the sorted halves", "Both recursive results are sorted. Choose their front nodes in nondecreasing order.", "merge(sort(left), sort(right))", [leftSorted, rightSorted]);
        return merge(leftSorted, rightSorted);
      }
      head = sort(head, 0); pointers.head = head; finishList(head); break;
    }
    default: throw new Error(`Unknown linked list algorithm: ${slug}`);
  }
  return steps;
}

export function linkedListScenarios(slug: string): ListScenario[] {
  const examples: Record<string, { label: string; input: ListInput }[]> = {
    "linked-list-traversal": [{ label: "Target found", input: { lists: [[4, 7, 2, 9]], target: 2 } }, { label: "Target absent", input: { lists: [[4, 7, 4]], target: 8 } }],
    "linked-list-insert-delete": [{ label: "Interior updates", input: { lists: [[2, 6, 8]], insertAt: 1, insertValue: 4, deleteAt: 2 } }, { label: "Insert into an empty list", input: { lists: [[]], insertAt: 0, insertValue: 5, deleteAt: 0 } }],
    "reverse-linked-list": [{ label: "Four nodes", input: { lists: [[1, 2, 3, 4]] } }, { label: "Single node", input: { lists: [[7]] } }],
    "middle-of-linked-list": [{ label: "Even: second middle", input: { lists: [[1, 2, 3, 4]] } }, { label: "Odd length", input: { lists: [[1, 2, 3, 4, 5]] } }],
    "linked-list-cycle": [{ label: "Cycle to node A2", input: { lists: [[1, 2, 3, 4]], cycleAt: 1 } }, { label: "No cycle; equal values", input: { lists: [[1, 2, 1]] } }],
    "linked-list-cycle-entry": [{ label: "Entry differs from meeting", input: { lists: [[1, 2, 3, 4]], cycleAt: 1 } }, { label: "Self-loop", input: { lists: [[7]], cycleAt: 0 } }, { label: "No cycle", input: { lists: [[1, 2, 3]] } }],
    "merge-two-sorted-lists": [{ label: "Interleaved values", input: { lists: [[1, 3, 5], [2, 4, 6]] } }, { label: "Ties and unequal lengths", input: { lists: [[1, 2, 2], [1]] } }],
    "remove-nth-node-from-end": [{ label: "Remove second from end", input: { lists: [[1, 2, 3, 4, 5]], n: 2 } }, { label: "Remove the head", input: { lists: [[1, 2, 3]], n: 3 } }, { label: "Invalid n", input: { lists: [[1, 2]], n: 3 } }],
    "intersection-of-linked-lists": [{ label: "Shared suffix", input: { lists: [[1, 3, 7, 9], [2]], sharedAt: 2 } }, { label: "Equal values, different objects", input: { lists: [[1, 2], [1, 2]] } }],
    "palindrome-linked-list": [{ label: "Even palindrome", input: { lists: [[1, 2, 2, 1]] } }, { label: "Mismatch; restore links", input: { lists: [[1, 2, 3]] } }],
    "remove-sorted-list-duplicates": [{ label: "Repeated runs", input: { lists: [[1, 1, 2, 3, 3]] } }, { label: "All values equal", input: { lists: [[2, 2, 2]] } }],
    "add-two-linked-list-numbers": [{ label: "342 + 465", input: { lists: [[2, 4, 3], [5, 6, 4]] } }, { label: "999 + 1: final carry", input: { lists: [[9, 9, 9], [1]] } }],
    "reorder-linked-list": [{ label: "Odd length", input: { lists: [[1, 2, 3, 4, 5]] } }, { label: "Even length", input: { lists: [[1, 2, 3, 4]] } }],
    "rotate-linked-list": [{ label: "Rotate right by two", input: { lists: [[1, 2, 3, 4, 5]], k: 2 } }, { label: "k exceeds length", input: { lists: [[1, 2, 3]], k: 7 } }, { label: "Multiple of length", input: { lists: [[1, 2, 3]], k: 6 } }],
    "reverse-nodes-in-k-group": [{ label: "Pairs; trailing node stays", input: { lists: [[1, 2, 3, 4, 5]], k: 2 } }, { label: "Incomplete group", input: { lists: [[1, 2]], k: 3 } }],
    "copy-list-with-random-pointer": [{ label: "Forward, backward and null", input: { lists: [[7, 13, 11, 10]], random: [null, 0, 3, 1] } }, { label: "Self links; repeated values", input: { lists: [[5, 5]], random: [0, 1] } }],
    "merge-k-sorted-lists": [{ label: "Three sorted lists", input: { lists: [[1, 4], [2, 5], [3, 6]] } }, { label: "Empty list and tied fronts", input: { lists: [[], [1, 1], [1, 2]] } }],
    "sort-linked-list": [{ label: "Unsorted input", input: { lists: [[4, 2, 1, 3]] } }, { label: "Negative values and ties", input: { lists: [[3, -1, 3, 0]] } }],
  };
  if (!examples[slug]) throw new Error(`Unknown linked list algorithm: ${slug}`);
  return examples[slug].map(({ label, input }, i) => ({
    id: `${slug}-${i}`, label,
    input: input.lists.map((values, index) => `${String.fromCharCode(65 + index)}: ${values.length ? values.map((v, j) => `${v} (${String.fromCharCode(65 + index)}${j + 1})`).join(" → ") : "null"}`).join("; ") + `; parameters: ${JSON.stringify(Object.fromEntries(Object.entries(input).filter(([key]) => key !== "lists")))}`,
    steps: traceLinkedList(slug, input),
  }));
}
