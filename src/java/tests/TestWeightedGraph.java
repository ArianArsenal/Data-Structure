public class TestWeightedGraph {
    public static void main(String[] args) {
        int[][] edges = {{0, 1, 7}, {0, 2, 9}, {0, 5, 14}, {1, 2, 10}, {1, 3, 15}, {2, 3, 11}, {2, 5, 2}, {3, 4, 6}, {4, 5, 9}};
        WeightedGraph g = new WeightedGraph(6, edges);
        Check.check(java.util.Arrays.equals(g.dijkstra(0), new int[] {0, 7, 9, 20, 20, 11}), "dijkstra");
        int total = 0;
        for (int[] e : g.kruskal()) total += e[2];
        Check.check(g.kruskal().size() == 5 && total == 33, "kruskal");
        WeightedGraph h = new WeightedGraph(3, new int[][] {{0, 1, 5}});
        Check.check(java.util.Arrays.equals(h.dijkstra(0), new int[] {0, 5, WeightedGraph.INF}), "unreachable");
        Check.finish("WeightedGraph");
    }
}
