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
        Check.finish("AVLTree");
    }
}
