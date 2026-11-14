/* Bloom filter: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const M = 16;
  const SEEDS = [7, 11, 13];
  const h = (item, seed) => (item * seed + seed) % M;
  const arg = (d) => ({ name: 'item', default: d, min: 0, max: 999 });

  DSV.register({
    id: 'bloom-filter',
    title: 'Bloom Filter',
    about:
      'A compact, probabilistic set. add(x) sets k bits chosen by k hash functions. might_contain(x) checks those same bits: if any is 0, x was definitely never added; if all are 1, x was probably added. Other items may have set those bits, which causes false positives.',
    init: { default: '3, 10, 42', max: 10, random: [3, 0, 99], parse: (t) => DSV.parseInts(t, { min: 0 }) },
    complexity: {
      rows: [
        ['Add', 'O(k)', 'O(k)'],
        ['Might contain', 'O(k)', 'O(k)'],
        ['Delete', 'not supported', '-'],
      ],
      space: 'O(m) bits, independent of item size',
      notes: 'Here m = 16 bits and k = 3 hashes h(x) = (x·seed + seed) % 16 for seeds 7, 11, 13. Try might_contain on values you never added and look for a false positive.',
    },

    create(items) {
      const bits = Array(M).fill(false);
      for (const x of items) for (const s of SEEDS) bits[h(x, s)] = true;
      return { model: { bits, added: items.slice() }, msg: `Added ${items.length} items. ${bits.filter(Boolean).length} of ${M} bits are set.` };
    },
    snapshot: (m) => ({ bits: m.bits.slice(), added: m.added.slice() }),

    layout(frame) {
      const st = frame.state;
      const nodes = DSV.cells(
        st.bits.map((b) => (b ? 1 : 0)),
        { w: 40, hl: frame.hl, cls: (i) => (st.bits[i] ? 'on' : '') }
      );
      nodes.push(DSV.label('added', -20, 70, `added so far: ${st.added.length ? st.added.join(', ') : 'nothing'}`, 'strong', 'start'));
      return { nodes, edges: [], pointers: DSV.indexPointers(frame, ['i'], 'c', M) };
    },

    scenarios: [
      ['3', 'add', [10]],
      ['3 10 42', 'might_contain', [3]],
      ['3', 'might_contain', [5]],
    ],

    ops: [
      {
        id: 'add',
        label: 'add(item)',
        args: [arg(25)],
        run(t, m, item) {
          SEEDS.forEach((seed, j) => {
            t.step('loop', `Hash function ${j + 1} of ${SEEDS.length}: seed = ${seed}.`, { item, seed });
            const i = h(item, seed);
            t.step('hash', `i = (${item} × ${seed} + ${seed}) % ${M} = ${i}.`, { item, seed, i }, { hl: { ['c' + i]: 'active' } });
            const was = m.bits[i];
            m.bits[i] = true;
            t.mark('c' + i, 'visited');
            t.step('set', was ? `bits[${i}] was already 1 (shared with another item).` : `Set bits[${i}] = 1.`, { item, seed, i }, { hl: { ['c' + i]: 'new' } });
          });
          m.added.push(item);
          t.step('loop', `All ${SEEDS.length} bits for ${item} are set. The item itself is not stored.`, { item }, { ok: true });
        },
      },
      {
        id: 'might_contain',
        label: 'might_contain(item)',
        args: [arg(17)],
        run(t, m, item) {
          for (const seed of SEEDS) {
            t.step('loop', `Next hash: seed = ${seed}.`, { item, seed });
            const i = h(item, seed);
            t.step('hash', `i = (${item} × ${seed} + ${seed}) % ${M} = ${i}.`, { item, seed, i }, { hl: { ['c' + i]: 'active' } });
            const set = m.bits[i];
            t.step('check', `bits[${i}] is ${set ? 1 : 0}.`, { item, seed, i }, { hl: { ['c' + i]: set ? 'found' : 'removed' } });
            if (!set) return t.step('definitely_not', `A required bit is 0, so ${item} was definitely never added. Return %false%.`, { item, seed, i }, { hl: { ['c' + i]: 'removed' }, ok: true });
            t.mark('c' + i, 'visited');
          }
          t.step('loop', 'Every hash checked.', { item });
          const real = m.added.includes(item);
          t.step(
            'maybe',
            real
              ? `All bits are 1: return %true%. ${item} really was added.`
              : `All bits are 1, so it returns %true%. But ${item} was never added: this is a false positive!`,
            { item },
            { ok: real }
          );
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
