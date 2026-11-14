import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

public class TestHashTableChaining {
    public static void main(String[] args) {
        HashTableChaining h = new HashTableChaining();
        h.put(10, 1); h.put(3, 2); h.put(17, 3);
        h.put(3, 9);
        Check.check(h.get(3) == 9 && h.size() == 3, "update");
        Check.check(h.remove(17) && !h.remove(17) && h.get(17) == null, "remove");
        Random rng = new Random(11);
        HashTableChaining r = new HashTableChaining();
        Map<Integer, Integer> ref = new HashMap<>();
        for (int i = 0; i < 1000; i++) {
            int k = rng.nextInt(41), op = rng.nextInt(4);
            if (op < 2) { int v = rng.nextInt(1000); r.put(k, v); ref.put(k, v); }
            else if (op == 2) Check.check(r.remove(k) == (ref.remove(k) != null), "random remove");
            else Check.check(Objects.equals(r.get(k), ref.get(k)), "random get");
            Check.check(r.size() == ref.size(), "size");
        }
        Check.finish("HashTableChaining");
    }
}
