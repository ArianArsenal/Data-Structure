import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from b_tree import T, BTree  # noqa: E402


def check(node, depth, leaf_depths, is_root=True):
    assert len(node.keys) <= 2 * T - 1
    assert is_root or len(node.keys) >= T - 1
    assert node.keys == sorted(node.keys)
    if node.leaf:
        leaf_depths.add(depth)
    else:
        assert len(node.children) == len(node.keys) + 1
        for c in node.children:
            check(c, depth + 1, leaf_depths, False)


class TestBTree(unittest.TestCase):
    def test_basic(self):
        t = BTree([10, 20, 5, 6, 12, 30, 7, 17])
        self.assertEqual(t.to_list(), [5, 6, 7, 10, 12, 17, 20, 30])
        self.assertTrue(t.search(17))
        self.assertFalse(t.search(11))

    def test_random(self):
        rng = random.Random(24)
        keys = [rng.randint(0, 999) for _ in range(500)]
        t = BTree(keys)
        self.assertEqual(t.to_list(), sorted(keys))
        depths = set()
        check(t.root, 0, depths)
        self.assertEqual(len(depths), 1)  # all leaves at the same depth
        for k in keys[:100]:
            self.assertTrue(t.search(k))

if __name__ == "__main__":
    unittest.main()
