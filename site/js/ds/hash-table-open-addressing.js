/* Open addressing hash table: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const CAP = 11;
  const EMPTY = 0;
  const OCC = 1;
  const DEL = 2;
  const keyArg = (n, d) => ({ name: n, default: d, min: 0, max: 999 });
  const at = (i, cls) => ({ ['c' + i]: cls });

  // Shared probe loop for get / remove (identical shape in the sources).
  function lookup(t, m, key, onHit, word) {
    let i = key % CAP;
    t.step('hash', `Home slot: ${key} % ${CAP} = ${i}.`, { key, i }, { hl: at(i, 'active') });
    for (let probe = 0; ; probe++) {
      t.step('probe', probe < CAP ? `Probe #${probe + 1}: look at slot ${i}.` : `Probed all ${CAP} slots.`, { key, i }, { hl: at(i, 'active') });
      if (probe >= CAP) break;
      t.step('check_empty', m.state[i] === EMPTY ? `Slot ${i} is empty: the key was never inserted past here.` : `Slot ${i} is not empty.`, { key, i }, { hl: at(i, 'active') });
      if (m.state[i] === EMPTY) return t.step('not_found', `${key} is not in the table.`, { key, i }, { ok: false });
      const hit = m.state[i] === OCC && m.keys[i] === key;
      t.step(
        'compare',
        m.state[i] === DEL ? `Slot ${i} is a tombstone: keep probing.` : `Does slot ${i} hold ${key}? ${hit ? 'Yes!' : `No, it holds ${m.keys[i]}.`}`,
        { key, i },
        { hl: at(i, hit ? 'found' : 'active') }
      );
      if (hit) return onHit(i);
      t.mark('c' + i, 'visited');
      i = (i + 1) % CAP;
      t.step('next', `Linear probing: try the next slot, ${i}.`, { key, i }, { hl: at(i, 'active') });
    }
    t.step('exhausted', `Every slot was checked: ${key} is not ${word}.`, { key, i }, { ok: false });
  }

  DSV.register({
    id: 'hash-table-open-addressing',
    title: 'Hash Table (Open Addressing)',
    about:
      'All entries live directly in one array. On a collision, linear probing tries the next slot, then the next, wrapping around. A removed entry becomes a tombstone (DEL) rather than empty; otherwise a later search would stop early and miss keys that probed past it.',
    init: { default: '22, 33, 5, 16, 9, 44', max: CAP, random: [6, 0, 99], parse: (t) => DSV.parseInts(t, { min: 0 }) },
    complexity: {
      rows: [
        ['Put', 'O(1)', 'O(n)'],
        ['Get', 'O(1)', 'O(n)'],
        ['Remove', 'O(1)', 'O(n)'],
      ],
      space: 'O(capacity)',
      notes: 'Keys 22, 33 and 44 all hash to slot 0 and pile up into a cluster, which is the main weakness of linear probing. Keep the load factor below about 0.7. Each initial key k gets value k × 10.',
    },

    create(keys) {
      const m = { keys: Array(CAP).fill(0), values: Array(CAP).fill(0), state: Array(CAP).fill(EMPTY), size: 0 };
      for (const k of keys) {
        let i = k % CAP;
        while (m.state[i] === OCC && m.keys[i] !== k) i = (i + 1) % CAP;
        if (m.state[i] === OCC) continue;
        m.keys[i] = k;
        m.values[i] = k * 10;
        m.state[i] = OCC;
        m.size++;
      }
      return { model: m, msg: `Inserted ${m.size} keys (value = key × 10) into ${CAP} slots with linear probing.` };
    },
    snapshot: (m) => ({ keys: m.keys.slice(), values: m.values.slice(), state: m.state.slice() }),

    layout(frame) {
      const st = frame.state;
      const nodes = DSV.cells(
        st.state.map((s, i) => (s === OCC ? `${st.keys[i]}:${st.values[i]}` : s === DEL ? 'DEL' : null)),
        { w: 62, hl: frame.hl, cls: (i) => (st.state[i] === DEL ? 'tomb' : '') }
      );
      return { nodes, edges: [], pointers: DSV.indexPointers(frame, ['i', 'first_free'], 'c', CAP) };
    },

    scenarios: [
      ['22 33 5', 'put', [44, 1]],
      ['22 33 5', 'put', [33, 1]],
      ['0 1 2 3 4 5 6 7 8 9 10', 'put', [11, 1]],
      ['22 33 5', 'put', [44, 1], [['remove', [33]]]],
      ['0 1 2 3 4 5 6 7 8 9 10', 'put', [11, 1], [['remove', [5]]]],
      ['22 33 5', 'get', [33]],
      ['22 33 5', 'get', [44]],
      ['0 1 2 3 4 5 6 7 8 9 10', 'get', [11]],
      ['22 33 5', 'remove', [33]],
      ['22 33 5', 'remove', [44]],
      ['0 1 2 3 4 5 6 7 8 9 10', 'remove', [11]],
    ],

    ops: [
      {
        id: 'put',
        label: 'put(key, value)',
        args: [keyArg('key', 55), { name: 'value', default: 7 }],
        run(t, m, key, value) {
          let i = key % CAP;
          t.step('hash', `Home slot: ${key} % ${CAP} = ${i}.`, { key, value, i }, { hl: at(i, 'active') });
          let ff = -1;
          const v = () => ({ key, value, i, first_free: ff });
          t.step('init_free', 'first_free = -1: no reusable tombstone seen yet.', v(), { hl: at(i, 'active') });
          let probe = 0;
          for (; ; probe++) {
            t.step('probe', probe < CAP ? `Probe #${probe + 1}: slot ${i}.` : `Probed all ${CAP} slots.`, v(), { hl: at(i, 'active') });
            if (probe >= CAP) break;
            t.step('check_empty', m.state[i] === EMPTY ? `Slot ${i} is empty.` : `Slot ${i} is not empty.`, v(), { hl: at(i, 'active') });
            if (m.state[i] === EMPTY) {
              t.step('stop', `Stop: the key is not in the table, and slot ${i} is free.`, v(), { hl: at(i, 'found') });
              break;
            }
            t.step('check_deleted', m.state[i] === DEL ? `Slot ${i} is a tombstone.` : `Slot ${i} holds ${m.keys[i]}.`, v(), { hl: at(i, 'active') });
            if (m.state[i] === DEL) {
              if (ff === -1) {
                ff = i;
                t.step('remember', `Remember slot ${i} as a reusable spot, but keep probing in case the key is further on.`, v(), { hl: at(i, 'visited') });
              }
            } else {
              const eq = m.keys[i] === key;
              t.step('compare', `Is ${m.keys[i]} == ${key}? ${eq ? 'Yes.' : 'No: collision.'}`, v(), { hl: at(i, eq ? 'found' : 'active') });
              if (eq) {
                m.values[i] = value;
                return t.step('update', `Key exists: overwrite its value with ${value}.`, v(), { hl: at(i, 'found'), ok: true });
              }
            }
            t.mark('c' + i, 'visited');
            i = (i + 1) % CAP;
            t.step('next', `Try slot ${i}.`, v(), { hl: at(i, 'active') });
          }
          t.step('check_free', ff !== -1 ? `A tombstone was seen at slot ${ff}.` : 'No tombstone was seen.', v());
          if (ff !== -1) {
            i = ff;
            t.step('use_free', `Reuse tombstone slot ${i}.`, v(), { hl: at(i, 'active') });
          } else {
            const full = m.state[i] !== EMPTY;
            t.step('check_full', full ? 'No empty slot and no tombstone anywhere.' : `Slot ${i} is empty.`, v(), { hl: at(i, 'active') });
            if (full) return t.step('full', 'The table is full: raise an error.', v(), { ok: false });
          }
          m.keys[i] = key;
          m.values[i] = value;
          m.state[i] = OCC;
          t.step('place', `Store ${key}:${value} in slot ${i}.`, v(), { hl: at(i, 'new') });
          m.size++;
          t.step('done', `size = ${m.size}. Load factor = ${m.size}/${CAP} ≈ ${(m.size / CAP).toFixed(2)}.`, v(), { hl: at(i, 'found'), ok: true });
        },
      },
      {
        id: 'get',
        label: 'get(key)',
        args: [keyArg('key', 33)],
        run(t, m, key) {
          lookup(t, m, key, (i) => t.step('found', `Return ${m.values[i]}.`, { key, i }, { hl: at(i, 'found'), ok: true }), 'in the table');
        },
      },
      {
        id: 'remove',
        label: 'remove(key)',
        args: [keyArg('key', 33)],
        run(t, m, key) {
          lookup(
            t,
            m,
            key,
            (i) => {
              m.state[i] = DEL;
              m.size--;
              t.step('tombstone', `Mark slot ${i} as DELETED (a tombstone) and decrement size.`, { key, i }, { hl: at(i, 'removed') });
              t.step('done', `Removed ${key}. Searches for keys beyond it will still probe past this slot.`, { key, i }, { ok: true });
            },
            'in the table'
          );
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
