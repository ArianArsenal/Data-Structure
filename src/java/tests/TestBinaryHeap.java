import java.util.PriorityQueue;
import java.util.Random;

public class TestBinaryHeap {
    public static void main(String[] args) {
        BinaryHeap h = new BinaryHeap(5, 9, 3, 7, 1, 8, 4);
        Check.check(h.peek() == 1, "peek");
        int[] expect = {1, 3, 4, 5, 7, 8, 9};
        for (int e : expect) Check.check(h.extractMin() == e, "sorted " + e);
        Random rng = new Random(7);
        PriorityQueue<Integer> ref = new PriorityQueue<>();
        for (int k = 0; k < 600; k++) {
            if (!ref.isEmpty() && rng.nextInt(10) < 4) Check.check(h.extractMin() == ref.poll(), "random extract");
            else {
                int v = rng.nextInt(51);
                h.insert(v);
                ref.add(v);
            }
        }
        Random r = new Random(42);
        for (int trial = 0; trial < 50; trial++) {
            int[] vals = new int[r.nextInt(30)];
            for (int i = 0; i < vals.length; i++) vals[i] = r.nextInt(100);
            BinaryHeap b = new BinaryHeap();
            b.buildHeap(vals);
            int[] sorted = vals.clone();
            java.util.Arrays.sort(sorted);
            for (int v : sorted) Check.check(b.extractMin() == v, "build_heap order");
        }

        Check.finish("BinaryHeap");
    }
}
