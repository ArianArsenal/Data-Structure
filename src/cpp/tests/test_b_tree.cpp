#include "../b_tree.h"

#include <algorithm>
#include <random>

#include "check.h"

int main() {
    BTree t({10, 20, 5, 6, 12, 30, 7, 17});
    CHECK(t.toVector() == std::vector<int>({5, 6, 7, 10, 12, 17, 20, 30}));
    CHECK(t.search(17) && !t.search(11));
    std::mt19937 rng(24);
    std::vector<int> keys;
    BTree r;
    for (int i = 0; i < 500; i++) { int k = rng() % 1000; keys.push_back(k); r.insert(k); }
    std::sort(keys.begin(), keys.end());
    CHECK(r.toVector() == keys);
    for (int i = 0; i < 100; i++) CHECK(r.search(keys[i]));
    return finish("b_tree");
}
