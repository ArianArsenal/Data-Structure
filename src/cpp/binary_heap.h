// Binary min-heap stored in an array: children of i are 2i+1 and 2i+2.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <stdexcept>
#include <utility>
#include <vector>

class BinaryHeap {
public:
    BinaryHeap() = default;
    explicit BinaryHeap(const std::vector<int>& values) {
        for (int v : values) insert(v);
    }

    // @op insert
    void insert(int value) {
        data.push_back(value);              // @step append
        int i = (int)data.size() - 1;       // @step start
        while (i > 0) {                     // @step loop
            int parent = (i - 1) / 2;       // @step parent
            if (data[i] >= data[parent]) {  // @step compare
                break;                      // @step stop
            }
            std::swap(data[i], data[parent]);  // @step swap
            i = parent;                        // @step move_up
        }
    }
    // @endop

    // @op extract_min
    int extractMin() {
        if (data.empty()) {                             // @step check_empty
            throw std::out_of_range("heap is empty");   // @step empty
        }
        int top = data[0];              // @step grab
        int last = data.back();         // @step pop_last
        data.pop_back();
        if (!data.empty()) {            // @step check_rest
            data[0] = last;             // @step move_last
            siftDown(0);                // @step sift
        }
        return top;                     // @step done
    }

    void siftDown(int i) {
        int n = (int)data.size();
        while (true) {
            int smallest = i;                                   // @step sd_start
            int left = 2 * i + 1, right = 2 * i + 2;
            if (left < n && data[left] < data[smallest]) {      // @step sd_left
                smallest = left;
            }
            if (right < n && data[right] < data[smallest]) {    // @step sd_right
                smallest = right;
            }
            if (smallest == i) {                                // @step sd_check
                return;                                         // @step sd_done
            }
            std::swap(data[i], data[smallest]);                 // @step sd_swap
            i = smallest;                                       // @step sd_move
        }
    }
    // @endop

    int peek() const {
        if (data.empty()) throw std::out_of_range("heap is empty");
        return data[0];
    }
    int size() const { return (int)data.size(); }

private:
    std::vector<int> data;
};
