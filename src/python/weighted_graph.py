"""Undirected weighted graph with Dijkstra's shortest paths and Kruskal's
minimum spanning tree.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""

import heapq

INF = float("inf")


class WeightedGraph:
    def __init__(self, n, edges=()):
        self.adj = [[] for _ in range(n)]
        self.edges = []
        for u, v, w in edges:
            self.add_edge(u, v, w)

    def add_edge(self, u, v, w):
        self.adj[u].append((v, w))
        self.adj[v].append((u, w))
        self.edges.append((w, u, v))

    # @op dijkstra
    def dijkstra(self, start):
        dist = [INF] * len(self.adj)  # @step init
        dist[start] = 0
        heap = [(0, start)]  # @step push_start
        while heap:  # @step loop
            d, u = heapq.heappop(heap)  # @step pop
            if d > dist[u]:  # @step check_stale
                continue  # @step skip
            for v, w in self.adj[u]:  # @step neighbors
                if d + w < dist[v]:  # @step relax_check
                    dist[v] = d + w  # @step relax
                    heapq.heappush(heap, (dist[v], v))  # @step push
        return dist  # @step done
    # @endop

    # @op kruskal
    def kruskal(self):
        parent = list(range(len(self.adj)))  # @step init

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]  # path halving
                x = parent[x]
            return x

        mst = []
        for w, u, v in sorted(self.edges):  # @step loop
            ru, rv = find(u), find(v)  # @step find
            if ru == rv:  # @step check_cycle
                continue  # @step skip
            parent[ru] = rv  # @step union
            mst.append((u, v, w))  # @step take
        return mst  # @step done
    # @endop
