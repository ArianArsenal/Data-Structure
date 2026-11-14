// Trie (prefix tree) over lowercase words. Each edge is one character; a node
// marked isEnd completes a word.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.Map;
import java.util.TreeMap;

public class Trie {
    static class TrieNode {
        Map<Character, TrieNode> children = new TreeMap<>();
        boolean isEnd;
    }

    private final TrieNode root = new TrieNode();

    public Trie(String... words) {
        for (String w : words) insert(w);
    }

    // @op insert
    public void insert(String word) {
        TrieNode node = root;                           // @step start
        for (char ch : word.toCharArray()) {            // @step loop
            if (!node.children.containsKey(ch)) {       // @step check_child
                node.children.put(ch, new TrieNode());  // @step create
            }
            node = node.children.get(ch);               // @step descend
        }
        node.isEnd = true;                              // @step mark_end
    }
    // @endop

    // @op search
    public boolean search(String word) {
        TrieNode node = root;                           // @step start
        for (char ch : word.toCharArray()) {            // @step loop
            if (!node.children.containsKey(ch)) {       // @step check_child
                return false;                           // @step missing
            }
            node = node.children.get(ch);               // @step descend
        }
        return node.isEnd;                              // @step check_end
    }
    // @endop

    // @op starts_with
    public boolean startsWith(String prefix) {
        TrieNode node = root;                           // @step start
        for (char ch : prefix.toCharArray()) {          // @step loop
            if (!node.children.containsKey(ch)) {       // @step check_child
                return false;                           // @step missing
            }
            node = node.children.get(ch);               // @step descend
        }
        return true;                                    // @step done
    }
    // @endop
}
