#include "../b_tree.h"

#include <algorithm>
#include <set>
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
    {
        std::mt19937 r(45);
        BTree d;
        std::multiset<int> s;
        for (int i = 0; i < 1500; i++) {
            int k = r() % 151;
            if (r() % 100 < 55) { d.insert(k); s.insert(k); }
            else {
                auto it = s.find(k);
                CHECK(d.remove(k) == (it != s.end()));
                if (it != s.end()) s.erase(it);
            }
            CHECK(d.toVector() == std::vector<int>(s.begin(), s.end()));
        }
    }
    return finish("b_tree");
}
