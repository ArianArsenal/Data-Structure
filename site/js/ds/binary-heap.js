/* Binary min-heap: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAX = 15;
  const less = (a, b) => a < b;

  function build(values) {
    const items = [];
    for (const v of values) {
      items.push(DSV.node({ value: v }));
      for (let i = items.length - 1; i > 0 && items[i].value < items[(i - 1) >> 1].value; i = (i - 1) >> 1) {
        [items[i], items[(i - 1) >> 1]] = [items[(i - 1) >> 1], items[i]];
      }
    }
    return items;
  }

  DSV.register({
    id: 'binary-heap',
    title: 'Binary Heap (Min)',
    layout: 'heap',
    about:
      'A complete binary tree stored in a plain array: the children of index i live at 2i+1 and 2i+2. Every parent is ≤ its children, so the minimum is always at index 0. Insert bubbles a value up; extract-min moves the last value to the root and sifts it down.',
    init: { default: '5, 9, 3, 7, 1, 8, 4', max: MAX, random: [8, 1, 99] },
    complexity: {
      rows: [
        ['Insert', 'O(log n)', 'O(log n)'],
        ['Extract min', 'O(log n)', 'O(log n)'],
        ['Peek min', 'O(1)', 'O(1)'],
        ['Build heap (bottom-up)', 'O(n)', 'O(n)'],
      ],
      space: 'O(n), no pointers needed',
      notes: 'The tree and the array below it are the same data. Watch both move on every swap. build_heap is O(n), not O(n log n): most nodes are near the bottom and sift only a short way.',
    },

    create(values) {
      return { model: { items: build(values), raw: values.slice() }, msg: `Inserted ${values.length} values one by one; the smallest is at the root.` };
    },
    snapshot: (m) => DSV.heapSnapshot(m.items),

    scenarios: [
      ['5 9 3', 'insert', [1]],
      ['1 5 9', 'insert', [7]],
      ['', 'insert', [7]],
      ['1 5 3 9 7', 'extract_min', []],
      ['1', 'extract_min', []],
      ['', 'extract_min', []],
      ['9 8 7 6 5 4 3 2 1', 'build_heap', []],
      ['', 'build_heap', []],
    ],

    ops: [
      {
        id: 'insert',
        label: 'insert(value)',
        args: [{ name: 'value', default: 2 }],
        check: (m) => (m.items.length >= MAX ? `This demo is limited to ${MAX} values.` : null),
        run(t, m, value) {
          const node = DSV.node({ value });
          m.items.push(node);
          const i = m.items.length - 1;
          t.step('append', `Append ${value} at the end of the array (the next free spot in the tree).`, { value }, { hl: { [node.id]: 'new' } });
          t.step('start', `i = ${i}.`, { value, i }, { hl: { [node.id]: 'new' } });
          DSV.heapSiftUp(t, m.items, i, less, 'smaller');
        },
      },
      {
        id: 'extract_min',
        label: 'extract_min()',
        args: [],
        run(t, m) {
          const items = m.items;
          t.step('check_empty', items.length ? 'The heap is not empty.' : 'The heap is empty.', {});
          if (!items.length) return t.step('empty', 'Nothing to extract.', {}, { ok: false });
          const top = items[0].value;
          t.step('grab', `The minimum is at the root: top = ${top}.`, { top }, { hl: { [items[0].id]: 'removed' } });
          const lastNode = items.pop();
          const last = lastNode.value;
          const removed = items.length ? items[0] : lastNode;
          t.step('pop_last', `Remove the last array slot: last = ${last}.`, { top, last }, { hl: { [removed.id]: 'removed' } });
          t.step('check_rest', items.length ? 'The heap still has values.' : 'The heap is now empty.', { top, last });
          if (items.length) {
            items[0] = lastNode;
            t.step('move_last', `Put ${last} at the root, replacing ${top}.`, { top, last }, { hl: { [lastNode.id]: 'active' } });
            t.step('sift', `Sift ${last} down until both children are larger.`, { top, last }, { hl: { [lastNode.id]: 'active' } });
            DSV.heapSiftDown(t, items, 0, less, 'smallest', 'sift_down');
          }
          t.step('done', `Return ${top}.`, { top }, { ok: true });
        },
      },
      {
        id: 'build_heap',
        label: 'build_heap() from initial values',
        args: [],
        run(t, m) {
          const items = (m.items = m.raw.map((value) => DSV.node({ value })));
          const n = items.length;
          t.step('copy', `Copy the initial values in their original order [${m.raw.join(', ')}]. This is not a heap yet.`, { values: m.raw.slice() });
          for (let i = (n >> 1) - 1; ; i--) {
            t.step('loop', i >= 0 ? `Sift down index ${i}. Leaves (indexes ${n >> 1}..${n - 1}) are already tiny heaps.` : 'Every internal node has been sifted: it is a heap.', { i }, { hl: i >= 0 ? { [items[i].id]: 'active' } : {}, ok: i < 0 ? true : undefined });
            if (i < 0) break;
            t.step('sift', `Sift ${items[i].value} down into its subtree.`, { i }, { hl: { [items[i].id]: 'active' } });
            DSV.heapSiftDown(t, items, i, less, 'smallest', 'sift_down');
          }
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
