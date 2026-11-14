/* Undirected graphs: one factory for the adjacency-list and adjacency-matrix
 * pages. `store` adapts the representation: create(n), has, add, remove,
 * iter(m, u) -> the v values the source's neighbor loop visits,
 * isEdge(m, u, v), edges(m), snapshot(m). */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const vid = (i) => 'v' + i;
  const eid = (a, b) => `e:${Math.min(a, b)}-${Math.max(a, b)}`;

  // Vertex positions on a circle, vertex 0 at the top. Returns { R, at(i) }.
  DSV.circle = function (n) {
    const R = 50 + n * 16;
    return {
      R,
      at: (i) => {
        const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
        return { x: Math.cos(a) * R, y: Math.sin(a) * R };
      },
    };
  };

  // "6: 0-1 0-2 1-3" -> { n: 6, edges: [[0,1],[0,2],[1,3]] }
  DSV.parseGraph = function (text) {
    const m = /^\s*(\d+)\s*(?::(.*))?$/.exec(String(text));
    if (!m) throw new Error('Use the form "n: a-b c-d", e.g. 6: 0-1 0-2 1-3');
    const n = +m[1];
    if (n < 2 || n > 9) throw new Error('n must be between 2 and 9');
    const edges = [];
    for (const tok of (m[2] || '').split(/[\s,]+/).filter(Boolean)) {
      const p = /^(\d+)-(\d+)$/.exec(tok);
      if (!p || +p[1] >= n || +p[2] >= n || p[1] === p[2]) throw new Error(`"${tok}" must be a-b with different vertices below ${n}`);
      edges.push([+p[1], +p[2]]);
    }
    return { n, edges };
  };

  function graphLayout(frame, mode) {
    const st = frame.state;
    const n = st.n;
    const R = 50 + n * 16;
    const at = (i) => {
      const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
      return { x: Math.cos(a) * R, y: Math.sin(a) * R };
    };
    const nodes = [];
    const edges = [];
    for (let i = 0; i < n; i++) {
      const p = at(i);
      nodes.push({ id: vid(i), x: p.x, y: p.y, shape: 'circle', text: i, cls: frame.hl[vid(i)] });
    }
    const edgeCls = (a, b) => ({ good: 'good', active: 'hot' }[frame.hl[eid(a, b)]] || '');
    for (const [a, b] of st.edges) edges.push({ from: vid(a), to: vid(b), kind: 'line', cls: edgeCls(a, b) });

    const x0 = R + 90;
    if (mode === 'list') {
      for (let u = 0; u < n; u++) {
        const y = (u - (n - 1) / 2) * 40;
        nodes.push(DSV.label('al' + u, x0, y, `${u} →`, 'strong', 'end'));
        st.adj[u].forEach((v, j) =>
          nodes.push({ id: `a${u}-${v}`, x: x0 + 30 + j * 42, y, shape: 'box', w: 34, h: 30, text: v, cls: frame.hl[`a${u}-${v}`] })
        );
      }
      nodes.push(DSV.label('alh', x0 + 12, -((n + 1) / 2) * 40, 'adjacency lists', 'strong', 'start'));
    } else {
      const C = 32;
      for (let u = 0; u < n; u++) {
        const y = (u - (n - 1) / 2) * C;
        nodes.push(DSV.label('mr' + u, x0, y, u, 'strong', 'end'));
        nodes.push(DSV.label('mc' + u, x0 + 26 + u * C, -((n + 1) / 2) * C, u, 'strong'));
        for (let v = 0; v < n; v++) {
          const on = st.matrix[u][v];
          nodes.push({
            id: `m${u}-${v}`, x: x0 + 26 + v * C, y, shape: 'box', w: C - 2, h: C - 2, text: on ? 1 : 0,
            cls: [on ? 'on' : '', frame.hl[`m${u}-${v}`] || ''].join(' '),
          });
        }
      }
    }

    // BFS queue and visit order, read from the frame's locals.
    const row = (name, y) => {
      const v = frame.vars[name];
      if (!v || v.t !== 'list') return;
      nodes.push(DSV.label('l' + name, -R - 32, y, name, 'strong', 'end'));
      v.items.forEach((it, j) =>
        nodes.push({ id: name[0] + it.v, x: -R + j * 44, y, shape: 'box', w: 36, h: 32, text: it.v, cls: name === 'queue' ? 'new' : 'visited' })
      );
    };
    row('queue', R + 70);
    row('order', R + 120);
    return { nodes, edges, pointers: [] };
  }

  DSV.makeGraph = function (spec) {
    const S = spec.store;
    const list = spec.mode === 'list';
    const cell = (u, v) => (list ? `a${u}-${v}` : `m${u}-${v}`);
    const vok = (m, ...vs) => (vs.some((x) => x < 0 || x >= m.n) ? `Vertices must be 0..${m.n - 1}.` : null);
    const pairCheck = (m, u, v) => vok(m, u, v) || (u === v ? 'u and v must differ (no self-loops).' : null);

    // Highlight for BFS / DFS: order = visited, queue = discovered, u = current, u-v = edge being examined.
    const paint = (order, queue, u, v) => {
      const hl = {};
      for (const x of order) hl[vid(x)] = 'visited';
      for (const x of queue) hl[vid(x)] = 'new';
      if (u !== undefined && u !== null) hl[vid(u)] = 'active';
      if (u !== undefined && u !== null && v !== undefined && v !== null) {
        hl[eid(u, v)] = 'active';
        hl[cell(u, v)] = 'active';
      }
      return hl;
    };

    const ops = [
      {
        id: 'add_edge',
        label: 'add_edge(u, v)',
        args: [
          { name: 'u', default: 1 },
          { name: 'v', default: 4 },
        ],
        check: pairCheck,
        run(t, m, u, v) {
          const has = S.has(m, u, v);
          t.step('check_exists', has ? `${u}–${v} already exists.` : `${u}–${v} does not exist yet.`, { u, v }, { hl: { [vid(u)]: 'active', [vid(v)]: 'active', [cell(u, v)]: 'active' } });
          if (has) return t.step('exists', 'Return %false%.', { u, v }, { ok: false });
          S.add(m, u, v);
          t.step('add_uv', list ? `Append ${v} to the list of ${u}.` : `matrix[${u}][${v}] = 1.`, { u, v }, { hl: { [cell(u, v)]: 'new' } });
          S.add(m, v, u);
          t.step('add_vu', list ? `Undirected, so also append ${u} to the list of ${v}.` : `Undirected, so the matrix is symmetric: matrix[${v}][${u}] = 1.`, { u, v }, {
            hl: { [cell(v, u)]: 'new', [eid(u, v)]: 'good' },
          });
          t.step('done', `Added edge ${u}–${v}.`, { u, v }, { hl: { [eid(u, v)]: 'good' }, ok: true });
        },
      },
      {
        id: 'remove_edge',
        label: 'remove_edge(u, v)',
        args: [
          { name: 'u', default: 0 },
          { name: 'v', default: 1 },
        ],
        check: pairCheck,
        run(t, m, u, v) {
          const has = S.has(m, u, v);
          t.step('check_exists', has ? `${u}–${v} exists.` : `There is no edge ${u}–${v}.`, { u, v }, { hl: { [vid(u)]: 'active', [vid(v)]: 'active', [eid(u, v)]: 'active' } });
          if (!has) return t.step('missing', 'Return %false%.', { u, v }, { ok: false });
          t.step('remove_uv', list ? `Remove ${v} from the list of ${u} (a linear scan of that list).` : `matrix[${u}][${v}] = 0.`, { u, v }, { hl: { [cell(u, v)]: 'removed', [eid(u, v)]: 'active' } });
          S.remove(m, u, v);
          t.step('remove_vu', list ? `Remove ${u} from the list of ${v}.` : `matrix[${v}][${u}] = 0.`, { u, v }, { hl: { [cell(v, u)]: 'removed' } });
          S.remove(m, v, u);
          t.step('done', `Removed edge ${u}–${v}.`, { u, v }, { ok: true });
        },
      },
      {
        id: 'bfs',
        label: 'bfs(start)',
        args: [{ name: 'start', default: 0 }],
        check: (m, s) => vok(m, s),
        run(t, m, start) {
          const visited = Array(m.n).fill(false);
          const order = [];
          const queue = [];
          const vars = (x) => Object.assign({ start, queue: queue.slice(), order: order.slice(), visited: visited.slice() }, x);
          t.step('init', 'Nothing is visited yet.', vars(), {});
          queue.push(start);
          visited[start] = true;
          t.step('enqueue_start', `Enqueue ${start} and mark it visited.`, vars(), { hl: paint(order, queue) });
          for (;;) {
            t.step('loop', queue.length ? `The queue holds [${queue.join(', ')}].` : 'The queue is empty: BFS is finished.', vars(), { hl: paint(order, queue) });
            if (!queue.length) break;
            const u = queue.shift();
            t.step('dequeue', `Dequeue ${u}, the oldest discovered vertex.`, vars({ u }), { hl: paint(order, queue, u) });
            order.push(u);
            t.step('visit', `Visit ${u}. order = [${order.join(', ')}].`, vars({ u }), { hl: paint(order, queue, u) });
            for (const v of S.iter(m, u)) {
              const edge = S.isEdge(m, u, v);
              const hl = paint(order, queue, u, edge ? v : null);
              t.step('neighbors', list ? `Next neighbor of ${u}: ${v}.` : `Row ${u}, column ${v}.`, vars({ u, v }), { hl });
              const why = !edge ? `No edge ${u}–${v}.` : visited[v] ? `${v} was already discovered: skip it.` : `${v} is new.`;
              t.step('check_visited', why, vars({ u, v }), { hl });
              if (!edge || visited[v]) continue;
              visited[v] = true;
              t.mark(eid(u, v), 'good');
              t.step('mark', `Mark ${v} visited now, so it is enqueued only once.`, vars({ u, v }), { hl: paint(order, queue, u, v) });
              queue.push(v);
              t.step('enqueue', `Enqueue ${v}.`, vars({ u, v }), { hl: paint(order, queue, u) });
            }
            t.step('neighbors', `Done with the neighbors of ${u}.`, vars({ u }), { hl: paint(order, queue, u) });
          }
          t.step('done', `BFS order: [${order.join(', ')}]. The green edges form the BFS tree (shortest paths in hops).`, vars(), { hl: paint(order, []), ok: true });
        },
      },
      {
        id: 'dfs',
        label: 'dfs(start)',
        args: [{ name: 'start', default: 0 }],
        check: (m, s) => vok(m, s),
        run(t, m, start) {
          const visited = Array(m.n).fill(false);
          const order = [];
          const vars = (x) => Object.assign({ start, order: order.slice(), visited: visited.slice() }, x);
          t.step('init', 'Nothing is visited yet.', vars(), {});
          t.step('call', `Start the recursive DFS at ${start}.`, vars(), {});
          const dfs = (u, depth) => {
            visited[u] = true;
            t.step('mark', `depth ${depth}: mark ${u} visited.`, vars({ u, depth }), { hl: paint(order, [], u) });
            order.push(u);
            t.step('visit', `Visit ${u}. order = [${order.join(', ')}].`, vars({ u, depth }), { hl: paint(order, [], u) });
            for (const v of S.iter(m, u)) {
              const edge = S.isEdge(m, u, v);
              const hl = paint(order, [], u, edge ? v : null);
              t.step('neighbors', list ? `Next neighbor of ${u}: ${v}.` : `Row ${u}, column ${v}.`, vars({ u, v, depth }), { hl });
              const why = !edge ? `No edge ${u}–${v}.` : visited[v] ? `${v} is already visited.` : `${v} is unvisited: go deeper.`;
              t.step('check_visited', why, vars({ u, v, depth }), { hl });
              if (!edge || visited[v]) continue;
              t.mark(eid(u, v), 'good');
              t.step('recurse', `Recurse into ${v}.`, vars({ u, v, depth }), { hl: paint(order, [], u, v) });
              dfs(v, depth + 1);
              t.step('recurse', `Back at ${u} (depth ${depth}) after exploring ${v}.`, vars({ u, v, depth }), { hl: paint(order, [], u) });
            }
            t.step('neighbors', `All neighbors of ${u} are done: return.`, vars({ u, depth }), { hl: paint(order, [], u) });
          };
          dfs(start, 1);
          t.step('done', `DFS order: [${order.join(', ')}]. The green edges form the DFS tree.`, vars(), { hl: paint(order, []), ok: true });
        },
      },
    ];

    return {
      id: spec.id,
      title: spec.title,
      about: spec.about,
      init: {
        default: '6: 0-1 0-2 1-3 2-3 3-4 4-5',
        parse: DSV.parseGraph,
        random: () => {
          const n = 6 + Math.floor(Math.random() * 2);
          const es = new Set();
          for (let i = 1; i < n; i++) es.add(`${Math.floor(Math.random() * i)}-${i}`);
          for (let k = 0; k < 2; k++) {
            const a = Math.floor(Math.random() * n);
            const b = Math.floor(Math.random() * n);
            if (a !== b) es.add(`${Math.min(a, b)}-${Math.max(a, b)}`);
          }
          return `${n}: ${[...es].join(' ')}`;
        },
      },
      complexity: spec.complexity,
      create({ n, edges }) {
        const m = S.create(n);
        for (const [a, b] of edges) {
          if (S.has(m, a, b)) continue;
          S.add(m, a, b);
          S.add(m, b, a);
        }
        return { model: m, msg: `Graph with ${n} vertices and ${S.edges(m).length} edges. Initial values use the form "n: a-b c-d".` };
      },
      snapshot: (m) => Object.assign({ n: m.n, edges: S.edges(m) }, S.snapshot(m)),
      layout: (frame) => graphLayout(frame, spec.mode),
      scenarios: [
        ['6: 0-1 0-2 1-3 2-3 3-4 4-5', 'add_edge', [1, 4]],
        ['6: 0-1 0-2 1-3 2-3 3-4 4-5', 'add_edge', [0, 1]],
        ['6: 0-1 0-2 1-3 2-3 3-4 4-5', 'remove_edge', [0, 1]],
        ['6: 0-1 0-2 1-3 2-3 3-4 4-5', 'remove_edge', [0, 5]],
        ['6: 0-1 0-2 1-3 2-3 3-4 4-5', 'bfs', [0]],
        ['6: 0-1 0-2 1-3 2-3 3-4 4-5', 'dfs', [0]],
      ],
      ops,
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
