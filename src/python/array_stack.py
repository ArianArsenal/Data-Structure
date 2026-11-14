"""Array-backed stack (LIFO) with a fixed capacity.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class ArrayStack:
    def __init__(self, capacity=8, values=()):
        self.data = [None] * capacity
        self.top = -1
        for v in values:
            self.push(v)

    # @op push
    def push(self, value):
        if self.top == len(self.data) - 1:  # @step check_full
            raise OverflowError("stack overflow")  # @step overflow
        self.top += 1  # @step inc_top
        self.data[self.top] = value  # @step place
    # @endop

    # @op pop
    def pop(self):
        if self.top == -1:  # @step check_empty
            raise IndexError("stack underflow")  # @step underflow
        value = self.data[self.top]  # @step grab
        self.data[self.top] = None  # @step clear
        self.top -= 1  # @step dec_top
        return value  # @step done
    # @endop

    # @op peek
    def peek(self):
        if self.top == -1:  # @step check_empty
            raise IndexError("stack is empty")  # @step empty
        return self.data[self.top]  # @step done
    # @endop

    def __len__(self):
        return self.top + 1
