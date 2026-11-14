// Double-ended queue on a circular buffer of fixed capacity.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.List;

public class CircularDeque {
    private final int[] data = new int[8];
    private int front = 0;
    private int size = 0;

    public CircularDeque(int... values) {
        for (int v : values) pushBack(v);
    }

    // @op push_front
    public void pushFront(int value) {
        if (size == data.length) {                          // @step check_full
            throw new IllegalStateException("deque is full");  // @step full
        }
        front = (front - 1 + data.length) % data.length;   // @step move_front
        data[front] = value;                               // @step place
        size++;                                            // @step done
    }
    // @endop

    // @op push_back
    public void pushBack(int value) {
        if (size == data.length) {                          // @step check_full
            throw new IllegalStateException("deque is full");  // @step full
        }
        int back = (front + size) % data.length;    // @step compute_back
        data[back] = value;                         // @step place
        size++;                                     // @step done
    }
    // @endop

    // @op pop_front
    public int popFront() {
        if (size == 0) {                                     // @step check_empty
            throw new IllegalStateException("deque is empty");  // @step empty
        }
        int value = data[front];                    // @step grab
        data[front] = 0;                            // @step clear
        front = (front + 1) % data.length;          // @step advance
        size--;                                     // @step shrink
        return value;                               // @step done
    }
    // @endop

    // @op pop_back
    public int popBack() {
        if (size == 0) {                                     // @step check_empty
            throw new IllegalStateException("deque is empty");  // @step empty
        }
        int back = (front + size - 1) % data.length;    // @step compute_back
        int value = data[back];                         // @step grab
        data[back] = 0;                                 // @step clear
        size--;                                         // @step shrink
        return value;                                   // @step done
    }
    // @endop

    public List<Integer> toList() {
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < size; i++) out.add(data[(front + i) % data.length]);
        return out;
    }
}
