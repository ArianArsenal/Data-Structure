"""Segment tree for range sums with point updates. Node 1 covers the whole
array; node k's children are 2k and 2k+1, each covering one half.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class SegmentTree:
    def __init__(self, values):
        self.n = len(values)
        self.tree = [0] * (4 * max(1, self.n))
        if self.n:
            self._build(values, 1, 0, self.n - 1)

    def _build(self, values, node, lo, hi):
        if lo == hi:
            self.tree[node] = values[lo]
            return
        mid = (lo + hi) // 2
        self._build(values, 2 * node, lo, mid)
        self._build(values, 2 * node + 1, mid + 1, hi)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    # @op query
    def query(self, l, r):
        return self._query(1, 0, self.n - 1, l, r)  # @step call_root

    def _query(self, node, lo, hi, l, r):
        if r < lo or hi < l:  # @step check_disjoint
            return 0  # @step disjoint
        if l <= lo and hi <= r:  # @step check_inside
            return self.tree[node]  # @step inside
        mid = (lo + hi) // 2  # @step split
        left = self._query(2 * node, lo, mid, l, r)  # @step go_left
        right = self._query(2 * node + 1, mid + 1, hi, l, r)  # @step go_right
        return left + right  # @step combine
    # @endop

    # @op update
    def update(self, i, value):
        self._update(1, 0, self.n - 1, i, value)  # @step call_root

    def _update(self, node, lo, hi, i, value):
        if lo == hi:  # @step check_leaf
            self.tree[node] = value  # @step set_leaf
            return
        mid = (lo + hi) // 2  # @step split
        if i <= mid:  # @step pick_side
            self._update(2 * node, lo, mid, i, value)  # @step go_left
        else:
            self._update(2 * node + 1, mid + 1, hi, i, value)  # @step go_right
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]  # @step pull_up
    # @endop
