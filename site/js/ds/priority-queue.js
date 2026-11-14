/* Max-priority queue: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAX = 15;
  const greater = (a, b) => a > b;

  DSV.register({
    id: 'priority-queue',
    title: 'Priority Queue (Max)',
    layout: 'heap',
    about:
      'A queue where the highest priority always leaves first, no matter when it arrived. The standard implementation is a binary max-heap: push and pop are O(log n), and peeking at the top is O(1). Used for task schedulers, Dijkstra and A*.',
    init: { default: '3, 10, 6, 1, 8', max: MAX, random: [7, 1, 50] },
    complexity: {
      rows: [
        ['Push', 'O(log n)', 'O(log n)'],
        ['Pop (max)', 'O(log n)', 'O(log n)'],
        ['Peek', 'O(1)', 'O(1)'],
      ],
      space: 'O(n)',
      notes: 'Python heapq and Java PriorityQueue are min-heaps; C++ std::priority_queue is a max-heap like this one.',
    },

    create(values) {
      const items = [];
      for (const v of values) {
        items.push(DSV.node({ value: v }));
        for (let i = items.length - 1; i > 0 && items[i].value > items[(i - 1) >> 1].value; i = (i - 1) >> 1) {
          [items[i], items[(i - 1) >> 1]] = [items[(i - 1) >> 1], items[i]];
        }
      }
      return { model: { items }, msg: `Pushed ${values.length} priorities; the largest is on top.` };
    },
    snapshot: (m) => DSV.heapSnapshot(m.items),

    scenarios: [
      ['3 10 6', 'push', [12]],
      ['10 6 3', 'push', [1]],
      ['', 'push', [1]],
      ['10 6 3 1', 'pop', []],
      ['', 'pop', []],
      ['10 6', 'peek', []],
      ['', 'peek', []],
    ],

    ops: [
      {
        id: 'push',
        label: 'push(priority)',
        args: [{ name: 'priority', default: 9 }],
        check: (m) => (m.items.length >= MAX ? `This demo is limited to ${MAX} values.` : null),
        run(t, m, priority) {
          const node = DSV.node({ value: priority });
          m.items.push(node);
          t.step('append', `Append priority ${priority} at the end.`, { priority }, { hl: { [node.id]: 'new' } });
          t.step('call_sift', `Sift it up from index ${m.items.length - 1}.`, { priority, i: m.items.length - 1 }, { hl: { [node.id]: 'new' } });
          DSV.heapSiftUp(t, m.items, m.items.length - 1, greater, 'larger');
        },
      },
      {
        id: 'pop',
        label: 'pop()',
        args: [],
        run(t, m) {
          const items = m.items;
          t.step('check_empty', items.length ? 'The queue is not empty.' : 'The queue is empty.', {});
          if (!items.length) return t.step('empty', 'Nothing to pop.', {}, { ok: false });
          const top = items[0].value;
          t.step('grab', `Highest priority: top = ${top}.`, { top }, { hl: { [items[0].id]: 'removed' } });
          const lastNode = items[items.length - 1];
          const oldRoot = items[0];
          items[0] = lastNode;
          if (oldRoot !== lastNode) items[items.length - 1] = oldRoot;
          t.step('move_last', `Copy the last value (${lastNode.value}) into the root.`, { top }, { hl: { [lastNode.id]: 'active', [oldRoot.id]: 'removed' } });
          items.pop();
          t.step('drop_last', 'Drop the last slot.', { top }, { hl: items.length ? { [items[0].id]: 'active' } : {} });
          t.step('call_sift', 'Sift the root down.', { top, i: 0 });
          DSV.heapSiftDown(t, items, 0, greater, 'largest');
          t.step('done', `Return ${top}.`, { top }, { ok: true });
        },
      },
      {
        id: 'peek',
        label: 'peek()',
        args: [],
        run(t, m) {
          t.step('check_empty', m.items.length ? 'The queue is not empty.' : 'The queue is empty.', {});
          if (!m.items.length) return t.step('empty', 'Nothing to peek at.', {}, { ok: false });
          t.step('done', `The top is ${m.items[0].value}. Return it without removing.`, {}, { hl: { [m.items[0].id]: 'found' }, ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
