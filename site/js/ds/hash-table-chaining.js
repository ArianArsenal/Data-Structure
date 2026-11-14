/* Hash table with separate chaining: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const CAP = 7;
  const MAX = 20;
  const RH = 56; // row height
  const SP = 110;

  const hl = (...p) => {
    const o = {};
    for (let i = 0; i < p.length; i += 2) if (p[i]) o[p[i].id] = p[i + 1];
    return o;
  };
  const name = (e) => (e ? `entry ${e.key}:${e.value}` : '%null%');
  const keyArg = (n, d) => ({ name: n, default: d, min: 0, max: 999 });

  DSV.register({
    id: 'hash-table-chaining',
    title: 'Hash Table (Chaining)',
    about:
      'A hash function turns the key into a bucket index (here key % 7). Keys that land in the same bucket "collide" and share a linked list. With a good hash and a bounded load factor, chains stay short, so put, get and remove are O(1) on average.',
    init: { default: '10, 3, 17, 24, 5, 12', max: 14, random: [7, 0, 60], parse: (t) => DSV.parseInts(t, { min: 0 }) },
    complexity: {
      rows: [
        ['Put', 'O(1)', 'O(n)'],
        ['Get', 'O(1)', 'O(n)'],
        ['Remove', 'O(1)', 'O(n)'],
      ],
      space: 'O(n + capacity)',
      notes: 'Worst case: every key lands in one bucket. Real tables grow and rehash when size / capacity passes a load-factor threshold (e.g. 0.75). Each initial key k gets value k × 10.',
    },

    create(keys) {
      const buckets = Array(CAP).fill(null);
      let size = 0;
      for (const k of keys) {
        const i = k % CAP;
        let e = buckets[i];
        while (e && e.key !== k) e = e.next;
        if (e) continue;
        buckets[i] = DSV.node({ key: k, value: k * 10, next: buckets[i] });
        size++;
      }
      return { model: { buckets, size }, msg: `Inserted ${size} keys (value = key × 10) into ${CAP} buckets.` };
    },

    snapshot(m, vars) {
      const chains = m.buckets.map((head) => {
        const ids = [];
        for (let e = head; e; e = e.next) ids.push(e.id);
        return ids;
      });
      const entries = {};
      const visit = (e) => {
        for (; e && !entries[e.id]; e = e.next) entries[e.id] = { id: e.id, key: e.key, value: e.value, next: e.next ? e.next.id : null };
      };
      m.buckets.forEach(visit);
      for (const k in vars) if (DSV.isNode(vars[k])) visit(vars[k]);
      return { chains, entries };
    },

    layout(frame) {
      const st = frame.state;
      const nodes = [];
      const edges = [];
      const pos = {};
      st.chains.forEach((ids, i) => {
        nodes.push({ id: 'b' + i, x: 0, y: i * RH, shape: 'box', w: 44, text: ids.length ? '•' : '∅', cls: frame.hl['b' + i] });
        nodes.push(DSV.label('bi' + i, -38, i * RH, i));
        ids.forEach((id, j) => (pos[id] = { x: 120 + j * SP, y: i * RH }));
        if (ids.length) edges.push({ from: 'b' + i, to: ids[0], port: 'right' });
      });
      const bucket = frame.vars.i && frame.vars.i.t === 'val' ? frame.vars.i.v : 0;
      for (const id in st.entries) {
        if (pos[id]) continue;
        const prev = frame.vars.prev && frame.vars.prev.t === 'node' && pos[frame.vars.prev.id];
        pos[id] = prev ? { x: prev.x + SP / 2, y: prev.y + 30 } : { x: 70, y: bucket * RH + 30 };
      }
      for (const id in st.entries) {
        const e = st.entries[id];
        nodes.push({ id, x: pos[id].x, y: pos[id].y, shape: 'list', text: `${e.key}:${e.value}`, nil: !e.next, cls: frame.hl[id] });
        if (e.next) edges.push({ from: id, to: e.next, port: 'right' });
      }
      nodes.push(DSV.label('lb', 0, -34, 'buckets', 'strong'));
      return { nodes, edges, pointers: DSV.varPointers(frame, []) };
    },

    scenarios: [
      ['10 3 17', 'put', [24, 1]],
      ['10 3 17', 'put', [17, 1]],
      ['10 3 17', 'get', [3]],
      ['10 3 17', 'get', [31]],
      ['10 3 17', 'remove', [3]],
      ['10 3 17', 'remove', [10]],
      ['10 3 17', 'remove', [24]],
      ['10 3 17', 'remove', [17]],
    ],

    ops: [
      {
        id: 'put',
        label: 'put(key, value)',
        args: [keyArg('key', 31), { name: 'value', default: 99 }],
        check: (m) => (m.size >= MAX ? `This demo is limited to ${MAX} entries.` : null),
        run(t, m, key, value) {
          const i = key % CAP;
          t.step('hash', `hash: ${key} % ${CAP} = ${i}. The key belongs in bucket ${i}.`, { key, value, i }, { hl: { ['b' + i]: 'active' } });
          let curr = m.buckets[i];
          t.step('start', `Walk bucket ${i}'s chain, starting at ${name(curr)}.`, { key, value, i, curr }, { hl: { ['b' + i]: 'active', ...hl(curr, 'active') } });
          for (;;) {
            t.step('loop', curr ? `curr is ${name(curr)}.` : 'End of chain: the key is new.', { key, value, i, curr }, { hl: { ['b' + i]: 'active', ...hl(curr, 'active') } });
            if (!curr) break;
            const eq = curr.key === key;
            t.step('compare', `Is ${curr.key} == ${key}? ${eq ? 'Yes: the key exists.' : 'No.'}`, { key, value, i, curr }, { hl: hl(curr, eq ? 'found' : 'active') });
            if (eq) {
              curr.value = value;
              return t.step('update', `Overwrite its value with ${value}.`, { key, value, i, curr }, { hl: hl(curr, 'found'), ok: true });
            }
            curr = curr.next;
            t.step('advance', `Move to ${name(curr)}.`, { key, value, i, curr }, { hl: hl(curr, 'active') });
          }
          const e = DSV.node({ key, value, next: m.buckets[i] });
          m.buckets[i] = e;
          t.step('prepend', `Insert a new entry at the front of bucket ${i} (O(1), no need to walk to the end).`, { key, value, i }, { hl: hl(e, 'new') });
          m.size++;
          t.step('done', `size = ${m.size}. Load factor = ${m.size}/${CAP} ≈ ${(m.size / CAP).toFixed(2)}.`, { key, value, i }, { hl: hl(e, 'found'), ok: true });
        },
      },
      {
        id: 'get',
        label: 'get(key)',
        args: [keyArg('key', 17)],
        run(t, m, key) {
          const i = key % CAP;
          t.step('hash', `hash: ${key} % ${CAP} = ${i}.`, { key, i }, { hl: { ['b' + i]: 'active' } });
          let curr = m.buckets[i];
          t.step('start', `Start at the head of bucket ${i}.`, { key, i, curr }, { hl: { ['b' + i]: 'active', ...hl(curr, 'active') } });
          for (;;) {
            t.step('loop', curr ? `curr is ${name(curr)}.` : 'End of chain.', { key, i, curr }, { hl: hl(curr, 'active') });
            if (!curr) break;
            const eq = curr.key === key;
            t.step('compare', `Is ${curr.key} == ${key}? ${eq ? 'Yes!' : 'No.'}`, { key, i, curr }, { hl: hl(curr, eq ? 'found' : 'active') });
            if (eq) return t.step('found', `Return ${curr.value}.`, { key, i, curr }, { hl: hl(curr, 'found'), ok: true });
            t.mark(curr.id, 'visited');
            curr = curr.next;
            t.step('advance', `Move to ${name(curr)}.`, { key, i, curr }, { hl: hl(curr, 'active') });
          }
          t.step('not_found', `${key} is not in the table; return %null%.`, { key, i }, { ok: false });
        },
      },
      {
        id: 'remove',
        label: 'remove(key)',
        args: [keyArg('key', 10)],
        run(t, m, key) {
          const i = key % CAP;
          t.step('hash', `hash: ${key} % ${CAP} = ${i}.`, { key, i }, { hl: { ['b' + i]: 'active' } });
          let prev = null;
          let curr = m.buckets[i];
          t.step('start', 'prev = %null%, curr = first entry of the bucket.', { key, i, prev, curr }, { hl: hl(curr, 'active') });
          for (;;) {
            t.step('loop', curr ? `curr is ${name(curr)}.` : 'End of chain.', { key, i, prev, curr }, { hl: hl(curr, 'active') });
            if (!curr) break;
            const eq = curr.key === key;
            t.step('compare', `Is ${curr.key} == ${key}? ${eq ? 'Yes.' : 'No.'}`, { key, i, prev, curr }, { hl: hl(curr, eq ? 'removed' : 'active') });
            if (eq) {
              t.step('check_first', prev ? 'It is not the first entry in the chain.' : 'It is the first entry in the chain.', { key, i, prev, curr }, { hl: hl(curr, 'removed') });
              if (!prev) {
                m.buckets[i] = curr.next;
                t.step('unlink_first', `The bucket now starts at ${name(curr.next)}.`, { key, i, prev, curr }, { hl: hl(curr, 'removed') });
              } else {
                prev.next = curr.next;
                t.step('unlink', `prev.next skips to ${name(curr.next)}.`, { key, i, prev, curr }, { hl: hl(prev, 'active', curr, 'removed') });
              }
              m.size--;
              t.step('release', 'Release the entry (C++ deletes it) and decrement size.', { key, i });
              return t.step('done', `Removed ${key}.`, { key, i }, { ok: true });
            }
            prev = curr;
            curr = curr.next;
            t.step('advance', `prev = ${name(prev)}, curr = ${name(curr)}.`, { key, i, prev, curr }, { hl: hl(curr, 'active') });
          }
          t.step('not_found', `${key} is not in the table.`, { key, i }, { ok: false });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
