import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from trie import Trie  # noqa: E402


class TestTrie(unittest.TestCase):
    def test_words_and_prefixes(self):
        t = Trie(["car", "cart", "cat", "dog", "do"])
        self.assertTrue(t.search("car"))
        self.assertTrue(t.search("do"))
        self.assertFalse(t.search("ca"))
        self.assertTrue(t.starts_with("ca"))
        self.assertFalse(t.starts_with("cow"))
        self.assertFalse(t.search("carts"))
        t.insert("ca")
        self.assertTrue(t.search("ca"))

    def test_random(self):
        rng = random.Random(25)
        words = {"".join(rng.choice("abc") for _ in range(rng.randint(1, 5))) for _ in range(60)}
        t = Trie(words)
        for _ in range(300):
            w = "".join(rng.choice("abcd") for _ in range(rng.randint(1, 5)))
            self.assertEqual(t.search(w), w in words)
            self.assertEqual(t.starts_with(w), any(x.startswith(w) for x in words))

if __name__ == "__main__":
    unittest.main()
