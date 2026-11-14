import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from suffix_array import SuffixArray  # noqa: E402


class TestSuffixArray(unittest.TestCase):
    def test_banana(self):
        s = SuffixArray("banana")
        self.assertEqual(s.sa, [5, 3, 1, 0, 4, 2])
        self.assertEqual(s.lcp, [0, 1, 3, 0, 0, 2])
        self.assertIn(s.search("ana"), (1, 3))
        self.assertEqual(s.search("nab"), -1)
        self.assertEqual(s.search("b"), 0)

    def test_random(self):
        rng = random.Random(35)
        for _ in range(30):
            text = "".join(rng.choice("ab") for _ in range(rng.randint(1, 12)))
            s = SuffixArray(text)
            self.assertEqual(s.sa, sorted(range(len(text)), key=lambda i: text[i:]))
            for _ in range(10):
                p = "".join(rng.choice("abc") for _ in range(rng.randint(1, 3)))
                pos = s.search(p)
                if p in text:
                    self.assertTrue(text.startswith(p, pos))
                else:
                    self.assertEqual(pos, -1)

if __name__ == "__main__":
    unittest.main()
