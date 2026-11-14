import java.util.ArrayList;
import java.util.Random;
import java.util.TreeSet;

public class TestSplayTree {
    public static void main(String[] args) {
        SplayTree t = new SplayTree(50, 30, 70, 20, 40, 60, 80);
        Check.check(t.search(20) && t.root.key == 20, "splay on hit");
        Check.check(t.insert(45) && t.root.key == 45, "splay on insert");
        Random rng = new Random(23);
        SplayTree r = new SplayTree();
        TreeSet<Integer> ref = new TreeSet<>();
        for (int i = 0; i < 600; i++) {
            int k = rng.nextInt(81);
            if (rng.nextInt(10) < 6) Check.check(r.insert(k) == ref.add(k), "insert");
            else Check.check(r.search(k) == ref.contains(k), "search");
        }
        Check.check(r.inorder().equals(new ArrayList<>(ref)), "order");
        Check.finish("SplayTree");
    }
}
