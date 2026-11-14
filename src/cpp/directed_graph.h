// Directed graph with topological sort (Kahn's algorithm) and cycle detection
// (depth-first search with three colors).
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <optional>
#include <queue>
#include <utility>
#include <vector>

class DirectedGraph {
public:
    enum State { UNVISITED, ON_STACK, DONE };

    explicit DirectedGraph(int n, const std::vector<std::pair<int, int>>& edges = {}) : adj(n) {
        for (auto [u, v] : edges) adj[u].push_back(v);
    }

    // @op add_edge
    void addEdge(int u, int v) {
        adj[u].push_back(v);                            // @step append
    }
    // @endop

    // @op topological_sort
    std::optional<std::vector<int>> topologicalSort() const {
        int n = (int)adj.size();
        std::vector<int> indegree(n, 0);                // @step init
        for (int u = 0; u < n; u++) {                   // @step count
            for (int v : adj[u]) indegree[v]++;
        }
        std::queue<int> queue;                          // @step sources
        for (int u = 0; u < n; u++) {
            if (indegree[u] == 0) queue.push(u);
        }
        std::vector<int> order;
        while (!queue.empty()) {                        // @step loop
            int u = queue.front();                      // @step dequeue
            queue.pop();
            order.push_back(u);                         // @step emit
            for (int v : adj[u]) {                      // @step neighbors
                indegree[v]--;                          // @step decrement
                if (indegree[v] == 0) {                 // @step check_zero
                    queue.push(v);                      // @step enqueue
                }
            }
        }
        if ((int)order.size() < n) {                    // @step check_cycle
            return std::nullopt;                        // @step cycle
        }
        return order;                                   // @step done
    }
    // @endop

    // @op has_cycle
    bool hasCycle() const {
        std::vector<State> state(adj.size(), UNVISITED);    // @step init
        for (int u = 0; u < (int)adj.size(); u++) {         // @step loop
            if (state[u] == UNVISITED && visit(u, state)) { // @step check
                return true;                                // @step found
            }
        }
        return false;                                       // @step none
    }

    bool visit(int u, std::vector<State>& state) const {
        state[u] = ON_STACK;                                // @step enter
        for (int v : adj[u]) {                              // @step neighbors
            if (state[v] == ON_STACK) {                     // @step back_edge
                return true;                                // @step cycle
            }
            if (state[v] == UNVISITED && visit(v, state)) { // @step recurse
                return true;                                // @step propagate
            }
        }
        state[u] = DONE;                                    // @step leave
        return false;
    }
    // @endop

private:
    std::vector<std::vector<int>> adj;
};
