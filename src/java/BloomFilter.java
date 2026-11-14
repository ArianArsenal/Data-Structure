// Bloom filter: a bit array plus k hash functions. No false negatives,
// but mightContain can return a false positive.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
public class BloomFilter {
    private static final int[] SEEDS = {7, 11, 13}; // hash: (item * seed + seed) % m

    private final boolean[] bits;

    public BloomFilter(int... items) {
        bits = new boolean[16];
        for (int x : items) add(x);
    }

    // @op add
    public void add(int item) {
        for (int seed : SEEDS) {                            // @step loop
            int i = (item * seed + seed) % bits.length;     // @step hash
            bits[i] = true;                                 // @step set
        }
    }
    // @endop

    // @op might_contain
    public boolean mightContain(int item) {
        for (int seed : SEEDS) {                            // @step loop
            int i = (item * seed + seed) % bits.length;     // @step hash
            if (!bits[i]) {                                 // @step check
                return false;                               // @step definitely_not
            }
        }
        return true;                                        // @step maybe
    }
    // @endop
}
