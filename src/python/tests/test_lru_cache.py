import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from collections import OrderedDict  # noqa: E402

from lru_cache import LRUCache  # noqa: E402


class TestLRUCache(unittest.TestCase):
    def test_eviction(self):
        c = LRUCache(2)
        c.put(1, 10)
        c.put(2, 20)
        self.assertEqual(c.get(1), 10)  # 1 becomes most recent
        c.put(3, 30)  # evicts 2
        self.assertEqual(c.get(2), -1)
        self.assertEqual(c.keys_by_recency(), [3, 1])

    def test_random(self):
        rng, c, ref = random.Random(14), LRUCache(3), OrderedDict()
        for _ in range(1000):
            k = rng.randint(0, 6)
            if rng.random() < 0.5:
                v = rng.randint(0, 99)
                c.put(k, v)
                if k in ref:
                    ref.move_to_end(k)
                elif len(ref) == 3:
                    ref.popitem(last=False)
                ref[k] = v
            else:
                expect = ref.get(k, -1)
                if k in ref:
                    ref.move_to_end(k)
                self.assertEqual(c.get(k), expect)
            self.assertEqual(c.keys_by_recency(), list(reversed(ref)))

if __name__ == "__main__":
    unittest.main()
