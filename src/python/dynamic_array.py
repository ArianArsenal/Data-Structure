"""Growable array: doubles when full, halves when a quarter full.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class DynamicArray:
    def __init__(self, values=()):
        self.capacity = 2
        self.data = [None] * self.capacity
        self.size = 0
        for v in values:
            self.append(v)

    # @op append
    def append(self, value):
        if self.size == self.capacity:  # @step check_full
            self._resize(2 * self.capacity)  # @step grow
        self.data[self.size] = value  # @step place
        self.size += 1  # @step done

    def _resize(self, new_capacity):
        buffer = [None] * new_capacity  # @step alloc
        for i in range(self.size):  # @step copy_loop
            buffer[i] = self.data[i]  # @step copy
        self.data = buffer  # @step swap
        self.capacity = new_capacity
    # @endop

    # @op pop
    def pop(self):
        if self.size == 0:  # @step check_empty
            raise IndexError("pop from empty array")  # @step empty
        self.size -= 1  # @step shrink
        value = self.data[self.size]  # @step grab
        self.data[self.size] = None  # @step clear
        if 0 < self.size <= self.capacity // 4:  # @step check_quarter
            self._resize(self.capacity // 2)  # @step halve
        return value  # @step done
    # @endop

    def get(self, index):
        if not 0 <= index < self.size:
            raise IndexError("index out of range")
        return self.data[index]

    def to_list(self):
        return self.data[: self.size]
