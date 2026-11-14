"""Hash map with open addressing and linear probing. Deleted slots become
tombstones so later probes keep going past them. Keys are non-negative ints.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""

EMPTY, OCCUPIED, DELETED = 0, 1, 2


class HashTableOpenAddressing:
    def __init__(self, capacity=11, items=()):
        self.keys = [0] * capacity
        self.values = [0] * capacity
        self.state = [EMPTY] * capacity
        self.size = 0
        for k, v in items:
            self.put(k, v)

    # @op put
    def put(self, key, value):
        i = key % len(self.keys)  # @step hash
        first_free = -1  # @step init_free
        for _ in range(len(self.keys)):  # @step probe
            if self.state[i] == EMPTY:  # @step check_empty
                break  # @step stop
            if self.state[i] == DELETED:  # @step check_deleted
                if first_free == -1:
                    first_free = i  # @step remember
            elif self.keys[i] == key:  # @step compare
                self.values[i] = value  # @step update
                return
            i = (i + 1) % len(self.keys)  # @step next
        if first_free != -1:  # @step check_free
            i = first_free  # @step use_free
        elif self.state[i] != EMPTY:  # @step check_full
            raise OverflowError("table is full")  # @step full
        self.keys[i] = key  # @step place
        self.values[i] = value
        self.state[i] = OCCUPIED
        self.size += 1  # @step done
    # @endop

    # @op get
    def get(self, key):
        i = key % len(self.keys)  # @step hash
        for _ in range(len(self.keys)):  # @step probe
            if self.state[i] == EMPTY:  # @step check_empty
                return None  # @step not_found
            if self.state[i] == OCCUPIED and self.keys[i] == key:  # @step compare
                return self.values[i]  # @step found
            i = (i + 1) % len(self.keys)  # @step next
        return None  # @step exhausted
    # @endop

    # @op remove
    def remove(self, key):
        i = key % len(self.keys)  # @step hash
        for _ in range(len(self.keys)):  # @step probe
            if self.state[i] == EMPTY:  # @step check_empty
                return False  # @step not_found
            if self.state[i] == OCCUPIED and self.keys[i] == key:  # @step compare
                self.state[i] = DELETED  # @step tombstone
                self.size -= 1
                return True  # @step done
            i = (i + 1) % len(self.keys)  # @step next
        return False  # @step exhausted
    # @endop
