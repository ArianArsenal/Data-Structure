import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from splay_tree import SplayTree  # noqa: E402


def check_parents(node, parent=None):
    if node is None:
        return
    assert node.parent is parent
    check_parents(node.left, node)
    check_parents(node.right, node)


class TestSplayTree(unittest.TestCase):
    def test_access_moves_to_root(self):
        t = SplayTree([50, 30, 70, 20, 40, 60, 80])
        self.assertTrue(t.search(20))
        self.assertEqual(t.root.key, 20)
        self.assertFalse(t.search(45))
        self.assertIn(t.root.key, (40, 50))  # last node touched
        self.assertTrue(t.insert(45))
        self.assertEqual(t.root.key, 45)
        self.assertFalse(t.insert(30))
        self.assertEqual(t.root.key, 30)

    def test_random(self):
        rng, t, ref = random.Random(23), SplayTree(), set()
        for _ in range(600):
            k = rng.randint(0, 80)
            if rng.random() < 0.6:
                self.assertEqual(t.insert(k), k not in ref)
                ref.add(k)
            else:
                self.assertEqual(t.search(k), k in ref)
            check_parents(t.root)
        self.assertEqual(t.inorder(), sorted(ref))

if __name__ == "__main__":
    unittest.main()
