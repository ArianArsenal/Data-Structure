#include "../skip_list.h"

#include <random>
#include <set>

#include "check.h"

int main() {
    std::mt19937 rng(34);
    SkipList s(7);
    std::set<int> ref;
    for (int k = 0; k < 500; k++) {
        int key = rng() % 101;
        if (rng() % 2) { CHECK(s.insert(key) == (ref.count(key) == 0)); ref.insert(key); }
        else CHECK(s.search(key) == (ref.count(key) == 1));
    }
    CHECK(s.toVector() == std::vector<int>(ref.begin(), ref.end()));
    return finish("skip_list");
}
