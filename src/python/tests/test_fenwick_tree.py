import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from fenwick_tree import FenwickTree  # noqa: E402


class TestFenwickTree(unittest.TestCase):
    def test_random(self):
        rng = random.Random(32)
        a = [rng.randint(-9, 9) for _ in range(17)]
        ft = FenwickTree(a)
        for _ in range(500):
            if rng.random() < 0.4:
                i, d = rng.randint(1, len(a)), rng.randint(-5, 5)
                ft.update(i, d)
                a[i - 1] += d
            else:
                i = rng.randint(0, len(a))
                self.assertEqual(ft.prefix_sum(i), sum(a[:i]))
        self.assertEqual(ft.range_sum(3, 7), sum(a[2:7]))

if __name__ == "__main__":
    unittest.main()
