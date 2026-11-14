#include "../circular_deque.h"

#include <deque>
#include <random>

#include "check.h"

int main() {
    CircularDeque d({2, 3});
    d.pushFront(1);
    d.pushBack(4);
    CHECK(d.toVector() == std::vector<int>({1, 2, 3, 4}));
    CHECK(d.popBack() == 4 && d.popFront() == 1);
    std::mt19937 rng(4);
    std::deque<int> ref = {2, 3};
    for (int k = 0; k < 800; k++) {
        if (!ref.empty() && (ref.size() == 8 || rng() % 2)) {
            if (rng() % 2) { CHECK(d.popFront() == ref.front()); ref.pop_front(); }
            else { CHECK(d.popBack() == ref.back()); ref.pop_back(); }
        } else {
            int v = rng() % 100;
            if (rng() % 2) { d.pushFront(v); ref.push_front(v); }
            else { d.pushBack(v); ref.push_back(v); }
        }
        CHECK(d.toVector() == std::vector<int>(ref.begin(), ref.end()));
    }
    return finish("circular_deque");
}
