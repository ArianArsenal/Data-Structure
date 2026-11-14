"""Hash map with separate chaining: each bucket is a linked list of entries.
Keys are non-negative integers; the hash is key % capacity.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class Entry:
    def __init__(self, key, value, next=None):
        self.key = key
        self.value = value
        self.next = next


class HashTableChaining:
    def __init__(self, capacity=7, items=()):
        self.buckets = [None] * capacity
        self.size = 0
        for k, v in items:
            self.put(k, v)

    # @op put
    def put(self, key, value):
        i = key % len(self.buckets)  # @step hash
        curr = self.buckets[i]  # @step start
        while curr is not None:  # @step loop
            if curr.key == key:  # @step compare
                curr.value = value  # @step update
                return
            curr = curr.next  # @step advance
        self.buckets[i] = Entry(key, value, self.buckets[i])  # @step prepend
        self.size += 1  # @step done
    # @endop

    # @op get
    def get(self, key):
        i = key % len(self.buckets)  # @step hash
        curr = self.buckets[i]  # @step start
        while curr is not None:  # @step loop
            if curr.key == key:  # @step compare
                return curr.value  # @step found
            curr = curr.next  # @step advance
        return None  # @step not_found
    # @endop

    # @op remove
    def remove(self, key):
        i = key % len(self.buckets)  # @step hash
        prev, curr = None, self.buckets[i]  # @step start
        while curr is not None:  # @step loop
            if curr.key == key:  # @step compare
                if prev is None:  # @step check_first
                    self.buckets[i] = curr.next  # @step unlink_first
                else:
                    prev.next = curr.next  # @step unlink
                self.size -= 1  # @step release
                return True  # @step done
            prev, curr = curr, curr.next  # @step advance
        return False  # @step not_found
    # @endop
