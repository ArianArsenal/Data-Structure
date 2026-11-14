// Binary search tree of integer keys (no duplicates).
//
// Lines tagged `// @step <id>` and the `// @op` / `// @endop` markers drive the
// visualizer (tools/build_code.js strips them); the code itself is plain C++17.
#pragma once
#include <vector>

class BST {
public:
    struct Node {
        int key;
        Node* left;
        Node* right;
        explicit Node(int k) : key(k), left(nullptr), right(nullptr) {}
    };

    BST() = default;
    explicit BST(const std::vector<int>& keys) {
        for (int k : keys) insert(k);
    }
    ~BST() { destroy(root); }
    BST(const BST&) = delete;
    BST& operator=(const BST&) = delete;

    // @op insert
    bool insert(int key) {
        if (root == nullptr) {      // @step check_empty
            root = new Node(key);   // @step set_root
            return true;
        }
        Node* curr = root;          // @step start
        while (true) {
            if (key < curr->key) {               // @step cmp_less
                if (curr->left == nullptr) {     // @step check_left
                    curr->left = new Node(key);  // @step attach_left
                    return true;
                }
                curr = curr->left;               // @step go_left
            } else if (key > curr->key) {        // @step cmp_greater
                if (curr->right == nullptr) {    // @step check_right
                    curr->right = new Node(key); // @step attach_right
                    return true;
                }
                curr = curr->right;              // @step go_right
            } else {
                return false;                    // @step duplicate
            }
        }
    }
    // @endop

    // @op search
    bool search(int key) const {
        Node* curr = root;              // @step start
        while (curr != nullptr) {       // @step loop
            if (key == curr->key) {     // @step cmp_equal
                return true;            // @step found
            }
            if (key < curr->key) {      // @step cmp_less
                curr = curr->left;      // @step go_left
            } else {
                curr = curr->right;     // @step go_right
            }
        }
        return false;                   // @step not_found
    }
    // @endop

    // @op delete
    void remove(int key) {
        root = removeNode(root, key);   // @step call_root
    }

    Node* removeNode(Node* node, int key) {
        if (node == nullptr) {          // @step check_null
            return nullptr;             // @step not_found
        }
        if (key < node->key) {                              // @step cmp_less
            node->left = removeNode(node->left, key);       // @step recurse_left
        } else if (key > node->key) {                       // @step cmp_greater
            node->right = removeNode(node->right, key);     // @step recurse_right
        } else {
            if (node->left == nullptr) {    // @step check_left
                Node* right = node->right;
                delete node;
                return right;               // @step return_right
            }
            if (node->right == nullptr) {   // @step check_right
                Node* left = node->left;
                delete node;
                return left;                // @step return_left
            }
            Node* succ = node->right;               // @step succ_start
            while (succ->left != nullptr) {         // @step succ_loop
                succ = succ->left;                  // @step succ_advance
            }
            node->key = succ->key;                  // @step copy_key
            node->right = removeNode(node->right, succ->key); // @step recurse_succ
        }
        return node;                    // @step return_node
    }
    // @endop

    // @op inorder
    std::vector<int> inorder() const {
        std::vector<int> result;        // @step init
        inorderVisit(root, result);     // @step call_root
        return result;                  // @step done
    }

    void inorderVisit(Node* node, std::vector<int>& result) const {
        if (node == nullptr) {          // @step check_null
            return;                     // @step return_null
        }
        inorderVisit(node->left, result);   // @step go_left
        result.push_back(node->key);        // @step visit
        inorderVisit(node->right, result);  // @step go_right
    }
    // @endop

private:
    Node* root = nullptr;

    static void destroy(Node* node) {
        if (node == nullptr) return;
        destroy(node->left);
        destroy(node->right);
        delete node;
    }
};
