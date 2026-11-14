#include "../weighted_graph.h"

#include "check.h"

int main() {
    WeightedGraph g(6, {{0, 1, 7}, {0, 2, 9}, {0, 5, 14}, {1, 2, 10}, {1, 3, 15}, {2, 3, 11}, {2, 5, 2}, {3, 4, 6}, {4, 5, 9}});
    CHECK(g.dijkstra(0) == std::vector<int>({0, 7, 9, 20, 20, 11}));
    auto mst = g.kruskal();
    int total = 0;
    for (auto [u, v, w] : mst) total += w;
    CHECK(mst.size() == 5 && total == 33);
    WeightedGraph h(3, {{0, 1, 5}});
    CHECK(h.dijkstra(0) == std::vector<int>({0, 5, WeightedGraph::INF}));
    return finish("weighted_graph");
}
