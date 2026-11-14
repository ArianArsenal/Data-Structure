// Union-find (disjoint set union) with union by rank and path compression.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <numeric>
#include <utility>
#include <vector>

class UnionFind {
public:
    explicit UnionFind(int n) : parent(n), rank(n, 0) {
        std::iota(parent.begin(), parent.end(), 0);
    }

    // @op find
    int find(int x) {
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
    bool unite(int a, int b) {
        int ra = find(a), rb = find(b); // @step find_roots
        if (ra == rb) {                 // @step check_same
            return false;               // @step same
        }
        if (rank[ra] < rank[rb]) {      // @step compare_rank
            std::swap(ra, rb);          // @step swap
        }
        parent[rb] = ra;                // @step attach
        if (rank[ra] == rank[rb]) {     // @step check_tie
            rank[ra]++;                 // @step bump
        }
        return true;                    // @step done
    }
    // @endop

    bool connected(int a, int b) { return find(a) == find(b); }

private:
    std::vector<int> parent;
    std::vector<int> rank;
};
