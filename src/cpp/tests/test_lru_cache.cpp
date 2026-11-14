#include "../lru_cache.h"

#include <algorithm>
#include <list>
#include <random>

#include "check.h"

int main() {
    LRUCache c(2);
    c.put(1, 10);
    c.put(2, 20);
    CHECK(c.get(1) == 10);
    c.put(3, 30);
    CHECK(c.get(2) == -1);
    CHECK(c.keysByRecency() == std::vector<int>({3, 1}));
    std::mt19937 rng(14);
    LRUCache r(3);
    std::list<std::pair<int, int>> ref;  // front = most recent
    for (int i = 0; i < 1000; i++) {
        int k = rng() % 7;
        auto it = std::find_if(ref.begin(), ref.end(), [k](auto& p) { return p.first == k; });
        if (rng() % 2) {
            int v = rng() % 100;
            r.put(k, v);
            if (it != ref.end()) ref.erase(it);
            else if (ref.size() == 3) ref.pop_back();
            ref.push_front({k, v});
        } else {
            int expect = -1;
            if (it != ref.end()) { expect = it->second; ref.splice(ref.begin(), ref, it); }
            CHECK(r.get(k) == expect);
        }
        std::vector<int> keys;
        for (auto& p : ref) keys.push_back(p.first);
        CHECK(r.keysByRecency() == keys);
    }
    return finish("lru_cache");
}
