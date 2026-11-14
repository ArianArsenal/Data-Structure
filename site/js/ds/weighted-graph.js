/* Weighted graph: traced Dijkstra and Kruskal mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const vid = (i) => 'v' + i;
  const eid = (a, b) => `e:${Math.min(a, b)}-${Math.max(a, b)}`;

  // "6: 0-1:4 0-2:1" -> { n: 6, edges: [[0,1,4],[0,2,1]] }
  function parse(text) {
    const m = /^\s*(\d+)\s*(?::(.*))?$/.exec(String(text));
    if (!m) throw new Error('Use the form "n: a-b:w c-d:w", e.g. 5: 0-1:4 0-2:1 1-2:2');
    const n = +m[1];
    if (n < 2 || n > 9) throw new Error('n must be between 2 and 9');
    const edges = [];
    const seen = new Set();
    for (const tok of (m[2] || '').split(/[\s,]+/).filter(Boolean)) {
      const p = /^(\d+)-(\d+):(\d+)$/.exec(tok);
      if (!p || +p[1] >= n || +p[2] >= n || p[1] === p[2] || +p[3] < 1 || +p[3] > 99)
        throw new Error(`"${tok}" must be a-b:w with different vertices below ${n} and weight 1..99`);
      const key = eid(+p[1], +p[2]);
      if (seen.has(key)) throw new Error(`Edge ${p[1]}-${p[2]} is listed twice`);
      seen.add(key);
      edges.push([+p[1], +p[2], +p[3]]);
    }
    return { n, edges };
  }

  // Min-heap of [d, v] pairs ordered like Python tuples; kept sorted for display.
  const heapPush = (h, item) => {
    h.push(item);
    h.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  };

  DSV.register({
    id: 'weighted-graph',
    title: 'Weighted Graph',
    about:
      'An undirected graph whose edges have weights (costs or distances). Dijkstra finds the shortest distance from one vertex to every other vertex by always settling the closest unsettled vertex next, using a priority queue. Kruskal builds a minimum spanning tree by taking edges from cheapest to most expensive, skipping any edge that would close a cycle (checked with union-find).',
    init: {
      default: '6: 0-1:7 0-2:9 0-5:14 1-2:10 1-3:15 2-3:11 2-5:2 3-4:6 4-5:9',
      parse,
      random: () => {
        const n = 6;
        const es = new Map();
        for (let i = 1; i < n; i++) es.set(eid(Math.floor(Math.random() * i), i), 1 + Math.floor(Math.random() * 20));
        for (let k = 0; k < 4; k++) {
          const a = Math.floor(Math.random() * n);
          const b = Math.floor(Math.random() * n);
          if (a !== b) es.set(eid(a, b), 1 + Math.floor(Math.random() * 20));
        }
        return `${n}: ${[...es].map(([k, w]) => `${k.slice(2)}:${w}`).join(' ')}`;
      },
    },
    complexity: {
      rows: [
        ['Dijkstra (binary heap)', 'O((V + E) log V)', 'O((V + E) log V)'],
        ['Kruskal', 'O(E log E)', 'O(E log E)'],
      ],
      space: 'O(V + E)',
      notes: 'Dijkstra needs non-negative weights. A popped entry whose distance is larger than the best known one is stale and is skipped (lazy deletion). Initial values use the form "n: a-b:w".',
    },

    create({ n, edges }) {
      const m = { n, adj: Array.from({ length: n }, () => []), edges: [] };
      for (const [u, v, w] of edges) {
        m.adj[u].push([v, w]);
        m.adj[v].push([u, w]);
        m.edges.push([w, u, v]);
      }
      return { model: m, msg: `Graph with ${n} vertices and ${edges.length} weighted edges.` };
    },
    snapshot: (m) => ({ n: m.n, edges: m.edges.map((e) => e.slice()) }),

    layout(frame) {
      const st = frame.state;
      const { R, at } = DSV.circle(st.n);
      const nodes = [];
      const edges = [];
      for (let i = 0; i < st.n; i++) {
        const p = at(i);
        nodes.push({ id: vid(i), x: p.x, y: p.y, shape: 'circle', text: i, cls: frame.hl[vid(i)] });
      }
      const ecls = { good: 'good', active: 'hot', dim: 'dim' };
      for (const [w, u, v] of st.edges) {
        edges.push({ from: vid(u), to: vid(v), kind: 'line', cls: ecls[frame.hl[eid(u, v)]] || '' });
        const a = at(u);
        const b = at(v);
        // Weight label at the midpoint, nudged away from the line.
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        nodes.push(DSV.label('w' + eid(u, v), mx + ((b.y - a.y) / len) * 11, my - ((b.x - a.x) / len) * 11, w, 'strong'));
      }
      const vars = frame.vars;
      const y0 = R + 70;
      if (vars.dist && vars.dist.t === 'list') {
        nodes.push(DSV.label('ldist', -R - 30, y0, 'dist', 'strong', 'end'));
        vars.dist.items.forEach((d, i) =>
          nodes.push({ id: 'd' + i, x: -R + i * 48, y: y0, shape: 'box', w: 42, h: 34, text: d.v === Infinity ? '∞' : d.v, sub: i, cls: frame.hl['d' + i] })
        );
      }
      if (vars.heap && vars.heap.t === 'list') {
        nodes.push(DSV.label('lheap', -R - 30, y0 + 70, 'heap', 'strong', 'end'));
        vars.heap.items.forEach((it, k) =>
          nodes.push({ id: 'h' + k, x: -R + 12 + k * 62, y: y0 + 70, shape: 'box', w: 56, h: 32, text: `(${it.items[0].v},${it.items[1].v})`, cls: k === 0 ? 'active' : '' })
        );
      }
      if (frame.hint && frame.hint.sorted) {
        const x0 = R + 90;
        nodes.push(DSV.label('ls', x0, -R - 10, 'edges by weight', 'strong', 'start'));
        frame.hint.sorted.forEach(([w, u, v], k) =>
          nodes.push({ id: 'k' + k, x: x0 + 45, y: -R + 20 + k * 34, shape: 'box', w: 90, h: 28, text: `${w}: ${u}–${v}`, cls: frame.hl['k' + k] })
        );
      }
      return { nodes, edges, pointers: [] };
    },

    scenarios: [
      ['6: 0-1:7 0-2:9 0-5:14 1-2:10 1-3:15 2-3:11 2-5:2 3-4:6 4-5:9', 'dijkstra', [0]],
      ['6: 0-1:7 0-2:9 0-5:14 1-2:10 1-3:15 2-3:11 2-5:2 3-4:6 4-5:9', 'kruskal', []],
    ],

    ops: [
      {
        id: 'dijkstra',
        label: 'dijkstra(start)',
        args: [{ name: 'start', default: 0 }],
        check: (m, s) => (s < 0 || s >= m.n ? `start must be 0..${m.n - 1}.` : null),
        run(t, m, start) {
          const dist = Array(m.n).fill(Infinity);
          const pred = Array(m.n).fill(-1);
          const settled = new Set();
          const heap = [];
          const vars = (x) => Object.assign({ start, dist: dist.slice(), heap: heap.map((p) => p.slice()) }, x);
          const paint = (u, v) => {
            const hl = {};
            for (let i = 0; i < m.n; i++) {
              if (settled.has(i)) hl[vid(i)] = 'visited';
              else if (dist[i] < Infinity) hl[vid(i)] = 'new';
              if (pred[i] >= 0) hl[eid(i, pred[i])] = 'good';
            }
            if (u !== undefined) hl[vid(u)] = 'active';
            if (u !== undefined && v !== undefined) {
              hl[eid(u, v)] = 'active';
              hl['d' + v] = 'active';
            }
            return hl;
          };
          dist[start] = 0;
          t.step('init', `Every distance starts at ∞, except dist[${start}] = 0.`, vars(), { hl: paint() });
          heapPush(heap, [0, start]);
          t.step('push_start', `Push (0, ${start}) onto the min-heap of (distance, vertex) pairs.`, vars(), { hl: paint() });
          for (;;) {
            t.step('loop', heap.length ? `The heap has ${heap.length} entr${heap.length === 1 ? 'y' : 'ies'}.` : 'The heap is empty: every reachable vertex is settled.', vars(), { hl: paint() });
            if (!heap.length) break;
            const [d, u] = heap.shift();
            t.step('pop', `Pop the closest entry: (${d}, ${u}).`, vars({ d, u }), { hl: paint(u) });
            const stale = d > dist[u];
            t.step('check_stale', stale ? `${d} > dist[${u}] = ${dist[u]}: this entry is out of date.` : `${d} is the best known distance to ${u}: settle it.`, vars({ d, u }), { hl: paint(u) });
            if (stale) {
              t.step('skip', 'Skip it.', vars({ d, u }), { hl: paint() });
              continue;
            }
            settled.add(u);
            for (const [v, w] of m.adj[u]) {
              t.step('neighbors', `Edge ${u}–${v} with weight ${w}.`, vars({ d, u, v, w }), { hl: paint(u, v) });
              const better = d + w < dist[v];
              t.step('relax_check', `Is ${d} + ${w} = ${d + w} < dist[${v}] (${dist[v] === Infinity ? '∞' : dist[v]})? ${better ? 'Yes: a shorter path!' : 'No.'}`, vars({ d, u, v, w }), { hl: paint(u, v) });
              if (!better) continue;
              dist[v] = d + w;
              pred[v] = u;
              t.step('relax', `dist[${v}] = ${dist[v]}, reached through ${u}.`, vars({ d, u, v, w }), { hl: paint(u, v) });
              heapPush(heap, [dist[v], v]);
              t.step('push', `Push (${dist[v]}, ${v}).`, vars({ d, u, v, w }), { hl: paint(u) });
            }
            t.step('neighbors', `${u} is done.`, vars({ d, u }), { hl: paint() });
          }
          const shown = dist.map((x) => (x === Infinity ? '∞' : x)).join(', ');
          t.step('done', `Shortest distances from ${start}: [${shown}]. The green edges form the shortest-path tree.`, vars(), { hl: paint(), ok: true });
        },
      },
      {
        id: 'kruskal',
        label: 'kruskal()',
        args: [],
        run(t, m) {
          const parent = [...Array(m.n).keys()];
          const find = (x) => {
            while (parent[x] !== x) x = parent[x] = parent[parent[x]];
            return x;
          };
          const sorted = m.edges.map((e) => e.slice()).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
          t.hint = { sorted };
          const mst = [];
          const marks = {};
          const vars = (x) => Object.assign({ mst: mst.map((e) => e.slice()), parent: parent.slice() }, x);
          const paint = (k, cls) => Object.assign({}, marks, k === undefined ? {} : { ['k' + k]: cls, [eid(sorted[k][1], sorted[k][2])]: cls === 'active' ? 'active' : marks[eid(sorted[k][1], sorted[k][2])] });
          t.step('init', 'Every vertex starts in its own component (parent[i] = i). Sort the edges by weight.', vars(), { hl: paint() });
          let k = 0;
          for (; k <= sorted.length; k++) {
            t.step('loop', k < sorted.length ? `Next cheapest edge: ${sorted[k][1]}–${sorted[k][2]} (weight ${sorted[k][0]}).` : 'All edges considered.', vars(), { hl: paint(k < sorted.length ? k : undefined, 'active') });
            if (k === sorted.length) break;
            const [w, u, v] = sorted[k];
            const ru = find(u);
            const rv = find(v);
            t.step('find', `Root of ${u} is ${ru}; root of ${v} is ${rv}.`, vars({ w, u, v, ru, rv }), { hl: paint(k, 'active') });
            const cycle = ru === rv;
            t.step('check_cycle', cycle ? 'Same component: this edge would close a cycle.' : 'Different components: the edge is safe.', vars({ w, u, v, ru, rv }), { hl: paint(k, cycle ? 'removed' : 'active') });
            if (cycle) {
              marks['k' + k] = 'ghost';
              marks[eid(u, v)] = 'dim';
              t.step('skip', `Skip ${u}–${v}.`, vars({ w, u, v }), { hl: paint() });
              continue;
            }
            parent[ru] = rv;
            t.step('union', `Merge the two components: parent[${ru}] = ${rv}.`, vars({ w, u, v, ru, rv }), { hl: paint(k, 'active') });
            mst.push([u, v, w]);
            marks['k' + k] = 'found';
            marks[eid(u, v)] = 'good';
            t.step('take', `Add ${u}–${v} to the tree. Total weight so far: ${mst.reduce((s, e) => s + e[2], 0)}.`, vars({ w, u, v }), { hl: paint() });
          }
          const total = mst.reduce((s, e) => s + e[2], 0);
          const full = mst.length === m.n - 1;
          t.step('done', full ? `Minimum spanning tree: ${mst.length} edges, total weight ${total}.` : `The graph is disconnected: this is a minimum spanning forest with ${mst.length} edges (weight ${total}).`, vars(), { hl: paint(), ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
