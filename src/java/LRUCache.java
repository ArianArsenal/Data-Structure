// LRU cache: a hash map for O(1) lookup plus a doubly linked list ordered by
// recency (most recent right after `head`, least recent right before `tail`).
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LRUCache {
    static class Node {
        int key;
        int value;
        Node prev;
        Node next;

        Node(int key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0); // sentinel before the most recent entry
    private final Node tail = new Node(0, 0); // sentinel after the least recent entry

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    // @op get
    public int get(int key) {
        if (!map.containsKey(key)) {    // @step lookup
            return -1;                  // @step miss
        }
        Node node = map.get(key);       // @step hit
        moveToFront(node);              // @step touch
        return node.value;              // @step done
    }
    // @endop

    // @op put
    public void put(int key, int value) {
        if (map.containsKey(key)) {             // @step lookup
            Node node = map.get(key);           // @step hit
            node.value = value;                 // @step update
            moveToFront(node);                  // @step touch
            return;
        }
        if (map.size() == capacity) {           // @step check_full
            Node lru = tail.prev;               // @step pick_lru
            unlink(lru);                        // @step evict
            map.remove(lru.key);                // @step forget
        }
        Node node = new Node(key, value);       // @step create
        map.put(key, node);                     // @step remember
        pushFront(node);                        // @step insert
    }
    // @endop

    // @op helpers
    private void moveToFront(Node node) {
        unlink(node);                   // @step mf_unlink
        pushFront(node);                // @step mf_push
    }

    private void unlink(Node node) {
        node.prev.next = node.next;     // @step ul_next
        node.next.prev = node.prev;     // @step ul_prev
    }

    private void pushFront(Node node) {
        node.next = head.next;          // @step pf_next
        node.prev = head;               // @step pf_prev
        head.next.prev = node;          // @step pf_old
        head.next = node;               // @step pf_head
    }
    // @endop

    public List<Integer> keysByRecency() {
        List<Integer> out = new ArrayList<>();
        for (Node n = head.next; n != tail; n = n.next) out.add(n.key);
        return out;
    }
}
