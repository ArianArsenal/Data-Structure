// Fenwick tree (binary indexed tree) for prefix sums. 1-indexed: tree[i]
// stores the sum of the lowbit(i) elements ending at i, where lowbit(i) = i & -i.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
public class FenwickTree {
    private final long[] tree;

    public FenwickTree(int... values) {
        tree = new long[values.length + 1];
        for (int i = 1; i <= values.length; i++) update(i, values[i - 1]);
    }

    // @op update
    public void update(int i, int delta) {
        while (i < tree.length) {       // @step loop
            tree[i] += delta;           // @step add
            i += i & -i;                // @step next
        }
    }
    // @endop

    // @op prefix_sum
    public long prefixSum(int i) {
        long total = 0;                 // @step init
        while (i > 0) {                 // @step loop
            total += tree[i];           // @step add
            i -= i & -i;                // @step next
        }
        return total;                   // @step done
    }
    // @endop

    public long rangeSum(int l, int r) {
        return prefixSum(r) - prefixSum(l - 1);
    }
}
