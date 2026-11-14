import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from static_array import StaticArray  # noqa: E402


class TestStaticArray(unittest.TestCase):
    def test_ops(self):
        a = StaticArray(values=[1, 2, 3])
        a.insert(1, 9)
        self.assertEqual(a.to_list(), [1, 9, 2, 3])
        self.assertEqual(a.delete(0), 1)
        self.assertEqual(a.to_list(), [9, 2, 3])
        self.assertEqual(a.search(3), 2)
        self.assertEqual(a.search(7), -1)
        with self.assertRaises(IndexError):
            a.insert(5, 1)
        with self.assertRaises(IndexError):
            a.delete(3)

    def test_full(self):
        a = StaticArray(values=range(8))
        with self.assertRaises(OverflowError):
            a.insert(0, 1)

    def test_random(self):
        rng, a, ref = random.Random(1), StaticArray(), []
        for _ in range(300):
            if ref and (len(ref) == 8 or rng.random() < 0.5):
                i = rng.randrange(len(ref))
                self.assertEqual(a.delete(i), ref.pop(i))
            else:
                i, v = rng.randint(0, len(ref)), rng.randint(0, 50)
                a.insert(i, v)
                ref.insert(i, v)
            self.assertEqual(a.to_list(), ref)

if __name__ == "__main__":
    unittest.main()
