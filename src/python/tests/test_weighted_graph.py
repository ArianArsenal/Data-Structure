import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from weighted_graph import INF, WeightedGraph  # noqa: E402

EDGES = [(0, 1, 7), (0, 2, 9), (0, 5, 14), (1, 2, 10), (1, 3, 15), (2, 3, 11), (2, 5, 2), (3, 4, 6), (4, 5, 9)]


class TestWeightedGraph(unittest.TestCase):
    def test_dijkstra(self):
        g = WeightedGraph(6, EDGES)
        self.assertEqual(g.dijkstra(0), [0, 7, 9, 20, 20, 11])
        self.assertEqual(WeightedGraph(3, [(0, 1, 5)]).dijkstra(0), [0, 5, INF])

    def test_kruskal(self):
        mst = WeightedGraph(6, EDGES).kruskal()
        self.assertEqual(len(mst), 5)
        self.assertEqual(sum(w for _, _, w in mst), 33)

    def test_random_against_bellman_ford(self):
        rng = random.Random(46)
        for _ in range(100):
            n = rng.randint(2, 9)
            es = {}
            for _ in range(rng.randint(0, 15)):
                a, b = rng.sample(range(n), 2)
                es[(min(a, b), max(a, b))] = rng.randint(1, 20)
            edges = [(u, v, w) for (u, v), w in es.items()]
            g = WeightedGraph(n, edges)
            s = rng.randrange(n)
            ref = [INF] * n
            ref[s] = 0
            for _ in range(n):
                for u, v, w in edges:
                    ref[v] = min(ref[v], ref[u] + w)
                    ref[u] = min(ref[u], ref[v] + w)
            self.assertEqual(g.dijkstra(s), ref)
            mst = g.kruskal()
            self.assertLessEqual(len(mst), n - 1)


if __name__ == "__main__":
    unittest.main()
