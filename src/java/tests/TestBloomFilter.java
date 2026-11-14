public class TestBloomFilter {
    public static void main(String[] args) {
        int[] items = {3, 10, 42, 777, 5};
        BloomFilter b = new BloomFilter(items);
        for (int x : items) Check.check(b.mightContain(x), "no false negative " + x);
        Check.check(!new BloomFilter(3).mightContain(5), "definitely not");
        Check.finish("BloomFilter");
    }
}
