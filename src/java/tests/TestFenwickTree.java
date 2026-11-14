import java.util.Random;

public class TestFenwickTree {
    public static void main(String[] args) {
        Random rng = new Random(32);
        int[] a = new int[17];
        for (int i = 0; i < a.length; i++) a[i] = rng.nextInt(19) - 9;
        FenwickTree ft = new FenwickTree(a.clone());
        for (int k = 0; k < 500; k++) {
            if (rng.nextInt(10) < 4) {
                int i = 1 + rng.nextInt(a.length), d = rng.nextInt(11) - 5;
                ft.update(i, d);
                a[i - 1] += d;
            } else {
                int i = rng.nextInt(a.length + 1);
                long sum = 0;
                for (int j = 0; j < i; j++) sum += a[j];
                Check.check(ft.prefixSum(i) == sum, "prefix " + i);
            }
        }
        Check.finish("FenwickTree");
    }
}
