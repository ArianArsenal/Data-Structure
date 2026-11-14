#include "../hash_table_open_addressing.h"

#include <map>
#include <random>

#include "check.h"

int main() {
    HashTableOpenAddressing h;
    h.put(22, 1); h.put(33, 2); h.put(44, 3);
    CHECK(h.remove(33) && h.get(44) == 3);
    h.put(55, 4);
    CHECK(h.get(55) == 4);
    HashTableOpenAddressing full;
    for (int i = 0; i < 11; i++) full.put(i, i);
    bool threw = false;
    try { full.put(11, 0); } catch (const std::overflow_error&) { threw = true; }
    CHECK(threw && !full.get(11));
    std::mt19937 rng(12);
    HashTableOpenAddressing r;
    std::map<int, int> ref;
    for (int i = 0; i < 2000; i++) {
        int k = rng() % 41, op = rng() % 20;
        if (op < 9 && (ref.size() < 11 || ref.count(k))) { int v = rng() % 1000; r.put(k, v); ref[k] = v; }
        else if (op < 15) { CHECK(r.remove(k) == (ref.erase(k) == 1)); }
        else { auto got = r.get(k); CHECK(got.has_value() == (ref.count(k) == 1) && (!got || *got == ref[k])); }
        CHECK(r.getSize() == (int)ref.size());
    }
    return finish("hash_table_open_addressing");
}
