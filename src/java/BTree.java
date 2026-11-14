// B-tree with minimum degree T = 2 (a 2-3-4 tree): every node holds 1 to 3
// keys. Insert splits full nodes on the way down, so the tree only grows at the root.
// Delete makes sure every node it enters has at least T keys (by borrowing from a
// sibling or merging), so it never has to walk back up.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.List;

public class BTree {
    static final int T = 2; // minimum degree: non-root nodes hold T-1 .. 2T-1 keys

    static class BNode {
        List<Integer> keys = new ArrayList<>();
        List<BNode> children = new ArrayList<>();
        boolean leaf;

        BNode(boolean leaf) {
            this.leaf = leaf;
        }
    }

    private BNode root = new BNode(true);

    public BTree(int... keys) {
        for (int k : keys) insert(k);
    }

    // @op search
    public boolean search(int key) {
        BNode node = root;              // @step start
        while (true) {
            int i = 0;                  // @step scan_start
            while (i < node.keys.size() && key > node.keys.get(i)) {    // @step scan
                i++;
            }
            if (i < node.keys.size() && node.keys.get(i) == key) {      // @step check_hit
                return true;            // @step found
            }
            if (node.leaf) {            // @step check_leaf
                return false;           // @step not_found
            }
            node = node.children.get(i);    // @step descend
        }
    }
    // @endop

    // @op insert
    public void insert(int key) {
        BNode r = root;                         // @step start
        if (r.keys.size() == 2 * T - 1) {       // @step check_root_full
            BNode newRoot = new BNode(false);   // @step new_root
            newRoot.children.add(r);
            splitChild(newRoot, 0);             // @step split_root
            root = newRoot;                     // @step set_root
        }
        insertNonFull(root, key);               // @step call_nonfull
    }

    private void insertNonFull(BNode node, int key) {
        while (!node.leaf) {                                            // @step nf_loop
            int i = 0;                                                  // @step nf_scan_start
            while (i < node.keys.size() && key > node.keys.get(i)) {    // @step nf_scan
                i++;
            }
            if (node.children.get(i).keys.size() == 2 * T - 1) {        // @step nf_check_full
                splitChild(node, i);                                    // @step nf_split
                if (key > node.keys.get(i)) {                           // @step nf_pick
                    i++;
                }
            }
            node = node.children.get(i);                                // @step nf_descend
        }
        int i = 0;                                                      // @step leaf_start
        while (i < node.keys.size() && key > node.keys.get(i)) {        // @step leaf_scan
            i++;
        }
        node.keys.add(i, key);                                          // @step leaf_insert
    }

    private void splitChild(BNode parent, int i) {
        BNode full = parent.children.get(i);        // @step sp_full
        BNode right = new BNode(full.leaf);         // @step sp_new
        int mid = full.keys.get(T - 1);             // @step sp_mid
        right.keys = new ArrayList<>(full.keys.subList(T, full.keys.size()));  // @step sp_move_keys
        full.keys = new ArrayList<>(full.keys.subList(0, T - 1));
        if (!full.leaf) {                           // @step sp_check_leaf
            right.children = new ArrayList<>(full.children.subList(T, full.children.size()));  // @step sp_move_children
            full.children = new ArrayList<>(full.children.subList(0, T));
        }
        parent.keys.add(i, mid);                    // @step sp_lift
        parent.children.add(i + 1, right);          // @step sp_link
    }
    // @endop

    // @op delete
    public boolean delete(int key) {
        boolean removed = delete(root, key);            // @step call_root
        if (root.keys.isEmpty() && !root.leaf) {        // @step check_root
            root = root.children.get(0);                // @step shrink_root
        }
        return removed;
    }

    private boolean delete(BNode node, int key) {
        int i = 0;                                                      // @step scan_start
        while (i < node.keys.size() && key > node.keys.get(i)) {        // @step scan
            i++;
        }
        if (i < node.keys.size() && node.keys.get(i) == key) {          // @step check_here
            if (node.leaf) {                                            // @step check_leaf
                node.keys.remove(i);                                    // @step remove_leaf
                return true;
            }
            if (node.children.get(i).keys.size() >= T) {                // @step case_pred
                BNode pred = node.children.get(i);                      // @step find_pred
                while (!pred.leaf) pred = pred.children.get(pred.children.size() - 1);
                node.keys.set(i, pred.keys.get(pred.keys.size() - 1)); // @step use_pred
                return delete(node.children.get(i), node.keys.get(i));  // @step recurse_pred
            }
            if (node.children.get(i + 1).keys.size() >= T) {            // @step case_succ
                BNode succ = node.children.get(i + 1);                  // @step find_succ
                while (!succ.leaf) succ = succ.children.get(0);
                node.keys.set(i, succ.keys.get(0));                     // @step use_succ
                return delete(node.children.get(i + 1), node.keys.get(i)); // @step recurse_succ
            }
            merge(node, i);                                             // @step merge_here
            return delete(node.children.get(i), key);                   // @step recurse_merged
        }
        if (node.leaf) {                                                // @step check_missing
            return false;                                               // @step not_found
        }
        if (node.children.get(i).keys.size() == T - 1) {                // @step check_thin
            i = fill(node, i);                                          // @step fill
        }
        return delete(node.children.get(i), key);                       // @step descend
    }

    // Give child i at least T keys; return the index of the child to enter.
    private int fill(BNode node, int i) {
        BNode child = node.children.get(i);
        if (i > 0 && node.children.get(i - 1).keys.size() >= T) {       // @step borrow_left_check
            BNode left = node.children.get(i - 1);
            child.keys.add(0, node.keys.get(i - 1));                    // @step borrow_left
            node.keys.set(i - 1, left.keys.remove(left.keys.size() - 1));
            if (!left.leaf) child.children.add(0, left.children.remove(left.children.size() - 1));
            return i;
        }
        if (i < node.keys.size() && node.children.get(i + 1).keys.size() >= T) {  // @step borrow_right_check
            BNode right = node.children.get(i + 1);
            child.keys.add(node.keys.get(i));                           // @step borrow_right
            node.keys.set(i, right.keys.remove(0));
            if (!right.leaf) child.children.add(right.children.remove(0));
            return i;
        }
        if (i < node.keys.size()) {                                     // @step merge_check
            merge(node, i);                                             // @step merge_right
            return i;
        }
        merge(node, i - 1);                                             // @step merge_left
        return i - 1;
    }

    // Merge child i, key i and child i + 1 into child i.
    private void merge(BNode node, int i) {
        BNode left = node.children.get(i);                              // @step mg_pick
        BNode right = node.children.get(i + 1);
        left.keys.add(node.keys.remove(i));                             // @step mg_pull
        left.keys.addAll(right.keys);                                   // @step mg_join
        left.children.addAll(right.children);
        node.children.remove(i + 1);                                    // @step mg_unlink
    }
    // @endop

    public List<Integer> toList() {
        List<Integer> out = new ArrayList<>();
        walk(root, out);
        return out;
    }

    private static void walk(BNode n, List<Integer> out) {
        for (int j = 0; j < n.keys.size(); j++) {
            if (!n.leaf) walk(n.children.get(j), out);
            out.add(n.keys.get(j));
        }
        if (!n.leaf) walk(n.children.get(n.children.size() - 1), out);
    }
}
