import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from collections import deque  # noqa: E402

from circular_queue import CircularQueue  # noqa: E402


class TestCircularQueue(unittest.TestCase):
    def test_fifo_and_limits(self):
        q = CircularQueue(values=[1, 2])
        q.enqueue(3)
        self.assertEqual([q.dequeue() for _ in range(3)], [1, 2, 3])
        with self.assertRaises(IndexError):
            q.dequeue()
        for i in range(8):
            q.enqueue(i)
        with self.assertRaises(OverflowError):
            q.enqueue(9)

    def test_random_wraparound(self):
        rng, q, ref = random.Random(3), CircularQueue(), deque()
        for _ in range(500):
            if ref and (len(ref) == 8 or rng.random() < 0.5):
                self.assertEqual(q.dequeue(), ref.popleft())
            else:
                v = rng.randint(0, 99)
                q.enqueue(v)
                ref.append(v)
            self.assertEqual(len(q), len(ref))

if __name__ == "__main__":
    unittest.main()
