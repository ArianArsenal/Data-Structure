// Bloom filter: a bit array plus k hash functions. No false negatives,
// but mightContain can return a false positive.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <vector>

class BloomFilter {
public:
    static constexpr int SEEDS[3] = {7, 11, 13};  // hash: (item * seed + seed) % m

    explicit BloomFilter(int m = 16) : bits(m, false) {}
    BloomFilter(const std::vector<int>& items) : BloomFilter() {
        for (int x : items) add(x);
    }

    // @op add
    void add(int item) {
        for (int seed : SEEDS) {                            // @step loop
            int i = (item * seed + seed) % (int)bits.size(); // @step hash
            bits[i] = true;                                 // @step set
        }
    }
    // @endop

    // @op might_contain
    bool mightContain(int item) const {
        for (int seed : SEEDS) {                            // @step loop
            int i = (item * seed + seed) % (int)bits.size(); // @step hash
            if (!bits[i]) {                                 // @step check
                return false;                               // @step definitely_not
            }
        }
        return true;                                        // @step maybe
    }
    // @endop

private:
    std::vector<bool> bits;
};
