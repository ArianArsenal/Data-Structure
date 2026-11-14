/* Static array: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const CAP = 8;

  DSV.register({
    id: 'static-array',
    title: 'Static Array',
    about:
      'A fixed block of contiguous slots. Reading or writing slot i is O(1) because its address is base + i × size. Inserting or deleting in the middle shifts every later element by one slot.',
    init: { default: '4, 8, 15, 16, 23', max: CAP, random: [5, 1, 99] },
    complexity: {
      rows: [
        ['Access by index', 'O(1)', 'O(1)'],
        ['Insert at index', 'O(n)', 'O(n)'],
        ['Delete at index', 'O(n)', 'O(n)'],
        ['Search (unsorted)', 'O(n)', 'O(n)'],
      ],
      space: 'O(capacity)',
      notes: 'Capacity is fixed at 8 here. When an array must grow, see Dynamic Array.',
    },

    create(values) {
      const data = Array(CAP).fill(null);
      values.forEach((v, i) => (data[i] = v));
      return { model: { data, size: values.length }, msg: `Array of capacity ${CAP} holding ${values.length} values.` };
    },
    snapshot: (m) => ({ data: m.data.slice(), size: m.size }),

    layout(frame) {
      const st = frame.state;
      const nodes = DSV.cells(st.data, { hl: frame.hl, cls: (i) => (i >= st.size ? 'ghost' : '') });
      nodes.push(DSV.label('sz', -60, 0, `size=${st.size}`, 'strong', 'end'));
      return { nodes, edges: [], pointers: DSV.indexPointers(frame, ['i', 'index'], 'c', CAP) };
    },

    scenarios: [
      ['1 2 3', 'insert', [1, 9]],
      ['1 2 3 4 5 6 7 8', 'insert', [1, 9]],
      ['1 2 3', 'insert', [7, 9]],
      ['1 2 3', 'delete', [0]],
      ['1 2 3', 'delete', [5]],
      ['1 2 3', 'search', [3]],
      ['1 2 3', 'search', [7]],
    ],

    ops: [
      {
        id: 'insert',
        label: 'insert(index, value)',
        args: [
          { name: 'index', default: 1 },
          { name: 'value', default: 42 },
        ],
        run(t, m, index, value) {
          const v = (x) => Object.assign({ index, value, size: m.size }, x);
          t.step('check_full', `Is size (${m.size}) == capacity (${CAP})?`, v());
          if (m.size === CAP) return t.step('full', 'The array is full: no free slot, so raise an error.', v(), { ok: false });
          t.step('check_bounds', `Is ${index} within 0..${m.size}?`, v());
          if (index < 0 || index > m.size) return t.step('out_of_range', `Index ${index} is out of range.`, v(), { ok: false });
          let i = m.size;
          t.step('start', `Start at i = size = ${i}, the first free slot.`, v({ i }));
          for (;;) {
            t.step('loop', i > index ? `i (${i}) > index (${index}): shift one more.` : `i == index: slot ${index} is free.`, v({ i }));
            if (i <= index) break;
            m.data[i] = m.data[i - 1];
            t.step('shift', `Copy data[${i - 1}] (${m.data[i]}) right into data[${i}].`, v({ i }), { hl: { ['c' + i]: 'active', ['c' + (i - 1)]: 'visited' } });
            i--;
          }
          m.data[index] = value;
          t.step('place', `Write ${value} into data[${index}].`, v({ i }), { hl: { ['c' + index]: 'new' } });
          m.size++;
          t.step('done', `size = ${m.size}. Inserting shifted ${m.size - 1 - index} element(s).`, v(), { hl: { ['c' + index]: 'found' }, ok: true });
        },
      },
      {
        id: 'delete',
        label: 'delete(index)',
        args: [{ name: 'index', default: 1 }],
        run(t, m, index) {
          const v = (x) => Object.assign({ index, size: m.size }, x);
          t.step('check_bounds', `Is ${index} within 0..${m.size - 1}?`, v());
          if (index < 0 || index >= m.size) return t.step('out_of_range', `Index ${index} is out of range.`, v(), { ok: false });
          const removed = m.data[index];
          t.step('grab', `Remember removed = ${removed}.`, v({ removed }), { hl: { ['c' + index]: 'removed' } });
          let i = index;
          for (;;) {
            t.step('loop', i < m.size - 1 ? `i = ${i} < ${m.size - 1}: shift left.` : 'No more elements to shift.', v({ removed, i }));
            if (i >= m.size - 1) break;
            m.data[i] = m.data[i + 1];
            t.step('shift', `Copy data[${i + 1}] (${m.data[i]}) left into data[${i}].`, v({ removed, i }), { hl: { ['c' + i]: 'active', ['c' + (i + 1)]: 'visited' } });
            i++;
          }
          m.size--;
          t.step('shrink', `size = ${m.size}.`, v({ removed }));
          m.data[m.size] = null;
          t.step('clear', `Clear the now-unused slot ${m.size}.`, v({ removed }), { hl: { ['c' + m.size]: 'removed' } });
          t.step('done', `Return ${removed}.`, v({ removed }), { ok: true });
        },
      },
      {
        id: 'search',
        label: 'search(value)',
        args: [{ name: 'value', default: 16 }],
        run(t, m, value) {
          for (let i = 0; ; i++) {
            t.step('loop', i < m.size ? `Check slot i = ${i}.` : `i = ${i} reached size: done scanning.`, { value, i });
            if (i >= m.size) break;
            const eq = m.data[i] === value;
            t.step('compare', `Is data[${i}] (${m.data[i]}) == ${value}? ${eq ? 'Yes!' : 'No.'}`, { value, i }, { hl: { ['c' + i]: eq ? 'found' : 'active' } });
            if (eq) return t.step('found', `Found ${value} at index ${i}.`, { value, i }, { hl: { ['c' + i]: 'found' }, ok: true });
            t.mark('c' + i, 'visited');
          }
          t.step('not_found', `${value} is not in the array; return -1.`, { value }, { ok: false });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
