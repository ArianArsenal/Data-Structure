#include "../graph_adjacency_list.h"

#include "check.h"

using V = std::vector<int>;

int main() {
    GraphAdjacencyList g(6, {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}});
    CHECK(g.bfs(0) == V({0, 1, 2, 3, 4, 5}));
    CHECK(g.dfs(0) == V({0, 1, 3, 2, 4, 5}));
    CHECK(g.bfs(5) == V({5, 4, 3, 1, 2, 0}));
    CHECK(!g.addEdge(0, 1) && g.addEdge(1, 4));
    CHECK(g.removeEdge(3, 4) && !g.removeEdge(3, 4) && g.removeEdge(1, 4));
    CHECK(g.bfs(5) == V({5, 4}));
    return finish("graph_adjacency_list");
}
