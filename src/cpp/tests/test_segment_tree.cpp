#include "../segment_tree.h"

#include <numeric>
#include <random>

#include "check.h"

int main() {
    std::mt19937 rng(31);
    std::vector<int> a(13);
    for (int& x : a) x = (int)(rng() % 19) - 9;
    SegmentTree st(a);
    for (int k = 0; k < 500; k++) {
        if (rng() % 10 < 4) {
            int i = rng() % a.size(), v = (int)(rng() % 19) - 9;
            st.update(i, v);
            a[i] = v;
        } else {
            int l = rng() % a.size();
            int r = l + rng() % (a.size() - l);
            CHECK(st.query(l, r) == std::accumulate(a.begin() + l, a.begin() + r + 1, 0LL));
        }
    }
    return finish("segment_tree");
}
