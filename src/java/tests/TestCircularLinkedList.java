import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class TestCircularLinkedList {
    public static void main(String[] args) {
        CircularLinkedList c = new CircularLinkedList(2, 3);
        c.insertHead(1);
        c.insertTail(4);
        Check.check(c.traverse().equals(Arrays.asList(1, 2, 3, 4)), "inserts");
        Check.check(c.deleteValue(4) && !c.deleteValue(9), "delete tail / missing");
        Check.check(c.deleteValue(1) && c.deleteValue(2) && c.deleteValue(3) && c.traverse().isEmpty(), "delete all");
        Random rng = new Random(6);
        List<Integer> ref = new ArrayList<>();
        for (int k = 0; k < 400; k++) {
            int r = rng.nextInt(10), v = rng.nextInt(16);
            if (r < 3) { c.insertHead(v); ref.add(0, v); }
            else if (r < 6) { c.insertTail(v); ref.add(v); }
            else Check.check(c.deleteValue(v) == ref.remove(Integer.valueOf(v)), "random delete");
            Check.check(c.traverse().equals(ref), "state");
        }
        Check.finish("CircularLinkedList");
    }
}
