// Singly linked list of integers.
//
// Lines tagged `// @step <id>` and the `// @op` / `// @endop` markers drive the
// visualizer (tools/build_code.js strips them); the code itself is plain Java.
import java.util.ArrayList;
import java.util.List;

public class SinglyLinkedList {
    static class Node {
        int value;
        Node next;

        Node(int value) {
            this.value = value;
        }
    }

    private Node head;
    private int size;

    public SinglyLinkedList(int... values) {
        for (int v : values) insertTail(v);
    }

    // @op insert_head
    public void insertHead(int value) {
        Node node = new Node(value);  // @step create
        node.next = head;             // @step link
        head = node;                  // @step set_head
        size++;                       // @step done
    }
    // @endop

    // @op insert_tail
    public void insertTail(int value) {
        Node node = new Node(value);  // @step create
        if (head == null) {           // @step check_empty
            head = node;              // @step set_head
        } else {
            Node curr = head;              // @step start
            while (curr.next != null) {    // @step loop
                curr = curr.next;          // @step advance
            }
            curr.next = node;              // @step link
        }
        size++;                       // @step done
    }
    // @endop

    // @op insert_at
    public void insertAt(int index, int value) {
        if (index < 0 || index > size) {                       // @step check_bounds
            throw new IndexOutOfBoundsException("index out of range"); // @step out_of_range
        }
        if (index == 0) {          // @step check_front
            insertHead(value);     // @step call_head
            return;
        }
        Node node = new Node(value);          // @step create
        Node prev = head;                     // @step start
        for (int i = 0; i < index - 1; i++) { // @step loop
            prev = prev.next;                 // @step advance
        }
        node.next = prev.next;                // @step link_next
        prev.next = node;                     // @step link_prev
        size++;                               // @step done
    }
    // @endop

    // @op delete_value
    public boolean deleteValue(int value) {
        if (head == null) {             // @step check_empty
            return false;               // @step empty
        }
        if (head.value == value) {      // @step check_head
            Node target = head;         // @step grab_head
            head = target.next;         // @step unlink_head
            size--;                     // @step release_head
            return true;                // @step done_head
        }
        Node prev = head;                   // @step start
        while (prev.next != null) {         // @step loop
            if (prev.next.value == value) { // @step compare
                Node target = prev.next;    // @step grab
                prev.next = target.next;    // @step unlink
                size--;                     // @step release
                return true;                // @step done
            }
            prev = prev.next;               // @step advance
        }
        return false;                       // @step not_found
    }
    // @endop

    // @op search
    public int search(int value) {
        Node curr = head;              // @step start
        int index = 0;
        while (curr != null) {         // @step loop
            if (curr.value == value) { // @step compare
                return index;          // @step found
            }
            curr = curr.next;          // @step advance
            index++;
        }
        return -1;                     // @step not_found
    }
    // @endop

    // @op reverse
    public void reverse() {
        Node prev = null;            // @step init
        Node curr = head;
        while (curr != null) {       // @step loop
            Node nxt = curr.next;    // @step save_next
            curr.next = prev;        // @step flip
            prev = curr;             // @step move_prev
            curr = nxt;              // @step move_curr
        }
        head = prev;                 // @step set_head
    }
    // @endop

    public List<Integer> toList() {
        List<Integer> out = new ArrayList<>();
        for (Node n = head; n != null; n = n.next) out.add(n.value);
        return out;
    }

    public int size() {
        return size;
    }
}
