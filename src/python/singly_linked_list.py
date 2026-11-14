"""Singly linked list of integers.

Lines tagged `# @step <id>` and the `# @op` / `# @endop` markers drive the
visualizer (tools/build_code.js strips them); the code itself is plain Python.
"""


class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


class SinglyLinkedList:
    def __init__(self, values=()):
        self.head = None
        self.size = 0
        for v in values:
            self.insert_tail(v)

    # @op insert_head
    def insert_head(self, value):
        node = Node(value)  # @step create
        node.next = self.head  # @step link
        self.head = node  # @step set_head
        self.size += 1  # @step done
    # @endop

    # @op insert_tail
    def insert_tail(self, value):
        node = Node(value)  # @step create
        if self.head is None:  # @step check_empty
            self.head = node  # @step set_head
        else:
            curr = self.head  # @step start
            while curr.next is not None:  # @step loop
                curr = curr.next  # @step advance
            curr.next = node  # @step link
        self.size += 1  # @step done
    # @endop

    # @op insert_at
    def insert_at(self, index, value):
        if index < 0 or index > self.size:  # @step check_bounds
            raise IndexError("index out of range")  # @step out_of_range
        if index == 0:  # @step check_front
            self.insert_head(value)  # @step call_head
            return
        node = Node(value)  # @step create
        prev = self.head  # @step start
        for _ in range(index - 1):  # @step loop
            prev = prev.next  # @step advance
        node.next = prev.next  # @step link_next
        prev.next = node  # @step link_prev
        self.size += 1  # @step done
    # @endop

    # @op delete_value
    def delete_value(self, value):
        if self.head is None:  # @step check_empty
            return False  # @step empty
        if self.head.value == value:  # @step check_head
            target = self.head  # @step grab_head
            self.head = target.next  # @step unlink_head
            self.size -= 1  # @step release_head
            return True  # @step done_head
        prev = self.head  # @step start
        while prev.next is not None:  # @step loop
            if prev.next.value == value:  # @step compare
                target = prev.next  # @step grab
                prev.next = target.next  # @step unlink
                self.size -= 1  # @step release
                return True  # @step done
            prev = prev.next  # @step advance
        return False  # @step not_found
    # @endop

    # @op search
    def search(self, value):
        curr = self.head  # @step start
        index = 0
        while curr is not None:  # @step loop
            if curr.value == value:  # @step compare
                return index  # @step found
            curr = curr.next  # @step advance
            index += 1
        return -1  # @step not_found
    # @endop

    # @op reverse
    def reverse(self):
        prev = None  # @step init
        curr = self.head
        while curr is not None:  # @step loop
            nxt = curr.next  # @step save_next
            curr.next = prev  # @step flip
            prev = curr  # @step move_prev
            curr = nxt  # @step move_curr
        self.head = prev  # @step set_head
    # @endop

    def to_list(self):
        out, curr = [], self.head
        while curr is not None:
            out.append(curr.value)
            curr = curr.next
        return out

    def __len__(self):
        return self.size
