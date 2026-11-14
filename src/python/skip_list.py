"""Skip list: sorted linked lists stacked in levels. Each node is promoted to
the next level with probability 1/2, giving O(log n) expected search.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""

import random

MAX_LEVEL = 4


class Node:
    def __init__(self, key, level):
        self.key = key
        self.next = [None] * level


class SkipList:
    def __init__(self, keys=(), seed=None):
        self.head = Node(None, MAX_LEVEL)
        self.level = 1
        self.rng = random.Random(seed)
        for k in keys:
            self.insert(k)

    def _random_level(self):
        level = 1
        while level < MAX_LEVEL and self.rng.random() < 0.5:
            level += 1
        return level

    # @op search
    def search(self, key):
        node = self.head  # @step start
        for lvl in range(self.level - 1, -1, -1):  # @step level
            while node.next[lvl] is not None and node.next[lvl].key < key:  # @step check_right
                node = node.next[lvl]  # @step move_right
        node = node.next[0]  # @step bottom
        return node is not None and node.key == key  # @step check
    # @endop

    # @op insert
    def insert(self, key):
        update = [self.head] * MAX_LEVEL  # @step init
        node = self.head
        for lvl in range(self.level - 1, -1, -1):  # @step level
            while node.next[lvl] is not None and node.next[lvl].key < key:  # @step check_right
                node = node.next[lvl]  # @step move_right
            update[lvl] = node  # @step remember
        if node.next[0] is not None and node.next[0].key == key:  # @step check_dup
            return False  # @step duplicate
        level = self._random_level()  # @step coin
        self.level = max(self.level, level)
        fresh = Node(key, level)  # @step create
        for lvl in range(level):  # @step link_loop
            fresh.next[lvl] = update[lvl].next[lvl]  # @step link_next
            update[lvl].next[lvl] = fresh  # @step link_prev
        return True  # @step done
    # @endop

    def to_list(self):
        out, node = [], self.head.next[0]
        while node is not None:
            out.append(node.key)
            node = node.next[0]
        return out
