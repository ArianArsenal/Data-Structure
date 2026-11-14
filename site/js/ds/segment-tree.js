/* Segment tree (range sum): traced query / update mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const id = (node) => 's' + node;

  function build(tree, values, node, lo, hi) {
    if (lo === hi) return (tree[node] = values[lo]);
    const mid = (lo + hi) >> 1;
    return (tree[node] = build(tree, values, 2 * node, lo, mid) + build(tree, values, 2 * node + 1, mid + 1, hi));
  }

  DSV.register({
    id: 'segment-tree',
    title: 'Segment Tree',
    about:
      'A binary tree over an array where each node stores the sum of one range. The root covers everything and each child covers half its parent. Any range [l, r] splits into O(log n) whole nodes, so range queries and point updates are both O(log n).',
    init: { default: '5, 8, 6, 3, 2, 7, 2, 6', max: 12, random: [8, 1, 9] },
    complexity: {
      rows: [
        ['Build', 'O(n)', 'O(n)'],
        ['Range query', 'O(log n)', 'O(log n)'],
        ['Point update', 'O(log n)', 'O(log n)'],
      ],
      space: 'O(n), using a 4n array',
      notes: 'Each box shows the sum of its range [lo, hi]. In a query, green nodes lie fully inside [l, r] and are used whole; dashed nodes lie fully outside and are skipped.',
    },

    create(values) {
      if (!values.length) values = [0];
      const tree = Array(4 * values.length).fill(0);
      build(tree, values, 1, 0, values.length - 1);
      return { model: { n: values.length, tree }, msg: `Built the tree over ${values.length} values; the root holds the total, ${tree[1]}.` };
    },
    snapshot: (m) => ({ n: m.n, tree: m.tree.slice() }),

    layout(frame) {
      const st = frame.state;
      const range = {};
      const walk = (node, lo, hi) => {
        range[node] = [lo, hi];
        if (lo === hi) return;
        const mid = (lo + hi) >> 1;
        walk(2 * node, lo, mid);
        walk(2 * node + 1, mid + 1, hi);
      };
      walk(1, 0, st.n - 1);
      const kids = (k) => {
        const [lo, hi] = range[k];
        return lo === hi ? [] : [2 * k, 2 * k + 1];
      };
      const pos = DSV.tidy([1], kids, { dx: 64, dy: 84 });
      const nodes = [];
      const edges = [];
      for (const k in range) {
        const [lo, hi] = range[k];
        nodes.push({ id: id(k), x: pos[k].x, y: pos[k].y, shape: 'box', w: 52, h: 34, text: st.tree[k], sub: lo === hi ? `[${lo}]` : `[${lo},${hi}]`, cls: frame.hl[id(k)] });
        for (const c of kids(+k)) edges.push({ from: id(k), to: id(c), kind: 'tree' });
      }
      return { nodes, edges, pointers: [] };
    },

    scenarios: [
      ['5 8 6 3 2 7 2 6', 'query', [2, 5]],
      ['5 8 6 3 2 7 2 6', 'query', [0, 7]],
      ['5 8 6 3 2 7 2 6', 'update', [3, 10]],
      ['5 8 6 3 2 7 2 6', 'update', [6, 1]],
    ],

    ops: [
      {
        id: 'query',
        label: 'query(l, r)',
        args: [
          { name: 'l', default: 2 },
          { name: 'r', default: 5 },
        ],
        check: (m, l, r) => (l < 0 || r >= m.n || l > r ? `Need 0 ≤ l ≤ r ≤ ${m.n - 1}.` : null),
        run(t, m, l, r) {
          t.step('call_root', `Sum of [${l}, ${r}]: start at the root, which covers [0, ${m.n - 1}].`, { l, r });
          const q = (node, lo, hi, depth) => {
            const v = (x) => Object.assign({ node, lo, hi, l, r, depth }, x);
            const me = id(node);
            const out = r < lo || hi < l;
            t.step('check_disjoint', out ? `[${lo}, ${hi}] does not overlap [${l}, ${r}].` : `[${lo}, ${hi}] overlaps [${l}, ${r}].`, v(), { hl: { [me]: 'active' } });
            if (out) {
              t.mark(me, 'ghost');
              t.step('disjoint', 'Contributes 0.', v(), {});
              return 0;
            }
            const inside = l <= lo && hi <= r;
            t.step('check_inside', inside ? `[${lo}, ${hi}] is fully inside: use its sum, ${m.tree[node]}, without going deeper.` : 'Only a partial overlap.', v(), { hl: { [me]: inside ? 'found' : 'active' } });
            if (inside) {
              t.mark(me, 'found');
              t.step('inside', `Return ${m.tree[node]}.`, v(), {});
              return m.tree[node];
            }
            const mid = (lo + hi) >> 1;
            t.mark(me, 'visited');
            t.step('split', `Split at mid = ${mid}.`, v({ mid }), { hl: { [me]: 'active' } });
            t.step('go_left', `Ask the left child [${lo}, ${mid}].`, v({ mid }), { hl: { [me]: 'active' } });
            const left = q(2 * node, lo, mid, depth + 1);
            t.step('go_right', `Left part gave ${left}. Ask the right child [${mid + 1}, ${hi}].`, v({ mid, left }), { hl: { [me]: 'active' } });
            const right = q(2 * node + 1, mid + 1, hi, depth + 1);
            t.step('combine', `Back at [${lo}, ${hi}]: ${left} + ${right} = ${left + right}.`, v({ mid, left, right }), { hl: { [me]: 'active' } });
            return left + right;
          };
          const total = q(1, 0, m.n - 1, 1);
          t.step('call_root', `sum[${l}..${r}] = ${total}.`, { l, r, result: total }, { ok: true });
        },
      },
      {
        id: 'update',
        label: 'update(i, value)',
        args: [
          { name: 'i', default: 3 },
          { name: 'value', default: 10 },
        ],
        check: (m, i) => (i < 0 || i >= m.n ? `Need 0 ≤ i ≤ ${m.n - 1}.` : null),
        run(t, m, i, value) {
          t.step('call_root', `Set element ${i} to ${value}: walk down to its leaf, then fix the sums on the way back up.`, { i, value });
          const u = (node, lo, hi, depth) => {
            const v = (x) => Object.assign({ node, lo, hi, i, value, depth }, x);
            const me = id(node);
            t.step('check_leaf', lo === hi ? `Reached leaf [${lo}].` : `[${lo}, ${hi}] is not a leaf.`, v(), { hl: { [me]: 'active' } });
            if (lo === hi) {
              m.tree[node] = value;
              t.step('set_leaf', `The leaf now holds ${value}.`, v(), { hl: { [me]: 'new' } });
              return;
            }
            const mid = (lo + hi) >> 1;
            t.step('split', `mid = ${mid}.`, v({ mid }), { hl: { [me]: 'active' } });
            const left = i <= mid;
            t.step('pick_side', `${i} ≤ ${mid}? ${left ? 'Yes: go left.' : 'No: go right.'}`, v({ mid }), { hl: { [me]: 'active' } });
            t.mark(me, 'visited');
            if (left) {
              t.step('go_left', `Recurse into [${lo}, ${mid}].`, v({ mid }), { hl: { [me]: 'active' } });
              u(2 * node, lo, mid, depth + 1);
            } else {
              t.step('go_right', `Recurse into [${mid + 1}, ${hi}].`, v({ mid }), { hl: { [me]: 'active' } });
              u(2 * node + 1, mid + 1, hi, depth + 1);
            }
            m.tree[node] = m.tree[2 * node] + m.tree[2 * node + 1];
            t.step('pull_up', `Recompute: ${m.tree[2 * node]} + ${m.tree[2 * node + 1]} = ${m.tree[node]}.`, v({ mid }), { hl: { [me]: 'new' } });
          };
          u(1, 0, m.n - 1, 1);
          t.step('call_root', `Done. Only the ${Math.ceil(Math.log2(m.n)) + 1} nodes on one root-to-leaf path changed.`, { i, value }, { ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
