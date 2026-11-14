// Max-priority queue backed by a binary max-heap: pop returns the largest.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MaxPriorityQueue {
    private final List<Integer> heap = new ArrayList<>();

    public MaxPriorityQueue(int... priorities) {
        for (int p : priorities) push(p);
    }

    // @op push
    public void push(int priority) {
        heap.add(priority);                 // @step append
        siftUp(heap.size() - 1);            // @step call_sift
    }

    private void siftUp(int i) {
        while (i > 0) {                                 // @step loop
            int parent = (i - 1) / 2;                   // @step parent
            if (heap.get(parent) >= heap.get(i)) {      // @step compare
                return;                                 // @step stop
            }
            Collections.swap(heap, i, parent);          // @step swap
            i = parent;                                 // @step move_up
        }
    }
    // @endop

    // @op pop
    public int pop() {
        if (heap.isEmpty()) {                                                   // @step check_empty
            throw new IllegalStateException("pop from empty priority queue");   // @step empty
        }
        int top = heap.get(0);                      // @step grab
        heap.set(0, heap.get(heap.size() - 1));     // @step move_last
        heap.remove(heap.size() - 1);               // @step drop_last
        siftDown(0);                                // @step call_sift
        return top;                                 // @step done
    }

    private void siftDown(int i) {
        int n = heap.size();
        while (true) {
            int largest = i;                                            // @step sd_start
            int left = 2 * i + 1, right = 2 * i + 2;
            if (left < n && heap.get(left) > heap.get(largest)) {       // @step sd_left
                largest = left;
            }
            if (right < n && heap.get(right) > heap.get(largest)) {     // @step sd_right
                largest = right;
            }
            if (largest == i) {                                         // @step sd_check
                return;                                                 // @step sd_done
            }
            Collections.swap(heap, i, largest);                         // @step sd_swap
            i = largest;                                                // @step sd_move
        }
    }
    // @endop

    // @op peek
    public int peek() {
        if (heap.isEmpty()) {                                                   // @step check_empty
            throw new IllegalStateException("peek at empty priority queue");    // @step empty
        }
        return heap.get(0);                 // @step done
    }
    // @endop

    public int size() {
        return heap.size();
    }
}
