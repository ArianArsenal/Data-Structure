import java.util.ArrayList;
import java.util.Random;
import java.util.TreeSet;

public class TestRedBlackTree {
    static int blackHeight(RedBlackTree.Node n, RedBlackTree.Node parent) {
        if (n == null) return 1;
        Check.check(n.parent == parent, "parent link");
        if (n.color == RedBlackTree.RED) {
            Check.check(n.left == null || n.left.color == RedBlackTree.BLACK, "red-red");
            Check.check(n.right == null || n.right.color == RedBlackTree.BLACK, "red-red");
        }
        int l = blackHeight(n.left, n), r = blackHeight(n.right, n);
        Check.check(l == r, "black height");
        return l + (n.color == RedBlackTree.BLACK ? 1 : 0);
    }

    public static void main(String[] args) {
        Random rng = new Random(22);
        RedBlackTree t = new RedBlackTree();
        TreeSet<Integer> ref = new TreeSet<>();
        for (int i = 0; i < 500; i++) {
            int k = rng.nextInt(501);
            Check.check(t.insert(k) == ref.add(k), "insert result");
        }
        Check.check(t.inorder().equals(new ArrayList<>(ref)), "order");
        Check.check(t.root.color == RedBlackTree.BLACK, "black root");
        blackHeight(t.root, null);
        Random r2 = new Random(44);
        RedBlackTree d = new RedBlackTree();
        TreeSet<Integer> s = new TreeSet<>();
        for (int i = 0; i < 1500; i++) {
            int k = r2.nextInt(121);
            if (r2.nextInt(100) < 55) Check.check(d.insert(k) == s.add(k), "insert");
            else Check.check(d.delete(k) == s.remove(k), "delete");
            if (d.root != null) Check.check(d.root.color == RedBlackTree.BLACK, "black root");
            blackHeight(d.root, null);
        }
        Check.check(d.inorder().equals(new ArrayList<>(s)), "order after deletes");

        Check.finish("RedBlackTree");
    }
}
