/* Array-backed stack: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const CAP = 8;
  const H = 44;

  DSV.register({
    id: 'stack',
    title: 'Stack',
    about:
      'Last in, first out. An array plus a top index: push writes just above top, pop reads at top. Both ends of the work happen at one end of the array, so everything is O(1). Used for undo, call stacks, bracket matching and DFS.',
    init: { default: '3, 1, 4', max: CAP, random: [4, 1, 99] },
    complexity: {
      rows: [
        ['Push', 'O(1)', 'O(1)'],
        ['Pop', 'O(1)', 'O(1)'],
        ['Peek', 'O(1)', 'O(1)'],
      ],
      space: 'O(capacity)',
      notes: 'Capacity is fixed at 8, so pushing a 9th value overflows. A dynamic array removes that limit.',
    },

    create(values) {
      const data = Array(CAP).fill(null);
      values.forEach((v, i) => (data[i] = v));
      return { model: { data, top: values.length - 1 }, msg: `Stack with ${values.length} values; top = ${values.length - 1}.` };
    },
    snapshot: (m) => ({ data: m.data.slice(), top: m.top }),

    layout(frame) {
      const st = frame.state;
      const nodes = st.data.map((v, i) => ({
        id: 'c' + i,
        x: 0,
        y: -i * H,
        shape: 'box',
        w: 72,
        h: H - 4,
        text: v === null ? '' : v,
        cls: [v === null ? 'ghost' : '', frame.hl['c' + i] || ''].join(' '),
      }));
      st.data.forEach((_, i) => nodes.push(DSV.label('i' + i, -52, -i * H, i)));
      nodes.push(DSV.label('top', 52, -st.top * H, `← top = ${st.top}`, 'strong', 'start'));
      return { nodes, edges: [], pointers: [] };
    },

    scenarios: [
      ['1 2', 'push', [3]],
      ['1 2 3 4 5 6 7 8', 'push', [9]],
      ['1 2', 'pop', []],
      ['', 'pop', []],
      ['1 2', 'peek', []],
      ['', 'peek', []],
    ],

    ops: [
      {
        id: 'push',
        label: 'push(value)',
        args: [{ name: 'value', default: 9 }],
        run(t, m, value) {
          const v = () => ({ value, top: m.top });
          t.step('check_full', `Is top (${m.top}) at the last slot (${CAP - 1})?`, v());
          if (m.top === CAP - 1) return t.step('overflow', 'Stack overflow: no room for another value.', v(), { ok: false });
          m.top++;
          t.step('inc_top', `top moves up to ${m.top}.`, v());
          m.data[m.top] = value;
          t.step('place', `data[${m.top}] = ${value}. It is now the top of the stack.`, v(), { hl: { ['c' + m.top]: 'found' }, ok: true });
        },
      },
      {
        id: 'pop',
        label: 'pop()',
        args: [],
        run(t, m) {
          t.step('check_empty', `Is top == -1? ${m.top === -1 ? 'Yes.' : 'No.'}`, { top: m.top });
          if (m.top === -1) return t.step('underflow', 'Stack underflow: nothing to pop.', { top: m.top }, { ok: false });
          const value = m.data[m.top];
          t.step('grab', `value = data[${m.top}] = ${value}.`, { top: m.top, value }, { hl: { ['c' + m.top]: 'removed' } });
          m.data[m.top] = null;
          t.step('clear', `Clear slot ${m.top}.`, { top: m.top, value });
          m.top--;
          t.step('dec_top', `top moves down to ${m.top}.`, { top: m.top, value });
          t.step('done', `Return ${value}: the last value pushed is the first popped.`, { top: m.top, value }, { ok: true });
        },
      },
      {
        id: 'peek',
        label: 'peek()',
        args: [],
        run(t, m) {
          t.step('check_empty', `Is top == -1? ${m.top === -1 ? 'Yes.' : 'No.'}`, { top: m.top });
          if (m.top === -1) return t.step('empty', 'The stack is empty.', { top: m.top }, { ok: false });
          t.step('done', `Return data[${m.top}] = ${m.data[m.top]} without removing it.`, { top: m.top }, { hl: { ['c' + m.top]: 'found' }, ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
