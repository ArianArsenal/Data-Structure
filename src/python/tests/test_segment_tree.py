import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from segment_tree import SegmentTree  # noqa: E402


class TestSegmentTree(unittest.TestCase):
    def test_random(self):
        rng = random.Random(31)
        a = [rng.randint(-9, 9) for _ in range(13)]
        st = SegmentTree(a)
        for _ in range(500):
            if rng.random() < 0.4:
                i, v = rng.randrange(len(a)), rng.randint(-9, 9)
                st.update(i, v)
                a[i] = v
            else:
                l = rng.randrange(len(a))
                r = rng.randrange(l, len(a))
                self.assertEqual(st.query(l, r), sum(a[l : r + 1]))

if __name__ == "__main__":
    unittest.main()
