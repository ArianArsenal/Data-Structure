import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from collections import deque  # noqa: E402

from circular_deque import CircularDeque  # noqa: E402


class TestCircularDeque(unittest.TestCase):
    def test_both_ends(self):
        d = CircularDeque(values=[2, 3])
        d.push_front(1)
        d.push_back(4)
        self.assertEqual(d.to_list(), [1, 2, 3, 4])
        self.assertEqual(d.pop_back(), 4)
        self.assertEqual(d.pop_front(), 1)
        self.assertEqual(d.to_list(), [2, 3])

    def test_random(self):
        rng, d, ref = random.Random(4), CircularDeque(), deque()
        for _ in range(800):
            if ref and (len(ref) == 8 or rng.random() < 0.5):
                if rng.random() < 0.5:
                    self.assertEqual(d.pop_front(), ref.popleft())
                else:
                    self.assertEqual(d.pop_back(), ref.pop())
            else:
                v = rng.randint(0, 99)
                if rng.random() < 0.5:
                    d.push_front(v)
                    ref.appendleft(v)
                else:
                    d.push_back(v)
                    ref.append(v)
            self.assertEqual(d.to_list(), list(ref))
        while ref:
            ref.pop()
            d.pop_back()
        with self.assertRaises(IndexError):
            d.pop_front()

if __name__ == "__main__":
    unittest.main()
