"""FIFO queue on a circular buffer of fixed capacity.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class CircularQueue:
    def __init__(self, capacity=8, values=()):
        self.data = [None] * capacity
        self.front = 0
        self.size = 0
        for v in values:
            self.enqueue(v)

    # @op enqueue
    def enqueue(self, value):
        if self.size == len(self.data):  # @step check_full
            raise OverflowError("queue is full")  # @step full
        rear = (self.front + self.size) % len(self.data)  # @step compute_rear
        self.data[rear] = value  # @step place
        self.size += 1  # @step done
    # @endop

    # @op dequeue
    def dequeue(self):
        if self.size == 0:  # @step check_empty
            raise IndexError("queue is empty")  # @step empty
        value = self.data[self.front]  # @step grab
        self.data[self.front] = None  # @step clear
        self.front = (self.front + 1) % len(self.data)  # @step advance
        self.size -= 1  # @step shrink
        return value  # @step done
    # @endop

    def __len__(self):
        return self.size
