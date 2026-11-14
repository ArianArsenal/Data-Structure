// Double-ended queue on a circular buffer of fixed capacity.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <stdexcept>
#include <vector>

class CircularDeque {
public:
    static constexpr int CAPACITY = 8;

    CircularDeque() = default;
    explicit CircularDeque(const std::vector<int>& values) {
        for (int v : values) pushBack(v);
    }

    // @op push_front
    void pushFront(int value) {
        if (size == CAPACITY) {                         // @step check_full
            throw std::overflow_error("deque is full");  // @step full
        }
        front = (front - 1 + CAPACITY) % CAPACITY;  // @step move_front
        data[front] = value;                        // @step place
        size++;                                     // @step done
    }
    // @endop

    // @op push_back
    void pushBack(int value) {
        if (size == CAPACITY) {                         // @step check_full
            throw std::overflow_error("deque is full");  // @step full
        }
        int back = (front + size) % CAPACITY;   // @step compute_back
        data[back] = value;                     // @step place
        size++;                                 // @step done
    }
    // @endop

    // @op pop_front
    int popFront() {
        if (size == 0) {                                  // @step check_empty
            throw std::underflow_error("deque is empty");  // @step empty
        }
        int value = data[front];                // @step grab
        data[front] = 0;                        // @step clear
        front = (front + 1) % CAPACITY;         // @step advance
        size--;                                 // @step shrink
        return value;                           // @step done
    }
    // @endop

    // @op pop_back
    int popBack() {
        if (size == 0) {                                  // @step check_empty
            throw std::underflow_error("deque is empty");  // @step empty
        }
        int back = (front + size - 1) % CAPACITY;   // @step compute_back
        int value = data[back];                     // @step grab
        data[back] = 0;                             // @step clear
        size--;                                     // @step shrink
        return value;                               // @step done
    }
    // @endop

    std::vector<int> toVector() const {
        std::vector<int> out;
        for (int i = 0; i < size; i++) out.push_back(data[(front + i) % CAPACITY]);
        return out;
    }

private:
    int data[CAPACITY] = {};
    int front = 0;
    int size = 0;
};
