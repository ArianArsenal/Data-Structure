import java.util.Collections;
import java.util.Random;

public class TestMaxPriorityQueue {
    public static void main(String[] args) {
        MaxPriorityQueue pq = new MaxPriorityQueue(3, 10, 6, 1, 8);
        Check.check(pq.peek() == 10, "peek");
        Check.check(pq.pop() == 10 && pq.pop() == 8 && pq.pop() == 6 && pq.pop() == 3 && pq.pop() == 1, "order");
        Random rng = new Random(8);
        java.util.PriorityQueue<Integer> ref = new java.util.PriorityQueue<>(Collections.reverseOrder());
        for (int k = 0; k < 600; k++) {
            if (!ref.isEmpty() && rng.nextInt(10) < 4) Check.check(pq.pop() == ref.poll(), "random pop");
            else {
                int v = rng.nextInt(51);
                pq.push(v);
                ref.add(v);
            }
        }
        Check.finish("MaxPriorityQueue");
    }
}
