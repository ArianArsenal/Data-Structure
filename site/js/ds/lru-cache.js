/* LRU cache: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const CAP = 3;
  const H = { op: 'helpers' };

  const hl = (...p) => {
    const o = {};
    for (let i = 0; i < p.length; i += 2) if (p[i]) o[p[i].id] = p[i + 1];
    return o;
  };
  const opt = (x) => Object.assign({}, H, x);

  function unlink(t, node, v) {
    node.prev.next = node.next;
    t.step('ul_next', `Unlink: the previous node now skips over ${node.key}.`, v, opt({ hl: hl(node, 'active') }));
    node.next.prev = node.prev;
    t.step('ul_prev', `Unlink: the next node's prev skips back over ${node.key}.`, v, opt({ hl: hl(node, 'active') }));
  }

  function pushFront(t, m, node, v) {
    node.next = m.head.next;
    t.step('pf_next', `node.next = head.next (the current most recent entry).`, v, opt({ hl: hl(node, 'new') }));
    node.prev = m.head;
    t.step('pf_prev', 'node.prev = head sentinel.', v, opt({ hl: hl(node, 'new') }));
    m.head.next.prev = node;
    t.step('pf_old', 'The old first entry points back to node.', v, opt({ hl: hl(node, 'new') }));
    m.head.next = node;
    t.hint = {};
    t.step('pf_head', `head.next = node: ${node.key} is now the most recently used.`, v, opt({ hl: hl(node, 'found') }));
  }

  function moveToFront(t, m, node, v) {
    t.step('mf_unlink', `Move ${node.key} to the front: first unlink it.`, v, opt({ hl: hl(node, 'active') }));
    unlink(t, node, v);
    t.step('mf_push', 'Then push it right after head.', v, opt({ hl: hl(node, 'active') }));
    pushFront(t, m, node, v);
  }

  function fresh() {
    const head = DSV.node({ key: 'head', value: null, sentinel: true, prev: null, next: null });
    const tail = DSV.node({ key: 'tail', value: null, sentinel: true, prev: head, next: null });
    head.next = tail;
    return { head, tail, map: new Map() };
  }

  DSV.register({
    id: 'lru-cache',
    title: 'LRU Cache',
    about:
      'A fixed-size cache that evicts the Least Recently Used entry when full. A hash map finds any entry in O(1); a doubly linked list keeps entries in recency order, so moving one to the front or dropping the oldest from the back is also O(1).',
    init: { default: '1, 2, 3', max: CAP, random: [3, 1, 9], parse: (t) => DSV.parseInts(t, { min: 0 }) },
    complexity: {
      rows: [
        ['Get', 'O(1)', 'O(1)'],
        ['Put (with eviction)', 'O(1)', 'O(1)'],
      ],
      space: 'O(capacity)',
      notes: 'Capacity is 3. Left of the list = most recent; right = next to be evicted. The head and tail sentinels mean no edge cases for empty lists. Initial key k gets value k × 10.',
    },

    create(keys) {
      const m = fresh();
      for (const k of keys) {
        if (m.map.has(k)) continue;
        const n = DSV.node({ key: k, value: k * 10, prev: m.head, next: m.head.next });
        m.head.next.prev = n;
        m.head.next = n;
        m.map.set(k, n);
      }
      return { model: m, msg: `Put ${m.map.size} keys; the last one put is the most recent.` };
    },

    snapshot(m, vars) {
      const nodes = {};
      const visit = (n) => {
        for (; n && !nodes[n.id]; n = n.next)
          nodes[n.id] = { id: n.id, value: n.sentinel ? n.key : `${n.key}:${n.value}`, next: n.next ? n.next.id : null, prev: n.prev ? n.prev.id : null };
      };
      visit(m.head);
      for (const k in vars) if (DSV.isNode(vars[k])) visit(vars[k]);
      return { head: m.head.id, nodes, map: [...m.map.entries()].sort((a, b) => a[0] - b[0]).map(([k, n]) => [k, n.id]) };
    },

    layout(frame) {
      const sc = DSV.listLayout(frame, { shape: 'dlist', noHead: true });
      const st = frame.state;
      const xs = sc.nodes.filter((n) => n.y === 0).map((n) => n.x);
      const mid = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0;
      st.map.forEach(([k, id], j) => {
        const mid2 = 'm' + k;
        sc.nodes.push({ id: mid2, x: mid + (j - (st.map.length - 1) / 2) * 70, y: -130, shape: 'box', text: k, cls: frame.hl[mid2] });
        sc.edges.push({ from: mid2, to: id, kind: 'line', cls: 'dim' });
      });
      sc.nodes.push(DSV.label('lmap', mid - ((st.map.length + 1) / 2) * 70 - 10, -130, 'map', 'strong', 'end'));
      return sc;
    },

    scenarios: [
      ['1 2 3', 'get', [2]],
      ['1 2 3', 'get', [9]],
      ['1 2 3', 'put', [2, 5]],
      ['1 2 3', 'put', [4, 5]],
      ['1 2', 'put', [4, 5]],
    ],

    ops: [
      {
        id: 'get',
        label: 'get(key)',
        args: [{ name: 'key', default: 1, min: 0 }],
        run(t, m, key) {
          const has = m.map.has(key);
          t.step('lookup', `Is ${key} in the map? ${has ? 'Yes.' : 'No.'}`, { key }, { hl: has ? { ['m' + key]: 'found' } : {} });
          if (!has) return t.step('miss', 'Cache miss: return -1.', { key }, { ok: false });
          const node = m.map.get(key);
          t.step('hit', `Cache hit: the map points straight at its node, no list walk needed.`, { key, node }, { hl: hl(node, 'found') });
          t.step('touch', `${key} was just used, so it becomes the most recent.`, { key, node }, { hl: hl(node, 'active') });
          moveToFront(t, m, node, { key, node });
          t.step('done', `Return ${node.value}.`, { key, node }, { hl: hl(node, 'found'), ok: true });
        },
      },
      {
        id: 'put',
        label: 'put(key, value)',
        args: [
          { name: 'key', default: 4, min: 0 },
          { name: 'value', default: 40 },
        ],
        run(t, m, key, value) {
          const has = m.map.has(key);
          t.step('lookup', `Is ${key} already cached? ${has ? 'Yes.' : 'No.'}`, { key, value });
          if (has) {
            const node = m.map.get(key);
            t.step('hit', 'Found its node through the map.', { key, value, node }, { hl: hl(node, 'found') });
            node.value = value;
            t.step('update', `Update its value to ${value}.`, { key, value, node }, { hl: hl(node, 'found') });
            t.step('touch', 'Mark it most recently used.', { key, value, node }, { hl: hl(node, 'active') });
            moveToFront(t, m, node, { key, value, node });
            return;
          }
          const full = m.map.size === CAP;
          t.step('check_full', `Is the cache full (${m.map.size} of ${CAP})? ${full ? 'Yes: evict first.' : 'No.'}`, { key, value });
          if (full) {
            const lru = m.tail.prev;
            t.step('pick_lru', `The least recently used entry sits just before tail: ${lru.key}.`, { key, value, lru }, { hl: hl(lru, 'removed') });
            t.step('evict', `Unlink ${lru.key} from the list.`, { key, value, lru }, { hl: hl(lru, 'removed') });
            unlink(t, lru, { key, value, lru });
            m.map.delete(lru.key);
            t.step('forget', `Remove key ${lru.key} from the map. (C++ also deletes the node.)`, { key, value }, {});
          }
          const node = DSV.node({ key, value, prev: null, next: null });
          t.hint = { float: { [node.id]: 0.5 } };
          t.step('create', `Create a node for ${key}:${value}.`, { key, value, node }, { hl: hl(node, 'new') });
          m.map.set(key, node);
          t.step('remember', `map[${key}] = node.`, { key, value, node }, { hl: { [node.id]: 'new', ['m' + key]: 'new' } });
          t.step('insert', 'Push it to the front as the most recent entry.', { key, value, node }, { hl: hl(node, 'new') });
          pushFront(t, m, node, { key, value, node });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
