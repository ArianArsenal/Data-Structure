/* Circular-buffer queue: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const CAP = 8;

  DSV.register({
    id: 'queue',
    title: 'Queue (Circular Buffer)',
    about:
      'First in, first out. Elements join at the rear and leave from the front. Instead of shifting everything left on each dequeue, a circular buffer just advances front, and indexes wrap around with % capacity.',
    init: { default: '5, 8, 2', max: CAP, random: [4, 1, 99] },
    complexity: {
      rows: [
        ['Enqueue', 'O(1)', 'O(1)'],
        ['Dequeue', 'O(1)', 'O(1)'],
      ],
      space: 'O(capacity)',
      notes: 'Run dequeue a few times, then enqueue: the rear wraps from slot 7 back to slot 0.',
    },

    create(values) {
      const data = Array(CAP).fill(null);
      values.forEach((v, i) => (data[i] = v));
      return { model: { data, front: 0, size: values.length }, msg: `Queue holding ${values.length} values, front = 0.` };
    },
    snapshot: (m) => ({ data: m.data.slice(), front: m.front, size: m.size }),
    layout: (frame) => DSV.ringLayout(frame, ['front', 'rear']),

    scenarios: [
      ['1 2', 'enqueue', [3]],
      ['1 2 3 4 5 6 7 8', 'enqueue', [9]],
      ['1 2', 'dequeue', []],
      ['', 'dequeue', []],
    ],

    ops: [
      {
        id: 'enqueue',
        label: 'enqueue(value)',
        args: [{ name: 'value', default: 7 }],
        run(t, m, value) {
          const v = (x) => Object.assign({ value, front: m.front, size: m.size }, x);
          t.step('check_full', `Is size (${m.size}) == capacity (${CAP})?`, v());
          if (m.size === CAP) return t.step('full', 'The queue is full.', v(), { ok: false });
          const rear = (m.front + m.size) % CAP;
          t.step('compute_rear', `rear = (front + size) % ${CAP} = (${m.front} + ${m.size}) % ${CAP} = ${rear}.`, v({ rear }), { hl: { ['c' + rear]: 'active' } });
          m.data[rear] = value;
          t.step('place', `data[${rear}] = ${value}.`, v({ rear }), { hl: { ['c' + rear]: 'new' } });
          m.size++;
          t.step('done', `size = ${m.size}.`, v({ rear }), { hl: { ['c' + rear]: 'found' }, ok: true });
        },
      },
      {
        id: 'dequeue',
        label: 'dequeue()',
        args: [],
        run(t, m) {
          const v = (x) => Object.assign({ front: m.front, size: m.size }, x);
          t.step('check_empty', `Is size 0? ${m.size ? 'No.' : 'Yes.'}`, v());
          if (!m.size) return t.step('empty', 'The queue is empty.', v(), { ok: false });
          const value = m.data[m.front];
          t.step('grab', `value = data[front] = ${value}.`, v({ value }), { hl: { ['c' + m.front]: 'removed' } });
          m.data[m.front] = null;
          t.step('clear', `Clear slot ${m.front}.`, v({ value }));
          const old = m.front;
          m.front = (m.front + 1) % CAP;
          t.step('advance', `front = (${old} + 1) % ${CAP} = ${m.front}.`, v({ value }));
          m.size--;
          t.step('shrink', `size = ${m.size}.`, v({ value }));
          t.step('done', `Return ${value}, the oldest element.`, v({ value }), { ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
