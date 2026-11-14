/* Splay tree: traced search / insert mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAX = 31;
  const SP = { op: 'splay' }; // _splay and _rotate live in their own region

  const hl = (...p) => {
    const o = {};
    for (let i = 0; i < p.length; i += 2) if (p[i]) o[p[i].id] = p[i + 1];
    return o;
  };
  const count = (n) => (n ? 1 + count(n.left) + count(n.right) : 0);
  const SILENT = { step() {}, mark() {} };

  function splay(t, m, x) {
    const o = (extra) => Object.assign({}, SP, extra);
    for (;;) {
      t.step('sp_loop', x.parent ? `${x.key} is not the root yet.` : `${x.key} is now the root. Splaying is done.`, { x }, o({ hl: hl(x, x.parent ? 'active' : 'found') }));
      if (!x.parent) return;
      const p = x.parent;
      const g = p.parent;
      t.step('sp_family', `parent = ${p.key}, grandparent = ${g ? g.key : 'none'}.`, { x, p, g }, o({ hl: hl(x, 'active', p, 'visited', g, 'visited') }));
      t.step('sp_check_zig', g ? 'There is a grandparent.' : `Zig: the parent is the root, so one rotation finishes.`, { x, p, g }, o({ hl: hl(x, 'active') }));
      if (!g) {
        t.step('sp_zig', `Rotate ${x.key} above ${p.key}.`, { x, p, g }, o({ hl: hl(x, 'active') }));
        DSV.rotateUp(t, m, x, Object.assign({ vars: {} }, SP));
        continue;
      }
      const line = (g.left === p) === (p.left === x);
      t.step('sp_check_zigzig', line ? 'Zig-zig: x, parent and grandparent are in a line. Rotate the parent first, then x.' : 'Zig-zag: they form a triangle. Rotate x twice.', { x, p, g }, o({ hl: hl(x, 'active') }));
      if (line) {
        t.step('sp_zigzig_1', `Rotate ${p.key} above ${g.key}.`, { x, p, g }, o({ hl: hl(p, 'active') }));
        DSV.rotateUp(t, m, p, Object.assign({ vars: {} }, SP));
        t.step('sp_zigzig_2', `Rotate ${x.key} above ${p.key}.`, { x, p, g }, o({ hl: hl(x, 'active') }));
        DSV.rotateUp(t, m, x, Object.assign({ vars: {} }, SP));
      } else {
        t.step('sp_zigzag_1', `Rotate ${x.key} above ${p.key}.`, { x, p, g }, o({ hl: hl(x, 'active') }));
        DSV.rotateUp(t, m, x, Object.assign({ vars: {} }, SP));
        t.step('sp_zigzag_2', `Rotate ${x.key} above ${g.key}.`, { x, p, g }, o({ hl: hl(x, 'active') }));
        DSV.rotateUp(t, m, x, Object.assign({ vars: {} }, SP));
      }
    }
  }

  function insert(t, m, key) {
    let parent = null;
    let curr = m.root;
    t.step('start', 'Start at the root, as in a plain BST insert.', { key, curr }, { hl: hl(curr, 'active') });
    for (;;) {
      t.step('loop', curr ? `curr is ${curr.key}.` : 'Found the empty spot.', { key, parent, curr }, { hl: hl(curr, 'active') });
      if (!curr) break;
      t.step('check_dup', `Is ${key} == ${curr.key}?`, { key, parent, curr }, { hl: hl(curr, 'active') });
      if (key === curr.key) {
        t.step('splay_dup', `${key} already exists. Splay it to the root anyway, since it was just accessed.`, { key, curr }, { hl: hl(curr, 'found') });
        splay(t, m, curr);
        return t.step('duplicate', 'Return %false%.', { key }, { ok: false });
      }
      parent = curr;
      curr = key < curr.key ? curr.left : curr.right;
      t.step('descend', `Go ${key < parent.key ? 'left' : 'right'}.`, { key, parent, curr }, { hl: hl(curr, 'active') });
    }
    const node = DSV.node({ key, left: null, right: null, parent });
    t.step('create', `Create ${key}.`, { key, parent, node }, { hl: hl(node, 'new') });
    t.step('check_root', parent ? `Its parent is ${parent.key}.` : 'The tree is empty.', { key, parent, node }, { hl: hl(node, 'new') });
    if (!parent) {
      m.root = node;
      t.step('set_root', `${key} becomes the root.`, { key, node }, { hl: hl(node, 'new') });
    } else {
      t.step('cmp_parent', `Is ${key} < ${parent.key}?`, { key, parent, node }, { hl: hl(node, 'new') });
      if (key < parent.key) {
        parent.left = node;
        t.step('attach_left', `Attach as ${parent.key}'s left child.`, { key, parent, node }, { hl: hl(node, 'new') });
      } else {
        parent.right = node;
        t.step('attach_right', `Attach as ${parent.key}'s right child.`, { key, parent, node }, { hl: hl(node, 'new') });
      }
    }
    t.step('call_splay', `Splay ${key} up to the root.`, { key, node }, { hl: hl(node, 'new') });
    splay(t, m, node);
    t.step('done', `${key} is the root: the next access to it costs O(1).`, { key }, { ok: true });
  }

  DSV.register({
    id: 'splay-tree',
    title: 'Splay Tree',
    layout: 'binaryTree',
    about:
      'A BST with no balance information at all. Every search or insert "splays" the accessed node to the root using three rotation patterns: zig, zig-zig and zig-zag. Frequently used keys stay near the top, and any sequence of m operations costs O(m log n) in total.',
    init: { default: '50, 30, 70, 20, 40, 60, 80', max: MAX, random: [8, 1, 99] },
    complexity: {
      rows: [
        ['Search', 'O(log n) amortized', 'O(n) single op'],
        ['Insert', 'O(log n) amortized', 'O(n) single op'],
      ],
      space: 'O(n)',
      notes: 'Search for a deep key such as 20, then search it again: the second time it is already at the root.',
    },

    create(keys) {
      const m = { root: null };
      for (const k of keys) insert(SILENT, m, k);
      return { model: m, msg: `Inserted ${count(m.root)} keys; each insert splayed the new key to the root.` };
    },
    snapshot: (m, vars) => DSV.treeSnapshot(m, vars),

    scenarios: [
      ['50 30 70 20 40 60 80', 'search', [20]],
      ['50 30 70 20 40 60 80', 'search', [45]],
      ['50 30 70 20 40', 'search', [40]],
      ['50 30 70', 'search', [30]],
      ['', 'search', [3]],
      ['50 30 70 20', 'insert', [25]],
      ['50 30 70 20', 'insert', [30]],
      ['', 'insert', [3]],
      ['50 30', 'insert', [60]],
    ],

    ops: [
      {
        id: 'search',
        label: 'search(key)',
        args: [{ name: 'key', default: 20 }],
        run(t, m, key) {
          let curr = m.root;
          let last = null;
          t.step('start', 'Search as in a BST, remembering the last node touched.', { key, curr, last }, { hl: hl(curr, 'active') });
          for (;;) {
            t.step('loop', curr ? `curr is ${curr.key}.` : 'Fell off the tree.', { key, curr, last }, { hl: hl(curr, 'active') });
            if (!curr) break;
            last = curr;
            t.step('remember', `last = ${last.key}.`, { key, curr, last }, { hl: hl(curr, 'active') });
            const eq = key === curr.key;
            t.step('cmp_equal', `Is ${key} == ${curr.key}? ${eq ? 'Yes!' : 'No.'}`, { key, curr, last }, { hl: hl(curr, eq ? 'found' : 'active') });
            if (eq) {
              t.step('found', 'Found it.', { key, curr, last }, { hl: hl(curr, 'found') });
              break;
            }
            curr = key < curr.key ? curr.left : curr.right;
            t.step('step', `Go ${key < last.key ? 'left' : 'right'}.`, { key, curr, last }, { hl: hl(curr, 'active') });
          }
          const found = !!curr;
          t.step('check_last', last ? `Splay the last node touched (${last.key}), even on a miss.` : 'The tree is empty.', { key, curr, last });
          if (last) {
            t.step('call_splay', `Splay ${last.key} to the root.`, { key, last }, { hl: hl(last, 'active') });
            splay(t, m, last);
          }
          t.step('done', found ? `Found ${key}; it is now the root.` : `${key} is not in the tree.`, { key }, { ok: found });
        },
      },
      {
        id: 'insert',
        label: 'insert(key)',
        args: [{ name: 'key', default: 45 }],
        check: (m) => (count(m.root) >= MAX ? `This demo is limited to ${MAX} nodes.` : null),
        run: (t, m, key) => insert(t, m, key),
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
