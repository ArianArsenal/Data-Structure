/* Graph (adjacency matrix): see core/graph.js for the shared tracer and layout. */
(function (root) {
  'use strict';
  const DSV = root.DSV;

  DSV.register(
    DSV.makeGraph({
      id: 'graph-adjacency-matrix',
      title: 'Graph (Adjacency Matrix)',
      mode: 'matrix',
      about:
        'A V × V grid where matrix[u][v] = 1 means there is an edge u–v. Checking, adding or removing an edge is O(1), but the matrix always takes V² space, and finding a vertex’s neighbors means scanning its whole row. Best for dense graphs.',
      complexity: {
        rows: [
          ['Add / remove edge', 'O(1)', 'O(1)'],
          ['Has edge u–v', 'O(1)', 'O(1)'],
          ['Neighbors of u', 'O(V)', 'O(V)'],
          ['BFS / DFS', 'O(V²)', 'O(V²)'],
        ],
        space: 'O(V²)',
        notes: 'For an undirected graph the matrix is symmetric about its diagonal. Compare BFS here with the adjacency-list page: this one checks every column of every row.',
      },
      store: {
        create: (n) => ({ n, matrix: Array.from({ length: n }, () => Array(n).fill(false)) }),
        has: (m, u, v) => m.matrix[u][v],
        add: (m, u, v) => (m.matrix[u][v] = true),
        remove: (m, u, v) => (m.matrix[u][v] = false),
        iter: (m) => [...Array(m.n).keys()],
        isEdge: (m, u, v) => m.matrix[u][v],
        edges: (m) => {
          const out = [];
          for (let u = 0; u < m.n; u++) for (let v = u + 1; v < m.n; v++) if (m.matrix[u][v]) out.push([u, v]);
          return out;
        },
        snapshot: (m) => ({ matrix: m.matrix.map((r) => r.slice()) }),
      },
    })
  );
})(typeof window !== 'undefined' ? window : globalThis);
