/* B-tree (T = 2): traced search / insert mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const T = 2;
  const MAX = 40;
  const FULL = 2 * T - 1;

  const mk = (leaf) => DSV.node({ keys: [], children: [], leaf });
  const hl = (...p) => {
    const o = {};
    for (let i = 0; i < p.length; i += 2) if (p[i]) o[p[i].id] = p[i + 1];
    return o;
  };
  const SILENT = { step() {}, mark() {} };
  const count = (n) => n.keys.length + n.children.reduce((s, c) => s + count(c), 0);
  const show = (n) => `[${n.keys.join(', ')}]`;

  function splitChild(t, parent, i, base) {
    const v = (x) => Object.assign({}, base, { parent, i }, x);
    const full = parent.children[i];
    t.step('sp_full', `Split the full node ${show(full)}.`, v({ full }), { hl: hl(full, 'removed') });
    const right = mk(full.leaf);
    t.step('sp_new', 'Create an empty right sibling.', v({ full, right }), { hl: hl(full, 'removed', right, 'new') });
    const mid = full.keys[T - 1];
    t.step('sp_mid', `The middle key ${mid} will move up into the parent.`, v({ full, right, mid }), { hl: hl(full, 'removed', right, 'new') });
    right.keys = full.keys.slice(T);
    full.keys = full.keys.slice(0, T - 1);
    t.step('sp_move_keys', `Keys above ${mid} go to the right node; keys below it stay.`, v({ full, right, mid }), { hl: hl(full, 'active', right, 'new') });
    t.step('sp_check_leaf', full.leaf ? 'The node is a leaf: no children to move.' : 'Internal node: its upper children move too.', v({ full, right, mid }), { hl: hl(full, 'active', right, 'new') });
    if (!full.leaf) {
      right.children = full.children.slice(T);
      full.children = full.children.slice(0, T);
      t.step('sp_move_children', `The last ${T} children move to the right node.`, v({ full, right, mid }), { hl: hl(full, 'active', right, 'new') });
    }
    parent.keys.splice(i, 0, mid);
    t.step('sp_lift', `Insert ${mid} into the parent at position ${i}.`, v({ full, right, mid }), { hl: hl(parent, 'found') });
    parent.children.splice(i + 1, 0, right);
    t.step('sp_link', 'Link the right node as the parent’s next child.', v({ full, right, mid }), { hl: hl(full, 'active', right, 'new') });
  }

  function insert(t, m, key) {
    const r = m.root;
    t.step('start', `Insert ${key}, starting at the root.`, { key, root: r }, { hl: hl(r, 'active') });
    const rf = r.keys.length === FULL;
    t.step('check_root_full', rf ? `The root is full (${FULL} keys): split it first. This is the only way the tree grows taller.` : 'The root has room.', { key, root: r }, { hl: hl(r, rf ? 'removed' : 'active') });
    if (rf) {
      const nr = mk(false);
      nr.children.push(r);
      t.step('new_root', 'Create a new, empty root above the old one.', { key, root: r, new_root: nr }, { hl: hl(nr, 'new') });
      t.step('split_root', 'Split the old root under it.', { key, root: r, new_root: nr }, { hl: hl(nr, 'new') });
      splitChild(t, nr, 0, { key });
      m.root = nr;
      t.step('set_root', 'The new node is now the root.', { key, root: nr }, { hl: hl(nr, 'found') });
    }
    t.step('call_nonfull', 'Descend to a leaf, splitting any full child before entering it.', { key }, {});
    let node = m.root;
    for (;;) {
      t.step('nf_loop', node.leaf ? `${show(node)} is a leaf.` : `${show(node)} is internal: pick a child.`, { key, node }, { hl: hl(node, 'active') });
      if (node.leaf) break;
      let i = 0;
      t.step('nf_scan_start', 'Scan keys left to right.', { key, node, i }, { hl: hl(node, 'active') });
      while (i < node.keys.length && key > node.keys[i]) i++;
      t.step('nf_scan', `${key} belongs in child ${i}.`, { key, node, i }, { hl: hl(node, 'active', node.children[i], 'visited') });
      const cf = node.children[i].keys.length === FULL;
      t.step('nf_check_full', cf ? `Child ${show(node.children[i])} is full: split it before descending.` : 'The child has room.', { key, node, i }, { hl: hl(node.children[i], cf ? 'removed' : 'visited') });
      if (cf) {
        t.step('nf_split', 'Split it.', { key, node, i }, { hl: hl(node.children[i], 'removed') });
        splitChild(t, node, i, { key });
        const right = key > node.keys[i];
        if (right) i++;
        t.step('nf_pick', `Compare with the lifted key ${node.keys[right ? i - 1 : i]}: go to the ${right ? 'right' : 'left'} half.`, { key, node, i }, { hl: hl(node.children[i], 'visited') });
      }
      node = node.children[i];
      t.step('nf_descend', `Descend into ${show(node)}.`, { key, node, i }, { hl: hl(node, 'active') });
    }
    let i = 0;
    t.step('leaf_start', 'Find the sorted position inside the leaf.', { key, node, i }, { hl: hl(node, 'active') });
    while (i < node.keys.length && key > node.keys[i]) i++;
    t.step('leaf_scan', `Position ${i}.`, { key, node, i }, { hl: hl(node, 'active') });
    node.keys.splice(i, 0, key);
    t.step('leaf_insert', `Insert ${key}: the leaf is now ${show(node)}. It cannot overflow because full nodes were split on the way down.`, { key, node, i }, { hl: hl(node, 'found') });
    t.step('call_nonfull', `Inserted ${key}.`, { key }, { ok: true });
  }

  DSV.register({
    id: 'b-tree',
    title: 'B-Tree',
    about:
      'A balanced search tree whose nodes hold several sorted keys and have many children, so the tree is very shallow. That is ideal for disks and databases, where reading one node is expensive. With minimum degree 2 each node holds 1 to 3 keys (a 2-3-4 tree). All leaves are at the same depth.',
    init: { default: '10, 20, 5, 6, 12, 30, 7, 17', max: 25, random: [10, 1, 99] },
    complexity: {
      rows: [
        ['Search', 'O(log n)', 'O(log n)'],
        ['Insert', 'O(log n)', 'O(log n)'],
        ['Split', 'O(T)', 'O(T)'],
      ],
      space: 'O(n)',
      notes: 'Real B-trees use a much larger T (hundreds of keys per node) so that one node fills one disk page.',
    },

    create(keys) {
      const m = { root: mk(true) };
      for (const k of keys) insert(SILENT, m, k);
      return { model: m, msg: `Inserted ${keys.length} keys.` };
    },

    snapshot(m, vars) {
      const nodes = {};
      const visit = (n) => {
        if (!n || nodes[n.id]) return;
        nodes[n.id] = { id: n.id, keys: n.keys.slice(), children: n.children.map((c) => c.id) };
        n.children.forEach(visit);
      };
      visit(m.root);
      const reach = new Set(Object.keys(nodes));
      for (const k in vars) if (DSV.isNode(vars[k])) visit(vars[k]);
      return { root: m.root.id, nodes, floating: Object.keys(nodes).filter((id) => !reach.has(id)) };
    },

    layout(frame) {
      const st = frame.state;
      const width = (id) => Math.max(1, st.nodes[id].keys.length) * 0.75 + 0.45;
      const floating = new Set(st.floating);
      const pos = DSV.tidy([st.root], (id) => st.nodes[id].children.filter((c) => !floating.has(c)), { dx: 58, dy: 90, width });
      const xs = Object.values(pos).map((p) => p.x);
      let fx = Math.min(...xs) - 130;
      for (const id of st.floating) {
        if (!pos[id]) {
          pos[id] = { x: fx, y: 0 };
          fx -= 120;
        }
      }
      const nodes = [];
      const edges = [];
      for (const id in st.nodes) {
        const n = st.nodes[id];
        nodes.push({ id, x: pos[id].x, y: pos[id].y, shape: 'box', w: Math.max(1, n.keys.length) * 30 + 18, h: 36, text: n.keys.join('  ') || '·', cls: frame.hl[id] });
        n.children.forEach((c) => edges.push({ from: id, to: c, kind: 'tree' }));
      }
      return { nodes, edges, pointers: DSV.varPointers(frame, [{ name: 'root', target: st.root, cls: 'root' }]) };
    },

    scenarios: [
      ['10 20 5 6 12 30 7 17', 'search', [6]],
      ['10 20 5 6 12 30 7 17', 'search', [11]],
      ['10 20 5', 'insert', [6]],
      ['10 20 5 6 12 30 7 17', 'insert', [3]],
      ['10 20 5 6 12 30 7 17', 'insert', [40]],
      ['1 2 3 4 5 6 7 8 9 10', 'insert', [11]],
      ['', 'insert', [1]],
      ['1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20', 'insert', [21]],
      ['1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24', 'insert', [25]],
    ],

    ops: [
      {
        id: 'search',
        label: 'search(key)',
        args: [{ name: 'key', default: 12 }],
        run(t, m, key) {
          let node = m.root;
          t.step('start', 'Start at the root.', { key, node }, { hl: hl(node, 'active') });
          for (;;) {
            let i = 0;
            t.step('scan_start', `Scan ${show(node)} from the left.`, { key, node, i }, { hl: hl(node, 'active') });
            while (i < node.keys.length && key > node.keys[i]) i++;
            t.step('scan', i < node.keys.length ? `Stop at index ${i}: ${key} ≤ ${node.keys[i]}.` : `${key} is larger than every key here.`, { key, node, i }, { hl: hl(node, 'active') });
            const hit = i < node.keys.length && node.keys[i] === key;
            t.step('check_hit', hit ? `keys[${i}] == ${key}!` : `keys[${i}] is not ${key}.`, { key, node, i }, { hl: hl(node, hit ? 'found' : 'active') });
            if (hit) return t.step('found', `Found ${key}.`, { key, node, i }, { hl: hl(node, 'found'), ok: true });
            t.step('check_leaf', node.leaf ? 'This is a leaf: nowhere left to look.' : `Descend into child ${i}.`, { key, node, i }, { hl: hl(node, 'active') });
            if (node.leaf) return t.step('not_found', `${key} is not in the tree.`, { key, node }, { ok: false });
            t.mark(node.id, 'visited');
            node = node.children[i];
            t.step('descend', `Now at ${show(node)}.`, { key, node, i }, { hl: hl(node, 'active') });
          }
        },
      },
      {
        id: 'insert',
        label: 'insert(key)',
        args: [{ name: 'key', default: 8 }],
        check: (m) => (count(m.root) >= MAX ? `This demo is limited to ${MAX} keys.` : null),
        run: (t, m, key) => insert(t, m, key),
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
