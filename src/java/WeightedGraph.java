// Undirected weighted graph with Dijkstra's shortest paths and Kruskal's
// minimum spanning tree.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

public class WeightedGraph {
    public static final int INF = Integer.MAX_VALUE;

    private final List<List<int[]>> adj = new ArrayList<>();   // {neighbor, weight}
    private final List<int[]> edges = new ArrayList<>();       // {weight, u, v}

    public WeightedGraph(int n, int[][] edgeList) {
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edgeList) addEdge(e[0], e[1], e[2]);
    }

    public void addEdge(int u, int v, int w) {
        adj.get(u).add(new int[] {v, w});
        adj.get(v).add(new int[] {u, w});
        edges.add(new int[] {w, u, v});
    }

    // @op dijkstra
    public int[] dijkstra(int start) {
        int[] dist = new int[adj.size()];               // @step init
        Arrays.fill(dist, INF);
        dist[start] = 0;
        PriorityQueue<int[]> heap = new PriorityQueue<>(  // @step push_start
            Comparator.<int[]>comparingInt(a -> a[0]).thenComparingInt(a -> a[1]));
        heap.add(new int[] {0, start});
        while (!heap.isEmpty()) {                       // @step loop
            int[] top = heap.poll();                    // @step pop
            int d = top[0], u = top[1];
            if (d > dist[u]) {                          // @step check_stale
                continue;                               // @step skip
            }
            for (int[] edge : adj.get(u)) {             // @step neighbors
                int v = edge[0], w = edge[1];
                if (d + w < dist[v]) {                  // @step relax_check
                    dist[v] = d + w;                    // @step relax
                    heap.add(new int[] {dist[v], v});   // @step push
                }
            }
        }
        return dist;                                    // @step done
    }
    // @endop

    // @op kruskal
    public List<int[]> kruskal() {
        int[] parent = new int[adj.size()];             // @step init
        for (int i = 0; i < parent.length; i++) parent[i] = i;
        List<int[]> sorted = new ArrayList<>(edges), mst = new ArrayList<>();
        sorted.sort(Comparator.<int[]>comparingInt(e -> e[0]).thenComparingInt(e -> e[1]).thenComparingInt(e -> e[2]));
        for (int[] e : sorted) {                        // @step loop
            int w = e[0], u = e[1], v = e[2];
            int ru = find(parent, u), rv = find(parent, v); // @step find
            if (ru == rv) {                             // @step check_cycle
                continue;                               // @step skip
            }
            parent[ru] = rv;                            // @step union
            mst.add(new int[] {u, v, w});               // @step take
        }
        return mst;                                     // @step done
    }
    // @endop

    private static int find(int[] parent, int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]]; // path halving
            x = parent[x];
        }
        return x;
    }
}
