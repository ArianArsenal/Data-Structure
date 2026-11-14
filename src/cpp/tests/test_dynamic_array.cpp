#include "../dynamic_array.h"

#include <random>

#include "check.h"

int main() {
    DynamicArray a;
    for (int i = 0; i < 9; i++) a.append(i);
    CHECK(a.getCapacity() == 16 && a.getSize() == 9);
    for (int i = 8; i >= 5; i--) CHECK(a.pop() == i);
    CHECK(a.pop() == 4);
    CHECK(a.getCapacity() == 8);
    CHECK(a.get(3) == 3);
    std::mt19937 rng(2);
    DynamicArray b;
    std::vector<int> ref;
    for (int k = 0; k < 500; k++) {
        if (!ref.empty() && rng() % 100 < 45) {
            CHECK(b.pop() == ref.back());
            ref.pop_back();
        } else {
            int v = rng() % 100;
            b.append(v);
            ref.push_back(v);
        }
        CHECK(b.getSize() == (int)ref.size() && b.getCapacity() >= b.getSize());
        for (int i = 0; i < (int)ref.size(); i++) CHECK(b.get(i) == ref[i]);
    }
    return finish("dynamic_array");
}
