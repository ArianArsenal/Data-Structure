// LRU cache: a hash map for O(1) lookup plus a doubly linked list ordered by
// recency (most recent right after `head`, least recent right before `tail`).
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <unordered_map>
#include <vector>

class LRUCache {
public:
    struct Node {
        int key = 0;
        int value = 0;
        Node* prev = nullptr;
        Node* next = nullptr;
    };

    explicit LRUCache(int capacity = 3) : capacity(capacity) {
        head->next = tail;
        tail->prev = head;
    }
    ~LRUCache() {
        for (Node* n = head; n;) {
            Node* next = n->next;
            delete n;
            n = next;
        }
    }
    LRUCache(const LRUCache&) = delete;
    LRUCache& operator=(const LRUCache&) = delete;

    // @op get
    int get(int key) {
        if (map.count(key) == 0) {  // @step lookup
            return -1;              // @step miss
        }
        Node* node = map[key];      // @step hit
        moveToFront(node);          // @step touch
        return node->value;         // @step done
    }
    // @endop

    // @op put
    void put(int key, int value) {
        if (map.count(key) != 0) {              // @step lookup
            Node* node = map[key];              // @step hit
            node->value = value;                // @step update
            moveToFront(node);                  // @step touch
            return;
        }
        if ((int)map.size() == capacity) {      // @step check_full
            Node* lru = tail->prev;             // @step pick_lru
            unlink(lru);                        // @step evict
            map.erase(lru->key);                // @step forget
            delete lru;
        }
        Node* node = new Node{key, value};      // @step create
        map[key] = node;                        // @step remember
        pushFront(node);                        // @step insert
    }
    // @endop

    // @op helpers
    void moveToFront(Node* node) {
        unlink(node);                   // @step mf_unlink
        pushFront(node);                // @step mf_push
    }

    void unlink(Node* node) {
        node->prev->next = node->next;  // @step ul_next
        node->next->prev = node->prev;  // @step ul_prev
    }

    void pushFront(Node* node) {
        node->next = head->next;        // @step pf_next
        node->prev = head;              // @step pf_prev
        head->next->prev = node;        // @step pf_old
        head->next = node;              // @step pf_head
    }
    // @endop

    std::vector<int> keysByRecency() const {
        std::vector<int> out;
        for (Node* n = head->next; n != tail; n = n->next) out.push_back(n->key);
        return out;
    }

private:
    int capacity;
    std::unordered_map<int, Node*> map;
    Node* head = new Node();  // sentinel before the most recent entry
    Node* tail = new Node();  // sentinel after the least recent entry
};
