// AVL tree: a BST that rebalances with rotations so that the two subtrees of
// every node differ in height by at most 1.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.List;

public class AVLTree {
    static class Node {
        int key;
        Node left;
        Node right;
        int height = 1;

        Node(int key) {
            this.key = key;
        }
    }

    private Node root;

    public AVLTree(int... keys) {
        for (int k : keys) insert(k);
    }

    private static int height(Node n) {
        return n == null ? 0 : n.height;
    }

    private static void update(Node n) {
        n.height = 1 + Math.max(height(n.left), height(n.right));
    }

    // @op insert
    public void insert(int key) {
        root = insert(root, key);       // @step call_root
    }

    private Node insert(Node node, int key) {
        if (node == null) {             // @step check_null
            return new Node(key);       // @step create
        }
        if (key < node.key) {                           // @step cmp_less
            node.left = insert(node.left, key);         // @step recurse_left
        } else if (key > node.key) {                    // @step cmp_greater
            node.right = insert(node.right, key);       // @step recurse_right
        } else {
            return node;                                // @step duplicate
        }
        update(node);                                       // @step update_height
        int balance = height(node.left) - height(node.right); // @step balance
        if (balance > 1 && key < node.left.key) {           // @step case_ll
            return rotateRight(node);                       // @step fix_ll
        }
        if (balance < -1 && key > node.right.key) {         // @step case_rr
            return rotateLeft(node);                        // @step fix_rr
        }
        if (balance > 1) {                                  // @step case_lr
            node.left = rotateLeft(node.left);              // @step fix_lr
            return rotateRight(node);                       // @step fix_lr_2
        }
        if (balance < -1) {                                 // @step case_rl
            node.right = rotateRight(node.right);           // @step fix_rl
            return rotateLeft(node);                        // @step fix_rl_2
        }
        return node;                                        // @step return_node
    }

    private Node rotateRight(Node y) {
        Node x = y.left;        // @step rotr_pick
        y.left = x.right;       // @step rotr_move
        x.right = y;            // @step rotr_link
        update(y);              // @step rotr_heights
        update(x);
        return x;               // @step rotr_return
    }

    private Node rotateLeft(Node x) {
        Node y = x.right;       // @step rotl_pick
        x.right = y.left;       // @step rotl_move
        y.left = x;             // @step rotl_link
        update(x);              // @step rotl_heights
        update(y);
        return y;               // @step rotl_return
    }
    // @endop

    public List<Integer> inorder() {
        List<Integer> out = new ArrayList<>();
        walk(root, out);
        return out;
    }

    public int rootHeight() {
        return height(root);
    }

    private static void walk(Node n, List<Integer> out) {
        if (n == null) return;
        walk(n.left, out);
        out.add(n.key);
        walk(n.right, out);
    }
}
