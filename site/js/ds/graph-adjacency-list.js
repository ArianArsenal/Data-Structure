/* Graph (adjacency list): see core/graph.js for the shared tracer and layout. */
(function (root) {
  'use strict';
  const DSV = root.DSV;

  DSV.register(
    DSV.makeGraph({
      id: 'graph-adjacency-list',
      title: 'Graph (Adjacency List)',
      mode: 'list',
      about:
        'Each vertex keeps a list of its neighbors. Memory is proportional to V + E, and iterating over a vertex’s neighbors costs only its degree, which makes this the usual choice for sparse graphs. Checking whether one specific edge exists needs a scan of a list.',
      complexity: {
        rows: [
          ['Add edge', 'O(deg)', 'O(V)'],
          ['Remove edge', 'O(deg)', 'O(V)'],
          ['Has edge u–v', 'O(deg)', 'O(V)'],
          ['BFS / DFS', 'O(V + E)', 'O(V + E)'],
        ],
        space: 'O(V + E)',
        notes: 'add_edge checks for duplicates first, which is why it costs O(deg) rather than O(1).',
      },
      store: {
        create: (n) => ({ n, adj: Array.from({ length: n }, () => []) }),
        has: (m, u, v) => m.adj[u].includes(v),
        add: (m, u, v) => m.adj[u].push(v),
        remove: (m, u, v) => m.adj[u].splice(m.adj[u].indexOf(v), 1),
        iter: (m, u) => m.adj[u].slice(),
        isEdge: () => true,
        edges: (m) => {
          const out = [];
          m.adj.forEach((vs, u) => vs.forEach((v) => u < v && out.push([u, v])));
          return out;
        },
        snapshot: (m) => ({ adj: m.adj.map((l) => l.slice()) }),
      },
    })
  );
})(typeof window !== 'undefined' ? window : globalThis);
