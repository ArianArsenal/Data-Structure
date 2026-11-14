// Skip list: sorted linked lists stacked in levels. Each node is promoted to
// the next level with probability 1/2, giving O(log n) expected search.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class SkipList {
    static final int MAX_LEVEL = 4;

    static class Node {
        int key;
        Node[] next;

        Node(int key, int level) {
            this.key = key;
            this.next = new Node[level];
        }
    }

    private final Node head = new Node(0, MAX_LEVEL);
    private int level = 1;
    private final Random rng;

    public SkipList(long seed, int... keys) {
        rng = new Random(seed);
        for (int k : keys) insert(k);
    }

    private int randomLevel() {
        int lvl = 1;
        while (lvl < MAX_LEVEL && rng.nextBoolean()) lvl++;
        return lvl;
    }

    // @op search
    public boolean search(int key) {
        Node node = head;                                   // @step start
        for (int lvl = level - 1; lvl >= 0; lvl--) {        // @step level
            while (node.next[lvl] != null && node.next[lvl].key < key) {    // @step check_right
                node = node.next[lvl];                      // @step move_right
            }
        }
        node = node.next[0];                                // @step bottom
        return node != null && node.key == key;             // @step check
    }
    // @endop

    // @op insert
    public boolean insert(int key) {
        Node[] update = new Node[MAX_LEVEL];                // @step init
        Arrays.fill(update, head);
        Node node = head;
        for (int lvl = level - 1; lvl >= 0; lvl--) {        // @step level
            while (node.next[lvl] != null && node.next[lvl].key < key) {    // @step check_right
                node = node.next[lvl];                      // @step move_right
            }
            update[lvl] = node;                             // @step remember
        }
        if (node.next[0] != null && node.next[0].key == key) {  // @step check_dup
            return false;                                   // @step duplicate
        }
        int newLevel = randomLevel();                       // @step coin
        level = Math.max(level, newLevel);
        Node fresh = new Node(key, newLevel);               // @step create
        for (int lvl = 0; lvl < newLevel; lvl++) {          // @step link_loop
            fresh.next[lvl] = update[lvl].next[lvl];        // @step link_next
            update[lvl].next[lvl] = fresh;                  // @step link_prev
        }
        return true;                                        // @step done
    }
    // @endop

    public List<Integer> toList() {
        List<Integer> out = new ArrayList<>();
        for (Node n = head.next[0]; n != null; n = n.next[0]) out.add(n.key);
        return out;
    }
}
