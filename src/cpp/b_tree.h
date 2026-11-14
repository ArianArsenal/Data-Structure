// B-tree with minimum degree T = 2 (a 2-3-4 tree): every node holds 1 to 3
// keys. Insert splits full nodes on the way down, so the tree only grows at the root.
// Delete makes sure every node it enters has at least T keys (by borrowing from a
// sibling or merging), so it never has to walk back up.
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

    // @op delete
    bool remove(int key) {
        bool removed = removeFrom(root, key);           // @step call_root
        if (root->keys.empty() && !root->leaf) {        // @step check_root
            BNode* old = root;
            root = root->children[0];                   // @step shrink_root
            old->children.clear();
            delete old;
        }
        return removed;
    }

    bool removeFrom(BNode* node, int key) {
        int i = 0;                                                      // @step scan_start
        while (i < (int)node->keys.size() && key > node->keys[i]) {     // @step scan
            i++;
        }
        if (i < (int)node->keys.size() && node->keys[i] == key) {       // @step check_here
            if (node->leaf) {                                           // @step check_leaf
                node->keys.erase(node->keys.begin() + i);               // @step remove_leaf
                return true;
            }
            if ((int)node->children[i]->keys.size() >= T) {             // @step case_pred
                BNode* pred = node->children[i];                        // @step find_pred
                while (!pred->leaf) pred = pred->children.back();
                node->keys[i] = pred->keys.back();                      // @step use_pred
                return removeFrom(node->children[i], node->keys[i]);    // @step recurse_pred
            }
            if ((int)node->children[i + 1]->keys.size() >= T) {         // @step case_succ
                BNode* succ = node->children[i + 1];                    // @step find_succ
                while (!succ->leaf) succ = succ->children.front();
                node->keys[i] = succ->keys.front();                     // @step use_succ
                return removeFrom(node->children[i + 1], node->keys[i]); // @step recurse_succ
            }
            merge(node, i);                                             // @step merge_here
            return removeFrom(node->children[i], key);                  // @step recurse_merged
        }
        if (node->leaf) {                                               // @step check_missing
            return false;                                               // @step not_found
        }
        if ((int)node->children[i]->keys.size() == T - 1) {             // @step check_thin
            i = fill(node, i);                                          // @step fill
        }
        return removeFrom(node->children[i], key);                      // @step descend
    }

    // Give child i at least T keys; return the index of the child to enter.
    int fill(BNode* node, int i) {
        BNode* child = node->children[i];
        if (i > 0 && (int)node->children[i - 1]->keys.size() >= T) {   // @step borrow_left_check
            BNode* left = node->children[i - 1];
            child->keys.insert(child->keys.begin(), node->keys[i - 1]); // @step borrow_left
            node->keys[i - 1] = left->keys.back();
            left->keys.pop_back();
            if (!left->leaf) {
                child->children.insert(child->children.begin(), left->children.back());
                left->children.pop_back();
            }
            return i;
        }
        if (i < (int)node->keys.size() && (int)node->children[i + 1]->keys.size() >= T) {  // @step borrow_right_check
            BNode* right = node->children[i + 1];
            child->keys.push_back(node->keys[i]);                       // @step borrow_right
            node->keys[i] = right->keys.front();
            right->keys.erase(right->keys.begin());
            if (!right->leaf) {
                child->children.push_back(right->children.front());
                right->children.erase(right->children.begin());
            }
            return i;
        }
        if (i < (int)node->keys.size()) {                               // @step merge_check
            merge(node, i);                                             // @step merge_right
            return i;
        }
        merge(node, i - 1);                                             // @step merge_left
        return i - 1;
    }

    // Merge child i, key i and child i + 1 into child i.
    void merge(BNode* node, int i) {
        BNode* left = node->children[i];                                // @step mg_pick
        BNode* right = node->children[i + 1];
        left->keys.push_back(node->keys[i]);                            // @step mg_pull
        node->keys.erase(node->keys.begin() + i);
        left->keys.insert(left->keys.end(), right->keys.begin(), right->keys.end());  // @step mg_join
        left->children.insert(left->children.end(), right->children.begin(), right->children.end());
        node->children.erase(node->children.begin() + i + 1);           // @step mg_unlink
        right->children.clear();
        delete right;
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
