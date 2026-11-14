import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class TestDynamicArray {
    public static void main(String[] args) {
        DynamicArray a = new DynamicArray();
        for (int i = 0; i < 9; i++) a.append(i);
        Check.check(a.capacity() == 16 && a.size() == 9, "grow");
        for (int i = 8; i >= 5; i--) Check.check(a.pop() == i, "pop");
        Check.check(a.pop() == 4 && a.capacity() == 8, "shrink");
        Random rng = new Random(2);
        DynamicArray b = new DynamicArray();
        List<Integer> ref = new ArrayList<>();
        for (int k = 0; k < 500; k++) {
            if (!ref.isEmpty() && rng.nextInt(100) < 45) {
                Check.check(b.pop() == ref.remove(ref.size() - 1), "random pop");
            } else {
                int v = rng.nextInt(100);
                b.append(v);
                ref.add(v);
            }
            Check.check(b.size() == ref.size() && b.capacity() >= b.size(), "sizes");
            for (int i = 0; i < ref.size(); i++) Check.check(b.get(i) == ref.get(i), "content");
        }
        Check.finish("DynamicArray");
    }
}
