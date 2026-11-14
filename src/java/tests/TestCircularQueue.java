import java.util.ArrayDeque;
import java.util.Random;

public class TestCircularQueue {
    public static void main(String[] args) {
        CircularQueue q = new CircularQueue(1, 2);
        q.enqueue(3);
        Check.check(q.dequeue() == 1 && q.dequeue() == 2 && q.dequeue() == 3, "fifo");
        Random rng = new Random(3);
        ArrayDeque<Integer> ref = new ArrayDeque<>();
        for (int k = 0; k < 500; k++) {
            if (!ref.isEmpty() && (ref.size() == 8 || rng.nextBoolean())) {
                Check.check(q.dequeue() == ref.pollFirst(), "random dequeue");
            } else {
                int v = rng.nextInt(100);
                q.enqueue(v);
                ref.addLast(v);
            }
            Check.check(q.size() == ref.size(), "size");
        }
        Check.finish("CircularQueue");
    }
}
