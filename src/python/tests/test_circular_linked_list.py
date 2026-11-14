import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from circular_linked_list import CircularLinkedList  # noqa: E402


class TestCircularLinkedList(unittest.TestCase):
    def test_ops(self):
        c = CircularLinkedList([2, 3])
        c.insert_head(1)
        c.insert_tail(4)
        self.assertEqual(c.traverse(), [1, 2, 3, 4])
        self.assertEqual(c.tail.next.value, 1)
        self.assertTrue(c.delete_value(4))
        self.assertEqual(c.tail.value, 3)
        self.assertFalse(c.delete_value(9))
        for v in (1, 2, 3):
            self.assertTrue(c.delete_value(v))
        self.assertEqual(c.traverse(), [])
        self.assertIsNone(c.tail)

    def test_random(self):
        rng, c, ref = random.Random(6), CircularLinkedList(), []
        for _ in range(400):
            r, v = rng.random(), rng.randint(0, 15)
            if r < 0.3:
                c.insert_head(v)
                ref.insert(0, v)
            elif r < 0.6:
                c.insert_tail(v)
                ref.append(v)
            else:
                self.assertEqual(c.delete_value(v), v in ref)
                if v in ref:
                    ref.remove(v)
            self.assertEqual(c.traverse(), ref)

if __name__ == "__main__":
    unittest.main()
