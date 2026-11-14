// Hash map with separate chaining: each bucket is a linked list of entries.
// Keys are non-negative integers; the hash is key % capacity.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <optional>
#include <utility>
#include <vector>

class HashTableChaining {
public:
    struct Entry {
        int key;
        int value;
        Entry* next;
        Entry(int k, int v, Entry* n) : key(k), value(v), next(n) {}
    };

    explicit HashTableChaining(int capacity = 7) : buckets(capacity, nullptr) {}
    HashTableChaining(const std::vector<std::pair<int, int>>& items) : HashTableChaining() {
        for (auto& [k, v] : items) put(k, v);
    }
    ~HashTableChaining() {
        for (Entry* e : buckets) {
            while (e) {
                Entry* next = e->next;
                delete e;
                e = next;
            }
        }
    }
    HashTableChaining(const HashTableChaining&) = delete;
    HashTableChaining& operator=(const HashTableChaining&) = delete;

    // @op put
    void put(int key, int value) {
        int i = key % (int)buckets.size();  // @step hash
        Entry* curr = buckets[i];           // @step start
        while (curr != nullptr) {           // @step loop
            if (curr->key == key) {         // @step compare
                curr->value = value;        // @step update
                return;
            }
            curr = curr->next;              // @step advance
        }
        buckets[i] = new Entry(key, value, buckets[i]);  // @step prepend
        size++;                                          // @step done
    }
    // @endop

    // @op get
    std::optional<int> get(int key) const {
        int i = key % (int)buckets.size();  // @step hash
        Entry* curr = buckets[i];           // @step start
        while (curr != nullptr) {           // @step loop
            if (curr->key == key) {         // @step compare
                return curr->value;         // @step found
            }
            curr = curr->next;              // @step advance
        }
        return std::nullopt;                // @step not_found
    }
    // @endop

    // @op remove
    bool remove(int key) {
        int i = key % (int)buckets.size();      // @step hash
        Entry* prev = nullptr;                  // @step start
        Entry* curr = buckets[i];
        while (curr != nullptr) {               // @step loop
            if (curr->key == key) {             // @step compare
                if (prev == nullptr) {          // @step check_first
                    buckets[i] = curr->next;    // @step unlink_first
                } else {
                    prev->next = curr->next;    // @step unlink
                }
                delete curr;                    // @step release
                size--;
                return true;                    // @step done
            }
            prev = curr;                        // @step advance
            curr = curr->next;
        }
        return false;                           // @step not_found
    }
    // @endop

    int getSize() const { return size; }

private:
    std::vector<Entry*> buckets;
    int size = 0;
};
