import java.util.Arrays;

public class TestSuffixArray {
    public static void main(String[] args) {
        SuffixArray s = new SuffixArray("banana");
        Check.check(Arrays.equals(s.getSa(), new int[] {5, 3, 1, 0, 4, 2}), "sa");
        Check.check(Arrays.equals(s.getLcp(), new int[] {0, 1, 3, 0, 0, 2}), "lcp");
        int pos = s.search("ana");
        Check.check(pos == 1 || pos == 3, "search ana");
        Check.check(s.search("nab") == -1 && s.search("b") == 0 && s.search("bananas") == -1, "search misc");
        Check.finish("SuffixArray");
    }
}
