// B-tree with minimum degree T = 2 (a 2-3-4 tree): every node holds 1 to 3
// keys. Insert splits full nodes on the way down, so the tree only grows at the root.
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
