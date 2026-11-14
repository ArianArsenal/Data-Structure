/* Circular-buffer deque: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const CAP = 8;

  function pushOp(id, atFront) {
    return {
      id,
      label: `${id}(value)`,
      args: [{ name: 'value', default: atFront ? 1 : 9 }],
      run(t, m, value) {
        const v = (x) => Object.assign({ value, front: m.front, size: m.size }, x);
        t.step('check_full', `Is size (${m.size}) == capacity (${CAP})?`, v());
        if (m.size === CAP) return t.step('full', 'The deque is full.', v(), { ok: false });
        let slot;
        if (atFront) {
          const old = m.front;
          m.front = (m.front - 1 + CAP) % CAP;
          slot = m.front;
          t.step('move_front', `front = (${old} - 1 + ${CAP}) % ${CAP} = ${m.front}. Adding ${CAP} keeps it non-negative.`, v(), { hl: { ['c' + slot]: 'active' } });
        } else {
          slot = (m.front + m.size) % CAP;
          t.step('compute_back', `back = (front + size) % ${CAP} = ${slot}.`, v({ back: slot }), { hl: { ['c' + slot]: 'active' } });
        }
        m.data[slot] = value;
        const extra = atFront ? {} : { back: slot };
        t.step('place', `data[${slot}] = ${value}.`, v(extra), { hl: { ['c' + slot]: 'new' } });
        m.size++;
        t.step('done', `size = ${m.size}.`, v(extra), { hl: { ['c' + slot]: 'found' }, ok: true });
      },
    };
  }

  DSV.register({
    id: 'deque',
    title: 'Deque (Circular Buffer)',
    about:
      'A double-ended queue: push and pop at both the front and the back in O(1). The same circular buffer as a queue, except front can also move backwards, wrapping from 0 to capacity − 1.',
    init: { default: '4, 6, 2', max: CAP, random: [4, 1, 99] },
    complexity: {
      rows: [
        ['push_front / push_back', 'O(1)', 'O(1)'],
        ['pop_front / pop_back', 'O(1)', 'O(1)'],
      ],
      space: 'O(capacity)',
    },

    create(values) {
      const data = Array(CAP).fill(null);
      values.forEach((v, i) => (data[i] = v));
      return { model: { data, front: 0, size: values.length }, msg: `Deque holding ${values.length} values, front = 0.` };
    },
    snapshot: (m) => ({ data: m.data.slice(), front: m.front, size: m.size }),
    layout: (frame) => DSV.ringLayout(frame, ['front', 'back']),

    scenarios: [
      ['1 2', 'push_front', [3]],
      ['1 2 3 4 5 6 7 8', 'push_front', [9]],
      ['1 2', 'push_back', [3]],
      ['1 2 3 4 5 6 7 8', 'push_back', [9]],
      ['1 2', 'pop_front', []],
      ['', 'pop_front', []],
      ['1 2', 'pop_back', []],
      ['', 'pop_back', []],
    ],

    ops: [
      pushOp('push_front', true),
      pushOp('push_back', false),
      {
        id: 'pop_front',
        label: 'pop_front()',
        args: [],
        run(t, m) {
          const v = (x) => Object.assign({ front: m.front, size: m.size }, x);
          t.step('check_empty', `Is size 0? ${m.size ? 'No.' : 'Yes.'}`, v());
          if (!m.size) return t.step('empty', 'The deque is empty.', v(), { ok: false });
          const value = m.data[m.front];
          t.step('grab', `value = data[front] = ${value}.`, v({ value }), { hl: { ['c' + m.front]: 'removed' } });
          m.data[m.front] = null;
          t.step('clear', `Clear slot ${m.front}.`, v({ value }));
          m.front = (m.front + 1) % CAP;
          t.step('advance', `front moves to ${m.front}.`, v({ value }));
          m.size--;
          t.step('shrink', `size = ${m.size}.`, v({ value }));
          t.step('done', `Return ${value}.`, v({ value }), { ok: true });
        },
      },
      {
        id: 'pop_back',
        label: 'pop_back()',
        args: [],
        run(t, m) {
          const v = (x) => Object.assign({ front: m.front, size: m.size }, x);
          t.step('check_empty', `Is size 0? ${m.size ? 'No.' : 'Yes.'}`, v());
          if (!m.size) return t.step('empty', 'The deque is empty.', v(), { ok: false });
          const back = (m.front + m.size - 1) % CAP;
          t.step('compute_back', `back = (front + size − 1) % ${CAP} = ${back}.`, v({ back }), { hl: { ['c' + back]: 'active' } });
          const value = m.data[back];
          t.step('grab', `value = data[${back}] = ${value}.`, v({ back, value }), { hl: { ['c' + back]: 'removed' } });
          m.data[back] = null;
          t.step('clear', `Clear slot ${back}.`, v({ back, value }));
          m.size--;
          t.step('shrink', `size = ${m.size}.`, v({ back, value }));
          t.step('done', `Return ${value}.`, v({ back, value }), { ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
