// Undirected graph stored as an adjacency matrix, with BFS and DFS.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public class GraphAdjacencyMatrix {
    private final boolean[][] matrix;

    public GraphAdjacencyMatrix(int n, int[][] edges) {
        matrix = new boolean[n][n];
        for (int[] e : edges) addEdge(e[0], e[1]);
    }

    // @op add_edge
    public boolean addEdge(int u, int v) {
        if (matrix[u][v]) {             // @step check_exists
            return false;               // @step exists
        }
        matrix[u][v] = true;            // @step add_uv
        matrix[v][u] = true;            // @step add_vu
        return true;                    // @step done
    }
    // @endop

    // @op remove_edge
    public boolean removeEdge(int u, int v) {
        if (!matrix[u][v]) {            // @step check_exists
            return false;               // @step missing
        }
        matrix[u][v] = false;           // @step remove_uv
        matrix[v][u] = false;           // @step remove_vu
        return true;                    // @step done
    }
    // @endop

    // @op bfs
    public List<Integer> bfs(int start) {
        int n = matrix.length;
        boolean[] visited = new boolean[n];             // @step init
        List<Integer> order = new ArrayList<>();
        ArrayDeque<Integer> queue = new ArrayDeque<>(); // @step enqueue_start
        queue.add(start);
        visited[start] = true;
        while (!queue.isEmpty()) {                      // @step loop
            int u = queue.poll();                       // @step dequeue
            order.add(u);                               // @step visit
            for (int v = 0; v < n; v++) {               // @step neighbors
                if (matrix[u][v] && !visited[v]) {      // @step check_visited
                    visited[v] = true;                  // @step mark
                    queue.add(v);                       // @step enqueue
                }
            }
        }
        return order;                                   // @step done
    }
    // @endop

    // @op dfs
    public List<Integer> dfs(int start) {
        boolean[] visited = new boolean[matrix.length]; // @step init
        List<Integer> order = new ArrayList<>();
        dfs(start, visited, order);                     // @step call
        return order;                                   // @step done
    }

    private void dfs(int u, boolean[] visited, List<Integer> order) {
        visited[u] = true;                              // @step mark
        order.add(u);                                   // @step visit
        for (int v = 0; v < matrix.length; v++) {       // @step neighbors
            if (matrix[u][v] && !visited[v]) {          // @step check_visited
                dfs(v, visited, order);                 // @step recurse
            }
        }
    }
    // @endop
}
