#include "../union_find.h"

#include <random>

#include "check.h"

int main() {
    UnionFind uf(6);
    CHECK(uf.unite(0, 1) && uf.unite(2, 3) && !uf.unite(1, 0) && uf.unite(1, 3));
    CHECK(uf.connected(0, 2) && !uf.connected(0, 4));
    std::mt19937 rng(33);
    const int n = 30;
    UnionFind r(n);
    std::vector<int> comp(n);
    for (int i = 0; i < n; i++) comp[i] = i;
    for (int k = 0; k < 300; k++) {
        int a = rng() % n, b = rng() % n;
        CHECK(r.unite(a, b) == (comp[a] != comp[b]));
        int old = comp[b];
        for (int& c : comp) if (c == old) c = comp[a];
        int x = rng() % n, y = rng() % n;
        CHECK(r.connected(x, y) == (comp[x] == comp[y]));
    }
    return finish("union_find");
}
