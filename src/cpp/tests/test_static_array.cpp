#include "../static_array.h"

#include <random>

#include "check.h"

using V = std::vector<int>;

int main() {
    StaticArray a({1, 2, 3});
    a.insert(1, 9);
    CHECK(a.toVector() == V({1, 9, 2, 3}));
    CHECK(a.remove(0) == 1);
    CHECK(a.search(3) == 2 && a.search(7) == -1);
    bool threw = false;
    try { a.insert(9, 1); } catch (const std::out_of_range&) { threw = true; }
    CHECK(threw);
    StaticArray b, full({0, 1, 2, 3, 4, 5, 6, 7});
    threw = false;
    try { full.insert(0, 1); } catch (const std::overflow_error&) { threw = true; }
    CHECK(threw);
    std::mt19937 rng(1);
    V ref;
    for (int k = 0; k < 300; k++) {
        if (!ref.empty() && (ref.size() == 8 || rng() % 2)) {
            int i = rng() % ref.size();
            CHECK(b.remove(i) == ref[i]);
            ref.erase(ref.begin() + i);
        } else {
            int i = rng() % (ref.size() + 1), v = rng() % 50;
            b.insert(i, v);
            ref.insert(ref.begin() + i, v);
        }
        CHECK(b.toVector() == ref);
    }
    return finish("static_array");
}
