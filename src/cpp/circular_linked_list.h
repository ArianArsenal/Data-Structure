// Circular singly linked list. Only `tail` is stored; tail->next is the head.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <vector>

class CircularLinkedList {
public:
    struct Node {
        int value;
        Node* next = nullptr;
        explicit Node(int v) : value(v) {}
    };

    CircularLinkedList() = default;
    explicit CircularLinkedList(const std::vector<int>& values) {
        for (int v : values) insertTail(v);
    }
    ~CircularLinkedList() {
        if (!tail) return;
        Node* curr = tail->next;
        tail->next = nullptr;
        while (curr) {
            Node* next = curr->next;
            delete curr;
            curr = next;
        }
    }
    CircularLinkedList(const CircularLinkedList&) = delete;
    CircularLinkedList& operator=(const CircularLinkedList&) = delete;

    // @op insert_head
    void insertHead(int value) {
        Node* node = new Node(value);   // @step create
        if (tail == nullptr) {          // @step check_empty
            node->next = node;          // @step self_loop
            tail = node;                // @step set_tail
        } else {
            node->next = tail->next;    // @step link
            tail->next = node;          // @step close
        }
        length++;                       // @step done
    }
    // @endop

    // @op insert_tail
    void insertTail(int value) {
        insertHead(value);              // @step call_head
        tail = tail->next;              // @step advance_tail
    }
    // @endop

    // @op delete_value
    bool deleteValue(int value) {
        if (tail == nullptr) {          // @step check_empty
            return false;               // @step empty
        }
        Node* prev = tail;              // @step start
        while (true) {
            Node* curr = prev->next;            // @step load
            if (curr->value == value) {         // @step compare
                if (curr == prev) {             // @step check_single
                    tail = nullptr;             // @step clear
                } else {
                    prev->next = curr->next;    // @step unlink
                    if (curr == tail) {         // @step check_tail
                        tail = prev;            // @step move_tail
                    }
                }
                delete curr;                    // @step release
                length--;
                return true;                    // @step done
            }
            prev = curr;                        // @step advance
            if (prev == tail) {                 // @step check_lap
                return false;                   // @step not_found
            }
        }
    }
    // @endop

    // @op traverse
    std::vector<int> traverse() const {
        std::vector<int> result;        // @step init
        if (tail == nullptr) {          // @step check_empty
            return result;              // @step empty
        }
        Node* curr = tail->next;        // @step start
        while (true) {
            result.push_back(curr->value);  // @step visit
            curr = curr->next;              // @step advance
            if (curr == tail->next) {       // @step check_lap
                return result;              // @step done
            }
        }
    }
    // @endop

    int size() const { return length; }

private:
    Node* tail = nullptr;
    int length = 0;
};
