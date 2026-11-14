// Hash map with open addressing and linear probing. Deleted slots become
// tombstones so later probes keep going past them. Keys are non-negative ints.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <optional>
#include <stdexcept>
#include <vector>

class HashTableOpenAddressing {
public:
    enum State { EMPTY, OCCUPIED, DELETED };

    explicit HashTableOpenAddressing(int capacity = 11)
        : keys(capacity), values(capacity), state(capacity, EMPTY) {}

    // @op put
    void put(int key, int value) {
        int n = (int)keys.size();
        int i = key % n;                        // @step hash
        int firstFree = -1;                     // @step init_free
        for (int probe = 0; probe < n; probe++) {   // @step probe
            if (state[i] == EMPTY) {            // @step check_empty
                break;                          // @step stop
            }
            if (state[i] == DELETED) {          // @step check_deleted
                if (firstFree == -1) {
                    firstFree = i;              // @step remember
                }
            } else if (keys[i] == key) {        // @step compare
                values[i] = value;              // @step update
                return;
            }
            i = (i + 1) % n;                    // @step next
        }
        if (firstFree != -1) {                  // @step check_free
            i = firstFree;                      // @step use_free
        } else if (state[i] != EMPTY) {         // @step check_full
            throw std::overflow_error("table is full");  // @step full
        }
        keys[i] = key;                          // @step place
        values[i] = value;
        state[i] = OCCUPIED;
        size++;                                 // @step done
    }
    // @endop

    // @op get
    std::optional<int> get(int key) const {
        int n = (int)keys.size();
        int i = key % n;                                    // @step hash
        for (int probe = 0; probe < n; probe++) {           // @step probe
            if (state[i] == EMPTY) {                        // @step check_empty
                return std::nullopt;                        // @step not_found
            }
            if (state[i] == OCCUPIED && keys[i] == key) {   // @step compare
                return values[i];                           // @step found
            }
            i = (i + 1) % n;                                // @step next
        }
        return std::nullopt;                                // @step exhausted
    }
    // @endop

    // @op remove
    bool remove(int key) {
        int n = (int)keys.size();
        int i = key % n;                                    // @step hash
        for (int probe = 0; probe < n; probe++) {           // @step probe
            if (state[i] == EMPTY) {                        // @step check_empty
                return false;                               // @step not_found
            }
            if (state[i] == OCCUPIED && keys[i] == key) {   // @step compare
                state[i] = DELETED;                         // @step tombstone
                size--;
                return true;                                // @step done
            }
            i = (i + 1) % n;                                // @step next
        }
        return false;                                       // @step exhausted
    }
    // @endop

    int getSize() const { return size; }

private:
    std::vector<int> keys;
    std::vector<int> values;
    std::vector<State> state;
    int size = 0;
};
