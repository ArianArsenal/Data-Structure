// Suffix array with LCP array. sa lists the start positions of all suffixes in
// sorted order; lcp[k] is the longest common prefix of suffixes sa[k-1] and sa[k].
// Simple O(n^2 log n) construction, written for clarity.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.Arrays;

public class SuffixArray {
    private final String text;
    private int[] sa;
    private int[] lcp;

    public SuffixArray(String text) {
        this.text = text;
        build();
    }

    // @op build
    public void build() {
        int n = text.length();
        Integer[] order = new Integer[n];               // @step init
        for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, (i, j) -> text.substring(i).compareTo(text.substring(j)));  // @step sort
        sa = Arrays.stream(order).mapToInt(Integer::intValue).toArray();
        lcp = new int[n];                               // @step lcp_init
        for (int k = 1; k < n; k++) {                   // @step lcp_loop
            int a = sa[k - 1], b = sa[k];               // @step lcp_pair
            int h = 0;
            while (a + h < n && b + h < n && text.charAt(a + h) == text.charAt(b + h)) {  // @step lcp_match
                h++;
            }
            lcp[k] = h;                                 // @step lcp_store
        }
    }
    // @endop

    // @op search
    public int search(String pattern) {
        int lo = 0, hi = sa.length;                     // @step init
        while (lo < hi) {                               // @step loop
            int mid = (lo + hi) / 2;                    // @step mid
            if (text.substring(sa[mid]).compareTo(pattern) < 0) {  // @step compare
                lo = mid + 1;                           // @step go_right
            } else {
                hi = mid;                               // @step go_left
            }
        }
        if (lo < sa.length && text.startsWith(pattern, sa[lo])) {  // @step check
            return sa[lo];                              // @step found
        }
        return -1;                                      // @step not_found
    }
    // @endop

    public int[] getSa() {
        return sa;
    }

    public int[] getLcp() {
        return lcp;
    }
}
