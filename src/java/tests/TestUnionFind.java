import java.util.Random;

public class TestUnionFind {
    public static void main(String[] args) {
        UnionFind uf = new UnionFind(6);
        Check.check(uf.union(0, 1) && uf.union(2, 3) && !uf.union(1, 0) && uf.union(1, 3), "unions");
        Check.check(uf.connected(0, 2) && !uf.connected(0, 4), "connected");
        Random rng = new Random(33);
        int n = 30;
        UnionFind r = new UnionFind(n);
        int[] comp = new int[n];
        for (int i = 0; i < n; i++) comp[i] = i;
        for (int k = 0; k < 300; k++) {
            int a = rng.nextInt(n), b = rng.nextInt(n);
            Check.check(r.union(a, b) == (comp[a] != comp[b]), "random union");
            int old = comp[b], into = comp[a];
            for (int i = 0; i < n; i++) if (comp[i] == old) comp[i] = into;
            int x = rng.nextInt(n), y = rng.nextInt(n);
            Check.check(r.connected(x, y) == (comp[x] == comp[y]), "random connected");
        }
        Check.finish("UnionFind");
    }
}
