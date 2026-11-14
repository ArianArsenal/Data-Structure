/* Directed graph: traced topological sort and cycle detection mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const vid = (i) => 'v' + i;
  const eid = (a, b) => `e:${a}>${b}`;

  DSV.register({
    id: 'directed-graph',
    title: 'Directed Graph',
    about:
      'Edges have a direction, e.g. "task u must happen before task v". A topological sort lists the vertices so that every edge points forward, and it exists exactly when the graph has no cycle. Kahn’s algorithm repeatedly removes a vertex with no incoming edges. Cycle detection uses DFS with three colors: reaching a vertex that is still on the recursion stack means there is a cycle.',
    init: {
      default: '6: 5-2 5-0 4-0 4-1 2-3 3-1',
      parse: DSV.parseGraph,
      random: () => {
        const n = 6;
        const es = new Set();
        for (let k = 0; k < 7; k++) {
          const a = Math.floor(Math.random() * n);
          const b = Math.floor(Math.random() * n);
          if (a < b) es.add(`${a}-${b}`); // forward edges only: a DAG
        }
        return `${n}: ${[...es].join(' ')}`;
      },
    },
    complexity: {
      rows: [
        ['Topological sort (Kahn)', 'O(V + E)', 'O(V + E)'],
        ['Cycle detection (DFS)', 'O(V + E)', 'O(V + E)'],
        ['Add edge', 'O(1)', 'O(1)'],
      ],
      space: 'O(V + E)',
      notes: 'Initial values use the form "n: a-b c-d", where a-b means an edge from a to b. Try add_edge(1, 5) to create a cycle, then run both algorithms again.',
    },

    create({ n, edges }) {
      const m = { n, adj: Array.from({ length: n }, () => []) };
      for (const [u, v] of edges) if (!m.adj[u].includes(v)) m.adj[u].push(v);
      return { model: m, msg: `Directed graph with ${n} vertices and ${edges.length} edges.` };
    },
    snapshot: (m) => ({ n: m.n, adj: m.adj.map((l) => l.slice()) }),

    layout(frame) {
      const st = frame.state;
      const { R, at } = DSV.circle(st.n);
      const vars = frame.vars;
      const indeg = vars.indegree && vars.indegree.t === 'list' ? vars.indegree.items : null;
      const nodes = [];
      const edges = [];
      for (let i = 0; i < st.n; i++) {
        const p = at(i);
        nodes.push({ id: vid(i), x: p.x, y: p.y, shape: 'circle', text: i, sub: indeg ? 'in ' + indeg[i].v : undefined, cls: frame.hl[vid(i)] });
      }
      st.adj.forEach((vs, u) => vs.forEach((v) => edges.push({ from: vid(u), to: vid(v), cls: { active: 'hot', good: 'good', bad: 'hot' }[frame.hl[eid(u, v)]] || '' })));
      const row = (name, y, cls) => {
        const v = vars[name];
        if (!v || v.t !== 'list') return;
        nodes.push(DSV.label('l' + name, -R - 32, y, name, 'strong', 'end'));
        v.items.forEach((it, j) => nodes.push({ id: name[0] + it.v, x: -R + j * 44, y, shape: 'box', w: 36, h: 32, text: it.v, cls }));
      };
      row('queue', R + 70, 'new');
      row('order', R + 120, 'visited');
      return { nodes, edges, pointers: [] };
    },

    scenarios: [
      ['6: 5-2 5-0 4-0 4-1 2-3 3-1', 'topological_sort', []],
      ['3: 0-1 1-2 2-0', 'topological_sort', []],
      ['6: 5-2 5-0 4-0 4-1 2-3 3-1', 'has_cycle', []],
      ['4: 0-1 1-2 2-3 3-1', 'has_cycle', []],
      ['6: 5-2', 'add_edge', [1, 5]],
    ],

    ops: [
      {
        id: 'add_edge',
        label: 'add_edge(u, v)',
        args: [
          { name: 'u', default: 1 },
          { name: 'v', default: 5 },
        ],
        check: (m, u, v) =>
          u < 0 || v < 0 || u >= m.n || v >= m.n ? `Vertices must be 0..${m.n - 1}.` : u === v ? 'u and v must differ.' : m.adj[u].includes(v) ? `The edge ${u}→${v} already exists.` : null,
        run(t, m, u, v) {
          m.adj[u].push(v);
          t.step('append', `Append ${v} to the list of ${u}: a new edge ${u} → ${v}.`, { u, v }, { hl: { [eid(u, v)]: 'good', [vid(u)]: 'active', [vid(v)]: 'active' }, ok: true });
        },
      },
      {
        id: 'topological_sort',
        label: 'topological_sort()',
        args: [],
        run(t, m) {
          const indegree = Array(m.n).fill(0);
          const queue = [];
          const order = [];
          const vars = (x) => Object.assign({ indegree: indegree.slice(), queue: queue.slice(), order: order.slice() }, x);
          const paint = (u, v) => {
            const hl = {};
            order.forEach((x) => (hl[vid(x)] = 'visited'));
            queue.forEach((x) => (hl[vid(x)] = 'new'));
            if (u !== undefined) hl[vid(u)] = 'active';
            if (v !== undefined) hl[eid(u, v)] = 'active';
            return hl;
          };
          t.step('init', 'indegree[v] will count the edges pointing into v.', vars());
          for (let u = 0; u < m.n; u++) for (const v of m.adj[u]) indegree[v]++;
          t.step('count', `Count incoming edges: [${indegree.join(', ')}].`, vars());
          for (let u = 0; u < m.n; u++) if (indegree[u] === 0) queue.push(u);
          t.step('sources', queue.length ? `Vertices with no incoming edge can go first: [${queue.join(', ')}].` : 'No vertex has indegree 0: there must be a cycle.', vars(), { hl: paint() });
          for (;;) {
            t.step('loop', queue.length ? `The queue holds [${queue.join(', ')}].` : 'The queue is empty.', vars(), { hl: paint() });
            if (!queue.length) break;
            const u = queue.shift();
            t.step('dequeue', `Take ${u}.`, vars({ u }), { hl: paint(u) });
            order.push(u);
            t.step('emit', `Output ${u}. order = [${order.join(', ')}].`, vars({ u }), { hl: paint(u) });
            for (const v of m.adj[u]) {
              t.step('neighbors', `Edge ${u} → ${v}.`, vars({ u, v }), { hl: paint(u, v) });
              indegree[v]--;
              t.step('decrement', `Remove it: indegree[${v}] = ${indegree[v]}.`, vars({ u, v }), { hl: paint(u, v) });
              t.step('check_zero', indegree[v] === 0 ? `${v} has no remaining incoming edges.` : `${v} still waits on ${indegree[v]} edge(s).`, vars({ u, v }), { hl: paint(u, v) });
              if (indegree[v] !== 0) continue;
              queue.push(v);
              t.step('enqueue', `Enqueue ${v}.`, vars({ u, v }), { hl: paint(u) });
            }
            t.step('neighbors', `Done with ${u}.`, vars({ u }), { hl: paint() });
          }
          const cyc = order.length < m.n;
          t.step('check_cycle', cyc ? `Only ${order.length} of ${m.n} vertices were output.` : `All ${m.n} vertices were output.`, vars(), { hl: paint() });
          if (cyc) return t.step('cycle', 'The rest are stuck in a cycle, so no topological order exists: return %null%.', vars(), { ok: false });
          t.step('done', `Topological order: [${order.join(', ')}]. Every edge points from left to right in this list.`, vars(), { hl: paint(), ok: true });
        },
      },
      {
        id: 'has_cycle',
        label: 'has_cycle()',
        args: [],
        run(t, m) {
          const NAMES = ['unvisited', 'on stack', 'done'];
          const state = Array(m.n).fill(0);
          const vars = (x) => Object.assign({ state: state.slice() }, x);
          const paint = (u, v, cls) => {
            const hl = {};
            state.forEach((s, i) => s && (hl[vid(i)] = s === 1 ? 'new' : 'visited'));
            if (u !== undefined) hl[vid(u)] = 'active';
            if (v !== undefined) hl[eid(u, v)] = cls || 'active';
            return hl;
          };
          t.step('init', 'Color every vertex 0 (unvisited). 1 = on the current DFS path, 2 = fully explored.', vars());
          const visit = (u, depth) => {
            state[u] = 1;
            t.step('enter', `depth ${depth}: ${u} is now on the DFS path.`, vars({ u, depth }), { hl: paint(u) });
            for (const v of m.adj[u]) {
              t.step('neighbors', `Edge ${u} → ${v}; ${v} is ${NAMES[state[v]]}.`, vars({ u, v, depth }), { hl: paint(u, v) });
              const back = state[v] === 1;
              t.step('back_edge', back ? `${v} is on the current path: ${u} → ${v} is a back edge!` : `${v} is not on the current path.`, vars({ u, v, depth }), { hl: paint(u, v, back ? 'bad' : 'active') });
              if (back) {
                t.step('cycle', 'Found a cycle: return %true%.', vars({ u, v, depth }), { hl: paint(u, v, 'bad') });
                return true;
              }
              const go = state[v] === 0;
              t.step('recurse', go ? `Visit ${v}.` : `${v} is already done: skip it.`, vars({ u, v, depth }), { hl: paint(u, v) });
              if (go && visit(v, depth + 1)) {
                t.step('propagate', `A cycle was found below ${u}: pass %true% up.`, vars({ u, v, depth }), { hl: paint(u) });
                return true;
              }
            }
            state[u] = 2;
            t.step('leave', `${u} is fully explored: color it 2 and backtrack.`, vars({ u, depth }), { hl: paint(u) });
            return false;
          };
          for (let u = 0; ; u++) {
            t.step('loop', u < m.n ? `Start vertex ${u} (${NAMES[state[u]]}).` : 'Every vertex has been explored.', vars(u < m.n ? { u } : {}), { hl: paint() });
            if (u >= m.n) break;
            const start = state[u] === 0;
            t.step('check', start ? `${u} is unvisited: start a DFS from it.` : `${u} was already explored.`, vars({ u }), { hl: paint(u) });
            if (start && visit(u, 1)) return t.step('found', 'The graph has a cycle.', vars(), { hl: paint(), ok: false });
          }
          t.step('none', 'No back edge anywhere: the graph is acyclic (a DAG), so it has a topological order.', vars(), { hl: paint(), ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
