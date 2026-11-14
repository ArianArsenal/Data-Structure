"""Bloom filter: a bit array plus k hash functions. No false negatives,
but might_contain can return a false positive.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""

SEEDS = (7, 11, 13)  # one simple hash per seed: (item * seed + seed) % m


class BloomFilter:
    def __init__(self, m=16, items=()):
        self.bits = [False] * m
        for x in items:
            self.add(x)

    # @op add
    def add(self, item):
        for seed in SEEDS:  # @step loop
            i = (item * seed + seed) % len(self.bits)  # @step hash
            self.bits[i] = True  # @step set
    # @endop

    # @op might_contain
    def might_contain(self, item):
        for seed in SEEDS:  # @step loop
            i = (item * seed + seed) % len(self.bits)  # @step hash
            if not self.bits[i]:  # @step check
                return False  # @step definitely_not
        return True  # @step maybe
    # @endop
