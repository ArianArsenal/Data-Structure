"""Double-ended queue on a circular buffer of fixed capacity.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class CircularDeque:
    def __init__(self, capacity=8, values=()):
        self.data = [None] * capacity
        self.front = 0
        self.size = 0
        for v in values:
            self.push_back(v)

    # @op push_front
    def push_front(self, value):
        if self.size == len(self.data):  # @step check_full
            raise OverflowError("deque is full")  # @step full
        self.front = (self.front - 1 + len(self.data)) % len(self.data)  # @step move_front
        self.data[self.front] = value  # @step place
        self.size += 1  # @step done
    # @endop

    # @op push_back
    def push_back(self, value):
        if self.size == len(self.data):  # @step check_full
            raise OverflowError("deque is full")  # @step full
        back = (self.front + self.size) % len(self.data)  # @step compute_back
        self.data[back] = value  # @step place
        self.size += 1  # @step done
    # @endop

    # @op pop_front
    def pop_front(self):
        if self.size == 0:  # @step check_empty
            raise IndexError("deque is empty")  # @step empty
        value = self.data[self.front]  # @step grab
        self.data[self.front] = None  # @step clear
        self.front = (self.front + 1) % len(self.data)  # @step advance
        self.size -= 1  # @step shrink
        return value  # @step done
    # @endop

    # @op pop_back
    def pop_back(self):
        if self.size == 0:  # @step check_empty
            raise IndexError("deque is empty")  # @step empty
        back = (self.front + self.size - 1) % len(self.data)  # @step compute_back
        value = self.data[back]  # @step grab
        self.data[back] = None  # @step clear
        self.size -= 1  # @step shrink
        return value  # @step done
    # @endop

    def to_list(self):
        return [self.data[(self.front + i) % len(self.data)] for i in range(self.size)]
