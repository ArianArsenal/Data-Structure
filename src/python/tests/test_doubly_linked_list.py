import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from doubly_linked_list import DoublyLinkedList  # noqa: E402


class TestDoublyLinkedList(unittest.TestCase):
    def test_ops(self):
        d = DoublyLinkedList([2, 3])
        d.insert_head(1)
        d.insert_tail(4)
        self.assertEqual(d.to_list(), [1, 2, 3, 4])
        self.assertTrue(d.delete_value(1))
        self.assertTrue(d.delete_value(4))
        self.assertTrue(d.delete_value(2))
        self.assertFalse(d.delete_value(9))
        self.assertEqual(d.to_list(), [3])
        self.assertEqual(d.to_list_reversed(), [3])

    def test_random(self):
        rng, d, ref = random.Random(5), DoublyLinkedList(), []
        for _ in range(400):
            r, v = rng.random(), rng.randint(0, 15)
            if r < 0.3:
                d.insert_head(v)
                ref.insert(0, v)
            elif r < 0.6:
                d.insert_tail(v)
                ref.append(v)
            else:
                self.assertEqual(d.delete_value(v), v in ref)
                if v in ref:
                    ref.remove(v)
            self.assertEqual(d.to_list(), ref)
            self.assertEqual(d.to_list_reversed(), ref[::-1])

if __name__ == "__main__":
    unittest.main()
