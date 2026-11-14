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
        Check.finish("BTree");
    }
}
