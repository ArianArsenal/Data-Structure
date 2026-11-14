import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from array_stack import ArrayStack  # noqa: E402


class TestArrayStack(unittest.TestCase):
    def test_lifo(self):
        s = ArrayStack(values=[1, 2, 3])
        self.assertEqual(s.peek(), 3)
        s.push(4)
        self.assertEqual([s.pop() for _ in range(4)], [4, 3, 2, 1])
        with self.assertRaises(IndexError):
            s.pop()
        with self.assertRaises(IndexError):
            s.peek()

    def test_overflow(self):
        s = ArrayStack(values=range(8))
        with self.assertRaises(OverflowError):
            s.push(9)
        self.assertEqual(len(s), 8)

if __name__ == "__main__":
    unittest.main()
