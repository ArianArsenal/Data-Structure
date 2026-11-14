/* Traced building blocks shared by several structures:
 *  - heap sift-up / sift-down (Binary Heap, Priority Queue)
 *  - rotate-up with parent pointers (Red-Black Tree, Splay Tree)
 * For heaps, items is an array of DSV nodes {id, value}; better(a, b): a belongs above b. */
(function (root) {
  'use strict';
  const DSV = root.DSV;

  const swap = (a, i, j) => ([a[i], a[j]] = [a[j], a[i]]);
  const hlIdx = (items, map) => {
    const o = {};
    for (const [i, c] of map) if (items[i]) o[items[i].id] = c;
    return o;
  };

  DSV.heapSiftUp = function (t, items, i, better, word) {
    const v = (x) => Object.assign({ i }, x);
    for (;;) {
      t.step('loop', i > 0 ? `i = ${i} is not the root: compare with its parent.` : 'i = 0: reached the root.', v(), { hl: hlIdx(items, [[i, 'active']]) });
      if (i <= 0) return;
      const parent = (i - 1) >> 1;
      t.step('parent', `parent = (${i} − 1) // 2 = ${parent}.`, v({ parent }), { hl: hlIdx(items, [[i, 'active'], [parent, 'visited']]) });
      const ok = !better(items[i].value, items[parent].value);
      t.step('compare', ok ? `${items[parent].value} is ${word} or equal to ${items[i].value}: heap order holds.` : `${items[i].value} beats its parent ${items[parent].value}: swap.`, v({ parent }), {
        hl: hlIdx(items, [[i, 'active'], [parent, 'visited']]),
      });
      if (ok) return t.step('stop', 'Stop: the new value has found its place.', v({ parent }), { hl: hlIdx(items, [[i, 'found']]), ok: true });
      swap(items, i, parent);
      t.step('swap', `Swap data[${i}] and data[${parent}].`, v({ parent }), { hl: hlIdx(items, [[parent, 'active'], [i, 'visited']]) });
      i = parent;
      t.step('move_up', `i = ${i}.`, v({ parent }), { hl: hlIdx(items, [[i, 'active']]) });
    }
  };

  DSV.heapSiftDown = function (t, items, i, better, name) {
    const n = items.length;
    for (;;) {
      let best = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      const v = () => ({ i, [name]: best, left, right, n });
      const h = () => hlIdx(items, [[left, 'visited'], [right, 'visited'], [best, 'active'], [i, 'active']]);
      t.step('sd_start', `${name} = i = ${i}; children are ${left} and ${right}.`, v(), { hl: h() });
      const l = left < n && better(items[left].value, items[best].value);
      if (l) best = left;
      t.step('sd_left', left < n ? `Left child ${items[left].value} ${l ? 'wins' : 'does not win'}.` : 'No left child.', v(), { hl: h() });
      const r = right < n && better(items[right].value, items[best].value);
      if (r) best = right;
      t.step('sd_right', right < n ? `Right child ${items[right].value} ${r ? 'wins' : 'does not win'}.` : 'No right child.', v(), { hl: h() });
      t.step('sd_check', best === i ? `${name} == i: the node beats both children.` : `${name} = ${best}: a child must move up.`, v(), { hl: h() });
      if (best === i) return t.step('sd_done', 'Heap order is restored.', v(), { hl: hlIdx(items, [[i, 'found']]) });
      swap(items, i, best);
      t.step('sd_swap', `Swap data[${i}] and data[${best}].`, v(), { hl: hlIdx(items, [[best, 'active'], [i, 'visited']]) });
      i = best;
      t.step('sd_move', `i = ${i}.`, v(), { hl: hlIdx(items, [[i, 'active']]) });
    }
  };

  DSV.heapSnapshot = (items) => ({ items: items.map((x) => ({ id: x.id, value: x.value })) });

  /* Rotate node x above its parent p (nodes have key/left/right/parent).
   * Mirrors `_rotate(x)` in the red-black and splay sources. opts: {op, vars} */
  DSV.rotateUp = function (t, m, x, opts) {
    const o = opts.op ? { op: opts.op } : {};
    const p = x.parent;
    const g = p.parent;
    const v = () => Object.assign({}, opts.vars, { x, p, g });
    const hl = { [x.id]: 'new', [p.id]: 'active' };
    t.step('rot_start', `Rotate ${x.key} above its parent ${p.key}.`, v(), Object.assign({ hl }, o));
    const isLeft = p.left === x;
    t.step('rot_dir', isLeft ? `${x.key} is a left child, so this is a right rotation.` : `${x.key} is a right child, so this is a left rotation.`, v(), Object.assign({ hl }, o));
    if (isLeft) {
      p.left = x.right;
      if (x.right) x.right.parent = p;
      x.right = p;
      t.step('rot_right', `${x.key}'s right subtree moves under ${p.key}, and ${p.key} becomes ${x.key}'s right child.`, v(), Object.assign({ hl }, o));
    } else {
      p.right = x.left;
      if (x.left) x.left.parent = p;
      x.left = p;
      t.step('rot_left', `${x.key}'s left subtree moves under ${p.key}, and ${p.key} becomes ${x.key}'s left child.`, v(), Object.assign({ hl }, o));
    }
    p.parent = x;
    x.parent = g;
    if (!g) m.root = x;
    else if (g.left === p) g.left = x;
    else g.right = x;
    t.step('rot_relink', g ? `${x.key} takes ${p.key}'s old place under ${g.key}.` : `${x.key} is the new root.`, v(), Object.assign({ hl: { [x.id]: 'found' } }, o));
  };

  // Snapshot for binary trees with optional extras: extra(n) -> {cls, sub}.
  DSV.treeSnapshot = function (m, vars, extra) {
    const nodes = {};
    const visit = (n) => {
      if (!n || nodes[n.id]) return;
      nodes[n.id] = Object.assign({ id: n.id, key: n.key, left: n.left ? n.left.id : null, right: n.right ? n.right.id : null }, extra ? extra(n) : {});
      visit(n.left);
      visit(n.right);
    };
    visit(m.root);
    for (const k in vars) if (DSV.isNode(vars[k])) visit(vars[k]);
    return { root: m.root ? m.root.id : null, nodes };
  };
})(typeof window !== 'undefined' ? window : globalThis);
