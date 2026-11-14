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
        Check.finish("RedBlackTree");
    }
}
