"""Circular singly linked list. Only `tail` is stored; tail.next is the head.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


class CircularLinkedList:
    def __init__(self, values=()):
        self.tail = None
        self.size = 0
        for v in values:
            self.insert_tail(v)

    # @op insert_head
    def insert_head(self, value):
        node = Node(value)  # @step create
        if self.tail is None:  # @step check_empty
            node.next = node  # @step self_loop
            self.tail = node  # @step set_tail
        else:
            node.next = self.tail.next  # @step link
            self.tail.next = node  # @step close
        self.size += 1  # @step done
    # @endop

    # @op insert_tail
    def insert_tail(self, value):
        self.insert_head(value)  # @step call_head
        self.tail = self.tail.next  # @step advance_tail
    # @endop

    # @op delete_value
    def delete_value(self, value):
        if self.tail is None:  # @step check_empty
            return False  # @step empty
        prev = self.tail  # @step start
        while True:
            curr = prev.next  # @step load
            if curr.value == value:  # @step compare
                if curr is prev:  # @step check_single
                    self.tail = None  # @step clear
                else:
                    prev.next = curr.next  # @step unlink
                    if curr is self.tail:  # @step check_tail
                        self.tail = prev  # @step move_tail
                self.size -= 1  # @step release
                return True  # @step done
            prev = curr  # @step advance
            if prev is self.tail:  # @step check_lap
                return False  # @step not_found
    # @endop

    # @op traverse
    def traverse(self):
        result = []  # @step init
        if self.tail is None:  # @step check_empty
            return result  # @step empty
        curr = self.tail.next  # @step start
        while True:
            result.append(curr.value)  # @step visit
            curr = curr.next  # @step advance
            if curr is self.tail.next:  # @step check_lap
                return result  # @step done
    # @endop
