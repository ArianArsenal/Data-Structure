// Suffix array with LCP array. sa lists the start positions of all suffixes in
// sorted order; lcp[k] is the longest common prefix of suffixes sa[k-1] and sa[k].
// Simple O(n^2 log n) construction, written for clarity.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <algorithm>
#include <numeric>
#include <string>
#include <vector>

class SuffixArray {
public:
    explicit SuffixArray(const std::string& text) : text(text) { build(); }

    // @op build
    void build() {
        int n = (int)text.size();
        sa.assign(n, 0);                                // @step init
        std::iota(sa.begin(), sa.end(), 0);
        std::sort(sa.begin(), sa.end(), [&](int i, int j) {  // @step sort
            return text.compare(i, std::string::npos, text, j, std::string::npos) < 0;
        });
        lcp.assign(n, 0);                               // @step lcp_init
        for (int k = 1; k < n; k++) {                   // @step lcp_loop
            int a = sa[k - 1], b = sa[k];               // @step lcp_pair
            int h = 0;
            while (a + h < n && b + h < n && text[a + h] == text[b + h]) {  // @step lcp_match
                h++;
            }
            lcp[k] = h;                                 // @step lcp_store
        }
    }
    // @endop

    // @op search
    int search(const std::string& pattern) const {
        int lo = 0, hi = (int)sa.size();                // @step init
        while (lo < hi) {                               // @step loop
            int mid = (lo + hi) / 2;                    // @step mid
            if (text.compare(sa[mid], std::string::npos, pattern) < 0) {  // @step compare
                lo = mid + 1;                           // @step go_right
            } else {
                hi = mid;                               // @step go_left
            }
        }
        if (lo < (int)sa.size() && text.compare(sa[lo], pattern.size(), pattern) == 0) {  // @step check
            return sa[lo];                              // @step found
        }
        return -1;                                      // @step not_found
    }
    // @endop

    const std::vector<int>& getSa() const { return sa; }
    const std::vector<int>& getLcp() const { return lcp; }

private:
    std::string text;
    std::vector<int> sa;
    std::vector<int> lcp;
};
