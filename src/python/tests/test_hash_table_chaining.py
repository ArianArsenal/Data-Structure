import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from hash_table_chaining import HashTableChaining  # noqa: E402


class TestHashTableChaining(unittest.TestCase):
    def test_basic(self):
        h = HashTableChaining(items=[(10, 1), (3, 2), (17, 3)])
        self.assertEqual(h.get(3), 2)
        h.put(3, 9)
        self.assertEqual(h.get(3), 9)
        self.assertEqual(h.size, 3)
        self.assertTrue(h.remove(17))
        self.assertFalse(h.remove(17))
        self.assertIsNone(h.get(17))
        self.assertEqual(h.get(10), 1)

    def test_random(self):
        rng, h, ref = random.Random(11), HashTableChaining(), {}
        for _ in range(1000):
            k = rng.randint(0, 40)
            r = rng.random()
            if r < 0.5:
                v = rng.randint(0, 999)
                h.put(k, v)
                ref[k] = v
            elif r < 0.75:
                self.assertEqual(h.remove(k), k in ref)
                ref.pop(k, None)
            else:
                self.assertEqual(h.get(k), ref.get(k))
            self.assertEqual(h.size, len(ref))

    def test_resize(self):
        h = HashTableChaining()
        for k in range(7):
            h.put(k, k)
        self.assertEqual(len(h.buckets), 7)
        h.put(7, 7)  # size 8 > 7 buckets: double
        self.assertEqual(len(h.buckets), 14)
        for k in range(8):
            self.assertEqual(h.get(k), k)
            i = k % 14
            node = h.buckets[i]
            while node.key != k:
                node = node.next


if __name__ == "__main__":
    unittest.main()
