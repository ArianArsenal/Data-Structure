import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.TreeSet;

public class TestAVLTree {
    public static void main(String[] args) {
        AVLTree t = new AVLTree();
        List<Integer> keys = new ArrayList<>();
        for (int i = 1; i < 128; i++) { t.insert(i); keys.add(i); }
        Check.check(t.inorder().equals(keys) && t.rootHeight() == 7, "sorted inserts balanced");
        Random rng = new Random(21);
        AVLTree r = new AVLTree();
        TreeSet<Integer> ref = new TreeSet<>();
        for (int i = 0; i < 400; i++) { int k = rng.nextInt(501); r.insert(k); ref.add(k); }
        Check.check(r.inorder().equals(new ArrayList<>(ref)) && r.rootHeight() <= 13, "random");
        Random r2 = new Random(43);
        AVLTree d = new AVLTree();
        TreeSet<Integer> s = new TreeSet<>();
        for (int i = 0; i < 1500; i++) {
            int k = r2.nextInt(121);
            if (r2.nextInt(100) < 55) { d.insert(k); s.add(k); }
            else { d.delete(k); s.remove(k); }
        }
        Check.check(d.inorder().equals(new ArrayList<>(s)) && d.rootHeight() <= 9, "delete");

        Check.finish("AVLTree");
    }
}
