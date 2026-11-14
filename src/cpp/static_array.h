// Fixed-capacity array with insert/delete by shifting.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <stdexcept>
#include <vector>

class StaticArray {
public:
    static constexpr int CAPACITY = 8;

    StaticArray() = default;
    explicit StaticArray(const std::vector<int>& values) {
        for (int v : values) insert(size, v);
    }

    // @op insert
    void insert(int index, int value) {
        if (size == CAPACITY) {                             // @step check_full
            throw std::overflow_error("array is full");     // @step full
        }
        if (index < 0 || index > size) {                    // @step check_bounds
            throw std::out_of_range("index out of range");  // @step out_of_range
        }
        int i = size;                   // @step start
        while (i > index) {             // @step loop
            data[i] = data[i - 1];      // @step shift
            i--;
        }
        data[index] = value;            // @step place
        size++;                         // @step done
    }
    // @endop

    // @op delete
    int remove(int index) {
        if (index < 0 || index >= size) {                   // @step check_bounds
            throw std::out_of_range("index out of range");  // @step out_of_range
        }
        int removed = data[index];                // @step grab
        for (int i = index; i < size - 1; i++) {  // @step loop
            data[i] = data[i + 1];                // @step shift
        }
        size--;                                   // @step shrink
        data[size] = 0;                           // @step clear
        return removed;                           // @step done
    }
    // @endop

    // @op search
    int search(int value) const {
        for (int i = 0; i < size; i++) {  // @step loop
            if (data[i] == value) {       // @step compare
                return i;                 // @step found
            }
        }
        return -1;                        // @step not_found
    }
    // @endop

    std::vector<int> toVector() const { return std::vector<int>(data, data + size); }

private:
    int data[CAPACITY] = {};
    int size = 0;
};
