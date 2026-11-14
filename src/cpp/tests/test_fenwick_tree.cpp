#include "../fenwick_tree.h"

#include <numeric>
#include <random>

#include "check.h"

int main() {
    std::mt19937 rng(32);
    std::vector<int> a(17);
    for (int& x : a) x = (int)(rng() % 19) - 9;
    FenwickTree ft(a);
    for (int k = 0; k < 500; k++) {
        if (rng() % 10 < 4) {
            int i = 1 + rng() % a.size(), d = (int)(rng() % 11) - 5;
            ft.update(i, d);
            a[i - 1] += d;
        } else {
            int i = rng() % (a.size() + 1);
            CHECK(ft.prefixSum(i) == std::accumulate(a.begin(), a.begin() + i, 0LL));
        }
    }
    CHECK(ft.rangeSum(3, 7) == std::accumulate(a.begin() + 2, a.begin() + 7, 0LL));
    return finish("fenwick_tree");
}
