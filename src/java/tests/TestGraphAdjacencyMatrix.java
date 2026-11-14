import java.util.Arrays;

public class TestGraphAdjacencyMatrix {
    public static void main(String[] args) {
        int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}};
        GraphAdjacencyMatrix g = new GraphAdjacencyMatrix(6, edges);
        Check.check(g.bfs(0).equals(Arrays.asList(0, 1, 2, 3, 4, 5)), "bfs");
        Check.check(g.dfs(0).equals(Arrays.asList(0, 1, 3, 2, 4, 5)), "dfs");
        Check.check(g.bfs(5).equals(Arrays.asList(5, 4, 3, 1, 2, 0)), "bfs from 5");
        Check.check(!g.addEdge(0, 1) && g.addEdge(1, 4), "add");
        Check.check(g.removeEdge(3, 4) && !g.removeEdge(3, 4) && g.removeEdge(1, 4), "remove");
        Check.check(g.bfs(5).equals(Arrays.asList(5, 4)), "component");
        Check.finish("GraphAdjacencyMatrix");
    }
}
