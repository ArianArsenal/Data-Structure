// Undirected graph stored as an adjacency matrix, with BFS and DFS.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <queue>
#include <utility>
#include <vector>

class GraphAdjacencyMatrix {
public:
    explicit GraphAdjacencyMatrix(int n, const std::vector<std::pair<int, int>>& edges = {})
        : matrix(n, std::vector<bool>(n, false)) {
        for (auto [u, v] : edges) addEdge(u, v);
    }

    // @op add_edge
    bool addEdge(int u, int v) {
        if (matrix[u][v]) {             // @step check_exists
            return false;               // @step exists
        }
        matrix[u][v] = true;            // @step add_uv
        matrix[v][u] = true;            // @step add_vu
        return true;                    // @step done
    }
    // @endop

    // @op remove_edge
    bool removeEdge(int u, int v) {
        if (!matrix[u][v]) {            // @step check_exists
            return false;               // @step missing
        }
        matrix[u][v] = false;           // @step remove_uv
        matrix[v][u] = false;           // @step remove_vu
        return true;                    // @step done
    }
    // @endop

    // @op bfs
    std::vector<int> bfs(int start) const {
        int n = (int)matrix.size();
        std::vector<bool> visited(n, false);            // @step init
        std::vector<int> order;
        std::queue<int> queue;                          // @step enqueue_start
        queue.push(start);
        visited[start] = true;
        while (!queue.empty()) {                        // @step loop
            int u = queue.front();                      // @step dequeue
            queue.pop();
            order.push_back(u);                         // @step visit
            for (int v = 0; v < n; v++) {               // @step neighbors
                if (matrix[u][v] && !visited[v]) {      // @step check_visited
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
        std::vector<bool> visited(matrix.size(), false);    // @step init
        std::vector<int> order;
        dfs(start, visited, order);                         // @step call
        return order;                                       // @step done
    }

    void dfs(int u, std::vector<bool>& visited, std::vector<int>& order) const {
        visited[u] = true;                              // @step mark
        order.push_back(u);                             // @step visit
        for (int v = 0; v < (int)matrix.size(); v++) {  // @step neighbors
            if (matrix[u][v] && !visited[v]) {          // @step check_visited
                dfs(v, visited, order);                 // @step recurse
            }
        }
    }
    // @endop

private:
    std::vector<std::vector<bool>> matrix;
};
