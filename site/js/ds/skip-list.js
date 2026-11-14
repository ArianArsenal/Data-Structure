/* Skip list: traced search / insert mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAXL = 4;
  const MAX = 16;
  const COL = 74;
  const ROWH = 50;

  const box = (n, lvl) => `${n.id || n}:${lvl}`;
  const randomLevel = () => {
    let l = 1;
    while (l < MAXL && Math.random() < 0.5) l++;
    return l;
  };
  const name = (n) => (n ? (n.key === 'head' ? 'head' : `node ${n.key}`) : '%null%');
  const count = (m) => {
    let c = 0;
    for (let n = m.head.next[0]; n; n = n.next[0]) c++;
    return c;
  };

  DSV.register({
    id: 'skip-list',
    title: 'Skip List',
    about:
      'A sorted linked list with "express lanes". Every node is on level 0; each node also appears on the next level up with probability ½ (decided by coin flips at insert time). A search starts on the top lane and drops down a level whenever the next key would overshoot, so it takes O(log n) expected steps.',
    init: { default: '3, 6, 7, 9, 12, 17, 19, 21', max: MAX, random: [8, 1, 60] },
    complexity: {
      rows: [
        ['Search', 'O(log n) expected', 'O(n)'],
        ['Insert', 'O(log n) expected', 'O(n)'],
      ],
      space: 'O(n) expected (about 2n pointers)',
      notes: 'Levels are random, so building the same values twice gives different towers. Redis sorted sets use skip lists.',
    },

    create(keys) {
      const head = DSV.node({ key: 'head', next: Array(MAXL).fill(null) });
      const m = { head, level: 1 };
      for (const k of [...new Set(keys)].sort((a, b) => a - b).reverse()) {
        const lv = randomLevel();
        const n = DSV.node({ key: k, next: Array(lv).fill(null) });
        for (let l = 0; l < lv; l++) {
          n.next[l] = head.next[l];
          head.next[l] = n;
        }
        m.level = Math.max(m.level, lv);
      }
      return { model: m, msg: `Inserted ${count(m)} keys with random tower heights; the list uses ${m.level} level(s).` };
    },

    snapshot(m, vars) {
      const nodes = {};
      const order = [];
      for (let n = m.head; n; n = n.next[0]) {
        order.push(n.id);
        nodes[n.id] = { id: n.id, key: n.key, next: n.next.map((x) => (x ? x.id : null)) };
      }
      for (const k in vars) {
        const n = vars[k];
        if (DSV.isNode(n) && !nodes[n.id]) nodes[n.id] = { id: n.id, key: n.key, next: n.next.map((x) => (x ? x.id : null)), floating: true };
      }
      return { order, nodes, level: m.level };
    },

    layout(frame) {
      const st = frame.state;
      const col = {};
      st.order.forEach((id, i) => (col[id] = i));
      const nodes = [];
      const edges = [];
      const cur = frame.vars.node && frame.vars.node.t === 'node' ? frame.vars.node.id : null;
      const lvl = frame.vars.lvl && frame.vars.lvl.t === 'val' ? frame.vars.lvl.v : null;
      const prevOf = frame.vars.update && frame.vars.update.t === 'list' ? frame.vars.update.items : [];
      for (const id in st.nodes) {
        const n = st.nodes[id];
        let x;
        let dy = 0;
        if (n.floating) {
          const anchor = prevOf[0] && prevOf[0].t === 'node' ? col[prevOf[0].id] : 0;
          x = (anchor + 0.5) * COL;
          dy = 70;
        } else x = col[id] * COL;
        n.next.forEach((nx, l) => {
          const isHead = n.key === 'head';
          const ghost = isHead && l >= st.level;
          const hot = id === cur && l === lvl;
          nodes.push({
            id: box(id, l),
            x,
            y: -l * ROWH + dy,
            shape: 'box',
            w: 46,
            h: 36,
            text: isHead ? (l === 0 ? 'H' : '') : n.key,
            cls: [ghost ? 'ghost' : '', hot ? 'active' : frame.hl[id] || ''].join(' '),
          });
          if (nx) edges.push({ from: box(id, l), to: box(nx, l), cls: hot ? 'hot' : '' });
        });
      }
      for (let l = 0; l < MAXL; l++) nodes.push(DSV.label('L' + l, -50, -l * ROWH, 'L' + l, '', 'end'));
      const pointers = [];
      for (const k of ['node', 'fresh']) {
        const v = frame.vars[k];
        if (v && v.t === 'node' && st.nodes[v.id]) pointers.push({ name: k, target: box(v.id, st.nodes[v.id].next.length - 1) });
      }
      return { nodes, edges, pointers };
    },

    scenarios: [
      ['3 6 7 9 12 17 19 21', 'search', [17]],
      ['3 6 7 9 12 17 19 21', 'search', [10]],
      ['3 6 7 9 12', 'insert', [8]],
      ['3 6 7 9 12', 'insert', [7]],
    ],

    ops: [
      {
        id: 'search',
        label: 'search(key)',
        args: [{ name: 'key', default: 17 }],
        run(t, m, key) {
          let node = m.head;
          t.step('start', `Start at the head on the top level in use (L${m.level - 1}).`, { key, node });
          for (let lvl = m.level - 1; ; lvl--) {
            t.step('level', lvl >= 0 ? `Search lane L${lvl}.` : 'Below level 0: stop.', { key, node, lvl });
            if (lvl < 0) break;
            for (;;) {
              const nx = node.next[lvl];
              const go = nx && nx.key < key;
              t.step('check_right', nx ? `Next on L${lvl} is ${nx.key}. ${go ? `${nx.key} < ${key}: move right.` : `${nx.key} ≥ ${key}: drop down.`}` : `Nothing to the right on L${lvl}: drop down.`, { key, node, lvl }, { hl: nx ? { [box(nx, lvl)]: go ? 'visited' : 'removed' } : {} });
              if (!go) break;
              node = nx;
              t.step('move_right', `Move to ${name(node)} on L${lvl}.`, { key, node, lvl });
            }
          }
          node = node.next[0];
          t.step('bottom', `Step to the next node on L0: ${name(node)}.`, { key, node }, { hl: node ? { [node.id]: 'active' } : {} });
          const hit = !!node && node.key === key;
          t.step('check', hit ? `${node.key} == ${key}: found!` : `${key} is not in the list.`, { key, node }, { hl: node ? { [node.id]: hit ? 'found' : 'removed' } : {}, ok: hit });
        },
      },
      {
        id: 'insert',
        label: 'insert(key)',
        args: [{ name: 'key', default: 10 }],
        check: (m) => (count(m) >= MAX ? `This demo is limited to ${MAX} keys.` : null),
        run(t, m, key) {
          const update = Array(MAXL).fill(m.head);
          let node = m.head;
          t.step('init', 'update[l] will hold the last node before the insertion point on each level.', { key, update: update.slice(), node });
          for (let lvl = m.level - 1; ; lvl--) {
            t.step('level', lvl >= 0 ? `Search lane L${lvl}.` : 'All levels searched.', { key, node, lvl, update: update.slice() });
            if (lvl < 0) break;
            for (;;) {
              const nx = node.next[lvl];
              const go = nx && nx.key < key;
              t.step('check_right', nx ? `Next on L${lvl} is ${nx.key}: ${go ? 'move right.' : 'stop here.'}` : 'End of lane.', { key, node, lvl, update: update.slice() }, { hl: nx ? { [box(nx, lvl)]: go ? 'visited' : 'removed' } : {} });
              if (!go) break;
              node = nx;
              t.step('move_right', `Move to ${name(node)}.`, { key, node, lvl, update: update.slice() });
            }
            update[lvl] = node;
            t.step('remember', `update[${lvl}] = ${name(node)}.`, { key, node, lvl, update: update.slice() }, { hl: { [box(node, lvl)]: 'found' } });
          }
          const dup = node.next[0] && node.next[0].key === key;
          t.step('check_dup', dup ? `${key} is already present.` : `${key} is new.`, { key, node, update: update.slice() });
          if (dup) return t.step('duplicate', 'Return %false%.', { key }, { ok: false });
          const level = randomLevel();
          t.step('coin', `Flip coins: the new tower gets ${level} level${level > 1 ? 's' : ''}.`, { key, level, update: update.slice() });
          m.level = Math.max(m.level, level);
          const fresh = DSV.node({ key, next: Array(level).fill(null) });
          t.step('create', `Create ${key} with ${level} next pointer(s).`, { key, level, fresh, update: update.slice() }, { hl: { [fresh.id]: 'new' } });
          for (let lvl = 0; ; lvl++) {
            t.step('link_loop', lvl < level ? `Link level ${lvl}.` : 'All levels linked.', { key, level, fresh, lvl, update: update.slice() }, { hl: { [fresh.id]: 'new' } });
            if (lvl >= level) break;
            fresh.next[lvl] = update[lvl].next[lvl];
            t.step('link_next', `fresh.next[${lvl}] = ${name(fresh.next[lvl])}.`, { key, level, fresh, lvl, update: update.slice() }, { hl: { [fresh.id]: 'new' } });
            update[lvl].next[lvl] = fresh;
            t.step('link_prev', `${name(update[lvl])}.next[${lvl}] = fresh.`, { key, level, fresh, lvl, update: update.slice() }, { hl: { [fresh.id]: 'new' } });
          }
          t.step('done', `Inserted ${key}.`, { key }, { hl: { [fresh.id]: 'found' }, ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
