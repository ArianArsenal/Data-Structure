import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Random;

public class TestLRUCache {
    public static void main(String[] args) {
        LRUCache c = new LRUCache(2);
        c.put(1, 10);
        c.put(2, 20);
        Check.check(c.get(1) == 10, "hit");
        c.put(3, 30);
        Check.check(c.get(2) == -1, "evicted");
        Check.check(c.keysByRecency().equals(Arrays.asList(3, 1)), "order");
        Random rng = new Random(14);
        LRUCache r = new LRUCache(3);
        LinkedHashMap<Integer, Integer> ref = new LinkedHashMap<>(16, 0.75f, true);
        for (int i = 0; i < 1000; i++) {
            int k = rng.nextInt(7);
            if (rng.nextBoolean()) {
                int v = rng.nextInt(100);
                r.put(k, v);
                if (!ref.containsKey(k) && ref.size() == 3) ref.remove(ref.keySet().iterator().next());
                ref.put(k, v);
            } else {
                Integer expect = ref.get(k);
                Check.check(r.get(k) == (expect == null ? -1 : expect), "random get");
            }
            List<Integer> keys = new ArrayList<>(ref.keySet());
            Collections.reverse(keys);
            Check.check(r.keysByRecency().equals(keys), "order");
        }
        Check.finish("LRUCache");
    }
}
