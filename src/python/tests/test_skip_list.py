import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from skip_list import SkipList  # noqa: E402


class TestSkipList(unittest.TestCase):
    def test_random(self):
        rng = random.Random(34)
        s, ref = SkipList(seed=1), set()
        for _ in range(500):
            k = rng.randint(0, 100)
            if rng.random() < 0.5:
                self.assertEqual(s.insert(k), k not in ref)
                ref.add(k)
            else:
                self.assertEqual(s.search(k), k in ref)
        self.assertEqual(s.to_list(), sorted(ref))

if __name__ == "__main__":
    unittest.main()
