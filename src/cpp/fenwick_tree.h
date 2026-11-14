// Fenwick tree (binary indexed tree) for prefix sums. 1-indexed: tree[i]
// stores the sum of the lowbit(i) elements ending at i, where lowbit(i) = i & -i.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <vector>

class FenwickTree {
public:
    explicit FenwickTree(const std::vector<int>& values) : tree(values.size() + 1, 0) {
        for (int i = 1; i <= (int)values.size(); i++) update(i, values[i - 1]);
    }

    // @op update
    void update(int i, int delta) {
        while (i < (int)tree.size()) {  // @step loop
            tree[i] += delta;           // @step add
            i += i & -i;                // @step next
        }
    }
    // @endop

    // @op prefix_sum
    long long prefixSum(int i) const {
        long long total = 0;            // @step init
        while (i > 0) {                 // @step loop
            total += tree[i];           // @step add
            i -= i & -i;                // @step next
        }
        return total;                   // @step done
    }
    // @endop

    long long rangeSum(int l, int r) const { return prefixSum(r) - prefixSum(l - 1); }

private:
    std::vector<long long> tree;
};
