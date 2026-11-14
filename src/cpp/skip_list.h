// Skip list: sorted linked lists stacked in levels. Each node is promoted to
// the next level with probability 1/2, giving O(log n) expected search.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <algorithm>
#include <random>
#include <vector>

class SkipList {
public:
    static constexpr int MAX_LEVEL = 4;

    struct Node {
        int key;
        std::vector<Node*> next;
        Node(int k, int level) : key(k), next(level, nullptr) {}
    };

    explicit SkipList(unsigned seed = 1) : rng(seed) {}
    SkipList(const std::vector<int>& keys, unsigned seed = 1) : SkipList(seed) {
        for (int k : keys) insert(k);
    }
    ~SkipList() {
        Node* n = head;
        while (n) {
            Node* next = n->next[0];
            delete n;
            n = next;
        }
    }
    SkipList(const SkipList&) = delete;
    SkipList& operator=(const SkipList&) = delete;

    // @op search
    bool search(int key) const {
        Node* node = head;                                  // @step start
        for (int lvl = level - 1; lvl >= 0; lvl--) {        // @step level
            while (node->next[lvl] != nullptr && node->next[lvl]->key < key) {  // @step check_right
                node = node->next[lvl];                     // @step move_right
            }
        }
        node = node->next[0];                               // @step bottom
        return node != nullptr && node->key == key;         // @step check
    }
    // @endop

    // @op insert
    bool insert(int key) {
        std::vector<Node*> update(MAX_LEVEL, head);         // @step init
        Node* node = head;
        for (int lvl = level - 1; lvl >= 0; lvl--) {        // @step level
            while (node->next[lvl] != nullptr && node->next[lvl]->key < key) {  // @step check_right
                node = node->next[lvl];                     // @step move_right
            }
            update[lvl] = node;                             // @step remember
        }
        if (node->next[0] != nullptr && node->next[0]->key == key) {    // @step check_dup
            return false;                                   // @step duplicate
        }
        int newLevel = randomLevel();                       // @step coin
        level = std::max(level, newLevel);
        Node* fresh = new Node(key, newLevel);              // @step create
        for (int lvl = 0; lvl < newLevel; lvl++) {          // @step link_loop
            fresh->next[lvl] = update[lvl]->next[lvl];      // @step link_next
            update[lvl]->next[lvl] = fresh;                 // @step link_prev
        }
        return true;                                        // @step done
    }
    // @endop

    std::vector<int> toVector() const {
        std::vector<int> out;
        for (Node* n = head->next[0]; n; n = n->next[0]) out.push_back(n->key);
        return out;
    }

private:
    Node* head = new Node(0, MAX_LEVEL);
    int level = 1;
    std::mt19937 rng;

    int randomLevel() {
        int lvl = 1;
        while (lvl < MAX_LEVEL && rng() % 2 == 0) lvl++;
        return lvl;
    }
};
