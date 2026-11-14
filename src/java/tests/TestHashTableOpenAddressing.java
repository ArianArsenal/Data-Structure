import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

public class TestHashTableOpenAddressing {
    public static void main(String[] args) {
        HashTableOpenAddressing h = new HashTableOpenAddressing();
        h.put(22, 1); h.put(33, 2); h.put(44, 3);
        Check.check(h.remove(33) && h.get(44) == 3, "probe past tombstone");
        h.put(55, 4);
        Check.check(h.get(55) == 4, "reuse tombstone");
        HashTableOpenAddressing full = new HashTableOpenAddressing();
        for (int i = 0; i < 11; i++) full.put(i, i);
        boolean threw = false;
        try { full.put(11, 0); } catch (IllegalStateException e) { threw = true; }
        Check.check(threw && full.get(11) == null, "full");
        Random rng = new Random(12);
        HashTableOpenAddressing r = new HashTableOpenAddressing();
        Map<Integer, Integer> ref = new HashMap<>();
        for (int i = 0; i < 2000; i++) {
            int k = rng.nextInt(41), op = rng.nextInt(20);
            if (op < 9 && (ref.size() < 11 || ref.containsKey(k))) { int v = rng.nextInt(1000); r.put(k, v); ref.put(k, v); }
            else if (op < 15) Check.check(r.remove(k) == (ref.remove(k) != null), "random remove");
            else Check.check(Objects.equals(r.get(k), ref.get(k)), "random get");
            Check.check(r.size() == ref.size(), "size");
        }
        Check.finish("HashTableOpenAddressing");
    }
}
