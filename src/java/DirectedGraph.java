// Directed graph with topological sort (Kahn's algorithm) and cycle detection
// (depth-first search with three colors).
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public class DirectedGraph {
    private static final int UNVISITED = 0, ON_STACK = 1, DONE = 2;

    private final List<List<Integer>> adj = new ArrayList<>();

    public DirectedGraph(int n, int[][] edges) {
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) adj.get(e[0]).add(e[1]);
    }

    // @op add_edge
    public void addEdge(int u, int v) {
        adj.get(u).add(v);                              // @step append
    }
    // @endop

    // @op topological_sort
    public List<Integer> topologicalSort() {
        int n = adj.size();
        int[] indegree = new int[n];                    // @step init
        for (int u = 0; u < n; u++) {                   // @step count
            for (int v : adj.get(u)) indegree[v]++;
        }
        ArrayDeque<Integer> queue = new ArrayDeque<>(); // @step sources
        for (int u = 0; u < n; u++) {
            if (indegree[u] == 0) queue.add(u);
        }
        List<Integer> order = new ArrayList<>();
        while (!queue.isEmpty()) {                      // @step loop
            int u = queue.poll();                       // @step dequeue
            order.add(u);                               // @step emit
            for (int v : adj.get(u)) {                  // @step neighbors
                indegree[v]--;                          // @step decrement
                if (indegree[v] == 0) {                 // @step check_zero
                    queue.add(v);                       // @step enqueue
                }
            }
        }
        if (order.size() < n) {                         // @step check_cycle
            return null;                                // @step cycle
        }
        return order;                                   // @step done
    }
    // @endop

    // @op has_cycle
    public boolean hasCycle() {
        int[] state = new int[adj.size()];                  // @step init
        for (int u = 0; u < adj.size(); u++) {              // @step loop
            if (state[u] == UNVISITED && visit(u, state)) { // @step check
                return true;                                // @step found
            }
        }
        return false;                                       // @step none
    }

    private boolean visit(int u, int[] state) {
        state[u] = ON_STACK;                                // @step enter
        for (int v : adj.get(u)) {                          // @step neighbors
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
}
