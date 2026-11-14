/* Hash table with separate chaining: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const CAP0 = 7;
  const MAX = 14; // keeps the table at most 14 buckets tall
  const RH = 50; // row height
  const SP = 110;

  const hl = (...p) => {
    const o = {};
    for (let i = 0; i < p.length; i += 2) if (p[i]) o[p[i].id] = p[i + 1];
    return o;
  };
  const name = (e) => (e ? `entry ${e.key}:${e.value}` : '%null%');
  const keyArg = (n, d) => ({ name: n, default: d, min: 0, max: 999 });
  const load = (m) => `${m.size}/${m.buckets.length} ≈ ${(m.size / m.buckets.length).toFixed(2)}`;
  const SILENT = { step() {}, mark() {} };

  // _resize: entries still waiting to be rehashed are kept in m.pending for the picture.
  function resize(t, m, capacity) {
    const old = m.buckets;
    m.pending = [];
    for (const head of old) for (let e = head; e; e = e.next) m.pending.push(e);
    t.step('rs_old', `Keep the old ${old.length} buckets while we move entries out of them.`, { capacity });
    m.buckets = Array(capacity).fill(null);
    t.step('rs_alloc', `Allocate ${capacity} empty buckets. Every key must be rehashed: key % ${capacity} differs from key % ${old.length}.`, { capacity });
    for (let b = 0; b < old.length; b++) {
      t.step('rs_bucket', `Old bucket ${b}.`, { capacity, b });
      let curr = old[b];
      for (;;) {
        t.step('rs_loop', curr ? `Move ${name(curr)}.` : `Old bucket ${b} is done.`, { capacity, b, curr }, { hl: hl(curr, 'active') });
        if (!curr) break;
        const nxt = curr.next;
        t.step('rs_save', `Save its next (${name(nxt)}) before relinking.`, { capacity, b, curr, nxt }, { hl: hl(curr, 'active') });
        const i = curr.key % capacity;
        t.step('rs_hash', `New bucket: ${curr.key} % ${capacity} = ${i}.`, { capacity, b, curr, nxt, i }, { hl: Object.assign(hl(curr, 'active'), { ['b' + i]: 'active' }) });
        curr.next = m.buckets[i];
        m.buckets[i] = curr;
        m.pending.splice(m.pending.indexOf(curr), 1);
        t.step('rs_move', `Prepend it to new bucket ${i}.`, { capacity, b, curr, nxt, i }, { hl: hl(curr, 'new') });
        curr = nxt;
      }
    }
    m.pending = null;
  }

  function put(t, m, key, value) {
    const i = key % m.buckets.length;
    t.step('hash', `hash: ${key} % ${m.buckets.length} = ${i}. The key belongs in bucket ${i}.`, { key, value, i }, { hl: { ['b' + i]: 'active' } });
    let curr = m.buckets[i];
    t.step('start', `Walk bucket ${i}, starting at ${name(curr)}.`, { key, value, i, curr }, { hl: Object.assign({ ['b' + i]: 'active' }, hl(curr, 'active')) });
    for (;;) {
      t.step('loop', curr ? `curr is ${name(curr)}.` : 'End of chain: the key is new.', { key, value, i, curr }, { hl: hl(curr, 'active') });
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
    t.step('done', `size = ${m.size}. Load factor = ${load(m)}.`, { key, value, i }, { hl: hl(e, 'found') });
    const grow = m.size > m.buckets.length;
    t.step('check_load', grow ? `size ${m.size} > capacity ${m.buckets.length}: chains are getting long, so grow.` : 'The load factor is at most 1: no resize needed.', { key, value }, { ok: grow ? undefined : true });
    if (grow) {
      t.step('grow', `Resize to ${2 * m.buckets.length} buckets.`, { key, value });
      resize(t, m, 2 * m.buckets.length);
      t.step('grow', `Resized. Load factor = ${load(m)}.`, { key, value }, { ok: true });
    }
  }

  DSV.register({
    id: 'hash-table-chaining',
    title: 'Hash Table (Chaining)',
    about:
      'A hash function turns the key into a bucket index (key % capacity). Keys that land in the same bucket collide and share a linked list. When the number of entries exceeds the number of buckets, the table doubles in size and rehashes every entry, so chains stay short and put, get and remove stay O(1) on average.',
    init: { default: '10, 3, 17, 24, 5, 12', max: MAX, random: [7, 0, 60], parse: (t) => DSV.parseInts(t, { min: 0 }) },
    complexity: {
      rows: [
        ['Put', 'O(1) amortized', 'O(n)'],
        ['Get', 'O(1)', 'O(n)'],
        ['Remove', 'O(1)', 'O(n)'],
        ['Resize (rehash)', 'O(n)', 'O(n)'],
      ],
      space: 'O(n + capacity)',
      notes: 'The table starts with 7 buckets and doubles when size > capacity. Put two more keys into the default table to watch a rehash. Java HashMap grows at a load factor of 0.75. Each initial key k gets value k × 10.',
    },

    create(keys) {
      const m = { buckets: Array(CAP0).fill(null), size: 0, pending: null };
      for (const k of keys) {
        let e = m.buckets[k % m.buckets.length];
        while (e && e.key !== k) e = e.next;
        if (!e) put(SILENT, m, k, k * 10);
      }
      return { model: m, msg: `Inserted ${m.size} keys (value = key × 10) into ${m.buckets.length} buckets.` };
    },

    snapshot(m, vars) {
      const chains = m.buckets.map((head) => {
        const ids = [];
        for (let e = head; e; e = e.next) ids.push(e.id);
        return ids;
      });
      const entries = {};
      const add = (e) => {
        if (e && !entries[e.id]) entries[e.id] = { id: e.id, key: e.key, value: e.value, next: e.next ? e.next.id : null };
      };
      m.buckets.forEach((h) => {
        for (let e = h; e; e = e.next) add(e);
      });
      (m.pending || []).forEach(add);
      for (const k in vars) if (DSV.isNode(vars[k])) add(vars[k]);
      return { chains, entries, pending: m.pending ? m.pending.map((e) => e.id) : null };
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
      const bottom = st.chains.length * RH + 30;
      if (st.pending) {
        nodes.push(DSV.label('lp', 60, bottom, 'to rehash', 'strong', 'end'));
        st.pending.forEach((id, j) => {
          if (!pos[id]) pos[id] = { x: 120 + j * SP, y: bottom };
        });
      }
      const bucket = frame.vars.i && frame.vars.i.t === 'val' ? frame.vars.i.v : 0;
      for (const id in st.entries) {
        if (pos[id]) continue;
        const prev = frame.vars.prev && frame.vars.prev.t === 'node' && pos[frame.vars.prev.id];
        pos[id] = prev ? { x: prev.x + SP / 2, y: prev.y + 28 } : { x: 70, y: bucket * RH + 28 };
      }
      const live = st.pending ? new Set(st.chains.flat()) : null;
      for (const id in st.entries) {
        const e = st.entries[id];
        nodes.push({ id, x: pos[id].x, y: pos[id].y, shape: 'list', text: `${e.key}:${e.value}`, nil: !e.next, cls: frame.hl[id] });
        // While rehashing, old next links of waiting entries are noise: only draw links inside new chains.
        if (e.next && (!live || live.has(id))) edges.push({ from: id, to: e.next, port: 'right' });
      }
      nodes.push(DSV.label('lb', 0, -34, `buckets (${st.chains.length})`, 'strong'));
      return { nodes, edges, pointers: DSV.varPointers(frame, []) };
    },

    scenarios: [
      ['10 3 17', 'put', [24, 1]],
      ['10 3 17', 'put', [17, 1]],
      ['1 2 3 4 5 6 7', 'put', [8, 1]],
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
        run: (t, m, key, value) => put(t, m, key, value),
      },
      {
        id: 'get',
        label: 'get(key)',
        args: [keyArg('key', 17)],
        run(t, m, key) {
          const i = key % m.buckets.length;
          t.step('hash', `hash: ${key} % ${m.buckets.length} = ${i}.`, { key, i }, { hl: { ['b' + i]: 'active' } });
          let curr = m.buckets[i];
          t.step('start', `Start at the head of bucket ${i}.`, { key, i, curr }, { hl: Object.assign({ ['b' + i]: 'active' }, hl(curr, 'active')) });
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
          const i = key % m.buckets.length;
          t.step('hash', `hash: ${key} % ${m.buckets.length} = ${i}.`, { key, i }, { hl: { ['b' + i]: 'active' } });
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
