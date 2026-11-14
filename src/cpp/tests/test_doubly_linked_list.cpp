#include "../doubly_linked_list.h"

#include <algorithm>
#include <random>

#include "check.h"

int main() {
    DoublyLinkedList d({2, 3});
    d.insertHead(1);
    d.insertTail(4);
    CHECK(d.toVector() == std::vector<int>({1, 2, 3, 4}));
    CHECK(d.deleteValue(1) && d.deleteValue(4) && d.deleteValue(2) && !d.deleteValue(9));
    CHECK(d.toVector() == std::vector<int>({3}));
    std::mt19937 rng(5);
    std::vector<int> ref = {3};
    for (int k = 0; k < 400; k++) {
        int r = rng() % 10, v = rng() % 16;
        if (r < 3) { d.insertHead(v); ref.insert(ref.begin(), v); }
        else if (r < 6) { d.insertTail(v); ref.push_back(v); }
        else {
            auto it = std::find(ref.begin(), ref.end(), v);
            CHECK(d.deleteValue(v) == (it != ref.end()));
            if (it != ref.end()) ref.erase(it);
        }
        CHECK(d.toVector() == ref);
        CHECK(d.toVectorReversed() == std::vector<int>(ref.rbegin(), ref.rend()));
    }
    return finish("doubly_linked_list");
}
