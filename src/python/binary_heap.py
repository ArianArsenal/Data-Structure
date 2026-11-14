"""Binary min-heap stored in an array: children of i are 2i+1 and 2i+2.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class BinaryHeap:
    def __init__(self, values=()):
        self.data = []
        for v in values:
            self.insert(v)

    # @op insert
    def insert(self, value):
        self.data.append(value)  # @step append
        i = len(self.data) - 1  # @step start
        while i > 0:  # @step loop
            parent = (i - 1) // 2  # @step parent
            if self.data[i] >= self.data[parent]:  # @step compare
                break  # @step stop
            self.data[i], self.data[parent] = self.data[parent], self.data[i]  # @step swap
            i = parent  # @step move_up
    # @endop

    # @op extract_min
    def extract_min(self):
        if not self.data:  # @step check_empty
            raise IndexError("heap is empty")  # @step empty
        top = self.data[0]  # @step grab
        last = self.data.pop()  # @step pop_last
        if self.data:  # @step check_rest
            self.data[0] = last  # @step move_last
            self._sift_down(0)  # @step sift
        return top  # @step done

    def _sift_down(self, i):
        n = len(self.data)
        while True:
            smallest = i  # @step sd_start
            left, right = 2 * i + 1, 2 * i + 2
            if left < n and self.data[left] < self.data[smallest]:  # @step sd_left
                smallest = left
            if right < n and self.data[right] < self.data[smallest]:  # @step sd_right
                smallest = right
            if smallest == i:  # @step sd_check
                return  # @step sd_done
            self.data[i], self.data[smallest] = self.data[smallest], self.data[i]  # @step sd_swap
            i = smallest  # @step sd_move
    # @endop

    def peek(self):
        if not self.data:
            raise IndexError("heap is empty")
        return self.data[0]

    def __len__(self):
        return len(self.data)
