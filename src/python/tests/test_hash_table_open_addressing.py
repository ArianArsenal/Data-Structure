import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from hash_table_open_addressing import HashTableOpenAddressing  # noqa: E402


class TestHashTableOpenAddressing(unittest.TestCase):
    def test_basic(self):
        h = HashTableOpenAddressing(items=[(22, 1), (33, 2), (44, 3)])
        self.assertTrue(h.remove(33))
        self.assertEqual(h.get(44), 3)  # found by probing past the tombstone
        h.put(55, 4)  # reuses the tombstone slot
        self.assertEqual(h.keys[1], 55)
        self.assertEqual(h.get(55), 4)

    def test_full(self):
        h = HashTableOpenAddressing(items=[(i, i) for i in range(11)])
        with self.assertRaises(OverflowError):
            h.put(11, 0)
        self.assertIsNone(h.get(11))
        h.put(5, 50)  # updating an existing key still works when full
        self.assertEqual(h.get(5), 50)

    def test_random(self):
        rng, h, ref = random.Random(12), HashTableOpenAddressing(), {}
        for _ in range(2000):
            k = rng.randint(0, 40)
            r = rng.random()
            if r < 0.45 and (len(ref) < 11 or k in ref):
                v = rng.randint(0, 999)
                h.put(k, v)
                ref[k] = v
            elif r < 0.75:
                self.assertEqual(h.remove(k), k in ref)
                ref.pop(k, None)
            else:
                self.assertEqual(h.get(k), ref.get(k))
            self.assertEqual(h.size, len(ref))

if __name__ == "__main__":
    unittest.main()
