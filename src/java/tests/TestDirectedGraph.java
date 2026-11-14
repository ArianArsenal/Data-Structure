import java.util.Arrays;

public class TestDirectedGraph {
    public static void main(String[] args) {
        DirectedGraph g = new DirectedGraph(6, new int[][] {{5, 2}, {5, 0}, {4, 0}, {4, 1}, {2, 3}, {3, 1}});
        Check.check(Arrays.asList(4, 5, 2, 0, 3, 1).equals(g.topologicalSort()), "topological order");
        Check.check(!g.hasCycle(), "acyclic");
        g.addEdge(1, 5);
        Check.check(g.topologicalSort() == null && g.hasCycle(), "cycle");
        Check.finish("DirectedGraph");
    }
}
