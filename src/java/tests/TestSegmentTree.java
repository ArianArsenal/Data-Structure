import java.util.Random;

public class TestSegmentTree {
    public static void main(String[] args) {
        Random rng = new Random(31);
        int[] a = new int[13];
        for (int i = 0; i < a.length; i++) a[i] = rng.nextInt(19) - 9;
        SegmentTree st = new SegmentTree(a.clone());
        for (int k = 0; k < 500; k++) {
            if (rng.nextInt(10) < 4) {
                int i = rng.nextInt(a.length), v = rng.nextInt(19) - 9;
                st.update(i, v);
                a[i] = v;
            } else {
                int l = rng.nextInt(a.length), r = l + rng.nextInt(a.length - l);
                long sum = 0;
                for (int i = l; i <= r; i++) sum += a[i];
                Check.check(st.query(l, r) == sum, "query " + l + ".." + r);
            }
        }
        Check.finish("SegmentTree");
    }
}
