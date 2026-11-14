"""Directed graph with topological sort (Kahn's algorithm) and cycle detection
(depth-first search with three colors).

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""

from collections import deque

UNVISITED, ON_STACK, DONE = 0, 1, 2


class DirectedGraph:
    def __init__(self, n, edges=()):
        self.adj = [[] for _ in range(n)]
        for u, v in edges:
            self.adj[u].append(v)

    # @op add_edge
    def add_edge(self, u, v):
        self.adj[u].append(v)  # @step append
    # @endop

    # @op topological_sort
    def topological_sort(self):
        indegree = [0] * len(self.adj)  # @step init
        for u in range(len(self.adj)):  # @step count
            for v in self.adj[u]:
                indegree[v] += 1
        queue = deque(u for u in range(len(self.adj)) if indegree[u] == 0)  # @step sources
        order = []
        while queue:  # @step loop
            u = queue.popleft()  # @step dequeue
            order.append(u)  # @step emit
            for v in self.adj[u]:  # @step neighbors
                indegree[v] -= 1  # @step decrement
                if indegree[v] == 0:  # @step check_zero
                    queue.append(v)  # @step enqueue
        if len(order) < len(self.adj):  # @step check_cycle
            return None  # @step cycle
        return order  # @step done
    # @endop

    # @op has_cycle
    def has_cycle(self):
        state = [UNVISITED] * len(self.adj)  # @step init
        for u in range(len(self.adj)):  # @step loop
            if state[u] == UNVISITED and self._visit(u, state):  # @step check
                return True  # @step found
        return False  # @step none

    def _visit(self, u, state):
        state[u] = ON_STACK  # @step enter
        for v in self.adj[u]:  # @step neighbors
            if state[v] == ON_STACK:  # @step back_edge
                return True  # @step cycle
            if state[v] == UNVISITED and self._visit(v, state):  # @step recurse
                return True  # @step propagate
        state[u] = DONE  # @step leave
        return False
    # @endop
