import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import heapq  # noqa: E402

from binary_heap import BinaryHeap  # noqa: E402


class TestBinaryHeap(unittest.TestCase):
    def test_sorted_output(self):
        h = BinaryHeap([5, 9, 3, 7, 1, 8, 4])
        self.assertEqual(h.peek(), 1)
        self.assertEqual([h.extract_min() for _ in range(7)], [1, 3, 4, 5, 7, 8, 9])
        with self.assertRaises(IndexError):
            h.extract_min()

    def test_random(self):
        rng, h, ref = random.Random(7), BinaryHeap(), []
        for _ in range(600):
            if ref and rng.random() < 0.4:
                self.assertEqual(h.extract_min(), heapq.heappop(ref))
            else:
                v = rng.randint(0, 50)
                h.insert(v)
                heapq.heappush(ref, v)
            self.assertEqual(len(h), len(ref))

if __name__ == "__main__":
    unittest.main()
