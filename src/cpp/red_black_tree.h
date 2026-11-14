// Red-black tree (insert). Invariants: the root is black, a red node has no red
// child, and every root-to-leaf path has the same number of black nodes.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <utility>
#include <vector>

class RedBlackTree {
public:
    enum Color { RED, BLACK };

    struct Node {
        int key;
        Color color = RED;
        Node* left = nullptr;
        Node* right = nullptr;
        Node* parent;
        Node(int k, Node* p) : key(k), parent(p) {}
    };

    RedBlackTree() = default;
    explicit RedBlackTree(const std::vector<int>& keys) {
        for (int k : keys) insert(k);
    }
    ~RedBlackTree() { destroy(root); }
    RedBlackTree(const RedBlackTree&) = delete;
    RedBlackTree& operator=(const RedBlackTree&) = delete;

    // @op insert
    bool insert(int key) {
        Node* parent = nullptr;         // @step start
        Node* curr = root;
        while (curr != nullptr) {       // @step loop
            if (key == curr->key) {     // @step check_dup
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
        fixInsert(node);                // @step call_fix
        return true;                    // @step done
    }

    void fixInsert(Node* z) {
        while (z->parent != nullptr && z->parent->color == RED) {  // @step fix_loop
            Node* p = z->parent;
            Node* g = p->parent;                                    // @step family
            Node* uncle = p == g->left ? g->right : g->left;
            if (uncle != nullptr && uncle->color == RED) {          // @step check_uncle
                p->color = BLACK;                                   // @step recolor
                uncle->color = BLACK;
                g->color = RED;
                z = g;                                              // @step move_up
            } else {
                if ((p == g->left) != (z == p->left)) {             // @step check_triangle
                    rotate(z);                                      // @step rotate_triangle
                    std::swap(z, p);
                }
                p->color = BLACK;                                   // @step recolor_line
                g->color = RED;
                rotate(p);                                          // @step rotate_line
            }
        }
        root->color = BLACK;                                        // @step root_black
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
    Node* getRoot() const { return root; }

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
