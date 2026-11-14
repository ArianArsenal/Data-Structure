import java.util.ArrayList;
import java.util.Random;
import java.util.TreeSet;

public class TestSkipList {
    public static void main(String[] args) {
        Random rng = new Random(34);
        SkipList s = new SkipList(7);
        TreeSet<Integer> ref = new TreeSet<>();
        for (int k = 0; k < 500; k++) {
            int key = rng.nextInt(101);
            if (rng.nextBoolean()) Check.check(s.insert(key) == ref.add(key), "insert");
            else Check.check(s.search(key) == ref.contains(key), "search");
        }
        Check.check(s.toList().equals(new ArrayList<>(ref)), "order");
        Check.finish("SkipList");
    }
}
