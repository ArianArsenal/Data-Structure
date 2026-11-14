// Undirected graph stored as adjacency lists, with BFS and DFS.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public class GraphAdjacencyList {
    private final List<List<Integer>> adj = new ArrayList<>();

    public GraphAdjacencyList(int n, int[][] edges) {
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) addEdge(e[0], e[1]);
    }

    // @op add_edge
    public boolean addEdge(int u, int v) {
        if (adj.get(u).contains(v)) {   // @step check_exists
            return false;               // @step exists
        }
        adj.get(u).add(v);              // @step add_uv
        adj.get(v).add(u);              // @step add_vu
        return true;                    // @step done
    }
    // @endop

    // @op remove_edge
    public boolean removeEdge(int u, int v) {
        if (!adj.get(u).contains(v)) {  // @step check_exists
            return false;               // @step missing
        }
        adj.get(u).remove(Integer.valueOf(v));  // @step remove_uv
        adj.get(v).remove(Integer.valueOf(u));  // @step remove_vu
        return true;                    // @step done
    }
    // @endop

    // @op bfs
    public List<Integer> bfs(int start) {
        boolean[] visited = new boolean[adj.size()];    // @step init
        List<Integer> order = new ArrayList<>();
        ArrayDeque<Integer> queue = new ArrayDeque<>(); // @step enqueue_start
        queue.add(start);
        visited[start] = true;
        while (!queue.isEmpty()) {                      // @step loop
            int u = queue.poll();                       // @step dequeue
            order.add(u);                               // @step visit
            for (int v : adj.get(u)) {                  // @step neighbors
                if (!visited[v]) {                      // @step check_visited
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
        boolean[] visited = new boolean[adj.size()];    // @step init
        List<Integer> order = new ArrayList<>();
        dfs(start, visited, order);                     // @step call
        return order;                                   // @step done
    }

    private void dfs(int u, boolean[] visited, List<Integer> order) {
        visited[u] = true;                              // @step mark
        order.add(u);                                   // @step visit
        for (int v : adj.get(u)) {                      // @step neighbors
            if (!visited[v]) {                          // @step check_visited
                dfs(v, visited, order);                 // @step recurse
            }
        }
    }
    // @endop
}
