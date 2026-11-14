"""Red-black tree (insert). Invariants: the root is black, a red node has no red
child, and every root-to-leaf path has the same number of black nodes.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""

RED, BLACK = "red", "black"


class Node:
    def __init__(self, key, parent=None):
        self.key = key
        self.color = RED
        self.left = None
        self.right = None
        self.parent = parent


class RedBlackTree:
    def __init__(self, keys=()):
        self.root = None
        for k in keys:
            self.insert(k)

    # @op insert
    def insert(self, key):
        parent, curr = None, self.root  # @step start
        while curr is not None:  # @step loop
            if key == curr.key:  # @step check_dup
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
        self._fix_insert(node)  # @step call_fix
        return True  # @step done

    def _fix_insert(self, z):
        while z.parent is not None and z.parent.color == RED:  # @step fix_loop
            p = z.parent
            g = p.parent  # @step family
            uncle = g.right if p is g.left else g.left
            if uncle is not None and uncle.color == RED:  # @step check_uncle
                p.color = BLACK  # @step recolor
                uncle.color = BLACK
                g.color = RED
                z = g  # @step move_up
            else:
                if (p is g.left) != (z is p.left):  # @step check_triangle
                    self._rotate(z)  # @step rotate_triangle
                    z, p = p, z
                p.color = BLACK  # @step recolor_line
                g.color = RED
                self._rotate(p)  # @step rotate_line
        self.root.color = BLACK  # @step root_black

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
