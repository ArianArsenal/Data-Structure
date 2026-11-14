// B-tree with minimum degree T = 2 (a 2-3-4 tree): every node holds 1 to 3
// keys. Insert splits full nodes on the way down, so the tree only grows at the root.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <vector>

class BTree {
public:
    static constexpr int T = 2;  // minimum degree: non-root nodes hold T-1 .. 2T-1 keys

    struct BNode {
        std::vector<int> keys;
        std::vector<BNode*> children;
        bool leaf;
        explicit BNode(bool isLeaf) : leaf(isLeaf) {}
    };

    BTree() = default;
    explicit BTree(const std::vector<int>& keys) {
        for (int k : keys) insert(k);
    }
    ~BTree() { destroy(root); }
    BTree(const BTree&) = delete;
    BTree& operator=(const BTree&) = delete;

    // @op search
    bool search(int key) const {
        BNode* node = root;             // @step start
        while (true) {
            int i = 0;                  // @step scan_start
            while (i < (int)node->keys.size() && key > node->keys[i]) {   // @step scan
                i++;
            }
            if (i < (int)node->keys.size() && node->keys[i] == key) {     // @step check_hit
                return true;            // @step found
            }
            if (node->leaf) {           // @step check_leaf
                return false;           // @step not_found
            }
            node = node->children[i];   // @step descend
        }
    }
    // @endop

    // @op insert
    void insert(int key) {
        BNode* r = root;                        // @step start
        if ((int)r->keys.size() == 2 * T - 1) { // @step check_root_full
            BNode* newRoot = new BNode(false);  // @step new_root
            newRoot->children.push_back(r);
            splitChild(newRoot, 0);             // @step split_root
            root = newRoot;                     // @step set_root
        }
        insertNonFull(root, key);               // @step call_nonfull
    }

    void insertNonFull(BNode* node, int key) {
        while (!node->leaf) {                                           // @step nf_loop
            int i = 0;                                                  // @step nf_scan_start
            while (i < (int)node->keys.size() && key > node->keys[i]) { // @step nf_scan
                i++;
            }
            if ((int)node->children[i]->keys.size() == 2 * T - 1) {     // @step nf_check_full
                splitChild(node, i);                                    // @step nf_split
                if (key > node->keys[i]) {                              // @step nf_pick
                    i++;
                }
            }
            node = node->children[i];                                   // @step nf_descend
        }
        int i = 0;                                                      // @step leaf_start
        while (i < (int)node->keys.size() && key > node->keys[i]) {     // @step leaf_scan
            i++;
        }
        node->keys.insert(node->keys.begin() + i, key);                 // @step leaf_insert
    }

    void splitChild(BNode* parent, int i) {
        BNode* full = parent->children[i];          // @step sp_full
        BNode* right = new BNode(full->leaf);       // @step sp_new
        int mid = full->keys[T - 1];                // @step sp_mid
        right->keys.assign(full->keys.begin() + T, full->keys.end());  // @step sp_move_keys
        full->keys.resize(T - 1);
        if (!full->leaf) {                          // @step sp_check_leaf
            right->children.assign(full->children.begin() + T, full->children.end());  // @step sp_move_children
            full->children.resize(T);
        }
        parent->keys.insert(parent->keys.begin() + i, mid);             // @step sp_lift
        parent->children.insert(parent->children.begin() + i + 1, right); // @step sp_link
    }
    // @endop

    std::vector<int> toVector() const {
        std::vector<int> out;
        walk(root, out);
        return out;
    }

private:
    BNode* root = new BNode(true);

    static void walk(BNode* n, std::vector<int>& out) {
        for (size_t j = 0; j < n->keys.size(); j++) {
            if (!n->leaf) walk(n->children[j], out);
            out.push_back(n->keys[j]);
        }
        if (!n->leaf) walk(n->children.back(), out);
    }
    static void destroy(BNode* n) {
        for (BNode* c : n->children) destroy(c);
        delete n;
    }
};
