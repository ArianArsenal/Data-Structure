import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from singly_linked_list import SinglyLinkedList  # noqa: E402


class TestSinglyLinkedList(unittest.TestCase):
    def test_build_and_inserts(self):
        lst = SinglyLinkedList([3, 7, 1])
        self.assertEqual(lst.to_list(), [3, 7, 1])
        lst.insert_head(5)
        lst.insert_tail(9)
        self.assertEqual(lst.to_list(), [5, 3, 7, 1, 9])
        self.assertEqual(len(lst), 5)

    def test_insert_into_empty(self):
        lst = SinglyLinkedList()
        lst.insert_tail(4)
        self.assertEqual(lst.to_list(), [4])
        lst = SinglyLinkedList()
        lst.insert_head(4)
        self.assertEqual(lst.to_list(), [4])

    def test_insert_at(self):
        lst = SinglyLinkedList([3, 7, 1])
        lst.insert_at(0, 0)
        lst.insert_at(2, 5)
        lst.insert_at(5, 8)
        self.assertEqual(lst.to_list(), [0, 3, 5, 7, 1, 8])
        with self.assertRaises(IndexError):
            lst.insert_at(7, 1)
        with self.assertRaises(IndexError):
            lst.insert_at(-1, 1)

    def test_delete_value(self):
        lst = SinglyLinkedList([3, 7, 1, 7])
        self.assertTrue(lst.delete_value(3))
        self.assertTrue(lst.delete_value(7))
        self.assertEqual(lst.to_list(), [1, 7])
        self.assertFalse(lst.delete_value(42))
        self.assertTrue(lst.delete_value(7))
        self.assertTrue(lst.delete_value(1))
        self.assertFalse(lst.delete_value(1))
        self.assertEqual(len(lst), 0)

    def test_search(self):
        lst = SinglyLinkedList([3, 7, 1])
        self.assertEqual(lst.search(3), 0)
        self.assertEqual(lst.search(1), 2)
        self.assertEqual(lst.search(4), -1)
        self.assertEqual(SinglyLinkedList().search(4), -1)

    def test_reverse(self):
        lst = SinglyLinkedList([1, 2, 3, 4])
        lst.reverse()
        self.assertEqual(lst.to_list(), [4, 3, 2, 1])
        empty = SinglyLinkedList()
        empty.reverse()
        self.assertEqual(empty.to_list(), [])


if __name__ == "__main__":
    unittest.main()
