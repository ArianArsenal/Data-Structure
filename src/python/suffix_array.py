"""Suffix array with LCP array. sa lists the start positions of all suffixes in
sorted order; lcp[k] is the longest common prefix of suffixes sa[k-1] and sa[k].

Simple O(n^2 log n) construction, written for clarity.
`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class SuffixArray:
    def __init__(self, text):
        self.text = text
        self.sa = []
        self.lcp = []
        self.build()

    # @op build
    def build(self):
        n = len(self.text)
        self.sa = list(range(n))  # @step init
        self.sa.sort(key=lambda i: self.text[i:])  # @step sort
        self.lcp = [0] * n  # @step lcp_init
        for k in range(1, n):  # @step lcp_loop
            a, b = self.sa[k - 1], self.sa[k]  # @step lcp_pair
            h = 0
            while a + h < n and b + h < n and self.text[a + h] == self.text[b + h]:  # @step lcp_match
                h += 1
            self.lcp[k] = h  # @step lcp_store
    # @endop

    # @op search
    def search(self, pattern):
        lo, hi = 0, len(self.sa)  # @step init
        while lo < hi:  # @step loop
            mid = (lo + hi) // 2  # @step mid
            if self.text[self.sa[mid]:] < pattern:  # @step compare
                lo = mid + 1  # @step go_right
            else:
                hi = mid  # @step go_left
        if lo < len(self.sa) and self.text.startswith(pattern, self.sa[lo]):  # @step check
            return self.sa[lo]  # @step found
        return -1  # @step not_found
    # @endop
