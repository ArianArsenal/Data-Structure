#include "../circular_linked_list.h"

#include <algorithm>
#include <random>

#include "check.h"

int main() {
    CircularLinkedList c({2, 3});
    c.insertHead(1);
    c.insertTail(4);
    CHECK(c.traverse() == std::vector<int>({1, 2, 3, 4}));
    CHECK(c.deleteValue(4) && !c.deleteValue(9));
    CHECK(c.deleteValue(1) && c.deleteValue(2) && c.deleteValue(3));
    CHECK(c.traverse().empty() && c.size() == 0);
    std::mt19937 rng(6);
    std::vector<int> ref;
    for (int k = 0; k < 400; k++) {
        int r = rng() % 10, v = rng() % 16;
        if (r < 3) { c.insertHead(v); ref.insert(ref.begin(), v); }
        else if (r < 6) { c.insertTail(v); ref.push_back(v); }
        else {
            auto it = std::find(ref.begin(), ref.end(), v);
            CHECK(c.deleteValue(v) == (it != ref.end()));
            if (it != ref.end()) ref.erase(it);
        }
        CHECK(c.traverse() == ref);
    }
    return finish("circular_linked_list");
}
