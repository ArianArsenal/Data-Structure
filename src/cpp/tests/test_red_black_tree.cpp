#include "../red_black_tree.h"

#include <random>
#include <set>

#include "check.h"

using N = RedBlackTree::Node;

int blackHeight(N* n, N* parent) {
    if (!n) return 1;
    CHECK(n->parent == parent);
    if (n->color == RedBlackTree::RED) {
        CHECK(!n->left || n->left->color == RedBlackTree::BLACK);
        CHECK(!n->right || n->right->color == RedBlackTree::BLACK);
    }
    int l = blackHeight(n->left, n), r = blackHeight(n->right, n);
    CHECK(l == r);
    return l + (n->color == RedBlackTree::BLACK);
}

int main() {
    std::mt19937 rng(22);
    RedBlackTree t;
    std::set<int> ref;
    for (int i = 0; i < 500; i++) {
        int k = rng() % 501;
        CHECK(t.insert(k) == (ref.count(k) == 0));
        ref.insert(k);
    }
    CHECK(t.inorder() == std::vector<int>(ref.begin(), ref.end()));
    CHECK(t.getRoot()->color == RedBlackTree::BLACK);
    blackHeight(t.getRoot(), nullptr);
    return finish("red_black_tree");
}
