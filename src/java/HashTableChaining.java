// Hash map with separate chaining: each bucket is a linked list of entries.
// Keys are non-negative integers; the hash is key % capacity. When size exceeds
// capacity (load factor > 1) the table doubles and every entry is rehashed.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
public class HashTableChaining {
    static class Entry {
        int key;
        int value;
        Entry next;

        Entry(int key, int value, Entry next) {
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }

    private Entry[] buckets;
    private int size;

    public HashTableChaining() {
        this(7);
    }

    public HashTableChaining(int capacity) {
        buckets = new Entry[capacity];
    }

    // @op put
    public void put(int key, int value) {
        int i = key % buckets.length;   // @step hash
        Entry curr = buckets[i];        // @step start
        while (curr != null) {          // @step loop
            if (curr.key == key) {      // @step compare
                curr.value = value;     // @step update
                return;
            }
            curr = curr.next;           // @step advance
        }
        buckets[i] = new Entry(key, value, buckets[i]);  // @step prepend
        size++;                                          // @step done
        if (size > buckets.length) {                     // @step check_load
            resize(2 * buckets.length);                  // @step grow
        }
    }

    private void resize(int capacity) {
        Entry[] old = buckets;                          // @step rs_old
        buckets = new Entry[capacity];                  // @step rs_alloc
        for (Entry head : old) {                        // @step rs_bucket
            Entry curr = head;
            while (curr != null) {                      // @step rs_loop
                Entry nxt = curr.next;                  // @step rs_save
                int i = curr.key % capacity;            // @step rs_hash
                curr.next = buckets[i];                 // @step rs_move
                buckets[i] = curr;
                curr = nxt;
            }
        }
    }
    // @endop

    // @op get
    public Integer get(int key) {
        int i = key % buckets.length;   // @step hash
        Entry curr = buckets[i];        // @step start
        while (curr != null) {          // @step loop
            if (curr.key == key) {      // @step compare
                return curr.value;      // @step found
            }
            curr = curr.next;           // @step advance
        }
        return null;                    // @step not_found
    }
    // @endop

    // @op remove
    public boolean remove(int key) {
        int i = key % buckets.length;           // @step hash
        Entry prev = null;                      // @step start
        Entry curr = buckets[i];
        while (curr != null) {                  // @step loop
            if (curr.key == key) {              // @step compare
                if (prev == null) {             // @step check_first
                    buckets[i] = curr.next;     // @step unlink_first
                } else {
                    prev.next = curr.next;      // @step unlink
                }
                size--;                         // @step release
                return true;                    // @step done
            }
            prev = curr;                        // @step advance
            curr = curr.next;
        }
        return false;                           // @step not_found
    }
    // @endop

    public int size() {
        return size;
    }

    public int capacity() {
        return buckets.length;
    }
}
