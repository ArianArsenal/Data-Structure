#include "../directed_graph.h"

#include "check.h"

int main() {
    DirectedGraph g(6, {{5, 2}, {5, 0}, {4, 0}, {4, 1}, {2, 3}, {3, 1}});
    auto order = g.topologicalSort();
    CHECK(order && *order == std::vector<int>({4, 5, 2, 0, 3, 1}));
    CHECK(!g.hasCycle());
    g.addEdge(1, 5);
    CHECK(!g.topologicalSort() && g.hasCycle());
    return finish("directed_graph");
}
