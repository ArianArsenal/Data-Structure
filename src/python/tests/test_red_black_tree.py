import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from red_black_tree import BLACK, RED, RedBlackTree  # noqa: E402


def check(node, parent=None):
    """Return black height; assert red-black rules and parent links."""
    if node is None:
        return 1
    assert node.parent is parent, "bad parent link"
    if node.color == RED:
        for child in (node.left, node.right):
            assert child is None or child.color == BLACK, "red-red"
    lb, rb = check(node.left, node), check(node.right, node)
    assert lb == rb, "black heights differ"
    return lb + (node.color == BLACK)


class TestRedBlackTree(unittest.TestCase):
    def test_sorted_inserts(self):
        t = RedBlackTree(range(100))
        self.assertEqual(t.inorder(), list(range(100)))
        self.assertEqual(t.root.color, BLACK)
        check(t.root)

    def test_duplicates(self):
        t = RedBlackTree([5])
        self.assertFalse(t.insert(5))
        self.assertTrue(t.insert(6))

    def test_random(self):
        rng = random.Random(22)
        keys = [rng.randint(0, 500) for _ in range(500)]
        t = RedBlackTree(keys)
        self.assertEqual(t.inorder(), sorted(set(keys)))
        check(t.root)

    def test_delete(self):
        rng = random.Random(44)
        t, ref = RedBlackTree(), set()
        for _ in range(1500):
            k = rng.randint(0, 120)
            if rng.random() < 0.55:
                self.assertEqual(t.insert(k), k not in ref)
                ref.add(k)
            else:
                self.assertEqual(t.delete(k), k in ref)
                ref.discard(k)
            if t.root is not None:
                self.assertEqual(t.root.color, BLACK)
            check(t.root)
        self.assertEqual(t.inorder(), sorted(ref))


if __name__ == "__main__":
    unittest.main()
