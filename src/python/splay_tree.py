"""Splay tree: a self-adjusting BST. Every access splays the touched node to
the root with zig, zig-zig and zig-zag rotations.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class Node:
    def __init__(self, key, parent=None):
        self.key = key
        self.left = None
        self.right = None
        self.parent = parent


class SplayTree:
    def __init__(self, keys=()):
        self.root = None
        for k in keys:
            self.insert(k)

    # @op search
    def search(self, key):
        curr, last = self.root, None  # @step start
        while curr is not None:  # @step loop
            last = curr  # @step remember
            if key == curr.key:  # @step cmp_equal
                break  # @step found
            curr = curr.left if key < curr.key else curr.right  # @step step
        if last is not None:  # @step check_last
            self._splay(last)  # @step call_splay
        return curr is not None  # @step done
    # @endop

    # @op insert
    def insert(self, key):
        parent, curr = None, self.root  # @step start
        while curr is not None:  # @step loop
            if key == curr.key:  # @step check_dup
                self._splay(curr)  # @step splay_dup
                return False  # @step duplicate
            parent = curr  # @step descend
            curr = curr.left if key < curr.key else curr.right
        node = Node(key, parent)  # @step create
        if parent is None:  # @step check_root
            self.root = node  # @step set_root
        elif key < parent.key:  # @step cmp_parent
            parent.left = node  # @step attach_left
        else:
            parent.right = node  # @step attach_right
        self._splay(node)  # @step call_splay
        return True  # @step done
    # @endop

    # @op splay
    def _splay(self, x):
        while x.parent is not None:  # @step sp_loop
            p = x.parent  # @step sp_family
            g = p.parent
            if g is None:  # @step sp_check_zig
                self._rotate(x)  # @step sp_zig
            elif (g.left is p) == (p.left is x):  # @step sp_check_zigzig
                self._rotate(p)  # @step sp_zigzig_1
                self._rotate(x)  # @step sp_zigzig_2
            else:
                self._rotate(x)  # @step sp_zigzag_1
                self._rotate(x)  # @step sp_zigzag_2

    def _rotate(self, x):
        """Rotate x above its parent."""
        p, g = x.parent, x.parent.parent  # @step rot_start
        if p.left is x:  # @step rot_dir
            p.left = x.right
            if x.right is not None:
                x.right.parent = p
            x.right = p  # @step rot_right
        else:
            p.right = x.left
            if x.left is not None:
                x.left.parent = p
            x.left = p  # @step rot_left
        p.parent = x  # @step rot_relink
        x.parent = g
        if g is None:
            self.root = x
        elif g.left is p:
            g.left = x
        else:
            g.right = x
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
