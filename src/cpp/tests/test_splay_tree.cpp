#include "../splay_tree.h"

#include <random>
#include <set>

#include "check.h"

int main() {
    SplayTree t({50, 30, 70, 20, 40, 60, 80});
    CHECK(t.search(20) && t.rootKey() == 20);
    CHECK(t.insert(45) && t.rootKey() == 45);
    CHECK(!t.insert(30) && t.rootKey() == 30);
    std::mt19937 rng(23);
    SplayTree r;
    std::set<int> ref;
    for (int i = 0; i < 600; i++) {
        int k = rng() % 81;
        if (rng() % 10 < 6) { CHECK(r.insert(k) == (ref.count(k) == 0)); ref.insert(k); }
        else CHECK(r.search(k) == (ref.count(k) == 1));
    }
    CHECK(r.inorder() == std::vector<int>(ref.begin(), ref.end()));
    return finish("splay_tree");
}
