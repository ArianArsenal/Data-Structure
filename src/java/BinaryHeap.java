// Binary min-heap stored in an array: children of i are 2i+1 and 2i+2.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BinaryHeap {
    private final List<Integer> data = new ArrayList<>();

    public BinaryHeap(int... values) {
        for (int v : values) insert(v);
    }

    // @op insert
    public void insert(int value) {
        data.add(value);                            // @step append
        int i = data.size() - 1;                    // @step start
        while (i > 0) {                             // @step loop
            int parent = (i - 1) / 2;               // @step parent
            if (data.get(i) >= data.get(parent)) {  // @step compare
                break;                              // @step stop
            }
            Collections.swap(data, i, parent);      // @step swap
            i = parent;                             // @step move_up
        }
    }
    // @endop

    // @op extract_min
    public int extractMin() {
        if (data.isEmpty()) {                               // @step check_empty
            throw new IllegalStateException("heap is empty");  // @step empty
        }
        int top = data.get(0);                      // @step grab
        int last = data.remove(data.size() - 1);    // @step pop_last
        if (!data.isEmpty()) {                      // @step check_rest
            data.set(0, last);                      // @step move_last
            siftDown(0);                            // @step sift
        }
        return top;                                 // @step done
    }
    // @endop

    // @op build_heap
    public void buildHeap(int... values) {
        data.clear();                                       // @step copy
        for (int v : values) data.add(v);
        for (int i = data.size() / 2 - 1; i >= 0; i--) {    // @step loop
            siftDown(i);                                    // @step sift
        }
    }
    // @endop

    // @op sift_down
    private void siftDown(int i) {
        int n = data.size();
        while (true) {
            int smallest = i;                                           // @step sd_start
            int left = 2 * i + 1, right = 2 * i + 2;
            if (left < n && data.get(left) < data.get(smallest)) {      // @step sd_left
                smallest = left;
            }
            if (right < n && data.get(right) < data.get(smallest)) {    // @step sd_right
                smallest = right;
            }
            if (smallest == i) {                                        // @step sd_check
                return;                                                 // @step sd_done
            }
            Collections.swap(data, i, smallest);                        // @step sd_swap
            i = smallest;                                               // @step sd_move
        }
    }
    // @endop

    public int peek() {
        if (data.isEmpty()) throw new IllegalStateException("heap is empty");
        return data.get(0);
    }

    public int size() {
        return data.size();
    }
}
