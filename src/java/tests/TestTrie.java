public class TestTrie {
    public static void main(String[] args) {
        Trie t = new Trie("car", "cart", "cat", "dog", "do");
        Check.check(t.search("car") && t.search("do") && !t.search("ca"), "search");
        Check.check(t.startsWith("ca") && !t.startsWith("cow") && !t.search("carts"), "prefix");
        t.insert("ca");
        Check.check(t.search("ca"), "insert prefix word");
        Check.finish("Trie");
    }
}
