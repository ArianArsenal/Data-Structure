import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Random;

public class TestCircularDeque {
    public static void main(String[] args) {
        CircularDeque d = new CircularDeque(2, 3);
        d.pushFront(1);
        d.pushBack(4);
        Check.check(d.toList().equals(Arrays.asList(1, 2, 3, 4)), "both ends");
        Check.check(d.popBack() == 4 && d.popFront() == 1, "pops");
        Random rng = new Random(4);
        ArrayDeque<Integer> ref = new ArrayDeque<>(Arrays.asList(2, 3));
        for (int k = 0; k < 800; k++) {
            if (!ref.isEmpty() && (ref.size() == 8 || rng.nextBoolean())) {
                if (rng.nextBoolean()) Check.check(d.popFront() == ref.pollFirst(), "popFront");
                else Check.check(d.popBack() == ref.pollLast(), "popBack");
            } else {
                int v = rng.nextInt(100);
                if (rng.nextBoolean()) { d.pushFront(v); ref.addFirst(v); }
                else { d.pushBack(v); ref.addLast(v); }
            }
            Check.check(d.toList().equals(new ArrayList<>(ref)), "state");
        }
        Check.finish("CircularDeque");
    }
}
