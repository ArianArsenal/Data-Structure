/* Red-black tree: traced insert mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAX = 31;
  const RED = 'red';
  const BLACK = 'black';

  const hl = (...p) => {
    const o = {};
    for (let i = 0; i < p.length; i += 2) if (p[i]) o[p[i].id] = p[i + 1];
    return o;
  };
  const count = (n) => (n ? 1 + count(n.left) + count(n.right) : 0);
  const color = (n) => (n ? n.color : BLACK);

  // The same algorithm, with a no-op tracer when building the initial tree.
  const SILENT = { step() {}, mark() {} };

  function insert(t, m, key) {
    let parent = null;
    let curr = m.root;
    t.step('start', 'Phase 1: ordinary BST insert. Start at the root.', { key, curr }, { hl: hl(curr, 'active') });
    for (;;) {
      t.step('loop', curr ? `curr is ${curr.key}.` : 'Found the empty spot.', { key, parent, curr }, { hl: hl(curr, 'active') });
      if (!curr) break;
      t.step('check_dup', `Is ${key} == ${curr.key}?`, { key, parent, curr }, { hl: hl(curr, 'active') });
      if (key === curr.key) return t.step('duplicate', `${key} is already in the tree.`, { key, curr }, { hl: hl(curr, 'removed'), ok: false });
      parent = curr;
      t.mark(curr.id, 'visited');
      curr = key < curr.key ? curr.left : curr.right;
      t.step('descend', `Go ${key < parent.key ? 'left' : 'right'}.`, { key, parent, curr }, { hl: hl(curr, 'active') });
    }
    for (const id in t.marks || {}) t.mark(id);
    const node = DSV.node({ key, color: RED, left: null, right: null, parent });
    t.step('create', `Create ${key}. New nodes are always red, which keeps black heights unchanged.`, { key, parent, node }, { hl: hl(node, 'new') });
    t.step('check_root', parent ? `Its parent is ${parent.key}.` : 'The tree is empty.', { key, parent, node }, { hl: hl(node, 'new') });
    if (!parent) {
      m.root = node;
      t.step('set_root', `${key} becomes the root.`, { key, node }, { hl: hl(node, 'new') });
    } else {
      t.step('cmp_parent', `Is ${key} < ${parent.key}?`, { key, parent, node }, { hl: hl(node, 'new', parent, 'active') });
      if (key < parent.key) {
        parent.left = node;
        t.step('attach_left', `Attach as ${parent.key}'s left child.`, { key, parent, node }, { hl: hl(node, 'new') });
      } else {
        parent.right = node;
        t.step('attach_right', `Attach as ${parent.key}'s right child.`, { key, parent, node }, { hl: hl(node, 'new') });
      }
    }
    t.step('call_fix', 'Phase 2: fix any red-red violation.', { key, node }, { hl: hl(node, 'new') });
    fix(t, m, node);
    t.step('done', `Inserted ${key}. All red-black rules hold again.`, { key }, { ok: true });
  }

  function fix(t, m, z) {
    for (;;) {
      const bad = z.parent && z.parent.color === RED;
      t.step('fix_loop', bad ? `${z.key} and its parent ${z.parent.key} are both red: violation.` : `No red-red violation at ${z.key}.`, { z }, { hl: hl(z, 'active') });
      if (!bad) break;
      let p = z.parent;
      const g = p.parent;
      const uncle = p === g.left ? g.right : g.left;
      t.step('family', `parent = ${p.key}, grandparent = ${g.key}, uncle = ${uncle ? uncle.key : 'none (black)'}.`, { z, p, g, uncle }, { hl: hl(z, 'active', p, 'visited', g, 'visited') });
      const ur = color(uncle) === RED;
      t.step('check_uncle', ur ? 'The uncle is red.' : 'The uncle is black.', { z, p, g, uncle }, { hl: hl(uncle, 'active') });
      if (ur) {
        p.color = BLACK;
        uncle.color = BLACK;
        g.color = RED;
        t.step('recolor', `Case 1: recolor. Parent and uncle turn black, grandparent ${g.key} turns red.`, { z, p, g, uncle }, { hl: hl(g, 'active') });
        z = g;
        t.step('move_up', `Move up to ${g.key}; the violation may have moved there.`, { z }, { hl: hl(z, 'active') });
      } else {
        const triangle = (p === g.left) !== (z === p.left);
        t.step('check_triangle', triangle ? `Case 2: ${z.key}, ${p.key} and ${g.key} form a triangle. Rotate it into a line first.` : `Case 3: ${z.key}, ${p.key} and ${g.key} are in a line.`, { z, p, g }, { hl: hl(z, 'active') });
        if (triangle) {
          t.step('rotate_triangle', `Rotate ${z.key} above ${p.key}.`, { z, p, g }, { hl: hl(z, 'active') });
          DSV.rotateUp(t, m, z, { vars: {} });
          [z, p] = [p, z];
        }
        p.color = BLACK;
        g.color = RED;
        t.step('recolor_line', `Color ${p.key} black and ${g.key} red.`, { z, p, g }, { hl: hl(p, 'active') });
        t.step('rotate_line', `Rotate ${p.key} above ${g.key}.`, { z, p, g }, { hl: hl(p, 'active') });
        DSV.rotateUp(t, m, p, { vars: {} });
      }
    }
    m.root.color = BLACK;
    t.step('root_black', 'The root is always colored black.', {}, { hl: hl(m.root, 'found') });
  }

  // Rotations are written in the insert region; frames from delete point there.
  const rot = (t, m, x) => DSV.rotateUp(t, m, x, { vars: {}, op: 'insert' });

  function remove(t, m, key) {
    let z = m.root;
    t.step('start', `Find ${key}, starting at the root.`, { key, z }, { hl: hl(z, 'active') });
    for (;;) {
      const go = z && z.key !== key;
      t.step('search', !z ? 'Fell off the tree.' : go ? `${z.key} ≠ ${key}: go ${key < z.key ? 'left' : 'right'}.` : `Found ${key}.`, { key, z }, { hl: hl(z, go ? 'active' : 'removed') });
      if (!go) break;
      t.mark(z.id, 'visited');
      z = key < z.key ? z.left : z.right;
    }
    for (const id in t.marks || {}) t.mark(id);
    t.step('check_found', z ? `${key} is in the tree.` : `${key} is not in the tree.`, { key, z }, { hl: hl(z, 'removed') });
    if (!z) return t.step('not_found', 'Return %false%.', { key }, { ok: false });
    const two = z.left && z.right;
    t.step('check_two', two ? `${z.key} has two children: swap in its successor's key, then remove the successor instead.` : `${z.key} has at most one child: remove it directly.`, { key, z }, { hl: hl(z, 'removed') });
    if (two) {
      let s = z.right;
      while (s.left) s = s.left;
      t.step('find_succ', `The successor (leftmost in the right subtree) is ${s.key}.`, { key, z, s }, { hl: hl(z, 'removed', s, 'active') });
      z.key = s.key;
      t.step('copy_key', `Copy ${s.key} into the node; the node to unlink is now the successor.`, { key, z: s }, { hl: hl(z, 'found', s, 'removed') });
      z = s;
    }
    const child = z.left || z.right;
    const parent = z.parent;
    const wasBlack = z.color === BLACK;
    if (child) child.parent = parent;
    if (!parent) m.root = child;
    else if (parent.left === z) parent.left = child;
    else parent.right = child;
    t.step('splice', `Unlink ${z.key}: its ${child ? `child ${child.key}` : 'empty leaf'} takes its place.`, { key, child, parent }, { hl: hl(child, 'active') });
    t.step('check_black', wasBlack ? 'A black node was removed: every path through here lost one black node. Fix it.' : 'A red node was removed: no rule is broken.', { key, child, parent });
    if (wasBlack) {
      t.step('call_fix', 'Treat the replacement x as carrying an "extra black" and push it up or resolve it.', { key, x: child, parent }, { hl: hl(child, 'active') });
      fixDelete(t, m, child, parent);
    }
    t.step('done', `Deleted ${key}.`, { key }, { ok: true });
  }

  function fixDelete(t, m, x, parent) {
    for (;;) {
      const go = x !== m.root && color(x) === BLACK;
      t.step('fd_loop', go ? `x (${x ? x.key : 'empty leaf'}) is black and not the root: it is "doubly black".` : x === m.root ? 'x reached the root.' : `x (${x.key}) is red: recolor it black and stop.`, { x, parent }, { hl: hl(x, 'active') });
      if (!go) break;
      const isLeft = x === parent.left;
      let s = isLeft ? parent.right : parent.left;
      t.step('fd_sibling', `The sibling of x is ${s.key} (${s.color}).`, { x, parent, s }, { hl: hl(x, 'active', s, 'visited') });
      t.step('fd_case1', s.color === RED ? 'Case 1: red sibling. Recolor and rotate it up so the sibling becomes black.' : 'The sibling is black.', { x, parent, s }, { hl: hl(s, 'active') });
      if (s.color === RED) {
        s.color = BLACK;
        parent.color = RED;
        t.step('fd_rotate1', `Rotate ${s.key} above ${parent.key}.`, { x, parent, s }, { hl: hl(s, 'active') });
        rot(t, m, s);
        s = isLeft ? parent.right : parent.left;
      }
      let near = isLeft ? s.left : s.right;
      let far = isLeft ? s.right : s.left;
      t.step('fd_nephews', `The sibling's children: near = ${near ? `${near.key} (${near.color})` : 'empty (black)'}, far = ${far ? `${far.key} (${far.color})` : 'empty (black)'}.`, { x, parent, s, near, far }, { hl: hl(s, 'visited', near, 'active', far, 'active') });
      const bothBlack = color(near) === BLACK && color(far) === BLACK;
      t.step('fd_case2', bothBlack ? 'Case 2: both nephews are black.' : 'At least one nephew is red.', { x, parent, s, near, far }, { hl: hl(s, 'active') });
      if (bothBlack) {
        s.color = RED;
        t.step('fd_recolor2', `Color the sibling red and move the extra black up to ${parent.key}.`, { x, parent, s }, { hl: hl(s, 'active', parent, 'active') });
        x = parent;
        parent = parent.parent;
        continue;
      }
      t.step('fd_case3', color(far) === BLACK ? 'Case 3: only the near nephew is red. Rotate it up so the red one is on the far side.' : 'The far nephew is red: go straight to case 4.', { x, parent, s, near, far }, { hl: hl(near, 'active') });
      if (color(far) === BLACK) {
        near.color = BLACK;
        s.color = RED;
        t.step('fd_rotate3', `Rotate ${near.key} above ${s.key}.`, { x, parent, s, near, far }, { hl: hl(near, 'active') });
        rot(t, m, near);
        [s, far] = [near, s];
      }
      s.color = parent.color;
      parent.color = BLACK;
      far.color = BLACK;
      t.step('fd_case4', `Case 4: sibling ${s.key} takes the parent's color; the parent and far nephew turn black.`, { x, parent, s, far }, { hl: hl(s, 'active') });
      t.step('fd_rotate4', `Rotate ${s.key} above ${parent.key}. The extra black is absorbed.`, { x, parent, s, far }, { hl: hl(s, 'active') });
      rot(t, m, s);
      x = m.root;
    }
    t.step('fd_end', x ? `Color ${x.key} black.` : 'Nothing left to recolor.', { x }, { hl: hl(x, 'found') });
    if (x) x.color = BLACK;
  }

  DSV.register({
    id: 'red-black-tree',
    title: 'Red-Black Tree',
    layout: 'binaryTree',
    about:
      'A BST whose nodes are red or black. The rules (black root, no red node with a red child, the same number of black nodes on every path down) keep the tree within 2 × log n height. An insert adds a red node and fixes any red-red violation; a delete that removes a black node fixes the missing black with recoloring and at most three rotations.',
    init: { default: '10, 20, 30, 15, 25', max: MAX, random: [8, 1, 99] },
    complexity: {
      rows: [
        ['Insert', 'O(log n)', 'O(log n)'],
        ['Search', 'O(log n)', 'O(log n)'],
        ['Delete', 'O(log n)', 'O(log n)'],
        ['Rotations per insert / delete', 'O(1)', '≤ 2 / ≤ 3'],
      ],
      space: 'O(n), one color bit per node',
      notes: 'Used by C++ std::map and Java TreeMap. Try inserting 5 (red uncle, recolor) or 27 (triangle, two rotations) into the default tree.',
    },

    create(keys) {
      const m = { root: null };
      for (const k of keys) insert(SILENT, m, k);
      return { model: m, msg: `Inserted ${count(m.root)} keys.` };
    },
    snapshot: (m, vars) => DSV.treeSnapshot(m, vars, (n) => ({ cls: 'rb ' + n.color })),

    scenarios: [
      ['10 20 30 15 25', 'insert', [5]],
      ['10 20 30 15 25', 'insert', [27]],
      ['10 20 30', 'insert', [40]],
      ['10 20 30 5', 'insert', [1]],
      ['20 10 30 5', 'insert', [7]],
      ['', 'insert', [7]],
      ['10 20', 'insert', [20]],
      ['10 20 30 15 25', 'delete', [15]],
      ['10 20 30 15 25', 'delete', [20]],
      ['10 20 30 40 50 60 70 80', 'delete', [10]],
      ['10 20 30 40 50 60 70 80', 'delete', [30]],
      ['50 30 70 20 40 60 80 10', 'delete', [80]],
      ['50 30 70 20 40 60 80 65', 'delete', [40]],
      ['10 20 30', 'delete', [99]],
      ['10', 'delete', [10]],
      ['30 40 70 80 50', 'delete', [30]],
      ['60 20 70 50', 'delete', [60]],
      ['50 80 70 60 10 40', 'delete', [70]],
    ],

    ops: [
      {
        id: 'insert',
        label: 'insert(key)',
        args: [{ name: 'key', default: 27 }],
        check: (m) => (count(m.root) >= MAX ? `This demo is limited to ${MAX} nodes.` : null),
        run: (t, m, key) => insert(t, m, key),
      },
      {
        id: 'delete',
        label: 'delete(key)',
        args: [{ name: 'key', default: 10 }],
        run: (t, m, key) => remove(t, m, key),
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
