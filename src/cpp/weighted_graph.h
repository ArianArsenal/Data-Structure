// Undirected weighted graph with Dijkstra's shortest paths and Kruskal's
// minimum spanning tree.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <algorithm>
#include <climits>
#include <functional>
#include <numeric>
#include <queue>
#include <tuple>
#include <utility>
#include <vector>

class WeightedGraph {
public:
    static constexpr int INF = INT_MAX;

    explicit WeightedGraph(int n, const std::vector<std::tuple<int, int, int>>& edges = {}) : adj(n) {
        for (auto [u, v, w] : edges) addEdge(u, v, w);
    }

    void addEdge(int u, int v, int w) {
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
        edges.push_back({w, u, v});
    }

    // @op dijkstra
    std::vector<int> dijkstra(int start) const {
        std::vector<int> dist(adj.size(), INF);         // @step init
        dist[start] = 0;
        using Item = std::pair<int, int>;               // (distance, vertex)
        std::priority_queue<Item, std::vector<Item>, std::greater<Item>> heap;  // @step push_start
        heap.push({0, start});
        while (!heap.empty()) {                         // @step loop
            auto [d, u] = heap.top();                   // @step pop
            heap.pop();
            if (d > dist[u]) {                          // @step check_stale
                continue;                               // @step skip
            }
            for (auto [v, w] : adj[u]) {                // @step neighbors
                if (d + w < dist[v]) {                  // @step relax_check
                    dist[v] = d + w;                    // @step relax
                    heap.push({dist[v], v});            // @step push
                }
            }
        }
        return dist;                                    // @step done
    }
    // @endop

    // @op kruskal
    std::vector<std::tuple<int, int, int>> kruskal() const {
        std::vector<int> parent(adj.size());            // @step init
        std::iota(parent.begin(), parent.end(), 0);
        std::function<int(int)> find = [&](int x) {
            while (parent[x] != x) {
                parent[x] = parent[parent[x]];          // path halving
                x = parent[x];
            }
            return x;
        };
        std::vector<std::tuple<int, int, int>> sorted = edges, mst;
        std::sort(sorted.begin(), sorted.end());
        for (auto [w, u, v] : sorted) {                 // @step loop
            int ru = find(u), rv = find(v);             // @step find
            if (ru == rv) {                             // @step check_cycle
                continue;                               // @step skip
            }
            parent[ru] = rv;                            // @step union
            mst.push_back({u, v, w});                   // @step take
        }
        return mst;                                     // @step done
    }
    // @endop

private:
    std::vector<std::vector<std::pair<int, int>>> adj;  // (neighbor, weight)
    std::vector<std::tuple<int, int, int>> edges;       // (weight, u, v)
};
