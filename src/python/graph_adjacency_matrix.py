"""Undirected graph stored as an adjacency matrix, with BFS and DFS.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""

from collections import deque


class GraphAdjacencyMatrix:
    def __init__(self, n, edges=()):
        self.matrix = [[False] * n for _ in range(n)]
        for u, v in edges:
            self.add_edge(u, v)

    # @op add_edge
    def add_edge(self, u, v):
        if self.matrix[u][v]:  # @step check_exists
            return False  # @step exists
        self.matrix[u][v] = True  # @step add_uv
        self.matrix[v][u] = True  # @step add_vu
        return True  # @step done
    # @endop

    # @op remove_edge
    def remove_edge(self, u, v):
        if not self.matrix[u][v]:  # @step check_exists
            return False  # @step missing
        self.matrix[u][v] = False  # @step remove_uv
        self.matrix[v][u] = False  # @step remove_vu
        return True  # @step done
    # @endop

    # @op bfs
    def bfs(self, start):
        n = len(self.matrix)
        visited = [False] * n  # @step init
        order = []
        queue = deque([start])  # @step enqueue_start
        visited[start] = True
        while queue:  # @step loop
            u = queue.popleft()  # @step dequeue
            order.append(u)  # @step visit
            for v in range(n):  # @step neighbors
                if self.matrix[u][v] and not visited[v]:  # @step check_visited
                    visited[v] = True  # @step mark
                    queue.append(v)  # @step enqueue
        return order  # @step done
    # @endop

    # @op dfs
    def dfs(self, start):
        visited = [False] * len(self.matrix)  # @step init
        order = []
        self._dfs(start, visited, order)  # @step call
        return order  # @step done

    def _dfs(self, u, visited, order):
        visited[u] = True  # @step mark
        order.append(u)  # @step visit
        for v in range(len(self.matrix)):  # @step neighbors
            if self.matrix[u][v] and not visited[v]:  # @step check_visited
                self._dfs(v, visited, order)  # @step recurse
    # @endop
