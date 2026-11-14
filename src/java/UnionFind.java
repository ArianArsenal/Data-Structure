// Union-find (disjoint set union) with union by rank and path compression.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
public class UnionFind {
    private final int[] parent;
    private final int[] rank;

    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    // @op find
    public int find(int x) {
        int root = x;                   // @step start
        while (parent[root] != root) {  // @step climb_check
            root = parent[root];        // @step climb
        }
        while (parent[x] != root) {     // @step compress_check
            int nxt = parent[x];        // @step save
            parent[x] = root;           // @step compress
            x = nxt;                    // @step advance
        }
        return root;                    // @step done
    }
    // @endop

    // @op union
    public boolean union(int a, int b) {
        int ra = find(a), rb = find(b); // @step find_roots
        if (ra == rb) {                 // @step check_same
            return false;               // @step same
        }
        if (rank[ra] < rank[rb]) {      // @step compare_rank
            int tmp = ra;               // @step swap
            ra = rb;
            rb = tmp;
        }
        parent[rb] = ra;                // @step attach
        if (rank[ra] == rank[rb]) {     // @step check_tie
            rank[ra]++;                 // @step bump
        }
        return true;                    // @step done
    }
    // @endop

    public boolean connected(int a, int b) {
        return find(a) == find(b);
    }
}
