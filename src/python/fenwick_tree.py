"""Fenwick tree (binary indexed tree) for prefix sums. 1-indexed: tree[i]
stores the sum of the lowbit(i) elements ending at i, where lowbit(i) = i & -i.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class FenwickTree:
    def __init__(self, values=()):
        self.tree = [0] * (len(values) + 1)
        for i, v in enumerate(values, start=1):
            self.update(i, v)

    # @op update
    def update(self, i, delta):
        while i < len(self.tree):  # @step loop
            self.tree[i] += delta  # @step add
            i += i & -i  # @step next
    # @endop

    # @op prefix_sum
    def prefix_sum(self, i):
        total = 0  # @step init
        while i > 0:  # @step loop
            total += self.tree[i]  # @step add
            i -= i & -i  # @step next
        return total  # @step done
    # @endop

    def range_sum(self, l, r):
        return self.prefix_sum(r) - self.prefix_sum(l - 1)
