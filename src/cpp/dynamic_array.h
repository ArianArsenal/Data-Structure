// Growable array: doubles when full, halves when a quarter full.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <stdexcept>
#include <vector>

class DynamicArray {
public:
    DynamicArray() : data(new int[2]) {}
    explicit DynamicArray(const std::vector<int>& values) : DynamicArray() {
        for (int v : values) append(v);
    }
    ~DynamicArray() { delete[] data; }
    DynamicArray(const DynamicArray&) = delete;
    DynamicArray& operator=(const DynamicArray&) = delete;

    // @op append
    void append(int value) {
        if (size == capacity) {         // @step check_full
            resize(2 * capacity);       // @step grow
        }
        data[size] = value;             // @step place
        size++;                         // @step done
    }

    void resize(int newCapacity) {
        int* buffer = new int[newCapacity];  // @step alloc
        for (int i = 0; i < size; i++) {     // @step copy_loop
            buffer[i] = data[i];             // @step copy
        }
        delete[] data;
        data = buffer;                       // @step swap
        capacity = newCapacity;
    }
    // @endop

    // @op pop
    int pop() {
        if (size == 0) {                                        // @step check_empty
            throw std::out_of_range("pop from empty array");    // @step empty
        }
        size--;                                     // @step shrink
        int value = data[size];                     // @step grab
        data[size] = 0;                             // @step clear
        if (size > 0 && size <= capacity / 4) {     // @step check_quarter
            resize(capacity / 2);                   // @step halve
        }
        return value;                               // @step done
    }
    // @endop

    int get(int index) const {
        if (index < 0 || index >= size) throw std::out_of_range("index out of range");
        return data[index];
    }
    int getSize() const { return size; }
    int getCapacity() const { return capacity; }

private:
    int* data;
    int size = 0;
    int capacity = 2;
};
