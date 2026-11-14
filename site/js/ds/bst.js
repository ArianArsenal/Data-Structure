/* Binary search tree: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAX = 31;

  const hl = (...pairs) => {
    const o = {};
    for (let i = 0; i < pairs.length; i += 2) if (pairs[i]) o[pairs[i].id] = pairs[i + 1];
    return o;
  };
  const name = (n) => (n ? `node ${n.key}` : '%null%');

  function count(n) {
    return n ? 1 + count(n.left) + count(n.right) : 0;
  }

  function insertQuiet(m, key) {
    if (!m.root) return (m.root = DSV.node({ key, left: null, right: null }));
    for (let c = m.root; ; ) {
      if (key === c.key) return null;
      const side = key < c.key ? 'left' : 'right';
      if (!c[side]) return (c[side] = DSV.node({ key, left: null, right: null }));
      c = c[side];
    }
  }

  DSV.register({
    id: 'bst',
    title: 'Binary Search Tree',
    layout: 'binaryTree',
    about:
      'Every node’s left subtree holds smaller keys and its right subtree holds larger keys, so each comparison discards one side. Operations cost O(height): about log n when the tree is balanced, but n for a degenerate (sorted-insert) tree.',
    init: { default: '50, 30, 70, 20, 40, 60, 80', max: MAX, random: [9, 1, 99] },
    complexity: {
      rows: [
        ['Insert', 'O(log n)', 'O(n)'],
        ['Search', 'O(log n)', 'O(n)'],
        ['Delete', 'O(log n)', 'O(n)'],
        ['In-order traversal', 'O(n)', 'O(n)'],
        ['Minimum / maximum', 'O(log n)', 'O(n)'],
        ['Successor', 'O(log n)', 'O(n)'],
      ],
      space: 'O(n), plus O(h) recursion stack',
      notes: 'Insert 10, 20, 30, 40, 50 in order to see the worst case: the tree degenerates into a list. AVL and red-black trees fix this by rebalancing.',
    },

    create(keys) {
      const m = { root: null };
      let dup = 0;
      for (const k of keys) if (!insertQuiet(m, k)) dup++;
      const msg = keys.length
        ? `Inserted ${keys.length - dup} keys in the given order${dup ? ` (${dup} duplicate${dup > 1 ? 's' : ''} skipped)` : ''}. Choose an operation and press Run.`
        : 'Empty tree (root is %null%). Choose an operation and press Run.';
      return { model: m, msg };
    },

    snapshot(m, vars) {
      const nodes = {};
      const visit = (n) => {
        if (!n || nodes[n.id]) return;
        nodes[n.id] = { id: n.id, key: n.key, left: n.left ? n.left.id : null, right: n.right ? n.right.id : null };
        visit(n.left);
        visit(n.right);
      };
      visit(m.root);
      for (const k in vars) if (DSV.isNode(vars[k])) visit(vars[k]);
      return { root: m.root ? m.root.id : null, nodes };
    },

    scenarios: [
      ['50 30 70', 'insert', [20]],
      ['50 30 70', 'insert', [80]],
      ['50 30 70', 'insert', [30]],
      ['', 'insert', [5]],
      ['50 30 70 20', 'search', [20]],
      ['50 30 70 20', 'search', [75]],
      ['50 30 70 20 40 60 80', 'delete', [50]],
      ['50 30 70 20', 'delete', [30]],
      ['50 30 70 80', 'delete', [70]],
      ['50 30 70', 'delete', [99]],
      ['50 30 70', 'inorder', []],
      ['50 30 70 20', 'minimum', []],
      ['', 'minimum', []],
      ['50 30 70 80', 'maximum', []],
      ['', 'maximum', []],
      ['50 30 70 20 40', 'successor', [40]],
      ['50 30 70', 'successor', [70]],
    ],

    ops: [
      {
        id: 'insert',
        label: 'insert(key)',
        args: [{ name: 'key', default: 65 }],
        check: (m) => (count(m.root) >= MAX ? `This demo is limited to ${MAX} nodes.` : null),
        run(t, m, key) {
          t.step('check_empty', m.root ? 'Is root %null%? No.' : 'Is root %null%? Yes, the tree is empty.', { key });
          if (!m.root) {
            m.root = DSV.node({ key, left: null, right: null });
            t.step('set_root', `The new node ${key} becomes the root.`, { key }, { hl: hl(m.root, 'found'), ok: true });
            return;
          }
          let curr = m.root;
          t.step('start', 'Start at the root.', { key, curr }, { hl: hl(curr, 'active') });
          for (;;) {
            const less = key < curr.key;
            t.step('cmp_less', `Is ${key} < ${curr.key}? ${less ? 'Yes: go left.' : 'No.'}`, { key, curr }, { hl: hl(curr, 'active') });
            if (less) {
              t.step('check_left', curr.left ? `curr has a left child (${curr.left.key}).` : 'curr.left is %null%: free spot found.', { key, curr }, { hl: hl(curr, 'active') });
              if (!curr.left) {
                curr.left = DSV.node({ key, left: null, right: null });
                t.step('attach_left', `Attach ${key} as the left child of ${curr.key}.`, { key, curr }, { hl: hl(curr.left, 'found'), ok: true });
                return;
              }
              t.mark(curr.id, 'visited');
              curr = curr.left;
              t.step('go_left', `Move left to ${name(curr)}.`, { key, curr }, { hl: hl(curr, 'active') });
              continue;
            }
            const greater = key > curr.key;
            t.step('cmp_greater', `Is ${key} > ${curr.key}? ${greater ? 'Yes: go right.' : 'No.'}`, { key, curr }, { hl: hl(curr, 'active') });
            if (greater) {
              t.step('check_right', curr.right ? `curr has a right child (${curr.right.key}).` : 'curr.right is %null%: free spot found.', { key, curr }, { hl: hl(curr, 'active') });
              if (!curr.right) {
                curr.right = DSV.node({ key, left: null, right: null });
                t.step('attach_right', `Attach ${key} as the right child of ${curr.key}.`, { key, curr }, { hl: hl(curr.right, 'found'), ok: true });
                return;
              }
              t.mark(curr.id, 'visited');
              curr = curr.right;
              t.step('go_right', `Move right to ${name(curr)}.`, { key, curr }, { hl: hl(curr, 'active') });
              continue;
            }
            t.step('duplicate', `${key} is already in the tree; return %false%.`, { key, curr }, { hl: hl(curr, 'removed'), ok: false });
            return;
          }
        },
      },
      {
        id: 'search',
        label: 'search(key)',
        args: [{ name: 'key', default: 60 }],
        run(t, m, key) {
          let curr = m.root;
          t.step('start', 'Start at the root.', { key, curr }, { hl: hl(curr, 'active') });
          for (;;) {
            t.step('loop', curr ? `curr is ${name(curr)}.` : 'curr is %null%: fell off the tree.', { key, curr }, { hl: hl(curr, 'active') });
            if (!curr) break;
            const eq = key === curr.key;
            t.step('cmp_equal', `Is ${key} == ${curr.key}? ${eq ? 'Yes!' : 'No.'}`, { key, curr }, { hl: hl(curr, eq ? 'found' : 'active') });
            if (eq) {
              t.step('found', `Found ${key}; return %true%.`, { key, curr }, { hl: hl(curr, 'found'), ok: true });
              return;
            }
            const less = key < curr.key;
            t.step('cmp_less', `Is ${key} < ${curr.key}? ${less ? 'Yes: go left.' : 'No: go right.'}`, { key, curr }, { hl: hl(curr, 'active') });
            t.mark(curr.id, 'visited');
            curr = less ? curr.left : curr.right;
            t.step(less ? 'go_left' : 'go_right', `Move ${less ? 'left' : 'right'} to ${name(curr)}.`, { key, curr }, { hl: hl(curr, 'active') });
          }
          t.step('not_found', `${key} is not in the tree; return %false%.`, { key, curr }, { ok: false });
        },
      },
      {
        id: 'delete',
        label: 'delete(key)',
        args: [{ name: 'key', default: 30 }],
        run(t, m, key) {
          let removed = false;
          t.step('call_root', `Call the recursive delete on the root; whatever it returns becomes the new root.`, { key });

          const del = (node, key, depth) => {
            const v = (extra) => Object.assign({ key, node, depth }, extra);
            t.step('check_null', node ? `depth ${depth}: node is ${node.key}.` : `depth ${depth}: node is %null%.`, v(), { hl: hl(node, 'active') });
            if (!node) {
              t.step('not_found', `Empty subtree: ${key} is not here. Return %null%.`, v(), { ok: false });
              return null;
            }
            const less = key < node.key;
            t.step('cmp_less', `Is ${key} < ${node.key}? ${less ? 'Yes.' : 'No.'}`, v(), { hl: hl(node, 'active') });
            if (less) {
              t.step('recurse_left', `Recurse into the left subtree of ${node.key}.`, v(), { hl: hl(node, 'active') });
              t.mark(node.id, 'visited');
              node.left = del(node.left, key, depth + 1);
              t.mark(node.id);
              t.step('recurse_left', `Back at ${node.key}: store the returned subtree as its left child.`, v(), { hl: hl(node, 'active') });
            } else {
              const greater = key > node.key;
              t.step('cmp_greater', `Is ${key} > ${node.key}? ${greater ? 'Yes.' : 'No, so this is the node to delete.'}`, v(), { hl: hl(node, greater ? 'active' : 'removed') });
              if (greater) {
                t.step('recurse_right', `Recurse into the right subtree of ${node.key}.`, v(), { hl: hl(node, 'active') });
                t.mark(node.id, 'visited');
                node.right = del(node.right, key, depth + 1);
                t.mark(node.id);
                t.step('recurse_right', `Back at ${node.key}: store the returned subtree as its right child.`, v(), { hl: hl(node, 'active') });
              } else {
                t.step('check_left', node.left ? `${node.key} has a left child.` : `${node.key} has no left child.`, v(), { hl: hl(node, 'removed') });
                if (!node.left) {
                  removed = true;
                  t.step('return_right', `Replace ${node.key} with its right subtree (${name(node.right)}): return it to the parent.`, v(), { hl: hl(node, 'removed', node.right, 'found') });
                  return node.right;
                }
                t.step('check_right', node.right ? `${node.key} has a right child too.` : `${node.key} has no right child.`, v(), { hl: hl(node, 'removed') });
                if (!node.right) {
                  removed = true;
                  t.step('return_left', `Replace ${node.key} with its left subtree (${name(node.left)}): return it to the parent.`, v(), { hl: hl(node, 'removed', node.left, 'found') });
                  return node.left;
                }
                let succ = node.right;
                t.step('succ_start', `Two children: find the in-order successor, the smallest key in the right subtree.`, v({ succ }), { hl: hl(node, 'removed', succ, 'active') });
                for (;;) {
                  t.step('succ_loop', succ.left ? `succ (${succ.key}) has a left child, so go left.` : `succ (${succ.key}) has no left child: it is the minimum.`, v({ succ }), { hl: hl(node, 'removed', succ, 'active') });
                  if (!succ.left) break;
                  succ = succ.left;
                  t.step('succ_advance', `succ moves to ${succ.key}.`, v({ succ }), { hl: hl(node, 'removed', succ, 'active') });
                }
                const old = node.key;
                node.key = succ.key;
                t.step('copy_key', `Copy ${succ.key} into the node that held ${old}. Now remove the duplicate ${succ.key} from the right subtree.`, v({ succ }), { hl: hl(node, 'found', succ, 'removed') });
                const sk = succ.key;
                t.step('recurse_succ', `Recurse into the right subtree to delete ${sk}.`, v({ succ }), { hl: hl(node, 'found') });
                t.mark(node.id, 'visited');
                node.right = del(node.right, sk, depth + 1);
                t.mark(node.id);
                t.step('recurse_succ', `Back at ${node.key}: store the returned subtree as its right child.`, v(), { hl: hl(node, 'found') });
              }
            }
            t.step('return_node', `Return ${node.key} to the caller.`, v(), { hl: hl(node, 'active') });
            return node;
          };

          m.root = del(m.root, key, 1);
          t.step('call_root', removed ? `root = returned subtree. ${key} has been deleted.` : `root is unchanged: ${key} was not found.`, { key }, { ok: removed });
        },
      },
      {
        id: 'inorder',
        label: 'inorder()',
        args: [],
        run(t, m) {
          const result = [];
          t.step('init', 'Start with an empty result list.', { result });
          t.step('call_root', 'Visit the whole tree starting at the root: left subtree, node, right subtree.', { result });
          const visit = (node, depth) => {
            const v = () => ({ node, result: result.slice(), depth });
            t.step('check_null', node ? `depth ${depth}: node is ${node.key}.` : `depth ${depth}: node is %null%.`, v(), { hl: hl(node, 'active') });
            if (!node) {
              t.step('return_null', 'Empty subtree: return.', v());
              return;
            }
            t.step('go_left', `Visit ${node.key}'s left subtree first.`, v(), { hl: hl(node, 'active') });
            visit(node.left, depth + 1);
            result.push(node.key);
            t.mark(node.id, 'visited');
            t.step('visit', `Append ${node.key}. result = [${result.join(', ')}]`, v(), { hl: hl(node, 'found') });
            t.step('go_right', `Now visit ${node.key}'s right subtree.`, v(), { hl: hl(node, 'active') });
            visit(node.right, depth + 1);
          };
          visit(m.root, 1);
          t.step('done', `In-order traversal: [${result.join(', ')}]. A BST always yields its keys in sorted order.`, { result }, { ok: true });
        },
      },
      extreme('minimum', 'left'),
      extreme('maximum', 'right'),
      {
        id: 'successor',
        label: 'successor(key)',
        args: [{ name: 'key', default: 40 }],
        run(t, m, key) {
          let succ = null;
          let curr = m.root;
          const v = () => ({ key, succ, curr });
          t.step('start', `Find the smallest key greater than ${key}. succ = %null%; start at the root.`, v(), { hl: hl(curr, 'active') });
          for (;;) {
            t.step('loop', curr ? `curr is ${curr.key}.` : 'Fell off the tree.', v(), { hl: hl(curr, 'active', succ, 'found') });
            if (!curr) break;
            const less = key < curr.key;
            t.step(
              'compare',
              `Is ${key} < ${curr.key}? ${less ? `Yes: ${curr.key} is a candidate, but a smaller one may be to the left.` : 'No: the successor must be to the right.'}`,
              v(),
              { hl: hl(curr, 'active', succ, 'found') }
            );
            t.mark(curr.id, 'visited');
            if (less) {
              succ = curr;
              t.step('remember', `succ = ${succ.key}.`, v(), { hl: hl(succ, 'found') });
              curr = curr.left;
              t.step('go_left', `Go left to ${name(curr)}.`, v(), { hl: hl(curr, 'active', succ, 'found') });
            } else {
              curr = curr.right;
              t.step('go_right', `Go right to ${name(curr)}.`, v(), { hl: hl(curr, 'active', succ, 'found') });
            }
          }
          t.step('done', succ ? `The successor of ${key} is ${succ.key}.` : `Nothing in the tree is greater than ${key}: return %null%.`, v(), { hl: hl(succ, 'found'), ok: !!succ });
        },
      },
    ],
  });

  // minimum walks left, maximum walks right; otherwise identical.
  function extreme(id, side) {
    return {
      id,
      label: `${id}()`,
      args: [],
      run(t, m) {
        t.step('check_empty', m.root ? 'The tree is not empty.' : 'The tree is empty.', {});
        if (!m.root) return t.step('empty', 'Return %null%.', {}, { ok: false });
        let curr = m.root;
        t.step('start', `Start at the root and keep going ${side}.`, { curr }, { hl: hl(curr, 'active') });
        for (;;) {
          const next = curr[side];
          t.step('loop', next ? `${curr.key} has a ${side} child.` : `${curr.key} has no ${side} child, so it is the ${id}.`, { curr }, { hl: hl(curr, next ? 'active' : 'found') });
          if (!next) break;
          t.mark(curr.id, 'visited');
          curr = next;
          t.step(side === 'left' ? 'go_left' : 'go_right', `Go ${side} to ${curr.key}.`, { curr }, { hl: hl(curr, 'active') });
        }
        t.step('done', `The ${id} is ${curr.key}.`, { curr }, { hl: hl(curr, 'found'), ok: true });
      },
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
