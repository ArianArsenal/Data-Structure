import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from avl_tree import AVLTree  # noqa: E402


def check(node):
    """Return height; assert AVL balance and stored heights."""
    if node is None:
        return 0
    lh, rh = check(node.left), check(node.right)
    assert abs(lh - rh) <= 1, "unbalanced"
    assert node.height == 1 + max(lh, rh), "stale height"
    return node.height


class TestAVLTree(unittest.TestCase):
    def test_sorted_inserts_stay_balanced(self):
        t = AVLTree(range(1, 128))
        self.assertEqual(t.inorder(), list(range(1, 128)))
        self.assertEqual(check(t.root), 7)

    def test_rotation_cases(self):
        for keys, root in (([3, 2, 1], 2), ([1, 2, 3], 2), ([3, 1, 2], 2), ([1, 3, 2], 2)):
            self.assertEqual(AVLTree(keys).root.key, root)

    def test_random(self):
        rng = random.Random(21)
        keys = [rng.randint(0, 500) for _ in range(400)]
        t = AVLTree(keys)
        self.assertEqual(t.inorder(), sorted(set(keys)))
        check(t.root)

    def test_delete(self):
        rng = random.Random(43)
        t, ref = AVLTree(), set()
        for _ in range(1500):
            k = rng.randint(0, 120)
            if rng.random() < 0.55:
                t.insert(k)
                ref.add(k)
            else:
                t.delete(k)
                ref.discard(k)
        self.assertEqual(t.inorder(), sorted(ref))
        check(t.root)
        for k in list(ref):
            t.delete(k)
        self.assertIsNone(t.root)


if __name__ == "__main__":
    unittest.main()
