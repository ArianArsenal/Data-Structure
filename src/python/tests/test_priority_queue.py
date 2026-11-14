import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from priority_queue import PriorityQueue  # noqa: E402


class TestPriorityQueue(unittest.TestCase):
    def test_max_first(self):
        pq = PriorityQueue([3, 10, 6, 1, 8])
        self.assertEqual(pq.peek(), 10)
        self.assertEqual([pq.pop() for _ in range(5)], [10, 8, 6, 3, 1])
        with self.assertRaises(IndexError):
            pq.pop()
        with self.assertRaises(IndexError):
            pq.peek()

    def test_random(self):
        rng, pq, ref = random.Random(8), PriorityQueue(), []
        for _ in range(600):
            if ref and rng.random() < 0.4:
                ref.sort()
                self.assertEqual(pq.pop(), ref.pop())
            else:
                v = rng.randint(0, 50)
                pq.push(v)
                ref.append(v)

if __name__ == "__main__":
    unittest.main()
