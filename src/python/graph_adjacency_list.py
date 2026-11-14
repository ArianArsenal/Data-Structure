"""Undirected graph stored as adjacency lists, with BFS and DFS.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""

from collections import deque


class GraphAdjacencyList:
    def __init__(self, n, edges=()):
        self.adj = [[] for _ in range(n)]
        for u, v in edges:
            self.add_edge(u, v)

    # @op add_edge
    def add_edge(self, u, v):
        if v in self.adj[u]:  # @step check_exists
            return False  # @step exists
        self.adj[u].append(v)  # @step add_uv
        self.adj[v].append(u)  # @step add_vu
        return True  # @step done
    # @endop

    # @op remove_edge
    def remove_edge(self, u, v):
        if v not in self.adj[u]:  # @step check_exists
            return False  # @step missing
        self.adj[u].remove(v)  # @step remove_uv
        self.adj[v].remove(u)  # @step remove_vu
        return True  # @step done
    # @endop

    # @op bfs
    def bfs(self, start):
        visited = [False] * len(self.adj)  # @step init
        order = []
        queue = deque([start])  # @step enqueue_start
        visited[start] = True
        while queue:  # @step loop
            u = queue.popleft()  # @step dequeue
            order.append(u)  # @step visit
            for v in self.adj[u]:  # @step neighbors
                if not visited[v]:  # @step check_visited
                    visited[v] = True  # @step mark
                    queue.append(v)  # @step enqueue
        return order  # @step done
    # @endop

    # @op dfs
    def dfs(self, start):
        visited = [False] * len(self.adj)  # @step init
        order = []
        self._dfs(start, visited, order)  # @step call
        return order  # @step done

    def _dfs(self, u, visited, order):
        visited[u] = True  # @step mark
        order.append(u)  # @step visit
        for v in self.adj[u]:  # @step neighbors
            if not visited[v]:  # @step check_visited
                self._dfs(v, visited, order)  # @step recurse
    # @endop
