"""Fixed-capacity array with insert/delete by shifting.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class StaticArray:
    def __init__(self, capacity=8, values=()):
        self.data = [None] * capacity
        self.size = 0
        for v in values:
            self.insert(self.size, v)

    # @op insert
    def insert(self, index, value):
        if self.size == len(self.data):  # @step check_full
            raise OverflowError("array is full")  # @step full
        if index < 0 or index > self.size:  # @step check_bounds
            raise IndexError("index out of range")  # @step out_of_range
        i = self.size  # @step start
        while i > index:  # @step loop
            self.data[i] = self.data[i - 1]  # @step shift
            i -= 1
        self.data[index] = value  # @step place
        self.size += 1  # @step done
    # @endop

    # @op delete
    def delete(self, index):
        if index < 0 or index >= self.size:  # @step check_bounds
            raise IndexError("index out of range")  # @step out_of_range
        removed = self.data[index]  # @step grab
        for i in range(index, self.size - 1):  # @step loop
            self.data[i] = self.data[i + 1]  # @step shift
        self.size -= 1  # @step shrink
        self.data[self.size] = None  # @step clear
        return removed  # @step done
    # @endop

    # @op search
    def search(self, value):
        for i in range(self.size):  # @step loop
            if self.data[i] == value:  # @step compare
                return i  # @step found
        return -1  # @step not_found
    # @endop

    def to_list(self):
        return self.data[: self.size]
