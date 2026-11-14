// AVL tree: a BST that rebalances with rotations so that the two subtrees of
// every node differ in height by at most 1.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <algorithm>
#include <vector>

class AVLTree {
public:
    struct Node {
        int key;
        Node* left = nullptr;
        Node* right = nullptr;
        int height = 1;
        explicit Node(int k) : key(k) {}
    };

    AVLTree() = default;
    explicit AVLTree(const std::vector<int>& keys) {
        for (int k : keys) insert(k);
    }
    ~AVLTree() { destroy(root); }
    AVLTree(const AVLTree&) = delete;
    AVLTree& operator=(const AVLTree&) = delete;

    // @op insert
    void insert(int key) {
        root = insert(root, key);       // @step call_root
    }

    Node* insert(Node* node, int key) {
        if (node == nullptr) {          // @step check_null
            return new Node(key);       // @step create
        }
        if (key < node->key) {                          // @step cmp_less
            node->left = insert(node->left, key);       // @step recurse_left
        } else if (key > node->key) {                   // @step cmp_greater
            node->right = insert(node->right, key);     // @step recurse_right
        } else {
            return node;                                // @step duplicate
        }
        update(node);                                       // @step update_height
        int balance = height(node->left) - height(node->right); // @step balance
        if (balance > 1 && key < node->left->key) {         // @step case_ll
            return rotateRight(node);                       // @step fix_ll
        }
        if (balance < -1 && key > node->right->key) {       // @step case_rr
            return rotateLeft(node);                        // @step fix_rr
        }
        if (balance > 1) {                                  // @step case_lr
            node->left = rotateLeft(node->left);            // @step fix_lr
            return rotateRight(node);                       // @step fix_lr_2
        }
        if (balance < -1) {                                 // @step case_rl
            node->right = rotateRight(node->right);         // @step fix_rl
            return rotateLeft(node);                        // @step fix_rl_2
        }
        return node;                                        // @step return_node
    }

    Node* rotateRight(Node* y) {
        Node* x = y->left;      // @step rotr_pick
        y->left = x->right;     // @step rotr_move
        x->right = y;           // @step rotr_link
        update(y);              // @step rotr_heights
        update(x);
        return x;               // @step rotr_return
    }

    Node* rotateLeft(Node* x) {
        Node* y = x->right;     // @step rotl_pick
        x->right = y->left;     // @step rotl_move
        y->left = x;            // @step rotl_link
        update(x);              // @step rotl_heights
        update(y);
        return y;               // @step rotl_return
    }
    // @endop

    std::vector<int> inorder() const {
        std::vector<int> out;
        walk(root, out);
        return out;
    }
    int rootHeight() const { return height(root); }

private:
    Node* root = nullptr;

    static int height(Node* n) { return n ? n->height : 0; }
    static void update(Node* n) { n->height = 1 + std::max(height(n->left), height(n->right)); }
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
