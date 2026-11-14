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

  DSV.register({
    id: 'red-black-tree',
    title: 'Red-Black Tree',
    layout: 'binaryTree',
    about:
      'A BST whose nodes are red or black. The rules (black root, no red node with a red child, the same number of black nodes on every path down) keep the tree within 2 × log n height. An insert adds a red node, then fixes any red-red violation by recoloring and at most two rotations.',
    init: { default: '10, 20, 30, 15, 25', max: MAX, random: [8, 1, 99] },
    complexity: {
      rows: [
        ['Insert', 'O(log n)', 'O(log n)'],
        ['Search', 'O(log n)', 'O(log n)'],
        ['Rotations per insert', 'O(1)', '≤ 2'],
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
    ],

    ops: [
      {
        id: 'insert',
        label: 'insert(key)',
        args: [{ name: 'key', default: 27 }],
        check: (m) => (count(m.root) >= MAX ? `This demo is limited to ${MAX} nodes.` : null),
        run: (t, m, key) => insert(t, m, key),
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
