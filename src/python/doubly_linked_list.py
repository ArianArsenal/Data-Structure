"""Doubly linked list with head and tail pointers.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class Node:
    def __init__(self, value):
        self.value = value
        self.prev = None
        self.next = None


class DoublyLinkedList:
    def __init__(self, values=()):
        self.head = None
        self.tail = None
        self.size = 0
        for v in values:
            self.insert_tail(v)

    # @op insert_head
    def insert_head(self, value):
        node = Node(value)  # @step create
        node.next = self.head  # @step link_next
        if self.head is not None:  # @step check_empty
            self.head.prev = node  # @step link_prev
        else:
            self.tail = node  # @step set_tail
        self.head = node  # @step set_head
        self.size += 1  # @step done
    # @endop

    # @op insert_tail
    def insert_tail(self, value):
        node = Node(value)  # @step create
        node.prev = self.tail  # @step link_prev
        if self.tail is not None:  # @step check_empty
            self.tail.next = node  # @step link_next
        else:
            self.head = node  # @step set_head
        self.tail = node  # @step set_tail
        self.size += 1  # @step done
    # @endop

    # @op delete_value
    def delete_value(self, value):
        curr = self.head  # @step start
        while curr is not None and curr.value != value:  # @step loop
            curr = curr.next  # @step advance
        if curr is None:  # @step check_found
            return False  # @step not_found
        if curr.prev is not None:  # @step check_prev
            curr.prev.next = curr.next  # @step bypass_prev
        else:
            self.head = curr.next  # @step move_head
        if curr.next is not None:  # @step check_next
            curr.next.prev = curr.prev  # @step bypass_next
        else:
            self.tail = curr.prev  # @step move_tail
        self.size -= 1  # @step release
        return True  # @step done
    # @endop

    def to_list(self):
        out, curr = [], self.head
        while curr is not None:
            out.append(curr.value)
            curr = curr.next
        return out

    def to_list_reversed(self):
        out, curr = [], self.tail
        while curr is not None:
            out.append(curr.value)
            curr = curr.prev
        return out
