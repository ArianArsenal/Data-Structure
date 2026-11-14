// Splay tree: a self-adjusting BST. Every access splays the touched node to
// the root with zig, zig-zig and zig-zag rotations.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.List;

public class SplayTree {
    static class Node {
        int key;
        Node left;
        Node right;
        Node parent;

        Node(int key, Node parent) {
            this.key = key;
            this.parent = parent;
        }
    }

    Node root;

    public SplayTree(int... keys) {
        for (int k : keys) insert(k);
    }

    // @op search
    public boolean search(int key) {
        Node curr = root;               // @step start
        Node last = null;
        while (curr != null) {          // @step loop
            last = curr;                // @step remember
            if (key == curr.key) {      // @step cmp_equal
                break;                  // @step found
            }
            curr = key < curr.key ? curr.left : curr.right;  // @step step
        }
        if (last != null) {             // @step check_last
            splay(last);                // @step call_splay
        }
        return curr != null;            // @step done
    }
    // @endop

    // @op insert
    public boolean insert(int key) {
        Node parent = null;             // @step start
        Node curr = root;
        while (curr != null) {          // @step loop
            if (key == curr.key) {      // @step check_dup
                splay(curr);            // @step splay_dup
                return false;           // @step duplicate
            }
            parent = curr;              // @step descend
            curr = key < curr.key ? curr.left : curr.right;
        }
        Node node = new Node(key, parent);  // @step create
        if (parent == null) {           // @step check_root
            root = node;                // @step set_root
        } else if (key < parent.key) {  // @step cmp_parent
            parent.left = node;         // @step attach_left
        } else {
            parent.right = node;        // @step attach_right
        }
        splay(node);                    // @step call_splay
        return true;                    // @step done
    }
    // @endop

    // @op splay
    private void splay(Node x) {
        while (x.parent != null) {                              // @step sp_loop
            Node p = x.parent;                                  // @step sp_family
            Node g = p.parent;
            if (g == null) {                                    // @step sp_check_zig
                rotate(x);                                      // @step sp_zig
            } else if ((g.left == p) == (p.left == x)) {        // @step sp_check_zigzig
                rotate(p);                                      // @step sp_zigzig_1
                rotate(x);                                      // @step sp_zigzig_2
            } else {
                rotate(x);                                      // @step sp_zigzag_1
                rotate(x);                                      // @step sp_zigzag_2
            }
        }
    }

    // Rotate x above its parent.
    private void rotate(Node x) {
        Node p = x.parent;              // @step rot_start
        Node g = p.parent;
        if (p.left == x) {              // @step rot_dir
            p.left = x.right;
            if (x.right != null) x.right.parent = p;
            x.right = p;                // @step rot_right
        } else {
            p.right = x.left;
            if (x.left != null) x.left.parent = p;
            x.left = p;                 // @step rot_left
        }
        p.parent = x;                   // @step rot_relink
        x.parent = g;
        if (g == null) {
            root = x;
        } else if (g.left == p) {
            g.left = x;
        } else {
            g.right = x;
        }
    }
    // @endop

    public List<Integer> inorder() {
        List<Integer> out = new ArrayList<>();
        walk(root, out);
        return out;
    }

    private static void walk(Node n, List<Integer> out) {
        if (n == null) return;
        walk(n.left, out);
        out.add(n.key);
        walk(n.right, out);
    }
}
