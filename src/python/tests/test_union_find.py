import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from union_find import UnionFind  # noqa: E402


class TestUnionFind(unittest.TestCase):
    def test_basic(self):
        uf = UnionFind(6)
        self.assertTrue(uf.union(0, 1))
        self.assertTrue(uf.union(2, 3))
        self.assertFalse(uf.union(1, 0))
        self.assertTrue(uf.union(1, 3))
        self.assertTrue(uf.connected(0, 2))
        self.assertFalse(uf.connected(0, 4))

    def test_path_compression(self):
        uf = UnionFind(4)
        uf.parent = [0, 0, 1, 2]  # a chain 3 -> 2 -> 1 -> 0
        self.assertEqual(uf.find(3), 0)
        self.assertEqual(uf.parent, [0, 0, 0, 0])

    def test_random(self):
        rng = random.Random(33)
        n = 30
        uf, comp = UnionFind(n), list(range(n))
        for _ in range(300):
            a, b = rng.randrange(n), rng.randrange(n)
            self.assertEqual(uf.union(a, b), comp[a] != comp[b])
            old = comp[b]
            comp = [comp[a] if c == old else c for c in comp]
            x, y = rng.randrange(n), rng.randrange(n)
            self.assertEqual(uf.connected(x, y), comp[x] == comp[y])

if __name__ == "__main__":
    unittest.main()
