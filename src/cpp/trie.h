// Trie (prefix tree) over lowercase words. Each edge is one character; a node
// marked isEnd completes a word.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <map>
#include <string>
#include <vector>

class Trie {
public:
    struct TrieNode {
        std::map<char, TrieNode*> children;
        bool isEnd = false;
    };

    Trie() = default;
    explicit Trie(const std::vector<std::string>& words) {
        for (const auto& w : words) insert(w);
    }
    ~Trie() { destroy(root); }
    Trie(const Trie&) = delete;
    Trie& operator=(const Trie&) = delete;

    // @op insert
    void insert(const std::string& word) {
        TrieNode* node = root;                      // @step start
        for (char ch : word) {                      // @step loop
            if (node->children.count(ch) == 0) {    // @step check_child
                node->children[ch] = new TrieNode(); // @step create
            }
            node = node->children[ch];              // @step descend
        }
        node->isEnd = true;                         // @step mark_end
    }
    // @endop

    // @op search
    bool search(const std::string& word) const {
        TrieNode* node = root;                      // @step start
        for (char ch : word) {                      // @step loop
            if (node->children.count(ch) == 0) {    // @step check_child
                return false;                       // @step missing
            }
            node = node->children.at(ch);           // @step descend
        }
        return node->isEnd;                         // @step check_end
    }
    // @endop

    // @op starts_with
    bool startsWith(const std::string& prefix) const {
        TrieNode* node = root;                      // @step start
        for (char ch : prefix) {                    // @step loop
            if (node->children.count(ch) == 0) {    // @step check_child
                return false;                       // @step missing
            }
            node = node->children.at(ch);           // @step descend
        }
        return true;                                // @step done
    }
    // @endop

private:
    TrieNode* root = new TrieNode();

    static void destroy(TrieNode* n) {
        for (auto& [ch, child] : n->children) destroy(child);
        delete n;
    }
};
