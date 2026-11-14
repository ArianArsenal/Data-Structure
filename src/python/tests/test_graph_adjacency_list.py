import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from graph_adjacency_list import GraphAdjacencyList  # noqa: E402

EDGES = [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4), (4, 5)]


class TestGraphAdjacencyList(unittest.TestCase):
    def test_traversals(self):
        g = GraphAdjacencyList(6, EDGES)
        self.assertEqual(g.bfs(0), [0, 1, 2, 3, 4, 5])
        self.assertEqual(g.dfs(0), [0, 1, 3, 2, 4, 5])
        self.assertEqual(g.bfs(5), [5, 4, 3, 1, 2, 0])

    def test_edges(self):
        g = GraphAdjacencyList(6, EDGES)
        self.assertFalse(g.add_edge(0, 1))
        self.assertTrue(g.add_edge(1, 4))
        self.assertTrue(g.remove_edge(3, 4))
        self.assertFalse(g.remove_edge(3, 4))
        self.assertTrue(g.remove_edge(1, 4))
        self.assertEqual(g.bfs(5), [5, 4])  # 4-5 is now its own component

    def test_random_reachability(self):
        rng = random.Random(36)
        n = 9
        g, adj = GraphAdjacencyList(n), {i: set() for i in range(n)}
        for _ in range(60):
            u, v = rng.sample(range(n), 2)
            if rng.random() < 0.6:
                self.assertEqual(g.add_edge(u, v), v not in adj[u])
                adj[u].add(v)
                adj[v].add(u)
            else:
                self.assertEqual(g.remove_edge(u, v), v in adj[u])
                adj[u].discard(v)
                adj[v].discard(u)
            seen, stack = {0}, [0]
            while stack:
                x = stack.pop()
                for y in adj[x] - seen:
                    seen.add(y)
                    stack.append(y)
            self.assertEqual(set(g.bfs(0)), seen)
            self.assertEqual(set(g.dfs(0)), seen)

if __name__ == "__main__":
    unittest.main()
