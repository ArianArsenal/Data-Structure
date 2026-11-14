"""Trie (prefix tree) over lowercase words. Each edge is one character; a node
marked is_end completes a word.

`# @step` / `# @op` markers drive the visualizer; see tools/build_code.js.
"""


class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False


class Trie:
    def __init__(self, words=()):
        self.root = TrieNode()
        for w in words:
            self.insert(w)

    # @op insert
    def insert(self, word):
        node = self.root  # @step start
        for ch in word:  # @step loop
            if ch not in node.children:  # @step check_child
                node.children[ch] = TrieNode()  # @step create
            node = node.children[ch]  # @step descend
        node.is_end = True  # @step mark_end
    # @endop

    # @op search
    def search(self, word):
        node = self.root  # @step start
        for ch in word:  # @step loop
            if ch not in node.children:  # @step check_child
                return False  # @step missing
            node = node.children[ch]  # @step descend
        return node.is_end  # @step check_end
    # @endop

    # @op starts_with
    def starts_with(self, prefix):
        node = self.root  # @step start
        for ch in prefix:  # @step loop
            if ch not in node.children:  # @step check_child
                return False  # @step missing
            node = node.children[ch]  # @step descend
        return True  # @step done
    # @endop
