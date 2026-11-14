import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from directed_graph import DirectedGraph  # noqa: E402


class TestDirectedGraph(unittest.TestCase):
    def test_dag(self):
        g = DirectedGraph(6, [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)])
        self.assertEqual(g.topological_sort(), [4, 5, 2, 0, 3, 1])
        self.assertFalse(g.has_cycle())
        g.add_edge(1, 5)
        self.assertIsNone(g.topological_sort())
        self.assertTrue(g.has_cycle())

    def test_random(self):
        rng = random.Random(47)
        for _ in range(200):
            n = rng.randint(1, 8)
            edges = {tuple(rng.sample(range(n), 2)) for _ in range(rng.randint(0, 12))} if n > 1 else set()
            g = DirectedGraph(n, sorted(edges))
            order = g.topological_sort()
            self.assertEqual(order is None, g.has_cycle())
            if order is not None:
                pos = {v: i for i, v in enumerate(order)}
                self.assertEqual(sorted(order), list(range(n)))
                self.assertTrue(all(pos[u] < pos[v] for u, v in edges))


if __name__ == "__main__":
    unittest.main()
