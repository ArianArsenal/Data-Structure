import os
import random
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from bst import BST  # noqa: E402


class TestBST(unittest.TestCase):
    def test_insert_and_inorder(self):
        t = BST([50, 30, 70, 20, 40, 60, 80])
        self.assertEqual(t.inorder(), [20, 30, 40, 50, 60, 70, 80])
        self.assertFalse(t.insert(40))
        self.assertTrue(t.insert(45))
        self.assertEqual(t.inorder(), [20, 30, 40, 45, 50, 60, 70, 80])

    def test_search(self):
        t = BST([50, 30, 70])
        self.assertTrue(t.search(30))
        self.assertIn(70, t)
        self.assertFalse(t.search(31))
        self.assertFalse(BST().search(1))

    def test_delete_cases(self):
        t = BST([50, 30, 70, 20, 40, 60, 80])
        t.delete(20)  # leaf
        t.delete(30)  # one child
        t.delete(50)  # two children (root)
        t.delete(99)  # missing
        self.assertEqual(t.inorder(), [40, 60, 70, 80])
        self.assertEqual(t.root.key, 60)

    def test_random_against_set(self):
        rng = random.Random(7)
        t, ref = BST(), set()
        for _ in range(500):
            k = rng.randint(0, 60)
            if rng.random() < 0.6:
                self.assertEqual(t.insert(k), k not in ref)
                ref.add(k)
            else:
                t.delete(k)
                ref.discard(k)
            self.assertEqual(t.inorder(), sorted(ref))

    def test_min_max_successor(self):
        t = BST([50, 30, 70, 20, 40, 60, 80])
        self.assertEqual((t.minimum(), t.maximum()), (20, 80))
        self.assertEqual(t.successor(40), 50)
        self.assertEqual(t.successor(45), 50)
        self.assertEqual(t.successor(80), None)
        self.assertEqual(t.successor(5), 20)
        self.assertIsNone(BST().minimum())
        rng = random.Random(41)
        keys = sorted({rng.randint(0, 200) for _ in range(60)})
        t = BST(rng.sample(keys, len(keys)))
        for q in range(-5, 210, 7):
            nxt = [k for k in keys if k > q]
            self.assertEqual(t.successor(q), nxt[0] if nxt else None)


if __name__ == "__main__":
    unittest.main()
