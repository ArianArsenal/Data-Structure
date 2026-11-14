"""LRU cache: a hash map for O(1) lookup plus a doubly linked list ordered by
recency (most recent right after `head`, least recent right before `tail`).

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity=3):
        self.capacity = capacity
        self.map = {}
        self.head = Node()  # sentinel before the most recent entry
        self.tail = Node()  # sentinel after the least recent entry
        self.head.next = self.tail
        self.tail.prev = self.head

    # @op get
    def get(self, key):
        if key not in self.map:  # @step lookup
            return -1  # @step miss
        node = self.map[key]  # @step hit
        self._move_to_front(node)  # @step touch
        return node.value  # @step done
    # @endop

    # @op put
    def put(self, key, value):
        if key in self.map:  # @step lookup
            node = self.map[key]  # @step hit
            node.value = value  # @step update
            self._move_to_front(node)  # @step touch
            return
        if len(self.map) == self.capacity:  # @step check_full
            lru = self.tail.prev  # @step pick_lru
            self._unlink(lru)  # @step evict
            del self.map[lru.key]  # @step forget
        node = Node(key, value)  # @step create
        self.map[key] = node  # @step remember
        self._push_front(node)  # @step insert
    # @endop

    # @op helpers
    def _move_to_front(self, node):
        self._unlink(node)  # @step mf_unlink
        self._push_front(node)  # @step mf_push

    def _unlink(self, node):
        node.prev.next = node.next  # @step ul_next
        node.next.prev = node.prev  # @step ul_prev

    def _push_front(self, node):
        node.next = self.head.next  # @step pf_next
        node.prev = self.head  # @step pf_prev
        self.head.next.prev = node  # @step pf_old
        self.head.next = node  # @step pf_head
    # @endop

    def keys_by_recency(self):
        out, curr = [], self.head.next
        while curr is not self.tail:
            out.append(curr.key)
            curr = curr.next
        return out
