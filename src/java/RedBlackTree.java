// Red-black tree (insert and delete). Invariants: the root is black, a red node has no red
// child, and every root-to-leaf path has the same number of black nodes.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.List;

public class RedBlackTree {
    static final boolean RED = true, BLACK = false;

    static class Node {
        int key;
        boolean color = RED;
        Node left;
        Node right;
        Node parent;

        Node(int key, Node parent) {
            this.key = key;
            this.parent = parent;
        }
    }

    Node root;

    public RedBlackTree(int... keys) {
        for (int k : keys) insert(k);
    }

    // @op insert
    public boolean insert(int key) {
        Node parent = null;             // @step start
        Node curr = root;
        while (curr != null) {          // @step loop
            if (key == curr.key) {      // @step check_dup
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
        fixInsert(node);                // @step call_fix
        return true;                    // @step done
    }

    private void fixInsert(Node z) {
        while (z.parent != null && z.parent.color == RED) {     // @step fix_loop
            Node p = z.parent;
            Node g = p.parent;                                  // @step family
            Node uncle = p == g.left ? g.right : g.left;
            if (uncle != null && uncle.color == RED) {          // @step check_uncle
                p.color = BLACK;                                // @step recolor
                uncle.color = BLACK;
                g.color = RED;
                z = g;                                          // @step move_up
            } else {
                if ((p == g.left) != (z == p.left)) {           // @step check_triangle
                    rotate(z);                                  // @step rotate_triangle
                    Node tmp = z;
                    z = p;
                    p = tmp;
                }
                p.color = BLACK;                                // @step recolor_line
                g.color = RED;
                rotate(p);                                      // @step rotate_line
            }
        }
        root.color = BLACK;                                     // @step root_black
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

    // @op delete
    public boolean delete(int key) {
        Node z = root;                                  // @step start
        while (z != null && z.key != key) {             // @step search
            z = key < z.key ? z.left : z.right;
        }
        if (z == null) {                                // @step check_found
            return false;                               // @step not_found
        }
        if (z.left != null && z.right != null) {        // @step check_two
            Node s = z.right;                           // @step find_succ
            while (s.left != null) s = s.left;
            z.key = s.key;                              // @step copy_key
            z = s;
        }
        Node child = z.left != null ? z.left : z.right; // @step splice
        Node parent = z.parent;
        if (child != null) child.parent = parent;
        if (parent == null) {
            root = child;
        } else if (parent.left == z) {
            parent.left = child;
        } else {
            parent.right = child;
        }
        if (z.color == BLACK) {                         // @step check_black
            fixDelete(child, parent);                   // @step call_fix
        }
        return true;                                    // @step done
    }

    private void fixDelete(Node x, Node parent) {
        while (x != root && color(x) == BLACK) {                    // @step fd_loop
            boolean isLeft = x == parent.left;
            Node s = isLeft ? parent.right : parent.left;           // @step fd_sibling
            if (s.color == RED) {                                   // @step fd_case1
                s.color = BLACK;
                parent.color = RED;
                rotate(s);                                          // @step fd_rotate1
                s = isLeft ? parent.right : parent.left;
            }
            Node near = isLeft ? s.left : s.right;
            Node far = isLeft ? s.right : s.left;                   // @step fd_nephews
            if (color(near) == BLACK && color(far) == BLACK) {      // @step fd_case2
                s.color = RED;                                      // @step fd_recolor2
                x = parent;
                parent = parent.parent;
            } else {
                if (color(far) == BLACK) {                          // @step fd_case3
                    near.color = BLACK;
                    s.color = RED;
                    rotate(near);                                   // @step fd_rotate3
                    far = s;
                    s = near;
                }
                s.color = parent.color;                             // @step fd_case4
                parent.color = BLACK;
                far.color = BLACK;
                rotate(s);                                          // @step fd_rotate4
                x = root;
            }
        }
        if (x != null) {                                            // @step fd_end
            x.color = BLACK;
        }
    }
    // @endop

    private static boolean color(Node n) {
        return n == null ? BLACK : n.color; // empty leaves count as black
    }

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
