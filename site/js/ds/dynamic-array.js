/* Dynamic array: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAX = 32;

  function resize(t, m, newCap, why) {
    const op = { op: 'append' }; // _resize's code lives in the append region
    const buffer = Array(newCap).fill(null);
    const v = (x) => Object.assign({ new_capacity: newCap, size: m.size, buffer }, x);
    t.step('alloc', `${why} Allocate a new buffer of capacity ${newCap}.`, v(), op);
    for (let i = 0; ; i++) {
      t.step('copy_loop', i < m.size ? `Copy element ${i}.` : `All ${m.size} elements copied.`, v({ i }), op);
      if (i >= m.size) break;
      buffer[i] = m.data[i];
      t.step('copy', `buffer[${i}] = data[${i}] (${buffer[i]}).`, v({ i }), Object.assign({ hl: { ['c' + i]: 'visited', ['b' + i]: 'new' } }, op));
    }
    m.data = buffer;
    m.cap = newCap;
    t.step('swap', `data now refers to the new buffer; capacity = ${newCap}. (C++ frees the old block with delete[].)`, { new_capacity: newCap, size: m.size }, op);
  }

  DSV.register({
    id: 'dynamic-array',
    title: 'Dynamic Array',
    about:
      'An array that resizes itself: when it is full, it allocates one twice as big and copies everything over. Copying is O(n), but it happens so rarely that append is O(1) amortized. This is how Python list, C++ std::vector and Java ArrayList work.',
    init: { default: '7, 3, 9', max: 16, random: [5, 1, 99] },
    complexity: {
      rows: [
        ['Append', 'O(1) amortized', 'O(n) (resize)'],
        ['Pop from end', 'O(1) amortized', 'O(n) (shrink)'],
        ['Access by index', 'O(1)', 'O(1)'],
      ],
      space: 'O(n), at most 4n slots',
      notes: 'Shrinking at ¼ full (not ½) avoids thrashing when appends and pops alternate at a boundary.',
    },

    create(values) {
      let cap = 2;
      while (cap < values.length) cap *= 2;
      const data = Array(cap).fill(null);
      values.forEach((v, i) => (data[i] = v));
      return { model: { data, size: values.length, cap }, msg: `size ${values.length}, capacity ${cap}. Append until it fills up to watch it grow.` };
    },
    snapshot: (m, vars) => ({ data: m.data.slice(), size: m.size, buffer: vars.buffer ? vars.buffer.slice() : null }),

    layout(frame) {
      const st = frame.state;
      const nodes = DSV.cells(st.data, { hl: frame.hl });
      nodes.push(DSV.label('ld', -40, 0, 'data', 'strong', 'end'));
      if (st.buffer) {
        nodes.push(...DSV.cells(st.buffer, { prefix: 'b', y: 95, hl: frame.hl }));
        nodes.push(DSV.label('lb', -40, 95, 'buffer', 'strong', 'end'));
      }
      return { nodes, edges: [], pointers: DSV.indexPointers(frame, ['size'], 'c', st.data.length) };
    },

    scenarios: [
      ['1 2', 'append', [3]],
      ['1 2 3', 'append', [4]],
      ['1 2 3', 'pop', []],
      ['', 'pop', []],
      ['1 2 3 4 5', 'pop', [], [['pop', []], ['pop', []]]],
    ],

    ops: [
      {
        id: 'append',
        label: 'append(value)',
        args: [{ name: 'value', default: 5 }],
        check: (m) => (m.size >= MAX ? `This demo is limited to ${MAX} elements.` : null),
        run(t, m, value) {
          const v = () => ({ value, size: m.size, capacity: m.cap });
          const full = m.size === m.cap;
          t.step('check_full', `Is size (${m.size}) == capacity (${m.cap})? ${full ? 'Yes: no room left.' : 'No.'}`, v());
          if (full) {
            t.step('grow', `Grow to 2 × ${m.cap} = ${2 * m.cap}.`, v());
            resize(t, m, 2 * m.cap, 'Full.');
          }
          m.data[m.size] = value;
          t.step('place', `data[${m.size}] = ${value}.`, v(), { hl: { ['c' + m.size]: 'new' } });
          m.size++;
          t.step('done', `size = ${m.size}, capacity = ${m.cap}.`, v(), { hl: { ['c' + (m.size - 1)]: 'found' }, ok: true });
        },
      },
      {
        id: 'pop',
        label: 'pop()',
        args: [],
        run(t, m) {
          const v = (x) => Object.assign({ size: m.size, capacity: m.cap }, x);
          t.step('check_empty', `Is size 0? ${m.size ? 'No.' : 'Yes.'}`, v());
          if (!m.size) return t.step('empty', 'Nothing to pop: raise an error.', v(), { ok: false });
          m.size--;
          t.step('shrink', `size = ${m.size}; the last element is at index ${m.size}.`, v());
          const value = m.data[m.size];
          t.step('grab', `value = ${value}.`, v({ value }), { hl: { ['c' + m.size]: 'removed' } });
          m.data[m.size] = null;
          t.step('clear', `Clear slot ${m.size}.`, v({ value }));
          const quarter = m.size > 0 && m.size <= Math.floor(m.cap / 4);
          t.step('check_quarter', `Is 0 < size (${m.size}) ≤ capacity/4 (${Math.floor(m.cap / 4)})? ${quarter ? 'Yes: mostly empty.' : 'No.'}`, v({ value }));
          if (quarter) {
            t.step('halve', `Shrink to ${m.cap / 2} slots.`, v({ value }));
            resize(t, m, m.cap / 2, 'Mostly empty.');
          }
          t.step('done', `Return ${value}.`, v({ value }), { ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
