// FIFO queue on a circular buffer of fixed capacity.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
public class CircularQueue {
    private final int[] data = new int[8];
    private int front = 0;
    private int size = 0;

    public CircularQueue(int... values) {
        for (int v : values) enqueue(v);
    }

    // @op enqueue
    public void enqueue(int value) {
        if (size == data.length) {                          // @step check_full
            throw new IllegalStateException("queue is full");  // @step full
        }
        int rear = (front + size) % data.length;    // @step compute_rear
        data[rear] = value;                         // @step place
        size++;                                     // @step done
    }
    // @endop

    // @op dequeue
    public int dequeue() {
        if (size == 0) {                                     // @step check_empty
            throw new IllegalStateException("queue is empty");  // @step empty
        }
        int value = data[front];                    // @step grab
        data[front] = 0;                            // @step clear
        front = (front + 1) % data.length;          // @step advance
        size--;                                     // @step shrink
        return value;                               // @step done
    }
    // @endop

    public int size() {
        return size;
    }
}
