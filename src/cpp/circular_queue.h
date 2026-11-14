// FIFO queue on a circular buffer of fixed capacity.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <stdexcept>
#include <vector>

class CircularQueue {
public:
    static constexpr int CAPACITY = 8;

    CircularQueue() = default;
    explicit CircularQueue(const std::vector<int>& values) {
        for (int v : values) enqueue(v);
    }

    // @op enqueue
    void enqueue(int value) {
        if (size == CAPACITY) {                         // @step check_full
            throw std::overflow_error("queue is full");  // @step full
        }
        int rear = (front + size) % CAPACITY;   // @step compute_rear
        data[rear] = value;                     // @step place
        size++;                                 // @step done
    }
    // @endop

    // @op dequeue
    int dequeue() {
        if (size == 0) {                                  // @step check_empty
            throw std::underflow_error("queue is empty");  // @step empty
        }
        int value = data[front];                // @step grab
        data[front] = 0;                        // @step clear
        front = (front + 1) % CAPACITY;         // @step advance
        size--;                                 // @step shrink
        return value;                           // @step done
    }
    // @endop

    int getSize() const { return size; }

private:
    int data[CAPACITY] = {};
    int front = 0;
    int size = 0;
};
