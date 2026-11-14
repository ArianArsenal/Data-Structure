// Binary search tree of integer keys (no duplicates).
//
// Lines tagged `// @step <id>` and the `// @op` / `// @endop` markers drive the
// visualizer (tools/build_code.js strips them); the code itself is plain Java.
import java.util.ArrayList;
import java.util.List;

public class BST {
    static class Node {
        int key;
        Node left;
        Node right;

        Node(int key) {
            this.key = key;
        }
    }

    private Node root;

    public BST(int... keys) {
        for (int k : keys) insert(k);
    }

    // @op insert
    public boolean insert(int key) {
        if (root == null) {         // @step check_empty
            root = new Node(key);   // @step set_root
            return true;
        }
        Node curr = root;           // @step start
        while (true) {
            if (key < curr.key) {               // @step cmp_less
                if (curr.left == null) {        // @step check_left
                    curr.left = new Node(key);  // @step attach_left
                    return true;
                }
                curr = curr.left;               // @step go_left
            } else if (key > curr.key) {        // @step cmp_greater
                if (curr.right == null) {       // @step check_right
                    curr.right = new Node(key); // @step attach_right
                    return true;
                }
                curr = curr.right;              // @step go_right
            } else {
                return false;                   // @step duplicate
            }
        }
    }
    // @endop

    // @op search
    public boolean search(int key) {
        Node curr = root;               // @step start
        while (curr != null) {          // @step loop
            if (key == curr.key) {      // @step cmp_equal
                return true;            // @step found
            }
            if (key < curr.key) {       // @step cmp_less
                curr = curr.left;       // @step go_left
            } else {
                curr = curr.right;      // @step go_right
            }
        }
        return false;                   // @step not_found
    }
    // @endop

    // @op delete
    public void delete(int key) {
        root = delete(root, key);       // @step call_root
    }

    private Node delete(Node node, int key) {
        if (node == null) {             // @step check_null
            return null;                // @step not_found
        }
        if (key < node.key) {                       // @step cmp_less
            node.left = delete(node.left, key);     // @step recurse_left
        } else if (key > node.key) {                // @step cmp_greater
            node.right = delete(node.right, key);   // @step recurse_right
        } else {
            if (node.left == null) {    // @step check_left
                return node.right;      // @step return_right
            }
            if (node.right == null) {   // @step check_right
                return node.left;       // @step return_left
            }
            Node succ = node.right;             // @step succ_start
            while (succ.left != null) {         // @step succ_loop
                succ = succ.left;               // @step succ_advance
            }
            node.key = succ.key;                // @step copy_key
            node.right = delete(node.right, succ.key); // @step recurse_succ
        }
        return node;                    // @step return_node
    }
    // @endop

    // @op minimum
    public Integer minimum() {
        if (root == null) {             // @step check_empty
            return null;                // @step empty
        }
        Node curr = root;               // @step start
        while (curr.left != null) {     // @step loop
            curr = curr.left;           // @step go_left
        }
        return curr.key;                // @step done
    }
    // @endop

    // @op maximum
    public Integer maximum() {
        if (root == null) {             // @step check_empty
            return null;                // @step empty
        }
        Node curr = root;               // @step start
        while (curr.right != null) {    // @step loop
            curr = curr.right;          // @step go_right
        }
        return curr.key;                // @step done
    }
    // @endop

    // @op successor
    public Integer successor(int key) {
        Node succ = null;               // @step start
        Node curr = root;
        while (curr != null) {          // @step loop
            if (key < curr.key) {       // @step compare
                succ = curr;            // @step remember
                curr = curr.left;       // @step go_left
            } else {
                curr = curr.right;      // @step go_right
            }
        }
        return succ == null ? null : succ.key;  // @step done
    }
    // @endop

    // @op inorder
    public List<Integer> inorder() {
        List<Integer> result = new ArrayList<>(); // @step init
        inorder(root, result);          // @step call_root
        return result;                  // @step done
    }

    private void inorder(Node node, List<Integer> result) {
        if (node == null) {             // @step check_null
            return;                     // @step return_null
        }
        inorder(node.left, result);     // @step go_left
        result.add(node.key);           // @step visit
        inorder(node.right, result);    // @step go_right
    }
    // @endop
}
