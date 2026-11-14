// Array-backed stack (LIFO) with a fixed capacity.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <stdexcept>
#include <vector>

class ArrayStack {
public:
    static constexpr int CAPACITY = 8;

    ArrayStack() = default;
    explicit ArrayStack(const std::vector<int>& values) {
        for (int v : values) push(v);
    }

    // @op push
    void push(int value) {
        if (top == CAPACITY - 1) {                      // @step check_full
            throw std::overflow_error("stack overflow"); // @step overflow
        }
        top++;                          // @step inc_top
        data[top] = value;              // @step place
    }
    // @endop

    // @op pop
    int pop() {
        if (top == -1) {                                  // @step check_empty
            throw std::underflow_error("stack underflow"); // @step underflow
        }
        int value = data[top];          // @step grab
        data[top] = 0;                  // @step clear
        top--;                          // @step dec_top
        return value;                   // @step done
    }
    // @endop

    // @op peek
    int peek() const {
        if (top == -1) {                                  // @step check_empty
            throw std::underflow_error("stack is empty");  // @step empty
        }
        return data[top];               // @step done
    }
    // @endop

    int size() const { return top + 1; }

private:
    int data[CAPACITY] = {};
    int top = -1;
};
