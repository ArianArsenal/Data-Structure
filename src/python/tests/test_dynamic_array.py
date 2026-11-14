import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dynamic_array import DynamicArray  # noqa: E402


class TestDynamicArray(unittest.TestCase):
    def test_grow_and_shrink(self):
        a = DynamicArray()
        for i in range(9):
            a.append(i)
        self.assertEqual(a.capacity, 16)
        self.assertEqual(a.to_list(), list(range(9)))
        for i in reversed(range(5, 9)):
            self.assertEqual(a.pop(), i)
        self.assertEqual(a.capacity, 16)
        self.assertEqual(a.pop(), 4)
        self.assertEqual(a.capacity, 8)  # size 4 <= 16 // 4
        self.assertEqual(a.get(3), 3)
        while a.size:
            a.pop()
        with self.assertRaises(IndexError):
            a.pop()

    def test_random(self):
        rng, a, ref = random.Random(2), DynamicArray(), []
        for _ in range(500):
            if ref and rng.random() < 0.45:
                self.assertEqual(a.pop(), ref.pop())
            else:
                v = rng.randint(0, 99)
                a.append(v)
                ref.append(v)
            self.assertEqual(a.to_list(), ref)
            self.assertGreaterEqual(a.capacity, a.size)

if __name__ == "__main__":
    unittest.main()
