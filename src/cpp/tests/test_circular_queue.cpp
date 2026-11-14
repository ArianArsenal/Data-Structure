#include "../circular_queue.h"

#include <deque>
#include <random>

#include "check.h"

int main() {
    CircularQueue q({1, 2});
    q.enqueue(3);
    CHECK(q.dequeue() == 1 && q.dequeue() == 2 && q.dequeue() == 3);
    bool threw = false;
    try { q.dequeue(); } catch (const std::underflow_error&) { threw = true; }
    CHECK(threw);
    std::mt19937 rng(3);
    std::deque<int> ref;
    for (int k = 0; k < 500; k++) {
        if (!ref.empty() && (ref.size() == 8 || rng() % 2)) {
            CHECK(q.dequeue() == ref.front());
            ref.pop_front();
        } else {
            int v = rng() % 100;
            q.enqueue(v);
            ref.push_back(v);
        }
        CHECK(q.getSize() == (int)ref.size());
    }
    return finish("circular_queue");
}
