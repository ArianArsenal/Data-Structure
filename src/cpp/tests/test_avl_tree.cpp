#include "../avl_tree.h"

#include <random>
#include <set>

#include "check.h"

int main() {
    std::vector<int> keys;
    for (int i = 1; i < 128; i++) keys.push_back(i);
    AVLTree t(keys);
    CHECK(t.inorder() == keys);
    CHECK(t.rootHeight() == 7);
    std::mt19937 rng(21);
    AVLTree r;
    std::set<int> ref;
    for (int i = 0; i < 400; i++) { int k = rng() % 501; r.insert(k); ref.insert(k); }
    CHECK(r.inorder() == std::vector<int>(ref.begin(), ref.end()));
    CHECK(r.rootHeight() <= 13);  // 1.44 log2(n) bound
    return finish("avl_tree");
}
