import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class TestBTree {
    public static void main(String[] args) {
        BTree t = new BTree(10, 20, 5, 6, 12, 30, 7, 17);
        Check.check(t.toList().equals(Arrays.asList(5, 6, 7, 10, 12, 17, 20, 30)), "order");
        Check.check(t.search(17) && !t.search(11), "search");
        Random rng = new Random(24);
        BTree r = new BTree();
        List<Integer> keys = new ArrayList<>();
        for (int i = 0; i < 500; i++) { int k = rng.nextInt(1000); keys.add(k); r.insert(k); }
        Collections.sort(keys);
        Check.check(r.toList().equals(keys), "random order");
        for (int i = 0; i < 100; i++) Check.check(r.search(keys.get(i)), "random search");
        Random r2 = new Random(45);
        BTree d = new BTree();
        List<Integer> ref = new ArrayList<>();
        for (int i = 0; i < 1500; i++) {
            int k = r2.nextInt(151);
            if (r2.nextInt(100) < 55) { d.insert(k); ref.add(k); }
            else Check.check(d.delete(k) == ref.remove(Integer.valueOf(k)), "delete result");
            List<Integer> sorted = new ArrayList<>(ref);
            Collections.sort(sorted);
            Check.check(d.toList().equals(sorted), "order");
        }

        Check.finish("BTree");
    }
}
