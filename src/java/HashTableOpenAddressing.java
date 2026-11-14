// Hash map with open addressing and linear probing. Deleted slots become
// tombstones so later probes keep going past them. Keys are non-negative ints.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
public class HashTableOpenAddressing {
    private static final int EMPTY = 0, OCCUPIED = 1, DELETED = 2;

    private final int[] keys;
    private final int[] values;
    private final int[] state;
    private int size;

    public HashTableOpenAddressing() {
        this(11);
    }

    public HashTableOpenAddressing(int capacity) {
        keys = new int[capacity];
        values = new int[capacity];
        state = new int[capacity];
    }

    // @op put
    public void put(int key, int value) {
        int n = keys.length;
        int i = key % n;                        // @step hash
        int firstFree = -1;                     // @step init_free
        for (int probe = 0; probe < n; probe++) {   // @step probe
            if (state[i] == EMPTY) {            // @step check_empty
                break;                          // @step stop
            }
            if (state[i] == DELETED) {          // @step check_deleted
                if (firstFree == -1) {
                    firstFree = i;              // @step remember
                }
            } else if (keys[i] == key) {        // @step compare
                values[i] = value;              // @step update
                return;
            }
            i = (i + 1) % n;                    // @step next
        }
        if (firstFree != -1) {                  // @step check_free
            i = firstFree;                      // @step use_free
        } else if (state[i] != EMPTY) {         // @step check_full
            throw new IllegalStateException("table is full");  // @step full
        }
        keys[i] = key;                          // @step place
        values[i] = value;
        state[i] = OCCUPIED;
        size++;                                 // @step done
    }
    // @endop

    // @op get
    public Integer get(int key) {
        int n = keys.length;
        int i = key % n;                                    // @step hash
        for (int probe = 0; probe < n; probe++) {           // @step probe
            if (state[i] == EMPTY) {                        // @step check_empty
                return null;                                // @step not_found
            }
            if (state[i] == OCCUPIED && keys[i] == key) {   // @step compare
                return values[i];                           // @step found
            }
            i = (i + 1) % n;                                // @step next
        }
        return null;                                        // @step exhausted
    }
    // @endop

    // @op remove
    public boolean remove(int key) {
        int n = keys.length;
        int i = key % n;                                    // @step hash
        for (int probe = 0; probe < n; probe++) {           // @step probe
            if (state[i] == EMPTY) {                        // @step check_empty
                return false;                               // @step not_found
            }
            if (state[i] == OCCUPIED && keys[i] == key) {   // @step compare
                state[i] = DELETED;                         // @step tombstone
                size--;
                return true;                                // @step done
            }
            i = (i + 1) % n;                                // @step next
        }
        return false;                                       // @step exhausted
    }
    // @endop

    public int size() {
        return size;
    }
}
