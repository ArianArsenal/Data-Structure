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
    {
        std::mt19937 r(43);
        AVLTree t;
        std::set<int> s;
        for (int i = 0; i < 1500; i++) {
            int k = r() % 121;
            if (r() % 100 < 55) { t.insert(k); s.insert(k); }
            else { t.remove(k); s.erase(k); }
        }
        CHECK(t.inorder() == std::vector<int>(s.begin(), s.end()));
        CHECK(t.rootHeight() <= 9);
    }
    return finish("avl_tree");
}
