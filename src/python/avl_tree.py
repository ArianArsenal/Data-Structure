"""AVL tree: a BST that rebalances with rotations so that the two subtrees of
every node differ in height by at most 1.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1


def height(node):
    return node.height if node is not None else 0


def update(node):
    node.height = 1 + max(height(node.left), height(node.right))


class AVLTree:
    def __init__(self, keys=()):
        self.root = None
        for k in keys:
            self.insert(k)

    # @op insert
    def insert(self, key):
        self.root = self._insert(self.root, key)  # @step call_root

    def _insert(self, node, key):
        if node is None:  # @step check_null
            return Node(key)  # @step create
        if key < node.key:  # @step cmp_less
            node.left = self._insert(node.left, key)  # @step recurse_left
        elif key > node.key:  # @step cmp_greater
            node.right = self._insert(node.right, key)  # @step recurse_right
        else:
            return node  # @step duplicate
        update(node)  # @step update_height
        balance = height(node.left) - height(node.right)  # @step balance
        if balance > 1 and key < node.left.key:  # @step case_ll
            return self._rotate_right(node)  # @step fix_ll
        if balance < -1 and key > node.right.key:  # @step case_rr
            return self._rotate_left(node)  # @step fix_rr
        if balance > 1:  # @step case_lr
            node.left = self._rotate_left(node.left)  # @step fix_lr
            return self._rotate_right(node)  # @step fix_lr_2
        if balance < -1:  # @step case_rl
            node.right = self._rotate_right(node.right)  # @step fix_rl
            return self._rotate_left(node)  # @step fix_rl_2
        return node  # @step return_node

    def _rotate_right(self, y):
        x = y.left  # @step rotr_pick
        y.left = x.right  # @step rotr_move
        x.right = y  # @step rotr_link
        update(y)  # @step rotr_heights
        update(x)
        return x  # @step rotr_return

    def _rotate_left(self, x):
        y = x.right  # @step rotl_pick
        x.right = y.left  # @step rotl_move
        y.left = x  # @step rotl_link
        update(x)  # @step rotl_heights
        update(y)
        return y  # @step rotl_return
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
            if node.left is None or node.right is None:  # @step check_children
                return node.left if node.left is not None else node.right  # @step return_child
            succ = node.right  # @step succ_start
            while succ.left is not None:  # @step succ_loop
                succ = succ.left
            node.key = succ.key  # @step copy_key
            node.right = self._delete(node.right, succ.key)  # @step recurse_succ
        return self._rebalance(node)  # @step rebalance

    def _rebalance(self, node):
        update(node)  # @step rb_height
        balance = height(node.left) - height(node.right)  # @step rb_balance
        if balance > 1:  # @step rb_left_heavy
            if height(node.left.left) < height(node.left.right):  # @step rb_check_lr
                node.left = self._rotate_left(node.left)  # @step rb_fix_lr
            return self._rotate_right(node)  # @step rb_rotate_right
        if balance < -1:  # @step rb_right_heavy
            if height(node.right.right) < height(node.right.left):  # @step rb_check_rl
                node.right = self._rotate_right(node.right)  # @step rb_fix_rl
            return self._rotate_left(node)  # @step rb_rotate_left
        return node  # @step rb_done
    # @endop

    def inorder(self):
        out = []

        def walk(n):
            if n:
                walk(n.left)
                out.append(n.key)
                walk(n.right)

        walk(self.root)
        return out
