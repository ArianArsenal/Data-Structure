"""Binary search tree of integer keys (no duplicates).

Lines tagged `# @step <id>` and the `# @op` / `# @endop` markers drive the
visualizer (tools/build_code.js strips them); the code itself is plain Python.
"""


class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None


class BST:
    def __init__(self, keys=()):
        self.root = None
        for k in keys:
            self.insert(k)

    # @op insert
    def insert(self, key):
        if self.root is None:  # @step check_empty
            self.root = Node(key)  # @step set_root
            return True
        curr = self.root  # @step start
        while True:
            if key < curr.key:  # @step cmp_less
                if curr.left is None:  # @step check_left
                    curr.left = Node(key)  # @step attach_left
                    return True
                curr = curr.left  # @step go_left
            elif key > curr.key:  # @step cmp_greater
                if curr.right is None:  # @step check_right
                    curr.right = Node(key)  # @step attach_right
                    return True
                curr = curr.right  # @step go_right
            else:
                return False  # @step duplicate
    # @endop

    # @op search
    def search(self, key):
        curr = self.root  # @step start
        while curr is not None:  # @step loop
            if key == curr.key:  # @step cmp_equal
                return True  # @step found
            if key < curr.key:  # @step cmp_less
                curr = curr.left  # @step go_left
            else:
                curr = curr.right  # @step go_right
        return False  # @step not_found
    # @endop

    # @op delete
    def delete(self, key):
        self.root = self._delete(self.root, key)  # @step call_root

    def _delete(self, node, key):
        if node is None:  # @step check_null
            return None  # @step not_found
        if key < node.key:  # @step cmp_less
            node.left = self._delete(node.left, key)  # @step recurse_left
        elif key > node.key:  # @step cmp_greater
            node.right = self._delete(node.right, key)  # @step recurse_right
        else:
            if node.left is None:  # @step check_left
                return node.right  # @step return_right
            if node.right is None:  # @step check_right
                return node.left  # @step return_left
            succ = node.right  # @step succ_start
            while succ.left is not None:  # @step succ_loop
                succ = succ.left  # @step succ_advance
            node.key = succ.key  # @step copy_key
            node.right = self._delete(node.right, succ.key)  # @step recurse_succ
        return node  # @step return_node
    # @endop

    # @op inorder
    def inorder(self):
        result = []  # @step init
        self._inorder(self.root, result)  # @step call_root
        return result  # @step done

    def _inorder(self, node, result):
        if node is None:  # @step check_null
            return  # @step return_null
        self._inorder(node.left, result)  # @step go_left
        result.append(node.key)  # @step visit
        self._inorder(node.right, result)  # @step go_right
    # @endop

    # @op minimum
    def minimum(self):
        if self.root is None:  # @step check_empty
            return None  # @step empty
        curr = self.root  # @step start
        while curr.left is not None:  # @step loop
            curr = curr.left  # @step go_left
        return curr.key  # @step done
    # @endop

    # @op maximum
    def maximum(self):
        if self.root is None:  # @step check_empty
            return None  # @step empty
        curr = self.root  # @step start
        while curr.right is not None:  # @step loop
            curr = curr.right  # @step go_right
        return curr.key  # @step done
    # @endop

    # @op successor
    def successor(self, key):
        succ, curr = None, self.root  # @step start
        while curr is not None:  # @step loop
            if key < curr.key:  # @step compare
                succ = curr  # @step remember
                curr = curr.left  # @step go_left
            else:
                curr = curr.right  # @step go_right
        return succ.key if succ is not None else None  # @step done
    # @endop

    def __contains__(self, key):
        return self.search(key)
