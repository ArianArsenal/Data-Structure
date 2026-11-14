#include "../hash_table_chaining.h"

#include <map>
#include <random>

#include "check.h"

int main() {
    HashTableChaining h({{10, 1}, {3, 2}, {17, 3}});
    CHECK(h.get(3) == 2);
    h.put(3, 9);
    CHECK(h.get(3) == 9 && h.getSize() == 3);
    CHECK(h.remove(17) && !h.remove(17) && !h.get(17));
    std::mt19937 rng(11);
    HashTableChaining r;
    std::map<int, int> ref;
    for (int i = 0; i < 1000; i++) {
        int k = rng() % 41, op = rng() % 4;
        if (op < 2) { int v = rng() % 1000; r.put(k, v); ref[k] = v; }
        else if (op == 2) { CHECK(r.remove(k) == (ref.erase(k) == 1)); }
        else { auto got = r.get(k); CHECK(got.has_value() == (ref.count(k) == 1) && (!got || *got == ref[k])); }
        CHECK(r.getSize() == (int)ref.size());
    }
    return finish("hash_table_chaining");
}
