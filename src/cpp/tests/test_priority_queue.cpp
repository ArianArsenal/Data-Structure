#include "../priority_queue.h"

#include <queue>
#include <random>

#include "check.h"

int main() {
    PriorityQueue pq({3, 10, 6, 1, 8});
    CHECK(pq.peek() == 10);
    CHECK(pq.pop() == 10 && pq.pop() == 8 && pq.pop() == 6 && pq.pop() == 3 && pq.pop() == 1);
    bool threw = false;
    try { pq.pop(); } catch (const std::out_of_range&) { threw = true; }
    CHECK(threw);
    std::mt19937 rng(8);
    std::priority_queue<int> ref;
    for (int k = 0; k < 600; k++) {
        if (!ref.empty() && rng() % 10 < 4) {
            CHECK(pq.pop() == ref.top());
            ref.pop();
        } else {
            int v = rng() % 51;
            pq.push(v);
            ref.push(v);
        }
    }
    return finish("priority_queue");
}
