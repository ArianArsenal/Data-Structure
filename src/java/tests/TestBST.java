import static java.util.Arrays.asList;

import java.util.ArrayList;
import java.util.Random;
import java.util.TreeSet;

public class TestBST {
    public static void main(String[] args) {
        BST t = new BST(50, 30, 70, 20, 40, 60, 80);
        Check.check(t.inorder().equals(asList(20, 30, 40, 50, 60, 70, 80)), "inorder");
        Check.check(!t.insert(40), "duplicate insert");
        Check.check(t.insert(45) && t.search(45) && !t.search(46), "insert/search");

        t = new BST(50, 30, 70, 20, 40, 60, 80);
        t.delete(20);
        t.delete(30);
        t.delete(50);
        t.delete(99);
        Check.check(t.inorder().equals(asList(40, 60, 70, 80)), "delete cases");

        Random rng = new Random(7);
        t = new BST();
        TreeSet<Integer> ref = new TreeSet<>();
        for (int i = 0; i < 500; i++) {
            int k = rng.nextInt(61);
            if (rng.nextInt(10) < 6) {
                Check.check(t.insert(k) == !ref.contains(k), "random insert " + k);
                ref.add(k);
            } else {
                t.delete(k);
                ref.remove(k);
            }
            Check.check(t.inorder().equals(new ArrayList<>(ref)), "random step " + i);
        }

        Check.finish("BST");
    }
}
