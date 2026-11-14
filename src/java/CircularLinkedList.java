// Circular singly linked list. Only `tail` is stored; tail.next is the head.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.List;

public class CircularLinkedList {
    static class Node {
        int value;
        Node next;

        Node(int value) {
            this.value = value;
        }
    }

    private Node tail;
    private int size;

    public CircularLinkedList(int... values) {
        for (int v : values) insertTail(v);
    }

    // @op insert_head
    public void insertHead(int value) {
        Node node = new Node(value);    // @step create
        if (tail == null) {             // @step check_empty
            node.next = node;           // @step self_loop
            tail = node;                // @step set_tail
        } else {
            node.next = tail.next;      // @step link
            tail.next = node;           // @step close
        }
        size++;                         // @step done
    }
    // @endop

    // @op insert_tail
    public void insertTail(int value) {
        insertHead(value);              // @step call_head
        tail = tail.next;               // @step advance_tail
    }
    // @endop

    // @op delete_value
    public boolean deleteValue(int value) {
        if (tail == null) {             // @step check_empty
            return false;               // @step empty
        }
        Node prev = tail;               // @step start
        while (true) {
            Node curr = prev.next;              // @step load
            if (curr.value == value) {          // @step compare
                if (curr == prev) {             // @step check_single
                    tail = null;                // @step clear
                } else {
                    prev.next = curr.next;      // @step unlink
                    if (curr == tail) {         // @step check_tail
                        tail = prev;            // @step move_tail
                    }
                }
                size--;                         // @step release
                return true;                    // @step done
            }
            prev = curr;                        // @step advance
            if (prev == tail) {                 // @step check_lap
                return false;                   // @step not_found
            }
        }
    }
    // @endop

    // @op traverse
    public List<Integer> traverse() {
        List<Integer> result = new ArrayList<>();   // @step init
        if (tail == null) {             // @step check_empty
            return result;              // @step empty
        }
        Node curr = tail.next;          // @step start
        while (true) {
            result.add(curr.value);     // @step visit
            curr = curr.next;           // @step advance
            if (curr == tail.next) {    // @step check_lap
                return result;          // @step done
            }
        }
    }
    // @endop

    public int size() {
        return size;
    }
}
