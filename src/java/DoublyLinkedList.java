// Doubly linked list with head and tail pointers.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.List;

public class DoublyLinkedList {
    static class Node {
        int value;
        Node prev;
        Node next;

        Node(int value) {
            this.value = value;
        }
    }

    private Node head;
    private Node tail;
    private int size;

    public DoublyLinkedList(int... values) {
        for (int v : values) insertTail(v);
    }

    // @op insert_head
    public void insertHead(int value) {
        Node node = new Node(value);    // @step create
        node.next = head;               // @step link_next
        if (head != null) {             // @step check_empty
            head.prev = node;           // @step link_prev
        } else {
            tail = node;                // @step set_tail
        }
        head = node;                    // @step set_head
        size++;                         // @step done
    }
    // @endop

    // @op insert_tail
    public void insertTail(int value) {
        Node node = new Node(value);    // @step create
        node.prev = tail;               // @step link_prev
        if (tail != null) {             // @step check_empty
            tail.next = node;           // @step link_next
        } else {
            head = node;                // @step set_head
        }
        tail = node;                    // @step set_tail
        size++;                         // @step done
    }
    // @endop

    // @op delete_value
    public boolean deleteValue(int value) {
        Node curr = head;                               // @step start
        while (curr != null && curr.value != value) {   // @step loop
            curr = curr.next;                           // @step advance
        }
        if (curr == null) {             // @step check_found
            return false;               // @step not_found
        }
        if (curr.prev != null) {                // @step check_prev
            curr.prev.next = curr.next;         // @step bypass_prev
        } else {
            head = curr.next;                   // @step move_head
        }
        if (curr.next != null) {                // @step check_next
            curr.next.prev = curr.prev;         // @step bypass_next
        } else {
            tail = curr.prev;                   // @step move_tail
        }
        size--;                                 // @step release
        return true;                            // @step done
    }
    // @endop

    public List<Integer> toList() {
        List<Integer> out = new ArrayList<>();
        for (Node n = head; n != null; n = n.next) out.add(n.value);
        return out;
    }

    public List<Integer> toListReversed() {
        List<Integer> out = new ArrayList<>();
        for (Node n = tail; n != null; n = n.prev) out.add(n.value);
        return out;
    }
}
