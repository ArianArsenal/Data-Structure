import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class TestDoublyLinkedList {
    public static void main(String[] args) {
        DoublyLinkedList d = new DoublyLinkedList(2, 3);
        d.insertHead(1);
        d.insertTail(4);
        Check.check(d.toList().equals(Arrays.asList(1, 2, 3, 4)), "inserts");
        Check.check(d.deleteValue(1) && d.deleteValue(4) && d.deleteValue(2) && !d.deleteValue(9), "deletes");
        Random rng = new Random(5);
        List<Integer> ref = new ArrayList<>(Arrays.asList(3));
        for (int k = 0; k < 400; k++) {
            int r = rng.nextInt(10), v = rng.nextInt(16);
            if (r < 3) { d.insertHead(v); ref.add(0, v); }
            else if (r < 6) { d.insertTail(v); ref.add(v); }
            else Check.check(d.deleteValue(v) == ref.remove(Integer.valueOf(v)), "random delete");
            List<Integer> rev = new ArrayList<>(ref);
            Collections.reverse(rev);
            Check.check(d.toList().equals(ref) && d.toListReversed().equals(rev), "state");
        }
        Check.finish("DoublyLinkedList");
    }
}
