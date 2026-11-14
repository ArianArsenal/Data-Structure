/* AVL tree: traced insert mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAX = 31;

  const h = (n) => (n ? n.height : 0);
  const update = (n) => (n.height = 1 + Math.max(h(n.left), h(n.right)));
  const hl = (...p) => {
    const o = {};
    for (let i = 0; i < p.length; i += 2) if (p[i]) o[p[i].id] = p[i + 1];
    return o;
  };
  const mk = (key) => DSV.node({ key, left: null, right: null, height: 1 });
  const count = (n) => (n ? 1 + count(n.left) + count(n.right) : 0);

  // Untraced insert used to build the initial tree.
  function quiet(n, key) {
    if (!n) return mk(key);
    if (key < n.key) n.left = quiet(n.left, key);
    else if (key > n.key) n.right = quiet(n.right, key);
    else return n;
    update(n);
    const b = h(n.left) - h(n.right);
    const rr = (y) => { const x = y.left; y.left = x.right; x.right = y; update(y); update(x); return x; };
    const rl = (x) => { const y = x.right; x.right = y.left; y.left = x; update(x); update(y); return y; };
    if (b > 1 && key < n.left.key) return rr(n);
    if (b < -1 && key > n.right.key) return rl(n);
    if (b > 1) { n.left = rl(n.left); return rr(n); }
    if (b < -1) { n.right = rr(n.right); return rl(n); }
    return n;
  }

  function rotateRight(t0, y, base) {
    // Frames belong to the insert region, where the rotations are written.
    const t = { step: (id, msg, v, o) => t0.step(id, msg, v, Object.assign({ op: 'insert' }, o)) };
    const x = y.left;
    const v = () => Object.assign({}, base, { y, x });
    t.step('rotr_pick', `Rotate right around ${y.key}: its left child ${x.key} will rise.`, v(), { hl: hl(y, 'active', x, 'new') });
    y.left = x.right;
    t.step('rotr_move', `${x.key}'s right subtree (${x.right ? x.right.key : 'empty'}) becomes ${y.key}'s left subtree.`, v(), { hl: hl(y, 'active', x, 'new') });
    x.right = y;
    t.step('rotr_link', `${y.key} becomes the right child of ${x.key}.`, v(), { hl: hl(y, 'active', x, 'new') });
    update(y);
    update(x);
    t.step('rotr_heights', `Recompute heights: ${y.key} → ${y.height}, ${x.key} → ${x.height}.`, v(), { hl: hl(y, 'active', x, 'new') });
    t.step('rotr_return', `Return ${x.key} as the new root of this subtree.`, v(), { hl: hl(x, 'found') });
    return x;
  }

  function rotateLeft(t0, x, base) {
    // Frames belong to the insert region, where the rotations are written.
    const t = { step: (id, msg, v, o) => t0.step(id, msg, v, Object.assign({ op: 'insert' }, o)) };
    const y = x.right;
    const v = () => Object.assign({}, base, { x, y });
    t.step('rotl_pick', `Rotate left around ${x.key}: its right child ${y.key} will rise.`, v(), { hl: hl(x, 'active', y, 'new') });
    x.right = y.left;
    t.step('rotl_move', `${y.key}'s left subtree (${y.left ? y.left.key : 'empty'}) becomes ${x.key}'s right subtree.`, v(), { hl: hl(x, 'active', y, 'new') });
    y.left = x;
    t.step('rotl_link', `${x.key} becomes the left child of ${y.key}.`, v(), { hl: hl(x, 'active', y, 'new') });
    update(x);
    update(y);
    t.step('rotl_heights', `Recompute heights: ${x.key} → ${x.height}, ${y.key} → ${y.height}.`, v(), { hl: hl(x, 'active', y, 'new') });
    t.step('rotl_return', `Return ${y.key} as the new root of this subtree.`, v(), { hl: hl(y, 'found') });
    return y;
  }

  DSV.register({
    id: 'avl-tree',
    title: 'AVL Tree',
    layout: 'binaryTree',
    about:
      'A self-balancing BST. After every insert or delete, each node on the way back up recomputes its height and balance factor (left height − right height). When the balance reaches ±2, one or two rotations restore it, so the height stays O(log n) no matter the insertion order.',
    init: { default: '30, 20, 40, 10, 25', max: MAX, random: [8, 1, 99] },
    complexity: {
      rows: [
        ['Insert', 'O(log n)', 'O(log n)'],
        ['Search', 'O(log n)', 'O(log n)'],
        ['Delete', 'O(log n)', 'O(log n)'],
        ['Rotation', 'O(1)', 'O(1)'],
      ],
      space: 'O(n)',
      notes: 'The small number beside each node is its height. Try inserting 5 into the default tree (left-left case), or 27 (left-right case). Then build "10 20 30 40 50" and compare with the BST page.',
    },

    create(keys) {
      let r = null;
      for (const k of keys) r = quiet(r, k);
      return { model: { root: r }, msg: `Inserted ${count(r)} keys; the tree stayed balanced.` };
    },

    snapshot(m, vars) {
      const nodes = {};
      const visit = (n) => {
        if (!n || nodes[n.id]) return;
        nodes[n.id] = { id: n.id, key: n.key, left: n.left ? n.left.id : null, right: n.right ? n.right.id : null, sub: 'h' + n.height };
        visit(n.left);
        visit(n.right);
      };
      visit(m.root);
      for (const k in vars) if (DSV.isNode(vars[k])) visit(vars[k]);
      return { root: m.root ? m.root.id : null, nodes };
    },

    scenarios: [
      ['30 20 40 10 25', 'insert', [5]],
      ['30 20 40 10 25', 'insert', [27]],
      ['20 10 30 25 40', 'insert', [50]],
      ['20 10 30 25 40', 'insert', [22]],
      ['20 10 30', 'insert', [20]],
      ['20 10 30', 'insert', [5]],
      ['30 20 40 10 25 50', 'delete', [40]],
      ['30 20 40 10 25 50', 'delete', [10]],
      ['30 20 40 10 25 35 50 5', 'delete', [30]],
      ['20 10 30 25', 'delete', [10]],
      ['20 10 30 15', 'delete', [30]],
      ['20 10 30', 'delete', [99]],
    ],

    ops: [
      {
        id: 'insert',
        label: 'insert(key)',
        args: [{ name: 'key', default: 5 }],
        check: (m) => (count(m.root) >= MAX ? `This demo is limited to ${MAX} nodes.` : null),
        run(t, m, key) {
          t.step('call_root', 'Insert recursively from the root; rebalancing happens on the way back up.', { key });
          const ins = (node, depth) => {
            const v = (x) => Object.assign({ key, node, depth }, x);
            t.step('check_null', node ? `depth ${depth}: at ${node.key}.` : `depth ${depth}: empty spot.`, v(), { hl: hl(node, 'active') });
            if (!node) {
              const n = mk(key);
              t.step('create', `Create node ${key} (height 1) and return it to the parent.`, v({ node: n }), { hl: hl(n, 'new') });
              return n;
            }
            const less = key < node.key;
            t.step('cmp_less', `Is ${key} < ${node.key}? ${less ? 'Yes.' : 'No.'}`, v(), { hl: hl(node, 'active') });
            if (less) {
              t.step('recurse_left', `Recurse into ${node.key}'s left subtree.`, v(), { hl: hl(node, 'active') });
              t.mark(node.id, 'visited');
              node.left = ins(node.left, depth + 1);
              t.mark(node.id);
              t.step('recurse_left', `Back at ${node.key}: link the returned subtree as its left child.`, v(), { hl: hl(node, 'active') });
            } else {
              const greater = key > node.key;
              t.step('cmp_greater', `Is ${key} > ${node.key}? ${greater ? 'Yes.' : 'No: equal.'}`, v(), { hl: hl(node, 'active') });
              if (!greater) {
                t.step('duplicate', `${key} already exists; return the node unchanged.`, v(), { hl: hl(node, 'removed'), ok: false });
                return node;
              }
              t.step('recurse_right', `Recurse into ${node.key}'s right subtree.`, v(), { hl: hl(node, 'active') });
              t.mark(node.id, 'visited');
              node.right = ins(node.right, depth + 1);
              t.mark(node.id);
              t.step('recurse_right', `Back at ${node.key}: link the returned subtree as its right child.`, v(), { hl: hl(node, 'active') });
            }
            update(node);
            t.step('update_height', `height(${node.key}) = 1 + max(${h(node.left)}, ${h(node.right)}) = ${node.height}.`, v(), { hl: hl(node, 'active') });
            const balance = h(node.left) - h(node.right);
            const bad = Math.abs(balance) > 1;
            t.step('balance', `balance = ${h(node.left)} − ${h(node.right)} = ${balance}. ${bad ? 'Unbalanced!' : 'OK (between -1 and 1).'}`, v({ balance }), { hl: hl(node, bad ? 'removed' : 'active') });
            const vb = (x) => v(Object.assign({ balance }, x));
            const ll = balance > 1 && key < node.left.key;
            t.step('case_ll', ll ? 'Left-Left case: one right rotation fixes it.' : 'Not the left-left case.', vb(), { hl: hl(node, bad ? 'removed' : 'active') });
            if (ll) {
              t.step('fix_ll', 'Rotate right.', vb(), { hl: hl(node, 'removed') });
              return rotateRight(t, node, { key, depth });
            }
            const rr = balance < -1 && key > node.right.key;
            t.step('case_rr', rr ? 'Right-Right case: one left rotation fixes it.' : 'Not the right-right case.', vb(), { hl: hl(node, bad ? 'removed' : 'active') });
            if (rr) {
              t.step('fix_rr', 'Rotate left.', vb(), { hl: hl(node, 'removed') });
              return rotateLeft(t, node, { key, depth });
            }
            t.step('case_lr', balance > 1 ? 'Left-Right case: rotate the left child left, then this node right.' : 'Not the left-right case.', vb(), { hl: hl(node, bad ? 'removed' : 'active') });
            if (balance > 1) {
              t.step('fix_lr', `First rotate ${node.left.key} left.`, vb(), { hl: hl(node, 'removed') });
              node.left = rotateLeft(t, node.left, { key, depth });
              t.step('fix_lr_2', `Now rotate ${node.key} right.`, vb(), { hl: hl(node, 'removed') });
              return rotateRight(t, node, { key, depth });
            }
            t.step('case_rl', balance < -1 ? 'Right-Left case: rotate the right child right, then this node left.' : 'Not the right-left case.', vb(), { hl: hl(node, 'active') });
            if (balance < -1) {
              t.step('fix_rl', `First rotate ${node.right.key} right.`, vb(), { hl: hl(node, 'removed') });
              node.right = rotateRight(t, node.right, { key, depth });
              t.step('fix_rl_2', `Now rotate ${node.key} left.`, vb(), { hl: hl(node, 'removed') });
              return rotateLeft(t, node, { key, depth });
            }
            t.step('return_node', `Return ${node.key} unchanged.`, vb(), { hl: hl(node, 'active') });
            return node;
          };
          m.root = ins(m.root, 1);
          t.step('call_root', `root = returned subtree (${m.root.key}). Done.`, { key }, { ok: true });
        },
      },
      {
        id: 'delete',
        label: 'delete(key)',
        args: [{ name: 'key', default: 40 }],
        run(t, m, key) {
          let removed = false;
          t.step('call_root', 'Delete recursively; every node on the way back up is rebalanced.', { key });
          const rebalance = (node, base) => {
            const v = (x) => Object.assign({}, base, { node }, x);
            update(node);
            t.step('rb_height', `height(${node.key}) = ${node.height}.`, v(), { hl: hl(node, 'active') });
            const balance = h(node.left) - h(node.right);
            const bad = Math.abs(balance) > 1;
            t.step('rb_balance', `balance = ${h(node.left)} − ${h(node.right)} = ${balance}. ${bad ? 'Unbalanced!' : 'OK.'}`, v({ balance }), { hl: hl(node, bad ? 'removed' : 'active') });
            t.step('rb_left_heavy', balance > 1 ? 'Left-heavy.' : 'Not left-heavy.', v({ balance }), { hl: hl(node, bad ? 'removed' : 'active') });
            if (balance > 1) {
              const lr = h(node.left.left) < h(node.left.right);
              t.step('rb_check_lr', lr ? `The left child leans right (left-right case): rotate it first.` : 'The left child does not lean right (left-left case).', v({ balance }), { hl: hl(node, 'removed', node.left, 'active') });
              if (lr) {
                t.step('rb_fix_lr', `Rotate ${node.left.key} left.`, v({ balance }), { hl: hl(node, 'removed') });
                node.left = rotateLeft(t, node.left, base);
              }
              t.step('rb_rotate_right', `Rotate ${node.key} right.`, v({ balance }), { hl: hl(node, 'removed') });
              return rotateRight(t, node, base);
            }
            t.step('rb_right_heavy', balance < -1 ? 'Right-heavy.' : 'Not right-heavy.', v({ balance }), { hl: hl(node, bad ? 'removed' : 'active') });
            if (balance < -1) {
              const rl = h(node.right.right) < h(node.right.left);
              t.step('rb_check_rl', rl ? `The right child leans left (right-left case): rotate it first.` : 'The right child does not lean left (right-right case).', v({ balance }), { hl: hl(node, 'removed', node.right, 'active') });
              if (rl) {
                t.step('rb_fix_rl', `Rotate ${node.right.key} right.`, v({ balance }), { hl: hl(node, 'removed') });
                node.right = rotateRight(t, node.right, base);
              }
              t.step('rb_rotate_left', `Rotate ${node.key} left.`, v({ balance }), { hl: hl(node, 'removed') });
              return rotateLeft(t, node, base);
            }
            t.step('rb_done', `${node.key} is balanced: return it.`, v({ balance }), { hl: hl(node, 'active') });
            return node;
          };
          const del = (node, key, depth) => {
            const v = (x) => Object.assign({ key, node, depth }, x);
            t.step('check_null', node ? `depth ${depth}: at ${node.key}.` : `depth ${depth}: empty subtree.`, v(), { hl: hl(node, 'active') });
            if (!node) {
              t.step('not_found', `${key} is not in the tree.`, v(), { ok: false });
              return null;
            }
            const less = key < node.key;
            t.step('cmp_less', `Is ${key} < ${node.key}? ${less ? 'Yes.' : 'No.'}`, v(), { hl: hl(node, 'active') });
            if (less) {
              t.step('recurse_left', `Recurse into the left subtree of ${node.key}.`, v(), { hl: hl(node, 'active') });
              t.mark(node.id, 'visited');
              node.left = del(node.left, key, depth + 1);
              t.mark(node.id);
              t.step('recurse_left', `Back at ${node.key}: link the returned subtree.`, v(), { hl: hl(node, 'active') });
            } else {
              const greater = key > node.key;
              t.step('cmp_greater', `Is ${key} > ${node.key}? ${greater ? 'Yes.' : 'No: this is the node to delete.'}`, v(), { hl: hl(node, greater ? 'active' : 'removed') });
              if (greater) {
                t.step('recurse_right', `Recurse into the right subtree of ${node.key}.`, v(), { hl: hl(node, 'active') });
                t.mark(node.id, 'visited');
                node.right = del(node.right, key, depth + 1);
                t.mark(node.id);
                t.step('recurse_right', `Back at ${node.key}: link the returned subtree.`, v(), { hl: hl(node, 'active') });
              } else {
                const one = !node.left || !node.right;
                t.step('check_children', one ? `${node.key} has at most one child.` : `${node.key} has two children.`, v(), { hl: hl(node, 'removed') });
                if (one) {
                  removed = true;
                  const child = node.left || node.right;
                  t.step('return_child', `Replace ${node.key} with ${child ? child.key : 'nothing'}.`, v(), { hl: hl(node, 'removed', child, 'found') });
                  return child;
                }
                let succ = node.right;
                t.step('succ_start', 'Find the in-order successor: the leftmost node of the right subtree.', v({ succ }), { hl: hl(node, 'removed', succ, 'active') });
                for (;;) {
                  t.step('succ_loop', succ.left ? `${succ.key} has a left child: keep going.` : `${succ.key} is the successor.`, v({ succ }), { hl: hl(node, 'removed', succ, 'active') });
                  if (!succ.left) break;
                  succ = succ.left;
                }
                const old = node.key;
                node.key = succ.key;
                t.step('copy_key', `Copy ${succ.key} over ${old}; now delete ${succ.key} from the right subtree.`, v({ succ }), { hl: hl(node, 'found', succ, 'removed') });
                const sk = succ.key;
                t.step('recurse_succ', `Recurse right to delete ${sk}.`, v(), { hl: hl(node, 'found') });
                t.mark(node.id, 'visited');
                node.right = del(node.right, sk, depth + 1);
                t.mark(node.id);
                t.step('recurse_succ', `Back at ${node.key}.`, v(), { hl: hl(node, 'found') });
              }
            }
            t.step('rebalance', `Rebalance ${node.key} before returning it.`, v(), { hl: hl(node, 'active') });
            return rebalance(node, { key, depth });
          };
          m.root = del(m.root, key, 1);
          t.step('call_root', removed ? `root = ${m.root ? m.root.key : '%null%'}. ${key} is deleted and the tree is balanced.` : `${key} was not found.`, { key }, { ok: removed });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
