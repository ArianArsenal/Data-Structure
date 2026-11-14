#include "../binary_heap.h"

#include <functional>
#include <queue>
#include <random>

#include "check.h"

int main() {
    BinaryHeap h({5, 9, 3, 7, 1, 8, 4});
    CHECK(h.peek() == 1);
    std::vector<int> out;
    while (h.size()) out.push_back(h.extractMin());
    CHECK(out == std::vector<int>({1, 3, 4, 5, 7, 8, 9}));
    std::mt19937 rng(7);
    std::priority_queue<int, std::vector<int>, std::greater<int>> ref;
    for (int k = 0; k < 600; k++) {
        if (!ref.empty() && rng() % 10 < 4) {
            CHECK(h.extractMin() == ref.top());
            ref.pop();
        } else {
            int v = rng() % 51;
            h.insert(v);
            ref.push(v);
        }
    }
    return finish("binary_heap");
}
