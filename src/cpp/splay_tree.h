// Splay tree: a self-adjusting BST. Every access splays the touched node to
// the root with zig, zig-zig and zig-zag rotations.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <vector>

class SplayTree {
public:
    struct Node {
        int key;
        Node* left = nullptr;
        Node* right = nullptr;
        Node* parent;
        Node(int k, Node* p) : key(k), parent(p) {}
    };

    SplayTree() = default;
    explicit SplayTree(const std::vector<int>& keys) {
        for (int k : keys) insert(k);
    }
    ~SplayTree() { destroy(root); }
    SplayTree(const SplayTree&) = delete;
    SplayTree& operator=(const SplayTree&) = delete;

    // @op search
    bool search(int key) {
        Node* curr = root;              // @step start
        Node* last = nullptr;
        while (curr != nullptr) {       // @step loop
            last = curr;                // @step remember
            if (key == curr->key) {     // @step cmp_equal
                break;                  // @step found
            }
            curr = key < curr->key ? curr->left : curr->right;  // @step step
        }
        if (last != nullptr) {          // @step check_last
            splay(last);                // @step call_splay
        }
        return curr != nullptr;         // @step done
    }
    // @endop

    // @op insert
    bool insert(int key) {
        Node* parent = nullptr;         // @step start
        Node* curr = root;
        while (curr != nullptr) {       // @step loop
            if (key == curr->key) {     // @step check_dup
                splay(curr);            // @step splay_dup
                return false;           // @step duplicate
            }
            parent = curr;              // @step descend
            curr = key < curr->key ? curr->left : curr->right;
        }
        Node* node = new Node(key, parent); // @step create
        if (parent == nullptr) {        // @step check_root
            root = node;                // @step set_root
        } else if (key < parent->key) { // @step cmp_parent
            parent->left = node;        // @step attach_left
        } else {
            parent->right = node;       // @step attach_right
        }
        splay(node);                    // @step call_splay
        return true;                    // @step done
    }
    // @endop

    // @op splay
    void splay(Node* x) {
        while (x->parent != nullptr) {                          // @step sp_loop
            Node* p = x->parent;                                // @step sp_family
            Node* g = p->parent;
            if (g == nullptr) {                                 // @step sp_check_zig
                rotate(x);                                      // @step sp_zig
            } else if ((g->left == p) == (p->left == x)) {      // @step sp_check_zigzig
                rotate(p);                                      // @step sp_zigzig_1
                rotate(x);                                      // @step sp_zigzig_2
            } else {
                rotate(x);                                      // @step sp_zigzag_1
                rotate(x);                                      // @step sp_zigzag_2
            }
        }
    }

    // Rotate x above its parent.
    void rotate(Node* x) {
        Node* p = x->parent;            // @step rot_start
        Node* g = p->parent;
        if (p->left == x) {             // @step rot_dir
            p->left = x->right;
            if (x->right != nullptr) x->right->parent = p;
            x->right = p;               // @step rot_right
        } else {
            p->right = x->left;
            if (x->left != nullptr) x->left->parent = p;
            x->left = p;                // @step rot_left
        }
        p->parent = x;                  // @step rot_relink
        x->parent = g;
        if (g == nullptr) {
            root = x;
        } else if (g->left == p) {
            g->left = x;
        } else {
            g->right = x;
        }
    }
    // @endop

    std::vector<int> inorder() const {
        std::vector<int> out;
        walk(root, out);
        return out;
    }
    int rootKey() const { return root->key; }

private:
    Node* root = nullptr;

    static void walk(Node* n, std::vector<int>& out) {
        if (!n) return;
        walk(n->left, out);
        out.push_back(n->key);
        walk(n->right, out);
    }
    static void destroy(Node* n) {
        if (!n) return;
        destroy(n->left);
        destroy(n->right);
        delete n;
    }
};
