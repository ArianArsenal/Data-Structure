// Undirected graph stored as adjacency lists, with BFS and DFS.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <algorithm>
#include <queue>
#include <utility>
#include <vector>

class GraphAdjacencyList {
public:
    explicit GraphAdjacencyList(int n, const std::vector<std::pair<int, int>>& edges = {}) : adj(n) {
        for (auto [u, v] : edges) addEdge(u, v);
    }

    // @op add_edge
    bool addEdge(int u, int v) {
        if (std::find(adj[u].begin(), adj[u].end(), v) != adj[u].end()) {  // @step check_exists
            return false;               // @step exists
        }
        adj[u].push_back(v);            // @step add_uv
        adj[v].push_back(u);            // @step add_vu
        return true;                    // @step done
    }
    // @endop

    // @op remove_edge
    bool removeEdge(int u, int v) {
        auto it = std::find(adj[u].begin(), adj[u].end(), v);
        if (it == adj[u].end()) {       // @step check_exists
            return false;               // @step missing
        }
        adj[u].erase(it);                                           // @step remove_uv
        adj[v].erase(std::find(adj[v].begin(), adj[v].end(), u));  // @step remove_vu
        return true;                    // @step done
    }
    // @endop

    // @op bfs
    std::vector<int> bfs(int start) const {
        std::vector<bool> visited(adj.size(), false);   // @step init
        std::vector<int> order;
        std::queue<int> queue;                          // @step enqueue_start
        queue.push(start);
        visited[start] = true;
        while (!queue.empty()) {                        // @step loop
            int u = queue.front();                      // @step dequeue
            queue.pop();
            order.push_back(u);                         // @step visit
            for (int v : adj[u]) {                      // @step neighbors
                if (!visited[v]) {                      // @step check_visited
                    visited[v] = true;                  // @step mark
                    queue.push(v);                      // @step enqueue
                }
            }
        }
        return order;                                   // @step done
    }
    // @endop

    // @op dfs
    std::vector<int> dfs(int start) const {
        std::vector<bool> visited(adj.size(), false);   // @step init
        std::vector<int> order;
        dfs(start, visited, order);                     // @step call
        return order;                                   // @step done
    }

    void dfs(int u, std::vector<bool>& visited, std::vector<int>& order) const {
        visited[u] = true;                              // @step mark
        order.push_back(u);                             // @step visit
        for (int v : adj[u]) {                          // @step neighbors
            if (!visited[v]) {                          // @step check_visited
                dfs(v, visited, order);                 // @step recurse
            }
        }
    }
    // @endop

private:
    std::vector<std::vector<int>> adj;
};
