/* Fenwick tree: traced update / prefix_sum mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const low = (i) => i & -i;
  const bin = (i, w) => i.toString(2).padStart(w, '0');

  DSV.register({
    id: 'fenwick-tree',
    title: 'Fenwick Tree',
    about:
      'A Binary Indexed Tree stores prefix-sum information in one array. tree[i] holds the sum of the last lowbit(i) elements ending at i, where lowbit(i) = i & -i is the lowest set bit. Updates climb by adding lowbit; prefix queries descend by subtracting it, so both take O(log n) steps.',
    init: { default: '3, 2, -1, 6, 5, 4, -3, 3', max: 16, random: [8, -5, 9] },
    complexity: {
      rows: [
        ['Point update (add delta)', 'O(log n)', 'O(log n)'],
        ['Prefix sum', 'O(log n)', 'O(log n)'],
        ['Range sum l..r', 'O(log n)', 'O(log n)'],
      ],
      space: 'O(n)',
      notes: 'Indexes are 1-based. The bottom row shows the range each cell covers and i in binary: watch how a single bit flips on every step.',
    },

    create(values) {
      const n = values.length;
      const tree = Array(n + 1).fill(0);
      values.forEach((v, k) => {
        for (let i = k + 1; i <= n; i += low(i)) tree[i] += v;
      });
      return { model: { tree, a: values.slice() }, msg: `Built over ${n} values (1-indexed).` };
    },
    snapshot: (m) => ({ tree: m.tree.slice(), a: m.a.slice() }),

    layout(frame) {
      const st = frame.state;
      const n = st.a.length;
      const w = Math.max(3, n.toString(2).length);
      const nodes = [];
      for (let i = 1; i <= n; i++) {
        const x = (i - 1) * 60;
        nodes.push({ id: 'a' + i, x, y: 0, shape: 'box', w: 50, h: 34, text: st.a[i - 1], cls: frame.hl['a' + i] });
        nodes.push({ id: 't' + i, x, y: 90, shape: 'box', w: 50, h: 40, text: st.tree[i], sub: `${i - low(i) + 1}..${i}`, cls: frame.hl['t' + i] });
        nodes.push(DSV.label('b' + i, x, 155, bin(i, w)));
        nodes.push(DSV.label('ai' + i, x, -30, i));
      }
      nodes.push(DSV.label('la', -40, 0, 'a', 'strong', 'end'), DSV.label('lt', -40, 90, 'tree', 'strong', 'end'), DSV.label('lb', -40, 155, 'binary', '', 'end'));
      const ptr = DSV.indexPointers(frame, ['i'], 't', n + 1).filter((p) => p.target !== 't0');
      return { nodes, edges: [], pointers: ptr };
    },

    scenarios: [
      ['3 2 -1 6 5 4 -3 3', 'update', [3, 4]],
      ['3 2 -1 6 5 4 -3 3', 'prefix_sum', [7]],
    ],

    ops: [
      {
        id: 'update',
        label: 'update(i, delta)',
        args: [
          { name: 'i', default: 3 },
          { name: 'delta', default: 4 },
        ],
        check: (m, i) => (i < 1 || i >= m.tree.length ? `Need 1 ≤ i ≤ ${m.tree.length - 1}.` : null),
        run(t, m, i, delta) {
          m.a[i - 1] += delta;
          const touched = { ['a' + i]: 'new' };
          for (;;) {
            t.step('loop', i < m.tree.length ? `i = ${i} is within the tree.` : `i = ${i} is past the end: done.`, { i, delta }, { hl: Object.assign({ ['t' + i]: 'active' }, touched) });
            if (i >= m.tree.length) break;
            m.tree[i] += delta;
            t.mark('t' + i, 'visited');
            t.step('add', `tree[${i}] covers ${i - low(i) + 1}..${i}, which includes the changed element: add ${delta} → ${m.tree[i]}.`, { i, delta }, { hl: Object.assign({ ['t' + i]: 'new' }, touched) });
            const old = i;
            i += low(i);
            t.step('next', `i += lowbit(${old}) = ${low(old)} → ${i}. The next range that also covers it.`, { i, delta }, { hl: touched });
          }
          t.step('loop', `Updated ${Object.keys(t.marks).length} cells.`, { i, delta }, { ok: true });
        },
      },
      {
        id: 'prefix_sum',
        label: 'prefix_sum(i)',
        args: [{ name: 'i', default: 7 }],
        check: (m, i) => (i < 0 || i >= m.tree.length ? `Need 0 ≤ i ≤ ${m.tree.length - 1}.` : null),
        run(t, m, i) {
          const end = i;
          let total = 0;
          t.step('init', `Sum a[1..${end}]: total = 0.`, { i, total });
          for (;;) {
            t.step('loop', i > 0 ? `i = ${i} > 0.` : 'i = 0: done.', { i, total }, { hl: i > 0 ? { ['t' + i]: 'active' } : {} });
            if (i <= 0) break;
            total += m.tree[i];
            t.mark('t' + i, 'found');
            t.step('add', `Add tree[${i}] (sum of ${i - low(i) + 1}..${i}) = ${m.tree[i]} → total ${total}.`, { i, total }, {});
            const old = i;
            i -= low(i);
            t.step('next', `i -= lowbit(${old}) = ${low(old)} → ${i}.`, { i, total }, {});
          }
          t.step('done', `prefix_sum(${end}) = ${total}, built from ${Object.keys(t.marks).length} cells instead of ${end}.`, { i, total }, { ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
