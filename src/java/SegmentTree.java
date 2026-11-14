// Segment tree for range sums with point updates. Node 1 covers the whole
// array; node k's children are 2k and 2k+1, each covering one half.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
public class SegmentTree {
    private final int n;
    private final long[] tree;

    public SegmentTree(int... values) {
        n = values.length;
        tree = new long[4 * Math.max(1, n)];
        if (n > 0) build(values, 1, 0, n - 1);
    }

    private void build(int[] values, int node, int lo, int hi) {
        if (lo == hi) {
            tree[node] = values[lo];
            return;
        }
        int mid = (lo + hi) / 2;
        build(values, 2 * node, lo, mid);
        build(values, 2 * node + 1, mid + 1, hi);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    // @op query
    public long query(int l, int r) {
        return query(1, 0, n - 1, l, r);    // @step call_root
    }

    private long query(int node, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) {         // @step check_disjoint
            return 0;                   // @step disjoint
        }
        if (l <= lo && hi <= r) {       // @step check_inside
            return tree[node];          // @step inside
        }
        int mid = (lo + hi) / 2;                            // @step split
        long left = query(2 * node, lo, mid, l, r);         // @step go_left
        long right = query(2 * node + 1, mid + 1, hi, l, r); // @step go_right
        return left + right;                                // @step combine
    }
    // @endop

    // @op update
    public void update(int i, int value) {
        update(1, 0, n - 1, i, value);  // @step call_root
    }

    private void update(int node, int lo, int hi, int i, int value) {
        if (lo == hi) {                 // @step check_leaf
            tree[node] = value;         // @step set_leaf
            return;
        }
        int mid = (lo + hi) / 2;        // @step split
        if (i <= mid) {                 // @step pick_side
            update(2 * node, lo, mid, i, value);            // @step go_left
        } else {
            update(2 * node + 1, mid + 1, hi, i, value);    // @step go_right
        }
        tree[node] = tree[2 * node] + tree[2 * node + 1];   // @step pull_up
    }
    // @endop
}
