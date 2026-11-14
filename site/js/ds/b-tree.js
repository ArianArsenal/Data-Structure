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

  // Merge child i, key i and child i + 1 into child i.
  function merge(t, node, i, base) {
    const left = node.children[i];
    const right = node.children[i + 1];
    const v = (x) => Object.assign({}, base, { node, i, left, right }, x);
    t.step('mg_pick', `Merge ${show(left)}, the key ${node.keys[i]} and ${show(right)}.`, v(), { hl: hl(left, 'active', right, 'active', node, 'visited') });
    left.keys.push(node.keys.splice(i, 1)[0]);
    t.step('mg_pull', `Pull ${left.keys[left.keys.length - 1]} down from the parent.`, v(), { hl: hl(left, 'new', right, 'active') });
    left.keys.push(...right.keys);
    left.children.push(...right.children);
    t.step('mg_join', `Append the right node's keys and children: ${show(left)}.`, v(), { hl: hl(left, 'new', right, 'removed') });
    node.children.splice(i + 1, 1);
    t.step('mg_unlink', 'Drop the now-empty right node from the parent.', v(), { hl: hl(left, 'found') });
  }

  // Give child i at least T keys; return the index of the child to enter.
  function fill(t, node, i, base) {
    const child = node.children[i];
    const v = (x) => Object.assign({}, base, { node, i, child }, x);
    const lrich = i > 0 && node.children[i - 1].keys.length >= T;
    t.step('borrow_left_check', lrich ? `The left sibling ${show(node.children[i - 1])} can spare a key.` : 'The left sibling cannot spare a key.', v(), { hl: hl(child, 'removed', node.children[i - 1], 'visited') });
    if (lrich) {
      const left = node.children[i - 1];
      child.keys.unshift(node.keys[i - 1]);
      node.keys[i - 1] = left.keys.pop();
      if (!left.leaf) child.children.unshift(left.children.pop());
      t.step('borrow_left', `Rotate through the parent: its key moves down into the child, and the left sibling's largest key moves up.`, v({ left }), { hl: hl(child, 'new', left, 'active', node, 'found') });
      return i;
    }
    const rrich = i < node.keys.length && node.children[i + 1].keys.length >= T;
    t.step('borrow_right_check', rrich ? `The right sibling ${show(node.children[i + 1])} can spare a key.` : 'The right sibling cannot spare a key.', v(), { hl: hl(child, 'removed', node.children[i + 1], 'visited') });
    if (rrich) {
      const right = node.children[i + 1];
      child.keys.push(node.keys[i]);
      node.keys[i] = right.keys.shift();
      if (!right.leaf) child.children.push(right.children.shift());
      t.step('borrow_right', `Rotate through the parent: its key moves down into the child, and the right sibling's smallest key moves up.`, v({ right }), { hl: hl(child, 'new', right, 'active', node, 'found') });
      return i;
    }
    const hasRight = i < node.keys.length;
    t.step('merge_check', hasRight ? 'Neither sibling can spare a key: merge with the right sibling.' : 'Neither sibling can spare a key: merge with the left sibling.', v(), { hl: hl(child, 'removed') });
    if (hasRight) {
      t.step('merge_right', 'Merge with the right sibling.', v(), { hl: hl(child, 'active') });
      merge(t, node, i, base);
      return i;
    }
    t.step('merge_left', 'Merge into the left sibling.', v(), { hl: hl(child, 'active') });
    merge(t, node, i - 1, base);
    return i - 1;
  }

  function del(t, m, node, key, depth) {
    const v = (x) => Object.assign({ key, node, depth }, x);
    let i = 0;
    t.step('scan_start', `depth ${depth}: scan ${show(node)}.`, v({ i }), { hl: hl(node, 'active') });
    while (i < node.keys.length && key > node.keys[i]) i++;
    t.step('scan', `Stop at index ${i}.`, v({ i }), { hl: hl(node, 'active') });
    const here = i < node.keys.length && node.keys[i] === key;
    t.step('check_here', here ? `${key} is in this node.` : `${key} is not in this node.`, v({ i }), { hl: hl(node, here ? 'removed' : 'active') });
    if (here) {
      t.step('check_leaf', node.leaf ? 'It is a leaf: just remove the key.' : 'It is an internal node: replace the key instead of removing it.', v({ i }), { hl: hl(node, 'removed') });
      if (node.leaf) {
        node.keys.splice(i, 1);
        t.step('remove_leaf', `Removed. The leaf is now ${show(node)}.`, v({ i }), { hl: hl(node, 'found') });
        return true;
      }
      const lc = node.children[i];
      t.step('case_pred', lc.keys.length >= T ? `The left child has ${lc.keys.length} keys (≥ ${T}): use the predecessor.` : 'The left child is too thin to give up its predecessor.', v({ i }), { hl: hl(lc, 'visited') });
      if (lc.keys.length >= T) {
        let pred = lc;
        while (!pred.leaf) pred = pred.children[pred.children.length - 1];
        t.step('find_pred', `The predecessor is the largest key in the left subtree: ${pred.keys[pred.keys.length - 1]}.`, v({ i, pred }), { hl: hl(pred, 'active') });
        node.keys[i] = pred.keys[pred.keys.length - 1];
        t.step('use_pred', `Overwrite ${key} with ${node.keys[i]}.`, v({ i, pred }), { hl: hl(node, 'found', pred, 'removed') });
        t.step('recurse_pred', `Now delete ${node.keys[i]} from the left subtree.`, v({ i }), { hl: hl(lc, 'active') });
        return del(t, m, lc, node.keys[i], depth + 1);
      }
      const rc = node.children[i + 1];
      t.step('case_succ', rc.keys.length >= T ? `The right child has ${rc.keys.length} keys: use the successor.` : 'The right child is too thin as well.', v({ i }), { hl: hl(rc, 'visited') });
      if (rc.keys.length >= T) {
        let succ = rc;
        while (!succ.leaf) succ = succ.children[0];
        t.step('find_succ', `The successor is the smallest key in the right subtree: ${succ.keys[0]}.`, v({ i, succ }), { hl: hl(succ, 'active') });
        node.keys[i] = succ.keys[0];
        t.step('use_succ', `Overwrite ${key} with ${node.keys[i]}.`, v({ i, succ }), { hl: hl(node, 'found', succ, 'removed') });
        t.step('recurse_succ', `Now delete ${node.keys[i]} from the right subtree.`, v({ i }), { hl: hl(rc, 'active') });
        return del(t, m, rc, node.keys[i], depth + 1);
      }
      t.step('merge_here', `Both children have only ${T - 1} key: merge them around ${key}.`, v({ i }), { hl: hl(node, 'removed') });
      merge(t, node, i, { key, depth });
      t.step('recurse_merged', `${key} is now inside the merged child: delete it there.`, v({ i }), { hl: hl(node.children[i], 'active') });
      return del(t, m, node.children[i], key, depth + 1);
    }
    t.step('check_missing', node.leaf ? 'This is a leaf, so the key is not in the tree.' : `Descend into child ${i}.`, v({ i }), { hl: hl(node, 'active') });
    if (node.leaf) {
      t.step('not_found', `${key} is not in the tree.`, v({ i }), { ok: false });
      return false;
    }
    const thin = node.children[i].keys.length === T - 1;
    t.step('check_thin', thin ? `Child ${show(node.children[i])} has only ${T - 1} key: top it up before entering, so a deletion there cannot underflow.` : 'The child has enough keys.', v({ i }), { hl: hl(node.children[i], thin ? 'removed' : 'visited') });
    if (thin) {
      t.step('fill', 'Top up the child.', v({ i }), { hl: hl(node.children[i], 'removed') });
      i = fill(t, node, i, { key, depth });
    }
    t.mark(node.id, 'visited');
    t.step('descend', `Descend into ${show(node.children[i])}.`, v({ i }), { hl: hl(node.children[i], 'active') });
    return del(t, m, node.children[i], key, depth + 1);
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
        ['Delete', 'O(log n)', 'O(log n)'],
        ['Split / merge / borrow', 'O(T)', 'O(T)'],
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
      ['33 37 21 57', 'delete', [25]],
      ['1 17 29 5 37 9 25 41 33 53', 'delete', [25]],
      ['53 33 37 1 57 45 29 5', 'delete', [29]],
      ['9 21 37 33 29 57', 'delete', [1]],
      ['57 29 5 17 9 1 41', 'delete', [29]],
      ['45 37 13 17 25 1 21 33 41 53 57 5', 'delete', [17]],
      ['49 57 21 45 41 13 5 25 29 9', 'delete', [41]],
      ['29 5 1 45 33 13 25 9 17', 'delete', [49]],
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
      {
        id: 'delete',
        label: 'delete(key)',
        args: [{ name: 'key', default: 6 }],
        run(t, m, key) {
          t.step('call_root', `Delete ${key}, starting at the root.`, { key }, { hl: hl(m.root, 'active') });
          for (const id in t.marks) t.mark(id);
          const removed = del(t, m, m.root, key, 1);
          for (const id in t.marks) t.mark(id);
          const empty = !m.root.keys.length && !m.root.leaf;
          t.step('check_root', empty ? 'The root lost its last key to a merge.' : 'The root still has keys (or is the only node).', { key, root: m.root }, { hl: hl(m.root, empty ? 'removed' : 'active') });
          if (empty) {
            m.root = m.root.children[0];
            t.step('shrink_root', 'Its only child becomes the root: the tree gets one level shorter. This is the only way a B-tree shrinks.', { key, root: m.root }, { hl: hl(m.root, 'found') });
          }
          t.step('call_root', removed ? `Deleted ${key}.` : `${key} was not in the tree.`, { key }, { ok: removed });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
