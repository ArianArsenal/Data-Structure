"""Union-find (disjoint set union) with union by rank and path compression.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    # @op find
    def find(self, x):
        root = x  # @step start
        while self.parent[root] != root:  # @step climb_check
            root = self.parent[root]  # @step climb
        while self.parent[x] != root:  # @step compress_check
            nxt = self.parent[x]  # @step save
            self.parent[x] = root  # @step compress
            x = nxt  # @step advance
        return root  # @step done
    # @endop

    # @op union
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)  # @step find_roots
        if ra == rb:  # @step check_same
            return False  # @step same
        if self.rank[ra] < self.rank[rb]:  # @step compare_rank
            ra, rb = rb, ra  # @step swap
        self.parent[rb] = ra  # @step attach
        if self.rank[ra] == self.rank[rb]:  # @step check_tie
            self.rank[ra] += 1  # @step bump
        return True  # @step done
    # @endop

    def connected(self, a, b):
        return self.find(a) == self.find(b)
