"""B-tree with minimum degree T = 2 (a 2-3-4 tree): every node holds 1 to 3
keys. Insert splits full nodes on the way down, so the tree only grows at the root.
Delete makes sure every node it enters has at least T keys (by borrowing from a
sibling or merging), so it never has to walk back up.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""

T = 2  # minimum degree: non-root nodes hold T-1 .. 2T-1 keys


class BNode:
    def __init__(self, leaf=True):
        self.keys = []
        self.children = []
        self.leaf = leaf


class BTree:
    def __init__(self, keys=()):
        self.root = BNode()
        for k in keys:
            self.insert(k)

    # @op search
    def search(self, key):
        node = self.root  # @step start
        while True:
            i = 0  # @step scan_start
            while i < len(node.keys) and key > node.keys[i]:  # @step scan
                i += 1
            if i < len(node.keys) and node.keys[i] == key:  # @step check_hit
                return True  # @step found
            if node.leaf:  # @step check_leaf
                return False  # @step not_found
            node = node.children[i]  # @step descend
    # @endop

    # @op insert
    def insert(self, key):
        root = self.root  # @step start
        if len(root.keys) == 2 * T - 1:  # @step check_root_full
            new_root = BNode(leaf=False)  # @step new_root
            new_root.children.append(root)
            self._split_child(new_root, 0)  # @step split_root
            self.root = new_root  # @step set_root
        self._insert_nonfull(self.root, key)  # @step call_nonfull

    def _insert_nonfull(self, node, key):
        while not node.leaf:  # @step nf_loop
            i = 0  # @step nf_scan_start
            while i < len(node.keys) and key > node.keys[i]:  # @step nf_scan
                i += 1
            if len(node.children[i].keys) == 2 * T - 1:  # @step nf_check_full
                self._split_child(node, i)  # @step nf_split
                if key > node.keys[i]:  # @step nf_pick
                    i += 1
            node = node.children[i]  # @step nf_descend
        i = 0  # @step leaf_start
        while i < len(node.keys) and key > node.keys[i]:  # @step leaf_scan
            i += 1
        node.keys.insert(i, key)  # @step leaf_insert

    def _split_child(self, parent, i):
        full = parent.children[i]  # @step sp_full
        right = BNode(leaf=full.leaf)  # @step sp_new
        mid = full.keys[T - 1]  # @step sp_mid
        right.keys = full.keys[T:]  # @step sp_move_keys
        full.keys = full.keys[: T - 1]
        if not full.leaf:  # @step sp_check_leaf
            right.children = full.children[T:]  # @step sp_move_children
            full.children = full.children[:T]
        parent.keys.insert(i, mid)  # @step sp_lift
        parent.children.insert(i + 1, right)  # @step sp_link
    # @endop

    # @op delete
    def delete(self, key):
        removed = self._delete(self.root, key)  # @step call_root
        if not self.root.keys and not self.root.leaf:  # @step check_root
            self.root = self.root.children[0]  # @step shrink_root
        return removed

    def _delete(self, node, key):
        i = 0  # @step scan_start
        while i < len(node.keys) and key > node.keys[i]:  # @step scan
            i += 1
        if i < len(node.keys) and node.keys[i] == key:  # @step check_here
            if node.leaf:  # @step check_leaf
                node.keys.pop(i)  # @step remove_leaf
                return True
            if len(node.children[i].keys) >= T:  # @step case_pred
                pred = node.children[i]  # @step find_pred
                while not pred.leaf:
                    pred = pred.children[-1]
                node.keys[i] = pred.keys[-1]  # @step use_pred
                return self._delete(node.children[i], node.keys[i])  # @step recurse_pred
            if len(node.children[i + 1].keys) >= T:  # @step case_succ
                succ = node.children[i + 1]  # @step find_succ
                while not succ.leaf:
                    succ = succ.children[0]
                node.keys[i] = succ.keys[0]  # @step use_succ
                return self._delete(node.children[i + 1], node.keys[i])  # @step recurse_succ
            self._merge(node, i)  # @step merge_here
            return self._delete(node.children[i], key)  # @step recurse_merged
        if node.leaf:  # @step check_missing
            return False  # @step not_found
        if len(node.children[i].keys) == T - 1:  # @step check_thin
            i = self._fill(node, i)  # @step fill
        return self._delete(node.children[i], key)  # @step descend

    def _fill(self, node, i):
        """Give child i at least T keys; return the index of the child to enter."""
        child = node.children[i]
        if i > 0 and len(node.children[i - 1].keys) >= T:  # @step borrow_left_check
            left = node.children[i - 1]
            child.keys.insert(0, node.keys[i - 1])  # @step borrow_left
            node.keys[i - 1] = left.keys.pop()
            if not left.leaf:
                child.children.insert(0, left.children.pop())
            return i
        if i < len(node.keys) and len(node.children[i + 1].keys) >= T:  # @step borrow_right_check
            right = node.children[i + 1]
            child.keys.append(node.keys[i])  # @step borrow_right
            node.keys[i] = right.keys.pop(0)
            if not right.leaf:
                child.children.append(right.children.pop(0))
            return i
        if i < len(node.keys):  # @step merge_check
            self._merge(node, i)  # @step merge_right
            return i
        self._merge(node, i - 1)  # @step merge_left
        return i - 1

    def _merge(self, node, i):
        """Merge child i, key i and child i + 1 into child i."""
        left, right = node.children[i], node.children[i + 1]  # @step mg_pick
        left.keys.append(node.keys.pop(i))  # @step mg_pull
        left.keys.extend(right.keys)  # @step mg_join
        left.children.extend(right.children)
        node.children.pop(i + 1)  # @step mg_unlink
    # @endop

    def to_list(self):
        out = []

        def walk(n):
            for j, k in enumerate(n.keys):
                if not n.leaf:
                    walk(n.children[j])
                out.append(k)
            if not n.leaf:
                walk(n.children[-1])

        walk(self.root)
        return out
