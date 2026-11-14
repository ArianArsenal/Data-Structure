import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class TestStaticArray {
    public static void main(String[] args) {
        StaticArray a = new StaticArray(1, 2, 3);
        a.insert(1, 9);
        Check.check(java.util.Arrays.equals(a.toArray(), new int[] {1, 9, 2, 3}), "insert");
        Check.check(a.delete(0) == 1, "delete");
        Check.check(a.search(3) == 2 && a.search(7) == -1, "search");
        boolean threw = false;
        try { new StaticArray(0, 1, 2, 3, 4, 5, 6, 7).insert(0, 1); } catch (IllegalStateException e) { threw = true; }
        Check.check(threw, "full");
        Random rng = new Random(1);
        StaticArray b = new StaticArray();
        List<Integer> ref = new ArrayList<>();
        for (int k = 0; k < 300; k++) {
            if (!ref.isEmpty() && (ref.size() == 8 || rng.nextBoolean())) {
                int i = rng.nextInt(ref.size());
                Check.check(b.delete(i) == ref.remove(i), "random delete");
            } else {
                int i = rng.nextInt(ref.size() + 1), v = rng.nextInt(50);
                b.insert(i, v);
                ref.add(i, v);
            }
            Check.check(java.util.Arrays.equals(b.toArray(), ref.stream().mapToInt(x -> x).toArray()), "random state");
        }
        Check.finish("StaticArray");
    }
}
