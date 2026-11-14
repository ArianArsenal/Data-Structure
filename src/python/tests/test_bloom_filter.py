import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from bloom_filter import BloomFilter  # noqa: E402


class TestBloomFilter(unittest.TestCase):
    def test_no_false_negatives(self):
        rng = random.Random(13)
        items = [rng.randint(0, 999) for _ in range(5)]
        b = BloomFilter(items=items)
        for x in items:
            self.assertTrue(b.might_contain(x))

    def test_bits(self):
        b = BloomFilter()
        b.add(3)  # (3*7+7)%16=12, (3*11+11)%16=12, (3*13+13)%16=4
        self.assertEqual([i for i, bit in enumerate(b.bits) if bit], [4, 12])
        self.assertFalse(b.might_contain(5))

if __name__ == "__main__":
    unittest.main()
