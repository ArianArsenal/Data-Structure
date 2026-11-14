"""Max-priority queue backed by a binary max-heap: pop returns the largest.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class PriorityQueue:
    def __init__(self, priorities=()):
        self.heap = []
        for p in priorities:
            self.push(p)

    # @op push
    def push(self, priority):
        self.heap.append(priority)  # @step append
        self._sift_up(len(self.heap) - 1)  # @step call_sift

    def _sift_up(self, i):
        while i > 0:  # @step loop
            parent = (i - 1) // 2  # @step parent
            if self.heap[parent] >= self.heap[i]:  # @step compare
                return  # @step stop
            self.heap[i], self.heap[parent] = self.heap[parent], self.heap[i]  # @step swap
            i = parent  # @step move_up
    # @endop

    # @op pop
    def pop(self):
        if not self.heap:  # @step check_empty
            raise IndexError("pop from empty priority queue")  # @step empty
        top = self.heap[0]  # @step grab
        self.heap[0] = self.heap[-1]  # @step move_last
        self.heap.pop()  # @step drop_last
        self._sift_down(0)  # @step call_sift
        return top  # @step done

    def _sift_down(self, i):
        n = len(self.heap)
        while True:
            largest = i  # @step sd_start
            left, right = 2 * i + 1, 2 * i + 2
            if left < n and self.heap[left] > self.heap[largest]:  # @step sd_left
                largest = left
            if right < n and self.heap[right] > self.heap[largest]:  # @step sd_right
                largest = right
            if largest == i:  # @step sd_check
                return  # @step sd_done
            self.heap[i], self.heap[largest] = self.heap[largest], self.heap[i]  # @step sd_swap
            i = largest  # @step sd_move
    # @endop

    # @op peek
    def peek(self):
        if not self.heap:  # @step check_empty
            raise IndexError("peek at empty priority queue")  # @step empty
        return self.heap[0]  # @step done
    # @endop

    def __len__(self):
        return len(self.heap)
